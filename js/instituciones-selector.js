/**
 * CONTROLADOR DE SELECTORES VINCULADOS DE INSTITUCIONES EDUCATIVAS
 * Articulación SENA CIMM con la Educación Media (Colegios 10° y 11°)
 * Vincula inteligentemente: Municipio, Colegio, Programa de Formación y Ficha.
 */

class InstitucionesSelector {
  constructor() {
    this.data = [];
    this.manualMode = false;
    this.selectedItem = null;
  }

  init() {
    this.data = window.INSTITUCIONES_ARTICULADA || [];
    if (!Array.isArray(this.data) || this.data.length === 0) {
      console.warn('No se encontraron datos de instituciones en window.INSTITUCIONES_ARTICULADA');
      return;
    }

    this.cacheDOM();
    this.bindEvents();
    this.populateInitialDropdowns();
  }

  cacheDOM() {
    this.selectMunicipio = document.getElementById('quiz-select-municipio');
    this.selectColegio = document.getElementById('quiz-select-colegio');
    this.selectPrograma = document.getElementById('quiz-select-programa');
    this.selectFicha = document.getElementById('quiz-select-ficha');
    this.selectGrado = document.getElementById('quiz-input-grado');

    // Inputs de texto que reciben los valores para el quizEngine
    this.inputFicha = document.getElementById('quiz-input-ficha');
    this.inputColegio = document.getElementById('quiz-input-colegio');
    this.inputMunicipio = document.getElementById('quiz-input-municipio');
    this.inputPrograma = document.getElementById('quiz-input-programa');

    // Contenedor visual de previsualización
    this.previewContainer = document.getElementById('quiz-institucion-preview');
    this.btnToggleManual = document.getElementById('btn-toggle-manual-institution');
    this.containerSelectores = document.getElementById('container-institution-selectors');
    this.containerManual = document.getElementById('container-institution-manual');
  }

  bindEvents() {
    if (this.selectMunicipio) {
      this.selectMunicipio.addEventListener('change', () => this.onMunicipioChange());
    }

    if (this.selectColegio) {
      this.selectColegio.addEventListener('change', () => this.onColegioChange());
    }

    if (this.selectPrograma) {
      this.selectPrograma.addEventListener('change', () => this.onProgramaChange());
    }

    if (this.selectFicha) {
      this.selectFicha.addEventListener('change', () => this.onFichaChange());
    }

    if (this.btnToggleManual) {
      this.btnToggleManual.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleManualMode();
      });
    }
  }

  populateInitialDropdowns() {
    // 1. Municipios únicos ordenados
    const municipios = Array.from(new Set(this.data.map(d => d.municipio).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
    if (this.selectMunicipio) {
      this.selectMunicipio.innerHTML = `
        <option value="">-- Selecciona Municipio (${municipios.length}) --</option>
        ${municipios.map(m => `<option value="${m}">${m}</option>`).join('')}
      `;
    }

    // 2. Colegios únicos ordenados
    const colegios = Array.from(new Set(this.data.map(d => d.colegio).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
    if (this.selectColegio) {
      this.selectColegio.innerHTML = `
        <option value="">-- Selecciona Institución Educativa (${colegios.length}) --</option>
        ${colegios.map(c => `<option value="${c}">${c}</option>`).join('')}
      `;
    }

    // 3. Programas únicos ordenados
    const programas = Array.from(new Set(this.data.map(d => d.programa).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
    if (this.selectPrograma) {
      this.selectPrograma.innerHTML = `
        <option value="">-- Selecciona Programa de Formación (${programas.length}) --</option>
        ${programas.map(p => `<option value="${p}">${p}</option>`).join('')}
      `;
    }

    // 4. Fichas únicas ordenadas
    const fichas = [...this.data].sort((a, b) => a.ficha.localeCompare(b.ficha));
    if (this.selectFicha) {
      this.selectFicha.innerHTML = `
        <option value="">-- Selecciona No. Ficha SENA (${fichas.length}) --</option>
        ${fichas.map(f => `<option value="${f.ficha}">Ficha ${f.ficha} • ${f.colegio} (${f.municipio})</option>`).join('')}
      `;
    }
  }

  // Cuando el aprendiz selecciona directamente una Ficha
  onFichaChange() {
    const fichaVal = this.selectFicha ? this.selectFicha.value : '';
    if (!fichaVal) {
      this.clearSync();
      return;
    }

    const item = this.data.find(d => String(d.ficha) === String(fichaVal));
    if (item) {
      this.applySelection(item);
    }
  }

  // Cuando el aprendiz selecciona un Municipio
  onMunicipioChange() {
    const munVal = this.selectMunicipio ? this.selectMunicipio.value : '';
    if (!munVal) {
      this.populateInitialDropdowns();
      this.clearSync();
      return;
    }

    const filtered = this.data.filter(d => d.municipio === munVal);
    const colegios = Array.from(new Set(filtered.map(d => d.colegio))).sort((a, b) => a.localeCompare(b, 'es'));
    const programas = Array.from(new Set(filtered.map(d => d.programa))).sort((a, b) => a.localeCompare(b, 'es'));

    if (this.selectColegio) {
      this.selectColegio.innerHTML = `
        <option value="">-- Selecciona Colegio en ${munVal} (${colegios.length}) --</option>
        ${colegios.map(c => `<option value="${c}">${c}</option>`).join('')}
      `;
      if (colegios.length === 1) {
        this.selectColegio.value = colegios[0];
      }
    }

    if (this.selectPrograma) {
      this.selectPrograma.innerHTML = `
        <option value="">-- Selecciona Programa (${programas.length}) --</option>
        ${programas.map(p => `<option value="${p}">${p}</option>`).join('')}
      `;
      if (programas.length === 1) {
        this.selectPrograma.value = programas[0];
      }
    }

    if (this.selectFicha) {
      this.selectFicha.innerHTML = `
        <option value="">-- Selecciona Ficha (${filtered.length}) --</option>
        ${filtered.map(f => `<option value="${f.ficha}">Ficha ${f.ficha} • ${f.programa}</option>`).join('')}
      `;
      if (filtered.length === 1) {
        this.selectFicha.value = filtered[0].ficha;
        this.applySelection(filtered[0]);
        return;
      }
    }

    if (colegios.length === 1) {
      this.onColegioChange();
    }
  }

  // Cuando el aprendiz selecciona un Colegio
  onColegioChange() {
    const colVal = this.selectColegio ? this.selectColegio.value : '';
    if (!colVal) {
      return;
    }

    const filtered = this.data.filter(d => d.colegio === colVal);
    if (filtered.length === 0) return;

    // Auto-completar Municipio
    const mun = filtered[0].municipio;
    if (this.selectMunicipio && (!this.selectMunicipio.value || this.selectMunicipio.value !== mun)) {
      this.selectMunicipio.value = mun;
    }

    // Actualizar programas de este colegio
    const programas = Array.from(new Set(filtered.map(d => d.programa))).sort((a, b) => a.localeCompare(b, 'es'));
    if (this.selectPrograma) {
      this.selectPrograma.innerHTML = `
        <option value="">-- Selecciona Programa (${programas.length}) --</option>
        ${programas.map(p => `<option value="${p}">${p}</option>`).join('')}
      `;
      if (programas.length === 1) {
        this.selectPrograma.value = programas[0];
      }
    }

    // Actualizar fichas de este colegio
    if (this.selectFicha) {
      this.selectFicha.innerHTML = `
        <option value="">-- Selecciona Ficha de ${colVal} (${filtered.length}) --</option>
        ${filtered.map(f => `<option value="${f.ficha}">Ficha ${f.ficha} • ${f.programa}</option>`).join('')}
      `;
      if (filtered.length === 1) {
        this.selectFicha.value = filtered[0].ficha;
        this.applySelection(filtered[0]);
        return;
      }
    }

    if (programas.length === 1) {
      this.onProgramaChange();
    }
  }

  // Cuando el aprendiz selecciona un Programa
  onProgramaChange() {
    const progVal = this.selectPrograma ? this.selectPrograma.value : '';
    const colVal = this.selectColegio ? this.selectColegio.value : '';
    const munVal = this.selectMunicipio ? this.selectMunicipio.value : '';

    let filtered = this.data;
    if (colVal) {
      filtered = filtered.filter(d => d.colegio === colVal);
    } else if (munVal) {
      filtered = filtered.filter(d => d.municipio === munVal);
    }

    if (progVal) {
      filtered = filtered.filter(d => d.programa === progVal);
    }

    if (filtered.length === 1) {
      this.applySelection(filtered[0]);
      return;
    }

    if (this.selectFicha) {
      this.selectFicha.innerHTML = `
        <option value="">-- Selecciona Ficha (${filtered.length}) --</option>
        ${filtered.map(f => `<option value="${f.ficha}">Ficha ${f.ficha} • ${f.colegio} (${f.municipio})</option>`).join('')}
      `;
    }
  }

  // Aplica la selección completa sincronizando todos los campos y la vista previa
  applySelection(item) {
    this.selectedItem = item;

    if (this.selectMunicipio && item.municipio) this.selectMunicipio.value = item.municipio;
    if (this.selectColegio && item.colegio) this.selectColegio.value = item.colegio;
    if (this.selectPrograma && item.programa) this.selectPrograma.value = item.programa;
    if (this.selectFicha && item.ficha) this.selectFicha.value = item.ficha;
    if (this.selectGrado) this.selectGrado.value = item.grado ? `${item.grado}°` : '11°';

    // Sincronizar inputs que lee el motor del quiz
    if (this.inputFicha) this.inputFicha.value = item.ficha;
    if (this.inputColegio) this.inputColegio.value = item.colegio;
    if (this.inputMunicipio) this.inputMunicipio.value = item.municipio;
    if (this.inputPrograma) this.inputPrograma.value = item.programa;

    this.renderPreview(item);

    // Disparar evento para verificación de estado del documento si ya está escrito
    const docInput = document.getElementById('quiz-input-doc');
    if (docInput && docInput.value.trim() && window.quizEngine) {
      docInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  renderPreview(item) {
    if (!this.previewContainer) return;

    this.previewContainer.innerHTML = `
      <div class="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 animate-fadeIn">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">✅</span>
          <span class="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Convenio Oficial Verificado:</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Institución Educativa:</span>
            <strong class="text-slate-800 dark:text-white">${item.colegio}</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Municipio / Sede:</span>
            <strong class="text-slate-800 dark:text-white">${item.municipio}</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Programa de Formación:</span>
            <strong class="text-emerald-700 dark:text-emerald-300">${item.programa}</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Ficha SENA Oficial:</span>
            <strong class="font-mono text-emerald-700 dark:text-emerald-300 text-sm font-black">${item.ficha}</strong>
            <span class="text-[10px] text-slate-500 ml-1">(${item.grado || '11'}°)</span>
          </div>
        </div>
      </div>
    `;
    this.previewContainer.classList.remove('hidden');
  }

  clearSync() {
    this.selectedItem = null;
    if (this.inputFicha) this.inputFicha.value = '';
    if (this.inputColegio) this.inputColegio.value = '';
    if (this.inputMunicipio) this.inputMunicipio.value = '';
    if (this.inputPrograma) this.inputPrograma.value = '';

    if (this.previewContainer) {
      this.previewContainer.innerHTML = '';
      this.previewContainer.classList.add('hidden');
    }
  }

  toggleManualMode() {
    this.manualMode = !this.manualMode;

    if (this.containerSelectores && this.containerManual) {
      if (this.manualMode) {
        this.containerSelectores.classList.add('hidden');
        this.containerManual.classList.remove('hidden');
        if (this.btnToggleManual) {
          this.btnToggleManual.innerHTML = '<span>📋 Usar Selector Oficial de Colegios</span>';
        }
      } else {
        this.containerSelectores.classList.remove('hidden');
        this.containerManual.classList.add('hidden');
        if (this.btnToggleManual) {
          this.btnToggleManual.innerHTML = '<span>✍️ ¿No encuentras tu colegio? Ingresar manualmente</span>';
        }
      }
    }
  }
}

// Instancia global
window.institucionesSelector = new InstitucionesSelector();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.institucionesSelector.init());
} else {
  window.institucionesSelector.init();
}
