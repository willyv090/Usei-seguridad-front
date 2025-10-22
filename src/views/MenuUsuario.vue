<template>
  <div>
    <!-- Header Section -->
    <section class="header-master">
      <header>
        <NavBar userRole="Estudiante" />
      </header>

      <div class="content-header" id="carrusel">
        <div class="container">
          <ImageCarousel />
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about">
      <div class="container" id="about">
        <div class="about-container">
          <img src="@/components/images/graduados.jpg" alt="Graduados" />
        </div>
        <div class="about-container">
          <h2>USEI</h2>
          <h2>
            Bienvenido <b>{{ user.nombre }}</b>!! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            <br />
            <span class="ucb-text">Universidad Católica Boliviana “San Pablo”</span>
          </h2>
        </div>
        <div class="clear"></div>
      </div>
    </section>

    <!-- Dynamic Cards Section -->
    <section class="icon-cards">
      <div class="container-cards" id="panel">
        <!--  Mostrar cards dinámicamente según accesos -->
        <template v-if="allowedCards.length > 0">
          <div
            v-for="(card, index) in allowedCards"
            :key="index"
            class="card-wrapper"
          >
            <div class="card">
              <img :src="card.icon" :alt="card.title" class="card-icon" />
            </div>
            <h3>{{ card.title }}</h3>
            <div class="card-button-container">
              <button class="btn-ingresar" @click="goTo(card.route)">Ingresar</button>
            </div>
          </div>
        </template>

        <!--  Si no hay accesos -->
        <div v-else class="no-access">
          <h3>No tienes accesos asignados actualmente.</h3>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import ImageCarousel from "@/components/imageCarousel.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import { MENU_CARDS } from "@/config/menuCards";

export default {
  name: "MenuEstudiante",
  components: {
    NavBar,
    ImageCarousel,
    FooterComponent,
  },
  data() {
    return {
      user: {
        nombre: localStorage.getItem("nombre") || "Estudiante",
        rol: localStorage.getItem("rol") || "Estudiante",
      },
      accesses: JSON.parse(localStorage.getItem("accesos") || "[]"),
    };
  },
  computed: {
    allowedCards() {
      const normalizedAccesses = this.accesses.map((a) => a.trim().toLowerCase());
      const matched = new Set(); // evita duplicados

      return Object.values(MENU_CARDS).filter((card) => {
        const key = card.accessKey.trim().toLowerCase();
        const isMatch = normalizedAccesses.some((access) => access === key);
        if (isMatch && !matched.has(key)) {
          matched.add(key);
          return true;
        }
        return false;
      });
    },
  },
  methods: {
    goTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
}

.clear {
  clear: both;
}

.container {
  max-width: 1280px;
  padding: 0 2%;
  margin: 50px auto;
}

/* === Cards Section === */
.container-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  margin: 50px auto;
  padding: 20px;
}

.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card {
  width: 250px;
  height: 250px;
  padding: 20px;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 10px;
  background-color: rgba(128, 206, 215, 0.5);
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 200px;
  height: 200px;
}

h3 {
  margin-top: 20px;
  font-size: 18px;
  color: #263d42;
  text-align: center;
}

.card-button-container {
  margin-top: 10px;
}

.btn-ingresar {
  background-color: #6c5b7b;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  width: 100px;
  transition: background-color 0.3s ease;
}

.btn-ingresar:hover {
  background-color: #80ced7;
}

.no-access {
  text-align: center;
  color: #333;
  font-size: 18px;
  margin-top: 50px;
  width: 100%;
}

.icon-cards {
  background-color: #d9e4e6;
  padding: 50px 0;
}

/* === Header === */
section.header-master {
  width: 100%;
  padding: 30px 0;
  min-height: 700px;
  background-image: url("https://i.postimg.cc/28zkdsTq/bg-01.png");
  background-size: cover;
}

section.header-master header {
  border-bottom: 3px solid rgba(71, 83, 88, 0.14);
  padding-bottom: 20px;
}

.content-header {
  padding: 60px 0;
}

/* === About === */
.about-container {
  float: left;
  width: 50%;
  position: relative;
  z-index: 2;
}

.about-container img {
  max-width: 100%;
}

.about-container h2 {
  font-size: 26px;
  margin: 20px 0;
  color: #263d42;
  font-weight: normal;
  padding: 5px 40px;
  text-align: center;
}

.about-container h2 b {
  color: #03ca9f;
}

.ucb-text {
  display: block;
  margin-top: 10px;
  font-size: 18px;
  color: #4a5f5c;
  font-weight: 500;
}

footer {
  padding: 20px 0;
  background: #6cc5b2;
  text-align: center;
}

@media screen and (max-width: 916px) {
  section.header-master {
    min-height: 400px;
  }

  .about-container {
    width: 100%;
  }

  .container-cards {
    flex-direction: column;
    align-items: center;
  }
}
</style>
