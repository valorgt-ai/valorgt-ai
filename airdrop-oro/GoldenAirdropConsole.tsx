'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface AirdropMetrics {
  poolUSD: number;
  usdPerUser: number;
  xautPerUser: number;
  xautPrice: number;
  premiumUsersCount: number;
}

export default function GoldenAirdropConsole() {
  const [ingresosUSD, setIngresosUSD] = useState<string>('');
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [premiumCount, setPremiumCount] = useState<number>(0);
  const [xautPrice, setXautPrice] = useState<number>(2380.00); // Precio base de fallback
  const [metrics, setMetrics] = useState<AirdropMetrics | null>(null);
  const [logMessage, setLogMessage] = useState<string>('');

  // 1. CONSULTAR CONTENIDO FINANCIERO INICIAL (Usuarios Premium & XAUt)
  const fetchLiveState = useCallback(async () => {
    setLoadingPrice(true);
    try {
      // Fetch precio Tether Gold
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd');
      const priceData = await priceRes.json();
      if (priceData['tether-gold']?.usd) {
        setXautPrice(priceData['tether-gold'].usd);
      }

      // Consultar usuarios Premium activos (Mock simulado o endpoint local)
      // Reemplazar con endpoint real: const res = await fetch('/api/admin/premium-count');
      setPremiumCount(124); // Simulación de 124 usuarios Premium activos
      setLogMessage('🛰️ Telemetría de mercado y usuarios sincronizada con éxito.');
    } catch (err) {
      setLogMessage('⚠️ Error de conexión en CoinGecko. Usando precio de contingencia.');
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveState();
  }, [fetchLiveState]);

  // 2. RECALCULAR PROYECCIÓN FINANCIERA EN PANTALLA
  useEffect(() => {
    const ingresos = parseFloat(ingresosUSD);
    if (!isNaN(ingresos) && ingresos > 0 && premiumCount > 0) {
      const pool = ingresos * 0.05;
      const individualUSD = pool / premiumCount;
      const individualXAUt = parseFloat((individualUSD / xautPrice).toFixed(8));

      setMetrics({
        poolUSD: pool,
        usdPerUser: individualUSD,
        xautPerUser: individualXAUt,
        xautPrice: xautPrice,
        premiumUsersCount: premiumCount
      });
    } else {
      setMetrics(null);
    }
  }, [ingresosUSD, premiumCount, xautPrice]);

  // 3. EJECUTAR LLAMADO AL BACKEND CON CONFIRMACIÓN HOLOGRÁFICA
  const handleAirdropExecution = async () => {
    if (!metrics) return;

    const confirmPayload = confirm(
      `¿Desea iniciar la inyección de oro digital?\n\n` +
      `• Bolsa Total: $${metrics.poolUSD.toLocaleString()} USD\n` +
      `• Usuarios Premium: ${metrics.premiumUsersCount}\n` +
      `• Por usuario: $${metrics.usdPerUser.toFixed(2)} USD (${metrics.xautPerUser} XAUt)`
    );

    if (!confirmPayload) return;

    setIsExecuting(true);
    setLogMessage('⚡ Iniciando distribución transaccional en Supabase...');

    try {
      const response = await fetch('/api/admin/airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}` // Simulación de Token de Admin
        },
        body: JSON.stringify({ ingreso_total_usd: parseFloat(ingresosUSD) })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Fallo de procesamiento.');

      setLogMessage(
        `✅ AIRDROP PROCESADO CON ÉXITO:\n` +
        `• Total inyectado: $${result.data.pool_distribuido_usd} USD\n` +
        `• Fracción individual: ${result.data.monto_xaut_individual} XAUt distribuido a ${result.data.usuarios_premium_activos} perfiles.`
      );
      setIngresosUSD('');
    } catch (err: any) {
      setLogMessage(`❌ ERROR CRÍTICO: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/20 rounded-xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-md">
        
        {/* Decoraciones Cyberpunk */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold shadow-glow-amber animate-pulse">
              Au
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase text-amber-400">Distribución de Airdrop Mensual</h2>
              <p className="text-xs text-slate-400">Consola Central de Distribución Indexada Tether Gold (XAUt)</p>
            </div>
          </div>
          <button 
            onClick={fetchLiveState} 
            disabled={loadingPrice}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            {loadingPrice ? 'Sincronizando...' : '🔄 Recargar Cotización'}
          </button>
        </div>

        {/* Cuerpo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna de Entradas */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="revenue-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingreso Mensual del Negocio (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-semibold">$</span>
                <input 
                  id="revenue-input"
                  type="number" 
                  value={ingresosUSD}
                  onChange={(e) => setIngresosUSD(e.target.value)}
                  placeholder="Ej. 10000"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500/50 rounded-lg pl-8 pr-4 py-2 text-white outline-none font-mono text-sm transition"
                />
              </div>
            </div>

            {/* Ficha de Información de Mercado */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Precio XAUt (Tether Gold):</span>
                <span className="font-mono text-amber-400 font-bold">${xautPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Usuarios Premium Activos:</span>
                <span className="font-mono text-cyan-400 font-bold">{premiumCount} perfiles</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bolsa Distribuible:</span>
                <span className="font-bold text-slate-200">5.0% Neto</span>
              </div>
            </div>
          </div>

          {/* Columna de Proyecciones Holográficas */}
          <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-lg p-4 flex flex-col justify-between min-h-[190px]">
            <div>
              <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest block mb-2">Simulación de Inyección</span>
              {metrics ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Fondo Total a Distribuir:</span>
                    <span className="text-2xl font-mono font-extrabold text-amber-400">${metrics.poolUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400">USD</span></span>
                  </div>
                  <div className="border-t border-amber-500/10 pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Por Usuario (USD):</span>
                      <span className="text-sm font-mono font-bold text-slate-200">${metrics.usdPerUser.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Por Usuario (XAUt):</span>
                      <span className="text-sm font-mono font-bold text-cyan-400">{metrics.xautPerUser}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-center text-slate-500 text-xs px-4">
                  Ingresa un monto de facturación mensual para ver los cálculos holográficos en tiempo real.
                </div>
              )}
            </div>
            
            {metrics && (
              <span className="text-[9px] text-slate-500 leading-normal block mt-2">
                * Fracción de oro interna calculada sin Gas/blockchain fees. Indexación 1:1 a XAUt.
              </span>
            )}
          </div>
        </div>

        {/* Panel de Logs / Notificaciones del Sistema */}
        {logMessage && (
          <div className="mt-6 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[10px] leading-relaxed text-slate-300 max-h-24 overflow-y-auto whitespace-pre-line text-left">
            {logMessage}
          </div>
        )}

        {/* Botón de Ejecución de Airdrop */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!metrics || isExecuting}
            onClick={handleAirdropExecution}
            className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition duration-300 ${
              metrics && !isExecuting
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            {isExecuting ? '⚡ PROCESANDO AIRDROP...' : '🚀 [ EJECUTAR AIRDROP DEL MES ]'}
          </button>
        </div>

      </div>
    </div>
  );
}
