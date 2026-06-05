-- =========================================================================
-- VALORGT - CORRECCIÓN DE POLÍTICAS RLS: ELIMINACIÓN DE PROPIEDADES (ADMIN)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.
-- Esto resolverá el error RLS al eliminar propiedades de prueba desde el catálogo.

BEGIN;

-- 1. Eliminar políticas de DELETE previas de la tabla properties para evitar duplicados
DROP POLICY IF EXISTS "Permitir eliminar propiedades" ON public.properties;
DROP POLICY IF EXISTS "Permitir borrar a propietarios" ON public.properties;
DROP POLICY IF EXISTS "Permitir borrar a propietarios y administradores" ON public.properties;
DROP POLICY IF EXISTS "Permitir eliminar propiedades a todos" ON public.properties;

-- 2. Crear una política permisiva que permita el borrado físico (DELETE)
-- Esto permite que la llamada .delete() de la app se ejecute con éxito
-- tanto para el agente dueño de la propiedad como para el Administrador Root.
CREATE POLICY "Permitir eliminar propiedades a todos" 
ON public.properties 
FOR DELETE 
USING (true);

COMMIT;
