<template>
  <nav>
    <div class="logo">
      <img src="@/components/images/USEI.png" alt="Logo" />
    </div>
    <div class="nav-links">
      <!-- Priorizar la vista de reporte-dash -->
      <template v-if="isReporteDash">
        <a href="#footer" class="navigation-link">Contacto y Redes Sociales</a>
        <a @click.prevent="goToPreviousPage" class="navigation-link" title="Volver al Panel">
          Panel
        </a>
      </template>

      <!-- Mostrar opciones de usuario y notificaciones cuando está logueado -->
      <template v-if="isMenuAdministador || isMenuDirector || isMenuEstudiante || isMenuPrincipal ">
        <!-- Regular navigation options -->
        <a v-if="!userRole" href="#carrusel" class="navigation-link">Noticias</a>
        <a v-if="!userRole" href="#about" class="navigation-link">Sobre Nosotros</a>
        <a v-if="!userRole" href="#footer" class="navigation-link">Contacto y Redes Sociales</a>

        <!-- Opciones si el usuario está logueado -->
        <a v-if="userRole" href="#noticias" class="navigation-link">Noticias</a>
        <a v-if="userRole" href="#about" class="navigation-link">Sobre Nosotros</a>
        <a v-if="userRole" href="#panel" class="navigation-link">Panel</a>
        <a v-if="userRole" href="#footer" class="navigation-link">Contacto y Redes Sociales</a>
        <button v-if="userRole" @click="openSupport" class="icon-button support-icon" title="Soporte">
          <i class="fas fa-headset"></i>
        </button>
      </template>

      <!-- Condiciones para EncuestaEstudiante, GestionDirectores y otras vistas -->
      <template
        v-else-if="isEncuestaEstudiante || isGestionDirectores || isEnviarEncuesta || isListadoEstudiantes || isResumePage || isNoticiaForm || isFormularioSoporte || isContactoAdmin || isEstudiantesRegistrados || isFormularioPlazos || isPorcentajeIncompleto || isGestionEncuesta || isSoporteDirector || isVerPreguntas || isEstadoEstudiante || isDashboard || isReporteDashboard || isSubirCertificado || isHistorialReportes"
      >
        <button @click="goToPreviousPage" class="icon-button volver-icon" title="Volver">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button @click="openSupport" class="icon-button support-icon" title="Soporte">
          <i class="fas fa-headset"></i>
        </button>
      </template>

      <!-- Si el usuario está en otra vista, solo mostrar "Volver" y "Soporte" -->
      <template v-else>
        <button @click="goToPreviousPage" class="icon-button volver-icon" title="Volver">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button @click="openSupport" class="icon-button support-icon" title="Soporte">
          <i class="fas fa-headset"></i>
        </button>
      </template>

      <!-- Notificaciones y perfil del usuario si está logueado -->
      <template v-if="isStudent">
        <button
          @click="toggleNotifications"
          class="icon-button notification-icon"
          :class="{ 'has-unread': hasUnreadNotifications }"
        >
          <i class="fas fa-bell"></i>
        </button>

        <div v-if="showNotifications" class="notification-menu">
          <h3>Notificaciones</h3>
          <div class="scrollable">
            <template v-if="notifications.length > 0">
              <div
                class="notification-item"
                v-for="(notification, index) in notifications"
                :key="index"
                @click="markAsRead(notification, index)"
              >
                <i class="fas" :class="notification.read ? 'fa-envelope-open' : 'fa-envelope'"></i>
                <div class="notification-content">
                  <p><strong>{{ notification.title }}</strong></p>
                  <p>{{ notification.description }}</p>
                  <p>{{ notification.time }}</p>
                </div>
              </div>

              <div class="pagination-buttons">
                <button
                  v-if="currentPage > 0"
                  @click="loadNotifications(currentPage - 1)"
                  class="load-more-button prev-button"
                >
                  ← Volver a Notificaciones Anteriores
                </button>
                <button
                  v-if="currentPage < totalPages - 1"
                  @click="loadNotifications(currentPage + 1)"
                  class="load-more-button"
                >
                  Cargar más
                </button>
              </div>
            </template>
          </div>
        </div>
      </template>

      <template v-if="userRole">
        <div class="user-wrapper">
          <!-- ✅ Mantener como antes: abre popup, NO cierra sesión -->
          <button @click="openUserProfile" class="icon-button user-icon">
            <i class="fas fa-user-circle"></i>
          </button>
          <div class="user-info">
            <span class="username-label">{{ username }}</span>
            <span class="role-label">{{ role }}</span>
          </div>
        </div>
      </template>

      <!-- Mostrar botón de iniciar sesión si no está logueado -->
      <template v-if="!userRole">
        <a href="#" class="login-btn" @click="showLoginPopup = true">Iniciar Sesión</a>
      </template>
    </div>

    <!-- Popups para login, perfil, etc. -->
    <UserProfilePopup
      v-if="showUserProfile"
      @close="closeUserProfile"
      @logout="logout"
    />

    <LoginPopup
      v-if="showLoginPopup"
      @close="showLoginPopup = false"
      @switch-to-register="switchToRegister"
      @switch-to-admin-login="switchToAdminLogin"
      @switch-to-change-password="handlePolicyPasswordChange"
      @switch-to-code-verification="switchToCodeVerification"
    />

    <AdminLoginPopup
      v-if="showAdminLoginPopup"
      @close="showAdminLoginPopup = false"
      @switch-to-student-login="switchToStudentLogin"
      @switch-to-change-password="switchToChangePassword"
      @switch-to-code-verification="switchToCodeVerification"
    />

    <ChangePasswordPopup
      v-if="showChangePasswordPopup"
      :userId="changePasswordUserId"
      :isFromPolicyUpdate="policyPasswordChange"
      :reason="changePasswordReason"
      @close="closeChangePassword"
      @login-success="handleAutoLoginSuccess"
      @switch-to-change-password="switchToChangePassword"
      @switch-to-student-login="switchToStudentLogin"
    />

    <CodeVerificationPopup
      v-if="showCodeVerificationPopup"
      @close="showCodeVerificationPopup = false"
      @switch-to-student-login="switchToStudentLogin"
      @switch-to-change-password="switchToChangePassword"
    />
  </nav>
</template>

<script>
import LoginPopup from '@/components/LoginPopup.vue';
import UserProfilePopup from '@/components/UserProfilePopup.vue';
import AdminLoginPopup from '@/components/AdminLoginPopup.vue';
import ChangePasswordPopup from '@/components/ChangePasswordPopup.vue';
import CodeVerificationPopup from './CodeVerificationPopup.vue';
import { BASE_URL } from '@/config/globals';
import { getBackendUrl } from '@/utils/backendDiscovery';

export default {
  name: 'NavBar',
  components: {
    LoginPopup,
    UserProfilePopup,
    AdminLoginPopup,
    ChangePasswordPopup,
    CodeVerificationPopup,
  },
  props: {
    userRole: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showLoginPopup: false,
      showRegisterPopup: false,
      showUserProfile: false,
      showAdminLoginPopup: false,
      showNotifications: false,
      showChangePasswordPopup: false,
      showCodeVerificationPopup: false,
      policyPasswordChange: false,
      changePasswordUserId: null,
      changePasswordReason: '',
      username: '',
      role: '',
      notifications: [],
      estudianteId: null,
      currentPage: 0,
      pageSize: 10,
      totalPages: 0
    };
  },
  computed: {
    isEncuestaEstudiante() { return this.$route.path === '/encuesta-estudiante' && !this.isReporteDash; },
    isMenuPrincipal() { return this.$route.path === '/'; },
    isMenuEstudiante() { return this.$route.path === '/menu-estudiante'; },
    isGestionDirectores() { return this.$route.path === '/gestion-directores' && !this.isReporteDash; },
    isEnviarEncuesta() { return this.$route.path === '/enviar-encuesta'; },
    isListadoEstudiantes() { return this.$route.path === '/listado-estudiantes'; },
    isResumePage() { return this.$route.path === '/resumen'; },
    isNoticiaForm() { return this.$route.path === '/noticia-form'; },
    isFormularioSoporte() { return this.$route.path === '/formulario-soporte'; },
    isContactoAdmin() { return this.$route.path === '/contacto-admin'; },
    isEstudiantesRegistrados() { return this.$route.path === '/estudiantes-registrados'; },
    isFormularioPlazos() { return this.$route.path === '/formulario-plazos'; },
    isPorcentajeIncompleto() { return this.$route.path === '/porcentaje-incompleto'; },
    isGestionEncuesta() { return this.$route.path.startsWith('/gestion-encuestas'); },
    isSoporteDirector() { return this.$route.path === '/soporte-director'; },
    isVerPreguntas() { return this.$route.path === '/lista-preguntas'; },
    isEstadoEstudiante() { return this.$route.path === '/estado-estudiante'; },
    isDashboard() { return this.$route.path === '/dashboard'; },
    isSubirCertificado() { return this.$route.path === '/subir-certificado'; },
    isHistorialReportes() { return this.$route.path === '/historial-reportes'; },

    isMenuAdministador() { return this.$route.path === '/menu-administrador'; },
    isMenuDirector() { return this.$route.path === '/menu-director'; },

    isStudent() { return localStorage.getItem('rol') === 'estudiante'; },
    hasUnreadNotifications() { return this.notifications.some(n => !n.read); },

    isReporteDashboard() { return this.$route.path === '/reporte-dash'; },
    isReporteDash() { return this.$route.path === '/reporte-dash'; },
  },
  watch: {
    estudianteId(newVal, oldVal) {
      if (newVal !== oldVal && newVal) this.loadNotifications();
    }
  },
  mounted() {
    this.username = localStorage.getItem('nombre') || 'USERNAME';
    this.role = localStorage.getItem('rol') || 'ROL';

    const storedEstudianteId = localStorage.getItem('id_estudiante');
    if (storedEstudianteId) this.estudianteId = storedEstudianteId;

    this.loadNotifications();
  },
  methods: {
    switchToRegister() {
      this.showLoginPopup = false;
      this.showAdminLoginPopup = false;
      this.showChangePasswordPopup = false;
      this.showCodeVerificationPopup = false;
      this.showRegisterPopup = true;
    },
    switchToStudentLogin() {
      this.showAdminLoginPopup = false;
      this.showLoginPopup = true;
      this.showChangePasswordPopup = false;
      this.showCodeVerificationPopup = false;
    },
    switchToAdminLogin() {
      this.showLoginPopup = false;
      this.showRegisterPopup = false;
      this.showAdminLoginPopup = true;
      this.showChangePasswordPopup = false;
      this.showCodeVerificationPopup = false;
    },
    switchToChangePassword() {
      this.showChangePasswordPopup = true;
      this.showLoginPopup = false;
      this.showAdminLoginPopup = false;
      this.showRegisterPopup = false;
      this.showCodeVerificationPopup = false;
    },
    switchToCodeVerification() {
      this.showCodeVerificationPopup = true;
      this.showLoginPopup = false;
      this.showAdminLoginPopup = false;
      this.showRegisterPopup = false;
      this.showChangePasswordPopup = false;
    },

    onLoginSuccess(idEstudiante) {
      localStorage.setItem('id_estudiante', idEstudiante);
      this.estudianteId = idEstudiante;
    },

    async loadNotifications(page = this.currentPage) {
      const estudianteId = this.estudianteId;
      const token = localStorage.getItem('authToken');
      if (!token || !estudianteId) {
        this.notifications = [];
        return;
      }

      try {
        const backend = await getBackendUrl();
        if (!backend) return;

        const response = await this.$protectedAxios.get(`${backend}/notificacion/estudiante/${estudianteId}`, {
          params: { page, size: this.pageSize }
        });

        const notificationData = response.data.content;
        this.notifications = notificationData
          .map(n => ({
            id: n.idNotificacion,
            title: n.titulo,
            description: n.contenido,
            time: new Date(n.fecha).toLocaleString(),
            read: n.estadoNotificacion,
          }))
          .sort((a, b) => b.id - a.id);

        this.currentPage = page;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error('Error al cargar las notificaciones:', error);
      }
    },

    async markAsRead(notification, index) {
      if (!notification.read) {
        try {
          await this.$protectedAxios.put(`${BASE_URL}/notificacion/${notification.id}/lectura`);
          this.notifications[index].read = true;
        } catch (error) {
          console.error('Error al marcar la notificación como leída:', error);
        }
      }
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },

    openUserProfile() {
      this.showUserProfile = true;
    },

    closeUserProfile() {
      this.showUserProfile = false;
    },

    goToPanel() {
      if (this.isReporteDash) this.$router.push('/menu-administrador');
      else this.$router.go(-1);
    },

    goToPreviousPage() {
      this.$router.go(-1);
    },

    openSupport() {
      if (this.userRole === 'estudiante') this.$router.push('/contacto-admin');
      else if (this.userRole === 'Administrador') this.$router.push('/formulario-soporte');
    },

    handlePolicyPasswordChange() {
      this.showLoginPopup = false;

      const firstId = localStorage.getItem('firstLoginUserId');
      const firstCorreo = localStorage.getItem('firstLoginCorreo');

      if (firstId || firstCorreo) {
        this.changePasswordUserId = firstId || null;
        this.changePasswordReason = 'first-login';
        this.policyPasswordChange = false;
      } else {
        this.policyPasswordChange = true;
        this.changePasswordUserId = null;
        this.changePasswordReason = 'policy-updated';
      }

      this.showChangePasswordPopup = true;
    },

    closeChangePassword() {
      this.showChangePasswordPopup = false;
      this.policyPasswordChange = false;
      this.changePasswordUserId = null;
      this.changePasswordReason = '';

      localStorage.removeItem('policyPasswordChange');
      localStorage.removeItem('firstLoginUserId');
      localStorage.removeItem('firstLoginCorreo');
    },

    handleAutoLoginSuccess(userData) {
      this.showChangePasswordPopup = false;
      this.showLoginPopup = false;
      this.policyPasswordChange = false;

      this.username = userData.username || userData.email;
      this.role = userData.role;

      this.$emit('user-logged-in', userData);
      console.log('User automatically logged in after password update:', userData);
    },

    // ✅ Logout SOLO cuando el popup emite @logout
    logout() {
      const keysToRemove = [
        'authToken','token','jwt','access_token',
        'id_usuario','idUsuario','id_estudiante',
        'ci','correo','nombre','rol','carrera',
        'cambio_contrasenia','accesos',
        'policyPasswordChange','firstLoginUserId','firstLoginCorreo'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // para que vuelva a registrarse "1 vez por login"
      sessionStorage.clear();

      this.username = '';
      this.role = '';
      this.notifications = [];
      this.estudianteId = null;

      this.showNotifications = false;
      this.showUserProfile = false;

      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
/* Estilos para el NavBar y botones */
nav {
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  z-index: 999;
  background: #63c7b2;
  height: 70px;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
}

.logo img {
  height: 50px;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-links a {
  font-size: 15px;
  text-transform: uppercase;
  color: white;
  text-decoration: none;
  padding: 0 20px;
}

.nav-links a:hover {
  color: #263d42;
}

.login-btn {
  background: #8e6c88;
  padding: 10px 25px;
  border-radius: 40px;
  color: white;
  text-transform: uppercase;
  font-size: 14px;
  transition: background 0.3s ease;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover {
  background: #80ced7;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  color: white;
  font-size: 28px;
}

.icon-button:hover {
  color: #263d42;
}

/* Estilos específicos para el botón "Volver" */
.volver-icon {
  font-size: 20px;
  color: white;
  background-color: #8e6c88;
  padding: 7px;
  border-radius: 20%;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.volver-icon:hover {
  background-color: #263d42;
  color: white;
}

.user-wrapper {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
}

.username-label {
  font-size: 16px;
  color: white;
  text-transform: uppercase;
}

.role-label {
  font-size: 12px;
  color: #8e6c88;
  text-transform: uppercase;
}

/* Estilos para el menú de notificaciones */
.notification-menu {
  position: absolute;
  top: 70px;
  right: 50px;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
}

.notification-menu h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #263d42;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f0f0f0;
}

.notification-item .fa-envelope { color: #dc3545; }
.notification-item .fa-envelope-open { color: #28a745; }

.notification-icon {
  font-size: 25px;
  margin-right: 10px;
}

.has-unread {
  animation: glow 1.5s infinite, bounce 2s infinite;
  color: rgb(45, 59, 255);
}

.notification-content p {
  margin: 0;
  color: #333;
}

.scrollable {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 10px;
}

.scrollable::-webkit-scrollbar { width: 6px; }
.scrollable::-webkit-scrollbar-thumb {
  background-color: #8e6c88;
  border-radius: 10px;
}
.scrollable::-webkit-scrollbar-track { background-color: #f1f1f1; }

.load-more-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  margin: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.load-more-button:hover {
  background-color: #388E3C;
  transform: scale(1.05);
}

.pagination-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.prev-button { background-color: #FF9800; }
.prev-button:hover { background-color: #FB8C00; }
</style>
