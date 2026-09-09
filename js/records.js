/**
 * GESTOR DE REGISTROS, REPORTES Y CERTIFICADOS SENA
 * Administra el panel de calificaciones por ficha, exportaciones y certificados imprimibles.
 */

class RecordsManager {
  constructor() {
    this.records = [];
    this.filteredRecords = [];
    this.currentFilterFicha = 'ALL';
    this.currentFilterMunicipio = 'ALL';
    this.currentFilterColegio = 'ALL';
    this.currentFilterPrograma = 'ALL';
    this.currentFilterGrado = 'ALL';
    this.currentFilterSofia = 'ALL';
    this.currentSearch = '';
    this.currentSource = 'local';
  }

  async loadRecords() {
    const listElem = document.getElementById('records-table-body');
    const badgeElem = document.getElementById('records-source-badge');

    if (listElem) {
      listElem.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-8 text-slate-500">
            <div class="inline-flex items-center gap-2">
              <span class="animate-spin text-xl">⏳</span> Cargando evaluaciones...
            </div>
          </td>
        </tr>
      `;
    }

    try {
      const result = await window.SupabaseManager.fetchEvaluations();
      this.records = result.records || [];
      this.currentSource = result.source;

      if (badgeElem) {
        if (this.currentSource === 'supabase') {
          badgeElem.innerHTML = '🟢 Conectado a Supabase (En la nube)';
          badgeElem.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5';
        } else {
          badgeElem.innerHTML = '💾 Modo Local (LocalStorage)';
          badgeElem.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5';
        }
      }

      this.populateFichaDropdown();
      this.populateMunicipioDropdown();
      this.populateColegioDropdown();
      this.populateProgramaDropdown();
      this.applyFilters();
      this.updateStats();
    } catch (e) {
      console.error('Error cargando registros:', e);
    }
  }

  populateFichaDropdown() {
    const select = document.getElementById('records-filter-ficha');
    if (!select) return;

    const fichas = Array.from(new Set(this.records.map(r => String(r.ficha).trim()).filter(Boolean)));
    fichas.sort();

    select.innerHTML = `
      <option value="ALL">Todas las Fichas (${this.records.length})</option>
      ${fichas.map(f => `<option value="${f}">Ficha: ${f}</option>`).join('')}
    `;

    if (fichas.includes(this.currentFilterFicha)) {
      select.value = this.currentFilterFicha;
    } else {
      this.currentFilterFicha = 'ALL';
      select.value = 'ALL';
    }
  }

  populateMunicipioDropdown() {
    const select = document.getElementById('records-filter-municipio');
    if (!select) return;

    const municipios = Array.from(new Set(this.records.map(r => String(r.municipio || '').trim()).filter(Boolean)));
    municipios.sort((a, b) => a.localeCompare(b, 'es'));

    select.innerHTML = `
      <option value="ALL">Todos los Municipios (${this.records.length})</option>
      ${municipios.map(m => `<option value="${m}">${m}</option>`).join('')}
    `;

    if (municipios.includes(this.currentFilterMunicipio)) {
      select.value = this.currentFilterMunicipio;
    } else {
      this.currentFilterMunicipio = 'ALL';
      select.value = 'ALL';
    }
  }

  populateColegioDropdown() {
    const select = document.getElementById('records-filter-colegio');
    if (!select) return;

    const colegios = Array.from(new Set(this.records.map(r => String(r.colegio || '').trim()).filter(Boolean)));
    colegios.sort((a, b) => a.localeCompare(b, 'es'));

    select.innerHTML = `
      <option value="ALL">Todos los Colegios (${this.records.length})</option>
      ${colegios.map(c => `<option value="${c}">${c}</option>`).join('')}
    `;

    if (colegios.includes(this.currentFilterColegio)) {
      select.value = this.currentFilterColegio;
    } else {
      this.currentFilterColegio = 'ALL';
      select.value = 'ALL';
    }
  }

  populateProgramaDropdown() {
    const select = document.getElementById('records-filter-programa');
    if (!select) return;

    const programas = Array.from(new Set(this.records.map(r => String(r.programa || '').trim()).filter(Boolean)));
    programas.sort((a, b) => a.localeCompare(b, 'es'));

    select.innerHTML = `
      <option value="ALL">Todos los Programas (${this.records.length})</option>
      ${programas.map(p => `<option value="${p}">${p}</option>`).join('')}
    `;

    if (programas.includes(this.currentFilterPrograma)) {
      select.value = this.currentFilterPrograma;
    } else {
      this.currentFilterPrograma = 'ALL';
      select.value = 'ALL';
    }
  }

  setFichaFilter(ficha) {
    this.currentFilterFicha = ficha;
    this.applyFilters();
  }

  setMunicipioFilter(municipio) {
    this.currentFilterMunicipio = municipio || 'ALL';
    this.applyFilters();
  }

  setColegioFilter(colegio) {
    this.currentFilterColegio = colegio || 'ALL';
    this.applyFilters();
  }

  setProgramaFilter(programa) {
    this.currentFilterPrograma = programa || 'ALL';
    this.applyFilters();
  }

  setGradoFilter(grado) {
    this.currentFilterGrado = grado || 'ALL';
    this.applyFilters();
  }

  setSofiaFilter(sofiaFilter) {
    this.currentFilterSofia = sofiaFilter || 'ALL';
    this.applyFilters();
  }

  setSearchFilter(term) {
    this.currentSearch = (term || '').toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredRecords = this.records.filter(r => {
      const matchFicha = this.currentFilterFicha === 'ALL' || String(r.ficha).trim() === this.currentFilterFicha;
      const matchMunicipio = this.currentFilterMunicipio === 'ALL' || String(r.municipio || '').trim() === this.currentFilterMunicipio;
      const matchColegio = this.currentFilterColegio === 'ALL' || String(r.colegio || '').trim() === this.currentFilterColegio;
      const matchPrograma = this.currentFilterPrograma === 'ALL' || String(r.programa || '').trim() === this.currentFilterPrograma;
      const matchGrado = this.currentFilterGrado === 'ALL' || String(r.grado || '').trim() === this.currentFilterGrado;
      const matchSearch = !this.currentSearch || 
        (r.nombre && r.nombre.toLowerCase().includes(this.currentSearch)) ||
        (r.documento && r.documento.toLowerCase().includes(this.currentSearch)) ||
        (r.ficha && String(r.ficha).includes(this.currentSearch)) ||
        (r.colegio && r.colegio.toLowerCase().includes(this.currentSearch)) ||
        (r.municipio && r.municipio.toLowerCase().includes(this.currentSearch)) ||
        (r.programa && r.programa.toLowerCase().includes(this.currentSearch));
      const matchSofia = this.currentFilterSofia === 'ALL' ||
        (this.currentFilterSofia === 'CALIFICADO' && !!r.calificado_sofia) ||
        (this.currentFilterSofia === 'PENDIENTE' && !r.calificado_sofia);

      return matchFicha && matchMunicipio && matchColegio && matchPrograma && matchGrado && matchSearch && matchSofia;
    });

    this.renderTable();
    this.updateStats();
  }

  updateStats() {
    const totalElem = document.getElementById('stat-total-evaluaciones');
    const aprobadosElem = document.getElementById('stat-total-aprobados');
    const sofiaElem = document.getElementById('stat-total-sofia');
    const promedioElem = document.getElementById('stat-promedio-porcentaje');
    const tasaElem = document.getElementById('stat-tasa-aprobacion');

    const total = this.filteredRecords.length;
    const aprobados = this.filteredRecords.filter(r => r.aprobado).length;
    const totalSofia = this.filteredRecords.filter(r => r.calificado_sofia).length;
    const sumaPorcentajes = this.filteredRecords.reduce((acc, r) => acc + (Number(r.porcentaje) || 0), 0);
    const promedio = total > 0 ? Math.round(sumaPorcentajes / total) : 0;
    const tasa = total > 0 ? Math.round((aprobados / total) * 100) : 0;

    if (totalElem) totalElem.textContent = total;
    if (aprobadosElem) aprobadosElem.textContent = `${aprobados} / ${total}`;
    if (sofiaElem) sofiaElem.textContent = `${totalSofia} / ${total}`;
    if (promedioElem) promedioElem.textContent = `${promedio}%`;
    if (tasaElem) tasaElem.textContent = `${tasa}%`;
  }

  renderTable() {
    const tbody = document.getElementById('records-table-body');
    if (!tbody) return;

    if (this.filteredRecords.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-12 text-slate-400">
            <div class="flex flex-col items-center justify-center gap-2">
              <span class="text-3xl">📋</span>
              <p class="font-medium text-sm">No se encontraron evaluaciones registradas con los filtros actuales.</p>
              <button onclick="window.app.navigateTo('quiz')" class="mt-2 text-xs font-bold text-emerald-600 hover:underline">
                Realizar una evaluación ahora →
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredRecords.map((r, i) => `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
        <td class="py-3.5 px-4 font-mono text-xs text-slate-400 font-medium">${i + 1}</td>
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800 dark:text-white text-sm">${r.nombre}</div>
          ${r.documento ? `<div class="text-xs text-slate-400 font-mono">ID: ${r.documento}</div>` : ''}
        </td>
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800 dark:text-white text-xs leading-tight">${r.colegio || 'Institución en Convenio'}</div>
          <div class="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            ${r.grado ? `<span class="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-bold">${r.grado}</span>` : ''}
            ${r.municipio ? `<span class="text-slate-400 font-normal">📍 ${r.municipio}</span>` : ''}
          </div>
          ${r.programa ? `<div class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">💻 ${r.programa}</div>` : ''}
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
            ${r.ficha}
          </span>
        </td>
        <td class="py-3.5 px-4 text-center">
          <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-xs">
            Intento ${r.intento || 1}/2
          </span>
        </td>
        <td class="py-3.5 px-4 text-center">
          <span class="font-bold text-sm text-slate-700 dark:text-slate-300">${r.puntaje} / ${r.totalPreguntas || 10}</span>
          <div class="text-xs text-slate-400 font-medium">${r.porcentaje}%</div>
        </td>
        <td class="py-3.5 px-4 text-center">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            r.aprobado 
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
          }">
            <span>${r.aprobado ? '✓' : '✗'}</span> ${r.aprobado ? 'Aprobado' : 'No Aprobado'}
          </span>
        </td>
        <td class="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
          <div>${r.fecha || 'Reciente'}</div>
          ${r.tiempo ? `<div class="text-slate-400 font-mono">⏱ ${r.tiempo}</div>` : ''}
        </td>
        <td class="py-3.5 px-4 text-center">
          <div class="inline-flex flex-col items-center justify-center gap-1">
            <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
              r.calificado_sofia 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }" title="${r.calificado_sofia ? `Calificado por: ${r.calificado_sofia_por || 'Instructor'}. Clic para desmarcar.` : 'Clic para marcar como calificado en SOFIA PLUS'}">
              <input 
                type="checkbox" 
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                ${r.calificado_sofia ? 'checked' : ''} 
                onchange="window.recordsManager.toggleSofiaStatus('${r.id}')"
              />
              <span>${r.calificado_sofia ? 'Calificado' : 'Sin calificar'}</span>
            </label>
            ${r.calificado_sofia && r.calificado_sofia_por ? `
              <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center leading-tight">
                <span>👤 ${r.calificado_sofia_por}</span>
                ${r.calificado_sofia_fecha ? `<div class="text-[9px] text-slate-400 font-mono">${r.calificado_sofia_fecha}</div>` : ''}
              </div>
            ` : ''}
          </div>
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="inline-flex items-center gap-1.5 justify-end">
            ${r.aprobado ? `
              <button 
                onclick="window.recordsManager.showCertificateById('${r.id}')"
                class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1"
                title="Ver Certificado"
              >
                <span>📜</span> <span>Certificado</span>
              </button>
            ` : `
              <span 
                class="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700/60 cursor-not-allowed"
                title="Evaluación no aprobada (< 70%): No se genera certificado"
              >
                <span>🚫</span> <span class="hidden sm:inline">Sin Certificado</span>
              </span>
            `}
            <button 
              onclick="window.recordsManager.deleteRecord('${r.id}', '${(r.nombre || '').replace(/'/g, "\\'")}')"
              class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition border border-rose-200 dark:border-rose-800/60 flex items-center gap-1 hover:scale-105 active:scale-95"
              title="Eliminar Evaluación"
            >
              <span>🗑️</span> <span class="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Alternar estado de calificación en SOFIA PLUS (registrado por el instructor autenticado)
  async toggleSofiaStatus(id) {
    const record = this.records.find(r => String(r.id) === String(id));
    if (!record) return;

    // Verificar si el instructor está autenticado
    if (!window.authManager || !window.authManager.isAuthenticated()) {
      if (window.app && window.app.showToast) {
        window.app.showToast('🔒 Debes iniciar sesión como Instructor o Coordinador para calificar.', 'warning');
      }
      if (window.authManager) window.authManager.openAuthModal('records');
      this.renderTable();
      return;
    }

    const currentUser = window.authManager.getCurrentUser();
    const instructorName = currentUser ? (currentUser.role || 'Instructor del Área') : 'Instructor del Área';
    const fechaActual = new Date().toLocaleString('es-CO');

    const newStatus = !record.calificado_sofia;
    record.calificado_sofia = newStatus;
    record.calificado_sofia_por = newStatus ? instructorName : '';
    record.calificado_sofia_fecha = newStatus ? fechaActual : '';

    // Actualizar también en lista filtrada
    const filtered = this.filteredRecords.find(r => String(r.id) === String(id));
    if (filtered) {
      filtered.calificado_sofia = newStatus;
      filtered.calificado_sofia_por = record.calificado_sofia_por;
      filtered.calificado_sofia_fecha = record.calificado_sofia_fecha;
    }

    this.renderTable();
    this.updateStats();

    if (window.soundEngine) window.soundEngine.playClick();

    try {
      const res = await window.SupabaseManager.updateEvaluationSofiaStatus(id, newStatus, instructorName, fechaActual);
      if (window.app && window.app.showToast) {
        if (res && !res.success && res.error) {
          window.app.showToast(`⚠️ Guardado local. Supabase rechazó (falta política UPDATE): ${res.error}`, 'warning');
        } else if (newStatus) {
          window.app.showToast(`✅ ${record.nombre}: Guardado en Supabase (Calificado por ${instructorName})`, 'success');
        } else {
          window.app.showToast(`⏳ ${record.nombre}: Guardado en Supabase (Sin calificar)`, 'info');
        }
      }
    } catch (e) {
      console.error('Error al actualizar estado en SOFIA:', e);
    }
  }

  async deleteRecord(id, apprenticeName) {
    const cleanName = apprenticeName || 'este aprendiz';
    const confirmed = confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente la evaluación de:\n\n👤 ${cleanName}?\n\nEsta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      const deleteResult = await window.SupabaseManager.deleteEvaluation(id);

      if (deleteResult && !deleteResult.success && deleteResult.error) {
        alert(
          `⚠️ ATENCIÓN SUPABASE (RLS):\n\n` +
          `El registro se eliminó de tu vista local, pero Supabase rechazó la eliminación en la nube.\n\n` +
          `Error: ${deleteResult.error}\n\n` +
          `Causa común: Falta la política DELETE en Supabase.\n` +
          `Solución: En tu panel de Supabase > SQL Editor, ejecuta:\n\n` +
          `CREATE POLICY "Permitir eliminacion anonima articulada" ON public.evaluaciones_articulada FOR DELETE TO anon, authenticated USING (true);`
        );
      }

      // Actualizar listas locales en memoria
      this.records = this.records.filter(r => String(r.id) !== String(id));
      this.filteredRecords = this.filteredRecords.filter(r => String(r.id) !== String(id));

      this.populateFichaDropdown();
      this.populateColegioDropdown();
      this.renderTable();
      this.updateStats();

      if (window.app && window.app.showToast) {
        if (deleteResult && deleteResult.source === 'supabase' && deleteResult.success) {
          window.app.showToast(`🗑️ Registro de ${cleanName} eliminado permanentemente de Supabase.`, 'success');
        } else {
          window.app.showToast(`🗑️ Registro de ${cleanName} eliminado localmente.`, 'info');
        }
      }
      if (window.soundEngine) window.soundEngine.playClick();
    } catch (err) {
      console.error('Error al eliminar registro:', err);
      alert('Ocurrió un error al eliminar el registro: ' + err.message);
    }
  }

  showCertificateById(id) {
    const record = this.records.find(r => String(r.id) === String(id));
    if (record) {
      this.showCertificate(record);
    }
  }

  showCertificate(record) {
    if (!record) return;

    // Validación estricta: NO se genera certificado si no aprobó (>= 70%)
    if (!record.aprobado) {
      alert('⚠️ No es posible generar ni visualizar una constancia de aprobación para una evaluación no aprobada (calificación inferior al 70%).');
      return;
    }

    this.currentCertificateRecord = record;

    const modal = document.getElementById('certificate-modal');
    const certContent = document.getElementById('certificate-content');
    if (!modal || !certContent) return;

    const certDate = record.fecha || new Date().toLocaleDateString('es-CO');
    const certCode = 'SENA-DDHH-' + (record.id ? String(record.id).slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000));

    certContent.innerHTML = `
      <div id="printable-certificate" class="relative p-8 md:p-12 rounded-3xl bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-8 border-double border-emerald-600 dark:border-emerald-500 shadow-2xl text-center overflow-hidden">
        
        <!-- Marca de agua decorativa -->
        <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <!-- Encabezado Institucional con Logo Oficial del SENA -->
        <div class="flex items-center justify-between gap-4 border-b-2 border-emerald-500/30 pb-6 mb-6">
          <div class="text-left flex items-center gap-3.5">
            <img src="sena-logo.png" alt="Logo SENA" class="w-14 h-14 object-contain bg-white rounded-xl p-1 shadow border border-emerald-500/20">
            <div>
              <span class="text-xs md:text-sm font-black tracking-widest text-emerald-800 dark:text-emerald-400 uppercase block">Servicio Nacional de Aprendizaje</span>
              <p class="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Regional Boyacá - Centro Industrial de Mantenimiento y Manufactura CIMM</p>
            </div>
          </div>
          <div class="text-right font-mono text-xs text-slate-500">
            <span class="block text-[10px] uppercase font-bold text-slate-400">Código de Verificación:</span>
            <span class="font-bold text-emerald-700 dark:text-emerald-400">${certCode}</span>
          </div>
        </div>

        <span class="inline-block px-5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase tracking-widest mb-4 border border-emerald-500/20 shadow-sm">
          CONSTANCIA DE CURSO
        </span>

        <h1 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">
          DERECHOS FUNDAMENTALES EN EL TRABAJO
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
          Competencia: <strong>210201501</strong> - Ejercer Derechos fundamentales en el marco de la Constitución política y los convenios internacionales.
        </p>

        <p class="text-sm text-slate-600 dark:text-slate-300 italic mb-2">
          Hace constar que el aprendiz(a):
        </p>

        <h2 class="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-400 uppercase underline decoration-emerald-400 decoration-wavy underline-offset-8 mb-4">
          ${record.nombre}
        </h2>

        <!-- Mención de Articulación y Colegio -->
        <div class="flex flex-col items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-500/10 dark:bg-slate-800 border border-emerald-500/25 text-xs font-semibold mb-6 max-w-xl mx-auto text-emerald-900 dark:text-emerald-300 shadow-sm">
          <div>
            <span>🏫</span> En articulación con: <strong>${record.colegio || 'Institución Educativa en Convenio'}</strong> ${record.grado ? `• Grado ${record.grado}` : ''} ${record.municipio ? `• ${record.municipio}` : ''}
          </div>
          ${record.programa ? `
            <div class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-lg border border-emerald-500/20">
              💻 Programa de Formación Técnica: ${record.programa}
            </div>
          ` : ''}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-2xl mx-auto p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 mb-6 text-xs">
          <div>
            <span class="text-slate-400 font-bold block uppercase text-[10px]">No. de Ficha:</span>
            <strong class="text-slate-800 dark:text-white text-sm font-mono">${record.ficha}</strong>
          </div>
          <div>
            <span class="text-slate-400 font-bold block uppercase text-[10px]">Documento / T.I.:</span>
            <strong class="text-slate-800 dark:text-white text-sm font-mono">${record.documento || 'No reg.'}</strong>
          </div>
          <div>
            <span class="text-slate-400 font-bold block uppercase text-[10px]">Grado:</span>
            <strong class="text-emerald-700 dark:text-emerald-400 text-sm font-bold">${record.grado || 'Media'}</strong>
          </div>
          <div>
            <span class="text-slate-400 font-bold block uppercase text-[10px]">Intento:</span>
            <strong class="text-slate-800 dark:text-white text-sm font-mono">${record.intento || 1} de 2</strong>
          </div>
          <div>
            <span class="text-slate-400 font-bold block uppercase text-[10px]">Calificación:</span>
            <strong class="text-emerald-600 dark:text-emerald-400 text-sm font-bold">${record.porcentaje}% (${record.puntaje}/${record.totalPreguntas || 10})</strong>
          </div>
        </div>

        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 border ${
          record.calificado_sofia 
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
        }">
          <span>${record.calificado_sofia ? '✓ Reportado en SOFIA PLUS' : '⏳ Pendiente Registro en SOFIA PLUS'}</span>
        </div>

        <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
          Aprobó satisfactoriamente la evaluación de conocimientos sobre Derechos Humanos, Declaración Universal de 1948, Clasificación de Derechos y los Artículos 25 y 53 de la Constitución Política de Colombia en articulación con la educación media.
        </p>

        <!-- Pie de Constancia con Sello SENA Aprobado -->
        <div class="flex items-center justify-between gap-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-left">
          <div class="w-1/3">
            <p class="font-bold text-slate-700 dark:text-slate-300 text-xs">Instructor Evaluador</p>
            <p class="text-[10px] text-slate-400">Regional Boyacá - CIMM</p>
          </div>

          <div class="text-center w-1/3 flex justify-center">
            <div class="inline-flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-emerald-600 text-emerald-600 font-black text-[8px] rotate-[-8deg] tracking-tighter leading-none p-1 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm">
              <img src="sena-logo.png" alt="SENA" class="w-5 h-5 object-contain mb-0.5">
              <span>SENA</span>
              <span class="text-[7px] text-emerald-700 font-bold">APROBADO</span>
            </div>
          </div>

          <div class="text-right text-[10px] text-slate-500 w-1/3">
            <span class="block font-bold text-slate-700 dark:text-slate-300">Fecha de Emisión:</span>
            <span>${certDate}</span>
          </div>
        </div>

      </div>
    `;

    modal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeCertificate() {
    const modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.add('hidden');
  }

  printCertificate() {
    const originalTitle = document.title;
    const currentRec = this.currentCertificateRecord || window.currentEvaluationResult;
    if (currentRec && currentRec.nombre) {
      const cleanName = (currentRec.nombre || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanDoc = (currentRec.documento || '').replace(/[^a-zA-Z0-9]/g, '_');
      document.title = `Certificado_SENA_DDHH_${cleanName}_${cleanDoc}`;
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }

  // Exportar a Excel (CSV con UTF-8 BOM)
  exportToCSV() {
    if (this.records.length === 0) {
      alert('No hay evaluaciones disponibles para exportar.');
      return;
    }

    const headers = ['ID', 'Estudiante / Aprendiz', 'Documento', 'No. Ficha', 'Institución Educativa', 'Municipio', 'Programa de Formación', 'Grado', 'Intento', 'Puntaje', 'Total Preguntas', 'Porcentaje', 'Estado', 'Calificado SOFIA PLUS', 'Calificado Por', 'Fecha Calificación SOFIA', 'Tiempo', 'Fecha'];
    const rows = this.filteredRecords.map(r => [
      `"${r.id || ''}"`,
      `"${(r.nombre || '').replace(/"/g, '""')}"`,
      `"${r.documento || ''}"`,
      `"${r.ficha || ''}"`,
      `"${(r.colegio || '').replace(/"/g, '""')}"`,
      `"${(r.municipio || '').replace(/"/g, '""')}"`,
      `"${(r.programa || '').replace(/"/g, '""')}"`,
      `"${r.grado || ''}"`,
      r.intento || 1,
      r.puntaje,
      r.totalPreguntas || 10,
      `${r.porcentaje}%`,
      r.aprobado ? 'Aprobado' : 'No Aprobado',
      r.calificado_sofia ? 'SÍ' : 'NO',
      `"${(r.calificado_sofia_por || '').replace(/"/g, '""')}"`,
      `"${r.calificado_sofia_fecha || ''}"`,
      `"${r.tiempo || ''}"`,
      `"${r.fecha || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    const colegioSlug = this.currentFilterColegio !== 'ALL' ? this.currentFilterColegio.replace(/[^a-zA-Z0-9]/g, '_') : 'Todos';
    link.setAttribute('download', `SENA_Articulada_Evaluaciones_${colegioSlug}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar a JSON
  exportToJSON() {
    if (this.records.length === 0) {
      alert('No hay evaluaciones disponibles para exportar.');
      return;
    }
    const blob = new Blob([JSON.stringify(this.filteredRecords, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SENA_Articulada_Evaluaciones_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.recordsManager = new RecordsManager();
