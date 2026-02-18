# Instalacion de APK - Recetario La Areperia

## Descarga de APK

### Desde el navegador
La APK se puede descargar directamente desde:
```
http://209.126.125.198:8082/apk/
```

### Desde el servidor (adb)
```bash
cd /opt/odoo/erp-app2-dev/odoo-project/nginx/html/apk/
adb install -r app-debug.apk
```

## Instalacion en Android

### Requisitos
- Android 7.0 o superior
- Permitir instalacion de fuentes desconocidas

### Pasos
1. Descargar la APK desde la URL del servidor
2. Abrir el archivo descargado
3. Si pide permisos de "fuentes desconocidas", habilitarlo
4. Instalar la aplicacion

### Via USB (desarrollo)
```bash
# Verificar dispositivo conectado
adb devices

# Instalar APK
adb install -r app-debug.apk
```

## Configuracion Inicial

Al abrir la app por primera vez:

1. Toque el icono de **engranaje** en la esquina inferior derecha de la pantalla de login
2. Ingrese la **IP del servidor**: `209.126.125.198`
3. Ingrese el **puerto**: `8081` (Odoo directo)
4. Toque **Probar Conexion** para verificar que el servidor responde
5. Si la conexion es exitosa, toque **Guardar**
6. La configuracion se guarda en localStorage y persiste

### IPs segun entorno:
| Entorno | IP | Puerto Odoo | Puerto Panel |
|---------|-----|-------------|-------------|
| VPS (produccion) | 209.126.125.198 | 8081 | 8082 |
| Red local | (IP del servidor) | 8081 | 8082 |

## Acceso Web (sin instalar APK)

La aplicacion tambien funciona desde el navegador:
```
http://209.126.125.198:8082/recetario/
```

## Actualizaciones

La app verifica automaticamente si hay actualizaciones al iniciar:
- Consulta `http://209.126.125.198:8082/apk/version.json`
- Si hay nueva version, muestra barra de notificacion
- Al tocar la barra, abre la pagina de descarga

### Publicar nueva version:
1. Compilar la APK:
   ```bash
   cd /opt/odoo/erp-app2-dev/recetario-produccion
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```
2. Copiar APK al directorio de descarga:
   ```bash
   cp android/app/build/outputs/apk/debug/app-debug.apk \
      /opt/odoo/erp-app2-dev/odoo-project/nginx/html/apk/
   ```
3. Actualizar `version.json`:
   ```json
   {
     "version": "1.2.0",
     "versionCode": 3,
     "releaseDate": "2026-02-17",
     "changelog": ["Descripcion del cambio"],
     "downloadUrl": "http://209.126.125.198:8082/apk/app-debug.apk"
   }
   ```

## Regenerar APK

```bash
cd /opt/odoo/erp-app2-dev/recetario-produccion

# Actualizar version en config.js si es necesario
# APP_VERSION y APP_VERSION_CODE

# Sincronizar y compilar
npx cap sync android
cd android
./gradlew assembleDebug

# La APK queda en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Credenciales de Prueba

- **PIN:** 12345
- **Usuario:** Administrator

## Troubleshooting

### APK muestra "failed to fetch"
1. Verificar configuracion del servidor (icono engranaje en login)
2. Probar conexion desde el modal de configuracion
3. Verificar que Odoo este corriendo: `docker compose ps`
4. Verificar que el dispositivo tenga acceso a la red del servidor

### La app no se conecta
1. Verificar que la IP y puerto sean correctos en la configuracion
2. Si usa red local, asegurar que el dispositivo este en la misma red
3. Si usa VPS, verificar que los puertos esten abiertos

### Ver logs del dispositivo
```bash
adb logcat | grep -i "chromium\|console\|error"
```

---

**Ultima actualizacion:** 2026-02-17
**Version app:** 1.1.0
