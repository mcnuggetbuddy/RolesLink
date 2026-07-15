import { useState } from 'react';
import { Tabs } from './components/ui';
import { useStore } from './lib/store';
import RolServicioPanel from './components/RolServicioPanel';
import PeoplePanel from './components/PeoplePanel';
import RolesPanel from './components/RolesPanel';
import HistoryPanel from './components/HistoryPanel';
import ServicesPanel from './components/ServicesPanel';

const TABS = [
  { value: 'rol', label: 'Rol de servicio' },
  { value: 'services', label: 'Servicios' },
  { value: 'people', label: 'Personas' },
  { value: 'roles', label: 'Roles' },
  { value: 'history', label: 'Historial' },
];

export default function App() {
  const [tab, setTab] = useState('rol');
  const {
    people, events, roles, sections, loading,
    addPerson, updatePerson, deletePerson,
    saveEvent, deleteEvent,
    addRole, updateRole, deleteRole,
    addSection, updateSection, deleteSection,
  } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-3">
          <img
            src="/link-logo.jpg"
            alt="Ministerio LINK"
            className="h-10 w-auto"
          />
          <p className="text-xs text-muted-foreground">
            Gestión de roles de servicio
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Tabs value={tab} onValueChange={setTab} tabs={TABS}>
          {tab === 'rol' && (
            <RolServicioPanel
              people={people}
              events={events}
              roles={roles}
              sections={sections}
              onSave={saveEvent}
            />
          )}
          {tab === 'services' && (
            <ServicesPanel
              people={people}
              events={events}
              roles={roles}
              sections={sections}
              onSave={saveEvent}
              onDelete={deleteEvent}
            />
          )}
          {tab === 'people' && (
            <PeoplePanel
              people={people}
              roles={roles}
              onAdd={addPerson}
              onUpdate={updatePerson}
              onDelete={deletePerson}
            />
          )}
          {tab === 'roles' && (
            <RolesPanel
              roles={roles}
              sections={sections}
              onAddRole={addRole}
              onUpdateRole={updateRole}
              onDeleteRole={deleteRole}
              onAddSection={addSection}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
            />
          )}
          {tab === 'history' && (
            <HistoryPanel people={people} events={events} roles={roles} />
          )}
        </Tabs>
      </main>
    </div>
  );
}
