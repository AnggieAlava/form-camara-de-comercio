# Formulario de Solicitud para Cámara de Comercio de Samborondón

Esta aplicación proporciona un formulario web para la solicitud de nuevos socios y consulta de estado, conectándose a una API externa para el procesamiento de las solicitudes.

![Vista previa del formulario](docs/form.jpeg)

## Arquitectura del Proyecto

## Características

- Formulario para el registro de nuevos socios con validación de campos
- Consulta de estado de solicitudes previamente enviadas
- Soporte para diferentes tipos de Persona jurídica
- Carga de archivos con validación según el tipo de Persona
- Diseño responsivo y amigable al usuario
- Integración con APIs externas para el envío y consulta de solicitudes

## Tecnologías utilizadas

- Backend: Python 3 con Flask
- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Procesamiento de solicitudes: Solicitudes HTTP a API externa

## Requisitos

- Python 3.6 o superior
- pip (administrador de paquetes de Python)
- Navegador web moderno

## Instalación

1. Clonar este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd form-steve
   ```

2. Crear y activar un entorno virtual de Python:
   ```bash
   # En Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   
   # En Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. Instalar las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## Configuración

- La URL de la API está configurada en el archivo `app.py`. Por defecto está configurada como `http://52.20.32.219`.
- Si es necesario cambiar esta URL, modifique la constante `API_URL` en el archivo `app.py`.

## Ejecución

Para ejecutar la aplicación en modo de desarrollo, siga estos pasos:

1. Asegúrese de que el entorno virtual está activado.
2. Ejecute el siguiente comando para iniciar el servidor de desarrollo:
   ```bash
   python app.py
   ```
3. Abra un navegador web y vaya a `http://127.0.0.1:5000/` para acceder a la aplicación.

## Estructura del proyecto

```
form-steve/
├── app/
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   └── main.js
│   │   └── img/
│   └── templates/
│       └── index.html
├── .env/
├── app.py
├── Pipfile
|-- Pipfile.lock
└── README.md
└── requirements.txt
```

## API Endpoints

La aplicación se comunica con dos endpoints principales:

1. **Estado de Solicitud**: 
   - Endpoint: `/api/estado-solicitud`
   - Método: POST
   - Propósito: Consultar el estado de una solicitud previamente enviada.

2. **Registro de Solicitud**: 
   - Endpoint: `/api/registro-solicitud`
   - Método: POST
   - Propósito: Enviar una nueva solicitud de socio con documentos adjuntos.

## Contribución

Si desea contribuir a este proyecto, por favor haga un fork y envíe un pull request con sus cambios. 