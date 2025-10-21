# Instrucciones de Configuración

## 1. Hacer Push a GitHub

```bash
cd /home/bast-automation/recetario-produccion
git push origin main
```

## 2. Configurar URL de Odoo

Editar el archivo `src/js/config.js` línea 7:

```javascript
ODOO_URL: 'http://192.168.0.1:8071', // Cambiar por la IP real
```

Cambiar `192.168.0.1` por la IP real del servidor devhost1.

## 3. Instalar módulo production_api en Odoo

1. Acceder a Odoo: http://IP:8071
2. Ir a **Aplicaciones**
3. Click en **Actualizar lista de aplicaciones**
4. Buscar "Production API"
5. Click en **Instalar**

## 4. Crear empleado de prueba

1. Ir a **Empleados**
2. Crear o editar un empleado
3. Asignar código de barras: `12345` (ejemplo)
4. Guardar

## 5. Probar la aplicación

1. Abrir: https://bastcolombia1.github.io/recetario-produccion/src/
2. Ingresar código: `12345`
3. Debería cargar la pantalla de producción

## Troubleshooting

### CORS Error
Si aparece error de CORS, verificar que el módulo production_api esté instalado correctamente. Los headers CORS ya están configurados en el controlador.

### Network Error
Verificar que:
- La URL en config.js sea correcta
- Odoo esté corriendo en ese puerto
- El módulo production_api esté instalado

### Código inválido
Verificar que el empleado tenga código de barras asignado en Odoo.
