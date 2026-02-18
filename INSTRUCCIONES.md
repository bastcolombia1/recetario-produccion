# Instrucciones de Configuracion - Recetario de Produccion

## 1. Requisitos Previos

- Docker + Docker Compose instalados
- Odoo 18 CE corriendo con el modulo `production_api` instalado
- Nginx sirviendo archivos estaticos (panel de produccion)

## 2. Estructura del Proyecto

```
recetario-produccion/
  src/
    index.html          # HTML principal (6 pantallas + modal config)
    css/
      styles.css        # Estilos responsive + alertas overdue
    js/
      config.js         # Configuracion activa (URL, version, endpoints)
      config.dev.js     # Config para desarrollo local
      config.prod.js    # Config para produccion (Ethernet)
      config.prod-wifi.js # Config para produccion (WiFi)
      api.js            # Llamadas HTTP a la API de Odoo
      state.js          # Estado de la aplicacion (localStorage)
      ui.js             # Gestor de interfaz + alertas sonoras
      app.js            # Controlador principal + event listeners
    assets/
      images/           # Iconos e imagenes
  android/              # Proyecto Capacitor para APK
  GUIA_USO.md
  INSTALACION_APK.md
  INSTRUCCIONES.md
```

## 3. Configurar URL del Servidor

### Opcion A: Configuracion dinamica (recomendada)
La app incluye un modal de configuracion accesible desde el icono de engranaje en la pantalla de login. La IP y puerto se guardan en localStorage.

### Opcion B: Editar config.js
Editar `src/js/config.js` linea 16:
```javascript
ODOO_URL: 'http://209.126.125.198:8081', // Cambiar por la IP real
```

### Opcion C: Copiar config de entorno
```bash
# Para desarrollo
cp src/js/config.dev.js src/js/config.js

# Para produccion (Ethernet)
cp src/js/config.prod.js src/js/config.js

# Para produccion (WiFi)
cp src/js/config.prod-wifi.js src/js/config.js
```

## 4. Instalar modulo production_api en Odoo

1. Asegurar que `production_api` este en el directorio de custom-addons:
   ```
   custom-addons/cristian/production_api/
   ```
2. Actualizar la lista de modulos en Odoo:
   ```bash
   cd /opt/odoo/erp-app2-dev/odoo-project
   docker compose run --rm odoo odoo -c /etc/odoo/odoo.conf -d odoo_cristian -u production_api --stop-after-init
   ```
3. O desde la interfaz de Odoo: Aplicaciones > Actualizar lista > Buscar "Production API" > Instalar

## 5. Desplegar en Nginx

Los archivos HTML/JS/CSS se sirven desde Nginx. Para el panel de produccion (puerto 8082):

```bash
# Copiar archivos al directorio de Nginx
cp -r src/* /opt/odoo/erp-app2-dev/odoo-project/nginx/html/recetario/

# Reiniciar Nginx
cd /opt/odoo/erp-app2-dev/odoo-project
docker compose restart nginx
```

La ruta en Nginx debe estar configurada en `nginx/config/default.conf`:
```nginx
location /recetario/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /recetario/index.html;
}
```

## 6. Crear empleado de prueba

1. Ir a Odoo > Empleados
2. Crear o editar un empleado
3. Asignar codigo de barras: `12345` (ejemplo)
4. Guardar

## 7. Verificar la aplicacion

1. Abrir: `http://209.126.125.198:8082/recetario/`
2. Ingresar codigo: `12345`
3. Debe cargar la pantalla de produccion con recetas disponibles

## 8. Compilar APK (opcional)

```bash
cd /opt/odoo/erp-app2-dev/recetario-produccion

# Asegurar que config.js tenga la URL correcta
# Sincronizar con Capacitor
npx cap sync android

# Compilar
cd android
./gradlew assembleDebug

# La APK queda en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 9. Configurar Auto-actualizacion

La app verifica actualizaciones contra un archivo JSON:

1. Crear/editar `nginx/html/apk/version.json`:
   ```json
   {
     "version": "1.1.0",
     "versionCode": 2,
     "releaseDate": "2026-02-17",
     "changelog": ["Alertas de fase vencida con sonido"],
     "downloadUrl": "http://209.126.125.198:8082/apk/app-debug.apk"
   }
   ```
2. Colocar la APK en `nginx/html/apk/app-debug.apk`
3. La app compara `versionCode` local vs servidor al iniciar

## Troubleshooting

### CORS Error
Verificar que el modulo `production_api` este instalado. Los headers CORS estan configurados en el controlador de Odoo.

### Network Error
Verificar:
- La URL en configuracion del servidor (engranaje) sea correcta
- Odoo este corriendo en ese puerto
- El modulo `production_api` este instalado
- Los puertos no esten bloqueados por firewall

### Codigo invalido
Verificar que el empleado tenga codigo de barras asignado en Odoo.

### Cache desactualizada
Actualizar la version en los query strings de `index.html`:
```html
<link rel="stylesheet" href="css/styles.css?v=YYYYMMDD">
<script src="js/config.js?v=YYYYMMDD"></script>
```

---

**Ultima actualizacion:** 2026-02-17
**Version app:** 1.1.0
