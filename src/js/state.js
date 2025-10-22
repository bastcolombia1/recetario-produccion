/**
 * Gestor de estado global de la aplicación
 */

const State = {
  // Usuario actual
  user: null,

  // Receta seleccionada
  currentRecipe: null,

  // Producciones activas (array)
  productions: [],

  // Producción seleccionada actualmente
  selectedProductionIndex: 0,

  // Cálculo actual
  currentCalculation: null,

  // Temporizador de actualización
  updateTimer: null,

  // Temporizador de auto-retorno (1 minuto)
  autoReturnTimer: null,

  // Temporizador de auto-refresh (1 minuto)
  autoRefreshTimer: null,

  /**
   * Inicializa el estado desde localStorage
   */
  init() {
    const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    if (userStr) {
      this.user = JSON.parse(userStr);
    }

    const productionsStr = localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTIONS);
    if (productionsStr) {
      this.productions = JSON.parse(productionsStr);

      // Limpiar producciones con datos inválidos
      this.productions = this.productions.filter(prod => {
        // Verificar que tenga ID y código
        if (!prod.id || !prod.code) {
          console.warn('Producción sin ID o código eliminada:', prod);
          return false;
        }

        // Validar fecha de inicio
        if (prod.start_time) {
          const startTime = new Date(prod.start_time);
          if (isNaN(startTime.getTime())) {
            console.warn('Producción con fecha inválida eliminada:', prod);
            return false;
          }
        }

        return true;
      });

      // Guardar producciones limpias
      if (productionsStr !== JSON.stringify(this.productions)) {
        this._saveProductions();
        console.log('Producciones limpiadas:', this.productions.length);
      }
    }

    // Migrar datos antiguos si existen
    const oldProductionStr = localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTION);
    if (oldProductionStr && this.productions.length === 0) {
      this.productions = [JSON.parse(oldProductionStr)];
      localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTIONS, JSON.stringify(this.productions));
      localStorage.removeItem(CONFIG.STORAGE_KEYS.PRODUCTION);
    }
  },

  /**
   * Guarda el usuario actual
   */
  setUser(user) {
    this.user = user;
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Limpia el usuario actual
   */
  clearUser() {
    this.user = null;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
  },

  /**
   * Guarda la receta actual
   */
  setRecipe(recipe) {
    this.currentRecipe = recipe;
  },

  /**
   * Guarda el cálculo actual
   */
  setCalculation(calculation) {
    this.currentCalculation = calculation;
  },

  /**
   * Obtiene la producción actualmente seleccionada
   */
  get currentProduction() {
    if (this.productions.length > 0 && this.selectedProductionIndex < this.productions.length) {
      return this.productions[this.selectedProductionIndex];
    }
    return null;
  },

  /**
   * Agrega una nueva producción
   */
  addProduction(production) {
    this.productions.push(production);
    this.selectedProductionIndex = this.productions.length - 1;
    this._saveProductions();
  },

  /**
   * Guarda la producción activa (compatibilidad con código antiguo)
   */
  setProduction(production) {
    if (this.productions.length === 0) {
      this.addProduction(production);
    } else {
      this.productions[this.selectedProductionIndex] = production;
      this._saveProductions();
    }
  },

  /**
   * Selecciona una producción por índice
   */
  selectProduction(index) {
    if (index >= 0 && index < this.productions.length) {
      this.selectedProductionIndex = index;
      return this.productions[index];
    }
    return null;
  },

  /**
   * Selecciona una producción por ID
   */
  selectProductionById(id) {
    const index = this.productions.findIndex(p => p.id === id);
    if (index >= 0) {
      this.selectedProductionIndex = index;
      return this.productions[index];
    }
    return null;
  },

  /**
   * Limpia la producción activa (remueve la seleccionada)
   */
  clearProduction() {
    if (this.productions.length > 0) {
      this.productions.splice(this.selectedProductionIndex, 1);
      if (this.selectedProductionIndex >= this.productions.length) {
        this.selectedProductionIndex = Math.max(0, this.productions.length - 1);
      }
      this._saveProductions();
    }
  },

  /**
   * Limpia todas las producciones
   */
  clearAllProductions() {
    this.productions = [];
    this.selectedProductionIndex = 0;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.PRODUCTIONS);
  },

  /**
   * Actualiza el estado de la producción
   */
  updateProduction(updates) {
    if (this.currentProduction) {
      this.productions[this.selectedProductionIndex] = {
        ...this.productions[this.selectedProductionIndex],
        ...updates
      };
      this._saveProductions();
    }
  },

  /**
   * Guarda las producciones en localStorage
   */
  _saveProductions() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTIONS, JSON.stringify(this.productions));
  },

  /**
   * Inicia el temporizador de actualización
   */
  startUpdateTimer(callback) {
    this.stopUpdateTimer();
    this.updateTimer = setInterval(callback, CONFIG.UPDATE_INTERVAL);
  },

  /**
   * Detiene el temporizador de actualización
   */
  stopUpdateTimer() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  },

  /**
   * Inicia el temporizador de auto-retorno (1 minuto)
   */
  startAutoReturnTimer(callback) {
    this.stopAutoReturnTimer();
    this.autoReturnTimer = setTimeout(callback, 60000); // 1 minuto
  },

  /**
   * Detiene el temporizador de auto-retorno
   */
  stopAutoReturnTimer() {
    if (this.autoReturnTimer) {
      clearTimeout(this.autoReturnTimer);
      this.autoReturnTimer = null;
    }
  },

  /**
   * Inicia el temporizador de auto-refresh (1 minuto)
   */
  startAutoRefreshTimer(callback) {
    this.stopAutoRefreshTimer();
    this.autoRefreshTimer = setInterval(callback, 60000); // 1 minuto
  },

  /**
   * Detiene el temporizador de auto-refresh
   */
  stopAutoRefreshTimer() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  },

  /**
   * Limpia todo el estado
   */
  reset() {
    this.clearUser();
    this.clearAllProductions();
    this.currentRecipe = null;
    this.currentCalculation = null;
    this.stopUpdateTimer();
    this.stopAutoReturnTimer();
    this.stopAutoRefreshTimer();
  },
};
