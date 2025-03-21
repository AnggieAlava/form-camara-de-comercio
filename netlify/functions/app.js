const { exec } = require('child_process');
const fs = require('fs');
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
        // Determinar qué página servir según la ruta
        let page = 'index.html';
        if (event.path !== '/' && event.path !== '') {
            // Comprobar si existe un archivo HTML correspondiente
            const filePath = path.join(__dirname, '../../static', event.path);
            if (fs.existsSync(filePath)) {
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'text/html' },
                    body: fs.readFileSync(filePath, 'utf8')
                };
            }
        }

        // Servir el index.html por defecto
        const htmlContent = fs.readFileSync(path.join(__dirname, '../../static', page), 'utf8');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: htmlContent
        };
    } catch (err) {
        console.log('Error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                details: err.message,
                path: path.join(__dirname, '../../static/templates', 'index.html')
            })
        };
    }
}; 