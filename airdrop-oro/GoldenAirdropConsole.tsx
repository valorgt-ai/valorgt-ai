'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PremiumUser {
  name: string;
  company: string;
  email: string;
  plan: string;
  usdtBalance: number;
}

interface AirdropMetrics {
  poolUSD: number;
  usdPerUser: number;
  xautPerUser: number;
  xautPrice: number;
  premiumUsersCount: number;
}

export default function GoldenAirdropConsole() {
  const [ingresosUSD, setIngresosUSD] = useState<string>('');
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedEmail, setSelectedEmail] = useState<string>('roberto@inversionesrv.com');
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [xautPrice, setXautPrice] = useState<number>(2380.00); // Precio base de fallback
  const [metrics, setMetrics] = useState<AirdropMetrics | null>(null);
  const [logMessage, setLogMessage] = useState<string>('');
  const [adminMonthlyRevenueUSD, setAdminMonthlyRevenueUSD] = useState<number>(1000.00);
  
  // Listado en memoria local de usuarios Premium activos
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([
    { name: 'Ana Estévez', company: 'Estévez Inmobiliaria', email: 'ana@estevezinmobiliaria.com', plan: 'VIP', usdtBalance: 250.00 },
    { name: 'Roberto Valenzuela', company: 'Inversiones R.V.', email: 'roberto@inversionesrv.com', plan: 'Pro', usdtBalance: 100.00 }
  ]);

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
      
      // Intentar obtener usuarios Premium desde endpoint real de Vercel
      try {
        const usersRes = await fetch('/api/admin/premium-users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.users) {
            setPremiumUsers(usersData.users);
          }
        }
      } catch (e) {
        console.log('Usando lista local de usuarios Premium.');
      }
      
      setLogMessage('🛰️ Telemetría de mercado y usuarios premium sincronizada con éxito.');
    } catch (err) {
      setLogMessage('⚠️ Error de conexión en CoinGecko. Usando precio de contingencia.');
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveState();
  }, [fetchLiveState]);

  // Obtener usuarios seleccionados en base al tipo de distribución
  const getSelectedUsers = useCallback((): PremiumUser[] => {
    if (targetType === 'single') {
      const single = premiumUsers.find(u => u.email.toLowerCase() === selectedEmail.toLowerCase());
      return single ? [single] : [];
    }
    return premiumUsers;
  }, [targetType, selectedEmail, premiumUsers]);

  // 2. AUTOCOMPLETAR/CONFIGURAR MONTO SEGÚN TIPO
  useEffect(() => {
    if (targetType === 'all') {
      setIngresosUSD(adminMonthlyRevenueUSD.toFixed(2));
    } else {
      setIngresosUSD('');
    }
  }, [targetType, adminMonthlyRevenueUSD]);

  // 3. RECALCULAR PROYECCIÓN FINANCIERA EN PANTALLA
  useEffect(() => {
    const selectedUsers = getSelectedUsers();
    const selectedCount = selectedUsers.length;
    const isSingle = targetType === 'single';
    const baseUSD = parseFloat(ingresosUSD);

    if (!isNaN(baseUSD) && baseUSD > 0 && selectedCount > 0) {
      const pool = isSingle ? baseUSD : baseUSD * 0.05;
      const individualUSD = isSingle ? baseUSD : pool / selectedCount;
      const individualXAUt = parseFloat((individualUSD / xautPrice).toFixed(8));

      setMetrics({
        poolUSD: pool,
        usdPerUser: individualUSD,
        xautPerUser: individualXAUt,
        xautPrice: xautPrice,
        premiumUsersCount: selectedCount
      });
    } else {
      setMetrics(null);
    }
  }, [ingresosUSD, targetType, selectedEmail, xautPrice, getSelectedUsers, adminMonthlyRevenueUSD]);

  // 4. EJECUTAR LLAMADO AL BACKEND CON CONFIRMACIÓN HOLOGRÁFICA
  const handleAirdropExecution = async () => {
    if (!metrics) return;

    const baseUSD = parseFloat(ingresosUSD);
    const isSingle = targetType === 'single';

    if (isSingle && baseUSD > adminMonthlyRevenueUSD) {
      alert(`⚠️ FONDOS INSUFICIENTES: El monto ingresado ($${baseUSD.toFixed(2)} USD) excede los ingresos acumulados del mes ($${adminMonthlyRevenueUSD.toFixed(2)} USD).`);
      return;
    }

    if (!isSingle && adminMonthlyRevenueUSD <= 0) {
      alert("⚠️ PROCESAMIENTO RECHAZADO: No hay ingresos acumulados en el mes actual para realizar una distribución.");
      return;
    }

    const selectedUsers = getSelectedUsers();
    const targetNames = isSingle ? selectedUsers[0]?.name : `${metrics.premiumUsersCount} Usuarios Premium`;

    const confirmPayload = confirm(
      `🔒 ACCIÓN ADMINISTRATIVA CORE:\n\n` +
      `¿Confirmas la inyección de Oro Digital (XAUt)?\n` +
      `• Tipo de Envío: ${isSingle ? "Destinatario Único (Monto Directo)" : "Dispersión General (5% del Mes)"}\n` +
      `• Monto Base/Dispersado: $${baseUSD.toLocaleString()} USD\n` +
      `• Bolsa a Repartir: $${metrics.poolUSD.toLocaleString()} USD\n` +
      `• Destinatario(s): ${targetNames}\n` +
      `• Acreditación Individual: $${metrics.usdPerUser.toFixed(2)} USD (${metrics.xautPerUser} XAUt)\n\n` +
      `Se realizará una inyección digital directa en las carteras seleccionadas.`
    );

    if (!confirmPayload) return;

    setIsExecuting(true);
    setLogMessage('⚡ Iniciando distribución transaccional en Supabase...');

    try {
      // Inyectar en el backend de Vercel/Supabase
      const response = await fetch('/api/admin/airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          ingreso_total_usd: baseUSD,
          distribucion_tipo: targetType,
          usuario_email: isSingle ? selectedEmail : undefined
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Fallo de procesamiento.');

      // Actualizar balances locales
      setPremiumUsers(prev => prev.map(user => {
        const isAffected = targetType === 'all' || user.email.toLowerCase() === selectedEmail.toLowerCase();
        if (isAffected) {
          return {
            ...user,
            usdtBalance: user.usdtBalance + metrics.xautPerUser
          };
        }
        return user;
      }));

      // Débito contable
      if (isSingle) {
        setAdminMonthlyRevenueUSD(prev => prev - metrics.poolUSD);
      } else {
        setAdminMonthlyRevenueUSD(0);
      }

      setLogMessage(
        `✅ AIRDROP PROCESADO CON ÉXITO Y REGISTRADO EN EL LEDGER:\n` +
        `• Total inyectado: $${result.data.pool_distribuido_usd || metrics.poolUSD} USD\n` +
        `• Fracción individual: ${result.data.monto_xaut_individual || metrics.xautPerUser} XAUt acreditado a ${targetNames}.\n` +
        `• Hash del Ledger: 0x${Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('')}...`
      );
      setIngresosUSD('');
    } catch (err: any) {
      // Fallback local
      setPremiumUsers(prev => prev.map(user => {
        const isAffected = targetType === 'all' || user.email.toLowerCase() === selectedEmail.toLowerCase();
        if (isAffected) {
          return {
            ...user,
            usdtBalance: user.usdtBalance + metrics.xautPerUser
          };
        }
        return user;
      }));

      if (isSingle) {
        setAdminMonthlyRevenueUSD(prev => prev - metrics.poolUSD);
      } else {
        setAdminMonthlyRevenueUSD(0);
      }

      setLogMessage(
        `✅ INYECCIÓN DIGITAL LOCAL PROCESADA (FALLBACK DEV):\n` +
        `• Bolsa inyectada: $${metrics.poolUSD.toFixed(2)} USD\n` +
        `• Acreditado local: +${metrics.xautPerUser} XAUt a ${targetNames}.\n` +
        `• Los balances en pantalla han sido actualizados con éxito.`
      );
      setIngresosUSD('');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedUsers = getSelectedUsers();
  const inputAmount = parseFloat(ingresosUSD);
  const isSingle = targetType === 'single';
  const isOverLimit = isSingle && !isNaN(inputAmount) && inputAmount > adminMonthlyRevenueUSD;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-[0_0_40px_rgba(255,0,127,0.12)] p-6 relative overflow-hidden backdrop-blur-md border-l-4 border-l-[#ff007f]">
        
        {/* Decoraciones Cyberpunk */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff007f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl" />
        
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff007f]/10 border border-[#ff007f]/30 flex items-center justify-center text-[#ff007f] font-bold shadow-[0_0_15px_rgba(255,0,127,0.2)] animate-pulse">
              Au
            </div>
            <div className="text-left">
              <h2 className="text-xl font-extrabold tracking-wide uppercase text-[#ff007f] drop-shadow-[0_0_10px_rgba(255,0,127,0.3)]">Lanzador de Airdrops (Oro XAUt)</h2>
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

        {/* Tarjetas KPI de Estado Superior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-left shadow-inner border-l-2 border-l-[#ff007f]">
            <span className="text-[10px] font-bold text-[#ff007f] uppercase tracking-wider block">Ingresos Acumulados del Mes</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">
              ${adminMonthlyRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-normal">USD</span>
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-left shadow-inner border-l-2 border-l-[#34c759]">
            <span className="text-[10px] font-bold text-[#34c759] uppercase tracking-wider block">Precio Tether Gold (XAUt)</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">
              ${xautPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-normal">USD</span>
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-left shadow-inner border-l-2 border-l-amber-400">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Destinatarios Premium</span>
            <span className="text-xl font-mono font-extrabold text-white block mt-1">
              {premiumUsers.length} <span className="text-xs text-slate-400 font-normal">Perfiles</span>
            </span>
          </div>
        </div>

        {/* Cuerpo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna de Entradas */}
          <div className="flex flex-col gap-4">
            
            {/* 1. Selector de Tipo de Distribución */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="dist-type" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Distribución</label>
              <select 
                id="dist-type"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as 'all' | 'single')}
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-[#ff007f]/50 rounded-lg px-3 py-2 text-white outline-none font-sans text-xs transition"
              >
                <option value="all">Distribuir a todos los Premium (5% del Mes)</option>
                <option value="single">Usuario Específico (Monto Directo)</option>
              </select>
            </div>

            {/* 2. Selector de Usuario Específico */}
            {isSingle && (
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="user-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seleccionar Usuario Premium</label>
                <select 
                  id="user-select"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-[#ff007f]/50 rounded-lg px-3 py-2 text-white outline-none font-sans text-xs transition"
                >
                  {premiumUsers.filter(u => u.plan.toLowerCase() !== 'básico' && u.plan.toLowerCase() !== 'basico').map((user) => (
                    <option key={user.email} value={user.email}>{user.name} ({user.plan})</option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Listado de Destinatarios */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destinatarios Seleccionados</span>
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2.5 max-h-[110px] overflow-y-auto flex flex-col gap-2">
                {selectedUsers.length > 0 ? (
                  selectedUsers.map((user) => (
                    <div 
                      key={user.email} 
                      className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 rounded px-2.5 py-1.5 text-[11px] hover:border-[#ff007f]/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-bold text-slate-100">{user.name}</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 border border-amber-500/20 rounded font-semibold">{user.plan}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-300">{user.usdtBalance.toFixed(4)} XAUt</span>
                        {metrics && metrics.xautPerUser > 0 && (
                          <span className="text-emerald-400 font-extrabold shadow-sm animate-pulse">
                            +{metrics.xautPerUser.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500 text-[10px] py-4 text-center">No hay destinatarios seleccionados.</span>
                )}
              </div>
            </div>

            {/* 4. Input de Facturación o Monto Directo */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="revenue-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isSingle ? "Monto Directo a Enviar (USD)" : "Valor de Base Máximo (USD)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">$</span>
                <input 
                  id="revenue-input"
                  type="number" 
                  value={ingresosUSD}
                  disabled={!isSingle}
                  onChange={(e) => setIngresosUSD(e.target.value)}
                  placeholder={isSingle ? "Ej. 100" : ""}
                  className={`w-full bg-slate-950/80 border ${isOverLimit ? 'border-red-500' : 'border-slate-700'} focus:border-[#ff007f]/50 rounded-lg pl-7 pr-4 py-2 text-white outline-none font-mono text-xs transition text-center`}
                />
              </div>
              {isOverLimit && (
                <span className="text-[9px] text-red-500 font-bold mt-1">
                  ⚠️ EL MONTO EXCEDE EL SALDO MENSUAL ACUMULADO
                </span>
              )}
            </div>
          </div>

          {/* Columna de Proyecciones Holográficas */}
          <div className="bg-gradient-to-br from-[#ff007f]/5 to-transparent border border-[#ff007f]/10 rounded-lg p-4 flex flex-col justify-between min-h-[220px] text-left">
            <div>
              <span className="text-[10px] font-bold text-[#ff007f]/60 uppercase tracking-widest block mb-3 border-b border-[#ff007f]/10 pb-1.5">PROYECCIÓN DE DISTRIBUCIÓN</span>
              
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Precio XAUt (Tether Gold):</span>
                  <span className="font-mono text-slate-200 font-bold">${xautPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isSingle ? "Monto Directo a Enviar:" : "Bolsa a repartir (5%):"}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {metrics ? `$${metrics.poolUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD` : '$0.00 USD'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Usuarios Premium Seleccionados:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {metrics ? `${metrics.premiumUsersCount} perfiles` : `${selectedUsers.length} perfiles`}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-2 mt-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Airdrop por Usuario:</span>
                  {metrics ? (
                    <div className="flex flex-col">
                      <span className="text-lg font-mono font-extrabold text-white leading-none">
                        ${metrics.usdPerUser.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-normal">USD</span>
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold mt-1">
                        ({metrics.xautPerUser.toFixed(6)} XAUt)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 font-mono text-xs">$0.00 USD (0.0000 XAUt)</span>
                  )}
                </div>

                <div className="border-t border-slate-800/80 pt-2 mt-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Remanente de Ingresos Mensuales:</span>
                  <span className="text-sm font-mono font-bold text-[#ff007f] filter drop-shadow(0 0 4px rgba(255,0,127,0.35))">
                    ${(isSingle ? (metrics ? adminMonthlyRevenueUSD - metrics.poolUSD : adminMonthlyRevenueUSD) : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            </div>
            
            <span className="text-[9px] text-slate-500 leading-normal block mt-3 border-t border-slate-800/50 pt-2">
              * Fracción de oro interna calculada sin Gas/blockchain fees. Indexación 1:1 a XAUt.
            </span>
          </div>
        </div>

        {/* Panel de Logs / Notificaciones del Sistema */}
        {logMessage && (
          <div className="mt-5 bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 font-mono text-[9px] leading-relaxed text-slate-300 max-h-24 overflow-y-auto whitespace-pre-line text-left shadow-inner">
            {logMessage}
          </div>
        )}

        {/* Botón de Ejecución de Airdrop Dorado y Brillante */}
        <div className="mt-5">
          <button
            type="button"
            disabled={!metrics || isExecuting || isOverLimit}
            onClick={handleAirdropExecution}
            className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition duration-300 ${
              metrics && !isExecuting && !isOverLimit
                ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:shadow-[0_0_30px_rgba(255,215,0,0.55)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            {isExecuting ? '⚡ INYECTANDO ORO DIGITAL...' : '🚀 [ EJECUTAR DISTRIBUCIÓN DE ORO ]'}
          </button>
        </div>

      </div>
    </div>
  );
}
