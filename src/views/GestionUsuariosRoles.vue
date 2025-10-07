<template>
  <div>
    <!-- Header -->
    <header>
      <NavBar :userRole="userRole" />
    </header>

    <!-- Espaciador si tu NavBar es fijo -->
    <div class="header-spacer"></div>

    <main class="page-wrap">
      <h1 class="title">Gestión de Usuarios y Roles</h1>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <button
            class="pill"
            :class="{ active: currentTab === 'usuarios' }"
            @click="switchTab('usuarios')"
            title="Gestión de usuarios"
          >
            <i class="fas fa-users"></i>&nbsp;Usuarios
          </button>
          <button
            class="pill"
            :class="{ active: currentTab === 'roles' }"
            @click="switchTab('roles')"
            title="Gestión de roles"
          >
            <i class="fas fa-user-shield"></i>&nbsp;Roles
          </button>

          <span class="divider"></span>

          <!-- ÚNICO botón -->
          <button class="pill" @click="openNewPopup">
            <i class="fas fa-plus-circle"></i>&nbsp;Nuevo
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters">
        <input
          v-model="searchTerm"
          :placeholder="currentTab === 'usuarios' ? 'Buscar por CI, nombre o correo' : 'Buscar por nombre de rol'"
          @input="fetchData(1)"
        />
        <select v-model.number="perPage" @change="fetchData(1)">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <button class="sort-button" @click="toggleSortDirection">
          <i :class="sortDirection === 'asc' ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
        </button>
      </div>

      <!-- Tabla USUARIOS -->
      <div v-if="currentTab === 'usuarios'" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th @click="sort('usuario')">UserID/CI</th>
              <th @click="sort('nombre')">Nombre</th>
              <th @click="sort('correo')">Correo</th>
              <th @click="sort('telefono')">Teléfono</th>
              <th @click="sort('rol')">Rol</th>
              <th class="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(u, idx) in rows"
              :key="getId(u) || idx"
              :class="{ selected: selectedId === getId(u) }"
              @click="selectRow(u)"
            >
              <td>{{ u.usuario }}</td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.correo }}</td>
              <td>{{ u.telefono }}</td>
              <td><span class="badge">{{ u.rol }}</span></td>
              <td class="center">
                <button class="action-btn" @click.stop="edit(idx)">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn danger" @click.stop="remove(getId(u))">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabla ROLES -->
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th @click="sort('nombre')">Nombre</th>
              <th @click="sort('descripcion')">Descripción</th>
              <th @click="sort('activo')">Activo</th>
              <th class="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, idx) in rows"
              :key="getId(r) || idx"
              :class="{ selected: selectedId === getId(r) }"
              @click="selectRow(r)"
            >
              <td>{{ r.nombre }}</td>
              <td>{{ r.descripcion }}</td>
              <td>
                <span class="badge" :class="{ on: r.activo, off: !r.activo }">
                  {{ r.activo ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="center">
                <button class="action-btn" @click.stop="edit(idx)">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn danger" @click.stop="remove(getId(r))">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <PaginationComponent
        :page-count="totalPages"
        :current-page="currentPage"
        @page-changed="handlePageClick"
      />
    </main>

    <!-- Footer -->
    <FooterComponent />

    <!-- POPUP -->
    <AgregarUsuarioPopup
      v-if="showPopup"
      :mode="currentTab"
      :roles="allRoles"
      @close="showPopup = false"
      @guardar="handleGuardarNuevo"
    />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import AgregarUsuarioPopup from '@/components/AgregarUsuarioRolPopup.vue';
import Swal from 'sweetalert2';
import { BASE_URL } from '@/config/globals';

export default {
  name: 'GestionUsuariosRoles',
  components: { NavBar, FooterComponent, PaginationComponent, AgregarUsuarioPopup },
  data() {
    return {
      userRole: localStorage.getItem('rol') || '',
      currentTab: 'usuarios',
      rows: [],
      allRoles: [],
      searchTerm: '',
      perPage: 10,
      currentPage: 1,
      sortBy: 'nombre',
      sortDirection: 'asc',
      selectedId: null,
      totalPages: 1,
      showPopup: false,
    };
  },
  mounted() {
    this.fetchAllRoles();
    this.fetchData();
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab;
      this.resetTableParams();
      this.fetchData();
    },
    resetTableParams() {
      this.searchTerm = '';
      this.currentPage = 1;
      this.sortBy = 'nombre';
      this.sortDirection = 'asc';
      this.selectedId = null;
    },
    selectRow(row) { this.selectedId = this.getId(row); },
    getId(row) { return row.idUsuario || row.id || row.idRol || row.id_rol || row.id_usuario; },

    async fetchData(page = 1) {
      try {
        const url = this.currentTab === 'usuarios' ? `${BASE_URL}/usuario` : `${BASE_URL}/rol`;
        const { data } = await this.$protectedAxios.get(url, {
          params: {
            page: page - 1,
            size: this.perPage,
            filter: this.searchTerm,
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
          },
        });
        this.rows = Array.isArray(data.content) ? data.content : data;
        this.totalPages = data.totalPages || 1;
        this.currentPage = page;
      } catch {
        Swal.fire('Error', 'No se pudo cargar la información.', 'error');
      }
    },
    async fetchAllRoles() {
      try {
        const { data } = await this.$protectedAxios.get(`${BASE_URL}/rol`, { params: { size: 1000 } });
        this.allRoles = Array.isArray(data.content) ? data.content : data;
      } catch {
        this.allRoles = [];
      }
    },
    sort(field) {
      if (this.sortBy === field) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      else { this.sortBy = field; this.sortDirection = 'asc'; }
      this.fetchData(this.currentPage);
    },
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.fetchData(this.currentPage);
    },
    handlePageClick(p) {
      this.currentPage = p;
      this.fetchData(p);
    },
    openNewPopup() { this.showPopup = true; },
    async handleGuardarNuevo(payload) {
      try {
        const url = this.currentTab === 'usuarios' ? `${BASE_URL}/usuario` : `${BASE_URL}/rol`;
        await this.$protectedAxios.post(url, payload);
        this.showPopup = false;
        this.fetchData(this.currentPage);
        Swal.fire('Éxito', 'Registro creado correctamente.', 'success');
      } catch {
        Swal.fire('Error', 'No se pudo crear el registro.', 'error');
      }
    },
    edit() {
      Swal.fire('Info', 'Implementa aquí tu edición si lo necesitas.', 'info');
    },
    async remove(id) {
      const ok = await Swal.fire({
        title: '¿Eliminar registro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#80CED7',
        cancelButtonColor: '#8E6C88',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (!ok.isConfirmed) return;
      try {
        const url = this.currentTab === 'usuarios'
          ? `${BASE_URL}/usuario/${id}`
          : `${BASE_URL}/rol/${id}`;
        await this.$protectedAxios.delete(url);
        this.fetchData(this.currentPage);
        Swal.fire('Eliminado', 'Se eliminó correctamente.', 'success');
      } catch {
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    },
  },
};
</script>

<style scoped>
/* Espaciador por si el NavBar es fijo (ajusta alto si necesitas) */
.header-spacer { height: 72px; }

/* Layout */
.page-wrap {
  padding-top: 12px;            /* menos “pegado” al navbar */
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding-left: 2%;
  padding-right: 2%;
}
.title { font-size: 32px; font-weight: 700; margin-top: 6px; color: #000; }

/* Título de la barra */
.toolbar-title {
  width: 100%;
  max-width: 1200px;
  margin: 6px 0 4px;
  color: #263D42;
  font-size: 18px;
  font-weight: 700;
}

/* Toolbar */
.toolbar {
  width: 100%;
  max-width: 1200px;
  background: #83cabb;
  border: 1px solid #9fc1c7;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 8px;          /* separa de los filtros */
}
.toolbar-left { display: flex; gap: 8px; align-items: center; }

.pill {
  background: #8E6C88;
  color: #e6e0e0;
  border: 1px solid #49505a;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background .2s ease, transform .05s ease;
}
.pill:hover { background: #3c444e; }
.pill.active { background: #263d42; color: #fff; border-color: #3d555b; }

.divider { width: 1px; height: 24px; background: #494f58; margin: 0 6px; border-radius: 1px; }

/* Filtros */
.filters {
  width: 100%;
  max-width: 1200px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.filters input { flex: 1; padding: 10px 12px; border: 1px solid #ccc; border-radius: 10px; }
.filters select { padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
.sort-button {
  background-color: #263D42;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

/* Tabla */
.table-wrap {
  width: 100%;
  max-width: 1200px;
  background: #CBDADB;
  padding: 1.6rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,.1);
  overflow-x: auto;
}
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #263D42; padding: 10px; text-align: left; background: #fff; }
th { background: #263D42; color: #fff; user-select: none; cursor: pointer; }
tr.selected td { outline: 2px solid #80CED7; outline-offset: -2px; }
.center { text-align: center; }

/* Acciones */
.action-btn {
  background: #263D42;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  margin-right: 8px;
}
.action-btn.danger { background: #8E6C88; }

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e7eef0;
  color: #263D42;
  font-weight: 600;
  font-size: 12px;
}
.badge.on { background: #63C7B2; color: #fff; }
.badge.off { background: #8E6C88; color: #fff; }
</style>
