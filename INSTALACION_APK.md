# Instalación de APK - Recetario La Arepería

## 📱 Ubicación de las APKs

Todas las APKs están en:
```
/home/bast-automation/recetario-produccion/android/app/build/outputs/apk/debug/
```

## 🔧 Versiones Disponibles

### **app-debug.apk** (WiFi - Recomendada)
- **Red:** WiFi (192.168.1.x)
- **URL:** http://192.168.1.21
- **Uso:** Dispositivos conectados a WiFi

### **app-debug-ethernet.apk** (Ethernet)
- **Red:** Ethernet (192.168.0.x)
- **URL:** http://192.168.0.1
- **Uso:** Dispositivos conectados por cable ethernet

## 📲 Instalación

### 1. Conectar dispositivo USB
```bash
# Verificar que el dispositivo esté conectado
adb devices
```

### 2. Instalar APK WiFi (más común)
```bash
cd /home/bast-automation/recetario-produccion/android/app/build/outputs/apk/debug
adb install -r app-debug.apk
```

### 3. Instalar APK Ethernet (si es necesario)
```bash
cd /home/bast-automation/recetario-produccion/android/app/build/outputs/apk/debug
adb install -r app-debug-ethernet.apk
```

## 🌐 Acceso Web (sin instalar APK)

La aplicación también funciona desde el navegador:

- **Ethernet:** http://192.168.0.1/recetario/
- **WiFi:** http://192.168.1.21/recetario/

## 🔄 Regenerar APK

### Para WiFi (192.168.1.21):
```bash
cd /home/bast-automation/recetario-produccion
cp src/js/config.prod-wifi.js src/js/config.js
npx cap sync android
cd android
./gradlew assembleDebug
```

### Para Ethernet (192.168.0.1):
```bash
cd /home/bast-automation/recetario-produccion
cp src/js/config.prod.js src/js/config.js
npx cap sync android
cd android
./gradlew assembleDebug
```

## 📝 Credenciales de Prueba

**PIN:** 12345
**Usuario:** Administrator

## 🐛 Troubleshooting

### APK muestra "failed to fetch"
1. Verificar que el dispositivo esté en la red correcta
2. Verificar que nginx esté corriendo: `docker ps | grep nginx`
3. Verificar que Odoo esté corriendo: `docker ps | grep odoo-cristian`
4. Instalar la APK correcta según la red:
   - WiFi → `app-debug.apk`
   - Ethernet → `app-debug-ethernet.apk`

### Ver logs del dispositivo
```bash
adb logcat | grep -i "chromium\|console\|error"
```

## 📊 Arquitectura

```
APK / Navegador
    ↓
Nginx (Puerto 80)
    ├─ /recetario/ → Archivos estáticos
    └─ /api/production/* → Proxy a Odoo
        ↓
    Odoo Container (odoo-cristian:8069)
        └─ Módulo production_api
```

## 🎯 URLs Importantes

- **Navegador Web:**
  - http://192.168.0.1/recetario/ (Ethernet)
  - http://192.168.1.21/recetario/ (WiFi)

- **Odoo Admin:**
  - http://192.168.0.1:8071 (Ethernet)
  - http://192.168.1.21:8071 (WiFi)

- **API Endpoints:**
  - http://192.168.0.1/api/production/* (Ethernet)
  - http://192.168.1.21/api/production/* (WiFi)
