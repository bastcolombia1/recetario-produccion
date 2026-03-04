/**
 * Configuración para PRODUCCIÓN (APK) - Red WiFi
 * APK necesita URL completa porque se carga localmente
 */

const CONFIG = {
  // URL base para APK - WiFi (192.168.1.x)
  ODOO_URL: 'http://192.168.1.21',

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
    FINISH_PHASE: '/api/production/finish_phase',
    PAUSE_PHASE: '/api/production/pause_phase',
    RESUME_PHASE: '/api/production/resume_phase',
  },

  // Intervalo de actualización de tiempos (milisegundos)
  UPDATE_INTERVAL: 5000, // 5 segundos

  // Almacenamiento local
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER: 'current_user',
    PRODUCTION: 'current_production', // Deprecated - usar PRODUCTIONS
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
