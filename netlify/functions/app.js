const { spawn } = require('child_process');
const path = require('path');

exports.handler = async function (event, context) {
    // Configuración de la respuesta para CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Para solicitudes OPTIONS (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Inicia un servidor Flask en segundo plano
        const python = spawn('python', ['-m', 'flask', 'run', '--no-debugger']);

        // Captura la salida y los errores
        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        // Espera a que Flask esté listo
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Realiza la solicitud a Flask
        const response = await fetch('http://localhost:5000' + event.path, {
            method: event.httpMethod,
            headers: event.headers,
            body: event.body
        });

        const responseBody = await response.text();

        // Termina el proceso de Flask
        python.kill();

        return {
            statusCode: response.status,
            headers: {
                ...headers,
                ...Object.fromEntries(response.headers)
            },
            body: responseBody
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
}; 