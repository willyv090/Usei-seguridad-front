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

          <!-- Instrucciones -->
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
                Al menos un carácter especial (@$!%*?&#)
              </li>
              <li :class="{ 'requirement-met': validations.noSequential }">
                <span class="requirement-icon">{{ validations.noSequential ? '✓' : '✗' }}</span>
                Sin números secuenciales (ej: 123, 987)
              </li>
              <li :class="{ 'requirement-met': validations.noRepeatedLetters }">
                <span class="requirement-icon">{{ validations.noRepeatedLetters ? '✓' : '✗' }}</span>
                Sin letras repetidas más de 2 veces (ej: aaa)
              </li>
              <li :class="{ 'requirement-met': validations.noSequentialLetters }">
                <span class="requirement-icon">{{ validations.noSequentialLetters ? '✓' : '✗' }}</span>
                Sin letras secuenciales (ej: abc, ABC, cba)
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

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <button type="submit" class="submit-btn" :disabled="!isPasswordValid">Cambiar Contraseña</button>
        <h2></h2>
      </form>
      <button class="role-btn" @click="$emit('switch-to-student-login')">Cancelar</button>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { BASE_URL } from '@/config/globals';

export default {
  name: 'ChangePasswordPopup',
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      showPassword: false,
      showConfirmPassword: false,
      validations: {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        noSequential: false,
        noRepeatedLetters: false,
        noSequentialLetters: false
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
      this.validations.minLength = password.length >= 12;
      this.validations.hasUpperCase = /[A-Z]/.test(password);
      this.validations.hasLowerCase = /[a-z]/.test(password);
      this.validations.hasNumber = /\d/.test(password);
      this.validations.hasSpecialChar = /[@$!%*?&#]/.test(password);
      this.validations.noSequential = !this.hasSequentialNumbers(password);
      this.validations.noRepeatedLetters = !this.hasRepeatedLetters(password);
      this.validations.noSequentialLetters = !this.hasSequentialLetters(password);
      this.calculatePasswordStrength();
    },
    hasSequentialNumbers(password) {
      for (let i = 0; i < password.length - 2; i++) {
        const c1 = password.charCodeAt(i);
        const c2 = password.charCodeAt(i + 1);
        const c3 = password.charCodeAt(i + 2);
        if (c1 >= 48 && c1 <= 57 && c2 === c1 + 1 && c3 === c2 + 1) return true;      // asc
        if (c1 >= 48 && c1 <= 57 && c2 === c1 - 1 && c3 === c2 - 1) return true;      // desc
      }
      return false;
    },
    hasRepeatedLetters(password) {
      // Detecta más de 2 letras repetidas consecutivas (ej: "aaa", "BBB")
      for (let i = 0; i < password.length - 2; i++) {
        const char = password[i];
        if (/[a-zA-Z]/.test(char)) {
          if (password[i + 1] === char && password[i + 2] === char) {
            return true;
          }
        }
      }
      return false;
    },
    hasSequentialLetters(password) {
      // Detecta letras secuenciales ascendentes o descendentes (ej: "abc", "ABC", "cba", "ZYX")
      for (let i = 0; i < password.length - 2; i++) {
        const c1 = password.charCodeAt(i);
        const c2 = password.charCodeAt(i + 1);
        const c3 = password.charCodeAt(i + 2);
        
        // Verifica si son letras y están en secuencia
        const isLetter1 = (c1 >= 65 && c1 <= 90) || (c1 >= 97 && c1 <= 122);
        const isLetter2 = (c2 >= 65 && c2 <= 90) || (c2 >= 97 && c2 <= 122);
        const isLetter3 = (c3 >= 65 && c3 <= 90) || (c3 >= 97 && c3 <= 122);
        
        if (isLetter1 && isLetter2 && isLetter3) {
          // Secuencia ascendente (ej: abc, ABC)
          if (c2 === c1 + 1 && c3 === c2 + 1) return true;
          // Secuencia descendente (ej: cba, CBA)
          if (c2 === c1 - 1 && c3 === c2 - 1) return true;
        }
      }
      return false;
    },
    calculatePasswordStrength() {
      const validCount = Object.values(this.validations).filter(v => v).length;
      const total = Object.keys(this.validations).length;
      const percentage = (validCount / total) * 100;
      if (percentage < 40) this.passwordStrength = { percentage, text: 'Muy débil', class: 'very-weak' };
      else if (percentage < 60) this.passwordStrength = { percentage, text: 'Débil', class: 'weak' };
      else if (percentage < 80) this.passwordStrength = { percentage, text: 'Media', class: 'medium' };
      else if (percentage < 100) this.passwordStrength = { percentage, text: 'Fuerte', class: 'strong' };
      else this.passwordStrength = { percentage: 100, text: 'Muy fuerte', class: 'very-strong' };
    },

    async handleChangePassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        return;
      }
      if (!this.isPasswordValid) {
        this.errorMessage = 'La contraseña no cumple con todos los requisitos de seguridad.';
        return;
      }
      this.errorMessage = '';

      try {
        const idUsuario = localStorage.getItem('idUsuarioCorreo');
        if (!idUsuario) throw new Error('No se encontró el ID del usuario');

        // ✅ CAMBIO: URL correcta y envío de idUsuario como query param
        await this.$publicAxios.put(
          `${BASE_URL}/usuario/change-password`,                  // ✅ CAMBIO
          { newPassword: this.newPassword },                      // body
          { params: {idUsuario: localStorage.getItem('idUsuarioCorreo') }}                               // ✅ CAMBIO: query param
        );

        Swal.fire({
          icon: 'success',
          title: 'Contraseña cambiada',
          text: 'Tu contraseña ha sido cambiada correctamente.',
          confirmButtonText: 'Aceptar'
        });
        this.$emit('close');
      } catch (error) {
        // Mostrar mensaje específico del backend si viene texto útil (política, reutilización, etc.)
        const msg = error?.response?.data || 'Ha ocurrido un error, por favor intenta nuevamente.';
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar la contraseña',
          text: String(msg),
          confirmButtonText: 'Aceptar'
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
  