-- =========================================================================
-- VALORGT - RESOLUCIÓN DE PERMISOS RLS EN PERFILES Y LEDGER DE ORO
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.
-- Esto deshabilitará el RLS temporalmente en perfiles y tablas de oro
-- para permitir que el administrador y usuarios realicen actualizaciones
-- y consultas directas desde el frontend sin bloqueos criptográficos.

BEGIN;

-- Deshabilitar RLS en tabla de perfiles (permite al admin activar usuarios y cambiar planes)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tablas de Ledger de Oro (permite auditorías y lecturas de balances)
ALTER TABLE public.saldos_oro DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_oro DISABLE ROW LEVEL SECURITY;

COMMIT;
