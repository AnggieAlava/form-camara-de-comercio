"""
All routes for the application in a single file.
"""

import base64
import os

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
    required_fields = ["tipo_persona", "tipo_identificacion", "cedula_ruc", "razon_social"]

    for field in required_fields:
        if not data.get(field):
            errors.append(f"El campo {field} es obligatorio")

    # Validate cedula/RUC format
    cedula_ruc = data.get("cedula_ruc")
    if cedula_ruc:
        if not cedula_ruc.isdigit():
            errors.append("La cédula/RUC debe contener solo números")
        elif len(cedula_ruc) not in [10, 13]:
            errors.append("La cédula/RUC debe tener 10 o 13 dígitos")

    return (len(errors) == 0, errors[0] if errors else None)


def init_app(app):
    """Initialize routes on the app"""

    @app.route("/")
    def index():
        """Render the main form page"""
        return render_template("index.html")

    @app.route("/consultar-estado", methods=["POST"])
    def consultar_estado():
        """API endpoint to check the status of a request"""
        cedula_ruc = request.form.get("cedula_ruc")

        # Validate input
        is_valid, error = validate_estado_solicitud(cedula_ruc)
        if not is_valid:
            return jsonify({"error": error}), 400

        try:
            # Make the API request
            response = requests.post(f"{API_URL}/api/estado-solicitud", json={"cedula_ruc": cedula_ruc}, timeout=10)

            # Return the response from the API
            return jsonify(response.json())
        except requests.RequestException as e:
            return jsonify({"error": f"Error al consultar el estado: {str(e)}"}), 500

    @app.route("/enviar-solicitud", methods=["POST"])
    def enviar_solicitud():
        """API endpoint to submit a new request"""
        # Extract form data
        form_data = {
            "tipo_persona": request.form.get("tipo_persona"),
            "tipo_identificacion": request.form.get("tipo_identificacion"),
            "cedula_ruc": request.form.get("cedula_ruc"),
            "razon_social": request.form.get("razon_social"),
            "correo": request.form.get("correo"),
            "telefono": request.form.get("telefono"),
            "direccion": request.form.get("direccion"),
        }

        # Validate form data
        is_valid, error = validate_solicitud(form_data)
        if not is_valid:
            return jsonify({"error": error}), 400

        # Process files
        files = []
        for key, file in request.files.items():
            if file.filename:
                try:
                    # Read and encode file content
                    file_content = file.read()
                    encoded_content = base64.b64encode(file_content).decode("utf-8")

                    files.append(
                        {"filename": file.filename, "content": encoded_content, "content_type": file.content_type}
                    )
                except Exception as e:
                    return jsonify({"error": f"Error processing file {file.filename}: {str(e)}"}), 400

        # Add files to the form data
        if files:
            form_data["files"] = files

        try:
            # Make the API request
            response = requests.post(f"{API_URL}/api/solicitud", json=form_data, timeout=30)

            # Return the response from the API
            return jsonify(response.json())
        except requests.RequestException as e:
            return jsonify({"error": f"Error al enviar la solicitud: {str(e)}"}), 500
