-- =========================================================================
-- VALORGT - RESOLUCIÓN INTEGRAL DE POLÍTICAS RLS EN TABLA PROPERTIES
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.
-- Esto resolverá todos los errores de permisos (RLS) al insertar,
-- actualizar y eliminar propiedades desde la plataforma.

BEGIN;

-- Opción A: Deshabilitar RLS por completo en la tabla properties (Recomendado para desarrollo/pruebas públicas)
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Opción B: Si prefieres mantener RLS activo, limpiamos y recreamos las políticas permisivas
DROP POLICY IF EXISTS "Permitir lectura publica" ON public.properties;
DROP POLICY IF EXISTS "Permitir insertar propiedades" ON public.properties;
DROP POLICY IF EXISTS "Permitir actualizar propiedades" ON public.properties;
DROP POLICY IF EXISTS "Permitir eliminar propiedades a todos" ON public.properties;
DROP POLICY IF EXISTS "Permitir eliminar propiedades" ON public.properties;
DROP POLICY IF EXISTS "Permitir borrar a propietarios" ON public.properties;
DROP POLICY IF EXISTS "Permitir borrar a propietarios y administradores" ON public.properties;

-- Crear políticas universales y permisivas para todas las operaciones DML
CREATE POLICY "Permitir lectura publica" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Permitir insertar propiedades" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar propiedades" ON public.properties FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar propiedades a todos" ON public.properties FOR DELETE USING (true);

COMMIT;
