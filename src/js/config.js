/**
 * Configuración para PRODUCCIÓN (APK) - Red WiFi
 * APK necesita URL completa porque se carga localmente
 */

const CONFIG = {
  // Versión actual de la app
  APP_VERSION: '1.1.0',
  APP_VERSION_CODE: 2,

  // URL para verificar actualizaciones (VPS público)
  UPDATE_URL: 'http://209.126.125.39:8082/apk/version.json',
  DOWNLOAD_PAGE_URL: 'http://209.126.125.39:8082/apk/',

  // URL base para APK - WiFi (192.168.1.x)
  ODOO_URL: 'http://192.168.1.12',

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
    PRODUCTION: 'current_production', // Deprecated - usar PRODUCTIONS
    PRODUCTIONS: 'active_productions',
    SERVER_CONFIG: 'server_config',
  },

  /**
   * Obtiene la URL del servidor (desde localStorage o valor por defecto)
   */
  getServerUrl() {
    const saved = localStorage.getItem(this.STORAGE_KEYS.SERVER_CONFIG);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        const port = config.port && config.port !== '80' && config.port !== '' ? ':' + config.port : '';
        return 'http://' + config.ip + port;
      } catch (e) {
        console.error('Error parsing server config:', e);
      }
    }
    return this.ODOO_URL;
  },

  /**
   * Guarda la configuración del servidor
   */
  saveServerConfig(ip, port) {
    localStorage.setItem(this.STORAGE_KEYS.SERVER_CONFIG, JSON.stringify({ ip, port: port || '80' }));
  },

  /**
   * Obtiene la configuración actual del servidor
   */
  getServerConfig() {
    const saved = localStorage.getItem(this.STORAGE_KEYS.SERVER_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing server config:', e);
      }
    }
    try {
      const url = new URL(this.ODOO_URL);
      return { ip: url.hostname, port: url.port || '80' };
    } catch (e) {
      return { ip: '192.168.1.12', port: '80' };
    }
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

  /**
   * Verifica si hay una actualización disponible
   * @returns {Promise<{available: boolean, version?: string, changelog?: string[], downloadUrl?: string}>}
   */
  async checkForUpdates() {
    try {
      const response = await fetch(this.UPDATE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        console.log('No se pudo verificar actualizaciones');
        return { available: false };
      }

      const data = await response.json();
      const serverVersionCode = data.versionCode || 0;

      if (serverVersionCode > this.APP_VERSION_CODE) {
        return {
          available: true,
          version: data.version,
          versionCode: data.versionCode,
          changelog: data.changelog || [],
          downloadUrl: this.DOWNLOAD_PAGE_URL,
          releaseDate: data.releaseDate
        };
      }

      return { available: false };
    } catch (error) {
      console.log('Error verificando actualizaciones:', error.message);
      return { available: false };
    }
  }
};
