# nJoy Development - README

## 🚀 Inicio Rápido - Desarrollo Local

### Requisitos Previos
- Python 3.11
- Node.js (para el frontend)
- npm

### 1. Configurar Backend API

1. Navega al directorio del backend:
   ```bash
   cd "c:\Users\pausi\Documents\Projectes Pau\Projecte_nJoy"
   ```

2. Instala las dependencias (si aún no lo has hecho):
   ```bash
   py -m pip install -r requirements.txt
   ```

3. Inicia el servidor:
   ```bash
   C:\Users\pausi\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   El backend estará disponible en:
   - API: http://localhost:8000
   - Documentación interactiva: http://localhost:8000/docs

### 2. Configurar Frontend Web

1. Abre una nueva terminal y navega al directorio del frontend:
   ```bash
   cd "c:\Users\pausi\Documents\Projectes Pau\web-njoy"
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

   El frontend estará disponible en: http://localhost:5173

### 3. Configurar App Android

Para conectar la app Android al backend local:

1. Obt human tu IP local:
   ```bash
   ipconfig
   ```
   Busca la dirección IPv4 (por ejemplo: 192.168.1.100)

2. En la configuración de la app Android, cambia la URL del API a:
   ```
   http://<TU_IP_LOCAL>:8000
   ```

## 📝 Notas Importantes

### Base de Datos
- **Desarrollo Local**: SQLite (`njoy_local.db`)
- **Producción**: MySQL/PostgreSQL según configuración en `.env`

### Variables de Entorno

El backend detecta automáticamente el entorno:
- Si `ENV=local` en `.env` → usa SQLite
- Si no está definido o es otro valor → usa MySQL

### Inicializar Base de Datos

Si es la primera vez que ejecutas el backend localmente, visita:
http://localhost:8000/init-db

Esto creará las tablas necesarias en la base de datos SQLite.

## 🔧 Troubleshooting

### Backend no inicia
- Verifica que Python esté instalado: `py --version`
- Verifica que las dependencias estén instaladas: `py -m pip list`

### Frontend no se conecta al backend
- Verifica que `VITE_API_URL=http://localhost:8000` en `.env`
- Asegúrate de que el backend esté corriendo en puerto 8000

### App Android no se conecta
- Asegúrate de estar en la mismo red WiFi
- Usa la IP local, NO "localhost" ni "127.0.0.1"
- Verifica que el firewall de Windows permita conexiones en el puerto 8000
