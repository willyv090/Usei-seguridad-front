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
                    :class="'role-' + normalizeRole(u.rol)"
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
              <!-- Nombre del rol -->
              <td>
                <span v-if="!editMode">{{ r.nombreRol }}</span>
                <input v-else v-model="r.nombreRol" class="edit-input" />
              </td>

              <!-- Activo -->
              <td class="center">
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="r.activo"
                    @change.stop="r.activo = !r.activo"
                    :disabled="!editMode"
                  />
                  <span class="slider"></span>
                </label>
              </td>

              <!-- Accesos -->
              <td class="col-accesos">
                <div class="flex-access">
                  <span
                    :title="Array.isArray(r.accesos) ? r.accesos.join(', ') : (r.accesos || 'Sin accesos')"
                  >
                    {{
                      Array.isArray(r.accesos)
                        ? (r.accesos.length ? r.accesos.join(', ') : 'Sin accesos')
                        : (r.accesos || 'Sin accesos')
                    }}
                  </span>

                  <!-- Botón de editar accesos (solo en modo edición) -->
                  <button
                    v-if="editMode"
                    class="action-btn edit-btn small"
                    @click.stop="abrirPopupEdicionAccesos(r)"
                    title="Editar accesos"
                  >
                    <i class="fas fa-pen"></i>
                  </button>
                </div>
              </td>

              <!-- Acciones -->
              <td class="center">
                <button
                  v-if="!editMode"
                  class="action-btn edit-btn"
                  @click.stop="activarEdicion"
                  title="Modificar rol"
                >
                  <i class="fas fa-pen"></i>
                </button>

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
      :initialData="selectedRol"
      :isEditAccessMode="popupMode === 'editar-accesos'"
      @close="closePopup"
      @guardar="onGuardar"
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
      ROLE_LIST_URL: `${BASE_URL}/rol`,
      ROLE_MUTATION_BASE: `${BASE_URL}/rol`,
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
      "Diseño Gráfico",
      ],
        popupMode: '',   
        selectedRol: null,
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
    // 🔹 Restaurar pestaña anterior si existe
    const savedTab = localStorage.getItem('lastTab');
    if (savedTab) {
      this.currentTab = savedTab;
      localStorage.removeItem('lastTab'); // Limpieza opcional
    }

    this.fetchAllRoles();
    this.fetchData();
  },
  methods: {
 normalizeRole(nombre) {
  if (!nombre) return 'default';
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quita tildes
    .replace(/\s+/g, '-')              // espacios → guiones
    .replace(/[^a-z0-9-]/g, '')        // elimina símbolos
    .replace(/-+$/, '');               // 🔹 elimina guiones finales
},

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
        async handleEditarRol(payload) {
          try {
            const accesosString = Array.isArray(payload.accesos)
              ? payload.accesos.join(',')
              : payload.accesos || '';

            const rolPayload = {
              idRol: payload.idRol,
              nombreRol: payload.nombreRol,
              activo: payload.activo,
              accesos: accesosString
            };

            await axios.put(`${this.ROLE_MUTATION_BASE}/${payload.idRol}`, rolPayload, {
              headers: { 'Content-Type': 'application/json' }
            });

            Swal.fire({
              icon: 'success',
              title: 'Accesos actualizados correctamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#63C7B2'
            });

            this.showPopup = false;

            // ✅ Refrescar lista automáticamente sin reload
            await Promise.all([
              this.fetchData(this.currentPage),
              this.fetchAllRoles()
            ]);

          } catch (e) {
            console.error('❌ Error al editar rol:', e);
            Swal.fire('Error', e?.response?.data || 'No se pudieron actualizar los accesos.', 'error');
          }
        },


      onGuardar(payload) {
          if (this.popupMode === 'editar-accesos') {
            this.handleEditarRol(payload);
          } else {
            this.handleGuardarNuevo(payload);
          }
        },
        
      abrirPopupEdicionAccesos(rol) {
          this.showPopup = false;
          this.$nextTick(() => {
            this.showPopup = true;
            this.popupMode = 'editar-accesos'; // <- modo especial
            this.selectedRol = rol;
          });
        },
      capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    setSort(field) {
      if (this.sortBy === field) this.toggleSortDirection();
      else this.sortBy = field;
    },
    switchTab(tab) {
      // Cambiar pestaña
      this.currentTab = tab;
      this.resetTableParams();

      // Cambiar campo de orden según la pestaña
      this.sortBy = tab === 'roles' ? 'nombreRol' : 'nombre';

      // 🔹 Recargar datos automáticamente SIN animación global
      // (sin usar this.loading)
      this.fetchData();

      // 🔹 Si entras a la pestaña de usuarios, recarga roles activos para el popup
      if (tab === 'usuarios') {
        this.fetchAllRoles();
      }
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
        let roles = [];

        if (Array.isArray(data)) roles = data;
        else if (Array.isArray(data?.content)) roles = data.content;
        else if (Array.isArray(data?.roles)) roles = data.roles;

        // ✅ Filtramos solo los roles activos
        this.allRoles = roles.filter(r => r.activo === true);
      } catch (error) {
        console.error('❌ Error al cargar roles:', error);
        this.allRoles = [];
      }
    },
    async abrirEdicionRol(rol) {
      const { value: formValues } = await Swal.fire({
        title: 'Modificar Rol',
        html: `
          <input id="nombreRol" class="swal2-input" placeholder="Nombre del rol" value="${rol.nombreRol || ''}">
          <input id="accesos" class="swal2-input" placeholder="Accesos (separados por coma)" value="${Array.isArray(rol.accesos) ? rol.accesos.join(', ') : rol.accesos || ''}">
          <label style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;margin-top:8px;">
            <input type="checkbox" id="activo" ${rol.activo ? 'checked' : ''}>
            Rol activo
          </label>
        `,
        focusConfirm: false,
        confirmButtonText: 'Guardar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#83cabb',
        preConfirm: () => {
          return {
            nombreRol: document.getElementById('nombreRol').value.trim(),
            accesos: document.getElementById('accesos').value.trim(),
            activo: document.getElementById('activo').checked
          };
        }
      });

      if (!formValues) return; // cancelado

      try {
        const payload = {
          nombreRol: formValues.nombreRol,
          accesos: formValues.accesos,
          activo: formValues.activo
        };

        await axios.put(`${this.ROLE_MUTATION_BASE}/${rol.idRol}`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });

        await this.fetchData(); // 🔄 refrescar tabla

        Swal.fire({
          icon: 'success',
          title: 'Rol actualizado correctamente',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#63C7B2'
        });
      } catch (e) {
        console.error('❌ Error al actualizar rol:', e);
        Swal.fire('Error', e?.response?.data || 'No se pudo actualizar el rol.', 'error');
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
    // 🔄 Refrescar automáticamente los datos al cerrar popup
    setTimeout(() => {
      this.fetchData();
      this.fetchAllRoles();
    }, 300);
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
        
        // 🔹 Nueva parte: creación de ROL
        else if (this.currentTab === 'roles') {
          // Asegurarnos que accesos sea string, no array
          const accesosString = Array.isArray(payload.accesos)
            ? payload.accesos.join(',')   // convierte ["usuarios", "reportes"] → "usuarios,reportes"
            : payload.accesos || '';

          const rolPayload = {
            nombreRol: payload.nombreRol,
            activo: true,
            accesos: accesosString
          };

          await axios.post(this.ROLE_MUTATION_BASE, rolPayload, {
            headers: { 'Content-Type': 'application/json' }
          });

          Swal.fire({
            icon: 'success',
            title: 'Rol creado correctamente',
            text: 'El rol fue guardado y aparecerá en la lista.',
            confirmButtonColor: '#83cabb'
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
      const cambios = this.rows.filter((item, i) => {
        const original = this.backupRows[i];
        return JSON.stringify(item) !== JSON.stringify(original);
      });

      if (!cambios.length) {
        Swal.fire('Sin cambios', 'No hay modificaciones para guardar.', 'info');
        this.editMode = false;
        return;
      }

      const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;

      for (const item of cambios) {
        if (this.currentTab === 'usuarios') {
          // ⚠️ Validar correo
          if (!emailRegex.test(item.correo.trim())) {
            await Swal.fire({
              icon: 'warning',
              title: 'Correo inválido',
              text: `El correo "${item.correo}" no tiene un formato válido (ejemplo: usuario@ucb.edu.bo).`
            });
            return;
          }

          const rolSel = this.allRoles.find(r => r.nombreRol === item.rol);
          const body = {};
          if (item.ci) body.ci = item.ci;
          if (item.nombre) body.nombre = item.nombre;
          if (item.apellido) body.apellido = item.apellido;
          if (item.correo) body.correo = item.correo;
          if (item.telefono) body.telefono = item.telefono;
          if (item.carrera) body.carrera = item.carrera;
          if (rolSel) body.idRol = rolSel.idRol;

          await axios.patch(`${BASE_URL}/usuario/${item.idUsuario}`, body, {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          const body = {
            nombreRol: item.nombreRol,
            activo: item.activo,
            accesos: Array.isArray(item.accesos)
              ? item.accesos.join(',')
              : item.accesos || ''
          };

          await axios.put(`${this.ROLE_MUTATION_BASE}/${item.idRol}`, body, {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Cambios guardados correctamente',
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        localStorage.setItem('lastTab', this.currentTab);
        window.location.reload();
      });
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
td.center .action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  vertical-align: middle;
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

/* === BADGES DE ROLES === */
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

/* ✅ Colores específicos primero (con prioridad alta) */
::v-deep(.role-estudiante) {
  background-color: #7cb97c !important; /* verde */
  color: white !important;
}

::v-deep(.role-director) {
  background-color: #74abdb !important; /* azul */
  color: white !important;
}

::v-deep(.role-administrador) {
  background-color: #a5809e !important; /* violeta oscuro */
  color: white !important;
}

::v-deep(.role-seguridad) {
  background-color: #da726e !important; /* rojo */
  color: white !important;
}

::v-deep(.badge[class*="role-"]:not(.role-estudiante):not(.role-administrador):not(.role-director):not(.role-seguridad)) {
  background-color: #d196d3 !important; 
  color: white !important;
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

/* --- Popup para edición de accesos   --- */
.flex-access {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.action-btn.small {
  padding: 6px;
  font-size: 14px;
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
  background-color: #6eca84;
}

.ball:nth-child(2) {
  animation-delay: -0.2s;
  background-color: #7ed1b7;
}

.ball:nth-child(3) {
  animation-delay: -0.4s;
  background-color: #75c6cc;
}

.ball:nth-child(4) {
  animation-delay: -0.6s;
  background-color: #65a9d3;
}

.ball:nth-child(5) {
  animation-delay: -0.8s;
  background-color: #8e72c0;
}

@keyframes wave {
  0%, 100% {
    transform: translateY(30px);
  }
  50% {
    transform: translateY(-30px);
  }
}

.table-wrap table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-wrap th,
.table-wrap td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.edit-input {
  width: 100%;
  height: 30px;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 1.2;
}

.table-wrap {
  overflow-y: auto;
  max-height: 70vh;
}

.col-accesos .flex-access {
  display: flex;
  gap: 8px;
  align-items: flex-start; 
}

.col-accesos .flex-access > span{
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;   
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
  line-height: 1.25;
  max-height: calc(1.25em * 2);
}

.col-accesos .action-btn.small {
  flex: 0 0 auto;            
  align-self: flex-start;     
}

</style>

