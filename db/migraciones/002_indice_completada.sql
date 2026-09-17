-- Índice para filtrar rápido las tareas pendientes, que es la consulta
-- que hace la portada de la aplicación.
CREATE INDEX IF NOT EXISTS tarea_completada_idx ON tarea (completada);
