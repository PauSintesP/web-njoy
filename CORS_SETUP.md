# Configuración CORS para Backend FastAPI

## 🎯 Objetivo

Permitir que tu frontend en `http://localhost:5173` pueda hacer peticiones a tu API en Vercel.

## 📝 Instrucciones Paso a Paso

### 1. Localizar tu archivo principal

Abre el archivo `main.py` en tu proyecto `Projecte_nJoy`

Ruta: `c:/Users/pausi/Documents/Projectes Pau/Projecte_nJoy/main.py`

### 2. Importar el middleware CORS

Al inicio del archivo, después de los otros imports, agrega:

```python
from fastapi.middleware.cors import CORSMiddleware
```

### 3. Configurar CORS

Después de crear tu instancia de FastAPI (`app = FastAPI(...)`), agrega este código:

```python
# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend local en desarrollo
        "http://localhost:3000",  # Por si usas otro puerto
        # Agrega aquí tu dominio de producción cuando despliegues el frontend
        # "https://tu-app-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)
```

### 4. Ejemplo Completo

Tu archivo `main.py` debería verse así:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# ... otros imports ...

app = FastAPI(
    title="nJoy API",
    description="API for event management",
    version="1.0.0"
)

# ⭐ CONFIGURACIÓN CORS - Agregar aquí
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... resto de tu código (routers, endpoints, etc.) ...
```

### 5. Desplegar en Vercel

Una vez hayas agregado el código:

```bash
# Commitear los cambios
git add .
git commit -m "fix: Add CORS configuration for frontend"

# Push a tu repositorio
git push
```

Vercel automáticamente redespleará tu API con la nueva configuración.

### 6. Verificar que funciona

Una vez desplegado:

1. Abre `http://localhost:5173` en tu navegador
2. La página debería cargar los eventos automáticamente
3. Si abres la consola (F12), no deberías ver errores de CORS
4. Los eventos de Barcelona/Bilbao deberían aparecer

## 🔒 Seguridad

### Para Producción

Cuando despliegues tu frontend, actualiza la lista de `allow_origins`:

```python
import os

origins = [
    "http://localhost:5173",
]

# Agregar dominio de producción desde variable de entorno
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Luego en Vercel, configura la variable de entorno:
- `FRONTEND_URL` = `https://tu-app.vercel.app`

## ❓ Troubleshooting

### Si sigue sin funcionar:

1. **Verifica el despliegue**: Asegúrate de que Vercel haya desplegado correctamente
2. **Limpia caché**: Ctrl + Shift + R en el navegador
3. **Revisa logs de Vercel**: En el dashboard de Vercel, revisa los logs de deployment
4. **Prueba la API directamente**: Visita `https://projecte-n-obijiuwkl-pausintesps-projects.vercel.app/docs`

### Error común:

Si ves `"detail": "Not authenticated"`, es porque algunos endpoints requieren token JWT. Esto es normal - primero haz login y luego podrás acceder a esos endpoints.

## 📌 Notas Adicionales

- CORS solo afecta a las peticiones desde el navegador
- Las peticiones desde Postman/Thunder Client no tienen restricciones CORS
- `allow_credentials=True` es necesario porque usamos tokens JWT
