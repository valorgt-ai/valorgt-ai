-- =========================================================================
-- VALORGT - DESHABILITAR RLS EN TABLA DE TRANSACCIONES (CARTERA LEDGER)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.
-- Esto deshabilitará las restricciones RLS para la tabla public.transactions
-- permitiendo que las operaciones de eliminación (Limpiar Historial) e inserción
-- desde el frontend funcionen sin bloqueos silenciosos de seguridad.

BEGIN;

-- Deshabilitar RLS en la tabla transactions
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

COMMIT;
