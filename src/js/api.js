/**
 * Módulo API para comunicación con Odoo
 */

const API = {
  /**
   * Obtiene el token de autenticación almacenado
   */
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  },

  /**
   * Guarda el token de autenticación
   */
  setToken(token) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
  },

  /**
   * Elimina el token de autenticación
   */
  clearToken() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
  },

  /**
   * Realiza una petición HTTP a la API de Odoo
   */
  async request(endpoint, method = 'GET', data = null) {
    const url = `${CONFIG.ODOO_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['X-Auth-Token'] = token;
    }

    const options = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error en la petición');
      }

      return result.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Login de usuario con código de barras
   */
  async login(code) {
    const result = await this.request(CONFIG.API.LOGIN, 'POST', {
      code: code,
    });

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  },

  /**
   * Logout de usuario
   */
  logout() {
    this.clearToken();
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.PRODUCTION);
  },

  /**
   * Obtiene lista de recetas activas
   */
  async getRecipes() {
    return await this.request(CONFIG.API.RECIPES);
  },

  /**
   * Calcula explosión de materiales para una receta
   */
  async calculateRecipe(recipeId, quantity) {
    const result = await this.request(CONFIG.API.CALCULATE, 'POST', {
      recipe_id: recipeId,
      quantity: parseFloat(quantity),
    });

    // Adaptar respuesta de la API al formato esperado por la app
    return {
      expected_qty: result.recipe.quantity,
      product_uom: 'kg', // TODO: obtener de la receta
      ingredients: result.materials.map(m => ({
        product_id: m.product_id,
        product_name: m.product_name,
        qty: m.quantity,
        uom_name: m.uom,
      })),
      phases: result.phases,
    };
  },

  /**
   * Inicia una producción
   */
  async startProduction(recipeId, quantity, producerId = null) {
    const result = await this.request(CONFIG.API.START, 'POST', {
      recipe_id: recipeId,
      quantity: parseFloat(quantity),
      producer_id: producerId,
    });

    // Adaptar respuesta al formato esperado
    return {
      production: {
        id: result.production_id,
        code: result.name,
        recipe_name: result.product,
        expected_qty: result.quantity,
        product_uom: 'kg',
        state: result.state,
        phases: [], // Las fases se cargarían después
        current_phase: null,
      }
    };
  },

  /**
   * Avanza a la siguiente fase
   */
  async advancePhase(productionId) {
    return await this.request(CONFIG.API.ADVANCE_PHASE, 'POST', {
      production_id: productionId,
    });
  },

  /**
   * Pausa una producción
   */
  async pauseProduction(productionId) {
    return await this.request(CONFIG.API.PAUSE, 'POST', {
      production_id: productionId,
    });
  },

  /**
   * Reanuda una producción
   */
  async resumeProduction(productionId) {
    return await this.request(CONFIG.API.RESUME, 'POST', {
      production_id: productionId,
    });
  },

  /**
   * Cancela una producción
   */
  async cancelProduction(productionId) {
    return await this.request(CONFIG.API.CANCEL, 'POST', {
      production_id: productionId,
    });
  },

  /**
   * Finaliza una producción
   */
  async finalizeProduction(productionId, actualQty, producerId, notes) {
    return await this.request(CONFIG.API.FINALIZE, 'POST', {
      production_id: productionId,
      actual_qty: parseFloat(actualQty),
      producer_id: producerId,
      notes: notes || '',
    });
  },

  /**
   * Obtiene lista de productores (cocineros)
   */
  async getProducers() {
    return await this.request(CONFIG.API.PRODUCERS);
  },
};
