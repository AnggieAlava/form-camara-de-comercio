# API de Comunicación Sistema Confecam – Cámara de Comercio de Samborondón

## Descripción General

Dentro del Sistema Confecam se han desarrollado dos APIs para:
1. **Consulta del estado de una Solicitud de Nuevo Socio**.
2. **Recepción de información para la creación de un nuevo Socio**.

### URL Base de Conexión
`http://52.20.32.219`

---

## Endpoints

### 1. Estado de Solicitud

**Descripción:**
Permite consultar el estado de una solicitud de socio mediante la identificación ingresada (Cédula, R.U.C., Pasaporte, etc.).

#### **URL del Endpoint**
`http://52.20.32.219/api/estado-solicitud`

#### **JSON de Petición Esperado**
```json
{
    "cedula_ruc": "0933489968001"
}
```

#### **Variable esperada:**
- `cedula_ruc`: Identificación del solicitante.

#### **Tipos de Respuesta**

- **Solicitud no encontrada**
  ```json
  {
      "codigo": "400",
      "message": "No existe una Solicitud con la información ingresada."
  }
  ```
  Cuando el valor ingresado en `cedula_ruc` no se encuentra registrado.

- **Solicitud encontrada**
  ```json
  {
      "codigo": "200",
      "message": "Solicitud encontrada.",
      "estado": "En Proceso"
  }
  ```
  Cuando la solicitud está registrada, el campo `estado` puede tener los siguientes valores:
  - En Proceso
  - En Revisión
  - Aprobado
  - Rechazado

---

### 2. Registro de Solicitud
#### **URL del Endpoint**
`http://52.20.32.219/api/registro-solicitud`

**Descripción:**
Permite el registro de solicitudes de nuevos socios, enviando información relevante junto con archivos codificados en Base64.

#### **JSON de Petición Esperado**
```json
{
    "file1": "texto_archivo_Base64",
    "file2": "texto_archivo_Base64",
    "file3": "texto_archivo_Base64",
    "file4": "texto_archivo_Base64",
    "name1": "archivo1",
    "name2": "archivo2",
    "name3": "archivo3",
    "name4": "archivo4",
    "type1": "pdf",
    "type2": "docx",
    "type3": "pdf",
    "type4": "docx",
    "tipo_personeria": "3",
    "tipo_identificacion": "1",
    "cedula_ruc": "0933489968002",
    "razon_social": "Prueba Socio",
    "correo": null,
    "telefono": null,
    "direccion": null
}
```

#### **Variables esperadas**
- `file1`, `file2`, `file3`, `file4`: Archivos en formato Base64.
- `name1`, `name2`, `name3`, `name4`: Nombres de los archivos.
- `type1`, `type2`, `type3`, `type4`: Extensión de los archivos.
- `tipo_personeria`: Tipo de socio.
  - `1`: Persona Natural sin RUC.
  - `2`: Persona Natural con RUC.
  - `3`: Persona Jurídica.
- `cedula_ruc`: Documento del nuevo socio (RUC, Cédula o Pasaporte).
- `razon_social`: Nombre o Razón Social del nuevo socio.
- `correo`, `telefono`, `direccion`: Datos de contacto del nuevo socio.

#### **Validaciones**
- Si `tipo_personeria` es `2` o `3`, el `cedula_ruc` debe tener 13 caracteres (RUC).
- Si `tipo_personeria` es:
  - `1`: Se requieren al menos 2 archivos.
  - `2`: Se requieren al menos 3 archivos.
  - `3`: Se requieren los 4 archivos.

#### **Tipos de Respuesta**

- **Solicitud ya ingresada**
  ```json
  {
      "codigo": "400",
      "message": "Ya existe una Solicitud con la misma Cédula o RUC."
  }
  ```
  Cuando ya existe una solicitud con el mismo `cedula_ruc`.

- **Solicitud recibida con éxito**
  ```json
  {
      "codigo": "200",
      "message": "Archivos subidos exitosamente"
  }
  ```
  Cuando la solicitud es aceptada y validada correctamente.

---# form-camara-de-comercio

# Formulario de Cámara de Comercio de Samborondón

Formulario web para el registro y consulta de solicitudes de nuevos socios.

## Despliegue en Netlify

Para desplegar esta aplicación en Netlify, siga estos pasos:

1. Asegúrese de que el repositorio esté actualizado en GitHub

2. Inicie sesión en [Netlify](https://www.netlify.com/)

3. Haga clic en "New site from Git"

4. Seleccione GitHub como proveedor Git

5. Autorice a Netlify para acceder a sus repositorios

6. Seleccione este repositorio

7. Configure los ajustes de despliegue:
   - Build command: `npm run build`
   - Publish directory: `static`

8. Haga clic en "Deploy site"

## Solución de problemas de despliegue

Si encuentra errores durante el despliegue:

1. Asegúrese de que Netlify esté utilizando Node.js 16 o superior
   - En Site settings > Build & deploy > Environment > Environment variables
   - Agregue `NODE_VERSION` con valor `16`

2. Si hay problemas con Python:
   - En Site settings > Build & deploy > Environment > Environment variables
   - Agregue `PYTHON_VERSION` con valor `3.8`

3. Verifique los registros de construcción para identificar errores específicos

## Desarrollo local

Para ejecutar la aplicación localmente:

```bash
# Instalar dependencias
pipenv install

# Activar el entorno virtual
pipenv shell

# Iniciar el servidor de desarrollo
pipenv run start
```

La aplicación estará disponible en http://localhost:5000

## Estructura del proyecto

- `app/`: Código fuente de la aplicación Flask
  - `templates/`: Plantillas HTML
  - `static/`: Archivos estáticos (CSS, JS, imágenes)
  - `routes.py`: Rutas de la aplicación

- `netlify/functions/`: Funciones serverless para Netlify
  - `app.js`: Función principal para servir la aplicación

## Licencia

© Cámara de Comercio de Samborondón - 2024
