import { useMemo, useState } from 'react';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, Badge, Input } from './ui';
import type { Person, Role, ServiceEvent } from '../lib/types';

interface Props {
  people: Person[];
  events: ServiceEvent[];
  roles: Role[];
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function HistoryPanel({ people, events: rawEvents, roles }: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const events = [...rawEvents].sort((a, b) => b.date.localeCompare(a.date));

  const personHistory = useMemo(() => {
    return people.map(person => {
      const participations: Array<{ event: ServiceEvent; roles: string[] }> = [];
      for (const event of events) {
        const roles: string[] = [];
        for (const [roleId, personIds] of Object.entries(event.assignments)) {
          if (personIds.includes(person.id)) roles.push(roleId);
        }
        if (roles.length > 0) participations.push({ event, roles });
      }
      return { person, participations };
    });
  }, [people, events]);

  const filtered = personHistory.filter(({ person }) =>
    person.name.toLowerCase().includes(search.toLowerCase())
  );

  const roleCounts = (participations: typeof personHistory[0]['participations']) => {
    const counts: Record<string, number> = {};
    for (const { roles } of participations) {
      for (const r of roles) counts[r] = (counts[r] ?? 0) + 1;
    }
    return counts;
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Buscar persona..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {events.length === 0 && (
        <p className="text-muted-foreground text-center py-10 text-sm">
          Aún no hay servicios guardados.
        </p>
      )}

      {filtered.map(({ person, participations }) => {
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
    </div>
  );
}
