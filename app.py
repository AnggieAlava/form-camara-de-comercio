import base64
import json
import os

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

app = Flask(__name__, template_folder="app/templates", static_folder="app/static")

# API URL from documentation
API_URL = "http://52.20.32.219"


@app.route("/")
def index():
    """Render the main form page"""
    return render_template("index.html")


@app.route("/consultar-estado", methods=["POST"])
def consultar_estado():
    """API endpoint to check the status of a request"""
    cedula_ruc = request.form.get("cedula_ruc")

    if not cedula_ruc:
        return jsonify({"error": "Debe proporcionar una cédula o RUC"}), 400

    # Prepare the request payload
    payload = {"cedula_ruc": cedula_ruc}

    try:
        # Make the API request
        response = requests.post(f"{API_URL}/api/estado-solicitud", json=payload)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/enviar-solicitud", methods=["POST"])
def enviar_solicitud():
    """API endpoint to submit a new application"""
    # Get form data
    tipo_personeria = request.form.get("tipo_personeria")
    tipo_identificacion = request.form.get("tipo_identificacion")
    cedula_ruc = request.form.get("cedula_ruc")
    razon_social = request.form.get("razon_social")
    correo = request.form.get("correo")
    telefono = request.form.get("telefono")
    direccion = request.form.get("direccion")

    # Basic validation
    if not all([tipo_personeria, tipo_identificacion, cedula_ruc, razon_social]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # RUC validation for tipo_personeria 2 or 3
    if tipo_personeria in ["2", "3"] and len(cedula_ruc) != 13:
        return jsonify({"error": "Para Persona Natural con RUC o Persona Jurídica, el RUC debe tener 13 dígitos"}), 400

    # File validation based on tipo_personeria
    required_files = 2  # Default for tipo_personeria = 1
    if tipo_personeria == "2":
        required_files = 3
    elif tipo_personeria == "3":
        required_files = 4

    # Check if the required files are provided
    files = []
    for i in range(1, 5):  # Maximum 4 files
        file = request.files.get(f"file{i}")
        if i <= required_files and (not file or file.filename == ""):
            return jsonify({"error": f"Archivo {i} es obligatorio para el tipo de personería seleccionado"}), 400
        if file and file.filename != "":
            files.append((f"file{i}", file))

    # Prepare payload for API
    payload = {
        "tipo_personeria": tipo_personeria,
        "tipo_identificacion": tipo_identificacion,
        "cedula_ruc": cedula_ruc,
        "razon_social": razon_social,
        "correo": correo,
        "telefono": telefono,
        "direccion": direccion,
    }

    # Convert files to base64
    for i, (file_key, file) in enumerate(files, 1):
        if file:
            file_content = file.read()
            base64_content = base64.b64encode(file_content).decode("utf-8")
            file_ext = os.path.splitext(file.filename)[1][1:]  # Get extension without dot

            payload[f"file{i}"] = base64_content
            payload[f"name{i}"] = os.path.splitext(file.filename)[0]
            payload[f"type{i}"] = file_ext

    try:
        # Make the API request
        response = requests.post(f"{API_URL}/api/registro-solicitud", json=payload)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
