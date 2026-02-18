/**
 * Configuración para DESARROLLO
 * Para pruebas en ambiente de desarrollo
 */

const CONFIG = {
  // URL base para desarrollo - apunta al servidor VPS (Desarrollo)
  ODOO_URL: 'http://209.126.125.198:8081',

  // Endpoints API
  API: {
    LOGIN: '/api/production/login',
    RECIPES: '/api/production/recipes',
    CALCULATE: '/api/production/calculate',
    START: '/api/production/start',
    ADVANCE_PHASE: '/api/production/advance_phase',
    PAUSE: '/api/production/pause',
    RESUME: '/api/production/resume',
    CANCEL: '/api/production/cancel',
    FINALIZE: '/api/production/finalize',
    PRODUCERS: '/api/production/producers',
    HISTORY: '/api/production/history',
  },

  // Intervalo de actualización de tiempos (milisegundos)
  UPDATE_INTERVAL: 5000, // 5 segundos

  // Almacenamiento local
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER: 'current_user',
    PRODUCTION: 'current_production',
    PRODUCTIONS: 'active_productions',
  },

  // Iconos para fases
  PHASE_ICONS: {
    'Alistamiento': '📋',
    'Preparación': '🔪',
    'Cocción': '🔥',
    'Enfriamiento': '❄️',
    'Empaque': '📦',
  },

  // Modo de desarrollo
  DEBUG: true,
};
