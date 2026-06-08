-- =========================================================================
-- VALORGT - CONGELAR VALORES DE TRANSFERENCIA DE ORO DIGITAL
-- =========================================================================
-- Ejecuta este script en tu consola de Supabase SQL Editor.
-- Agrega columnas a la tabla public.transactions para registrar la cotización
-- y tipo de cambio en el instante de la transacción, evitando que el valor
-- histórico fluctúe con el precio en vivo del oro.

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS xaut_price NUMERIC(12, 2) DEFAULT 4310.00;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 4) DEFAULT 7.78;
