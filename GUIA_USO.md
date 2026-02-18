# Guia de Uso - Recetario de Produccion

## Acceso por Navegador Web (RECOMENDADO)

La aplicacion funciona desde el navegador en cualquier dispositivo conectado a la red.

### URLs de Acceso:

**Servidor VPS (produccion):**
```
http://209.126.125.198:8082/recetario/
```

**Red local (si aplica):**
```
http://IP_SERVIDOR/recetario/
```

### Credenciales:
- **PIN:** Codigo de barras del empleado configurado en Odoo
- **PIN de prueba:** 12345 (usuario Administrator)

## APK para Android

### Descarga
La APK se descarga desde:
```
http://209.126.125.198:8082/apk/
```

### Configuracion del Servidor
Al abrir la app por primera vez, configure la IP del servidor:
1. En la pantalla de login, toque el icono de engranaje (esquina inferior derecha)
2. Ingrese la IP del servidor (ej: `209.126.125.198`)
3. Ingrese el puerto (ej: `8081` para Odoo directo, `80` si usa Nginx proxy)
4. Toque **Probar Conexion** para verificar
5. Toque **Guardar**

La configuracion se almacena en localStorage y persiste entre sesiones.

### Actualizaciones Automaticas
La app verifica automaticamente si hay una nueva version al iniciar. Si detecta una actualizacion:
- Muestra una barra de notificacion en la parte superior
- Al tocar la barra, abre la pagina de descarga de la APK
- Se puede cerrar la notificacion con el boton X

## Pantallas de la Aplicacion

### 1. Login
- Ingrese el codigo de empleado (codigo de barras)
- El sistema valida contra la API de Odoo

### 2. Pantalla Principal (Calcular)
- **Producciones activas**: Lista de producciones en progreso con tarjetas
  - Cada tarjeta muestra: receta, fase actual, tiempo transcurrido
  - Si una fase excede el tiempo estimado: tarjeta amarilla parpadeante + alerta sonora
  - Boton "Avanzar Fase" rapido en tarjetas con fase vencida
- **Nueva Produccion**: Seleccionar receta, ingresar cantidad, calcular
- **Historial**: Ver producciones anteriores

### 3. Produccion en Progreso
- Fase actual con icono y nombre
- Tiempo estimado vs tiempo transcurrido
- Barra de progreso proporcional al tiempo:
  - Verde: dentro del tiempo estimado
  - Roja + parpadeo: fase vencida (tiempo > estimado)
  - Alerta sonora (beep triple) al vencerse una fase
- Lista de todas las fases con estado (completada/en progreso/pendiente)
- Botones: Pausar, Reanudar, Siguiente Fase, Cancelar

### 4. Finalizar Produccion
- Ingresar cantidad real obtenida
- Calculo automatico de rendimiento
- Seleccionar productor
- Observaciones obligatorias si:
  - Rendimiento < 97%
  - Alguna fase excedio 105% del tiempo estimado

### 5. Confirmacion
- Resumen de produccion finalizada
- Opciones: Nueva Produccion o Ver Historial

### 6. Historial
- Lista de producciones anteriores (finalizadas y canceladas)
- Muestra: receta, cantidad, rendimiento, duracion, productor, notas

## Arquitectura

```
Dispositivo (Navegador o APK)
    |
    v
Nginx (Puerto 8082 - Panel)         Odoo (Puerto 8081)
  |-- /recetario/ -> HTML estaticos    |-- /api/production/* (API REST)
  |-- /dashboard  -> Dashboard HTML    |-- /api/dashboard/summary
  |-- /apk/       -> APK + version     |
  |-- /           -> Panel produccion  |
    |                                  |
    +------ API calls ---------------->+
```

### Componentes:
| Componente | Puerto | Descripcion |
|-----------|--------|-------------|
| Odoo | 8081 | Backend + API REST (production_api module) |
| Nginx Panel | 8082 | Panel produccion TV + Dashboard + APK |
| Recetario | 8082/recetario/ | App movil de produccion |

## Alertas de Tiempo

El sistema monitorea el tiempo de cada fase y genera alertas cuando se excede:

1. **Barra de progreso roja**: La barra cambia de verde a rojo cuando el tiempo transcurrido supera el estimado
2. **Tiempo parpadeante**: El display de tiempo transcurrido parpadea en rojo
3. **Alerta sonora**: Beep triple (880Hz) cuando una fase se vence por primera vez
4. **Tarjeta amarilla**: En la lista de producciones activas, la tarjeta parpadea en amarillo
5. **Boton rapido**: Aparece boton "Avanzar Fase" directamente en la tarjeta

El audio se inicializa con el primer toque/click del usuario (requerido por navegadores modernos).

## API Endpoints

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/production/login` | POST | Login con codigo de empleado |
| `/api/production/recipes` | GET | Lista de recetas disponibles |
| `/api/production/producers` | GET | Lista de productores |
| `/api/production/calculate` | POST | Calcular explosion de materiales |
| `/api/production/start` | POST | Iniciar produccion |
| `/api/production/advance_phase` | POST | Avanzar a siguiente fase |
| `/api/production/pause` | POST | Pausar produccion |
| `/api/production/resume` | POST | Reanudar produccion |
| `/api/production/cancel` | POST | Cancelar produccion |
| `/api/production/finalize` | POST | Finalizar produccion |
| `/api/production/history` | GET | Historial de producciones |
| `/api/production/board` | GET | Panel TV (producciones activas) |
| `/api/dashboard/summary` | GET | Dashboard gerencial (KPIs + graficas) |

## Troubleshooting

### La app no carga
1. Verificar que los containers Docker esten corriendo:
   ```bash
   cd /opt/odoo/erp-app2-dev/odoo-project
   docker compose ps
   ```
2. Reiniciar si es necesario:
   ```bash
   docker compose restart odoo nginx
   ```

### Error "NetworkError" o "failed to fetch"
1. Verificar IP del servidor en la configuracion (icono engranaje)
2. Probar la conexion desde el modal de configuracion
3. Limpiar cache del navegador (Ctrl+Shift+R)

### No suena la alerta de fase vencida
1. El audio requiere al menos un toque/click previo en la app
2. Verificar que el volumen del dispositivo no este en silencio
3. Cada fase solo suena una vez (no se repite)

### La app no responde despues de login
1. Abrir consola de desarrollador (F12)
2. Verificar errores en la pestana Console
3. Verificar que las peticiones API lleguen al servidor

## Monitoreo

### Ver logs de Nginx:
```bash
cd /opt/odoo/erp-app2-dev/odoo-project
docker compose logs nginx --tail 50
```

### Ver logs de Odoo:
```bash
cd /opt/odoo/erp-app2-dev/odoo-project
docker compose logs odoo --tail 50
```

---

**Ultima actualizacion:** 2026-02-17
**Version app:** 1.1.0
