export const MENU_CARDS = {
  // === ENCUESTA DE GRADUACIÓN ===
  "Encuesta de Graduación": {
    id: "encuesta-graduacion",
    title: "Encuesta de Graduación",
    description: "Completa la encuesta obligatoria de graduación.",
    icon: new URL("@/components/images/formulario_icon.png", import.meta.url).href,
    route: "/encuesta-estudiante",
    accessKey: "Encuesta de Graduación",
  },

  // ===  CERTIFICADOS ===
  "Certificados": {
    id: "certificados",
    title: "Certificados",
    description: "Consulta y descarga tu certificado digital.",
    icon: new URL("@/components/images/certificado_icon.png", import.meta.url).href,
    route: "/certificado-estudiante",
    accessKey: "Certificados",
  },

  // === CONTACTO SOPORTE ===
  "Contacto Soporte": {
    id: "contacto-soporte",
    title: "Contacto Soporte",
    description: "Comunícate con el administrador o soporte técnico.",
    icon: new URL("@/components/images/soporte_icon.png", import.meta.url).href,
    route: "/contacto-admin",
    accessKey: "Contacto Soporte",
  },

  // === LISTADO ESTUDIANTES ===
  "Listado Estudiantes": {
    id: "listado-estudiantes",
    title: "Listado Estudiantes",
    description: "Administra el registro de los estudiantes.",
    icon: new URL("@/components/images/estudiantes.png", import.meta.url).href,
    route: "/listado-estudiantes",
    accessKey: "Listado Estudiantes",
  },

  // ===  SEGUIMIENTO DE ESTUDIANTES ===
  "Seguimiento de estudiantes": {
    id: "seguimiento-estudiantes",
    title: "Seguimiento de estudiantes",
    description: "Monitorea el progreso de encuestas completadas.",
    icon: new URL("@/components/images/certificado_icon.png", import.meta.url).href,
    route: "/enviar-encuesta",
    accessKey: "Seguimiento de estudiantes",
  },

  // === EDITAR CERTIFICADO ===
  "Editar Certificado": {
    id: "editar-certificado",
    title: "Editar Certificado",
    description: "Crea o modifica los formatos oficiales de certificados.",
    icon: new URL("@/components/images/editarCertificado.png", import.meta.url).href,
    route: "/subir-certificado",
    accessKey: "Editar Certificado",
  },

  // === EDITAR ENCUESTA ===
  "Editar Encuesta": {
    id: "editar-encuesta",
    title: "Editar Encuesta",
    description: "Agrega o modifica las preguntas de las encuestas.",
    icon: new URL("@/components/images/editarEncuesta.png", import.meta.url).href,
    route: "/gestion-encuestas/1",
    accessKey: "Editar Encuesta",
  },

  // ===  VER ENCUESTA DE GRADUACIÓN ===
  "Ver Encuesta de graduación": {
    id: "ver-encuesta",
    title: "Ver Encuesta de graduación",
    description: "Visualiza todas las preguntas y opciones disponibles.",
    icon: new URL("@/components/images/formulario_icon.png", import.meta.url).href,
    route: "/lista-preguntas",
    accessKey: "Ver Encuesta de graduación",
  },

  // ===  DASHBOARD ===
  "Dashboard": {
    id: "dashboard",
    title: "Dashboard",
    description: "Consulta estadísticas globales y filtradas.",
    icon: new URL("@/components/images/reportes.png", import.meta.url).href,
    route: "/reporte-dash",
    accessKey: "Dashboard",
  },

  // === DATOS ESTADÍSTICOS ===
  "Datos Estadísticos": {
    id: "datos-estadisticos",
    title: "Datos Estadísticos",
    description: "Analiza datos de encuestas y certificados emitidos.",
    icon: new URL("@/components/images/datos.png", import.meta.url).href,
    route: "/dashboard",
    accessKey: "Datos Estadísticos",
  },

  // ===  ABM NOTICIAS / ANUNCIOS ===
  "ABM Noticias/Anuncios": {
    id: "noticias",
    title: "ABM Noticias/Anuncios",
    description: "Publica o modifica comunicados y recordatorios.",
    icon: new URL("@/components/images/noticias.png", import.meta.url).href,
    route: "/noticia-form",
    accessKey: "ABM Noticias/Anuncios",
  },

  // ===  SOPORTE / AYUDA ===
  "Soporte/Ayuda": {
    id: "soporte",
    title: "Soporte/Ayuda",
    description: "Envía consultas o reporta problemas al soporte.",
    icon: new URL("@/components/images/soporte_icon.png", import.meta.url).href,
    route: "/formulario-soporte",
    accessKey: "Soporte/Ayuda",
  },

  // === ONFIGURACIÓN DE PLAZOS ===
  "Configuración de Plazos": {
    id: "plazos",
    title: "Configuración de Plazos",
    description: "Establece fechas límites para encuestas o certificados.",
    icon: new URL("@/components/images/plazos_icon.png", import.meta.url).href,
    route: "/formulario-plazos",
    accessKey: "Configuración de Plazos",
  },

  // ===  ABM DIRECTORES ===
  "ABM Directores": {
    id: "directores",
    title: "ABM Directores",
    description: "Agrega o gestiona directores por carrera.",
    icon: new URL("@/components/images/directores.png", import.meta.url).href,
    route: "/gestion-directores",
    accessKey: "ABM Directores",
  },

  // === ABM REPORTES DE LA ENCUESTA ===
  "ABM Reportes de la encuesta": {
    id: "reportes",
    title: "ABM Reportes de la encuesta",
    description: "Consulta reportes por carrera o estado de encuestas.",
    icon: new URL("@/components/images/reportes.png", import.meta.url).href,
    route: "/historial-reportes",
    accessKey: "ABM Reportes de la encuesta",
  },

  // === CERTIFICADOS DE ESTUDIANTES ===
  "Certificados de estudiantes": {
    id: "certificados-estudiantes",
    title: "Certificados de estudiantes",
    description: "Consulta el estado de certificados de estudiantes.",
    icon: new URL("@/components/images/estudiantes_registrados.png", import.meta.url).href,
    route: "/estado-estudiante",
    accessKey: "Certificados de estudiantes",
  },

  // === GESTIÓN DE USUARIOS Y ROLES ===
  "Gestión de usuarios y roles": {
    id: "usuarios-roles",
    title: "Gestión de usuarios y roles",
    description: "Administra roles, permisos y usuarios del sistema.",
    icon: new URL("@/components/images/directores.png", import.meta.url).href,
    route: "/gestion-usuarios-roles",
    accessKey: "Gestión de usuarios y roles",
  },

  // ===  GESTIÓN DE CONTRASEÑAS ===
  "Gestión de contraseñas": {
    id: "contrasenas",
    title: "Gestión de contraseñas",
    description: "Revisa políticas y gestiona contraseñas del sistema.",
    icon: new URL("@/components/images/technical-service.png", import.meta.url).href,
    route: "/menu-seguridad",
    accessKey: "Gestión de contraseñas",
  },
};
