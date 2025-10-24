# 📱 Guía de Generación de APK - Recetario Producción

Guía completa para generar APKs de desarrollo y producción de la app Recetario.

---

## 📋 Requisitos Previos

### 1. Node.js 20+
Ya instalado vía nvm:
```bash
nvm use 20
node --version  # Debe mostrar v20.x.x
```

### 2. JDK (Java Development Kit) 17 o superior
```bash
# Verificar instalación
java -version

# Si no está instalado:
echo 'bast' | sudo -S apt-get update
echo 'bast' | sudo -S apt-get install -y openjdk-17-jdk

# Configurar JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Agregar a ~/.bashrc para persistencia
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

### 3. Android SDK Command Line Tools
```bash
# Descargar Android Command Line Tools
cd ~
mkdir -p android-sdk
cd android-sdk
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip -d cmdline-tools

# Mover a estructura correcta
mv cmdline-tools/cmdline-tools cmdline-tools/latest

# Configurar variables de entorno
export ANDROID_SDK_ROOT=$HOME/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

# Agregar a ~/.bashrc
echo 'export ANDROID_SDK_ROOT=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Instalar componentes necesarios
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Aceptar licencias
yes | sdkmanager --licenses
```

### 4. Gradle (se instala automáticamente con Android SDK)
```bash
# Verificar
gradle --version
```

---

## 🏗️ Proceso de Build

### Desarrollo (DEV)

#### 1. Preparar configuración de desarrollo
```bash
cd /home/bast-automation/recetario-produccion

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Copiar config de desarrollo
npm run build:dev

# Verificar que la URL es correcta
cat src/js/config.js | grep ODOO_URL
# Debe mostrar: ODOO_URL: 'http://192.168.0.1:8071',
```

#### 2. Agregar plataforma Android (solo primera vez)
```bash
npx cap add android
```

#### 3. Sincronizar archivos web con Android
```bash
npx cap sync android
```

#### 4. Generar APK de desarrollo (sin firma)
```bash
cd android
./gradlew assembleDebug

# La APK se genera en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

#### 5. Instalar en dispositivo conectado via USB
```bash
# Habilitar "Depuración USB" en el dispositivo Android
# Conectar dispositivo via USB

# Verificar dispositivo conectado
adb devices

# Instalar APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# O usar el script npm
npm run android:dev  # Abre Android Studio (si está instalado)
```

---

### Producción (PROD)

#### 1. Preparar configuración de producción
```bash
# Copiar config de producción
npm run build:prod

# IMPORTANTE: Verificar que la URL en src/js/config.js sea la correcta
cat src/js/config.js | grep ODOO_URL
# Debe mostrar la URL de producción (no la de desarrollo)
```

**⚠️ ANTES DE CONTINUAR:** Asegúrate de actualizar la URL de producción en `src/js/config.prod.js`

#### 2. Actualizar versión de la app

Editar [package.json](package.json):
```json
{
  "version": "1.0.1"  // Incrementar versión
}
```

Editar `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 2        // Incrementar en 1 (era 1, ahora 2)
        versionName "1.0.1"  // Debe coincidir con package.json
    }
}
```

#### 3. Sincronizar archivos
```bash
npx cap sync android
```

#### 4. Crear keystore para firma (solo primera vez)

```bash
# Crear directorio seguro para keystores
mkdir -p ~/.android/keystores
cd ~/.android/keystores

# Generar keystore
keytool -genkey -v -keystore recetario-produccion.keystore \
  -alias recetario \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Se te solicitará ingresar:
# - Contraseña del keystore: [Genera contraseña fuerte y guárdala]
# - Contraseña del alias: [Puede ser la misma]
# - Nombre y apellido: BAST Colombia
# - Unidad organizativa: Desarrollo
# - Organización: BAST Colombia
# - Ciudad: Tu ciudad
# - Estado: Tu estado
# - Código de país: CO
```

**🔐 IMPORTANTE:** Guarda la contraseña del keystore en un lugar seguro (ej: 1Password, LastPass). Si la pierdes, NO podrás actualizar la app en Play Store.

#### 5. Configurar firma en Android

Crear archivo `android/key.properties`:
```properties
storePassword=TU_PASSWORD_KEYSTORE
keyPassword=TU_PASSWORD_ALIAS
keyAlias=recetario
storeFile=/home/bast-automation/.android/keystores/recetario-produccion.keystore
```

Editar `android/app/build.gradle` (agregar antes de `android {}`):

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**⚠️ SEGURIDAD:** Agrega `key.properties` al `.gitignore`:
```bash
echo "android/key.properties" >> .gitignore
```

#### 6. Generar APK de producción firmada
```bash
cd android
./gradlew assembleRelease

# La APK firmada se genera en:
# android/app/build/outputs/apk/release/app-release.apk
```

#### 7. Generar AAB para Google Play Store
```bash
cd android
./gradlew bundleRelease

# El AAB se genera en:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📲 Distribución

### Desarrollo (Testing Interno)
- Compartir `app-debug.apk` via USB, email, o Drive
- No requiere firma
- Usuarios deben habilitar "Instalar apps de fuentes desconocidas" en sus dispositivos

### Producción (Play Store)
1. Ir a [Google Play Console](https://play.google.com/console)
2. Crear nueva aplicación (primera vez)
3. Subir `app-release.aab`
4. Configurar listado:
   - Título: Recetario Producción - La Arepería
   - Descripción corta/larga
   - Capturas de pantalla
   - Icono
5. Crear release:
   - Internal testing (equipo interno)
   - Closed testing (beta testers)
   - Production (público o específico)

### Producción (Distribución Interna sin Play Store)
1. Compartir `app-release.apk` firmada
2. Usuarios deben:
   - Habilitar "Instalar apps de fuentes desconocidas"
   - Descargar e instalar APK manualmente

---

## 🔄 Scripts npm disponibles

```bash
# Desarrollo
npm run build:dev              # Copiar config de desarrollo
npm run cap:sync               # Sincronizar archivos
npm run cap:open:android       # Abrir Android Studio
npm run android:dev            # Todo junto + Android Studio

# Producción
npm run build:prod             # Copiar config de producción
npm run android:prod           # Todo junto + Android Studio
```

---

## 🐛 Troubleshooting

### Error: JAVA_HOME not set
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
```

### Error: Android SDK not found
```bash
export ANDROID_SDK_ROOT=$HOME/android-sdk
echo 'export ANDROID_SDK_ROOT=$HOME/android-sdk' >> ~/.bashrc
```

### Error: License not accepted
```bash
yes | sdkmanager --licenses
```

### Error al compilar: OutOfMemoryError
Editar `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### APK muy grande
- Habilitar ProGuard en `build.gradle`:
  ```gradle
  buildTypes {
      release {
          minifyEnabled true
          shrinkResources true
      }
  }
  ```
- Usar App Bundles (.aab) en lugar de APK para Play Store
- Comprimir imágenes en `src/assets/`
- Eliminar dependencias no usadas

### Error: "Unsupported class file major version"
Verificar versión de Java:
```bash
java -version  # Debe ser 17+
```

### Gradle build muy lento
```bash
# Limpiar caché de Gradle
cd android
./gradlew clean
./gradlew cleanBuildCache
```

---

## 📊 Versiones

Actualizar versiones en 2 lugares:

### 1. [package.json](package.json)
```json
{
  "version": "1.0.1"
}
```

### 2. android/app/build.gradle
```gradle
android {
    defaultConfig {
        versionCode 2        // Incrementar en cada release (int)
        versionName "1.0.1"  // Versión visible para usuarios (string)
    }
}
```

**Reglas de versioning:**
- `versionCode`: Número entero incremental (1, 2, 3, ...)
  - Play Store requiere que cada release tenga un versionCode mayor al anterior
- `versionName`: Semantic versioning (1.0.0, 1.0.1, 1.1.0, 2.0.0)
  - MAJOR.MINOR.PATCH
  - MAJOR: Cambios incompatibles de API
  - MINOR: Nuevas funcionalidades compatibles
  - PATCH: Bug fixes compatibles

---

## 🔐 Seguridad

### NO commitear:
- ❌ `android/` (carpeta completa - ya está en .gitignore)
- ❌ `*.keystore` (keystores de firma)
- ❌ `android/key.properties` (credenciales de keystore)
- ❌ Contraseñas en archivos
- ❌ `src/js/config.js` (generado dinámicamente)

### SÍ commitear:
- ✅ `src/js/config.dev.js`
- ✅ `src/js/config.prod.js`
- ✅ `package.json` con scripts
- ✅ `capacitor.config.json`
- ✅ Documentación

---

## 📝 Checklist antes de release

- [ ] Actualizar `versionCode` y `versionName` en `android/app/build.gradle`
- [ ] Actualizar `version` en `package.json`
- [ ] Ejecutar `npm run build:prod`
- [ ] Verificar URL de Odoo en `src/js/config.js` (debe ser producción)
- [ ] Verificar que `DEBUG` esté en `false` en config
- [ ] Sincronizar: `npx cap sync android`
- [ ] Compilar: `./gradlew assembleRelease` o `bundleRelease`
- [ ] Probar APK en dispositivo físico
- [ ] Verificar funcionalidad de login
- [ ] Verificar cálculos de producción
- [ ] Verificar inicio/finalización de producción
- [ ] Verificar que se guarda en offline (si aplica)
- [ ] Verificar permisos de Android
- [ ] Revisar logs de Android (Logcat) en busca de errores
- [ ] Crear tag de git: `git tag v1.0.1 && git push --tags`
- [ ] Documentar cambios en CHANGELOG.md
- [ ] Notificar al equipo del nuevo release

---

## 🆘 Soporte

- Documentación oficial de Capacitor: https://capacitorjs.com/docs
- Documentación de Android: https://developer.android.com
- Issues en GitHub del proyecto
- BAST Colombia - Equipo de Desarrollo

---

**Versión:** 1.0.0
**Última actualización:** Octubre 2025
**Autor:** BAST Colombia
