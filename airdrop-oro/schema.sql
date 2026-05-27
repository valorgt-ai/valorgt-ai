-- =========================================================================
-- VALORGT - MIGRACIÓN DE BASE DE DATOS: AIRDROP DIGITAL ORO (XAUt)
-- =========================================================================

BEGIN;

-- 1. TABLA DE SALDOS ACUMULADOS
CREATE TABLE IF NOT EXISTS public.saldos_oro (
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    balance_xaut NUMERIC(20, 8) NOT NULL DEFAULT 0.00000000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT chk_balance_positivo CHECK (balance_xaut >= 0)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.saldos_oro ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Saldos
DROP POLICY IF EXISTS "Usuarios pueden ver su propio saldo de oro" ON public.saldos_oro;
CREATE POLICY "Usuarios pueden ver su propio saldo de oro" 
    ON public.saldos_oro FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Solo sistema/admin puede modificar saldos" ON public.saldos_oro;
CREATE POLICY "Solo sistema/admin puede modificar saldos" 
    ON public.saldos_oro FOR ALL 
    USING (false) 
    WITH CHECK (false);


-- 2. TABLA DE HISTORIAL / AUDITORÍA DE MOVIMIENTOS
CREATE TABLE IF NOT EXISTS public.historial_oro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    monto_usd NUMERIC(12, 2) NOT NULL,
    monto_xaut NUMERIC(20, 8) NOT NULL,
    precio_pivote_xaut NUMERIC(12, 2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT chk_tipo_movimiento CHECK (tipo IN ('airdrop_mensual', 'canje')),
    CONSTRAINT chk_monto_usd_positivo CHECK (monto_usd >= 0),
    CONSTRAINT chk_monto_xaut_positivo CHECK (monto_xaut >= 0),
    CONSTRAINT chk_pivot_positivo CHECK (precio_pivote_xaut > 0)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.historial_oro ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Historial
DROP POLICY IF EXISTS "Usuarios pueden consultar su historial de oro" ON public.historial_oro;
CREATE POLICY "Usuarios pueden consultar su historial de oro" 
    ON public.historial_oro FOR SELECT 
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Solo sistema/admin puede registrar historial" ON public.historial_oro;
CREATE POLICY "Solo sistema/admin puede registrar historial" 
    ON public.historial_oro FOR INSERT 
    WITH CHECK (false);


-- 3. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_saldos_oro_usuario ON public.saldos_oro(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_oro_usuario_fecha ON public.historial_oro(usuario_id, fecha DESC);


-- 4. FUNCIÓN DE DISTRIBUCIÓN TRANSACCIONAL (RPC - CRÉDITO)
CREATE OR REPLACE FUNCTION public.distribuir_airdrop_oro(
    p_usuario_ids UUID[],
    p_monto_usd_por_usuario NUMERIC,
    p_monto_xaut_por_usuario NUMERIC,
    p_precio_pivote NUMERIC
) RETURNS VOID AS $$
DECLARE
    u_id UUID;
BEGIN
    -- Validaciones críticas
    IF ARRAY_LENGTH(p_usuario_ids, 1) IS NULL OR ARRAY_LENGTH(p_usuario_ids, 1) = 0 THEN
        RAISE EXCEPTION 'La lista de usuarios para el airdrop no puede estar vacía.';
    END IF;
    
    IF p_monto_xaut_por_usuario <= 0 OR p_precio_pivote <= 0 THEN
        RAISE EXCEPTION 'Los montos y precios pivote deben ser mayores a cero.';
    END IF;

    -- Iteración segura dentro de la transacción
    FOREACH u_id IN ARRAY p_usuario_ids LOOP
        -- A. Actualizar saldo acumulado (Upsert)
        INSERT INTO public.saldos_oro (usuario_id, balance_xaut, updated_at)
        VALUES (u_id, p_monto_xaut_por_usuario, NOW())
        ON CONFLICT (usuario_id)
        DO UPDATE SET 
            balance_xaut = public.saldos_oro.balance_xaut + EXCLUDED.balance_xaut,
            updated_at = NOW();

        -- B. Registrar auditoría individual
        INSERT INTO public.historial_oro (usuario_id, tipo, monto_usd, monto_xaut, precio_pivote_xaut, fecha)
        VALUES (u_id, 'airdrop_mensual', p_monto_usd_por_usuario, p_monto_xaut_por_usuario, p_precio_pivote, NOW());

        -- C. Sincronizar en profiles (si existe la tabla y columna)
        BEGIN
            UPDATE public.profiles 
            SET usdt_balance = COALESCE(usdt_balance, 0) + p_monto_xaut_por_usuario
            WHERE id = u_id;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar si la tabla o la columna no existen
        END;

        -- D. Sincronizar en perfiles (si existe la tabla y columna)
        BEGIN
            UPDATE public.perfiles 
            SET usdt_balance = COALESCE(usdt_balance, 0) + p_monto_xaut_por_usuario
            WHERE id = u_id;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar si la tabla o la columna no existen
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. FUNCIÓN DE EXTRACCIÓN TRANSACCIONAL (RPC - DÉBITO)
CREATE OR REPLACE FUNCTION public.extraer_oro(
    p_usuario_ids UUID[],
    p_monto_usd_por_usuario NUMERIC,
    p_monto_xaut_por_usuario NUMERIC,
    p_precio_pivote NUMERIC
) RETURNS VOID AS $$
DECLARE
    u_id UUID;
    v_balance NUMERIC;
BEGIN
    -- Validaciones críticas
    IF ARRAY_LENGTH(p_usuario_ids, 1) IS NULL OR ARRAY_LENGTH(p_usuario_ids, 1) = 0 THEN
        RAISE EXCEPTION 'La lista de usuarios para la extracción no puede estar vacía.';
    END IF;
    
    IF p_monto_xaut_por_usuario <= 0 OR p_precio_pivote <= 0 THEN
        RAISE EXCEPTION 'Los montos y precios pivote deben ser mayores a cero.';
    END IF;

    -- Iteración segura dentro de la transacción
    FOREACH u_id IN ARRAY p_usuario_ids LOOP
        -- A. Verificar saldo actual en saldos_oro
        SELECT balance_xaut INTO v_balance
        FROM public.saldos_oro
        WHERE usuario_id = u_id;

        IF v_balance IS NULL OR v_balance < p_monto_xaut_por_usuario THEN
            RAISE EXCEPTION 'Fondos insuficientes en la cartera de oro para extraer % XAUt.', p_monto_xaut_por_usuario;
        END IF;

        -- B. Restar saldo acumulado
        UPDATE public.saldos_oro
        SET balance_xaut = balance_xaut - p_monto_xaut_por_usuario,
            updated_at = NOW()
        WHERE usuario_id = u_id;

        -- C. Registrar auditoría individual con tipo 'canje'
        INSERT INTO public.historial_oro (usuario_id, tipo, monto_usd, monto_xaut, precio_pivote_xaut, fecha)
        VALUES (u_id, 'canje', p_monto_usd_por_usuario, p_monto_xaut_por_usuario, p_precio_pivote, NOW());

        -- D. Sincronizar en profiles (si existe la tabla y columna)
        BEGIN
            UPDATE public.profiles 
            SET usdt_balance = GREATEST(0, COALESCE(usdt_balance, 0) - p_monto_xaut_por_usuario)
            WHERE id = u_id;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar si la tabla o la columna no existen
        END;

        -- E. Sincronizar en perfiles (si existe la tabla y columna)
        BEGIN
            UPDATE public.perfiles 
            SET usdt_balance = GREATEST(0, COALESCE(usdt_balance, 0) - p_monto_xaut_por_usuario)
            WHERE id = u_id;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar si la tabla o la columna no existen
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
