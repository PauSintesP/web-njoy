# 🚀 Guía de Despliegue - njoy

## Despliegue en Vercel (Frontend)

### Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub conectado
- Backend con CORS configurado

### Paso 1: Instalar Vercel CLI (Opcional)

```bash
npm install -g vercel
```

### Paso 2: Desplegar desde la Línea de Comandos

```bash
# Desde el directorio del proyecto
cd "c:/Users/pausi/Documents/Projectes Pau/web-njoy"

# Login en Vercel
vercel login

# Desplegar
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name: njoy (o el que prefieras)
# - In which directory is your code located? ./
# - Want to override settings? No
```

### Paso 3: Desplegar desde Dashboard de Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de GitHub
3. Configura el proyecto:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click en "Deploy"

### Paso 4: Configurar Variables de Entorno (Si necesitas)

En el dashboard de Vercel → Settings → Environment Variables:

```
# No necesario por ahora, la API URL está hardcodeada
# VITE_API_URL=https://projecte-n-obijiuwkl-pausintesps-projects.vercel.app
```

### Paso 5: Actualizar CORS en Backend

Una vez desplegado el frontend, actualiza el backend con el dominio de producción:

**En `Projecte_nJoy/main.py`:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://tu-app-njoy.vercel.app",  # Producción (reemplaza con tu URL)
        "https://*.vercel.app",  # Todos los previews de Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Paso 6: Verificar Despliegue

1. Abre la URL de Vercel (ej: `https://njoy-xxx.vercel.app`)
2. Verifica que:
   - ✅ La página carga correctamente
   - ✅ Los eventos se cargan desde la API
   - ✅ Login/registro funcionan
   - ✅ Los filtros funcionan
   - ✅ El modal de detalles se abre

---

## Despliegue Automático

Vercel desplegará automáticamente cada vez que hagas push a tu repositorio:

- **main/master branch** → Producción
- **otras branches** → Preview deployments

---

## Comandos Útiles

```bash
# Ver logs del último despliegue
vercel logs

# Ver lista de despliegues
vercel list

# Promover un deployment a producción
vercel --prod

# Rollback (volver a deployment anterior)
# Se hace desde el dashboard de Vercel
```

---

## Troubleshooting

### Problema: "Build failed"
**Solución:** Verifica que todas las dependencias estén en `package.json`

```bash
npm install
npm run build  # Probar build localmente
```

### Problema: "API requests failing"
**Solución:** Verifica CORS en el backend

1. Abre console del navegador (F12)
2. Busca errores de CORS
3. Actualiza `allow_origins` en el backend

### Problema: "404 en rutas"
**Solución:** El archivo `vercel.json` ya tiene configurado el rewrite necesario

---

## Dominios Personalizados

### Agregar Dominio Propio

1. Ve a Project Settings → Domains
2. Add Domain
3. Sigue las instrucciones para configurar DNS

**Ejemplo:**
- `njoy.tudominio.com` → Producción
- `dev.njoy.tudominio.com` → Preview

No olvides actualizar CORS en el backend con tu dominio personalizado.

---

## Performance

Vercel optimiza automáticamente:
- ✅ CDN global
- ✅ Compresión Gzip/Brotli
- ✅ Cache de assets
- ✅ Edge Functions

**Resultado esperado:**
- Lighthouse Score: 90+ en todas las métricas
- First Contentful Paint: < 1s
- Time to Interactive: < 2s

---

## Monitoreo

### Analytics de Vercel

1. Ve a Analytics en el dashboard
2. Revisa:
   - Visitas
   - Performance
   - Core Web Vitals

### Logs en Tiempo Real

```bash
vercel logs --follow
```

---

¡Tu aplicación estará en producción en menos de 5 minutos! 🚀
