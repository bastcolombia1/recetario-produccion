/**
 * Gestor de estado global de la aplicación
 */

const State = {
  // Usuario actual
  user: null,

  // Receta seleccionada
  currentRecipe: null,

  // Producción activa
  currentProduction: null,

  // Cálculo actual
  currentCalculation: null,

  // Temporizador de actualización
  updateTimer: null,

  /**
   * Inicializa el estado desde localStorage
   */
  init() {
    const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    if (userStr) {
      this.user = JSON.parse(userStr);
    }

    const productionStr = localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTION);
    if (productionStr) {
      this.currentProduction = JSON.parse(productionStr);
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
   * Guarda la producción activa
   */
  setProduction(production) {
    this.currentProduction = production;
    localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTION, JSON.stringify(production));
  },

  /**
   * Limpia la producción activa
   */
  clearProduction() {
    this.currentProduction = null;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.PRODUCTION);
  },

  /**
   * Actualiza el estado de la producción
   */
  updateProduction(updates) {
    if (this.currentProduction) {
      this.currentProduction = { ...this.currentProduction, ...updates };
      localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTION, JSON.stringify(this.currentProduction));
    }
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
   * Limpia todo el estado
   */
  reset() {
    this.clearUser();
    this.clearProduction();
    this.currentRecipe = null;
    this.currentCalculation = null;
    this.stopUpdateTimer();
  },
};
