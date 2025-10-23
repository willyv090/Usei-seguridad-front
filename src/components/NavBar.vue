<template>
  <nav>
    <div class="logo">
      <img src="@/components/images/USEI.png" alt="Logo" />
    </div>

    <div class="nav-links">
      <!-- Mostrar flecha de retroceso solo si no está en menuusuario -->
      <button
        v-if="shouldShowBackButton"
        @click="goBack"
        class="icon-button volver-icon"
        title="Volver"
      >
        <i class="fas fa-arrow-left"></i>
      </button>

      <!-- Mostrar links según rol -->
      <template v-if="isLoggedIn">
        <a href="#noticias" class="navigation-link">Noticias</a>
        <a href="#about" class="navigation-link">Sobre Nosotros</a>
        <a href="#panel" class="navigation-link">Panel</a>
        <a href="#footer" class="navigation-link">Contacto</a>

        <!-- Soporte -->
        <button @click="openSupport" class="icon-button support-icon" title="Soporte">
          <i class="fas fa-headset"></i>
        </button>

        <!-- Cerrar sesión -->
        <button @click="confirmLogout" class="icon-button logout-icon" title="Cerrar sesión">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </template>

      <!-- Si no ha iniciado sesión -->
      <template v-else>
        <a href="#carrusel" class="navigation-link">Noticias</a>
        <a href="#about" class="navigation-link">Sobre Nosotros</a>
        <a href="#footer" class="navigation-link">Contacto</a>
        <a href="#" class="login-btn" @click="showLoginPopup = true">Iniciar Sesión</a>
      </template>

      <!-- Perfil -->
      <template v-if="isLoggedIn">
        <div class="user-wrapper">
          <button @click="openUserProfile" class="icon-button user-icon">
            <i class="fas fa-user-circle"></i>
          </button>
          <div class="user-info">
            <span class="username-label">{{ username }}</span>
            <span class="role-label">{{ role }}</span>
          </div>
        </div>
      </template>
    </div>


    <!-- Popups -->
    <UserProfilePopup v-if="showUserProfile" @close="closeUserProfile" />
    <LoginPopup 
      v-if="showLoginPopup" 
      @close="showLoginPopup = false" 
      @switch-to-admin-login="switchToAdminLogin"
      @switch-to-change-password="switchToChangePassword"
      @switch-to-code-verification="switchToCodeVerification"
    />
    <AdminLoginPopup 
      v-if="showAdminLoginPopup" 
      @close="showAdminLoginPopup = false" 
      @switch-to-student-login="switchToStudentLogin"
    />
  </nav>
</template>

<script>
import Swal from "sweetalert2";
import LoginPopup from "@/components/LoginPopup.vue";
import UserProfilePopup from "@/components/UserProfilePopup.vue";
import AdminLoginPopup from "@/components/AdminLoginPopup.vue";

export default {
  name: "NavBar",
  components: {
    LoginPopup,
    UserProfilePopup,
    AdminLoginPopup,
  },
  data() {
    return {
      showLoginPopup: false,
      showUserProfile: false,
      showAdminLoginPopup: false,
      username: "",
      role: "",
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("authToken");
    },
    shouldShowBackButton() {
      // Solo muestra la flecha si NO estás en /menu-usuario o /
      const path = this.$route.path;
      return this.isLoggedIn && path !== '/menu-usuario' && path !== '/';
    },
  },
  mounted() {
    this.username = localStorage.getItem("nombre") || "";
    this.role = localStorage.getItem("rol") || "";
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    openUserProfile() {
      this.showUserProfile = true;
    },
    closeUserProfile() {
      this.showUserProfile = false;
    },
    openSupport() {
      const role = localStorage.getItem("rol");
      if (role === "Estudiante") {
        this.$router.push("/contacto-admin");
      } else if (role === "Administrador") {
        this.$router.push("/formulario-soporte");
      } else {
        this.$router.push("/formulario-soporte");
      }
    },
    confirmLogout() {
      Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Tu sesión actual se cerrará. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#63C7B2",
        cancelButtonColor: "#8E6C88",
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.logout();
        }
      });
    },
    logout() {
      localStorage.clear();
      Swal.fire({
        icon: "success",
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        confirmButtonColor: "#63C7B2",
      }).then(() => {
        this.$router.push("/");
      });
    },
  },
};
</script>

<style scoped>
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

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  color: white;
  font-size: 22px;
}

.icon-button:hover {
  color: #263d42;
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
}

.role-label {
  font-size: 12px;
  color: #263d42;
}

/* Botón cerrar sesión */
.logout-icon {
  color: #fff;
}

.logout-icon:hover {
  color: #f44336;
}
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
</style>
