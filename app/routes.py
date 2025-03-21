"""
All routes for the application in a single file.
"""

import base64

import requests
from flask import jsonify, render_template, request

from app.config import API_URL


# Simple validation functions instead of complex models
def validate_estado_solicitud(cedula_ruc):
    """Validate cedula/RUC for status request"""
    errors = []

    if not cedula_ruc:
        errors.append("El campo cédula/RUC es obligatorio")
    elif not cedula_ruc.isdigit():
        errors.append("La cédula/RUC debe contener solo números")
    elif len(cedula_ruc) not in [10, 13]:
        errors.append("La cédula/RUC debe tener 10 o 13 dígitos")

    return (len(errors) == 0, errors[0] if errors else None)


def validate_solicitud(data):
    """Validate solicitud form data"""
    errors = []
    required_fields = ["tipo_personeria", "cedula_ruc"]

    for field in required_fields:
        if not data.get(field):
            errors.append(f"El campo {field} es obligatorio")

    # Validate cedula/RUC format
    cedula_ruc = data.get("cedula_ruc")
    tipo_personeria = data.get("tipo_personeria")

    if cedula_ruc:
        if not cedula_ruc.isdigit():
            errors.append("La cédula/RUC debe contener solo números")
        # Validate RUC has 13 digits for tipo_personeria 2 or 3
        elif tipo_personeria in ["2", "3"] and len(cedula_ruc) != 13:
            errors.append("El RUC debe tener 13 dígitos")
        elif tipo_personeria == "1" and len(cedula_ruc) != 10:
            errors.append("La cédula debe tener 10 dígitos")

    # Validate files according to tipo_personeria
    files_count = sum(1 for key in data if key.startswith("file") and data[key])

    if tipo_personeria == "1" and files_count < 2:
        errors.append("Para Persona Natural sin RUC se requieren al menos 2 archivos")
    elif tipo_personeria == "2" and files_count < 3:
        errors.append("Para Persona Natural con RUC se requieren al menos 3 archivos")
    elif tipo_personeria == "3" and files_count < 4:
        errors.append("Para Persona Jurídica se requieren 4 archivos")

    # Validate file extensions and content
    expected_types = {"type1": "pdf", "type2": "docx", "type3": "pdf", "type4": "docx"}

    for type_key, expected_type in expected_types.items():
        if type_key in data:
            actual_type = data[type_key].lower()
            if actual_type != expected_type:
                errors.append(f"El archivo {type_key[-1]} debe ser de tipo {expected_type}")

            # Validate base64 content for PDFs
            if expected_type == "pdf" and type_key in data:
                try:
                    file_content = base64.b64decode(data[f"file{type_key[-1]}"])
                    if not file_content.startswith(b"%PDF"):
                        errors.append(f"El archivo {type_key[-1]} no es un PDF válido")
                except Exception as e:
                    errors.append(f"Error al validar el archivo {type_key[-1]}: {str(e)}")

    return (len(errors) == 0, errors[0] if errors else None)


def init_app(app):
    """Initialize routes on the app"""

    @app.route("/")
    def index():
        """Render the main form page"""
        return render_template("index.html")

    @app.route("/api/estado-solicitud", methods=["POST"])
    def estado_solicitud():
        """API endpoint to check the status of a request"""
        try:
            data = request.get_json()
            if not data:
                print("Error: Datos JSON no válidos en consulta de estado")
                return jsonify({"codigo": "400", "message": "Datos JSON no válidos"}), 400

            cedula_ruc = data.get("cedula_ruc")

            # Validate input data
            is_valid, error = validate_estado_solicitud(cedula_ruc)
            if not is_valid:
                print(f"Error de validación: {error}")
                return jsonify({"codigo": "400", "message": error}), 400

            # Direct connection to the external API
            response = requests.post(f"{API_URL}/api/estado-solicitud", json={"cedula_ruc": cedula_ruc}, timeout=30)

            # Check for HTTP error codes
            if response.status_code >= 400:
                try:
                    # If server returned specific 500 error
                    if response.status_code == 500:
                        return jsonify(
                            {"codigo": "400", "message": "No existe una Solicitud con la información ingresada."}
                        )
                except Exception:
                    pass

                return (
                    jsonify({"codigo": "400", "message": "No existe una Solicitud con la información ingresada."}),
                    400,
                )

            # Parse response as JSON
            try:
                api_response = response.json()
                return jsonify(api_response)
            except ValueError:
                # If response is not valid JSON, return formatted error
                return jsonify({"codigo": "400", "message": "No existe una Solicitud con la información ingresada."})

        except Exception as e:
            print(f"Error en el servidor: {str(e)}")
            return jsonify({"codigo": "500", "message": f"Error en el servidor: {str(e)}"}), 500

    @app.route("/api/registro-solicitud", methods=["POST"])
    def registro_solicitud():
        """API endpoint to submit a new request"""
        try:
            # Extract form data
            form_data = request.get_json()
            if not form_data:
                print("Error: Datos JSON no válidos en registro de solicitud")
                return jsonify({"codigo": "400", "message": "Datos JSON no válidos"}), 400

            # Validate input data
            is_valid, error = validate_solicitud(form_data)
            if not is_valid:
                print(f"Error de validación: {error}")
                return jsonify({"codigo": "400", "message": error}), 400

            # Direct connection to the external API
            response = requests.post(f"{API_URL}/api/registro-solicitud", json=form_data, timeout=30)

            # Check for HTTP error codes
            if response.status_code >= 400:
                try:
                    # If server returned specific 500 error
                    if response.status_code == 500:
                        return jsonify(
                            {"codigo": "400", "message": "Ya existe una Solicitud con la misma Cédula o RUC."}
                        )
                except Exception:
                    pass

                return jsonify({"codigo": "400", "message": "Error al procesar la solicitud."}), 400

            # Parse response as JSON
            try:
                api_response = response.json()
                return jsonify(api_response)
            except ValueError:
                # If response is not valid JSON, return success message
                return jsonify({"codigo": "200", "message": "Archivos subidos exitosamente"})

        except Exception as e:
            print(f"Error en el servidor: {str(e)}")
            return jsonify({"codigo": "500", "message": f"Error en el servidor: {str(e)}"}), 500
