import type { Role, RoleSection, Person } from './types';

export const ROLE_SECTIONS: RoleSection[] = [
  { id: 'intro', label: 'Apertura' },
  { id: 'encargados', label: 'Encargados' },
  { id: 'puertas', label: 'Puertas y Lobby' },
  { id: 'auditorio', label: 'Auditorio' },
  { id: 'redes', label: 'Redes Sociales' },
  { id: 'otros', label: 'Otros' },
  { id: 'ausencias', label: 'Ausencias' },
];

export const ROLES: Role[] = [
  // Apertura
  { id: 'bienvenida', label: 'Bienvenida', sectionId: 'intro' },
  { id: 'primer_orador', label: 'Primer Orador', sectionId: 'intro' },
  { id: 'cierre', label: 'Cierre', sectionId: 'intro' },
  // Encargados
  { id: 'encargado_piso', label: 'Encargado de Piso', sectionId: 'encargados' },
  { id: 'encargado_bloque_arriba', label: 'Encargado Bloque Arriba', sectionId: 'encargados' },
  { id: 'encargado_bloque_abajo', label: 'Encargado Bloque Abajo', sectionId: 'encargados' },
  // Puertas y Lobby
  { id: 'puerta_vidrio', label: 'Puerta Vidrio', sectionId: 'puertas' },
  { id: 'puerta_madera', label: 'Puerta Madera', sectionId: 'puertas' },
  { id: 'puerta_salida_1', label: 'Puerta Mad Salida 1', sectionId: 'puertas' },
  { id: 'puerta_salida_2', label: 'Puerta Mad Salida 2', sectionId: 'puertas' },
  { id: 'lobby_peticiones', label: 'Lobby / Peticiones', sectionId: 'puertas', allowMultiple: true },
  { id: 'apoyo_oracion', label: 'Apoyo Oración Bloque', sectionId: 'puertas', allowMultiple: true },
  { id: 'abrir_cerrar', label: 'Abrir-Cerrar Puertas', sectionId: 'puertas', allowMultiple: true },
  // Auditorio
  { id: 'decoracion', label: 'Decoración', sectionId: 'auditorio' },
  { id: 'conteo_personas', label: 'Conteo Personas', sectionId: 'auditorio' },
  { id: 'bloque_arriba', label: 'Bloque Arriba', sectionId: 'auditorio', allowMultiple: true, highlight: true },
  { id: 'bloque_abajo', label: 'Bloque Abajo', sectionId: 'auditorio', allowMultiple: true, highlight: true },
  { id: 'kleenex', label: 'Kleenex', sectionId: 'auditorio' },
  { id: 'quitar_cintas', label: 'Quitar / Poner Cintas', sectionId: 'auditorio', allowMultiple: true },
  // Redes Sociales
  { id: 'facebook', label: 'Facebook', sectionId: 'redes' },
  { id: 'youtube', label: 'YouTube', sectionId: 'redes' },
  // Otros
  { id: 'orar_peticiones', label: 'Encargado de Orar por Peticiones', sectionId: 'otros' },
  // Ausencias
  { id: 'ausencia', label: 'No confirmado / Ausente', sectionId: 'ausencias', allowMultiple: true },
];

export const EXCEPTION_MAP: Record<string, string[]> = {
  'jefe de piso': ['encargado_piso'],
  'puerta de vidrio': ['puerta_vidrio'],
  'conteo de personas': ['conteo_personas'],
  'facebook': ['facebook'],
  'encargada de bloque': ['encargado_bloque_arriba', 'encargado_bloque_abajo'],
  'redes sociales': ['facebook', 'youtube'],
};

export const INITIAL_PEOPLE: Person[] = [
  {
    id: '1', name: 'Rosario',
    exceptions: ['encargado_piso', 'puerta_vidrio', 'conteo_personas'],
  },
  {
    id: '2', name: 'Maria',
    exceptions: ['encargado_piso', 'puerta_vidrio', 'conteo_personas'],
  },
  {
    id: '3', name: 'Pablo',
    exceptions: ['encargado_piso'],
  },
  {
    id: '4', name: 'Walter',
    exceptions: ['encargado_piso'],
  },
  {
    id: '5', name: 'Patri',
    exceptions: ['encargado_piso', 'facebook', 'encargado_bloque_arriba', 'encargado_bloque_abajo'],
  },
  {
    id: '6', name: 'Willyam',
    exceptions: ['encargado_piso'],
  },
  {
    id: '7', name: 'Ighor',
    exceptions: ['encargado_piso', 'facebook', 'youtube'],
  },
];
