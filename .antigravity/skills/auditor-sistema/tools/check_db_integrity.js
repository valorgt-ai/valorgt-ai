const https = require('https');

const SUPABASE_URL = "https://kcwfiruutezheudqxesv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mparhlydfWVr_CuSPk0nHQ_-3qNaTgO";

function request(path, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1/${path}`;
        const options = {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                ...headers
            }
        };

        const startTime = Date.now();
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const latency = Date.now() - startTime;
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve({
                            status: 'success',
                            statusCode: res.statusCode,
                            data: JSON.parse(data),
                            latency,
                            headers: res.headers
                        });
                    } catch (e) {
                        resolve({
                            status: 'success',
                            statusCode: res.statusCode,
                            data: data,
                            latency,
                            headers: res.headers
                        });
                    }
                } else {
                    resolve({
                        status: 'error',
                        statusCode: res.statusCode,
                        error: data,
                        latency
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function runDiagnostics() {
    const report = {
        timestamp: new Date().toISOString(),
        supabase: { status: 'UNKNOWN', latencyMs: 0, details: '' },
        dataQuality: {
            propertiesCount: 0,
            propertiesZeroPrice: 0,
            propertiesInvalidCoords: 0,
            profilesCount: 0,
            profilesZeroBalance: 0,
            transactionsCount: 0,
            newsFrescuraHrs: null,
            latestNewsDate: null,
            anomalies: []
        },
        vercel: { status: 'UNKNOWN', statusCode: null }
    };

    try {
        // 1. Verificar propiedades
        const propsRes = await request('properties?select=id,price_usd,latitude,longitude');
        if (propsRes.status === 'success') {
            report.supabase.status = '🟢 OPERATIVO';
            report.supabase.latencyMs = propsRes.latency;
            
            const properties = Array.isArray(propsRes.data) ? propsRes.data : [];
            report.dataQuality.propertiesCount = properties.length;
            
            properties.forEach(p => {
                if (!p.price_usd || parseFloat(p.price_usd) <= 0) {
                    report.dataQuality.propertiesZeroPrice++;
                    report.dataQuality.anomalies.push(`Propiedad ID ${p.id}: precio_usd inválido o cero.`);
                }
                const lat = parseFloat(p.latitude);
                const lng = parseFloat(p.longitude);
                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                    report.dataQuality.propertiesInvalidCoords++;
                    report.dataQuality.anomalies.push(`Propiedad ID ${p.id}: coordenadas geográficas fuera de rango o nulas.`);
                }
            });
        } else {
            report.supabase.status = '🔴 FALLA';
            report.supabase.details = `Código de error HTTP ${propsRes.statusCode}: ${propsRes.error}`;
        }

        // 2. Verificar perfiles
        const profilesRes = await request('profiles?select=id,email,usdt_balance');
        if (profilesRes.status === 'success') {
            const profiles = Array.isArray(profilesRes.data) ? profilesRes.data : [];
            report.dataQuality.profilesCount = profiles.length;
            profiles.forEach(p => {
                const bal = parseFloat(p.usdt_balance);
                if (isNaN(bal) || bal < 0) {
                    report.dataQuality.anomalies.push(`Perfil ${p.email || p.id}: balance USDT inválido (${p.usdt_balance}).`);
                }
            });
        }

        // 3. Verificar transacciones
        const txsRes = await request('transactions?select=id', { 'Prefer': 'count=exact' });
        if (txsRes.status === 'success') {
            const txCountHeader = txsRes.headers['content-range'];
            if (txCountHeader) {
                const parts = txCountHeader.split('/');
                report.dataQuality.transactionsCount = parseInt(parts[1] || parts[0]) || txsRes.data.length;
            } else {
                report.dataQuality.transactionsCount = Array.isArray(txsRes.data) ? txsRes.data.length : 0;
            }
        }

        // 4. Verificar frescura de noticias
        const newsRes = await request('market_news?select=created_at&order=created_at.desc&limit=1');
        if (newsRes.status === 'success' && Array.isArray(newsRes.data) && newsRes.data.length > 0) {
            const latestDate = new Date(newsRes.data[0].created_at);
            report.dataQuality.latestNewsDate = latestDate.toISOString();
            const diffMs = Date.now() - latestDate.getTime();
            report.dataQuality.newsFrescuraHrs = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
        }

        // 5. Ping Vercel (Público de la plataforma)
        await new Promise((resolve) => {
            const req = https.get('https://valorgt-ai.vercel.app', (res) => {
                report.vercel.statusCode = res.statusCode;
                if (res.statusCode === 200) {
                    report.vercel.status = '🟢 OPERATIVO';
                } else {
                    report.vercel.status = '🔴 INACCESIBLE';
                }
                resolve();
            });
            req.on('error', () => {
                report.vercel.status = '🔴 INACCESIBLE';
                resolve();
            });
            req.end();
        });

    } catch (e) {
        report.supabase.status = '🔴 CAÍDO';
        report.supabase.details = e.message;
    }

    console.log(JSON.stringify(report, null, 2));
}

runDiagnostics();
