import { useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Trash2, Save, Users } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input, Label, Separator, cn } from './ui';
import type { Person, Role, RoleSection, ServiceEvent } from '../lib/types';

interface Props {
  people: Person[];
  events: ServiceEvent[];
  roles: Role[];
  sections: RoleSection[];
  onSave: (e: ServiceEvent) => void;
  onDelete: (id: string) => void;
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function ServicesPanel({
  people, events: rawEvents, roles, sections, onSave, onDelete,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingDates, setEditingDates] = useState<Record<string, string>>({});

  const events = useMemo(
    () => [...rawEvents].sort((a, b) => b.date.localeCompare(a.date)),
    [rawEvents]
  );

  const peopleById = useMemo(() => {
    const map = new Map<string, Person>();
    for (const p of people) map.set(p.id, p);
    return map;
  }, [people]);

  const collator = useMemo(() => new Intl.Collator('es', { sensitivity: 'base' }), []);

  const assignedCount = (event: ServiceEvent) =>
    Object.values(event.assignments).filter(ids => ids.length > 0).length;

  const handleDateChange = (id: string, value: string) => {
    setEditingDates(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveDate = (event: ServiceEvent) => {
    const newDate = editingDates[event.id];
    if (!newDate || newDate === event.date) return;
    const conflict = events.find(e => e.id !== event.id && e.date === newDate);
    if (conflict) {
      alert('Ya existe un servicio con esa fecha.');
      return;
    }
    onSave({ ...event, date: newDate });
    setEditingDates(prev => {
      const { [event.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleDelete = (event: ServiceEvent) => {
    if (confirm(`¿Eliminar servicio del ${formatDate(event.date)}? Esta acción no se puede deshacer.`)) {
      onDelete(event.id);
      if (expanded === event.id) setExpanded(null);
    }
  };

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10 text-sm">
        Aún no hay servicios guardados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map(event => {
        const isOpen = expanded === event.id;
        const count = assignedCount(event);
        const dateValue = editingDates[event.id] ?? event.date;
        const dateChanged = dateValue !== event.date;

        return (
          <Card key={event.id}>
            <button
              className="w-full text-left px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : event.id)}
            >
              <Calendar size={16} className="text-muted-foreground shrink-0" />
              <span className="font-semibold flex-1">{formatDate(event.date)}</span>
              <Badge variant="secondary">
                <Users size={10} className="mr-1" />
                {count} roles
              </Badge>
              {isOpen
                ? <ChevronDown size={16} className="text-muted-foreground" />
                : <ChevronRight size={16} className="text-muted-foreground" />
              }
            </button>

            {isOpen && (
              <CardContent className="pt-0">
                <div className="flex flex-col gap-5">
                  {/* Date editor + delete */}
                  <div className="flex flex-wrap items-end gap-3 pb-4 border-b border-border">
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5">
                        <Calendar size={14} /> Fecha
                      </Label>
                      <Input
                        type="date"
                        value={dateValue}
                        onChange={e => handleDateChange(event.id, e.target.value)}
                        className="w-44"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveDate(event)}
                      disabled={!dateChanged}
                    >
                      <Save size={13} /> Guardar fecha
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="ml-auto"
                      onClick={() => handleDelete(event)}
                    >
                      <Trash2 size={13} /> Eliminar servicio
                    </Button>
                  </div>

                  {/* Assignments grouped by section */}
                  {count === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Sin roles asignados en este servicio.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {sections.map(section => {
                        const sectionRoles = roles.filter(
                          r =>
                            r.sectionId === section.id &&
                            (event.assignments[r.id]?.length ?? 0) > 0
                        );
                        if (sectionRoles.length === 0) return null;
                        return (
                          <div key={section.id} className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
                              {section.label}
                            </p>
                            <div className="flex flex-col gap-2">
                              {sectionRoles.map((role, idx) => {
                                const assignedPeople = (event.assignments[role.id] ?? [])
                                  .map(id => peopleById.get(id))
                                  .filter((p): p is Person => !!p)
                                  .sort((a, b) => collator.compare(a.name, b.name));
                                return (
                                  <div key={role.id}>
                                    {idx > 0 && <Separator className="mb-2" />}
                                    <div className="flex flex-wrap items-start gap-2">
                                      <span className={cn(
                                        'text-sm font-medium min-w-[180px] shrink-0',
                                      )}>
                                        {role.label}
                                      </span>
                                      <div className="flex flex-wrap gap-1.5 flex-1">
                                        {assignedPeople.map(p => (
                                          <Badge key={p.id} variant="secondary">
                                            {p.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
