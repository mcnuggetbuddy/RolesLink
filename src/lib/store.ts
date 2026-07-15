import { useEffect, useState } from 'react';
import type { Person, Role, RoleSection, ServiceEvent } from './types';
import { supabase } from './supabase';

type PersonRow = { id: string; name: string; exceptions: string[] };
type RoleRow = {
  id: string;
  label: string;
  section_id: string;
  allow_multiple: boolean | null;
  highlight: boolean | null;
};
type SectionRow = { id: string; label: string };
type EventRow = {
  id: string;
  date: string;
  assignments: Record<string, string[]>;
};

const rowToPerson = (r: PersonRow): Person => ({
  id: r.id,
  name: r.name,
  exceptions: r.exceptions ?? [],
});

const rowToRole = (r: RoleRow): Role => ({
  id: r.id,
  label: r.label,
  sectionId: r.section_id,
  allowMultiple: r.allow_multiple ?? undefined,
  highlight: r.highlight ?? undefined,
});

const rowToSection = (r: SectionRow): RoleSection => ({ id: r.id, label: r.label });

const rowToEvent = (r: EventRow): ServiceEvent => ({
  id: r.id,
  date: r.date,
  assignments: r.assignments ?? {},
});

const personToRow = (p: Person): PersonRow => ({
  id: p.id,
  name: p.name,
  exceptions: p.exceptions,
});

const roleToRow = (r: Role): RoleRow => ({
  id: r.id,
  label: r.label,
  section_id: r.sectionId,
  allow_multiple: r.allowMultiple ?? false,
  highlight: r.highlight ?? false,
});

const sectionToRow = (s: RoleSection): SectionRow => ({ id: s.id, label: s.label });

const eventToRow = (e: ServiceEvent): EventRow => ({
  id: e.id,
  date: e.date,
  assignments: e.assignments,
});

function logError(action: string, error: unknown) {
  console.error(`[store] ${action}:`, error);
}

export function useStore() {
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<ServiceEvent[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sections, setSections] = useState<RoleSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [peopleRes, rolesRes, sectionsRes, eventsRes] = await Promise.all([
        supabase.from('people').select('*'),
        supabase.from('roles').select('*'),
        supabase.from('role_sections').select('*'),
        supabase.from('service_events').select('*'),
      ]);
      if (cancelled) return;
      if (peopleRes.error) logError('load people', peopleRes.error);
      else setPeople((peopleRes.data as PersonRow[]).map(rowToPerson));
      if (rolesRes.error) logError('load roles', rolesRes.error);
      else setRoles((rolesRes.data as RoleRow[]).map(rowToRole));
      if (sectionsRes.error) logError('load sections', sectionsRes.error);
      else setSections((sectionsRes.data as SectionRow[]).map(rowToSection));
      if (eventsRes.error) logError('load events', eventsRes.error);
      else setEvents((eventsRes.data as EventRow[]).map(rowToEvent));
      setLoading(false);
    })();

    const channel = supabase
      .channel('roleslink')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, payload => {
        if (payload.eventType === 'DELETE') {
          setPeople(p => p.filter(x => x.id !== (payload.old as PersonRow).id));
        } else {
          const row = rowToPerson(payload.new as PersonRow);
          setPeople(p => {
            const i = p.findIndex(x => x.id === row.id);
            return i === -1 ? [...p, row] : p.map(x => x.id === row.id ? row : x);
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, payload => {
        if (payload.eventType === 'DELETE') {
          setRoles(r => r.filter(x => x.id !== (payload.old as RoleRow).id));
        } else {
          const row = rowToRole(payload.new as RoleRow);
          setRoles(r => {
            const i = r.findIndex(x => x.id === row.id);
            return i === -1 ? [...r, row] : r.map(x => x.id === row.id ? row : x);
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_sections' }, payload => {
        if (payload.eventType === 'DELETE') {
          setSections(s => s.filter(x => x.id !== (payload.old as SectionRow).id));
        } else {
          const row = rowToSection(payload.new as SectionRow);
          setSections(s => {
            const i = s.findIndex(x => x.id === row.id);
            return i === -1 ? [...s, row] : s.map(x => x.id === row.id ? row : x);
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_events' }, payload => {
        if (payload.eventType === 'DELETE') {
          setEvents(e => e.filter(x => x.id !== (payload.old as EventRow).id));
        } else {
          const row = rowToEvent(payload.new as EventRow);
          setEvents(e => {
            const i = e.findIndex(x => x.id === row.id);
            return i === -1 ? [...e, row] : e.map(x => x.id === row.id ? row : x);
          });
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const addPerson = (person: Person) => {
    setPeople(p => [...p, person]);
    supabase.from('people').insert(personToRow(person)).then(({ error }) => {
      if (error) logError('addPerson', error);
    });
  };
  const updatePerson = (person: Person) => {
    setPeople(p => p.map(x => x.id === person.id ? person : x));
    supabase.from('people').upsert(personToRow(person)).then(({ error }) => {
      if (error) logError('updatePerson', error);
    });
  };
  const deletePerson = (id: string) => {
    setPeople(p => p.filter(x => x.id !== id));
    supabase.from('people').delete().eq('id', id).then(({ error }) => {
      if (error) logError('deletePerson', error);
    });
  };

  const saveEvent = (event: ServiceEvent) => {
    setEvents(e => {
      const exists = e.find(x => x.id === event.id);
      return exists ? e.map(x => x.id === event.id ? event : x) : [...e, event];
    });
    supabase.from('service_events').upsert(eventToRow(event)).then(({ error }) => {
      if (error) logError('saveEvent', error);
    });
  };
  const deleteEvent = (id: string) => {
    setEvents(e => e.filter(x => x.id !== id));
    supabase.from('service_events').delete().eq('id', id).then(({ error }) => {
      if (error) logError('deleteEvent', error);
    });
  };

  const addRole = (role: Role) => {
    setRoles(r => [...r, role]);
    supabase.from('roles').insert(roleToRow(role)).then(({ error }) => {
      if (error) logError('addRole', error);
    });
  };
  const updateRole = (role: Role) => {
    setRoles(r => r.map(x => x.id === role.id ? role : x));
    supabase.from('roles').upsert(roleToRow(role)).then(({ error }) => {
      if (error) logError('updateRole', error);
    });
  };
  const deleteRole = (id: string) => {
    setRoles(r => r.filter(x => x.id !== id));
    setPeople(p => p.map(x => ({
      ...x,
      exceptions: x.exceptions.filter(e => e !== id),
    })));
    supabase.from('roles').delete().eq('id', id).then(({ error }) => {
      if (error) logError('deleteRole', error);
    });
  };

  const addSection = (s: RoleSection) => {
    setSections(x => [...x, s]);
    supabase.from('role_sections').insert(sectionToRow(s)).then(({ error }) => {
      if (error) logError('addSection', error);
    });
  };
  const updateSection = (s: RoleSection) => {
    setSections(x => x.map(v => v.id === s.id ? s : v));
    supabase.from('role_sections').upsert(sectionToRow(s)).then(({ error }) => {
      if (error) logError('updateSection', error);
    });
  };
  const deleteSection = (id: string) => {
    setSections(x => x.filter(v => v.id !== id));
    supabase.from('role_sections').delete().eq('id', id).then(({ error }) => {
      if (error) logError('deleteSection', error);
    });
  };

  return {
    people, events, roles, sections, loading,
    addPerson, updatePerson, deletePerson,
    saveEvent, deleteEvent,
    addRole, updateRole, deleteRole,
    addSection, updateSection, deleteSection,
  };
}
