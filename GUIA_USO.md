# Guía de Uso - Recetario de Producción

## 🌐 Acceso por Navegador Web (RECOMENDADO)

La aplicación funciona perfectamente desde el navegador en cualquier dispositivo conectado a la red.

### URLs de Acceso:

**Red Ethernet (192.168.0.x):**
```
http://192.168.0.1/recetario/
```

**Red WiFi (192.168.1.x):**
```
http://192.168.1.21/recetario/
```

### Credenciales de Prueba:
- **PIN:** 12345
- **Usuario:** Administrator

### Dispositivos Probados:
✅ Navegador en PC (192.168.1.21)
✅ Navegador en dispositivo móvil (192.168.1.65) por WiFi
✅ Navegador en dispositivo móvil por Ethernet

## 📱 APK para Android (En desarrollo)

**Estado:** La APK presenta problemas con peticiones HTTP desde Capacitor (Mixed Content). 

**Problema conocido:** Capacitor en Android bloquea peticiones HTTP cuando la app se carga desde `https://localhost/`. A pesar de configurar:
- `usesCleartextTraffic="true"`
- `networkSecurityConfig`
- `allowMixedContent: true`
- `cleartext: true`

El problema persiste y es un issue conocido de Capacitor/Android 9+.

**Recomendación:** Usar el navegador web mientras se resuelve el issue de la APK.

## 🏗️ Arquitectura Actual

```
┌─────────────────────────────────────────┐
│  Dispositivo (Navegador o APK)          │
│  - http://192.168.0.1/recetario/        │
│  - http://192.168.1.21/recetario/       │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Nginx (Puerto 80)                      │
│  ├─ /recetario/ → Archivos estáticos    │
│  └─ /api/production/* → Proxy a Odoo    │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Odoo Container (odoo-cristian)         │
│  - Puerto: 8069 (interno)               │
│  - Puerto: 8071 (externo, directo)      │
│  - Módulo: production_api               │
└─────────────────────────────────────────┘
```

## 🔄 Regenerar APK (Si es necesario)

### Para WiFi (192.168.1.21):
```bash
cd /home/bast-automation/recetario-produccion
cp src/js/config.prod-wifi.js src/js/config.js
npx cap sync android
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Para Ethernet (192.168.0.1):
```bash
cd /home/bast-automation/recetario-produccion
cp src/js/config.prod.js src/js/config.js
npx cap sync android
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 🐛 Troubleshooting

### El navegador no carga la app
1. Verificar que nginx esté corriendo:
   ```bash
   docker ps | grep nginx-ha
   ```

2. Verificar que Odoo esté corriendo:
   ```bash
   docker ps | grep odoo-cristian
   ```

3. Reiniciar nginx si es necesario:
   ```bash
   docker restart nginx-ha
   ```

### Error "NetworkError" en navegador
1. Limpiar caché del navegador (Ctrl+Shift+R)
2. Verificar que estés en la red correcta
3. Probar con la otra IP (192.168.0.1 o 192.168.1.21)

### La app no responde después de login
1. Abrir consola de desarrollador (F12)
2. Verificar errores en la pestaña Console
3. Verificar que las peticiones API lleguen a `/api/production/*`

## 📊 Monitoreo

### Ver logs de Nginx:
```bash
docker logs nginx-ha --tail 50
```

### Ver logs de Odoo:
```bash
docker logs odoo-cristian --tail 50
```

### Ver peticiones API en tiempo real:
```bash
docker logs nginx-ha -f | grep "api/production"
```

## 🎯 URLs Importantes

### Aplicación Web:
- http://192.168.0.1/recetario/ (Ethernet)
- http://192.168.1.21/recetario/ (WiFi)

### Odoo Admin:
- http://192.168.0.1:8071 (Ethernet)
- http://192.168.1.21:8071 (WiFi)

### API Endpoints:
- http://192.168.0.1/api/production/* (Ethernet)
- http://192.168.1.21/api/production/* (WiFi)

## 📝 Notas Importantes

1. **Usar siempre el navegador para desarrollo** - Es más rápido y no requiere compilar APK
2. **Las URLs funcionan desde cualquier dispositivo** en la misma red
3. **El nginx maneja automáticamente** tanto archivos estáticos como proxy API
4. **No es necesario especificar puerto** - nginx escucha en el puerto 80 (por defecto)

## 🔐 Seguridad

⚠️ **Importante:** Esta configuración es solo para desarrollo/ambiente interno.
- HTTP está habilitado para facilitar desarrollo
- Para producción, usar HTTPS con certificados válidos
- Restringir acceso a la red interna

## 📞 Soporte

Para reportar problemas:
1. Verificar logs de nginx y odoo
2. Probar con ambas IPs
3. Limpiar caché del navegador
4. Reiniciar containers si es necesario

---

**Última actualización:** 2025-10-28
**Versión:** 1.0.0
