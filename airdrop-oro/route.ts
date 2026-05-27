import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente administrativo de Supabase con Service Role (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Llave privada segura
);

interface AirdropRequest {
  ingreso_total_usd: number;
}

export async function POST(req: NextRequest) {
  try {
    // 1. AUTORIZACIÓN: Validar firma JWT de Administrador
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado. Token inexistente.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || user.app_metadata.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso restringido. Requiere rol Administrador.' }, { status: 403 });
    }

    // 2. PARSE & VALIDACIÓN DEL BODY
    const body = await req.json();
    const { ingreso_total_usd, distribucion_tipo, usuario_email } = body;

    if (!ingreso_total_usd || isNaN(ingreso_total_usd) || ingreso_total_usd <= 0) {
      return NextResponse.json({ error: 'El ingreso total mensual ingresado no es válido.' }, { status: 400 });
    }

    const distType = distribucion_tipo || 'all';

    // 3. CONSULTAR USUARIOS PREMIUM ACTIVOS
    let query = supabaseAdmin
      .from('perfiles')
      .select('id, email')
      .eq('plan_actual', 'Premium')
      .eq('activo', true);

    if (distType === 'single' && usuario_email) {
      query = query.eq('email', usuario_email.trim().toLowerCase());
    }

    const { data: premiumUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Error al consultar usuarios Premium:', usersError);
      return NextResponse.json({ error: 'Error al consultar la base de datos de usuarios.' }, { status: 500 });
    }

    const premiumCount = premiumUsers?.length || 0;
    if (premiumCount === 0) {
      return NextResponse.json({ error: 'No se encontraron usuarios Premium activos para este ciclo.' }, { status: 400 });
    }

    // 4. CONSULTAR PRECIO ACTUAL DE TETHER GOLD (XAUt)
    let xautPriceUSD = 0;
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd',
        { next: { revalidate: 300 } } // Cache de 5 minutos
      );
      const data = await response.json();
      xautPriceUSD = data['tether-gold']?.usd;

      if (!xautPriceUSD) throw new Error('Dato de cotización no disponible.');
    } catch (apiErr) {
      console.warn('Fallo en API CoinGecko. Usando precio de contingencia (fallback financiero):', apiErr);
      // Fallback seguro a precio aproximado del oro spot (~$2,380.00 por onza de XAUt)
      xautPriceUSD = 2380.00;
    }

    // 5. APLICACIÓN DE FÓRMULAS FINANCIERAS
    const totalAirdropUSD = distType === 'single' ? ingreso_total_usd : ingreso_total_usd * 0.05;
    const usdPerUser = totalAirdropUSD / premiumCount;
    const xautFractionPerUser = parseFloat((usdPerUser / xautPriceUSD).toFixed(8)); // Máxima precisión: 8 decimales

    // Extracción de IDs de usuarios
    const userIds = premiumUsers.map((u) => u.id);

    // 6. INVOCACIÓN DEL RPC TRANSACCIONAL EN SUPABASE
    const { error: rpcError } = await supabaseAdmin.rpc('distribuir_airdrop_oro', {
      p_usuario_ids: userIds,
      p_monto_usd_por_usuario: usdPerUser,
      p_monto_xaut_por_usuario: xautFractionPerUser,
      p_precio_pivote: xautPriceUSD,
    });

    if (rpcError) {
      console.error('Error crítico en transacción RPC:', rpcError);
      return NextResponse.json({ error: 'Fallo crítico al ejecutar transacciones de oro.' }, { status: 500 });
    }

    // 7. RESPUESTA EXITOSA
    return NextResponse.json({
      success: true,
      data: {
        pool_distribuido_usd: totalAirdropUSD,
        usuarios_premium_activos: premiumCount,
        monto_usd_individual: usdPerUser,
        monto_xaut_individual: xautFractionPerUser,
        precio_referencia_xaut: xautPriceUSD,
      },
    });

  } catch (err: any) {
    console.error('Fallo del servidor en la API Route:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
