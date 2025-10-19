<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      <h2>Iniciar sesión como Admin / Director</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="text" id="email" v-model="loginRequest.correo" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="loginRequest.contrasena"
              required
            >
            <button
              type="button"
              class="toggle-password-btn"
              @click="showPassword = !showPassword"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>
        <div class="form-group">
          <a href="#" @click.prevent="$emit('switch-to-code-verification')">Olvidé mi contraseña</a>
        </div>
        <button type="submit" class="submit-btn">Ingresar</button>
      </form>

      <!-- Botón para volver al login de estudiante -->
      <button class="role-btn" @click="$emit('switch-to-student-login')">Estudiante</button>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';  // Importar SweetAlert
import { BASE_URL } from '@/config/globals';

export default {
  name: 'AdminLoginPopup',
  data() {
    return {
      loginRequest: {
        correo: '', // Correo para la autenticación
        contrasena: '' // Contraseña para la autenticación
      },
      message: '', // Variable para almacenar mensajes de error
      showPassword: false // Controla la visibilidad de la contraseña
    };
  },
  methods: {
    async login() {
      try {
        const response = await this.$publicAxios.post(`${BASE_URL}/usuario/login`, this.loginRequest);

        // Verifica si el inicio de sesión fue exitoso
        if (response.data.status === '200 OK') {
          const token = response.data.token;
          const userData = response.data.data;

          // Almacenar el token y los datos del usuario en el localStorage
          localStorage.setItem('authToken', token);
          localStorage.setItem('id_usuario', userData.id_usuario);
          localStorage.setItem('correo', userData.correo);
          localStorage.setItem('usuario', userData.usuario);
          localStorage.setItem('nombre', userData.nombre);
          localStorage.setItem('rol', userData.rol);
          localStorage.setItem('carrera', userData.carrera);

          console.log('Inicio de sesión correcto. ID del usuario:', userData.id_usuario);

          // Mostrar un mensaje de éxito con SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión correcto',
            text: `Bienvenido/a ${userData.nombre}`,
            confirmButtonText: 'Continuar',
          }).then(() => {
            // Redirigir según el rol obtenido
            if (userData.rol === 'Administrador') {
              this.$router.push({ name: 'menuAdministrador' });
            } else if (userData.rol === 'Director') {
              this.$router.push({ name: 'menuDirector' });
            } else {
              this.message = 'Rol no reconocido';
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: this.message,
                confirmButtonText: 'Aceptar',
              });
            }
          });
        }
      } catch (error) {
        // Manejar respuesta no exitosa
        if (error.response && error.response.data && error.response.data.error) {
          this.message = error.response.data.error; // Mensaje de error del backend
        } else {
          this.message = 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        }
        // Mostrar mensaje de error con SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: this.message,
          confirmButtonText: 'Aceptar',
        });
      }
    },
    handleSubmit() {
      // Validar que ambos campos estén llenos
      if (!this.loginRequest.correo || !this.loginRequest.contrasena) {
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos',
          text: 'Por favor, complete ambos campos.',
          confirmButtonText: 'Aceptar',
        });
        return; // No continuar con la solicitud si hay campos vacíos
      }
      this.login(); // Ejecutar la función de login
    },
    forgotPassword() {
      // Implementar lógica de recuperación de contraseña
      Swal.fire({
        icon: 'info',
        title: 'Recuperar contraseña',
        text: 'Para recuperar tu contraseña, contacta a soporte.',
        confirmButtonText: 'Aceptar',
      });
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content h2 {
  text-align: center; 
  margin-bottom: 10px; 
}

.popup-content {
  background-color: white;
  border: 5px solid #63C7B2; 
  padding: 20px;
  border-radius: 15px;
  position: relative;
  width: 350px;
  z-index: 1001;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #929292;
  border-radius: 15px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: #8E6C88; /* Color diferente para distinguir */
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 17px;
}

.submit-btn:hover {
  background-color: #63C7B2;
  color: white;
}

.role-btn {
  width: 100%;
  padding: 10px;
  background-color: #8E6C88;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 17px;
}

.role-btn:hover {
  background-color: #63C7B2;
  color: white;
}
</style>

/* Estilos para el botón de mostrar/ocultar contraseña (igual que ChangePasswordPopup) */
.password-input-container {
  position: relative;
  width: 100%;
}
.password-input-container input {
  width: 100%;
  padding: 8px;
  padding-right: 40px;
  border-radius: 15px;
  border: 1px solid #929292;
  background: #f0f6ff;
  box-sizing: border-box;
}
.toggle-password-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}
.toggle-password-btn:hover {
  opacity: 0.7;
}

