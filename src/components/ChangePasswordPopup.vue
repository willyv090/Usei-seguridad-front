<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <!-- Scrollable container for all content -->
      <div class="popup-scrollable-content">
        <h2>{{ showPolicyUpdateNotice ? 'Actualizar Contraseña - Nuevas Políticas' : 'Cambiar Contraseña' }}</h2>
        
        <!-- Policy Update Notice -->
        <div v-if="showPolicyUpdateNotice" class="policy-update-notice">
          <div class="policy-notice-icon">🔒</div>
          <div class="policy-notice-content">
            <h3>Políticas de Seguridad Actualizadas</h3>
            <p>Las políticas de seguridad han sido modificadas. Su contraseña debe cumplir con los nuevos requisitos.</p>
            <p><strong>Fecha de actualización:</strong> {{ formatPolicyDate() }}</p>
          </div>
        </div>

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

          <!-- Instrucciones dinámicas basadas en políticas actuales -->
          <div class="password-requirements">
            <p class="requirements-title">
              {{ showPolicyUpdateNotice ? 'Nuevos requisitos de contraseña:' : 'La contraseña debe contener:' }}
            </p>
            <ul>
              <li :class="{ 'requirement-met': validations.minLength }">
                <span class="requirement-icon">{{ validations.minLength ? '✓' : '✗' }}</span>
                Mínimo {{ minPasswordLength }} caracteres
                <span v-if="showPolicyUpdateNotice" class="new-requirement">📍 NUEVO</span>
              </li>
              <li v-if="currentPolicies?.requerirMayusculas" :class="{ 'requirement-met': validations.hasUpperCase }">
                <span class="requirement-icon">{{ validations.hasUpperCase ? '✓' : '✗' }}</span>
                Al menos una letra mayúscula
                <span v-if="showPolicyUpdateNotice" class="new-requirement">📍 REQUERIDO</span>
              </li>
              <li v-if="currentPolicies?.requerirMinusculas" :class="{ 'requirement-met': validations.hasLowerCase }">
                <span class="requirement-icon">{{ validations.hasLowerCase ? '✓' : '✗' }}</span>
                Al menos una letra minúscula
                <span v-if="showPolicyUpdateNotice" class="new-requirement">📍 REQUERIDO</span>
              </li>
              <li v-if="currentPolicies?.requerirNumeros" :class="{ 'requirement-met': validations.hasNumber }">
                <span class="requirement-icon">{{ validations.hasNumber ? '✓' : '✗' }}</span>
                Al menos un número
                <span v-if="showPolicyUpdateNotice" class="new-requirement">📍 REQUERIDO</span>
              </li>
              <li v-if="currentPolicies?.requerirSimbolos" :class="{ 'requirement-met': validations.hasSpecialChar }">
                <span class="requirement-icon">{{ validations.hasSpecialChar ? '✓' : '✗' }}</span>
                Al menos un carácter especial (@$!%*?&#)
                <span v-if="showPolicyUpdateNotice" class="new-requirement">📍 REQUERIDO</span>
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

        <button type="submit" class="submit-btn" :disabled="!isPasswordValid || isLoading">
          <span v-if="isLoading" class="loading-spinner">⏳</span>
          <span v-if="!isLoading">
            {{ showPolicyUpdateNotice ? 'Actualizar Contraseña' : 'Guardar Nueva Contraseña' }}
          </span>
          <span v-else>Guardando...</span>
        </button>
        <h2></h2>
      </form>
      <button class="role-btn" @click="$emit('switch-to-student-login')">Cancelar</button>
      
      </div> <!-- Close popup-scrollable-content -->
    </div> <!-- Close popup-content -->
  </div> <!-- Close popup-overlay -->
</template>

<script>
import Swal from 'sweetalert2';
import { BASE_URL } from '@/config/globals';

export default {
  name: 'ChangePasswordPopup',
  props: {
    userId: {
      type: [String, Number],
      default: null
    },
    reason: {
      type: String,
      default: 'normal' // 'normal' or 'policy-updated'
    },
    showPolicyNotice: {
      type: Boolean,
      default: false
    },
    isFromPolicyUpdate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      userIdForUpdate: null, // For policy update scenarios
      originalEmail: null, // Store original email for automatic login
      currentPolicies: null, // Will store current security policies
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
    },
    // Dynamic minimum length from current policies
    minPasswordLength() {
      return this.currentPolicies ? this.currentPolicies.minLongitudContrasenia : 12;
    },
    // Show policy update notice
    showPolicyUpdateNotice() {
      return this.reason === 'policy-updated' || this.showPolicyNotice;
    }
  },
  async mounted() {
    this.userIdForUpdate = this.userId || localStorage.getItem('firstLoginUserId');
    this.emailForAutoLogin = this.originalEmail || localStorage.getItem('firstLoginCorreo');
    // Fetch current security policies to show dynamic requirements
    await this.fetchCurrentPolicies();
    
    // If this is from policy update, get user ID and original login data from localStorage
    if (this.isFromPolicyUpdate && this.reason === 'policy-updated') {
      const policyData = localStorage.getItem('policyPasswordChange');
      if (policyData) {
        try {
          const data = JSON.parse(policyData);
          this.userIdForUpdate = data.userId;
          this.originalEmail = data.email;
          console.log('Policy update detected for user:', this.userIdForUpdate);
        } catch (error) {
          console.error('Error parsing policy data:', error);
        }
      }
    }

    // If we received a userId prop (first-login scenario), use it
    if (this.userId && !this.userIdForUpdate) {
      this.userIdForUpdate = this.userId;
      // Try to get original email saved by LoginPopup
      const firstCorreo = localStorage.getItem('firstLoginCorreo');
      if (firstCorreo) this.originalEmail = firstCorreo;
    }
  },
  methods: {
    async fetchCurrentPolicies() {
      try {
        // Use backend discovery to find the right URL
        const { getBackendUrl } = await import('@/utils/backendDiscovery');
        const baseUrl = await getBackendUrl();
        
        const response = await this.$publicAxios.get(`${baseUrl}/configuracion-seguridad/current`);
        if (response.data && response.data.data && response.data.data.configuracion) {
          this.currentPolicies = response.data.data.configuracion;
          console.log('Current policies loaded:', this.currentPolicies);
        }
      } catch (error) {
        console.error('Error fetching current policies:', error);
        // Use default values if can't fetch policies
        this.currentPolicies = {
          minLongitudContrasenia: 12,
          requerirMayusculas: true,
          requerirMinusculas: true,
          requerirNumeros: true,
          requerirSimbolos: true
        };
      }
    },
    checkPasswordStrength() {
      const password = this.newPassword;
      const minLength = this.minPasswordLength;
      
      // Use dynamic policies
      this.validations.minLength = password.length >= minLength;
      this.validations.hasUpperCase = this.currentPolicies?.requerirMayusculas ? /[A-Z]/.test(password) : true;
      this.validations.hasLowerCase = this.currentPolicies?.requerirMinusculas ? /[a-z]/.test(password) : true;
      this.validations.hasNumber = this.currentPolicies?.requerirNumeros ? /\d/.test(password) : true;
      this.validations.hasSpecialChar = this.currentPolicies?.requerirSimbolos ? /[@$!%*?&#]/.test(password) : true;
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
      this.isLoading = true;

      try {
        // Use userIdForUpdate if this is a policy update, otherwise get from localStorage
        const idUsuario = this.userIdForUpdate || localStorage.getItem('idUsuarioCorreo');
        if (!idUsuario) throw new Error('No se encontró el ID del usuario');

        // Use backend discovery to get the correct URL
        const { getBackendUrl } = await import('@/utils/backendDiscovery');
        const baseUrl = await getBackendUrl();

        // Send password change request
        await this.$publicAxios.put(
          `${baseUrl}/usuario/change-password`,
          { newPassword: this.newPassword },                      
          { params: {idUsuario: idUsuario }}                      
        );

        this.isLoading = false;

        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada exitosamente',
          text: this.showPolicyUpdateNotice 
            ? 'Tu contraseña ha sido actualizada correctamente y cumple con las nuevas políticas de seguridad. La nueva contraseña ha sido guardada en la base de datos.'
            : 'Tu contraseña ha sido cambiada y guardada correctamente en la base de datos.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.$emit('close');
          
          // If this was a policy update, automatically attempt login with new password
          if (this.showPolicyUpdateNotice && this.userIdForUpdate) {
            this.attemptAutomaticLogin();
          }
        });
      } catch (error) {
        this.isLoading = false;
        // Mostrar mensaje específico del backend si viene texto útil (política, reutilización, etc.)
        const msg = error?.response?.data || 'Ha ocurrido un error al guardar la contraseña en la base de datos. Por favor intenta nuevamente.';
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar la contraseña',
          text: String(msg),
          confirmButtonText: 'Aceptar'
        });
      }
    },
    
    formatPolicyDate() {
      if (!this.currentPolicies?.fechaModificacion) {
        return 'Recientemente';
      }
      
      try {
        const date = new Date(this.currentPolicies.fechaModificacion);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Recientemente';
      }
    },
    async attemptAutomaticLogin() {
      try {
        // Show loading message
        Swal.fire({
          title: 'Iniciando sesión automáticamente...',
          text: 'Verificando acceso con la nueva contraseña',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          }
        });

        // Get backend URL
        const { getBackendUrl } = await import('@/utils/backendDiscovery');
        const baseUrl = await getBackendUrl();

        // Attempt login with new password
        const loginResponse = await this.$publicAxios.post(`${baseUrl}/auth/login`, {
          email: this.originalEmail,
          password: this.newPassword
        });

        if (loginResponse.data.status === 'OK') {
          // Clear policy data since it's no longer needed
          localStorage.removeItem('policyPasswordChange');
          
          // Store user data for successful login
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('idUsuarioCorreo', loginResponse.data.idUsuario);
          localStorage.setItem('userRole', loginResponse.data.role);

          // Close loading and show success
          Swal.close();
          
          Swal.fire({
            icon: 'success',
            title: '¡Acceso concedido!',
            text: 'Tu contraseña ha sido actualizada y has iniciado sesión exitosamente.',
            confirmButtonText: 'Continuar',
            timer: 2000
          }).then(() => {
            // Redirect to appropriate dashboard based on role
            const role = loginResponse.data.role;
            if (role === 'Administrador') {
              this.$router.push('/dashboard');
            } else if (role === 'estudiante') {
              this.$router.push('/dashboard-estudiante');
            } else {
              this.$router.push('/dashboard');
            }
            
            // Emit success event to parent components
            this.$emit('login-success', loginResponse.data);
          });
        }
      } catch (error) {
        console.error('Automatic login failed:', error);
        
        // Close loading
        Swal.close();
        
        // Show manual login message
        Swal.fire({
          icon: 'info',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña ha sido actualizada exitosamente. Por favor, inicia sesión manualmente con tu nueva contraseña.',
          confirmButtonText: 'Iniciar Sesión'
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
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000; /* Higher than LoginPopup */
    padding: 20px; /* Add padding for mobile responsiveness */
    box-sizing: border-box;
  }
  
  .popup-content {
    background-color: white;
    padding: 0; /* Remove padding since we'll add it to scrollable content */
    border-radius: 15px;
    width: 400px; /* Increased width for better readability */
    max-height: 90vh; /* Limit height to 90% of viewport */
    z-index: 2001; /* Higher than LoginPopup */
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent overflow on main container */
  }

  .popup-scrollable-content {
    padding: 20px;
    max-height: calc(90vh - 60px); /* Account for close button */
    overflow-y: auto; /* Enable vertical scrolling */
    overflow-x: hidden; /* Prevent horizontal scrolling */
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: #63c7b2 #f1f1f1; /* For Firefox */
  }

  /* Custom scrollbar styling for WebKit browsers */
  .popup-scrollable-content::-webkit-scrollbar {
    width: 8px;
  }

  .popup-scrollable-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .popup-scrollable-content::-webkit-scrollbar-thumb {
    background: #63c7b2;
    border-radius: 10px;
    transition: background 0.3s ease;
  }

  .popup-scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #5fb8a8;
  }
  
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 2002; /* Higher than scrollable content */
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    background-color: #f0f0f0;
    color: #333;
    transform: scale(1.1);
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
    padding: 15px 20px;
    background: linear-gradient(45deg, #63c7b2, #5fb8a8);
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(99, 199, 178, 0.3);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 20px;
  }

  .submit-btn:hover:not(:disabled) {
    background: linear-gradient(45deg, #5fb8a8, #63c7b2);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 199, 178, 0.4);
  }

  .submit-btn:disabled {
    background: linear-gradient(45deg, #ccc, #bbb);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }

  .loading-spinner {
    display: inline-block;
    margin-right: 8px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

/* Policy Update Notice Styles */
.policy-update-notice {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #f39c12;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.policy-notice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.policy-notice-content h3 {
  margin: 0 0 8px 0;
  color: #d68910;
  font-size: 16px;
  font-weight: bold;
}

.policy-notice-content p {
  margin: 4px 0;
  color: #856404;
  font-size: 14px;
  line-height: 1.4;
}

/* New requirement indicator */
.new-requirement {
  background-color: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  font-weight: bold;
}

/* Enhanced requirement list for policy updates */
.password-requirements ul li {
  position: relative;
  padding: 8px 0;
}

.password-requirements ul li.requirement-met .new-requirement {
  background-color: #27ae60;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .popup-content {
    width: 95vw; /* Use most of the viewport width on mobile */
    max-width: 400px;
    margin: 10px;
  }
  
  .popup-scrollable-content {
    max-height: calc(85vh - 60px); /* Adjust for mobile */
    padding: 15px;
  }
  
  .policy-update-notice {
    padding: 10px;
  }
  
  .password-requirements ul li {
    font-size: 14px;
    padding: 6px 0;
  }
}

@media (max-height: 600px) {
  .popup-content {
    max-height: 95vh;
  }
  
  .popup-scrollable-content {
    max-height: calc(95vh - 60px);
  }
}
</style>
  