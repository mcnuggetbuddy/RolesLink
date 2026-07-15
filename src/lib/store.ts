import { useState, useEffect } from 'react';
import type { Person, Role, RoleSection, ServiceEvent } from './types';
import { INITIAL_PEOPLE, ROLES, ROLE_SECTIONS } from './data';

const STORAGE_KEYS = {
  people: 'ministerio_people',
  events: 'ministerio_events',
  roles: 'ministerio_roles',
  sections: 'ministerio_sections',
};

const AUSENCIA_ROLE_ID = 'ausencia';
const AUSENCIAS_SECTION: RoleSection = { id: 'ausencias', label: 'Ausencias' };
const AUSENCIA_ROLE: Role = {
  id: AUSENCIA_ROLE_ID,
  label: 'No confirmado / Ausente',
  sectionId: 'ausencias',
  allowMultiple: true,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

type LegacyEvent = ServiceEvent & { absences?: string[] };

function migrateEvents(raw: LegacyEvent[]): ServiceEvent[] {
  return raw.map(e => {
    const assignments = { ...(e.assignments ?? {}) };
    if (Array.isArray(e.absences) && e.absences.length > 0) {
      const existing = assignments[AUSENCIA_ROLE_ID] ?? [];
      assignments[AUSENCIA_ROLE_ID] = Array.from(new Set([...existing, ...e.absences]));
    }
    return { id: e.id, date: e.date, assignments };
  });
}

function ensureAusenciasSection(sections: RoleSection[]): RoleSection[] {
  return sections.some(s => s.id === 'ausencias')
    ? sections
    : [...sections, AUSENCIAS_SECTION];
}

function ensureAusenciaRole(roles: Role[]): Role[] {
  return roles.some(r => r.id === AUSENCIA_ROLE_ID)
    ? roles
    : [...roles, AUSENCIA_ROLE];
}

export function useStore() {
  const [people, setPeopleState] = useState<Person[]>(() =>
    load(STORAGE_KEYS.people, INITIAL_PEOPLE)
  );
  const [events, setEventsState] = useState<ServiceEvent[]>(() =>
    migrateEvents(load<LegacyEvent[]>(STORAGE_KEYS.events, []))
  );
  const [roles, setRolesState] = useState<Role[]>(() =>
    ensureAusenciaRole(load(STORAGE_KEYS.roles, ROLES))
  );
  const [sections, setSectionsState] = useState<RoleSection[]>(() =>
    ensureAusenciasSection(load(STORAGE_KEYS.sections, ROLE_SECTIONS))
  );

  useEffect(() => { save(STORAGE_KEYS.people, people); }, [people]);
  useEffect(() => { save(STORAGE_KEYS.events, events); }, [events]);
  useEffect(() => { save(STORAGE_KEYS.roles, roles); }, [roles]);
  useEffect(() => { save(STORAGE_KEYS.sections, sections); }, [sections]);

  const addPerson = (person: Person) => setPeopleState(p => [...p, person]);
  const updatePerson = (person: Person) =>
    setPeopleState(p => p.map(x => x.id === person.id ? person : x));
  const deletePerson = (id: string) =>
    setPeopleState(p => p.filter(x => x.id !== id));

  const saveEvent = (event: ServiceEvent) =>
    setEventsState(e => {
      const exists = e.find(x => x.id === event.id);
      return exists ? e.map(x => x.id === event.id ? event : x) : [...e, event];
    });
  const deleteEvent = (id: string) =>
    setEventsState(e => e.filter(x => x.id !== id));

  const addRole = (role: Role) => setRolesState(r => [...r, role]);
  const updateRole = (role: Role) =>
    setRolesState(r => r.map(x => x.id === role.id ? role : x));
  const deleteRole = (id: string) => {
    setRolesState(r => r.filter(x => x.id !== id));
    setPeopleState(p => p.map(x => ({
      ...x,
      exceptions: x.exceptions.filter(e => e !== id),
    })));
  };

  const addSection = (s: RoleSection) => setSectionsState(x => [...x, s]);
  const updateSection = (s: RoleSection) =>
    setSectionsState(x => x.map(v => v.id === s.id ? s : v));
  const deleteSection = (id: string) =>
    setSectionsState(x => x.filter(v => v.id !== id));

  return {
    people, events, roles, sections,
    addPerson, updatePerson, deletePerson,
    saveEvent, deleteEvent,
    addRole, updateRole, deleteRole,
    addSection, updateSection, deleteSection,
  };
}
