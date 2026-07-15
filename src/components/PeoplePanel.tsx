import { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, X, Save, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import {
  Button, Card,
  Input, Label, Dialog, Badge,
} from './ui';
import type { Person, Role } from '../lib/types';

interface Props {
  people: Person[];
  roles: Role[];
  onAdd: (p: Person) => void;
  onUpdate: (p: Person) => void;
  onDelete: (id: string) => void;
}

const emptyForm = (): Omit<Person, 'id'> => ({ name: '', exceptions: [] });

export default function PeoplePanel({ people, roles, onAdd, onUpdate, onDelete }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (p: Person) => {
    setEditing(p);
    setForm({ name: p.name, exceptions: [...p.exceptions] });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      onUpdate({ ...editing, ...form });
    } else {
      onAdd({ id: crypto.randomUUID(), ...form });
    }
    setDialogOpen(false);
  };

  const toggleException = (roleId: string) => {
    setForm(f => ({
      ...f,
      exceptions: f.exceptions.includes(roleId)
        ? f.exceptions.filter(e => e !== roleId)
        : [...f.exceptions, roleId],
    }));
  };

  const filtered = useMemo(() => {
    const list = people.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    const collator = new Intl.Collator('es', { sensitivity: 'base' });
    list.sort((a, b) =>
      sortDir === 'asc'
        ? collator.compare(a.name, b.name)
        : collator.compare(b.name, a.name)
    );
    return list;
  }, [people, search, sortDir]);

  const total = people.length;
  const showingFiltered = search.trim().length > 0 && filtered.length !== total;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Personas</h2>
        <Badge variant="secondary">
          {showingFiltered ? `${filtered.length} de ${total}` : `${total} en total`}
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Buscar persona..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
          title={sortDir === 'asc' ? 'Ordenado A → Z' : 'Ordenado Z → A'}
        >
          {sortDir === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
          {sortDir === 'asc' ? 'A → Z' : 'Z → A'}
        </Button>
        <Button onClick={openNew} size="sm">
          <Plus size={16} /> Agregar persona
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(person => (
          <Card key={person.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between">
              <span className="font-semibold text-base">{person.name}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(person)}>
                  <Pencil size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    if (confirm(`¿Eliminar a ${person.name}?`)) onDelete(person.id);
                  }}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
            {person.exceptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-1 leading-5">
                  Excepciones:
                </span>
                {person.exceptions.map(rid => {
                  const role = roles.find(r => r.id === rid);
                  return (
                    <Badge key={rid} variant="outline" className="text-[10px]">
                      {role?.label ?? rid}
                    </Badge>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No se encontraron personas.
          </p>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Editar persona' : 'Nueva persona'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pname">Nombre</Label>
            <Input
              id="pname"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre completo"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Roles que NO puede hacer (excepciones)</Label>
            <div
              className="max-h-56 overflow-y-auto flex flex-col gap-1 border border-border p-3"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {roles.map(role => (
                <label key={role.id} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                  <input
                    type="checkbox"
                    checked={form.exceptions.includes(role.id)}
                    onChange={() => toggleException(role.id)}
                    className="accent-primary"
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X size={15} /> Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save size={15} /> Guardar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
