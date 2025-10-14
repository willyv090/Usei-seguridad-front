<template>
  <div>
    <header>
      <NavBar :userRole="userRole" />
    </header>

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
          >
            <i class="fas fa-users"></i>&nbsp;Usuarios
          </button>
          <button
            class="pill"
            :class="{ active: currentTab === 'roles' }"
            @click="switchTab('roles')"
          >
            <i class="fas fa-user-shield"></i>&nbsp;Roles
          </button>

          <span class="divider"></span>

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
              <th>UserID/CI</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
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
                <button class="action-btn edit-btn" @click.stop="edit(idx)">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn delete-btn" @click.stop="remove(getId(u))">
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
              <th>Nombre del rol</th>
              <th>Activo</th>
              <th>Accesos</th>
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
              <td>{{ r.nombreRol || r.nombre_rol }}</td>
              <td>
                <span :class="['badge', (r.activo || r.activo === true) ? 'on' : 'off']">
                  {{ r.activo ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <span>{{ Array.isArray(r.accesos) ? r.accesos.join(', ') : r.accesos }}</span>
              </td>
              <td class="center">
                <button class="action-btn edit-btn" @click.stop="edit(idx)">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn delete-btn" @click.stop="remove(getId(r))">
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

    <FooterComponent />

    <AgregarUsuarioPopup
      v-if="showPopup"
      :mode="currentTab === 'roles' ? 'roles' : 'usuarios'"
      :roles="allRoles"
      @close="closePopup"
      @guardar="handleGuardarNuevo"
    />
  </div>
</template>

<script>
import axios from 'axios';
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
      ROLE_LIST_URL: `${BASE_URL}/usuario/rol`,
      ROLE_MUTATION_BASE: `${BASE_URL}/usuario/rol`,
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
      this.sortBy = tab === 'roles' ? 'nombreRol' : 'nombre';
      this.fetchData();
    },
    resetTableParams() {
      this.searchTerm = '';
      this.currentPage = 1;
      this.sortDirection = 'asc';
      this.selectedId = null;
    },
    selectRow(row) {
      this.selectedId = this.getId(row);
    },
    getId(row) {
      return row.idRol || row.id_rol || row.idUsuario || row.id || row.id_usuario;
    },

    async fetchData(page = 1) {
      try {
        const url = this.currentTab === 'usuarios'
          ? `${BASE_URL}/usuario`
          : this.ROLE_LIST_URL;

        const { data } = await axios.get(url);
        console.log('📦 Datos recibidos:', data);

        if (Array.isArray(data)) this.rows = data;
        else if (Array.isArray(data?.content)) this.rows = data.content;
        else if (Array.isArray(data?.roles)) this.rows = data.roles;
        else this.rows = [];

        this.rows = this.rows.map(r => ({
          idRol: r.idRol || r.id_rol,
          nombreRol: r.nombreRol || r.nombre_rol,
          activo: r.activo,
          accesos: typeof r.accesos === 'string' ? r.accesos.split(',') : r.accesos,
        }));

        this.totalPages = data?.totalPages || 1;
        this.currentPage = page;
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        Swal.fire('Error', 'No se pudo cargar la información.', 'error');
      }
    },

    async fetchAllRoles() {
      try {
        const { data } = await axios.get(this.ROLE_LIST_URL);
        if (Array.isArray(data)) this.allRoles = data;
        else if (Array.isArray(data?.content)) this.allRoles = data.content;
        else if (Array.isArray(data?.roles)) this.allRoles = data.roles;
        else this.allRoles = [];
      } catch (error) {
        console.error('❌ Error al cargar roles:', error);
        this.allRoles = [];
      }
    },

    openNewPopup() {
      this.showPopup = false;
      this.$nextTick(() => {
        this.showPopup = true;
      });
    },

    closePopup() {
      this.showPopup = false;
    },

    async handleGuardarNuevo(payload) {
      try {
        if (this.currentTab === 'usuarios') {
          await axios.post(`${BASE_URL}/usuario`, payload);
        } else {
          const body = {
            nombreRol: payload.nombreRol?.trim(),
            activo: payload.activo === 'true' || payload.activo === true,
            accesos: payload.accesos || [],
          };
          if (!body.nombreRol) {
            Swal.fire('Validación', 'El nombre del rol es obligatorio.', 'warning');
            return;
          }
          await axios.post(this.ROLE_MUTATION_BASE, body);
        }

        this.showPopup = false;
        await Promise.all([this.fetchData(this.currentPage), this.fetchAllRoles()]);
        Swal.fire('Éxito', 'Registro creado correctamente.', 'success');
      } catch (e) {
        console.error('❌ Error al guardar:', e);
        const msg = e?.response?.data ?? 'No se pudo crear el registro.';
        Swal.fire('Error', String(msg), 'error');
      }
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
          : `${this.ROLE_MUTATION_BASE}/${id}`;
        await axios.delete(url);
        await Promise.all([this.fetchData(this.currentPage), this.fetchAllRoles()]);
        Swal.fire('Eliminado', 'Se eliminó correctamente.', 'success');
      } catch (e) {
        console.error('❌ Error al eliminar:', e);
        const msg = e?.response?.data ?? 'No se pudo eliminar.';
        Swal.fire('Error', String(msg), 'error');
      }
    },
  },
};
</script>

<style scoped>
.header-spacer { height: 72px; }
.page-wrap { padding-top: 12px; min-height: 100vh; background-color: #fff; display: flex; flex-direction: column; gap: 16px; align-items: center; padding-left: 2%; padding-right: 2%; }
.title { font-size: 32px; font-weight: 700; margin-top: 6px; color: #000; }
.toolbar { width: 100%; max-width: 1200px; background: #83cabb; border: 1px solid #9fc1c7; border-radius: 14px; padding: 12px; display: flex; justify-content: flex-start; gap: 10px; margin-bottom: 8px; }
.toolbar-left { display: flex; gap: 8px; align-items: center; }
.pill { background: #8E6C88; color: #e6e0e0; border: 1px solid #49505a; border-radius: 999px; padding: 8px 14px; font-size: 14px; cursor: pointer; transition: background .2s ease; }
.pill:hover { background: #3c444e; }
.pill.active { background: #263d42; color: #fff; border-color: #3d555b; }
.divider { width: 1px; height: 24px; background: #494f58; margin: 0 6px; border-radius: 1px; }
.filters { width: 100%; max-width: 1200px; display: flex; gap: 12px; align-items: center; }
.filters input { flex: 1; padding: 10px 12px; border: 1px solid #ccc; border-radius: 10px; }
.filters select { padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
.sort-button { background-color: #263D42; color: white; border: none; padding: 10px 14px; border-radius: 10px; cursor: pointer; }
.table-wrap { width: 100%; max-width: 1200px; background: #CBDADB; padding: 1.6rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,.1); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #263D42; padding: 10px; background: #fff; }
th { background: #263D42; color: #fff; }
.center { text-align: center; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e7eef0; color: #263D42; font-weight: 600; font-size: 12px; }
.badge.on { background: #63C7B2; color: #fff; }
.badge.off { background: #8E6C88; color: #fff; }

/* --- NUEVO ESTILO DE BOTONES DE ACCIÓN --- */
.action-btn {
  padding: 10px;
  margin: 0 5px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #80CED7;
}

.delete-btn {
  background-color: #8E6C88;
}

.action-btn i {
  font-size: 20px;
}

.action-btn:hover {
  transform: scale(1.05);
  opacity: 0.9;
}
</style>
