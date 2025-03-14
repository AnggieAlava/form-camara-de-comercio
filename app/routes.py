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
    required_fields = ["tipo_personeria", "cedula_ruc"]  # Changed from tipo_personeria to tipo_personeria

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
        data = request.get_json()
        cedula_ruc = data.get("cedula_ruc")

        try:
            # Direct connection to the external API
            response = requests.post(
                "http://52.20.32.219/api/estado-solicitud", json={"cedula_ruc": cedula_ruc}, timeout=10
            )

            # Return the response from the API
            return jsonify(response.json())
        except requests.RequestException as e:
            return jsonify({"error": f"Error al consultar el estado: {str(e)}"}), 500

    @app.route("/api/registro-solicitud", methods=["POST"])
    def registro_solicitud():
        """API endpoint to submit a new request"""
        # Extract form data
        form_data = request.get_json()

        try:
            # Direct connection to the external API
            response = requests.post("http://52.20.32.219/api/registro-solicitud", json=form_data, timeout=30)

            # Return the response from the API
            return jsonify(response.json())
        except requests.RequestException as e:
            return jsonify({"error": f"Error al enviar la solicitud: {str(e)}"}), 500
