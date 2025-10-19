<template>
    <div class="popup-overlay" @click.self="$emit('close')">
      <div class="popup-content">
        <button class="close-btn" @click="$emit('close')">&times;</button>
        <h2>Cambiar Contraseña</h2>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
              <div class="password-input-container">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="newPassword" 
                  v-model="newPassword" 
                  @input="checkPasswordStrength"
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
            
              <!-- Indicador de complejidad de contraseña -->
              <div v-if="newPassword" class="password-strength-container">
                <div class="password-strength-bar">
                  <div 
                    class="password-strength-fill" 
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <p class="password-strength-text" :class="passwordStrength.class">
                  Complejidad: {{ passwordStrength.text }}
                </p>
              </div>

              <!-- Instrucciones de contraseña segura -->
              <div class="password-requirements">
                <p class="requirements-title">La contraseña debe contener:</p>
                <ul>
                  <li :class="{ 'requirement-met': validations.minLength }">
                    <span class="requirement-icon">{{ validations.minLength ? '✓' : '✗' }}</span>
                    Mínimo 12 caracteres
                  </li>
                  <li :class="{ 'requirement-met': validations.hasUpperCase }">
                    <span class="requirement-icon">{{ validations.hasUpperCase ? '✓' : '✗' }}</span>
                    Al menos una letra mayúscula
                  </li>
                  <li :class="{ 'requirement-met': validations.hasLowerCase }">
                    <span class="requirement-icon">{{ validations.hasLowerCase ? '✓' : '✗' }}</span>
                    Al menos una letra minúscula
                  </li>
                  <li :class="{ 'requirement-met': validations.hasNumber }">
                    <span class="requirement-icon">{{ validations.hasNumber ? '✓' : '✗' }}</span>
                    Al menos un número
                  </li>
                  <li :class="{ 'requirement-met': validations.hasSpecialChar }">
                    <span class="requirement-icon">{{ validations.hasSpecialChar ? '✓' : '✗' }}</span>
                Al menos un carácter especial (@$!%*?&amp;#)
                  </li>
                  <li :class="{ 'requirement-met': validations.noSequential }">
                    <span class="requirement-icon">{{ validations.noSequential ? '✓' : '✗' }}</span>
                    Sin números secuenciales (ej: 123, 987)
                  </li>
                </ul>
              </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
              <div class="password-input-container">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  id="confirmPassword" 
                  v-model="confirmPassword" 
                  required
                >
                <button 
                  type="button" 
                  class="toggle-password-btn" 
                  @click="showConfirmPassword = !showConfirmPassword"
                  :title="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <span v-if="showConfirmPassword">👁️</span>
                  <span v-else>👁️‍🗨️</span>
                </button>
              </div>
          </div>
  
          <!-- Mostrar mensaje de error si las contraseñas no coinciden -->
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  
            <button type="submit" class="submit-btn" :disabled="!isPasswordValid">Cambiar Contraseña</button>
          <h2></h2>
        </form>
        <button class="role-btn" @click="$emit('switch-to-student-login')">Cancelar</button>
      </div>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2';  // Utiliza SweetAlert para mensajes
  import { BASE_URL } from '@/config/globals';
  
  export default {
    name: 'ChangePasswordPopup',
    data() {
      return {
        newPassword: '',      // Nueva contraseña
        confirmPassword: '',  // Confirmar nueva contraseña
        errorMessage: '',      // Mensaje de error
        selectedRole: localStorage.getItem('selectedRole'), // Obtener rol almacenado
          showPassword: false,  // Mostrar/ocultar nueva contraseña
          showConfirmPassword: false,  // Mostrar/ocultar confirmación de contraseña
          validations: {
            minLength: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumber: false,
            hasSpecialChar: false,
            noSequential: false
          },
          passwordStrength: {
            percentage: 0,
            text: 'Muy débil',
            class: 'very-weak'
          }
      };
    },
      computed: {
        isPasswordValid() {
          return Object.values(this.validations).every(v => v === true);
        }
      },
    methods: {
        checkPasswordStrength() {
          const password = this.newPassword;
        
          // Validar longitud mínima (12 caracteres)
          this.validations.minLength = password.length >= 12;
        
          // Validar mayúsculas
          this.validations.hasUpperCase = /[A-Z]/.test(password);
        
          // Validar minúsculas
          this.validations.hasLowerCase = /[a-z]/.test(password);
        
          // Validar números
          this.validations.hasNumber = /\d/.test(password);
        
          // Validar caracteres especiales
          this.validations.hasSpecialChar = /[@$!%*?&#]/.test(password);
        
          // Validar que no tenga números secuenciales
          this.validations.noSequential = !this.hasSequentialNumbers(password);
        
          // Calcular complejidad
          this.calculatePasswordStrength();
        },
      
        hasSequentialNumbers(password) {
          // Detectar secuencias ascendentes (123, 234, etc.)
          for (let i = 0; i < password.length - 2; i++) {
            const char1 = password.charCodeAt(i);
            const char2 = password.charCodeAt(i + 1);
            const char3 = password.charCodeAt(i + 2);
          
            // Verificar si son números consecutivos
            if (char1 >= 48 && char1 <= 57 && // 0-9
                char2 === char1 + 1 && 
                char3 === char2 + 1) {
              return true;
            }
          
            // Verificar secuencias descendentes (987, 876, etc.)
            if (char1 >= 48 && char1 <= 57 && 
                char2 === char1 - 1 && 
                char3 === char2 - 1) {
              return true;
            }
          }
          return false;
        },
      
        calculatePasswordStrength() {
          const validCount = Object.values(this.validations).filter(v => v === true).length;
          const totalValidations = Object.keys(this.validations).length;
        
          // Calcular porcentaje basado en validaciones cumplidas
          const percentage = (validCount / totalValidations) * 100;
        
          // Determinar nivel de complejidad
          if (percentage < 40) {
            this.passwordStrength = {
              percentage: percentage,
              text: 'Muy débil',
              class: 'very-weak'
            };
          } else if (percentage < 60) {
            this.passwordStrength = {
              percentage: percentage,
              text: 'Débil',
              class: 'weak'
            };
          } else if (percentage < 80) {
            this.passwordStrength = {
              percentage: percentage,
              text: 'Media',
              class: 'medium'
            };
          } else if (percentage < 100) {
            this.passwordStrength = {
              percentage: percentage,
              text: 'Fuerte',
              class: 'strong'
            };
          } else {
            this.passwordStrength = {
              percentage: 100,
              text: 'Muy fuerte',
              class: 'very-strong'
            };
          }
        },
      
      async handleChangePassword() {
        // Verificar que las contraseñas coincidan
        if (this.newPassword !== this.confirmPassword) {
          this.errorMessage = 'Las contraseñas no coinciden.';
          return;
        }
  
          // Verificar que todas las validaciones se cumplan
          if (!this.isPasswordValid) {
            this.errorMessage = 'La contraseña no cumple con todos los requisitos de seguridad.';
          return;
        }

        // Resetear mensaje de error
        this.errorMessage = '';
  
        try {
          if (this.selectedRole === 'Director') {
            const idDirector = localStorage.getItem('idDirectorCorreo');
            await this.$publicAxios.put(`${BASE_URL}/usuario/change-password?idUsuario=${idDirector}`, {
              newPassword: this.newPassword
            });
          } else if (this.selectedRole === 'Estudiante') {
            // Obtener el idEstudiante desde localStorage
            const idEstudiante = localStorage.getItem('idEstudianteCorreo');
            // Llamada al backend para cambiar la contraseña
            await this.$publicAxios.put(`${BASE_URL}/estudiante/change-password?idEstudiante=${idEstudiante}`, {
              newPassword: this.newPassword
            });

            const notification = {
              titulo: "Cambio de contraseña exitosa",
              contenido: "Se realizo el cambio de contraseña exitosamente. Si no deseo realizar el cambio de contraseña, contactese con Soporte Técnico",
              fecha: new Date().toISOString(), // Fecha actual
              estadoNotificacion: false, // Estado inicial como no leído
              estudianteIdEstudiante: { idEstudiante: idEstudiante }, // ID del estudiante corregido
              tipoNotificacionIdNotificacion: { idNotificacion: 1 } // Tipo de notificación por defecto
            };

            // Enviar la notificación
            await this.$publicAxios.post(`${BASE_URL}/notificacion`, notification);
          }
  
          // Manejar respuesta exitosa
          Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: 'Tu contraseña ha sido cambiada correctamente.',
            confirmButtonText: 'Aceptar',
          });
  
          // Cerrar el popup
          this.$emit('close');
        } catch (error) {
          // Manejar errores
          Swal.fire({
            icon: 'error',
            title: 'Error al cambiar la contraseña',
            text: 'Ha ocurrido un error, por favor intenta nuevamente.',
            confirmButtonText: 'Aceptar',
          });
        }
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
  
  .popup-content {
    background-color: white;
    padding: 20px;
    border-radius: 15px;
    width: 350px;
    z-index: 1001;
    position: relative;
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
  
    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-container input {
    width: 100%;
    padding: 8px;
      padding-right: 40px;
    border-radius: 5px;
      border: 1px solid #ccc;
    }

    .toggle-password-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-password-btn:hover {
      opacity: 0.7;
  }
  
  .submit-btn {
    width: 100%;
    padding: 10px;
    background-color: #63c7b2;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 5px;
      transition: background-color 0.3s;
    }

    .submit-btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
  }
  
  .submit-btn:hover {
    background-color: #8e6c88;
  }
  
    .submit-btn:disabled:hover {
      background-color: #ccc;
    }

    .password-strength-container {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .password-strength-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .password-strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-radius: 4px;
    }

    .password-strength-text {
      font-size: 13px;
      font-weight: bold;
      margin: 0;
      text-align: center;
    }

    .very-weak {
      background-color: #dc3545;
      color: #fff;
    }

    .weak {
      background-color: #fd7e14;
      color: #fff;
    }

    .medium {
      background-color: #ffc107;
      color: #fff;
    }

    .strong {
      background-color: #20c997;
      color: #fff;
    }

    .very-strong {
      background-color: #28a745;
      color: #fff;
    }

  .password-requirements {
      font-size: 13px;
    color: #666;
      margin-top: 10px;
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
    }

    .requirements-title {
      margin: 0 0 8px 0;
      font-weight: bold;
      font-size: 14px;
      color: #333;
  }

  .password-requirements ul {
    list-style-type: disc;
      padding-left: 0;
      margin: 0;
  }

  .password-requirements li {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      transition: color 0.3s;
    }

    .requirement-icon {
      display: inline-block;
      width: 20px;
      margin-right: 8px;
      font-weight: bold;
    }

    .requirement-met {
      color: #28a745;
    }

    .requirement-met .requirement-icon {
      color: #28a745;
    }

    .password-requirements li:not(.requirement-met) {
      color: #dc3545;
    }

    .password-requirements li:not(.requirement-met) .requirement-icon {
      color: #dc3545;
  }

  .error-message {
    color: red;
    font-size: 14px;
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
  