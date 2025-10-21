# Recetario de Producción - La Arepería

Aplicación móvil para control de procesos de producción en centro de producción de La Arepería.

## 🎯 Objetivo

Proporcionar una interfaz simple e intuitiva para que el personal de cocina pueda:
- Calcular insumos necesarios basado en ingrediente principal disponible
- Iniciar y controlar producciones
- Registrar avance por fases del proceso
- Finalizar producciones con cantidad real obtenida

## 📱 Características

### Interfaz Simplificada
- Diseño optimizado para tablets y móviles
- Botones grandes y claros
- Mínima interacción requerida
- Feedback visual inmediato

### Pantallas

1. **Login**: Autenticación con usuario y PIN
2. **Calcular Producción**: Selección de receta y explosión de materiales
3. **Producción en Progreso**: Control de fases con temporizador
4. **Finalizar**: Registro de cantidad real y productor
5. **Confirmación**: Resumen de producción finalizada

### Control de Fases
- Alistamiento
- Preparación
- Cocción
- Enfriamiento
- Empaque

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Odoo 18 (API REST)
- **Conversión a APK**: Capacitor

## 📁 Estructura del Proyecto

```
recetario-produccion/
├── src/
│   ├── index.html          # Aplicación principal
│   ├── css/
│   │   └── styles.css      # Estilos
│   ├── js/
│   │   ├── config.js       # Configuración
│   │   ├── api.js          # Comunicación con Odoo
│   │   ├── state.js        # Estado global
│   │   ├── ui.js           # Interfaz de usuario
│   │   └── app.js          # Controlador principal
│   └── assets/
│       └── images/         # Imágenes y logo
├── README.md
└── .gitignore
```

## 🚀 Instalación

### Para desarrollo web

1. Clonar el repositorio:
```bash
git clone https://github.com/bastcolombia1/recetario-produccion.git
cd recetario-produccion
```

2. Configurar URL de Odoo en `src/js/config.js`:
```javascript
ODOO_URL: 'http://TU_IP:8071'
```

3. Abrir `src/index.html` en un navegador

### Para probar con GitHub Pages

La aplicación está disponible en: https://bastcolombia1.github.io/recetario-produccion/src/

### Para convertir a APK (Próximamente)

```bash
# Instalar Capacitor
npm install

# Agregar plataforma Android
npx cap add android

# Sincronizar archivos
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## 🔧 Configuración de Odoo

### Endpoints API Requeridos

El backend de Odoo debe implementar los siguientes endpoints:

- `POST /api/production/login` - Autenticación
- `GET /api/production/recipes` - Listar recetas activas
- `POST /api/production/calculate` - Calcular explosión de materiales
- `POST /api/production/start` - Iniciar producción
- `POST /api/production/advance_phase` - Avanzar fase
- `POST /api/production/pause` - Pausar producción
- `POST /api/production/resume` - Reanudar producción
- `POST /api/production/cancel` - Cancelar producción
- `POST /api/production/finalize` - Finalizar producción
- `GET /api/production/producers` - Listar productores

## 📋 Flujo de Trabajo

1. **Cocinero inicia sesión** con usuario y PIN
2. **Selecciona receta** del menú disponible
3. **Ingresa cantidad disponible** del ingrediente principal
4. **Sistema calcula** insumos necesarios y cantidad esperada
5. **Inicia producción** confirmando
6. **Avanza por fases** según el proceso
7. **Finaliza producción** ingresando cantidad real obtenida
8. **Sistema registra** movimientos de inventario automáticamente

## 🎨 Diseño

- **Colores principales**:
  - Amarillo arepería: `#f7d437`
  - Verde (éxito): `#28a745`
  - Azul (en progreso): `#007bff`
  - Rojo (cancelar): `#dc3545`

- **Tipografía**: System fonts (San Francisco, Segoe UI, Roboto)

## 👥 Usuarios

- **Perfil Cocinero**: Acceso a interfaz simplificada (esta app)
- **Perfil Supervisor**: Acceso a Odoo completo con todas las funcionalidades

## 📝 Próximas Mejoras

- [ ] Modo offline con sincronización
- [ ] Notificaciones push para fases
- [ ] Historial de producciones
- [ ] Escaneo de códigos QR
- [ ] Fotos del producto final
- [ ] Firma digital del productor

## 📄 Licencia

Uso interno - BAST Colombia

## 👨‍💻 Desarrollo

Desarrollado para La Arepería - BAST Colombia

---

**Versión**: 1.0.0
**Última actualización**: Octubre 2025
