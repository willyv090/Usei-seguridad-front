<template>
  <div>
    <!-- Header -->
    <section class="header-master">
      <header>
        <NavBar userRole="Seguridad" />
      </header>
    </section>

    <div class="header-spacer"></div>

    <!-- Main Content -->
    <div class="risk-analysis-container">
      <div class="risk-header">
        <h1>📊 Módulo de Análisis de Riesgos</h1>
        <p class="subtitle">Gestión integral de riesgos de seguridad de información</p>
      </div>

      <!-- KRI Dashboard Section -->
      <section class="kri-dashboard">
        <h2>🎯 Indicadores Clave de Riesgo (KRI)</h2>
        <div class="kri-cards">
          <div 
            v-for="kri in indicadores" 
            :key="kri.idIndicador"
            class="kri-card"
            :class="getEstadoClass(kri.estadoActual)"
          >
            <div class="kri-header">
              <h3>{{ kri.nombre }}</h3>
              <span class="kri-badge" :class="getEstadoClass(kri.estadoActual)">
                {{ kri.estadoActual }}
              </span>
            </div>
            <div class="kri-body">
              <div class="kri-value">
                <span class="value">{{ kri.valorActual }}</span>
                <span class="unit">{{ kri.unidadMedida }}</span>
              </div>
              <div class="kri-thresholds">
                <div class="threshold">
                  <span class="label">⚠️ Advertencia:</span>
                  <span class="value">{{ kri.umbralAdvertencia }}</span>
                </div>
                <div class="threshold">
                  <span class="label">🚨 Crítico:</span>
                  <span class="value">{{ kri.umbralCritico }}</span>
                </div>
              </div>
              <p class="kri-description">{{ kri.descripcion }}</p>
              <div class="kri-footer">
                <span class="frequency">📅 {{ kri.frecuenciaMedicion }}</span>
                <button @click="actualizarKRI(kri)" class="btn-update">
                  Actualizar Valor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Risk Statistics -->
      <section class="statistics-section">
        <h2>📈 Estadísticas de Riesgos</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ estadisticas.totalRiesgos || 0 }}</div>
            <div class="stat-label">Total Riesgos</div>
          </div>
          <div class="stat-card critical">
            <div class="stat-icon">🔴</div>
            <div class="stat-value">{{ estadisticas.riesgosCriticos || 0 }}</div>
            <div class="stat-label">Críticos</div>
          </div>
          <div class="stat-card high">
            <div class="stat-icon">🟠</div>
            <div class="stat-value">{{ estadisticas.riesgosAltos || 0 }}</div>
            <div class="stat-label">Altos</div>
          </div>
          <div class="stat-card active">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">{{ estadisticas.riesgosActivos || 0 }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="mostrarFormularioRiesgo" class="btn-primary">
          ➕ Registrar Nuevo Riesgo
        </button>
        <button @click="toggleMostrarTabla" class="btn-secondary">
          {{ mostrarTabla ? '📋 Ocultar Tabla' : '📋 Ver Todos los Riesgos' }}
        </button>
      </div>

      <!-- Risk Registration Form -->
      <div v-if="mostrarFormulario" class="form-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editando ? '✏️ Editar Evento de Riesgo' : '➕ Registrar Nuevo Evento de Riesgo' }}</h2>
            <button @click="cerrarFormulario" class="btn-close">✖</button>
          </div>
          
          <form @submit.prevent="guardarRiesgo" class="risk-form">
            <!-- Basic Information -->
            <div class="form-section">
              <h3>Información Básica</h3>
              
              <div class="form-group">
                <label for="titulo">Título del Riesgo *</label>
                <input 
                  type="text" 
                  id="titulo" 
                  v-model="riesgoForm.titulo"
                  required
                  maxlength="200"
                  placeholder="Ej: Acceso No Autorizado por Fuerza Bruta"
                />
              </div>

              <div class="form-group">
                <label for="descripcion">Descripción Detallada *</label>
                <textarea 
                  id="descripcion" 
                  v-model="riesgoForm.descripcion"
                  required
                  rows="4"
                  placeholder="Describa el riesgo identificado en detalle..."
                ></textarea>
              </div>

              <div class="form-group">
                <label for="categoria">Categoría *</label>
                <select id="categoria" v-model="riesgoForm.categoria" required>
                  <option value="">Seleccione una categoría</option>
                  <option value="Seguridad de Datos">Seguridad de Datos</option>
                  <option value="Seguridad de Acceso">Seguridad de Acceso</option>
                  <option value="Gestión de Contraseñas">Gestión de Contraseñas</option>
                  <option value="Pérdida de Información">Pérdida de Información</option>
                  <option value="Cumplimiento Normativo">Cumplimiento Normativo</option>
                  <option value="Vulnerabilidad Técnica">Vulnerabilidad Técnica</option>
                </select>
              </div>
            </div>

            <!-- Risk Analysis -->
            <div class="form-section">
              <h3>Análisis de Riesgo</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="probabilidad">Probabilidad *</label>
                  <select id="probabilidad" v-model.number="riesgoForm.probabilidad" required>
                    <option value="">Seleccionar</option>
                    <option value="1">1 - Muy Baja</option>
                    <option value="2">2 - Baja</option>
                    <option value="3">3 - Media</option>
                    <option value="4">4 - Alta</option>
                    <option value="5">5 - Muy Alta</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="impacto">Impacto *</label>
                  <select id="impacto" v-model.number="riesgoForm.impacto" required>
                    <option value="">Seleccionar</option>
                    <option value="1">1 - Muy Bajo</option>
                    <option value="2">2 - Bajo</option>
                    <option value="3">3 - Medio</option>
                    <option value="4">4 - Alto</option>
                    <option value="5">5 - Muy Alto</option>
                  </select>
                </div>
              </div>

              <!-- Risk Level Preview -->
              <div v-if="riesgoForm.probabilidad && riesgoForm.impacto" class="risk-preview">
                <div class="preview-item">
                  <span class="label">Valor de Riesgo:</span>
                  <span class="value">{{ calcularValorRiesgo() }}</span>
                </div>
                <div class="preview-item">
                  <span class="label">Nivel de Riesgo:</span>
                  <span class="badge" :class="getNivelRiesgoClass()">
                    {{ calcularNivelRiesgo() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Consequences and Action Plan -->
            <div class="form-section">
              <h3>Consecuencias y Plan de Acción</h3>
              
              <div class="form-group">
                <label for="consecuencias">Consecuencias Potenciales *</label>
                <textarea 
                  id="consecuencias" 
                  v-model="riesgoForm.consecuencias"
                  required
                  rows="3"
                  placeholder="Describa las posibles consecuencias si este riesgo se materializa..."
                ></textarea>
              </div>

              <div class="form-group">
                <label for="planAccion">Plan de Acción / Mitigación *</label>
                <textarea 
                  id="planAccion" 
                  v-model="riesgoForm.planAccion"
                  required
                  rows="4"
                  placeholder="Describa las acciones a tomar para mitigar este riesgo..."
                ></textarea>
              </div>
            </div>

            <!-- Administrative Information -->
            <div class="form-section">
              <h3>Información Administrativa</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="fechaIdentificacion">Fecha de Identificación *</label>
                  <input 
                    type="date" 
                    id="fechaIdentificacion" 
                    v-model="riesgoForm.fechaIdentificacion"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="responsable">Responsable *</label>
                  <input 
                    type="text" 
                    id="responsable" 
                    v-model="riesgoForm.responsable"
                    required
                    maxlength="150"
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="estado">Estado *</label>
                <select id="estado" v-model="riesgoForm.estado" required>
                  <option value="Identificado">Identificado</option>
                  <option value="En Análisis">En Análisis</option>
                  <option value="En Mitigación">En Mitigación</option>
                  <option value="Controlado">Controlado</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" @click="cerrarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" class="btn-submit">
                {{ editando ? '💾 Actualizar Riesgo' : '✅ Registrar Riesgo' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Risks Table -->
      <div v-if="mostrarTabla" class="table-section">
        <h2>📋 Registro de Eventos de Riesgo</h2>
        
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Filtrar por Nivel:</label>
            <select v-model="filtroNivel" @change="aplicarFiltros">
              <option value="">Todos</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Filtrar por Estado:</label>
            <select v-model="filtroEstado" @change="aplicarFiltros">
              <option value="">Todos</option>
              <option value="Identificado">Identificado</option>
              <option value="En Análisis">En Análisis</option>
              <option value="En Mitigación">En Mitigación</option>
              <option value="Controlado">Controlado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="risk-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Probabilidad</th>
                <th>Impacto</th>
                <th>Nivel Riesgo</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="riesgo in riesgosFiltrados" :key="riesgo.idRiesgo">
                <td>{{ riesgo.idRiesgo }}</td>
                <td class="td-titulo">{{ riesgo.titulo }}</td>
                <td>{{ riesgo.categoria }}</td>
                <td>{{ riesgo.probabilidad }}</td>
                <td>{{ riesgo.impacto }}</td>
                <td>
                  <span class="badge" :class="getNivelClass(riesgo.nivelRiesgo)">
                    {{ riesgo.nivelRiesgo }}
                  </span>
                </td>
                <td>
                  <span class="estado-badge" :class="getEstadoBadgeClass(riesgo.estado)">
                    {{ riesgo.estado }}
                  </span>
                </td>
                <td>{{ riesgo.responsable }}</td>
                <td>{{ formatFecha(riesgo.fechaIdentificacion) }}</td>
                <td class="actions">
                  <button @click="verDetalles(riesgo)" class="btn-icon" title="Ver detalles">
                    👁️
                  </button>
                  <button @click="editarRiesgo(riesgo)" class="btn-icon" title="Editar">
                    ✏️
                  </button>
                  <button @click="eliminarRiesgo(riesgo.idRiesgo)" class="btn-icon danger" title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
              <tr v-if="riesgosFiltrados.length === 0">
                <td colspan="10" class="no-data">No hay riesgos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Risk Details Modal -->
      <div v-if="mostrarDetalles" class="details-modal">
        <div class="modal-content large">
          <div class="modal-header">
            <h2>📄 Detalles del Evento de Riesgo</h2>
            <button @click="cerrarDetalles" class="btn-close">✖</button>
          </div>
          
          <div class="details-body">
            <div class="detail-section">
              <h3>{{ riesgoSeleccionado.titulo }}</h3>
              <span class="badge large" :class="getNivelClass(riesgoSeleccionado.nivelRiesgo)">
                {{ riesgoSeleccionado.nivelRiesgo }}
              </span>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <strong>ID:</strong>
                <span>{{ riesgoSeleccionado.idRiesgo }}</span>
              </div>
              <div class="detail-item">
                <strong>Categoría:</strong>
                <span>{{ riesgoSeleccionado.categoria }}</span>
              </div>
              <div class="detail-item">
                <strong>Probabilidad:</strong>
                <span>{{ riesgoSeleccionado.probabilidad }} / 5</span>
              </div>
              <div class="detail-item">
                <strong>Impacto:</strong>
                <span>{{ riesgoSeleccionado.impacto }} / 5</span>
              </div>
              <div class="detail-item">
                <strong>Valor de Riesgo:</strong>
                <span>{{ riesgoSeleccionado.valorRiesgo }}</span>
              </div>
              <div class="detail-item">
                <strong>Estado:</strong>
                <span class="estado-badge" :class="getEstadoBadgeClass(riesgoSeleccionado.estado)">
                  {{ riesgoSeleccionado.estado }}
                </span>
              </div>
              <div class="detail-item">
                <strong>Responsable:</strong>
                <span>{{ riesgoSeleccionado.responsable }}</span>
              </div>
              <div class="detail-item">
                <strong>Fecha Identificación:</strong>
                <span>{{ formatFecha(riesgoSeleccionado.fechaIdentificacion) }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Descripción</h4>
              <p>{{ riesgoSeleccionado.descripcion }}</p>
            </div>

            <div class="detail-section">
              <h4>Consecuencias Potenciales</h4>
              <p>{{ riesgoSeleccionado.consecuencias }}</p>
            </div>

            <div class="detail-section">
              <h4>Plan de Acción</h4>
              <p>{{ riesgoSeleccionado.planAccion }}</p>
            </div>

            <div class="detail-footer">
              <p><strong>Registrado por:</strong> {{ riesgoSeleccionado.usuarioRegistro }}</p>
              <p><strong>Fecha de registro:</strong> {{ formatFechaHora(riesgoSeleccionado.fechaRegistro) }}</p>
              <p v-if="riesgoSeleccionado.fechaActualizacion">
                <strong>Última actualización:</strong> {{ formatFechaHora(riesgoSeleccionado.fechaActualizacion) }}
              </p>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="cerrarDetalles" class="btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import { protectedAxios as axios } from '@/axiosConfig';
import Swal from 'sweetalert2';
import { getBackendUrl } from '@/utils/backendDiscovery';

export default {
  name: 'AnalisisRiesgos',
  components: {
    NavBar
  },
  data() {
    return {
      baseURL: '',
      indicadores: [],
      riesgos: [],
      riesgosFiltrados: [],
      estadisticas: {},
      mostrarFormulario: false,
      mostrarTabla: false,
      mostrarDetalles: false,
      editando: false,
      riesgoSeleccionado: null,
      filtroNivel: '',
      filtroEstado: '',
      riesgoForm: {
        titulo: '',
        descripcion: '',
        categoria: '',
        probabilidad: null,
        impacto: null,
        consecuencias: '',
        planAccion: '',
        fechaIdentificacion: new Date().toISOString().split('T')[0],
        responsable: '',
        estado: 'Identificado',
        usuarioRegistro: localStorage.getItem('usuario') || 'SYSTEM'
      }
    };
  },
  async mounted() {
    this.baseURL = await getBackendUrl();
    axios.defaults.baseURL = this.baseURL;
    this.cargarDatos();
  },
  methods: {
    async cargarDatos() {
      await Promise.all([
        this.cargarIndicadores(),
        this.cargarRiesgos(),
        this.cargarEstadisticas()
      ]);
    },
    
    async cargarIndicadores() {
      try {
        const response = await axios.get('/api/indicadores');
        if (response.data && response.data.data) {
          this.indicadores = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar indicadores:', error);
        Swal.fire('Error', 'No se pudieron cargar los indicadores', 'error');
      }
    },
    
    async cargarRiesgos() {
      try {
        const response = await axios.get('/api/riesgos');
        if (response.data && response.data.data) {
          this.riesgos = response.data.data;
          this.riesgosFiltrados = this.riesgos;
        }
      } catch (error) {
        console.error('Error al cargar riesgos:', error);
        Swal.fire('Error', 'No se pudieron cargar los riesgos', 'error');
      }
    },
    
    async cargarEstadisticas() {
      try {
        const response = await axios.get('/api/riesgos/estadisticas');
        if (response.data && response.data.data) {
          this.estadisticas = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    },
    
    async actualizarKRI(kri) {
      const { value: nuevoValor } = await Swal.fire({
        title: `Actualizar ${kri.nombre}`,
        input: 'number',
        inputLabel: `Nuevo valor (${kri.unidadMedida})`,
        inputValue: kri.valorActual,
        inputAttributes: {
          min: 0,
          step: 0.01
        },
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar'
      });

      if (nuevoValor !== undefined) {
        try {
          await axios.patch(`/api/indicadores/${kri.idIndicador}/valor`, parseFloat(nuevoValor), {
            headers: { 'Content-Type': 'application/json' }
          });
          
          Swal.fire('¡Actualizado!', 'El valor del KRI ha sido actualizado', 'success');
          await this.cargarIndicadores();
        } catch (error) {
          console.error('Error al actualizar KRI:', error);
          Swal.fire('Error', 'No se pudo actualizar el valor del KRI', 'error');
        }
      }
    },
    
    mostrarFormularioRiesgo() {
      this.editando = false;
      this.resetearFormulario();
      this.riesgoForm.usuarioRegistro = localStorage.getItem('usuario') || localStorage.getItem('nombre') || 'Sistema';
      this.mostrarFormulario = true;
    },
    
    cerrarFormulario() {
      this.mostrarFormulario = false;
      this.resetearFormulario();
    },
    
    resetearFormulario() {
      this.riesgoForm = {
        titulo: '',
        descripcion: '',
        categoria: '',
        probabilidad: null,
        impacto: null,
        consecuencias: '',
        planAccion: '',
        fechaIdentificacion: new Date().toISOString().split('T')[0],
        responsable: '',
        estado: 'Identificado',
        usuarioRegistro: localStorage.getItem('usuario') || localStorage.getItem('nombre') || 'Sistema'
      };
    },
    
    async guardarRiesgo() {
      try {
        if (this.editando) {
          await axios.put(`/api/riesgos/${this.riesgoForm.idRiesgo}`, this.riesgoForm);
          Swal.fire('¡Actualizado!', 'El riesgo ha sido actualizado exitosamente', 'success');
        } else {
          await axios.post('/api/riesgos', this.riesgoForm);
          Swal.fire('¡Registrado!', 'El riesgo ha sido registrado exitosamente', 'success');
        }
        
        this.cerrarFormulario();
        await this.cargarDatos();
      } catch (error) {
        console.error('Error al guardar riesgo:', error);
        Swal.fire('Error', 'No se pudo guardar el riesgo', 'error');
      }
    },
    
    editarRiesgo(riesgo) {
      this.editando = true;
      this.riesgoForm = { ...riesgo };
      this.mostrarFormulario = true;
    },
    
    async eliminarRiesgo(idRiesgo) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/riesgos/${idRiesgo}`);
          Swal.fire('¡Eliminado!', 'El riesgo ha sido eliminado', 'success');
          await this.cargarDatos();
        } catch (error) {
          console.error('Error al eliminar riesgo:', error);
          Swal.fire('Error', 'No se pudo eliminar el riesgo', 'error');
        }
      }
    },
    
    verDetalles(riesgo) {
      this.riesgoSeleccionado = riesgo;
      this.mostrarDetalles = true;
    },
    
    cerrarDetalles() {
      this.mostrarDetalles = false;
      this.riesgoSeleccionado = null;
    },
    
    toggleMostrarTabla() {
      this.mostrarTabla = !this.mostrarTabla;
    },
    
    aplicarFiltros() {
      this.riesgosFiltrados = this.riesgos.filter(riesgo => {
        const coincideNivel = !this.filtroNivel || riesgo.nivelRiesgo === this.filtroNivel;
        const coincideEstado = !this.filtroEstado || riesgo.estado === this.filtroEstado;
        return coincideNivel && coincideEstado;
      });
    },
    
    calcularValorRiesgo() {
      return this.riesgoForm.probabilidad * this.riesgoForm.impacto;
    },
    
    calcularNivelRiesgo() {
      const valor = this.calcularValorRiesgo();
      if (valor >= 20) return 'Crítico';
      if (valor >= 13) return 'Alto';
      if (valor >= 7) return 'Medio';
      return 'Bajo';
    },
    
    getNivelRiesgoClass() {
      const nivel = this.calcularNivelRiesgo();
      return {
        'critico': nivel === 'Crítico',
        'alto': nivel === 'Alto',
        'medio': nivel === 'Medio',
        'bajo': nivel === 'Bajo'
      };
    },
    
    getNivelClass(nivel) {
      return {
        'critico': nivel === 'Crítico',
        'alto': nivel === 'Alto',
        'medio': nivel === 'Medio',
        'bajo': nivel === 'Bajo'
      };
    },
    
    getEstadoClass(estado) {
      return {
        'estado-critico': estado === 'Crítico',
        'estado-advertencia': estado === 'Advertencia',
        'estado-normal': estado === 'Normal'
      };
    },
    
    getEstadoBadgeClass(estado) {
      return {
        'estado-identificado': estado === 'Identificado',
        'estado-analisis': estado === 'En Análisis',
        'estado-mitigacion': estado === 'En Mitigación',
        'estado-controlado': estado === 'Controlado',
        'estado-cerrado': estado === 'Cerrado'
      };
    },
    
    formatFecha(fecha) {
      if (!fecha) return '';
      return new Date(fecha).toLocaleDateString('es-ES');
    },
    
    formatFechaHora(fechaHora) {
      if (!fechaHora) return '';
      return new Date(fechaHora).toLocaleString('es-ES');
    }
  }
};
</script>

<style scoped>
.header-spacer {
  height: 80px;
}

.risk-analysis-container {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.risk-header {
  text-align: center;
  margin-bottom: 2rem;
}

.risk-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* KRI Dashboard */
.kri-dashboard {
  margin-bottom: 2rem;
}

.kri-dashboard h2 {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 1rem;
}

.kri-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kri-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #3498db;
  transition: transform 0.2s;
}

.kri-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.kri-card.estado-advertencia {
  border-left-color: #f39c12;
}

.kri-card.estado-critico {
  border-left-color: #e74c3c;
}

.kri-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.kri-header h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  flex: 1;
  margin-right: 1rem;
}

.kri-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.kri-badge.estado-normal {
  background: #d4edda;
  color: #155724;
}

.kri-badge.estado-advertencia {
  background: #fff3cd;
  color: #856404;
}

.kri-badge.estado-critico {
  background: #f8d7da;
  color: #721c24;
}

.kri-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.kri-value .unit {
  font-size: 1rem;
  color: #7f8c8d;
  margin-left: 0.5rem;
}

.kri-thresholds {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.threshold {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.threshold .label {
  font-size: 0.85rem;
  color: #6c757d;
}

.threshold .value {
  font-weight: 600;
  color: #2c3e50;
}

.kri-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.kri-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.frequency {
  font-size: 0.9rem;
  color: #6c757d;
}

.btn-update {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.btn-update:hover {
  background: #2980b9;
}

/* Statistics */
.statistics-section {
  margin-bottom: 2rem;
}

.statistics-section h2 {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-card.critical {
  border-top: 4px solid #e74c3c;
}

.stat-card.high {
  border-top: 4px solid #f39c12;
}

.stat-card.active {
  border-top: 4px solid #3498db;
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

/* Modal Styles */
.form-modal,
.details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content.large {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.modal-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #e74c3c;
}

/* Form Styles */
.risk-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #34495e;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.risk-preview {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-top: 1rem;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-item .label {
  font-weight: 600;
  color: #6c757d;
}

.preview-item .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.badge.large {
  padding: 0.6rem 1.2rem;
  font-size: 1.1rem;
}

.badge.critico {
  background: #e74c3c;
  color: white;
}

.badge.alto {
  background: #f39c12;
  color: white;
}

.badge.medio {
  background: #f1c40f;
  color: #2c3e50;
}

.badge.bajo {
  background: #2ecc71;
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #ecf0f1;
}

.btn-cancel,
.btn-submit {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-submit {
  background: #27ae60;
  color: white;
}

.btn-submit:hover {
  background: #229954;
}

/* Table Styles */
.table-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.table-section h2 {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
}

.table-responsive {
  overflow-x: auto;
}

.risk-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.risk-table thead {
  background: #34495e;
  color: white;
}

.risk-table th,
.risk-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.risk-table th {
  font-weight: 600;
}

.risk-table tbody tr:hover {
  background: #f8f9fa;
}

.td-titulo {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.estado-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.estado-badge.estado-identificado {
  background: #d6eaf8;
  color: #1b4f72;
}

.estado-badge.estado-analisis {
  background: #fef5e7;
  color: #7d6608;
}

.estado-badge.estado-mitigacion {
  background: #fdebd0;
  color: #8e562e;
}

.estado-badge.estado-controlado {
  background: #d4edda;
  color: #155724;
}

.estado-badge.estado-cerrado {
  background: #e2e3e5;
  color: #383d41;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0.3rem;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.btn-icon.danger:hover {
  filter: brightness(1.5);
}

.no-data {
  text-align: center;
  padding: 2rem !important;
  color: #7f8c8d;
  font-style: italic;
}

/* Details Modal */
.details-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.detail-section h4 {
  color: #34495e;
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.detail-section p {
  color: #6c757d;
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-item strong {
  color: #34495e;
  font-size: 0.9rem;
}

.detail-item span {
  color: #2c3e50;
  font-weight: 500;
}

.detail-footer {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.detail-footer p {
  margin: 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.modal-actions {
  padding: 1rem 1.5rem;
  border-top: 2px solid #ecf0f1;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .kri-cards {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
  
  .risk-table {
    font-size: 0.8rem;
  }
  
  .risk-table th,
  .risk-table td {
    padding: 0.5rem;
  }
}
</style>
