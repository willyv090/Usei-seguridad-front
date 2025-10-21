<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content" :class="{ 'wide-mode': step === 2 && mode === 'roles' }">
      <!-- Botón cerrar -->
      <button class="close-btn" @click="$emit('close')" title="Cerrar">×</button>

      <h2 v-if="isEditAccessMode">Editar Accesos</h2>
      <h2 v-else-if="mode==='usuarios'">Registrar Usuario</h2>
      <h2 v-else>Registrar Rol</h2>


      <!-- Stepper -->
      <div class="stepper">
        <div v-if="!isEditAccessMode" class="stepper">
        <div v-for="n in 3" :key="n" class="stepper-step" :class="{ active: step >= n }">
          <div class="circle">{{ n }}</div>
          <div v-if="n < 3" class="line"></div>
      </div>
      </div>
      </div>
      <!-- Contenedor con scroll interno -->
      <div class="popup-body">
        <!-- STEP 1 -->
        <div v-if="step === 1" class="step">
          <form @submit.prevent>
            <template v-if="mode==='usuarios'">
              <div class="form-group">
                <label for="ci">Cédula de Identidad</label>
                <input id="ci" v-model="form.ci" type="text" required />
              </div>

              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input id="nombre" v-model="form.nombre" type="text" required />
              </div>

              <div class="form-group">
                <label for="apellido">Apellido</label>
                <input id="apellido" v-model="form.apellido" type="text" required />
              </div>

              <div class="form-group">
                <label for="correo">Correo</label>
                <input id="correo" v-model="form.correo" type="email" required />
              </div>
            </template>

            <template v-else>
              <div class="form-group">
                <label for="nombreRol">Nombre del rol</label>
                <input id="nombreRol" v-model="form.nombreRol" type="text" required />
              </div>
              <div class="form-group">
                <label for="activo">Activo</label>
                <select id="activo" v-model="form.activo">
                  <option :value="true">Sí</option>
                  <option :value="false">No</option>
                </select>
              </div>
            </template>
          </form>
        </div>

        <!-- STEP 2 -->
        <div v-else-if="step === 2" class="step step-scrollable">
          <form @submit.prevent>
            <template v-if="mode==='usuarios'">
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input id="telefono" v-model="form.telefono" type="text" />
              </div>

              <div class="form-group">
                <label for="carrera">Carrera</label>
                <select id="carrera" v-model="form.carrera" required>
                  <option disabled value="">Selecciona una carrera…</option>
                  <option v-for="c in carreras" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="rol">Rol</label>
                <select id="rol" v-model="form.idRol" required>
                  <option value="" disabled>Selecciona un rol…</option>
                  <option v-for="r in roles" :key="r.idRol" :value="r.idRol">{{ r.nombreRol }}</option>
                </select>
              </div>
            </template>

            <template v-else>
              <div class="form-group">
                <label class="titulo-accesos">Accesos (módulos disponibles)</label>
                <div v-for="(mods, grupo) in modulos" :key="grupo" class="modulo-group">
                  <h4>{{ capitalize(grupo) }}</h4>
                  <div class="modulo-grid">
                    <div
                      v-for="mod in mods"
                      :key="grupo + '-' + mod"
                      class="modulo-item"
                      :class="{ selected: form.accesos.includes(grupo + ':' + mod) }"
                      @click="toggleAcceso(grupo, mod)"
                      @dblclick="removeAcceso(grupo, mod)"
                    >
                      <i v-if="form.accesos.includes(grupo + ':' + mod)" class="fas fa-check-square"></i>
                      <i v-else class="far fa-square"></i>
                      <span>{{ mod }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </form>
        </div>

        <!-- STEP 3 -->
        <div v-else-if="step === 3" class="step">
          <div class="form-group">
            <label>Resumen</label>
            <textarea :value="mode==='usuarios' ? resumenUsuario : resumenRol" rows="6" disabled></textarea>
          </div>
        </div>
      </div>

      <!-- Botones SIEMPRE visibles -->
      <div class="actions" v-if="!isEditAccessMode">
          <button v-if="step > 1" class="alt-btn" @click="goToStep(step - 1)">Atrás</button>
          <button
            class="submit-btn"
            @click="step === 3 ? submitForm() : goToStep(step + 1)"
          >
            {{ step === 3 ? 'Registrar' : 'Siguiente' }}
          </button>
        </div>

        <!-- Botones para el popup solo para modo edición de la columna accesos -->
        <div class="actions" v-else>
          <button class="submit-btn small-btn" @click="submitForm()">Aceptar</button>
        </div>


    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
const swal = Swal.mixin({
  confirmButtonColor: '#80CED7',
  cancelButtonColor: '#8E6C88',
  confirmButtonText: 'Aceptar',
});

export default {
  name: 'NuevoItemPopup',
  emits: ['close', 'guardar'],
  props: {
    mode: String,
    roles: Array,
    carreras: Array,
    initialData: {
      type: Object,
      default: null
    },
    isEditAccessMode: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      step: 1,
      showPassword: false,

      // 🔹 Formulario base (depende del modo)
      form: this.mode === 'usuarios'
        ? {
            ci: '',
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            carrera: '',
            idRol: ''
          }
        : {
            idRol: null,
            nombreRol: '',
            activo: true,
            accesos: []
          },

      modulos: {
        estudiante: [
          'Encuesta de Graduación',
          'Certificados',
          'Soporte/Ayuda',
          'Estado del Proceso'
        ],
        administrador: [
          'Estudiantes',
          'Encuesta de Graduación',
          'Certificados',
          'Editar Encuesta',
          'Editar Certificado',
          'Reportes',
          'Datos',
          'Noticias/Anuncios',
          'Soporte/Ayuda',
          'Estudiantes Registrados',
          'Plazos'
        ],
        director: ['Reportes', 'Seguimiento de estudiantes', 'Soporte/Ayuda'],
        seguridad: ['Gestión de usuarios y roles', 'Gestión de contraseñas']
      }
    };
  },
  computed: {
    resumenUsuario() {
      const f = this.form
      return `CI: ${f.ci}
      Nombre completo: ${f.nombre} ${f.apellido}
      Correo: ${f.correo}
      Teléfono: ${f.telefono}
      Carrera: ${f.carrera}
      Rol asignado: ${f.idRol}`
    },
    resumenRol() {
      const f = this.form
      return `Rol: ${f.nombreRol}
        Activo: ${f.activo ? 'Sí' : 'No'}
        Accesos: ${f.accesos.length ? f.accesos.map(a => a.split(':')[1]).join(', ') : '(sin accesos)'}` 
    }
  },
  created() {
      // Si se pasa un rol existente (modo edición)
      if (this.initialData && this.mode === 'roles') {
        this.form = {
          idRol: this.initialData.idRol,
          nombreRol: this.initialData.nombreRol,
          activo: this.initialData.activo,
          accesos: Array.isArray(this.initialData.accesos)
            ? [...this.initialData.accesos]
            : (this.initialData.accesos?.split(',') || [])
        };

        if (this.isEditAccessMode) {
          this.step = 2;
        }
      }
    },

  methods: {
    capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1) },
    toggleAcceso(grupo, mod) {
      const key = `${grupo}:${mod}`
      if (!this.form.accesos.includes(key)) this.form.accesos.push(key)
    },
    removeAcceso(grupo, mod) {
      const key = `${grupo}:${mod}`
      this.form.accesos = this.form.accesos.filter(m => m !== key)
    },
    goToStep(num) {
      if (num === 2 && this.step === 1) {
        if (this.mode === 'usuarios') {
          if (!this.form.ci || !this.form.nombre || !this.form.apellido || !this.form.correo) {
            return swal.fire({ icon: 'warning', title: 'Completa los campos del paso 1.' });
          }
        } else if (this.mode === 'roles') {
          if (!this.form.nombreRol || !this.form.nombreRol.trim()) {
            return swal.fire({ icon: 'warning', title: 'El nombre del rol es obligatorio.' });
          }
        }
      }
      this.step = num;
    },

    submitForm() {
      if (this.mode === 'usuarios') {
        const required = ['ci', 'nombre', 'apellido', 'correo', 'idRol'];
        if (required.some(k => !String(this.form[k] || '').trim())) {
          return swal.fire({ icon: 'warning', title: 'Completa todos los obligatorios.' });
        }
      }

      // Emitir evento de guardado
      this.$emit('guardar', { ...this.form });

      // 🔹 Cerrar el popup automáticamente tras guardar
      this.$emit('close');
    },


  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

/* Popup principal */
.popup-content {
  background-color: white;
  border: 5px solid #63C7B2;
  border-radius: 15px;
  padding: 18px;
  position: relative;
  width: 520px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}
.popup-content.wide-mode { width: 950px; }

/* Stepper */
.stepper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 20px;
}
.stepper-step { display: flex; align-items: center; position: relative; }
.circle {
  width: 30px; height: 30px; border-radius: 50%;
  background: #CCDBDC; color: #263D42;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  transition: all 0.3s ease;
}
.stepper-step.active .circle { background: #63C7B2; color: white; }
.line {
  width: 80px; height: 4px; background: #CCDBDC; margin: 0 8px; border-radius: 2px;
}
.stepper-step.active + .stepper-step .line { background: #63C7B2; }

/* Cuerpo con scroll */
.popup-body {
  overflow-y: auto;
  padding-right: 6px;
  margin-bottom: 10px;
}
/* Botón Aceptar más pequeño en modo edición de accesos */

.small-btn {
  margin-right: 10px;
  min-width: 110px;
}


/* Botones fijos */
/* Botones fijos */
.actions {
  display: flex;
  justify-content: flex-end; /* 🔹 ahora alinea el botón a la derecha */
  padding: 10px;
  background: white;
  border-top: 1px solid #CCDBDC;
  position: sticky;
  bottom: 0;
}
.actions button {
  flex: 0 0 auto; /* 🔹 no crecer ni ocupar todo el espacio */
  padding: 8px 22px;
  font-size: 15px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.submit-btn { background-color: #63C7B2; color: white; }
.submit-btn:hover { background-color: #8E6C88; }
.alt-btn { background-color: #CCDBDC; color: #333; }
.alt-btn:hover { background-color: #263D42; color: white; }

/* Formularios */
.form-group { margin-bottom: 10px; }
.form-group label { display: block; margin-bottom: 5px; color: #263D42; font-weight: 600; }
input, select, textarea {
  width: 100%; padding: 8px;
  border: 1.5px solid #929292; border-radius: 10px;
}

/* Accesos */
.titulo-accesos { font-weight: 700; color: #263D42; margin-bottom: 10px; }
.modulo-group { margin-bottom: 10px; }
.modulo-group h4 { margin-bottom: 6px; color: #263D42; font-weight: 700; }
.modulo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
}
.modulo-item {
  border: 1.5px solid #63C7B2;
  border-radius: 10px;
  padding: 6px 8px;
  background: #F8F9F9;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.modulo-item i { font-size: 14px; }
.modulo-item.selected {
  background-color: #63C7B2;
  color: white;
  border-color: #63C7B2;
}
.modulo-item:hover { background-color: #CCDBDC; }

.close-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  color: #263D42;
  transition: color 0.2s ease, transform 0.2s ease;
}
.close-btn:hover {
  color: #8E6C88;
  transform: scale(1.2);
}

</style>
