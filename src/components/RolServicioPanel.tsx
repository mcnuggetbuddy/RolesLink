import { useState, useMemo, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Pencil, Eye, Printer, Image as ImageIcon, X, Calendar, Mic2, DoorOpen, Building2,
  Tv, HeartHandshake, Users, Star, CheckCircle2, CircleDashed,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Person, Role, RoleSection, ServiceEvent } from '../lib/types';

interface Props {
  people: Person[];
  events: ServiceEvent[];
  roles: Role[];
  sections: RoleSection[];
  onSave: (e: ServiceEvent) => void;
}

const VERDE = '#0F6E56';
const VERDE_TINT = '#E7F4EF';
const INK = '#1E2A26';
const MUTED = '#69766F';
const BORDE = '#E3E6E1';

const HIGHLIGHT_BG = '#FFF4D0';
const HIGHLIGHT_ACCENT = '#B58407';

interface Palette { accent: string; tint: string; }

const SECTION_PALETTE: Record<string, Palette> = {
  encargados: { accent: '#0F6E56', tint: '#E7F4EF' },
  puertas:    { accent: '#C97B3D', tint: '#FBEEDD' },
  auditorio:  { accent: '#3B7BB8', tint: '#E4EEF8' },
  redes:      { accent: '#7B5FA8', tint: '#EEE7F5' },
  otros:      { accent: '#B8546B', tint: '#F8E5EA' },
  ausencias:  { accent: '#6B7B75', tint: '#EEF1EF' },
};
const FALLBACK_PALETTE: Palette = { accent: VERDE, tint: VERDE_TINT };

const SECTION_ICONS: Record<string, LucideIcon> = {
  intro: Mic2,
  encargados: Users,
  puertas: DoorOpen,
  auditorio: Building2,
  redes: Tv,
  otros: HeartHandshake,
  ausencias: X,
};

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} de ${MONTHS[m - 1]}`;
}

export default function RolServicioPanel({
  people, events, roles, sections, onSave,
}: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [editando, setEditando] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [eventId, setEventId] = useState<string>(() => crypto.randomUUID());
  const mainRef = useRef<HTMLDivElement>(null);
  const [exportingPng, setExportingPng] = useState(false);

  const handleExportPng = async () => {
    if (!mainRef.current) return;
    setExportingPng(true);
    try {
      await Promise.all([
        document.fonts.load('700 28px Satoshi'),
        document.fonts.load('600 14px Satoshi'),
        document.fonts.load('900 14px Satoshi'),
        document.fonts.load('400 13px Satoshi'),
      ]);
      await document.fonts.ready;

      const node = mainRef.current;
      const padding = 48;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: width + padding * 2,
        height: height + padding * 2,
        style: {
          padding: `${padding}px`,
          boxSizing: 'content-box',
          background: '#ffffff',
        },
        filter: (n) =>
          !(n instanceof HTMLElement && n.classList.contains('no-print')),
      });
      const link = document.createElement('a');
      link.download = `rol-servicio-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando PNG:', err);
    } finally {
      setExportingPng(false);
    }
  };

  useEffect(() => {
    const existing = events.find(e => e.date === date);
    if (existing) {
      setAssignments({ ...existing.assignments });
      setEventId(existing.id);
    } else {
      setAssignments({});
      setEventId(crypto.randomUUID());
    }
  }, [date, events]);

  const peopleById = useMemo(() => {
    const m = new Map<string, Person>();
    for (const p of people) m.set(p.id, p);
    return m;
  }, [people]);

  const collator = useMemo(
    () => new Intl.Collator('es', { sensitivity: 'base' }),
    []
  );

  const sortedPeople = useMemo(
    () => [...people].sort((a, b) => collator.compare(a.name, b.name)),
    [people, collator]
  );

  const persist = (nextAssignments: Record<string, string[]>) => {
    onSave({
      id: eventId,
      date,
      assignments: nextAssignments,
    });
  };

  const toggleAssign = (roleId: string, personId: string) => {
    const cur = assignments[roleId] ?? [];
    const nextForRole = cur.includes(personId)
      ? cur.filter(id => id !== personId)
      : [...cur, personId];
    const next = { ...assignments, [roleId]: nextForRole };
    setAssignments(next);
    persist(next);
  };

  const namesFor = (roleId: string) => {
    const ids = assignments[roleId] ?? [];
    return ids
      .map(id => peopleById.get(id)?.name)
      .filter((n): n is string => !!n)
      .sort((a, b) => collator.compare(a, b))
      .join(', ');
  };

  const eligible = (roleId: string) =>
    sortedPeople.filter(p => !p.exceptions.includes(roleId));

  const { assignedPeople, unassignedPeople } = useMemo(() => {
    const assignedIds = new Set<string>();
    for (const ids of Object.values(assignments)) {
      for (const id of ids) assignedIds.add(id);
    }
    const assigned: Person[] = [];
    const unassigned: Person[] = [];
    for (const p of sortedPeople) {
      if (assignedIds.has(p.id)) assigned.push(p);
      else unassigned.push(p);
    }
    return { assignedPeople: assigned, unassignedPeople: unassigned };
  }, [assignments, sortedPeople]);

  const introSection = sections.find(s => s.id === 'intro');
  const introRoles = introSection
    ? roles.filter(r => r.sectionId === 'intro')
    : [];
  const otherSections = sections.filter(s => s.id !== 'intro');

  return (
    <div className="rol-servicio-wrapper" style={{
      display: 'flex', gap: 20, alignItems: 'flex-start',
      margin: '0 auto', maxWidth: 1040,
      fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif",
      color: INK,
    }}>
      <style>{`
        .rol-tabla-upper, .rol-tabla-upper * { text-transform: uppercase; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          main { max-width: none !important; padding: 0 !important; }
          .rol-servicio-main { max-width: none !important; }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @media (max-width: 960px) {
          .rol-servicio-aside { display: none !important; }
        }
      `}</style>
      <div ref={mainRef} className="rol-servicio-main" style={{ flex: 1, minWidth: 0, maxWidth: 760, margin: '0 auto' }}>

      {/* Actions */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 18 }}>
        <button
          onClick={() => setEditando(!editando)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: `1px solid ${editando ? VERDE : BORDE}`,
            background: editando ? VERDE_TINT : '#fff',
            color: editando ? VERDE : INK,
            borderRadius: 10, padding: '8px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {editando ? <Eye size={15} /> : <Pencil size={15} />}
          {editando ? 'Ver resultado' : 'Editar rol'}
        </button>
        <button
          onClick={handleExportPng}
          disabled={exportingPng}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: `1px solid ${BORDE}`, background: '#fff', color: INK,
            borderRadius: 10, padding: '8px 14px',
            fontSize: 13, fontWeight: 600,
            cursor: exportingPng ? 'wait' : 'pointer',
            opacity: exportingPng ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          <ImageIcon size={15} /> {exportingPng ? 'Exportando…' : 'Exportar PNG'}
        </button>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: 'none', background: VERDE, color: '#fff',
            borderRadius: 10, padding: '8px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Printer size={15} /> Imprimir / PDF
        </button>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 12, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <div>
          <p style={{
            margin: 0, fontSize: 11, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: MUTED, fontWeight: 600,
          }}>
            Rol de servicio
          </p>
          <h1 style={{
            margin: '2px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em',
          }}>
            Ministerio LINK
          </h1>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: VERDE_TINT, color: VERDE,
          borderRadius: 10, padding: '8px 14px',
          fontWeight: 600, fontSize: 14,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <Calendar size={15} />
          {editando ? (
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                border: 'none', background: 'transparent', color: VERDE,
                fontWeight: 600, fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
          ) : (
            formatFecha(date)
          )}
        </div>
      </div>

      {/* Programa (dark banner) */}
      {introRoles.length > 0 && (
        <div className="rol-tabla-upper" style={{ background: INK, borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Mic2 size={14} color="#8FD4BE" />
            <span style={{
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#8FD4BE', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {introSection?.label ?? 'Programa'}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${introRoles.length}, 1fr)`,
            gap: 10,
          }}>
            {introRoles.map((role, i) => {
              const assignedIds = assignments[role.id] ?? [];
              const elig = eligible(role.id);
              return (
                <div key={role.id} style={{
                  textAlign: 'center',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  padding: '0 6px',
                }}>
                  <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                    {role.label}
                  </p>
                  {editando ? (
                    <div style={{
                      marginTop: 6, display: 'flex', flexWrap: 'wrap',
                      gap: 4, justifyContent: 'center',
                    }}>
                      {elig.map(p => {
                        const selected = assignedIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggleAssign(role.id, p.id)}
                            style={{
                              border: `1px solid ${selected ? '#8FD4BE' : 'rgba(255,255,255,0.25)'}`,
                              background: selected ? '#8FD4BE' : 'rgba(255,255,255,0.08)',
                              color: selected ? INK : '#fff',
                              borderRadius: 999,
                              padding: '3px 8px',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ margin: '3px 0 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                      {namesFor(role.id) || '—'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: other sections + ausencias */}
      <div className="rol-tabla-upper" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 12,
      }}>
        {otherSections.map(section => {
          const sectionRoles = roles.filter(r => r.sectionId === section.id);
          if (sectionRoles.length === 0) return null;
          const Icono = SECTION_ICONS[section.id] ?? Users;
          const palette = SECTION_PALETTE[section.id] ?? FALLBACK_PALETTE;
          return (
            <div key={section.id} style={{
              background: '#fff', border: `1px solid ${BORDE}`,
              borderTop: `4px solid ${palette.accent}`,
              borderRadius: 14, padding: '14px 16px',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Icono size={15} color={palette.accent} />
                <span style={{
                  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: palette.accent, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {section.label}
                </span>
              </div>
              <div>
                {sectionRoles.map((role, i) => {
                  const assignedIds = assignments[role.id] ?? [];
                  const elig = eligible(role.id);
                  const hl = !!role.highlight;
                  const chipAccent = hl ? HIGHLIGHT_ACCENT : palette.accent;
                  return (
                    <div key={role.id} style={{
                      padding: hl ? '8px 10px' : '8px 0',
                      marginTop: hl && i > 0 ? 4 : 0,
                      marginBottom: hl ? 4 : 0,
                      borderTop: i > 0 && !hl ? `1px solid ${BORDE}` : 'none',
                      background: hl ? HIGHLIGHT_BG : 'transparent',
                      borderRadius: hl ? 8 : 0,
                      fontSize: 13.5,
                    }}>
                      {editando ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{
                            color: hl ? HIGHLIGHT_ACCENT : MUTED,
                            fontSize: 12,
                            fontWeight: hl ? 700 : 400,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            {hl && <Star size={11} fill={HIGHLIGHT_ACCENT} color={HIGHLIGHT_ACCENT} />}
                            {role.label}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {elig.length === 0 ? (
                              <span style={{ fontSize: 12, color: MUTED, fontStyle: 'italic' }}>
                                Sin personas disponibles
                              </span>
                            ) : (
                              elig.map(p => {
                                const selected = assignedIds.includes(p.id);
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => toggleAssign(role.id, p.id)}
                                    style={{
                                      border: `1px solid ${selected ? chipAccent : BORDE}`,
                                      background: selected ? chipAccent : '#fff',
                                      color: selected ? '#fff' : INK,
                                      borderRadius: 999,
                                      padding: '3px 10px',
                                      fontSize: 12,
                                      cursor: 'pointer',
                                      fontFamily: 'inherit',
                                    }}
                                  >
                                    {p.name}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: 8,
                          alignItems: 'center',
                        }}>
                          <span style={{
                            color: hl ? HIGHLIGHT_ACCENT : MUTED,
                            fontWeight: hl ? 700 : 600,
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                          }}>
                            {hl && <Star size={12} fill={HIGHLIGHT_ACCENT} color={HIGHLIGHT_ACCENT} />}
                            {role.label}
                          </span>
                          <span style={{
                            fontWeight: 900,
                            textAlign: 'right',
                            color: INK,
                            fontSize: hl ? 14.5 : 13.5,
                            whiteSpace: 'nowrap',
                          }}>
                            {namesFor(role.id) || '—'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      </div>
      </div>

      <aside className="no-print rol-servicio-aside" style={{
        width: 240, flexShrink: 0,
        position: 'sticky', top: 20,
        background: '#fff', border: `1px solid ${BORDE}`,
        borderRadius: 14, padding: '14px 16px',
        maxHeight: 'calc(100vh - 40px)', overflow: 'auto',
      }}>
        <p style={{
          margin: 0, fontSize: 11, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: MUTED, fontWeight: 600,
        }}>
          Resumen
        </p>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CheckCircle2 size={14} color={VERDE} />
            <span style={{ fontSize: 12, fontWeight: 700, color: VERDE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Asignados
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 700,
              background: VERDE_TINT, color: VERDE,
              borderRadius: 999, padding: '1px 8px',
            }}>
              {assignedPeople.length}
            </span>
          </div>
          {assignedPeople.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: MUTED, fontStyle: 'italic' }}>
              Nadie asignado aún
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {assignedPeople.map(p => (
                <li key={p.id} style={{
                  fontSize: 13, color: INK,
                  padding: '4px 8px', borderRadius: 6,
                  background: VERDE_TINT,
                }}>
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDE}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CircleDashed size={14} color={MUTED} />
            <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Sin asignar
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 700,
              background: '#F1F2EF', color: MUTED,
              borderRadius: 999, padding: '1px 8px',
            }}>
              {unassignedPeople.length}
            </span>
          </div>
          {unassignedPeople.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: MUTED, fontStyle: 'italic' }}>
              Todos asignados
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {unassignedPeople.map(p => (
                <li key={p.id} style={{
                  fontSize: 13, color: INK,
                  padding: '4px 8px', borderRadius: 6,
                  border: `1px dashed ${BORDE}`,
                }}>
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
