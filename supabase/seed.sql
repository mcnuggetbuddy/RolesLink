-- Datos iniciales. Ejecutar UNA vez después de schema.sql.
-- Usa ON CONFLICT DO NOTHING para poder re-ejecutar sin duplicar.

insert into role_sections (id, label) values
  ('intro', 'Apertura'),
  ('encargados', 'Encargados'),
  ('puertas', 'Puertas y Lobby'),
  ('auditorio', 'Auditorio'),
  ('redes', 'Redes Sociales'),
  ('otros', 'Otros'),
  ('ausencias', 'Ausencias')
on conflict (id) do nothing;

insert into roles (id, label, section_id, allow_multiple, highlight) values
  ('bienvenida', 'Bienvenida', 'intro', false, false),
  ('primer_orador', 'Primer Orador', 'intro', false, false),
  ('cierre', 'Cierre', 'intro', false, false),
  ('encargado_piso', 'Encargado de Piso', 'encargados', false, false),
  ('encargado_bloque_arriba', 'Encargado Bloque Arriba', 'encargados', false, false),
  ('encargado_bloque_abajo', 'Encargado Bloque Abajo', 'encargados', false, false),
  ('puerta_vidrio', 'Puerta Vidrio', 'puertas', false, false),
  ('puerta_madera', 'Puerta Madera', 'puertas', false, false),
  ('puerta_salida_1', 'Puerta Mad Salida 1', 'puertas', false, false),
  ('puerta_salida_2', 'Puerta Mad Salida 2', 'puertas', false, false),
  ('lobby_peticiones', 'Lobby / Peticiones', 'puertas', true, false),
  ('apoyo_oracion', 'Apoyo Oración Bloque', 'puertas', true, false),
  ('abrir_cerrar', 'Abrir-Cerrar Puertas', 'puertas', true, false),
  ('decoracion', 'Decoración', 'auditorio', false, false),
  ('conteo_personas', 'Conteo Personas', 'auditorio', false, false),
  ('bloque_arriba', 'Bloque Arriba', 'auditorio', true, true),
  ('bloque_abajo', 'Bloque Abajo', 'auditorio', true, true),
  ('kleenex', 'Kleenex', 'auditorio', false, false),
  ('quitar_cintas', 'Quitar / Poner Cintas', 'auditorio', true, false),
  ('facebook', 'Facebook', 'redes', false, false),
  ('youtube', 'YouTube', 'redes', false, false),
  ('orar_peticiones', 'Encargado de Orar por Peticiones', 'otros', false, false),
  ('ausencia', 'No confirmado / Ausente', 'ausencias', true, false)
on conflict (id) do nothing;

insert into people (id, name, exceptions) values
  ('1', 'Rosario', '["encargado_piso","puerta_vidrio","conteo_personas"]'::jsonb),
  ('2', 'Maria', '["encargado_piso","puerta_vidrio","conteo_personas"]'::jsonb),
  ('3', 'Pablo', '["encargado_piso"]'::jsonb),
  ('4', 'Walter', '["encargado_piso"]'::jsonb),
  ('5', 'Patri', '["encargado_piso","facebook","encargado_bloque_arriba","encargado_bloque_abajo"]'::jsonb),
  ('6', 'Willyam', '["encargado_piso"]'::jsonb),
  ('7', 'Ighor', '["encargado_piso","facebook","youtube"]'::jsonb)
on conflict (id) do nothing;
