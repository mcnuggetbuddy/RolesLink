import { useState } from 'react';
import {
  Pencil, Trash2, Plus, X, Save, Users, FolderPlus, Star,
} from 'lucide-react';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  Input, Label, Dialog, Badge, Select, Separator,
} from './ui';
import type { Role, RoleSection } from '../lib/types';

interface Props {
  roles: Role[];
  sections: RoleSection[];
  onAddRole: (r: Role) => void;
  onUpdateRole: (r: Role) => void;
  onDeleteRole: (id: string) => void;
  onAddSection: (s: RoleSection) => void;
  onUpdateSection: (s: RoleSection) => void;
  onDeleteSection: (id: string) => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function uniqueId(base: string, existing: { id: string }[]) {
  const clean = slugify(base) || 'item';
  let id = clean;
  let i = 1;
  while (existing.some(e => e.id === id)) id = `${clean}_${++i}`;
  return id;
}

const emptyRoleForm = (sectionId: string): Omit<Role, 'id'> => ({
  label: '', sectionId, allowMultiple: false, highlight: false,
});

export default function RolesPanel({
  roles, sections,
  onAddRole, onUpdateRole, onDeleteRole,
  onAddSection, onUpdateSection, onDeleteSection,
}: Props) {
  // Role dialog state
  const [roleDialog, setRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<Omit<Role, 'id'>>(
    emptyRoleForm(sections[0]?.id ?? '')
  );

  // Section dialog state
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<RoleSection | null>(null);
  const [sectionLabel, setSectionLabel] = useState('');

  const openNewRole = (sectionId?: string) => {
    setEditingRole(null);
    setRoleForm(emptyRoleForm(sectionId ?? sections[0]?.id ?? ''));
    setRoleDialog(true);
  };

  const openEditRole = (r: Role) => {
    setEditingRole(r);
    setRoleForm({
      label: r.label,
      sectionId: r.sectionId,
      allowMultiple: !!r.allowMultiple,
      highlight: !!r.highlight,
    });
    setRoleDialog(true);
  };

  const saveRole = () => {
    const label = roleForm.label.trim();
    if (!label) return;
    if (editingRole) {
      onUpdateRole({ ...editingRole, ...roleForm, label });
    } else {
      onAddRole({ id: uniqueId(label, roles), ...roleForm, label });
    }
    setRoleDialog(false);
  };

  const openNewSection = () => {
    setEditingSection(null);
    setSectionLabel('');
    setSectionDialog(true);
  };

  const openEditSection = (s: RoleSection) => {
    setEditingSection(s);
    setSectionLabel(s.label);
    setSectionDialog(true);
  };

  const saveSection = () => {
    const label = sectionLabel.trim();
    if (!label) return;
    if (editingSection) {
      onUpdateSection({ ...editingSection, label });
    } else {
      onAddSection({ id: uniqueId(label, sections), label });
    }
    setSectionDialog(false);
  };

  const deleteSection = (s: RoleSection) => {
    const count = roles.filter(r => r.sectionId === s.id).length;
    if (count > 0) {
      alert(
        `No se puede eliminar "${s.label}" porque contiene ${count} rol(es). ` +
        `Movelos a otra sección o eliminálos primero.`
      );
      return;
    }
    if (confirm(`¿Eliminar la sección "${s.label}"?`)) onDeleteSection(s.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Gestioná las secciones y los roles del ministerio.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openNewSection}>
            <FolderPlus size={16} /> Nueva sección
          </Button>
          <Button size="sm" onClick={() => openNewRole()}>
            <Plus size={16} /> Nuevo rol
          </Button>
        </div>
      </div>

      {sections.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No hay secciones. Creá una para comenzar a organizar los roles.
          </CardContent>
        </Card>
      )}

      {sections.map(section => {
        const sectionRoles = roles.filter(r => r.sectionId === section.id);
        return (
          <Card key={section.id}>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                  {section.label}
                </CardTitle>
                <Badge variant="outline">{sectionRoles.length}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditSection(section)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => deleteSection(section)}
                >
                  <Trash2 size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openNewRole(section.id)}>
                  <Plus size={14} /> Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sectionRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Sin roles en esta sección.
                </p>
              ) : (
                <div className="flex flex-col">
                  {sectionRoles.map((role, idx) => (
                    <div key={role.id}>
                      {idx > 0 && <Separator />}
                      <div className="flex items-center gap-2 py-2.5">
                        <span className="font-medium text-sm flex-1 inline-flex items-center gap-1.5">
                          {role.highlight && (
                            <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          {role.label}
                        </span>
                        {role.allowMultiple && (
                          <Badge variant="secondary">
                            <Users size={10} className="mr-1" /> múltiple
                          </Badge>
                        )}
                        {role.highlight && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            <Star size={10} className="mr-1 fill-current" /> destacado
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEditRole(role)}>
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (confirm(`¿Eliminar el rol "${role.label}"? Se quitará de las excepciones de personas.`))
                              onDeleteRole(role.id);
                          }}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Role dialog */}
      <Dialog
        open={roleDialog}
        onClose={() => setRoleDialog(false)}
        title={editingRole ? 'Editar rol' : 'Nuevo rol'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rlabel">Nombre del rol</Label>
            <Input
              id="rlabel"
              value={roleForm.label}
              onChange={e => setRoleForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Ej. Puerta Vidrio"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rsection">Sección</Label>
            <Select
              id="rsection"
              value={roleForm.sectionId}
              onChange={e => setRoleForm(f => ({ ...f, sectionId: e.target.value }))}
            >
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={!!roleForm.allowMultiple}
              onChange={e => setRoleForm(f => ({ ...f, allowMultiple: e.target.checked }))}
              className="accent-primary h-4 w-4"
            />
            Permite asignar varias personas al mismo tiempo
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={!!roleForm.highlight}
              onChange={e => setRoleForm(f => ({ ...f, highlight: e.target.checked }))}
              className="accent-amber-500 h-4 w-4"
            />
            <Star size={13} className="text-amber-500 fill-amber-500" />
            Rol destacado (se resalta en el rol de servicio)
          </label>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setRoleDialog(false)}>
              <X size={15} /> Cancelar
            </Button>
            <Button onClick={saveRole}>
              <Save size={15} /> Guardar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Section dialog */}
      <Dialog
        open={sectionDialog}
        onClose={() => setSectionDialog(false)}
        title={editingSection ? 'Editar sección' : 'Nueva sección'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slabel">Nombre de la sección</Label>
            <Input
              id="slabel"
              value={sectionLabel}
              onChange={e => setSectionLabel(e.target.value)}
              placeholder="Ej. Puertas y Lobby"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setSectionDialog(false)}>
              <X size={15} /> Cancelar
            </Button>
            <Button onClick={saveSection}>
              <Save size={15} /> Guardar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
