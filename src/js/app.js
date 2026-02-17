/**
 * Controlador principal de la aplicación
 */

const App = {
  /**
   * Inicializa la aplicación
   */
  async init() {
    console.log('🚀 Inicializando aplicación...');
    console.log(`📱 Versión: ${CONFIG.APP_VERSION} (${CONFIG.APP_VERSION_CODE})`);

    // Inicializar estado
    State.init();

    // Registrar event listeners
    this.registerEventListeners();

    // Inicializar audio en el primer gesto del usuario (requerido por navegadores)
    document.addEventListener('click', () => UI.initAudio(), { once: true });
    document.addEventListener('touchstart', () => UI.initAudio(), { once: true });

    // Verificar si hay sesión activa
    if (State.user) {
      await this.loadCalculateScreen();
    } else {
      UI.showScreen('screen-login');
    }

    console.log('✅ Aplicación inicializada');

    // Verificar actualizaciones en segundo plano
    this.checkForUpdates();
  },

  /**
   * Verifica si hay actualizaciones disponibles
   */
  async checkForUpdates() {
    try {
      const update = await CONFIG.checkForUpdates();

      if (update.available) {
        console.log(`🆕 Nueva versión disponible: ${update.version}`);
        this.showUpdateNotification(update);
      } else {
        console.log('✅ App actualizada');
      }
    } catch (error) {
      console.log('No se pudo verificar actualizaciones');
    }
  },

  /**
   * Muestra notificación de actualización disponible
   */
  showUpdateNotification(update) {
    // Crear elemento de notificación si no existe
    let notification = document.getElementById('update-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'update-notification';
      notification.innerHTML = `
        <div class="update-content">
          <div class="update-icon">🆕</div>
          <div class="update-text">
            <strong>Nueva versión ${update.version}</strong>
            <small>Toca para actualizar</small>
          </div>
          <button class="update-close" onclick="App.dismissUpdate()">✕</button>
        </div>
      `;
      notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        z-index: 9999;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      notification.querySelector('.update-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 500px;
        margin: 0 auto;
      `;
      notification.querySelector('.update-icon').style.cssText = `
        font-size: 24px;
      `;
      notification.querySelector('.update-text').style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
      `;
      notification.querySelector('.update-text small').style.cssText = `
        opacity: 0.9;
        font-size: 12px;
      `;
      notification.querySelector('.update-close').style.cssText = `
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
      `;

      notification.addEventListener('click', (e) => {
        if (!e.target.classList.contains('update-close')) {
          window.open(update.downloadUrl, '_system');
        }
      });

      document.body.prepend(notification);

      // Ajustar padding del body para compensar la notificación
      document.body.style.paddingTop = '60px';
    }
  },

  /**
   * Oculta la notificación de actualización
   */
  dismissUpdate() {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.remove();
      document.body.style.paddingTop = '0';
    }
  },

  /**
   * Registra todos los event listeners
   */
  registerEventListeners() {
    // Login
    document.getElementById('btn-login').addEventListener('click', () => this.handleLogin());
    document.getElementById('login-code').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

    // Historial desde pantalla principal
    document.getElementById('btn-view-history-main').addEventListener('click', () => this.loadHistoryScreen());

    // Calcular
    document.getElementById('recipe-select').addEventListener('change', (e) => this.handleRecipeChange(e));
    document.getElementById('btn-calculate').addEventListener('click', () => this.handleCalculate());

    // Iniciar producción
    document.getElementById('btn-start-production').addEventListener('click', () => this.handleStartProduction());

    // Control de producción
    document.getElementById('btn-back-to-list').addEventListener('click', () => this.loadCalculateScreen());
    document.getElementById('btn-pause').addEventListener('click', () => this.handlePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.handleResume());
    document.getElementById('btn-next-phase').addEventListener('click', () => this.handleNextPhase());
    document.getElementById('btn-cancel-production').addEventListener('click', () => this.handleCancelProduction());

    // Finalizar
    document.getElementById('actual-qty-input').addEventListener('input', () => UI.updateYield());
    document.getElementById('btn-finish-production').addEventListener('click', () => this.handleFinishProduction());
    document.getElementById('btn-back-to-production').addEventListener('click', () => {
      // Volver a la lista de producciones en lugar de a la pantalla de producción
      this.loadCalculateScreen();
    });

    // Éxito
    document.getElementById('btn-new-production').addEventListener('click', () => this.handleNewProduction());
    document.getElementById('btn-view-history').addEventListener('click', () => this.loadHistoryScreen());

    // Historial
    document.getElementById('btn-back-from-history').addEventListener('click', () => this.loadCalculateScreen());

    // Configuración del servidor
    document.getElementById('btn-config').addEventListener('click', () => this.openConfigModal());
    document.getElementById('btn-test-connection').addEventListener('click', () => this.testConnection());
    document.getElementById('btn-save-config').addEventListener('click', () => this.saveConfig());
    document.getElementById('btn-cancel-config').addEventListener('click', () => this.closeConfigModal());
    document.getElementById('modal-overlay').addEventListener('click', () => this.closeConfigModal());
  },

  /**
   * Maneja el login
   */
  async handleLogin() {
    const code = document.getElementById('login-code').value.trim();

    if (!code) {
      UI.showError('login-error', 'Por favor ingrese su código');
      return;
    }

    try {
      UI.hideError('login-error');
      const result = await API.login(code);

      State.setUser(result.user);
      await this.loadCalculateScreen();
    } catch (error) {
      UI.showError('login-error', error.message || 'Código inválido');
    }
  },

  /**
   * Maneja el logout
   */
  handleLogout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      API.logout();
      State.clearUser();
      State.stopUpdateTimer();
      UI.resetForms();
      UI.showScreen('screen-login');
      // NO limpiar las producciones activas - se mantienen para el siguiente usuario
    }
  },

  /**
   * Carga la pantalla de cálculo
   */
  async loadCalculateScreen() {
    try {
      // Detener timer de auto-retorno si está activo
      State.stopAutoReturnTimer();

      // Cargar recetas
      const recipes = await API.getRecipes();
      UI.loadRecipes(recipes);

      // Cargar productores
      const producers = await API.getProducers();
      UI.loadProducers(producers);

      // Mostrar nombre de usuario
      if (State.user) {
        document.getElementById('user-name').textContent = State.user.name;
      }

      // Mostrar producciones activas si existen
      UI.updateActiveProductionsList();

      UI.showScreen('screen-calculate');

      // Iniciar timer de auto-refresh (1 minuto)
      State.startAutoRefreshTimer(() => {
        console.log('Auto-refresh de producciones activas');
        UI.updateActiveProductionsList();
      });
    } catch (error) {
      console.error('Error al cargar pantalla de cálculo:', error);
      UI.showError('calculate-error', 'Error al cargar datos');
    }
  },

  /**
   * Selecciona una producción de la lista
   */
  selectProduction(index) {
    const production = State.selectProduction(index);
    if (production) {
      this.showProductionScreen(production);
    }
  },

  /**
   * Muestra la pantalla de producción con los datos de la producción especificada
   */
  showProductionScreen(production) {
    UI.updateProductionScreen(production);
    UI.showScreen('screen-production');

    // Iniciar timer de auto-retorno (1 minuto)
    State.startAutoReturnTimer(() => {
      console.log('Auto-retorno a pantalla principal');
      this.loadCalculateScreen();
    });
  },

  /**
   * Maneja el cambio de receta
   */
  handleRecipeChange(event) {
    const option = event.target.selectedOptions[0];
    if (!option.dataset.recipe) {
      UI.toggleElement('ingredient-info', false);
      UI.toggleElement('calculation-results', false);
      return;
    }

    const recipe = JSON.parse(option.dataset.recipe);
    State.setRecipe(recipe);

    // Mostrar ingrediente principal
    UI.showIngredientInfo(recipe.main_ingredient_name, recipe.main_ingredient_uom);
  },

  /**
   * Maneja el cálculo de explosión de materiales
   */
  async handleCalculate() {
    if (!State.currentRecipe) {
      UI.showError('calculate-error', 'Seleccione una receta');
      return;
    }

    const quantity = document.getElementById('quantity-input').value;
    if (!quantity || parseFloat(quantity) <= 0) {
      UI.showError('calculate-error', 'Ingrese una cantidad válida');
      return;
    }

    try {
      UI.hideError('calculate-error');
      const result = await API.calculateRecipe(State.currentRecipe.id, quantity);

      State.setCalculation(result);
      UI.showCalculationResults(result);
    } catch (error) {
      UI.showError('calculate-error', error.message || 'Error al calcular');
    }
  },

  /**
   * Maneja el inicio de producción
   */
  async handleStartProduction() {
    if (!State.currentRecipe) {
      UI.showError('calculate-error', 'Debe seleccionar una receta primero');
      return;
    }

    if (!State.currentCalculation) {
      UI.showError('calculate-error', 'Primero debe calcular la producción');
      return;
    }

    if (!confirm('¿Iniciar producción?')) {
      return;
    }

    try {
      const quantity = document.getElementById('quantity-input').value;
      const result = await API.startProduction(
        State.currentRecipe.id,
        quantity,
        State.currentCalculation.ingredients
      );

      // Agregar producción al array de producciones activas
      State.addProduction(result.production);

      // Mostrar pantalla de producción
      this.showProductionScreen(result.production);

      // Iniciar temporizador de actualización
      State.startUpdateTimer(() => this.updateProductionStatus());
    } catch (error) {
      UI.showError('calculate-error', error.message || 'Error al iniciar producción');
    }
  },

  /**
   * Actualiza el estado de la producción
   */
  updateProductionStatus() {
    if (State.currentProduction) {
      UI.updateElapsedTime(State.currentProduction);
    }
  },

  /**
   * Maneja la pausa
   */
  async handlePause() {
    try {
      await API.pauseProduction(State.currentProduction.id);
      State.updateProduction({ state: 'paused' });
      UI.toggleElement('btn-pause', false);
      UI.toggleElement('btn-resume', true);
      State.stopUpdateTimer();
    } catch (error) {
      alert('Error al pausar producción');
    }
  },

  /**
   * Maneja la reanudación
   */
  async handleResume() {
    try {
      await API.resumeProduction(State.currentProduction.id);
      State.updateProduction({ state: 'in_progress' });
      UI.toggleElement('btn-pause', true);
      UI.toggleElement('btn-resume', false);
      State.startUpdateTimer(() => this.updateProductionStatus());
    } catch (error) {
      alert('Error al reanudar producción');
    }
  },

  /**
   * Maneja el avance a la siguiente fase
   */
  async handleNextPhase() {
    // Si no hay fase actual, significa que ya se completaron todas
    // y solo necesitamos ir a la pantalla de finalización
    if (!State.currentProduction.current_phase) {
      State.stopUpdateTimer();
      UI.showFinalizeScreen(State.currentProduction);
      return;
    }

    if (!confirm('¿Avanzar a la siguiente fase?')) {
      return;
    }

    try {
      const result = await API.advancePhase(State.currentProduction.id);

      if (result.finished) {
        // Todas las fases completadas, mostrar pantalla de finalización
        State.stopUpdateTimer();
        UI.showFinalizeScreen(State.currentProduction);
      } else {
        // Actualizar estado con nueva fase
        State.updateProduction({
          current_phase: result.current_phase,
          phases: result.phases,
        });
        UI.updateProductionScreen(State.currentProduction);
      }
    } catch (error) {
      // Si el error es "No hay fase actual", significa que ya terminaron todas las fases
      // Actualizar el estado local y mostrar pantalla de finalización
      if (error.message && error.message.includes('No hay fase actual')) {
        console.log('Todas las fases completadas, actualizando estado local');
        State.updateProduction({
          current_phase: null,
        });
        State.stopUpdateTimer();
        UI.showFinalizeScreen(State.currentProduction);
      } else {
        alert(error.message || 'Error al avanzar fase');
      }
    }
  },

  /**
   * Maneja la cancelación de producción
   */
  async handleCancelProduction() {
    if (!confirm('¿Está seguro de cancelar la producción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await API.cancelProduction(State.currentProduction.id);
      State.clearProduction();
      State.stopUpdateTimer();
      UI.resetForms();
      await this.loadCalculateScreen();
    } catch (error) {
      alert('Error al cancelar producción');
    }
  },

  /**
   * Maneja la finalización de producción
   */
  async handleFinishProduction() {
    const actualQty = document.getElementById('actual-qty-input').value;
    const producerId = document.getElementById('producer-select').value;
    const notes = document.getElementById('notes-input').value;

    if (!actualQty || parseFloat(actualQty) <= 0) {
      UI.showError('finalize-error', 'Ingrese la cantidad real obtenida');
      return;
    }

    if (!producerId) {
      UI.showError('finalize-error', 'Seleccione el productor');
      return;
    }

    // Calcular rendimiento
    const expectedQty = State.currentProduction.expected_qty || 0;
    const actualQtyNum = parseFloat(actualQty);
    const yieldPercentage = expectedQty > 0 ? (actualQtyNum / expectedQty) * 100 : 100;

    // Verificar si alguna fase excedió el tiempo en más del 5%
    let phaseExceeded = false;
    if (State.currentProduction.phases && Array.isArray(State.currentProduction.phases)) {
      phaseExceeded = State.currentProduction.phases.some(phase => {
        if (phase.estimated_minutes && phase.estimated_minutes > 0 && phase.actual_duration) {
          const threshold = phase.estimated_minutes * 1.05; // 105% del tiempo estimado
          return phase.actual_duration > threshold;
        }
        return false;
      });
    }

    // Validar observaciones si rendimiento < 97% O si alguna fase excedió 105% del tiempo
    if ((yieldPercentage < 97 || phaseExceeded) && (!notes || notes.trim() === '')) {
      let errorMsg = 'El campo de observaciones es obligatorio.\n\nMotivo: ';
      const reasons = [];
      if (yieldPercentage < 97) {
        reasons.push(`El rendimiento es ${yieldPercentage.toFixed(1)}% (debe ser mayor o igual al 97%)`);
      }
      if (phaseExceeded) {
        reasons.push('Una o más fases tardaron más del 5% del tiempo estimado');
      }
      errorMsg += reasons.join(' y ') + '.';
      UI.showError('finalize-error', errorMsg);
      return;
    }

    if (!confirm('¿Finalizar producción?')) {
      return;
    }

    try {
      UI.hideError('finalize-error');
      const result = await API.finalizeProduction(
        State.currentProduction.id,
        actualQty,
        producerId,
        notes
      );

      State.clearProduction();
      UI.showSuccessScreen(result);
    } catch (error) {
      UI.showError('finalize-error', error.message || 'Error al finalizar producción');
    }
  },

  /**
   * Maneja nueva producción
   */
  async handleNewProduction() {
    UI.resetForms();
    await this.loadCalculateScreen();
  },

  /**
   * Carga la pantalla de historial
   */
  async loadHistoryScreen() {
    try {
      UI.toggleElement('history-loading', true);
      UI.toggleElement('history-list', false);
      UI.toggleElement('history-empty', false);
      UI.toggleElement('history-error', false);
      UI.showScreen('screen-history');

      const result = await API.getProductionHistory(50, 0);
      UI.showHistoryScreen(result.history);
    } catch (error) {
      console.error('Error cargando historial:', error);
      UI.showHistoryError(error.message || 'Error al cargar el historial');
    }
  },

  /**
   * Abre el modal de configuración del servidor
   */
  openConfigModal() {
    const config = CONFIG.getServerConfig();
    document.getElementById('config-ip').value = config.ip || '';
    document.getElementById('config-port').value = config.port || '80';
    document.getElementById('current-url').textContent = CONFIG.getServerUrl();
    this.hideConfigStatus();
    document.getElementById('modal-config').classList.remove('hidden');
  },

  /**
   * Cierra el modal de configuración
   */
  closeConfigModal() {
    document.getElementById('modal-config').classList.add('hidden');
  },

  /**
   * Muestra el estado de la configuración
   */
  showConfigStatus(message, type) {
    const statusEl = document.getElementById('config-status');
    statusEl.textContent = message;
    statusEl.className = 'config-status ' + type;
    statusEl.classList.remove('hidden');
  },

  /**
   * Oculta el estado de la configuración
   */
  hideConfigStatus() {
    document.getElementById('config-status').classList.add('hidden');
  },

  /**
   * Prueba la conexión con el servidor
   */
  async testConnection() {
    const ip = document.getElementById('config-ip').value.trim();
    const port = document.getElementById('config-port').value.trim() || '80';

    if (!ip) {
      this.showConfigStatus('Ingrese una dirección IP', 'error');
      return;
    }

    // Construir URL temporal para probar
    const portStr = port && port !== '80' ? ':' + port : '';
    const testUrl = 'http://' + ip + portStr;

    this.showConfigStatus('Probando conexión...', 'loading');

    try {
      const response = await fetch(testUrl + CONFIG.API.RECIPES, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      // 200 = OK, 401 = No autorizado (pero servidor alcanzable)
      if (response.ok || response.status === 401) {
        this.showConfigStatus('Conexión exitosa', 'success');
      } else {
        this.showConfigStatus('Servidor respondió con error: ' + response.status, 'error');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      this.showConfigStatus('No se pudo conectar al servidor', 'error');
    }
  },

  /**
   * Guarda la configuración del servidor
   */
  saveConfig() {
    const ip = document.getElementById('config-ip').value.trim();
    const port = document.getElementById('config-port').value.trim() || '80';

    if (!ip) {
      this.showConfigStatus('Ingrese una dirección IP', 'error');
      return;
    }

    CONFIG.saveServerConfig(ip, port);
    document.getElementById('current-url').textContent = CONFIG.getServerUrl();
    this.showConfigStatus('Configuración guardada', 'success');

    // Cerrar modal después de 1 segundo
    setTimeout(() => {
      this.closeConfigModal();
    }, 1000);
  },
};

// Exponer App globalmente para que sea accesible desde event listeners
window.App = App;

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
