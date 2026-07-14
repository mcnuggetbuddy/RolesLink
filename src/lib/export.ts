import type { Person, Role, RoleSection, ServiceEvent } from './types';

function names(ids: string[], people: Person[]): string {
  if (!ids || ids.length === 0) return '';
  return ids
    .map(id => people.find(p => p.id === id)?.name?.toUpperCase() ?? '?')
    .join(', ');
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-');
  const months: Record<string, string> = {
    '01': 'ENERO', '02': 'FEBRERO', '03': 'MARZO', '04': 'ABRIL',
    '05': 'MAYO', '06': 'JUNIO', '07': 'JULIO', '08': 'AGOSTO',
    '09': 'SEPTIEMBRE', '10': 'OCTUBRE', '11': 'NOVIEMBRE', '12': 'DICIEMBRE',
  };
  return `${parseInt(day)} DE ${months[m]} DEL ${y}`;
}

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function exportToHTML(
  event: ServiceEvent,
  people: Person[],
  roles: Role[],
  sections: RoleSection[],
) {
  const dateLabel = formatDate(event.date);

  const sectionRows = sections
    .map(section => {
      const sectionRoles = roles.filter(r => r.sectionId === section.id);
      if (sectionRoles.length === 0) return '';

      const header = `
        <tr>
          <td class="section-header" colspan="2">${escape(section.label.toUpperCase())}</td>
        </tr>`;

      const rows = sectionRoles.map(role => {
        const value = names(event.assignments[role.id] ?? [], people);
        return `
          <tr>
            <td class="role-label">${escape(role.label.toUpperCase())}</td>
            <td>${value || '<span class="empty">—</span>'}</td>
          </tr>`;
      }).join('');

      return header + rows;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Rol Servicio ${dateLabel} - Ministerio LINK</title>
<style>
  body { font-family: "Inter", Arial, sans-serif; padding: 30px; font-size: 13px; color: #111; }
  h1 { text-align: center; font-size: 16px; margin-bottom: 4px; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  td { border: 1px solid #999; padding: 8px 12px; vertical-align: middle; }
  .section-header { background: #18181b; color: white; font-weight: 700; text-align: center; letter-spacing: 1px; font-size: 12px; }
  .role-label { font-weight: 600; background: #f4f4f5; width: 40%; text-transform: uppercase; font-size: 12px; }
  .empty { color: #aaa; font-style: italic; }
  @media print { button { display: none; } body { padding: 15px; } }
</style>
</head>
<body>
<h1>ROL SERVICIO ${dateLabel} — MINISTERIO LINK</h1>

<table>${sectionRows}</table>

<div style="text-align:center; margin-top: 20px;">
  <button onclick="window.print()" style="padding:8px 20px; font-size:14px; cursor:pointer; background:#18181b; color:white; border:none;">
    Imprimir / Guardar PDF
  </button>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) win.focus();
}
