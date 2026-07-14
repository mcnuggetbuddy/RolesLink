import { useState, useMemo, useEffect } from 'react';
import { Save, Download, Calendar, CheckCircle2, Circle, Users } from 'lucide-react';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  Input, Label, Badge, Separator, cn,
} from './ui';

import type { Person, Role, RoleSection, ServiceEvent } from '../lib/types';
import { exportToHTML } from '../lib/export';

interface Props {
  people: Person[];
  events: ServiceEvent[];
  roles: Role[];
  sections: RoleSection[];
  onSave: (e: ServiceEvent) => void;
}

export default function AssignmentPanel({ people, events, roles, sections, onSave }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  const currentEventId = useMemo(() => {
    const existing = events.find(e => e.date === date);
    return existing?.id ?? null;
  }, [events, date]);

  useEffect(() => {
    const existing = events.find(e => e.date === date);
    setAssignments(existing ? { ...existing.assignments } : {});
  }, [date, events]);

  const togglePerson = (roleId: string, personId: string) => {
    setAssignments(prev => {
      const current = prev[roleId] ?? [];
      const updated = current.includes(personId)
        ? current.filter(id => id !== personId)
        : [...current, personId];
      return { ...prev, [roleId]: updated };
    });
  };

  const assignedRoles = roles.filter(r => (assignments[r.id]?.length ?? 0) > 0);
  const unassignedRoles = roles.filter(r => (assignments[r.id]?.length ?? 0) === 0);

  const buildEvent = (): ServiceEvent => ({
    id: currentEventId ?? crypto.randomUUID(),
    date,
    assignments,
    absences: [],
  });

  const handleSave = () => {
    onSave(buildEvent());
    alert('Servicio guardado correctamente.');
  };

  const handleExport = () => {
    exportToHTML(buildEvent(), people, roles, sections);
  };

  const eligiblePeople = (roleId: string) =>
    people.filter(p => !p.exceptions.includes(roleId));

  return (
    <div className="flex flex-col gap-6">
      {/* Date + actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svcDate" className="flex items-center gap-1.5">
                <Calendar size={14} />
                Fecha del servicio
              </Label>
              <Input
                id="svcDate"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={handleExport}>
                <Download size={15} /> Exportar tabla
              </Button>
              <Button onClick={handleSave}>
                <Save size={15} /> Guardar servicio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="success">
          <CheckCircle2 size={12} className="mr-1" />
          {assignedRoles.length} asignados
        </Badge>
        <Badge variant="outline">
          <Circle size={12} className="mr-1" />
          {unassignedRoles.length} sin asignar
        </Badge>
      </div>

      {/* Role sections */}
      {sections.map(section => {
        const sectionRoles = roles.filter(r => r.sectionId === section.id);
        if (sectionRoles.length === 0) return null;
        return (
          <Card key={section.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                {section.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {sectionRoles.map((role, idx) => {
                  const assigned = assignments[role.id] ?? [];
                  const eligible = eligiblePeople(role.id);
                  const isAssigned = assigned.length > 0;

                  return (
                    <div key={role.id}>
                      {idx > 0 && <Separator className="mb-4" />}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {isAssigned
                            ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            : <Circle size={16} className="text-muted-foreground shrink-0" />
                          }
                          <span className={cn(
                            'font-medium text-sm',
                            isAssigned ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {role.label}
                          </span>
                          {role.allowMultiple && (
                            <Badge variant="secondary" className="ml-auto">
                              <Users size={10} className="mr-1" /> múltiple
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {eligible.map(person => {
                            const sel = assigned.includes(person.id);
                            return (
                              <button
                                key={person.id}
                                onClick={() => togglePerson(role.id, person.id)}
                                style={{ borderRadius: 'var(--radius)' }}
                                className={cn(
                                  'px-3 py-1 text-xs font-medium border transition-colors cursor-pointer',
                                  sel
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-border text-foreground hover:bg-secondary hover:border-foreground/30'
                                )}
                              >
                                {person.name}
                              </button>
                            );
                          })}
                          {eligible.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">
                              Sin personas disponibles
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
