# Contributing to njoy

¡Gracias por tu interés en contribuir a njoy! 🎉

## Configuración del Entorno de Desarrollo

### Requisitos
- Node.js 18+ 
- npm 9+
- Git

### Setup Inicial

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/web-njoy.git
cd web-njoy

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
web-njoy/
├── src/
│   ├── components/     # Componentes React
│   ├── services/       # Servicios API y auth
│   ├── utils/          # Utilidades y helpers
│   ├── App.jsx         # Componente principal
│   └── index.css       # Estilos globales
├── public/             # Assets estáticos
└── docs/               # Documentación
```

## Guías de Estilo

### JavaScript/React
- Usar componentes funcionales con hooks
- Nombrar componentes en PascalCase
- Nombrar funciones en camelCase
- Usar arrow functions
- Agregar PropTypes o comentarios para props

### CSS
- Usar variables CSS definidas en `index.css`
- Nombrar clases en kebab-case
- Agrupar estilos por componente
- Evitar !important

### Commits
Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, punto y coma, etc
refactor: refactorización de código
test: agregar tests
chore: actualizar dependencias, etc
```

Ejemplos:
```bash
git commit -m "feat: add event search functionality"
git commit -m "fix: resolve login modal close button"
git commit -m "docs: update API integration guide"
```

## Proceso de Desarrollo

### 1. Crear una Branch

```bash
git checkout -b feature/nombre-de-la-feature
# o
git checkout -b fix/nombre-del-fix
```

### 2. Hacer Cambios

- Escribe código limpio y legible
- Agrega comentarios cuando sea necesario
- Prueba tus cambios localmente

### 3. Commit

```bash
git add .
git commit -m "feat: descripción clara del cambio"
```

### 4. Push y Pull Request

```bash
git push origin feature/nombre-de-la-feature
```

Abre un Pull Request en GitHub con:
- Descripción clara de los cambios
- Screenshots si aplica (cambios visuales)
- Referencia a issues relacionados

## Testing

```bash
# Ejecutar build para verificar que no hay errores
npm run build

# Verificar lint
npm run lint

# Preview de producción
npm run preview
```

## Áreas de Contribución

### 🐛 Reportar Bugs
- Usa el template de issue
- Incluye pasos para reproducir
- Especifica navegador y versión

### ✨ Nuevas Features
- Abre un issue primero para discutir
- Asegúrate de que se alinea con la visión del proyecto
- Implementa con tests si es posible

### 📚 Documentación
- Corregir typos
- Mejorar explicaciones
- Agregar ejemplos
- Traducir documentación

### 🎨 Mejoras de UI/UX
- Mantener la coherencia de diseño
- Seguir los colores y estilos definidos
- Asegurar responsive design

## Código de Conducta

- Sé respetuoso y profesional
- Acepta críticas constructivas
- Ayuda a otros contributors
- Mantén un ambiente positivo

## Preguntas

Si tienes preguntas, puedes:
- Abrir un issue con la etiqueta "question"
- Contactar a los maintainers
- Revisar la documentación existente

---

¡Gracias por hacer njoy mejor! 🚀
