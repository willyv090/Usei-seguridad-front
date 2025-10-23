<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="correo">Correo</label>
          <input type="email" id="correo" v-model="correo" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
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

        <!-- Mostrar mensaje de error si falta algún campo -->
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <!-- Contenedor para el CAPTCHA -->
        <div id="captcha-element" class="captcha-wrapper"></div>



        <div class="form-group">
          <a href="#" @click.prevent="$emit('switch-to-code-verification')">Olvidé mi contraseña</a>
        </div>
        <button type="submit" class="submit-btn">Ingresar</button>
      </form>

    </div>
  </div>
</template>
  
<script>
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';  
import { BASE_URL } from '@/config/globals';

export default {
  name: 'LoginPopup',
  data() {
    return {
      correo: '',    // Correo para el inicio de sesión
      password: '',  // Contraseña
      errorMessage: '',  // Variable para el mensaje de error
      showPassword: false, // Controla la visibilidad de la contraseña
      captchaToken: '', 


    };
  },
  setup() {
    const router = useRouter(); // Para utilizar el enrutador de Vue
    return { router };
  },
  mounted() {
    // Cargar dinámicamente el script de Google reCAPTCHA
    const scriptId = 'recaptcha-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => this.renderCaptcha();
      document.head.appendChild(script);
    } else {
      this.renderCaptcha();
    }
  },
  methods: {
    // Renderizar el CAPTCHA
    renderCaptcha() {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.render('captcha-element', {
            sitekey: '6LfqqPMrAAAAADBBWCoAgKzGxnSy-TZ7vkFm87uR', // tu clave pública
            callback: this.onCaptchaSuccess,
            'expired-callback': this.onCaptchaExpired,
          });
        });
      }
    },

    //  Al completar el captcha
    onCaptchaSuccess(token) {
      this.captchaToken = token;
      console.log(' CAPTCHA completado:', token);
    },

    // Si expira el captcha
    onCaptchaExpired() {
      this.captchaToken = '';
      console.warn(' CAPTCHA expirado, vuelve a verificar.');
    },

    async handleSubmit() {
      // Validar que ambos campos estén llenos
      if (!this.correo || !this.password) {
        this.errorMessage = ''; // Reiniciar el mensaje de error
        // Usar SweetAlert para mostrar el mensaje
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos',
          text: 'Por favor, complete ambos campos.',
          confirmButtonText: 'Aceptar',
        });
        return; // No continuar con la solicitud
      }
       // Validar que el CAPTCHA esté completo
      if (!this.captchaToken) {
        Swal.fire({
          icon: 'warning',
          title: 'Verificación requerida',
          text: 'Por favor, confirma que no eres un robot.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      try {
        const response = await this.$publicAxios.post(`${BASE_URL}/auth/login`, {
          correo: this.correo,
          contrasena: this.password,
          captchaToken: this.captchaToken, //  Enviar token al backend
        });
        
        console.log('Respuesta del servidor:', response.data);

        // Manejar respuesta exitosa
        if (response.data.status === "200 OK") {
          const { token, expiresIn, data } = response.data;
          console.log('Inicio de sesión correcto');
          console.log('ID del usuario:', data.id_usuario);

          // Guardar el token en localStorage
          localStorage.setItem('authToken', token);

          console.log(expiresIn);

          // Guardar otros datos en localStorage
          localStorage.setItem('id_usuario', data.id_usuario);
          localStorage.setItem('ci', data.ci);
          localStorage.setItem('correo', data.correo);
          localStorage.setItem('nombre', data.nombre);
          localStorage.setItem('rol', data.rol);
          localStorage.setItem('cambio_contrasenia', data.cambio_contrasenia);
          const accesos = data.accesos || response.data.accesos || [];
          localStorage.setItem('accesos', JSON.stringify(accesos));
          console.log('Accesos guardados:', accesos);



          if (data.carrera) {
            localStorage.setItem('carrera', data.carrera);
            console.log('Carrera guardada correctamente:', data.carrera);
          } else {
            console.warn('El backend no proporcionó la carrera del usuario.');
          }

          // Usar SweetAlert para mostrar éxito
          Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión correcto',
          text: `Bienvenido/a, ${data.nombre}`,
          confirmButtonText: 'Continuar',
        }).then(() => {
          this.$router.push({ name: 'menuUsuario' }); // Redirige a vista unificada
        });

        }
      } catch (error) {
        if (error.response && error.response.data.status === "403 Forbidden") {
          Swal.fire({
            icon: 'error',
            title: 'Captcha inválido',
            text: 'Por favor, vuelve a verificar que no eres un robot.',
          });
          if (window.grecaptcha) window.grecaptcha.reset();
          this.captchaToken = '';
          return;
        }
        // Manejar respuesta no exitosa
        if (error.response && error.response.data.status === "401 Unauthorized") {
          // Usar SweetAlert para mostrar error de credenciales incorrectas
          Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: error.response.data.error || 'Por favor, verifique sus credenciales.',
            confirmButtonText: 'Aceptar',
          });
        } else {
          // Usar SweetAlert para otros errores
          Swal.fire({
            icon: 'error',
            title: 'Error en el inicio de sesión',
            text: 'Ha ocurrido un error inesperado, intente nuevamente más tarde.',
            confirmButtonText: 'Aceptar',
          });
        }
      }
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
    goToEnProgreso(){
      this.$router.push('/en-progreso');
    }
  }
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
  background-color: #63C7B2;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 17px;
}

.submit-btn:hover {
  background-color: #8E6C88;
  color: white;
}

.register-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 10px;
  background-color: #CCDBDC;
  color: #333;
}

.register-btn:hover {
  background-color: #263D42;
  color: white;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}

/* Nuevo botón estilo */
.role-btn {
  width: 100%;
  padding: 10px;
  background-color: #63C7B2;  /* Mismo color que el botón de "Ingresar" */
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 17px;
}

.role-btn:hover {
  background-color: #8E6C88;
  color: white;
}

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

/* Estilos para el contenedor del CAPTCHA */
.captcha-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  min-height: 78px;
}

.captcha-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
}

/* Ajustes responsive para el captcha */
@media (max-width: 400px) {
  .popup-content {
    width: 300px;
  }
  
  .captcha-container {
    transform: scale(0.9);
    transform-origin: center;
  }
}

</style>


