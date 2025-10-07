<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <!-- Cerrar -->
      <button class="close-btn" @click="$emit('close')">×</button>

      <h2 v-if="mode==='usuarios'">Registrar Usuario</h2>
      <h2 v-else>Registrar Rol</h2>

      <!-- Pasos -->
      <div class="steps-indicator">
        <span :class="{ active: step === 1 }">1</span>
        <span :class="{ active: step === 2 }">2</span>
        <span :class="{ active: step === 3 }">3</span>
      </div>

      <!-- STEP 1 -->
      <div v-if="step === 1" class="step">
        <div class="step-body">
          <form @submit.prevent>
            <template v-if="mode==='usuarios'">
              <div class="form-group">
                <label for="usuario">Cédula / UserID</label>
                <input id="usuario" v-model="form.usuario" type="text" required />
              </div>
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input id="nombre" v-model="form.nombre" type="text" required />
              </div>
              <div class="form-group">
                <label for="correo">Correo</label>
                <input id="correo" v-model="form.correo" type="email" required />
              </div>
              <div class="form-group">
                <label for="password">Contraseña (opcional)</label>
                <div class="password-wrapper">
                  <input :type="showPassword?'text':'password'" id="password" v-model="form.contrasenia" />
                  <span class="toggle-password" @click="showPassword=!showPassword">
                    <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                  </span>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="form-group">
                <label for="nombreRol">Nombre del rol</label>
                <input id="nombreRol" v-model="form.nombre" type="text" required />
              </div>
              <div class="form-group">
                <label for="descripcion">Descripción</label>
                <input id="descripcion" v-model="form.descripcion" type="text" />
              </div>
            </template>
          </form>
        </div>

        <!-- acciones fijas -->
        <div class="actions actions-single">
          <button class="submit-btn" @click="goToStep(2)">Siguiente</button>
        </div>
      </div>

      <!-- STEP 2 -->
      <div v-else-if="step === 2" class="step">
        <div class="step-body">
          <form @submit.prevent>
            <template v-if="mode==='usuarios'">
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input id="telefono" v-model="form.telefono" type="text" />
              </div>
              <div class="form-group">
                <label for="rol">Rol</label>
                <select id="rol" v-model="form.rol" required>
                  <option value="" disabled>Selecciona…</option>
                  <option v-for="r in roles" :key="r.nombre" :value="r.nombre">{{ r.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="correoAlt">Correo alterno (opcional)</label>
                <input id="correoAlt" v-model="form.correoAlterno" type="email" />
              </div>
            </template>

            <template v-else>
              <div class="form-group">
                <label for="activo">Activo</label>
                <select id="activo" v-model="form.activo">
                  <option :value="true">Sí</option>
                  <option :value="false">No</option>
                </select>
              </div>
              <div class="form-group">
                <label for="matriz">Matriz de accesos (JSON/Notas)</label>
                <textarea id="matriz" v-model="form.matrizAcceso" rows="3" placeholder='{"modulo":"certificados","permisos":["ver","crear"]}'></textarea>
              </div>
            </template>
          </form>
        </div>

        <div class="actions">
          <button class="alt-btn" @click="goToStep(1)">Atrás</button>
          <button class="submit-btn" @click="goToStep(3)">Siguiente</button>
        </div>
      </div>

      <!-- STEP 3 -->
      <div v-else-if="step === 3" class="step">
        <div class="step-body">
          <div class="form-group">
            <label>Resumen</label>
            <textarea :value="mode==='usuarios' ? resumenUsuario : resumenRol" rows="5" disabled></textarea>
          </div>
        </div>

        <div class="actions">
          <button class="alt-btn" @click="goToStep(2)">Atrás</button>
          <button class="submit-btn" @click="submitForm">Registrar</button>
        </div>
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
    mode: { type: String, required: true }, // 'usuarios' | 'roles'
    roles: { type: Array, default: () => [] }
  },
  data() {
    return {
      step: 1,
      showPassword: false,
      form: this.mode === 'usuarios'
        ? { usuario: '', nombre: '', correo: '', contrasenia: '', telefono: '', rol: '', correoAlterno: '' }
        : { nombre: '', descripcion: '', activo: true, matrizAcceso: '' }
    }
  },
  computed: {
    resumenUsuario() {
      const f = this.form
      return `Usuario/CI: ${f.usuario}
Nombre: ${f.nombre}
Correo: ${f.correo}
Teléfono: ${f.telefono}
Rol: ${f.rol}`
    },
    resumenRol() {
      const f = this.form
      return `Rol: ${f.nombre}
Descripción: ${f.descripcion}
Activo: ${f.activo ? 'Sí' : 'No'}
Matriz: ${f.matrizAcceso || '(vacía)'}`
    }
  },
  methods: {
    goToStep(num) {
      if (num === 2 && this.step === 1) {
        if (this.mode === 'usuarios') {
          if (!this.form.usuario || !this.form.nombre || !this.form.correo) {
            swal.fire({ icon: 'warning', title: 'Completa los campos del paso 1.' })
            return
          }
        } else if (!this.form.nombre) {
          swal.fire({ icon: 'warning', title: 'Completa el nombre del rol.' })
          return
        }
      }
      if (num === 3 && this.step === 2) {
        if (this.mode === 'usuarios' && !this.form.rol) {
          swal.fire({ icon: 'warning', title: 'Selecciona un rol.' })
          return
        }
      }
      this.step = num
    },
    submitForm() {
      if (this.mode === 'usuarios') {
        const required = ['usuario', 'nombre', 'correo', 'rol']
        const missing = required.filter(k => !String(this.form[k] || '').trim())
        if (missing.length) {
          swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los obligatorios.' })
          return
        }
      } else if (!this.form.nombre) {
        swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'El nombre del rol es obligatorio.' })
        return
      }
      this.$emit('guardar', { ...this.form })
    }
  }
}
</script>

<style scoped>
/* Overlay */
.popup-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

/* Tarjeta */
.popup-content {
  background-color: white;
  border: 5px solid #63C7B2;
  padding: 18px 18px 10px;
  border-radius: 15px;
  position: relative;
  width: 420px;                /* un pelín más ancho para evitar cortes */
  max-height: 90vh;            /* más alto, con layout en columnas */
  display: flex;
  flex-direction: column;
}

.popup-content h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #263D42;
}

.close-btn {
  position: absolute; top: 10px; right: 12px;
  background: none; border: none; font-size: 20px; cursor: pointer; color: #263D42;
}

/* Pasos */
.steps-indicator {
  display: flex; justify-content: center; gap: 10px; margin: 6px 0 10px;
}
.steps-indicator span {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #63C7B2; color: #263D42; font-weight: 700;
  background: #CCDBDC;
}
.steps-indicator span.active { background: #63C7B2; color: #fff; border-color: #63C7B2; }

/* Step layout */
.step { display: flex; flex-direction: column; min-height: 0; }
.step-body {
  overflow-y: auto;
  padding-right: 4px;
  max-height: 100%;
}

/* Acciones pegadas abajo, fuera del scroll */
.actions {
  position: sticky;
  bottom: 0;
  background: #ffffff;
  padding-top: 8px;
  margin-top: 10px;
  display: flex; gap: 10px; justify-content: space-between;
  border-top: 1px solid #CCDBDC;
}
.actions-single { justify-content: center; }

/* Inputs */
.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 5px; color: #263D42; font-weight: 600; }
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%; padding: 10px;
  border: 1.5px solid #929292;
  border-radius: 15px;
  background: #fff;
}

/* Password toggle */
.password-wrapper { position: relative; display: flex; align-items: center; }
.password-wrapper input { width: 100%; padding-right: 34px; }
.toggle-password { position: absolute; right: 10px; cursor: pointer; color: #263D42; }

/* Botones (misma paleta que tu login) */
.submit-btn {
  flex: 1;
  padding: 10px; font-size: 16px;
  background-color: #63C7B2; color: white;
  border: none; border-radius: 15px; cursor: pointer;
}
.submit-btn:hover { background-color: #8E6C88; color: white; }

.alt-btn {
  flex: 1;
  padding: 10px; font-size: 16px;
  background-color: #CCDBDC; color: #333;
  border: none; border-radius: 15px; cursor: pointer;
}
.alt-btn:hover { background-color: #263D42; color: white; }

/* Responsive */
@media (max-width: 440px) {
  .popup-content { width: 92vw; }
}
</style>
