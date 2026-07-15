import { useState } from 'react';
import { Church } from 'lucide-react';
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
    people, events, roles, sections,
    addPerson, updatePerson, deletePerson,
    saveEvent, deleteEvent,
    addRole, updateRole, deleteRole,
    addSection, updateSection, deleteSection,
  } = useStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center">
            <Church size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-none">
              Ministerio LINK
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gestión de roles de servicio
            </p>
          </div>
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
