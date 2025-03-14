/**
 * Main JavaScript for the Form Application
 * Handles form submission, validation, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const registrationForm = document.getElementById('registration-form');
    const statusForm = document.getElementById('status-form');
    const solicitudForm = document.getElementById('solicitud-form');
    const estadoForm = document.getElementById('estado-form');
    const tipoPersoneria = document.getElementById('tipo_personeria');
    const cedulaRuc = document.getElementById('cedula_ruc');
    const registroMensaje = document.getElementById('registro-mensaje');
    const estadoMensaje = document.getElementById('estado-mensaje');

    // File input elements
    const file1Group = document.getElementById('file1-group');
    const file2Group = document.getElementById('file2-group');
    const file3Group = document.getElementById('file3-group');
    const file4Group = document.getElementById('file4-group');
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    const file3Input = document.getElementById('file3');
    const file4Input = document.getElementById('file4');

    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show the selected tab content and hide others
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'registration-form') {
                registrationForm.classList.add('active');
                registrationForm.classList.remove('hidden');
                statusForm.classList.add('hidden');
                statusForm.classList.remove('active');
            } else {
                statusForm.classList.add('active');
                statusForm.classList.remove('hidden');
                registrationForm.classList.add('hidden');
                registrationForm.classList.remove('active');
            }

            // Clear any messages
            registroMensaje.style.display = 'none';
            registroMensaje.className = 'mensaje';
            estadoMensaje.style.display = 'none';
            estadoMensaje.className = 'mensaje';
        });
    });

    // Update required files based on tipo_personeria selection
    tipoPersoneria.addEventListener('change', updateRequiredFiles);

    function updateRequiredFiles() {
        const personeriaValue = tipoPersoneria.value;

        // Reset all files
        [file1Input, file2Input, file3Input, file4Input].forEach(input => {
            input.required = false;
        });

        // Set required based on personeria type
        if (personeriaValue === '1') { // Persona Natural sin RUC
            file1Input.required = true;
            file2Input.required = true;
            file3Group.style.display = 'block';
            file4Group.style.display = 'block';
        } else if (personeriaValue === '2') { // Persona Natural con RUC
            file1Input.required = true;
            file2Input.required = true;
            file3Input.required = true;
            file3Group.style.display = 'block';
            file4Group.style.display = 'block';
        } else if (personeriaValue === '3') { // Persona Jurídica
            file1Input.required = true;
            file2Input.required = true;
            file3Input.required = true;
            file4Input.required = true;
            file3Group.style.display = 'block';
            file4Group.style.display = 'block';
        }
    }

    // Validate RUC for Persona Natural con RUC / Persona Jurídica
    cedulaRuc.addEventListener('blur', function () {
        const personeriaValue = tipoPersoneria.value;
        const cedulaRucValue = this.value.trim();
        const errorElement = document.getElementById('cedula-ruc-error');

        errorElement.textContent = '';

        if (personeriaValue === '2' || personeriaValue === '3') {
            if (cedulaRucValue.length !== 13) {
                errorElement.textContent = 'RUC debe tener 13 dígitos.';
            }
        }
    });

    // Handle form submission for new registration
    solicitudForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Clear previous message
        registroMensaje.style.display = 'none';
        registroMensaje.className = 'mensaje';

        // Validate form
        const personeriaValue = tipoPersoneria.value;
        const cedulaRucValue = cedulaRuc.value.trim();

        if (personeriaValue === '2' || personeriaValue === '3') {
            if (cedulaRucValue.length !== 13) {
                showMessage(registroMensaje, 'Para Persona Natural con RUC o Persona Jurídica, el RUC debe tener 13 dígitos.', 'error');
                return;
            }
        }

        // Create FormData
        const formData = new FormData(this);

        // Submit form
        fetch('/enviar-solicitud', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.codigo === "200") {
                    showMessage(registroMensaje, data.message, 'success');
                    solicitudForm.reset();
                } else {
                    showMessage(registroMensaje, data.message || 'Ocurrió un error al procesar la solicitud.', 'error');
                }
            })
            .catch(error => {
                showMessage(registroMensaje, 'Error de conexión. Por favor, inténtelo de nuevo más tarde.', 'error');
                console.error('Error:', error);
            });
    });

    // Handle form submission for status check
    estadoForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Clear previous message
        estadoMensaje.style.display = 'none';
        estadoMensaje.className = 'mensaje';

        // Create FormData
        const formData = new FormData(this);

        // Submit form
        fetch('/consultar-estado', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.codigo === "200") {
                    showMessage(estadoMensaje, `Estado de solicitud: ${data.estado}`, 'info');
                } else {
                    showMessage(estadoMensaje, data.message || 'No se encontró ninguna solicitud con los datos proporcionados.', 'error');
                }
            })
            .catch(error => {
                showMessage(estadoMensaje, 'Error de conexión. Por favor, inténtelo de nuevo más tarde.', 'error');
                console.error('Error:', error);
            });
    });

    // Helper function to show message
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `mensaje ${type}`;
        element.style.display = 'block';
    }

    // Initialize file requirements
    updateRequiredFiles();
}); 