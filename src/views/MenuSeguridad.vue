<template>
  <div>
    <!-- Header -->
    <section class="header-master">
      <header>
        <NavBar userRole="Seguridad" />
      </header>
    </section>

    <!-- Cards principales -->
    <section class="icon-cards">
      <div class="container-cards">
        <!-- Card 1: Gestión de Usuarios y Roles -->
        <div class="card-wrapper">
          <div class="card">
            <iframe
              src="https://lottie.host/embed/6e7d0ef4-c236-40f3-a4a1-f10dec61cb08/2QjivN8N9u.lottie"
              class="lottie-frame"
              title="Gestión de Usuarios y Roles"
            ></iframe>
          </div>
          <h3>GESTIÓN DE USUARIOS Y ROLES</h3>
          <div class="card-button-container">
            <button class="btn-ingresar" @click="goToUsuariosRoles">Ingresar</button>
          </div>
        </div>

        <!-- Card 2: Gestión de Contraseñas -->
        <div class="card-wrapper">
          <div class="card">
            <iframe
              src="https://lottie.host/embed/c01e5614-08ff-4eeb-ae35-9f306d9c7463/5pJjVm5khK.lottie"
              class="lottie-frame"
              title="Gestión de Contraseñas"
            ></iframe>
          </div>
          <h3>GESTIÓN DE CONTRASEÑAS</h3>
          <div class="card-button-container">
            <button class="btn-ingresar" @click="goToContrasenas">Ingresar</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import FooterComponent from '@/components/FooterComponent.vue';

export default {
  name: 'MenuSeguridad',
  components: {
    NavBar,
    FooterComponent
  },
  methods: {
    goToUsuariosRoles() {
      this.$router.push('/seguridad/usuarios-roles');
    },
    goToContrasenas() {
      this.$router.push('/seguridad/gestor-contrasenas');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto';
}

/* Header */
section.header-master {
  width: 100%;
  padding: 30px 0;
  background-image: url('https://i.postimg.cc/28zkdsTq/bg-01.png');
  background-size: cover;
}

section.header-master header {
  border-bottom: 3px solid rgba(71, 83, 88, 0.14);
  padding-bottom: 20px;
}

/* Cards */
.icon-cards {
  background-color: #d9e4e6;
  padding: 80px 0;
}

.container-cards {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2%;
  display: flex;
  justify-content: center;
  gap: 50px;
  flex-wrap: wrap;
}

.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card {
  width: 280px;
  height: 280px;
  border: 2px solid #ccc;
  border-radius: 20px;
  background-color: rgba(128, 206, 215, 0.5);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
}

.lottie-frame {
  width: 230px;
  height: 230px;
  border: none;
}

h3 {
  margin-top: 18px;
  margin-bottom: 10px;
  font-size: 18px;
  color: #263d42;
  font-weight: 600;
}

.card-button-container {
  margin-top: 8px;
}

.btn-ingresar {
  background-color: #6c5b7b;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  width: 130px;
  transition: background-color 0.3s ease, transform 0.1s ease;
}
.btn-ingresar:hover {
  background-color: #63c7b2;
}
.btn-ingresar:active {
  transform: scale(0.97);
}

/* Footer */
footer {
  padding: 20px 0;
  background: #6cc5b2;
  text-align: center;
}

@media screen and (max-width: 700px) {
  .container-cards {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
  .card {
    width: 260px;
    height: 260px;
  }
}
</style>
