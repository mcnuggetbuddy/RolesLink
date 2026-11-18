import { useMemo, useState } from 'react';
import { History, ChevronDown, ChevronRight, User, Briefcase } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input } from './ui';
import type { Person, Role, ServiceEvent } from '../lib/types';

interface Props {
  people: Person[];
  events: ServiceEvent[];
  roles: Role[];
}

type Mode = 'person' | 'role';

function formatDate(d: string) {
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
}

export default function HistoryPanel({ people, events: rawEvents, roles }: Props) {
  const [mode, setMode] = useState<Mode>('person');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const events = useMemo(
    () => [...rawEvents].sort((a, b) => b.date.localeCompare(a.date)),
    [rawEvents]
  );

  const collator = useMemo(
    () => new Intl.Collator('es', { sensitivity: 'base' }),
    []
  );

  const personHistory = useMemo(() => {
    return people.map(person => {
      const participations: Array<{ event: ServiceEvent; roles: string[] }> = [];
      for (const event of events) {
        const roleIds: string[] = [];
        for (const [roleId, personIds] of Object.entries(event.assignments)) {
          if (personIds.includes(person.id)) roleIds.push(roleId);
        }
        if (roleIds.length > 0) participations.push({ event, roles: roleIds });
      }
      return { person, participations };
    });
  }, [people, events]);

  const roleHistory = useMemo(() => {
    const peopleById = new Map(people.map(p => [p.id, p]));
    return roles.map(role => {
      const counts = new Map<string, number>();
      const dates: Array<{ event: ServiceEvent; personId: string }> = [];
      for (const event of events) {
        const ids = event.assignments[role.id] ?? [];
        for (const pid of ids) {
          counts.set(pid, (counts.get(pid) ?? 0) + 1);
          dates.push({ event, personId: pid });
        }
      }
      const ranking = [...counts.entries()]
        .map(([pid, count]) => ({
          person: peopleById.get(pid),
          personId: pid,
          count,
        }))
        .sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          const an = a.person?.name ?? a.personId;
          const bn = b.person?.name ?? b.personId;
          return collator.compare(an, bn);
        });
      const totalAssignments = dates.length;
      return { role, ranking, totalAssignments, dates };
    });
  }, [roles, events, people, collator]);

  const filteredPersons = personHistory.filter(({ person }) =>
    person.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRoles = roleHistory.filter(({ role }) =>
    role.label.toLowerCase().includes(search.toLowerCase())
  );

  const roleCounts = (participations: typeof personHistory[0]['participations']) => {
    const counts: Record<string, number> = {};
    for (const { roles: rs } of participations) {
      for (const r of rs) counts[r] = (counts[r] ?? 0) + 1;
    }
    return counts;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex border border-border rounded-md p-0.5">
          <Button
            size="sm"
            variant={mode === 'person' ? 'default' : 'ghost'}
            onClick={() => { setMode('person'); setExpanded(null); }}
          >
            <User size={14} /> Por persona
          </Button>
          <Button
            size="sm"
            variant={mode === 'role' ? 'default' : 'ghost'}
            onClick={() => { setMode('role'); setExpanded(null); }}
          >
            <Briefcase size={14} /> Por rol
          </Button>
        </div>
        <Input
          placeholder={mode === 'person' ? 'Buscar persona...' : 'Buscar rol...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {events.length === 0 && (
        <p className="text-muted-foreground text-center py-10 text-sm">
          Aún no hay servicios guardados.
        </p>
      )}

      {mode === 'person' && filteredPersons.map(({ person, participations }) => {
        const isOpen = expanded === person.id;
        const counts = roleCounts(participations);
        return (
          <Card key={person.id}>
            <button
              className="w-full text-left px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : person.id)}
            >
              <History size={16} className="text-muted-foreground shrink-0" />
              <span className="font-semibold flex-1">{person.name}</span>
              <Badge variant="secondary">{participations.length} servicios</Badge>
              {isOpen
                ? <ChevronDown size={16} className="text-muted-foreground" />
                : <ChevronRight size={16} className="text-muted-foreground" />
              }
            </button>

            {isOpen && (
              <CardContent className="pt-0">
                {participations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin participaciones registradas.
                  </p>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-2">
                        Roles más frecuentes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(counts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([roleId, count]) => {
                            const role = roles.find(r => r.id === roleId);
                            return (
                              <Badge key={roleId} variant="outline">
                                {role?.label ?? roleId}
                                <span className="ml-1.5 font-bold text-foreground">
                                  ×{count}
                                </span>
                              </Badge>
                            );
                          })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
                        Historial por servicio
                      </p>
                      {participations.map(({ event, roles: participationRoles }) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 border border-border p-3"
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap mt-0.5">
                            {formatDate(event.date)}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {participationRoles.map(roleId => {
                              const role = roles.find(r => r.id === roleId);
                              return (
                                <Badge key={roleId} variant="secondary">
                                  {role?.label ?? roleId}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {mode === 'role' && filteredRoles.map(({ role, ranking, totalAssignments }) => {
        const isOpen = expanded === role.id;
        const isInactive = role.active === false;
        const uniquePeople = ranking.length;
        return (
          <Card key={role.id}>
            <button
              className="w-full text-left px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setExpanded(isOpen ? null : role.id)}
            >
              <Briefcase size={16} className="text-muted-foreground shrink-0" />
              <span className={`font-semibold flex-1${isInactive ? ' line-through opacity-60' : ''}`}>
                {role.label}
              </span>
              {isInactive && (
                <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
              )}
              <Badge variant="secondary">
                {uniquePeople} {uniquePeople === 1 ? 'persona' : 'personas'}
              </Badge>
              <Badge variant="outline">
                {totalAssignments} {totalAssignments === 1 ? 'asignación' : 'asignaciones'}
              </Badge>
              {isOpen
                ? <ChevronDown size={16} className="text-muted-foreground" />
                : <ChevronRight size={16} className="text-muted-foreground" />
              }
            </button>

            {isOpen && (
              <CardContent className="pt-0">
                {ranking.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nadie ha sido asignado a este rol aún.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-1">
                      Personas que han ejercido este rol
                    </p>
                    {ranking.map(({ person, personId, count }) => (
                      <div
                        key={personId}
                        className="flex items-center justify-between gap-3 border border-border px-3 py-2"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <span className="text-sm font-medium">
                          {person?.name ?? <em className="text-muted-foreground">(persona eliminada)</em>}
                        </span>
                        <Badge variant="secondary">
                          <span className="font-bold">×{count}</span>
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
