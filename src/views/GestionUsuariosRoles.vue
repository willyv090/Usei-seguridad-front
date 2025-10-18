<template>
  <div>
    <header>
      <NavBar :userRole="userRole" />
    </header>

    <div class="header-spacer"></div>

    <main class="page-wrap">
      <!-- Animación de carga -->
      <div v-if="loading" class="loading-overlay">
        <div class="container">
          <div class="ball"></div>
          <div class="ball"></div>
          <div class="ball"></div>
          <div class="ball"></div>
          <div class="ball"></div>
        </div>
      </div>

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
        <!-- Botones a la derecha solo en modo edición -->
          <div class="toolbar-right" v-if="editMode">
            <button class="pill save-btn" @click="guardarCambios">
              <i class="fas fa-save"></i>&nbsp;Guardar cambios
            </button>
            <button class="pill cancel-btn" @click="cancelarEdicion">
              <i class="fas fa-times"></i>&nbsp;Cancelar
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
        <select v-model.number="perPage">
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
              <th @click="setSort('ci')">CI</th>
              <th @click="setSort('nombre')">Nombre completo</th>
              <th @click="setSort('correo')">Correo</th>
              <th @click="setSort('telefono')">Teléfono</th>
              <th @click="setSort('carrera')">Carrera</th>
              <th @click="setSort('rol')">Rol</th>
              <th class="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(u, idx) in paginatedRows"
              :key="getId(u) || idx"
              :class="{ selected: selectedId === getId(u) }"
              @click="selectRow(u)"
            >
              <!-- CI -->
              <td>
                <span v-if="!editMode">{{ u.ci }}</span>
                <input v-else v-model="u.ci" class="edit-input" />
              </td>

              <!-- Nombre completo -->
              <td>
                <span v-if="!editMode">{{ u.nombre }} {{ u.apellido }}</span>
                <div v-else class="edit-name">
                  <input v-model="u.nombre" placeholder="Nombre" class="edit-input small" />
                  <input v-model="u.apellido" placeholder="Apellido" class="edit-input small" />
                </div>
              </td>

              <!-- Correo -->
              <td>
                <span v-if="!editMode">{{ u.correo }}</span>
                <input v-else v-model="u.correo" class="edit-input" />
              </td>

              <!-- Teléfono -->
              <td>
                <span v-if="!editMode">{{ u.telefono }}</span>
                <input v-else v-model="u.telefono" class="edit-input" />
              </td>

              <!-- Carrera -->
              <td>
                <span v-if="!editMode">{{ u.carrera }}</span>
                <select v-else v-model="u.carrera" class="edit-input">
                  <option disabled value="">Selecciona una carrera</option>
                  <option v-for="c in carreras" :key="c" :value="c">{{ c }}</option>
                </select>
              </td>


              <!-- Rol -->
              <td>
                <div class="role-badge-wrap">
                  <span
                    v-if="!editMode"
                    class="badge"
                    :class="'role-' + (u.rol || 'default').toLowerCase()"
                  >
                    {{ u.rol }}
                  </span>

                  <select
                    v-else
                    class="role-select"
                    v-model="u.rol"
                  >
                    <option
                      v-for="rol in allRoles"
                      :key="rol.idRol"
                      :value="rol.nombreRol"
                    >
                      {{ rol.nombreRol }}
                    </option>
                  </select>
                </div>
              </td>

              <!-- Acciones -->
              <td class="center">
                <!-- Botón de editar -->
                <button
                  v-if="!editMode"
                  class="action-btn edit-btn"
                  @click.stop="activarEdicion"
                  title="Modificar usuario"
                >
                  <i class="fas fa-pen"></i>
                </button>

                <!-- Botón de eliminar -->
                <button
                  class="action-btn delete-btn"
                  @click.stop="remove(getId(u))"
                  title="Eliminar usuario"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>

                <!-- Botón de enviar credenciales -->
                <button
                  class="action-btn send-btn"
                  @click.stop="enviarCredenciales(u)"
                  title="Enviar credenciales de acceso"
                >
                  <i class="fas fa-paper-plane"></i>
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
              <th @click="setSort('nombreRol')">Nombre del rol</th>
              <th>Activo</th>
              <th>Accesos</th>
              <th class="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, idx) in paginatedRows"
              :key="getId(r) || idx"
              :class="{ selected: selectedId === getId(r) }"
              @click="selectRow(r)"
            >
              <td>{{ r.nombreRol || r.nombre_rol }}</td>
              <td class="center">
                <!-- Toggle Switch -->
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="r.activo"
                    @change.stop="toggleActivo(r)"
                  />
                  <span class="slider"></span>
                </label>
              </td>
              <td>
                <span>
                  {{
                    Array.isArray(r.accesos)
                      ? (r.accesos.length ? r.accesos.join(', ') : 'Sin accesos')
                      : (r.accesos || 'Sin accesos')
                  }}
                </span>
              </td>
              <td class="center">
                <button
                  class="action-btn delete-btn"
                  @click.stop="remove(getId(r))"
                  title="Eliminar rol"
                >
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
      :carreras="carreras"
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
      editMode: false,
      backupRows: [],
      loading: false,
      carreras: [
      "Ingeniería de Sistemas",
      "Ingeniería Civil",
      "Ingeniería Comercial",
      "Ingeniería Ambiental",
      "Psicología",
      "Administración de Empresas",
      "Contaduría Pública",
      "Arquitectura",
      "Derecho",
      "Comunicación Social",
      "Medicina",
      "Bioquímica",
      "Enfermería",
      "Filosofía y Letras",
      "Educación",
      "Trabajo Social",
      "Economía",
      "Turismo",
],

    };
  },
  computed: {
    // Filtrado + ordenamiento
    filteredRows() {
      const term = this.searchTerm.toLowerCase().trim();
      let filtered = this.rows;

      if (term) {
        if (this.currentTab === 'usuarios') {
          filtered = this.rows.filter(u =>
            (u.nombre?.toLowerCase().includes(term)) ||
            (u.apellido?.toLowerCase().includes(term)) ||
            (u.ci?.toLowerCase().includes(term)) ||
            (u.correo?.toLowerCase().includes(term))
          );
        } else {
          filtered = this.rows.filter(r =>
            (r.nombreRol?.toLowerCase().includes(term))
          );
        }
      }

      // Ordenamiento asc/desc
      filtered = [...filtered].sort((a, b) => {
        const valA = (a[this.sortBy] || '').toString().toLowerCase();
        const valB = (b[this.sortBy] || '').toString().toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      // Recalcular páginas
      this.totalPages = Math.ceil(filtered.length / this.perPage) || 1;
      return filtered;
    },

    // Paginación local
    paginatedRows() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredRows.slice(start, start + this.perPage);
    },
  },

  mounted() {
    this.fetchAllRoles();
    this.fetchData();
  },
  methods: {
    async enviarCredenciales(usuario) {
        try {
          this.loading = true; // 🔹 mostrar animación
          await axios.post(`${BASE_URL}/usuario/${usuario.idUsuario}/enviarCredenciales`);
          Swal.fire('Enviado', 'Se han enviado las credenciales al usuario.', 'success');
        } catch (err) {
          console.error('❌ Error al enviar credenciales:', err);
          Swal.fire('Error', 'No se pudieron enviar las credenciales.', 'error');
        } finally {
          this.loading = false; // 🔹 ocultar animación al terminar
        }
      },
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    setSort(field) {
      if (this.sortBy === field) this.toggleSortDirection();
      else this.sortBy = field;
    },
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

    // 👇 Log aquí dentro del try
    console.log('🔎 Datos recibidos del backend:', data);

    if (this.currentTab === 'usuarios') {
      const usuarios = Array.isArray(data) ? data : [];
      this.rows = usuarios.map(u => ({
        idUsuario: u.idUsuario || u.id_usuario,
        ci: u.ci || '',
        nombre: u.nombre || '',
        apellido: u.apellido || '',
        correo: u.correo || '',
        telefono: u.telefono || '',
        carrera: u.carrera || '',
        // ✅ Lógica simplificada para mostrar rol
        rol: u.rol || u.rolEntity?.nombreRol || 'Sin rol'
      }));

    } else {
      let roles = [];
      if (Array.isArray(data)) roles = data;
      else if (Array.isArray(data?.content)) roles = data.content;
      else if (Array.isArray(data?.roles)) roles = data.roles;

      this.rows = roles.map(r => ({
        idRol: r.idRol || r.id_rol,
        nombreRol: r.nombreRol || r.nombre_rol,
        activo: r.activo ?? false,
        accesos: r.accesos
          ? r.accesos.split(',').map(a => a.trim()).filter(a => a.length > 0)
          : [],
      }));
    }

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

      async updateUserRole(usuario) {
    try {
      const userId = usuario.idUsuario;
      const nuevoRol = usuario.rol;

      // Encuentra el objeto completo del rol
      const rolSeleccionado = this.allRoles.find(
        r => r.nombreRol === nuevoRol
      );

      if (!rolSeleccionado) {
        Swal.fire('Error', 'Rol seleccionado no válido.', 'error');
        return;
      }

      await axios.put(`${BASE_URL}/usuario/${userId}/rol`, {
        idRol: rolSeleccionado.idRol
      });

      Swal.fire({
        icon: 'success',
        title: 'Rol actualizado correctamente',
        timer: 1300,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('❌ Error al actualizar rol:', error);
      Swal.fire('Error', 'No se pudo actualizar el rol del usuario.', 'error');
    }
  },


    async toggleActivo(rol) {
      const nuevoEstado = !rol.activo;
      const estadoAnterior = rol.activo;
      rol.activo = nuevoEstado;

      try {
        await axios.put(`${this.ROLE_MUTATION_BASE}/${rol.idRol}/estado`, { activo: nuevoEstado });
        Swal.fire({
          icon: 'success',
          title: `Rol ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
          timer: 1300,
          showConfirmButton: false
        });
      } catch (e) {
        rol.activo = estadoAnterior;
        console.error('❌ Error al cambiar estado:', e);
        Swal.fire('Error', 'No se pudo cambiar el estado del rol.', 'error');
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
          if (!payload.correo || payload.correo.trim() === '') {
            Swal.fire('Advertencia', 'Debe ingresar un correo válido para enviar las credenciales.', 'warning');
            return;
      }
          await axios.post(`${BASE_URL}/usuario`, payload, {
            headers: { 'Content-Type': 'application/json' }
          });

          Swal.fire({
            icon: 'success',
            title: 'Usuario creado correctamente',
            html: `
              Se ha enviado automáticamente un correo con las credenciales iniciales.<br><br>
              <strong>Usuario:</strong> CI del usuario<br>
              <strong>Contraseña:</strong> inicialNombre + apellido + CI<br><br>
              Ejemplo: <em>Rc9172358</em>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#83cabb',
          });
        }
        this.showPopup = false;
        await Promise.all([this.fetchData(this.currentPage), this.fetchAllRoles()]);
        Swal.fire('Éxito', 'Registro creado correctamente.', 'success');
      } catch (e) {
        console.error('❌ Error al guardar rol o usuario:', e.response?.data || e.message);
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
    activarEdicion() {
    this.editMode = true;
    // Hacer una copia profunda de la tabla actual para poder cancelar luego
    this.backupRows = JSON.parse(JSON.stringify(this.rows));
  },

  cancelarEdicion() {
    this.editMode = false;
    // Restaurar datos originales
    this.rows = JSON.parse(JSON.stringify(this.backupRows));
    Swal.fire('Cancelado', 'No se realizaron cambios.', 'info');
  },

  async guardarCambios() {
    try {
      // Detectar cambios reales comparando backup y actual
      const cambios = this.rows.filter((u, i) => {
        const original = this.backupRows[i];
        return JSON.stringify(u) !== JSON.stringify(original);
      });

      if (!cambios.length) {
        Swal.fire('Sin cambios', 'No hay modificaciones para guardar.', 'info');
        this.editMode = false;
        return;
      }

      for (const usuario of cambios) {
        const rolSel = this.allRoles.find(r => r.nombreRol === usuario.rol);
        const body = {};

        // Agregamos solo campos que realmente existen (parcheo parcial)
        if (usuario.ci) body.ci = usuario.ci;
        if (usuario.nombre) body.nombre = usuario.nombre;
        if (usuario.apellido) body.apellido = usuario.apellido;
        if (usuario.correo) body.correo = usuario.correo;
        if (usuario.telefono) body.telefono = usuario.telefono;
        if (usuario.carrera) body.carrera = usuario.carrera;
        if (rolSel) body.idRol = rolSel.idRol;

        // 👇 PATCH en lugar de PUT
        await axios.patch(`${BASE_URL}/usuario/${usuario.idUsuario}`, body, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Cambios guardados correctamente',
        timer: 1500,
        showConfirmButton: false,
      });

      this.editMode = false;
      await this.fetchData(this.currentPage);
    } catch (err) {
      console.error('❌ Error al guardar cambios:', err);
      Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
    }
  },


    handlePageClick(page) {
      this.fetchData(page);
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
.toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.save-btn {
  background-color: #90b991;
  border: 1px solid #4f7551;
}

.cancel-btn {
  background-color: #d68680;
  border: 1px solid #c0392b;
}

/* --- SWITCH TOGGLE --- */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #b0b0b0; /* gris apagado */
  transition: 0.3s;
  border-radius: 24px;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.25);
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #63C7B2;
}
input:checked + .slider:before {
  transform: translateX(22px);
}

/* --- BOTONES DE ACCIÓN --- */
.action-btn {
  position: relative;
  padding: 10px;
  margin: 0 5px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  font-size: 18px;
}

/* Hover general */
.action-btn:hover {
  transform: scale(1.12);
  opacity: 0.9;
}

/* Colores por acción */
.edit-btn {
  background-color: #8E6C88; /* azul */
}
.edit-btn:hover {
  background-color: #b18caa;
}

.delete-btn {
  background-color: #d67070; /* rojo */
}
.delete-btn:hover {
  background-color: #c76969;
}

.send-btn {
  background-color: #8ccfc2; /* verde brillante */
  box-shadow: 0 0 6px rgba(0, 184, 148, 0.5);
}
.send-btn:hover {
  background-color: #6aada1;
  box-shadow: 0 0 10px rgba(0, 184, 148, 0.7);
}

/* --- TOOLTIP PERSONALIZADO --- */
.action-btn::after {
  content: attr(title);
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

/* Triángulo inferior del tooltip */
.action-btn::before {
  content: '';
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #000 transparent transparent transparent;
  opacity: 0;
  transition: opacity 0.25s ease;
}

/* Mostrar tooltip al pasar el mouse */
.action-btn:hover::after,
.action-btn:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(-4px);
  z-index: 10;
}

/* --- Badges de roles con colores --- */
.role-badge-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  text-transform: capitalize;
}

.role-seguridad {
  background-color: #da726e; /* rojo */
}

.role-estudiante {
  background-color: #7cb97c; /* verde */
}

.role-director {
  background-color: #74abdb; /* azul */
}

.role-administrador {
  background-color: #8E6C88; /* violeta */
}

.role-default {
  background-color: #b361b6; /* gris por defecto */
}

.edit-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 13px;
}

.edit-name {
  display: flex;
  gap: 6px;
}

.edit-input.small {
  width: 48%;
}

.edit-input:focus {
  outline: none;
  border-color: #83cabb;
  box-shadow: 0 0 2px #83cabb;
}

/* --- Dropdown compacto para roles --- */
.role-select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f9f9f9;
  font-size: 13px;
  cursor: pointer;
}

/* === ANIMACIÓN DE CARGA === */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.container {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  animation: wave 1.5s ease-in-out infinite;
  background-color: #37bf57;
}

.ball:nth-child(2) {
  animation-delay: -0.2s;
  background-color: #49caa1;
}

.ball:nth-child(3) {
  animation-delay: -0.4s;
  background-color: #12aab4;
}

.ball:nth-child(4) {
  animation-delay: -0.6s;
  background-color: #2c88c1;
}

.ball:nth-child(5) {
  animation-delay: -0.8s;
  background-color: #6b45b1;
}

@keyframes wave {
  0%, 100% {
    transform: translateY(30px);
  }
  50% {
    transform: translateY(-30px);
  }
}

</style>

