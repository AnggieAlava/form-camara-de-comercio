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
    const tipopersona = document.getElementById('tipo_personeria');
    const cedulaRuc = document.getElementById('cedula_ruc');
    const registroMensaje = document.getElementById('registro-mensaje');
    const estadoMensaje = document.getElementById('estado-mensaje');

    console.log('DOM Elements inicializados correctamente');

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

    // Update required files based on tipo_persona selection
    tipopersona.addEventListener('change', updateRequiredFiles);

    function updateRequiredFiles() {
        const personaValue = tipopersona.value;

        // Reset all files
        [file1Input, file2Input, file3Input, file4Input].forEach(input => {
            input.required = false;
        });

        // Set required based on persona type
        if (personaValue === '1') { // Persona Natural sin RUC
            file1Input.required = true;
            file2Input.required = true;
            file3Group.style.display = 'block';
            file4Group.style.display = 'block';
        } else if (personaValue === '2') { // Persona Natural con RUC
            file1Input.required = true;
            file2Input.required = true;
            file3Input.required = true;
            file3Group.style.display = 'block';
            file4Group.style.display = 'block';
        } else if (personaValue === '3') { // Persona Jurídica
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
        const personaValue = tipopersona.value;
        const cedulaRucValue = this.value.trim();
        const errorElement = document.getElementById('cedula-ruc-error');

        errorElement.textContent = '';

        if (personaValue === '2' || personaValue === '3') {
            if (cedulaRucValue.length !== 13) {
                errorElement.textContent = 'RUC debe tener 13 dígitos.';
            }
        }
    });

    // Handle form submission for new registration
    solicitudForm.addEventListener('submit', function (e) {
        console.log('Iniciando envío de formulario de solicitud');
        e.preventDefault();

        // Clear previous message
        registroMensaje.style.display = 'none';
        registroMensaje.className = 'mensaje';

        // Validate form
        const personaValue = tipopersona.value;
        const cedulaRucValue = cedulaRuc.value.trim();

        if (personaValue === '2' || personaValue === '3') {
            if (cedulaRucValue.length !== 13) {
                showMessage(registroMensaje, 'Para Persona Natural con RUC o Persona Jurídica, el RUC debe tener 13 dígitos.', 'error');
                return;
            }
        }

        console.log('Validación de formulario de solicitud correcta');

        // Create FormData for processing files
        const formData = new FormData(this);
        const jsonData = {};

        console.log('FormData creado:', formData);

        // Process form fields
        for (const [key, value] of formData.entries()) {
            if (!key.startsWith('file')) {
                jsonData[key] = value;
            }
        }

        // Process files
        let fileCount = 0;
        let filesToProcess = 0;

        // Contar primero cuántos archivos hay para procesar
        for (const [key, file] of formData.entries()) {
            if (key.startsWith('file') && file instanceof File && file.name) {
                filesToProcess++;
            }
        }

        console.log(`Número de archivos a procesar: ${filesToProcess}`);

        // Si no hay archivos, enviar la solicitud inmediatamente
        if (filesToProcess === 0) {
            console.log('No hay archivos para procesar, enviando solicitud');
            sendRegistrationRequest(jsonData);
            return;
        }

        // Procesar los archivos
        for (const [key, file] of formData.entries()) {
            if (key.startsWith('file') && file instanceof File && file.name) {
                fileCount++;
                console.log(`Procesando archivo ${fileCount}: ${file.name}`);

                const reader = new FileReader();
                reader.onload = function (event) {
                    // Get base64 content without prefix
                    const base64String = event.target.result.split(',')[1];

                    // Validate file type
                    const fileIndex = key.replace('file', '');
                    const expectedType = fileIndex % 2 === 1 ? 'pdf' : 'docx';
                    const mimeType = file.type;

                    console.log(`Validando archivo ${fileIndex}:`, {
                        nombre: file.name,
                        tipo: mimeType,
                        tipoEsperado: expectedType
                    });

                    // Add to JSON data
                    jsonData[`file${fileIndex}`] = base64String;
                    jsonData[`name${fileIndex}`] = file.name;
                    jsonData[`type${fileIndex}`] = expectedType;

                    console.log(`Archivo ${fileIndex} procesado correctamente`);

                    // If all files are processed, send the request
                    if (Object.keys(jsonData).filter(k => k.startsWith('file')).length === filesToProcess) {
                        console.log('Todos los archivos procesados, enviando solicitud');
                        console.log('Tipos de archivos:', {
                            type1: jsonData.type1,
                            type2: jsonData.type2,
                            type3: jsonData.type3,
                            type4: jsonData.type4
                        });
                        sendRegistrationRequest(jsonData);
                    }
                };
                reader.readAsDataURL(file);
            }
        }

        function sendRegistrationRequest(data) {
            console.log('Enviando datos a la API:', data);

            // Submit form
            fetch('/api/registro-solicitud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    console.log('Respuesta recibida:', response);
                    return response.text().then(text => {
                        try {
                            // Intentar parsear como JSON
                            const json = JSON.parse(text);
                            console.log('Respuesta JSON:', json);
                            return json;
                        } catch (e) {
                            // Si no es JSON, mostrar el texto
                            console.error('Respuesta no es JSON:', text);
                            throw new Error('Respuesta del servidor no es JSON válido');
                        }
                    });
                })
                .then(data => {
                    console.log('Datos procesados:', data);
                    if (data.codigo === "200") {
                        showMessage(registroMensaje, data.message, 'success');
                        solicitudForm.reset();
                    } else {
                        showMessage(registroMensaje, data.message || 'Ocurrió un error al procesar la solicitud.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error en la petición:', error);
                    showMessage(registroMensaje, 'Error de conexión. Por favor, inténtelo de nuevo más tarde.', 'error');
                });
        }
    });

    // Handle form submission for status check
    estadoForm.addEventListener('submit', function (e) {
        console.log('Iniciando consulta de estado');
        e.preventDefault();

        // Clear previous message
        estadoMensaje.style.display = 'none';
        estadoMensaje.className = 'mensaje';

        // Get cedula/RUC value
        const cedulaRucValue = this.querySelector('[name="cedula_ruc"]').value.trim();
        console.log('Cédula/RUC para consulta:', cedulaRucValue);

        // Create JSON payload
        const jsonData = {
            cedula_ruc: cedulaRucValue
        };

        console.log('Enviando datos a la API:', jsonData);

        // Submit form
        fetch('/api/estado-solicitud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
            .then(response => {
                console.log('Respuesta recibida:', response);
                return response.text().then(text => {
                    try {
                        // Intentar parsear como JSON
                        const json = JSON.parse(text);
                        console.log('Respuesta JSON:', json);
                        return json;
                    } catch (e) {
                        // Si no es JSON, mostrar el texto
                        console.error('Respuesta no es JSON:', text);
                        throw new Error('Respuesta del servidor no es JSON válido');
                    }
                });
            })
            .then(data => {
                console.log('Datos procesados:', data);
                if (data.codigo === "200") {
                    showMessage(estadoMensaje, `Estado de solicitud: ${data.estado}`, 'info');
                } else {
                    showMessage(estadoMensaje, data.message || 'No se encontró ninguna solicitud con los datos proporcionados.', 'error');
                }
            })
            .catch(error => {
                console.error('Error en la petición:', error);
                showMessage(estadoMensaje, 'Error de conexión. Por favor, inténtelo de nuevo más tarde.', 'error');
            });
    });

    // Helper function to show message
    function showMessage(element, message, type) {
        console.log(`Mostrando mensaje: ${message}, tipo: ${type}`);
        element.textContent = message;
        element.className = `mensaje ${type}`;
        element.style.display = 'block';
    }

    // Initialize file requirements
    updateRequiredFiles();
    console.log('Inicialización de JavaScript completada');
}); 