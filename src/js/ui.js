/**
 * Gestor de interfaz de usuario
 */

const UI = {
  /**
   * Muestra una pantalla y oculta las demás
   */
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  },

  /**
   * Muestra u oculta un elemento
   */
  toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
      if (show) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  },

  /**
   * Muestra un mensaje de error
   */
  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.remove('hidden');
    }
  },

  /**
   * Oculta un mensaje de error
   */
  hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  },

  /**
   * Carga las recetas en el selector
   */
  loadRecipes(recipes) {
    const select = document.getElementById('recipe-select');
    select.innerHTML = '<option value="">Seleccione una receta</option>';

    recipes.forEach(recipe => {
      const option = document.createElement('option');
      option.value = recipe.id;
      option.textContent = recipe.name;
      option.dataset.recipe = JSON.stringify(recipe);
      select.appendChild(option);
    });
  },

  /**
   * Muestra información del ingrediente principal
   */
  showIngredientInfo(ingredientName, unit) {
    document.getElementById('main-ingredient-name').textContent = `${ingredientName} (${unit})`;
    document.getElementById('quantity-unit').textContent = unit;
    this.toggleElement('ingredient-info', true);
  },

  /**
   * Muestra los resultados del cálculo
   */
  showCalculationResults(data) {
    document.getElementById('expected-qty').textContent = `${data.expected_qty.toFixed(2)} ${data.product_uom}`;

    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';

    data.ingredients.forEach(ing => {
      const item = document.createElement('div');
      item.className = 'ingredient-item';
      item.innerHTML = `
        <span class="ingredient-name">${ing.product_name}</span>
        <span class="ingredient-qty">${parseFloat(ing.qty).toFixed(2)} ${ing.uom_name}</span>
      `;
      ingredientsList.appendChild(item);
    });

    this.toggleElement('calculation-results', true);
  },

  /**
   * Actualiza la pantalla de producción en progreso
   */
  updateProductionScreen(production) {
    document.getElementById('production-recipe-name').textContent = production.recipe_name;
    document.getElementById('production-code').textContent = production.code;

    const nextPhaseBtn = document.getElementById('btn-next-phase');

    if (production.current_phase) {
      // Hay fase actual - mostrar normalmente
      const phaseIcon = CONFIG.PHASE_ICONS[production.current_phase.name] || '⚙️';
      document.getElementById('current-phase-name').textContent = `${phaseIcon} ${production.current_phase.name.toUpperCase()}`;
      document.getElementById('estimated-time').textContent = `${production.current_phase.estimated_minutes || 0} min`;

      // Botón en modo normal
      nextPhaseBtn.textContent = '▶️ SIGUIENTE FASE';
      nextPhaseBtn.className = 'btn btn-primary btn-large';
    } else {
      // No hay fase actual - todas las fases completadas
      document.getElementById('current-phase-name').textContent = '✅ TODAS LAS FASES COMPLETADAS';
      document.getElementById('estimated-time').textContent = 'Listo para finalizar';

      // Cambiar botón a "FINALIZAR PRODUCCIÓN"
      nextPhaseBtn.textContent = '✅ FINALIZAR PRODUCCIÓN';
      nextPhaseBtn.className = 'btn btn-success btn-large';
    }

    this.updateElapsedTime(production);
    this.updateProgress(production);
    this.renderPhases(production.phases);

    // Actualizar botones según estado
    const isPaused = production.state === 'paused';
    this.toggleElement('btn-pause', !isPaused);
    this.toggleElement('btn-resume', isPaused);
  },

  /**
   * Actualiza el tiempo transcurrido
   */
  updateElapsedTime(production) {
    if (production.current_phase && production.current_phase.start_time) {
      const startTime = new Date(production.current_phase.start_time);
      const now = new Date();
      const elapsedMs = now - startTime;
      const elapsedMinutes = Math.floor(elapsedMs / 60000);

      document.getElementById('elapsed-time').textContent = `${elapsedMinutes} min`;

      // Calcular progreso
      const estimatedMinutes = production.current_phase.estimated_minutes || 1;
      const progress = Math.min((elapsedMinutes / estimatedMinutes) * 100, 100);

      this.updateProgressBar(progress);
    }
  },

  /**
   * Actualiza el progreso general
   */
  updateProgress(production) {
    if (production.phases && production.phases.length > 0) {
      const completedPhases = production.phases.filter(p => p.state === 'finished').length;
      const totalPhases = production.phases.length;
      const progress = (completedPhases / totalPhases) * 100;

      this.updateProgressBar(progress);
    }
  },

  /**
   * Actualiza la barra de progreso
   */
  updateProgressBar(percentage) {
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-percentage');

    fill.style.width = `${percentage}%`;
    text.textContent = `${Math.round(percentage)}%`;
  },

  /**
   * Renderiza la lista de fases
   */
  renderPhases(phases) {
    const phasesList = document.getElementById('phases-list');
    phasesList.innerHTML = '';

    phases.forEach(phase => {
      const item = document.createElement('div');
      item.className = `phase-item ${phase.state}`;

      const icon = CONFIG.PHASE_ICONS[phase.name] || '⚙️';
      let statusIcon = '⚪';

      if (phase.state === 'finished') statusIcon = '✅';
      else if (phase.state === 'in_progress') statusIcon = '🔵';

      item.innerHTML = `
        <span class="phase-icon">${statusIcon}</span>
        <span>${icon} ${phase.name}</span>
      `;

      phasesList.appendChild(item);
    });
  },

  /**
   * Muestra la pantalla de finalización
   */
  showFinalizeScreen(production) {
    document.getElementById('finalize-recipe-name').textContent = production.recipe_name;
    document.getElementById('finalize-production-code').textContent = production.code;
    document.getElementById('finalize-expected-qty').textContent = `${production.expected_qty.toFixed(2)} ${production.product_uom}`;
    document.getElementById('actual-qty-unit').textContent = production.product_uom;

    this.showScreen('screen-finalize');
  },

  /**
   * Carga los productores en el selector
   */
  loadProducers(producers) {
    const select = document.getElementById('producer-select');
    select.innerHTML = '<option value="">Seleccione el productor</option>';

    producers.forEach(producer => {
      const option = document.createElement('option');
      option.value = producer.id;
      option.textContent = producer.name;
      select.appendChild(option);
    });
  },

  /**
   * Calcula y muestra el rendimiento
   */
  updateYield() {
    const expectedQty = parseFloat(document.getElementById('finalize-expected-qty').textContent);
    const actualQty = parseFloat(document.getElementById('actual-qty-input').value);

    if (actualQty && expectedQty) {
      const yieldPercentage = (actualQty / expectedQty) * 100;
      document.getElementById('yield-percentage').textContent = `${yieldPercentage.toFixed(1)}%`;
      this.toggleElement('yield-info', true);
    }
  },

  /**
   * Muestra la pantalla de éxito
   */
  showSuccessScreen(production) {
    document.getElementById('success-production-code').textContent = production.code || 'N/A';
    document.getElementById('success-yield').textContent = `${(production.real_yield || 0).toFixed(1)}%`;

    this.showScreen('screen-success');
  },

  /**
   * Limpia todos los formularios
   */
  resetForms() {
    document.querySelectorAll('input[type="text"], input[type="password"], input[type="number"], textarea').forEach(input => {
      input.value = '';
    });

    document.querySelectorAll('select').forEach(select => {
      select.selectedIndex = 0;
    });

    this.hideError('login-error');
    this.hideError('calculate-error');
    this.hideError('finalize-error');
    this.toggleElement('ingredient-info', false);
    this.toggleElement('calculation-results', false);
    this.toggleElement('yield-info', false);
  },

  /**
   * Muestra la lista de producciones activas
   */
  showActiveProductions(productions, selectedIndex) {
    const section = document.getElementById('active-productions-section');
    const list = document.getElementById('active-productions-list');

    if (!productions || productions.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    list.innerHTML = '';

    productions.forEach((production, index) => {
      const card = document.createElement('div');
      card.className = 'production-card';
      if (index === selectedIndex) {
        card.classList.add('selected');
      }
      card.dataset.index = index;

      // Calcular tiempo transcurrido
      let elapsed = 0;
      let timeText = 'Sin iniciar';
      if (production.start_time) {
        const startTime = new Date(production.start_time);
        if (!isNaN(startTime.getTime())) {
          elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000); // minutos
          timeText = `${elapsed} min`;
        }
      }

      // Determinar fase actual
      const currentPhase = production.current_phase || { name: 'Iniciando...' };
      const phaseIcon = CONFIG.PHASE_ICONS[currentPhase.name] || '📋';

      card.innerHTML = `
        <div class="production-card-header">
          <div class="production-card-title">${production.recipe_name || 'Producción'}</div>
          <div class="production-card-code">${production.code || 'N/A'}</div>
        </div>
        <div class="production-card-phase">${phaseIcon} ${currentPhase.name}</div>
        <div class="production-card-time">⏱️ Tiempo: ${timeText}</div>
      `;

      card.addEventListener('click', () => {
        if (window.App && window.App.selectProduction) {
          window.App.selectProduction(index);
        }
      });

      list.appendChild(card);
    });
  },

  /**
   * Actualiza la lista de producciones activas
   */
  updateActiveProductionsList() {
    if (State.productions && State.productions.length > 0) {
      this.showActiveProductions(State.productions, State.selectedProductionIndex);
    } else {
      this.toggleElement('active-productions-section', false);
    }
  },

  /**
   * Muestra la pantalla de historial
   */
  showHistoryScreen(history) {
    this.showScreen('screen-history');

    const historyList = document.getElementById('history-list');

    // Ocultar mensajes
    this.toggleElement('history-loading', false);
    this.toggleElement('history-empty', false);
    this.toggleElement('history-error', false);

    if (!history || history.length === 0) {
      this.toggleElement('history-empty', true);
      historyList.innerHTML = '';
      return;
    }

    // Renderizar items de historial
    historyList.innerHTML = history.map(item => {
      const stateClass = item.state === 'finished' ? 'finished' : 'cancelled';
      const stateText = item.state === 'finished' ? 'Finalizada' : 'Cancelada';

      // Color del rendimiento
      let yieldClass = 'history-item-yield';
      if (item.real_yield < 80) yieldClass += ' very-low';
      else if (item.real_yield < 90) yieldClass += ' low';

      // Formatear fecha
      const finishDate = item.finish_datetime ? new Date(item.finish_datetime) : null;
      const dateStr = finishDate ?
        `${finishDate.toLocaleDateString()} ${finishDate.toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}` :
        'N/A';

      return `
        <div class="history-item ${item.state === 'cancelled' ? 'cancelled' : ''}">
          <div class="history-item-header">
            <div>
              <div class="history-item-title">${item.recipe_name}</div>
              <div class="history-item-code">${item.code}</div>
            </div>
            <span class="history-item-state ${stateClass}">${stateText}</span>
          </div>

          <div class="history-item-details">
            <div class="history-item-detail">
              <span class="history-item-detail-label">Cantidad esperada</span>
              <span class="history-item-detail-value">${item.expected_qty.toFixed(2)} ${item.product_uom}</span>
            </div>
            <div class="history-item-detail">
              <span class="history-item-detail-label">Cantidad obtenida</span>
              <span class="history-item-detail-value">${item.actual_qty.toFixed(2)} ${item.product_uom}</span>
            </div>
            <div class="history-item-detail">
              <span class="history-item-detail-label">Rendimiento</span>
              <span class="history-item-detail-value ${yieldClass}">${item.real_yield}%</span>
            </div>
            <div class="history-item-detail">
              <span class="history-item-detail-label">Duración</span>
              <span class="history-item-detail-value">${item.duration_minutes} min</span>
            </div>
          </div>

          <div class="history-item-footer">
            📅 ${dateStr} | 👤 ${item.producer_name}
            ${item.notes ? `<br>📝 ${item.notes}` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Mostrar la lista (quitar clase hidden)
    this.toggleElement('history-list', true);
  },

  /**
   * Muestra error en pantalla de historial
   */
  showHistoryError(message) {
    this.toggleElement('history-loading', false);
    this.toggleElement('history-list', false);
    this.toggleElement('history-empty', false);

    const errorEl = document.getElementById('history-error');
    errorEl.textContent = message;
    this.toggleElement('history-error', true);
  },
};
