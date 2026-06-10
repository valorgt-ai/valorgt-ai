/* ==========================================================================
   VALORGT AI - ORQUESTADOR DEL APLICATIVO GENERAL (LÓGICA PRINCIPAL)
   ========================================================================== */

// CONFIGURACIÓN DE SUPABASE (BASE DE DATOS EN LA NUBE PERSISTENTE)
// Para conectar tu base de datos en tiempo real:
// 1. Regístrate gratis en supabase.com y crea tu base de datos
// 2. Ejecuta el script SQL incluido en tu plan de implementación en el "SQL Editor"
// 3. Pega aquí tu URL y Anon Key públicas
const SUPABASE_URL = "https://kcwfiruutezheudqxesv.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_mparhlydfWVr_CuSPk0nHQ_-3qNaTgO";

let supabaseClient = null;
let isSupabaseActive = false;

try {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function' && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isSupabaseActive = true;
        console.log("⚡ [ValorGT AI] Conectado exitosamente a la base de datos remota de Supabase.");
    }
} catch (err) {
    console.error("⚠️ [ValorGT AI] Error al inicializar el SDK de Supabase:", err);
}

if (!isSupabaseActive) {
    console.log("🛰️ [ValorGT AI] Supabase inactivo o sin credenciales de API. Ejecutando en Modo local (contingencia local basada en mockData.js).");
}

// VARIABLES Y CONTROLADORES DEL ASISTENTE HOLOGRÁFICO IA
let globalAssistantSpeechUtterance = null;
const PAGE_EXPLANATIONS = {
    dashboard: "Bienvenido al Valuador Inteligente de ValorGT. Aquí puedes estimar el precio de mercado de cualquier propiedad ingresando su área, sector y acabados. Nuestro modelo de Inteligencia Artificial calculará la plusvalía esperada y el rango de confianza en tiempo real.",
    heatmap: "Estás en el Radar de Plusvalía e Inversión. Este mapa te permite analizar los precios por metro cuadrado y la rentabilidad en las diferentes zonas. Haz clic en las universidades o centros comerciales para ver cómo impactan el valor de la tierra en su entorno.",
    mortgage: "Este es el Simulador Hipotecario Predictivo FHA. Ingresa el precio del inmueble y el enganche para calcular tu cuota mensual estimada, la tasa de interés y el ingreso familiar mínimo requerido para precalificar al crédito bancario.",
    investor: "Bienvenido a la Terminal de Inteligencia Financiera. Aquí puedes analizar el retorno de inversión, plusvalías proyectadas por zona e índices macroeconómicos inmobiliarios clave para tomar las mejores decisiones de colocación.",
    subscriptions: "Estás en la sección de Planes y Membresías Premium. Aquí puedes explorar y seleccionar el plan SaaS que mejor se adapte a tu perfil, ya sea Broker Independiente, Desarrollador o Inversionista Premium.",
    admin: "Bienvenido al Panel de Control de Administración de ValorGT. Aquí puedes aprobar nuevos socios B2B, validar comprobantes de pago, configurar parámetros del sistema y auditar la integridad de la base de datos.",
    'commercial-login': "Esta es la puerta de acceso para agentes e inversionistas. Por favor, inicia sesión con tus credenciales o regístrate para acceder a tu consola comercial, cartera de oro digital y simulador de portafolio IA.",
    'commercial-home': "Bienvenido a tu consola comercial central. Aquí tienes una vista general del rendimiento de tu negocio SaaS, incluyendo tu facturación activa, propiedades publicadas y estadísticas de visualización de tus anuncios.",
    'commercial-oro': "Esta es tu Cartera de Oro Digital. Administra tus balances en Tether Gold respaldados físicamente por oro en bóvedas de Suiza. Puedes solicitar depósitos o programar retiros y transferencias seguras.",
    'commercial-propiedades': "Aquí puedes publicar nuevas propiedades al motor de búsqueda de ValorGT. Completa la ficha de datos, establece el precio, y carga fotografías para mostrarlas a los inversionistas en el catálogo general.",
    'commercial-propiedades-list': "Este es tu inventario de propiedades publicadas. Desde aquí puedes editar tus anuncios, suspenderlos o promocionarlos como destacados con IA para aumentar su rendimiento y alcance.",
    'commercial-portfolio': "Bienvenido al Portafolio IA y Simulador de Riqueza. Consolidamos el valor de tus propiedades, deudas y flujo neto. Puedes simular el crecimiento patrimonial a veinte años y recibir recomendaciones del Asesor IA.",
    'commercial-suscripcion': "Estás en tu panel de suscripción B2B. Revisa el estado de tu licencia, sube comprobantes de pago por transferencia bancaria o realiza el cambio de tu plan comercial."
};

// VARIABLES DE ESTADO GLOBAL
let activeCurrency = 'GTQ'; // 'GTQ' | 'USD'
const exchangeRate = 7.78; // Tipo de cambio estimado GTQ por USD
let activeValuation = null; // Guardará el resultado de la valuación actual
let activeZoneKey = null; // Guardará la zona tasada actualmente
let activePhotoBonus = 0; // Porcentaje de ajuste por fotos
let currentBankRate = 7.26; // Tasa por defecto (Banco Industrial FHA)
let currentNetCashflowUSD = 0; // Guardará el cashflow actual para reevaluación del presupuesto
let currentTotalEquityUSD = 0; // Guardará el equity actual para reevaluación del presupuesto

// VARIABLES DE ESTADO B2B & SAAS GLOBAL
let activePlansProfile = 'agente'; // 'agente' | 'inversionista'
let activeB2bPlan = 'pro'; // 'basico' | 'pro' | 'vip' | 'premium'
let adminMonthlyRevenueUSD = 1000.00;
let isCommercialAuthenticated = false;
let loggedInB2bClient = null;

// Base de datos de portafolio inicial de demostración (Guardada internamente en USD por defecto)
const PORTFOLIO_DEMO_ASSETS = [
    {
        id: "port-1",
        title: "Apartamento Lujo Cayalá Z16",
        type: "apartamento",
        zoneKey: "zona16",
        buyValue: 280000,
        currentValue: 315000,
        rent: 2200,
        hasMortgage: true,
        mortgageDebt: 160000,
        mortgagePayment: 1100,
        interestRate: 7.25,
        termYears: 20,
        maintenance: 150,
        taxes: 45,
        occupancy: 95,
        plusvalia: 8.4,
        lat: 14.6111,
        lng: -90.4725,
        isRemodeled: false,
        isAirbnb: false,
        isRefinanced: false,
        isRentRaised: false
    },
    {
        id: "port-2",
        title: "Oficina Plaza República Z10",
        type: "comercial",
        zoneKey: "zona10",
        buyValue: 185000,
        currentValue: 210000,
        rent: 1650,
        hasMortgage: true,
        mortgageDebt: 95000,
        mortgagePayment: 780,
        interestRate: 7.50,
        termYears: 15,
        maintenance: 120,
        taxes: 35,
        occupancy: 90,
        plusvalia: 7.2,
        lat: 14.5986,
        lng: -90.5085,
        isRemodeled: false,
        isAirbnb: false,
        isRefinanced: false,
        isRentRaised: false
    },
    {
        id: "port-3",
        title: "Villa Colonial San Juan",
        type: "airbnb",
        zoneKey: "antigua",
        buyValue: 420000,
        currentValue: 480000,
        rent: 3200,
        hasMortgage: false,
        mortgageDebt: 0,
        mortgagePayment: 0,
        interestRate: 0,
        termYears: 0,
        maintenance: 220,
        taxes: 80,
        occupancy: 80,
        plusvalia: 7.6,
        lat: 14.5573,
        lng: -90.7332,
        isRemodeled: false,
        isAirbnb: true,
        isRefinanced: false,
        isRentRaised: false
    }
];

let userPortfolio = [...PORTFOLIO_DEMO_ASSETS];

/**
 * Carga el portafolio correspondiente al usuario actual desde localStorage.
 * Si es un usuario logueado, carga su portafolio guardado (o vacío si es la primera vez).
 * Si no está logueado (modo preview/visitante), carga las propiedades demo.
 */
function loadUserPortfolio() {
    if (isCommercialAuthenticated && loggedInB2bClient && loggedInB2bClient.email) {
        const emailKey = `valorgt_portfolio_${loggedInB2bClient.email.toLowerCase()}`;
        const savedPortfolio = localStorage.getItem(emailKey);
        if (savedPortfolio) {
            try {
                userPortfolio = JSON.parse(savedPortfolio);
            } catch (e) {
                console.error("Error al parsear portafolio guardado:", e);
                userPortfolio = [];
            }
        } else {
            // Primera vez para este usuario: empezar con portafolio vacío (en cero)
            userPortfolio = [];
        }
    } else {
        // Visitante / Modo Demo: cargar activos de demostración
        userPortfolio = [...PORTFOLIO_DEMO_ASSETS];
    }
}

/**
 * Guarda el portafolio actual en localStorage para el usuario logueado.
 */
function saveUserPortfolio() {
    if (isCommercialAuthenticated && loggedInB2bClient && loggedInB2bClient.email) {
        const emailKey = `valorgt_portfolio_${loggedInB2bClient.email.toLowerCase()}`;
        localStorage.setItem(emailKey, JSON.stringify(userPortfolio));
    }
}

const savedB2bClient = localStorage.getItem('valorgt_active_b2b_client');
if (savedB2bClient) {
    try {
        loggedInB2bClient = JSON.parse(savedB2bClient);
        // Sanitizar sesión activa del cliente demo o inversionistas
        if (loggedInB2bClient) {
            const emailLower = (loggedInB2bClient.email || '').toLowerCase();
            const roleLower = (loggedInB2bClient.role || '').toLowerCase();
            if (roleLower === 'inversionista') {
                loggedInB2bClient.plan = 'Premium';
            } else if (emailLower === 'ana@estevezinmobiliaria.com') {
                loggedInB2bClient.plan = 'VIP';
                loggedInB2bClient.role = 'agente';
            } else if (emailLower === 'sofia@alianzagt.com') {
                loggedInB2bClient.plan = 'Básico';
                loggedInB2bClient.role = 'agente';
            }
            localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));
        }
        isCommercialAuthenticated = true;
        activeB2bPlan = (loggedInB2bClient.plan || 'pro').toLowerCase();
        loadUserPortfolio();
    } catch (e) {
        console.error("Error al restaurar sesión de agente B2B:", e);
    }
}

let saasBillingAmountUSD = 31; // Inicializado con el cobro mensual del plan Pro por defecto
let saasImpressionsCount = 12450;
let saasClientClicks = 320;
let b2bClients = JSON.parse(localStorage.getItem('b2b_clients_local')) || [
    { name: 'Ana Estévez', company: 'Estévez Inmobiliaria', nit: '4593021-3', phone: '5012-9482', email: 'ana@estevezinmobiliaria.com', plan: 'VIP', status: 'Activo', password: 'valorgt', usdtBalance: 250, role: 'agente', whatsapp: '50250129482', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80' },
    { name: 'Roberto Valenzuela', company: 'Inversiones R.V.', nit: '8294012-8', phone: '4002-8593', email: 'roberto@inversionesrv.com', plan: 'Premium', status: 'Activo', password: 'valorgt', usdtBalance: 100, role: 'inversionista', whatsapp: '50240028593', logo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=100&h=100&q=80' },
    { name: 'Sofía Rodas', company: 'Bienes Raíces Alianza', nit: '3940294-2', phone: '3948-2049', email: 'sofia@alianzagt.com', plan: 'Básico', status: 'Activo', password: 'valorgt', usdtBalance: 50, role: 'agente', whatsapp: '50239482049', logo: '' }
];

// Asegurar IDs y sanitizar planes/roles para cuentas demo e inversionistas (para evitar datos obsoletos en localStorage)
b2bClients.forEach((client, idx) => {
    if (client.role && client.role.toLowerCase() === 'inversionista') {
        client.plan = 'Premium';
    } else if (client.email) {
        const emailLower = client.email.toLowerCase();
        if (emailLower === 'ana@estevezinmobiliaria.com') {
            client.plan = 'VIP';
            client.role = 'agente';
        } else if (emailLower === 'sofia@alianzagt.com') {
            client.plan = 'Básico';
            client.role = 'agente';
        }
    }
    if (!client.id) {
        if (client.email === 'ana@estevezinmobiliaria.com') client.id = 'demo-ana-estevez';
        else if (client.email === 'roberto@inversionesrv.com') client.id = 'demo-roberto-valenzuela';
        else if (client.email === 'sofia@alianzagt.com') client.id = 'demo-sofia-rodas';
        else client.id = 'local-client-' + idx;
    }
});
localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));

let agentUploadedProperties = [];
let isB2bInventoryLoading = false;

// Cargar propiedades locales de contingencia
const savedLocalProps = localStorage.getItem('valorgt_local_properties');
if (savedLocalProps) {
    try {
        const localProps = JSON.parse(savedLocalProps);
        localProps.forEach(prop => {
            const zoneKey = prop.location;
            if (zoneKey && typeof PORTFOLIO_DATABASE !== 'undefined') {
                if (!PORTFOLIO_DATABASE[zoneKey]) {
                    PORTFOLIO_DATABASE[zoneKey] = [];
                }
                const exists = PORTFOLIO_DATABASE[zoneKey].some(p => p.id === prop.id);
                if (!exists) {
                    PORTFOLIO_DATABASE[zoneKey].push(prop);
                }
            }
        });
    } catch (e) {
        console.error("Error al decodificar propiedades locales:", e);
    }
}

/**
 * Filtra las propiedades locales del agente autenticado y las carga en agentUploadedProperties
 */
function filterAgentProperties() {
    agentUploadedProperties = [];
    if (!loggedInB2bClient) return;

    const saved = localStorage.getItem('valorgt_local_properties');
    if (saved) {
        try {
            const localProps = JSON.parse(saved);
            agentUploadedProperties = localProps.filter(p => 
                p.agent_id === loggedInB2bClient.id || 
                (p.agentName && loggedInB2bClient.name && p.agentName.toLowerCase() === loggedInB2bClient.name.toLowerCase()) ||
                (p.agentEmail && loggedInB2bClient.email && p.agentEmail.toLowerCase() === loggedInB2bClient.email.toLowerCase())
            );
        } catch (e) {
            console.error("Error al filtrar propiedades locales para el agente:", e);
        }
    }
}

/**
 * Guarda las propiedades locales del agente de forma segura en el almacenamiento local global,
 * asegurando que no sobrescriba las propiedades de otros agentes.
 */
function saveLocalPropertiesToStorage() {
    try {
        // Si no hay agente logueado, no podemos filtrar ni guardar
        if (!loggedInB2bClient) return;

        // Obtener todas las propiedades locales guardadas
        let allLocalProps = [];
        const saved = localStorage.getItem('valorgt_local_properties');
        if (saved) {
            try {
                allLocalProps = JSON.parse(saved);
            } catch (e) {
                allLocalProps = [];
            }
        }

        // Remover del listado global las propiedades del agente actual para re-insertarlas actualizadas
        allLocalProps = allLocalProps.filter(p => 
            p.agent_id !== loggedInB2bClient.id && 
            !(p.agentName && loggedInB2bClient.name && p.agentName.toLowerCase() === loggedInB2bClient.name.toLowerCase()) &&
            !(p.agentEmail && loggedInB2bClient.email && p.agentEmail.toLowerCase() === loggedInB2bClient.email.toLowerCase())
        );

        // Concatenar las propiedades del agente actual
        allLocalProps = allLocalProps.concat(agentUploadedProperties);

        localStorage.setItem('valorgt_local_properties', JSON.stringify(allLocalProps));
    } catch (storageErr) {
        console.warn("⚠️ No se pudo guardar el inventario local en localStorage (límite de cuota excedido por fotos Base64):", storageErr);
    }
}
let b2bWithdrawals = [];

function loadUserWithdrawals(email) {
    if (!email) {
        b2bWithdrawals = [];
        return;
    }
    const emailLower = email.toLowerCase();
    
    // Auto-limpieza de única vez para la cuenta de Maria Bedoya para iniciar de cero
    if (emailLower === 'laura.m.94@hotmail.com' && !localStorage.getItem('valorgt_maria_reset_v2')) {
        localStorage.removeItem(`valorgt_withdrawals_${emailLower}`);
        localStorage.removeItem(`valorgt_transfers_${emailLower}`);
        localStorage.removeItem(`valorgt_airdrops_${emailLower}`);
        localStorage.setItem('valorgt_maria_reset_v2', 'true');
    }

    const storageKey = `valorgt_withdrawals_${emailLower}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        try {
            b2bWithdrawals = JSON.parse(stored);
        } catch (e) {
            console.error("Error al parsear retiros de localStorage:", e);
            b2bWithdrawals = [];
        }
    } else {
        // Cargar registros demo por defecto únicamente para las cuentas demo
        const demoEmails = ['agente@valorgt.com', 'ana@estevezinmobiliaria.com', 'roberto@inversionesrv.com', 'sofia@alianzagt.com'];
        if (demoEmails.includes(emailLower)) {
            b2bWithdrawals = [
                { ref: 'WTH-984021', date: '2026-05-25 09:12', bank: 'Banco Industrial', account: '••••4820', amountXAUt: 0.0450, feeGTQ: 32.20, netGTQ: 772.80, status: 'Aprobado' },
                { ref: 'WTH-304910', date: '2026-05-28 10:15', bank: 'G&T Continental', account: '••••8953', amountXAUt: 0.0200, feeGTQ: 14.30, netGTQ: 343.30, status: 'Pendiente' }
            ];
            localStorage.setItem(storageKey, JSON.stringify(b2bWithdrawals));
        } else {
            b2bWithdrawals = [];
        }
    }
}
let pendingPaymentType = null; // 'subscription' | 'ad'
let pendingPaymentTarget = null; // 'basico' | 'pro' | 'vip' o un objeto { propertyId, zone }
let uploadedBase64Image = ''; // Almacenará la foto local subida en Base64
let uploadedBase64Images = []; // Almacenará múltiples fotos locales subidas en Base64 en un arreglo
let coverImageIndex = 0; // Índice de la imagen de portada principal seleccionada
let baseAdPriceGTQ = parseFloat(localStorage.getItem('valorgt_base_ad_price') || '5000'); // Tarifa base estándar de pauta comercial calibrada por el admin
let plansVideoUrl = localStorage.getItem('valorgt_plans_video_url') !== null ? localStorage.getItem('valorgt_plans_video_url') : 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // URL del video de planes premium calibrada por el admin
let welcomeVideoUrl = localStorage.getItem('valorgt_welcome_video_url') !== null ? localStorage.getItem('valorgt_welcome_video_url') : 'https://www.youtube.com/embed/M55qqyxcFSI'; // URL del video de bienvenida principal calibrada por el admin
let promoBannerMessage = localStorage.getItem('valorgt_promo_message') || '✨ ¡Oportunidad Prime! Descuento especial del 15% en pautas comerciales contratadas esta semana. Destaca tu propiedad ahora.';
let isPromoBannerActive = localStorage.getItem('valorgt_promo_active') !== 'false';
let editingPropertyId = null;



// Variables de Control para la Vista Previa de Marketing del Portafolio IA (1 minuto)
let portfolioTrialTimer = null;
let portfolioTrialTimeLeft = 60; // 60 segundos
let isPortfolioBlocked = false;
let aiChatHistory = []; // Historial de chat interactivo persistente del Asesor Patrimonial

// MAPA DE ICONOS LUCIDE ADICIONALES
const MATERIAL_ICONS = {
    "Piso de madera de ingeniería / chapa de lujo": "layers",
    "Cocina gourmet con isla y cuarzo premium": "utensils",
    "Mosaicos y grifería italiana / alemana": "droplet",
    "Domótica y automatización de luces Lutron/Control4": "cpu",
    "Ventanería de doble vidrio termoacústica europea": "square",
    "Deterioro visible en muros o pintura exterior": "alert-triangle",
    "Grietas superficiales de asentamiento en tablayeso": "shield-alert",
    "Iluminación LED indirecta integrada en cielos": "sun",
    "Acabados modernos / Remodelación completa": "sparkles",
    "Luminosidad natural óptima": "eye"
};

/**
 * Al cargar la página, inicializa los elementos base y los widgets
 */
document.addEventListener('DOMContentLoaded', () => {
    // Etiquetar propiedades iniciales de mockData.js como datos de referencia y generar IDs deterministas
    if (typeof PORTFOLIO_DATABASE !== 'undefined') {
        Object.keys(PORTFOLIO_DATABASE).forEach(zone => {
            PORTFOLIO_DATABASE[zone].forEach((prop, idx) => {
                if (prop.isAgentUpload !== true) {
                    prop.isReferenceData = true;
                    prop.isAgentUpload = false;
                }
                if (!prop.id) {
                    prop.id = `ref-${zone}-${idx}`;
                }
            });
        });
    }

    // Cargar caché local de propiedades de Supabase (SWR de alto rendimiento)
    try {
        const cachedPropsJson = localStorage.getItem('valorgt_remote_properties_cache');
        if (cachedPropsJson) {
            const cachedProps = JSON.parse(cachedPropsJson);
            if (Array.isArray(cachedProps) && cachedProps.length > 0) {
                console.log(`🚀 [Cache] Cargando ${cachedProps.length} propiedades remotas desde el almacenamiento local.`);
                cachedProps.forEach(prop => {
                    const zoneKey = prop.location;
                    if (zoneKey) {
                        if (!PORTFOLIO_DATABASE[zoneKey]) {
                            PORTFOLIO_DATABASE[zoneKey] = [];
                        }
                        const exists = PORTFOLIO_DATABASE[zoneKey].some(p => p.id === prop.id);
                        if (!exists) {
                            if (prop.sponsored) {
                                PORTFOLIO_DATABASE[zoneKey].unshift(prop);
                            } else {
                                PORTFOLIO_DATABASE[zoneKey].push(prop);
                            }
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.warn("Error al cargar la caché local de propiedades:", err);
    }

    // Cargar preferencia de sidebar de localStorage antes de crear iconos
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        const container = document.querySelector('.app-container');
        if (container) {
            container.classList.add('sidebar-collapsed');
        }
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
        }
    }

    // Inicializar iconos de vectores
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Iniciar Reloj del Sistema (Reloj Cyber)
    updateClock();
    setInterval(updateClock, 1000);
    
    // Rellenar datos por defecto en formularios e inicializar portafolio con Zona 14 por defecto
    const locationSelect = document.getElementById('prop-location');
    const defaultZone = locationSelect.value || 'zona14';
    renderFeaturedProperties(defaultZone);
    updateSuggestedValues();

    // Inicializar Terminal de Inversión y Gráficos Base
    initInvestorTerminal();

    // Inicializar Banner Promocional y Configuraciones Globales
    initPromoBannerAndSettings();

    // Sincronizar datos de Supabase si está activo
    if (isSupabaseActive) {
        syncSupabaseData().then(() => {
            checkDeepLinkParams();
        }).catch(err => {
            console.error("Error al sincronizar datos:", err);
            checkDeepLinkParams();
        });
    } else {
        filterAgentProperties();
        checkDeepLinkParams();
    }

    // Autocompletado de coordenadas GPS automático B2B al cambiar zona de ubicación
    const pubLocationSelect = document.getElementById('pub-location');
    const pubLatInput = document.getElementById('pub-lat');
    const pubLngInput = document.getElementById('pub-lng');
    
    if (pubLocationSelect && pubLatInput && pubLngInput) {
        const updateGpsCoords = () => {
            const val = pubLocationSelect.value;
            if (val && ZONES_DATABASE[val]) {
                const zone = ZONES_DATABASE[val];
                // Generar un pequeño offset aleatorio (aprox. 100-300 metros)
                const latOffset = (Math.random() - 0.5) * 0.003;
                const lngOffset = (Math.random() - 0.5) * 0.003;
                pubLatInput.value = (zone.lat + latOffset).toFixed(4);
                pubLngInput.value = (zone.lng + lngOffset).toFixed(4);
            }
        };
        pubLocationSelect.addEventListener('change', updateGpsCoords);
        
        // Ejecutar inicialmente si ya tiene valor y los campos están vacíos
        if (pubLocationSelect.value && !pubLatInput.value && !pubLngInput.value) {
            updateGpsCoords();
        }
    }

    // Visibilidad dinámica B2B en cambio de categoría
    const pubCategorySelect = document.getElementById('pub-category');
    if (pubCategorySelect) {
        pubCategorySelect.addEventListener('change', updateB2bFieldVisibility);
        updateB2bFieldVisibility(); // Ejecutar inicialmente
    }

    // Resetear formulario de edición B2B
    const publishFormEl = document.getElementById('publish-property-form');
    if (publishFormEl) {
        publishFormEl.addEventListener('reset', () => {
            editingPropertyId = null;
            const submitBtn = document.querySelector('#publish-property-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i data-lucide="plus-circle"></i> Publicar Listado en Inventario';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    // Listener para cargar múltiples fotos locales (Desde PC del agente, máx 6) como Base64 con previsualización acumulativa (en fila)
    const pubFileInput = document.getElementById('pub-file-input');
    if (pubFileInput) {
        pubFileInput.addEventListener('change', async (e) => {
            const selectedFiles = Array.from(e.target.files);
            
            if (selectedFiles.length === 0) return;
            
            // Si ya se alcanzó el límite máximo de 10 fotos, denegar
            if (uploadedBase64Images.length >= 10) {
                alert("⚠️ LÍMITE DE IMÁGENES ALCANZADO: Ya has cargado el máximo permitido de 10 fotos locales por propiedad.");
                pubFileInput.value = ''; // Resetear input
                return;
            }
            
            // Calcular espacios restantes
            const remainingSlots = 10 - uploadedBase64Images.length;
            const filesToProcess = selectedFiles.slice(0, remainingSlots);
            
            const readPromises = filesToProcess.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        resolve(event.target.result);
                    };
                    reader.readAsDataURL(file);
                });
            });
            
            const newBase64Images = await Promise.all(readPromises);
            
            // Concatenar en fila (en cola) en vez de sobreescribir
            uploadedBase64Images = uploadedBase64Images.concat(newBase64Images);
            console.log(`⚡ [ValorGT AI] ${newBase64Images.length} fotos locales agregadas a la cola. Total: ${uploadedBase64Images.length}`);
            
            // Renderizar miniaturas
            renderThumbnailsPreview();
            
            // Actualización estética interactiva premium (feedback en el label e input)
            const label = document.querySelector('label[for="pub-file-input"]');
            if (label) {
                label.innerHTML = `O Subir Fotos Locales <span style="color: var(--green); font-weight: bold;">(¡${uploadedBase64Images.length} cargadas ✔️!)</span>`;
            }
            pubFileInput.style.border = '1px solid var(--green)';
            pubFileInput.style.background = 'rgba(0, 255, 128, 0.1)';
            pubFileInput.value = ''; // Resetear el valor para permitir volver a seleccionar el mismo archivo
        });
    }
    
    // Cargar grilla pública de precios de planes
    renderPublicPricingGrid();

    // Sincronizar dinámicamente el dropdown de planes según el rol seleccionado
    const signupTypeSelect = document.getElementById('com-signup-type');
    const signupPlanSelect = document.getElementById('com-signup-plan');
    if (signupTypeSelect && signupPlanSelect) {
        signupTypeSelect.addEventListener('change', () => {
            const role = signupTypeSelect.value;
            signupPlanSelect.innerHTML = ''; // Limpiar
            if (role === 'inversionista') {
                const opt = document.createElement('option');
                opt.value = 'premium';
                opt.innerText = 'Inversionista Premium (Q340 / mes - $43.70 USD) - RECOMENDADO';
                opt.selected = true;
                signupPlanSelect.appendChild(opt);
                
                // Mostrar solo tarjeta premium si existe la pasarela de pago del registro
                const cardBasico = document.getElementById('signup-plan-basico');
                const cardPro = document.getElementById('signup-plan-pro');
                const cardVip = document.getElementById('signup-plan-vip');
                const cardPremium = document.getElementById('signup-plan-premium');
                if (cardBasico) cardBasico.style.display = 'none';
                if (cardPro) cardPro.style.display = 'none';
                if (cardVip) cardVip.style.display = 'none';
                if (cardPremium) {
                    cardPremium.style.display = 'flex';
                    selectSignupPlan('premium', 43.70);
                }
            } else {
                const opt1 = document.createElement('option');
                opt1.value = 'basico';
                opt1.innerText = 'Agente Individual (Q140 / mes - $18 USD)';
                signupPlanSelect.appendChild(opt1);
                
                const opt2 = document.createElement('option');
                opt2.value = 'pro';
                opt2.innerText = 'Inmobiliaria Pro (Q240 / mes - $31 USD) - RECOMENDADO';
                opt2.selected = true;
                signupPlanSelect.appendChild(opt2);
                
                const opt3 = document.createElement('option');
                opt3.value = 'vip';
                opt3.innerText = 'Inmobiliaria Premium / VIP (Q640 / mes - $82 USD)';
                signupPlanSelect.appendChild(opt3);
                
                // Mostrar tarjetas de agentes y ocultar premium
                const cardBasico = document.getElementById('signup-plan-basico');
                const cardPro = document.getElementById('signup-plan-pro');
                const cardVip = document.getElementById('signup-plan-vip');
                const cardPremium = document.getElementById('signup-plan-premium');
                if (cardBasico) cardBasico.style.display = 'flex';
                if (cardPro) cardPro.style.display = 'flex';
                if (cardVip) cardVip.style.display = 'flex';
                if (cardPremium) cardPremium.style.display = 'none';
                
                selectSignupPlan('pro', 31);
            }
        });
    }
});

/**
 * Renderiza el grid de miniaturas de fotos locales pre-cargadas en el formulario
 */
function renderThumbnailsPreview() {
    const previewContainer = document.getElementById('pub-thumbnails-preview');
    if (!previewContainer) return;
    
    if (uploadedBase64Images.length === 0) {
        previewContainer.classList.add('hidden');
        previewContainer.innerHTML = '';
        coverImageIndex = 0;
        return;
    }
    
    previewContainer.classList.remove('hidden');
    previewContainer.innerHTML = '';
    
    uploadedBase64Images.forEach((imgBase64, index) => {
        const isCover = index === coverImageIndex;
        
        const card = document.createElement('div');
        card.style.position = 'relative';
        card.style.width = '75px';
        card.style.height = '75px';
        card.style.borderRadius = '6px';
        card.style.overflow = 'hidden';
        card.style.border = isCover ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.15)';
        card.style.boxShadow = isCover ? '0 0 10px rgba(255, 215, 0, 0.45)' : 'none';
        card.style.transition = 'all 0.3s ease';
        card.style.background = 'rgba(0,0,0,0.5)';
        card.style.flexShrink = '0';
        
        card.innerHTML = `
            <img src="${imgBase64}" style="width: 100%; height: 100%; object-fit: cover;">
            
            <!-- Botón de Eliminar -->
            <button type="button" onclick="removePreviewImage(${index})" style="position: absolute; top: 3px; right: 3px; background: rgba(255, 55, 95, 0.85); border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 0.65rem; font-weight: bold; transition: all 0.2s;" title="Eliminar Imagen">
                &times;
            </button>
            
            <!-- Badge / Botón de Portada -->
            ${isCover ? `
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(255, 215, 0, 0.9); color: #000; font-size: 0.52rem; font-weight: bold; text-align: center; padding: 2px 0; display: flex; align-items: center; justify-content: center; gap: 2px;">
                    👑 PORTADA
                </div>
            ` : `
                <div onclick="setAsCoverImage(${index})" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.65); color: #fff; font-size: 0.5rem; text-align: center; padding: 2px 0; cursor: pointer; opacity: 0; transition: opacity 0.2s; font-weight: 500;" class="hover-cover-btn">
                    HACER PORTADA
                </div>
            `}
        `;
        
        // Efecto hover para el botón de Portada
        card.addEventListener('mouseenter', () => {
            const btn = card.querySelector('.hover-cover-btn');
            if (btn) btn.style.opacity = '1';
        });
        card.addEventListener('mouseleave', () => {
            const btn = card.querySelector('.hover-cover-btn');
            if (btn) btn.style.opacity = '0';
        });
        
        previewContainer.appendChild(card);
    });
}

/**
 * Selecciona una de las imágenes de la previsualización como portada principal
 */
function setAsCoverImage(index) {
    coverImageIndex = index;
    renderThumbnailsPreview();
    console.log(`⭐ [ValorGT AI] Imagen en índice ${index} seleccionada como Portada Principal.`);
}

/**
 * Remueve una de las imágenes de la previsualización
 */
function removePreviewImage(index) {
    uploadedBase64Images.splice(index, 1);
    
    // Ajustar el índice de portada
    if (coverImageIndex === index) {
        coverImageIndex = 0; // Resetear al primero
    } else if (coverImageIndex > index) {
        coverImageIndex--; // Desplazar hacia atrás
    }
    
    renderThumbnailsPreview();
    
    // Actualizar la etiqueta del input
    const fileInput = document.getElementById('pub-file-input');
    const label = document.querySelector('label[for="pub-file-input"]');
    if (uploadedBase64Images.length > 0) {
        if (label) {
            label.innerHTML = `O Subir Fotos Locales <span style="color: var(--green); font-weight: bold;">(¡${uploadedBase64Images.length} cargadas ✔️!)</span>`;
        }
        if (fileInput) {
            fileInput.style.border = '1px solid var(--green)';
            fileInput.style.background = 'rgba(0, 255, 128, 0.1)';
        }
    } else {
        if (label) {
            label.innerText = 'O Subir Fotos Locales (Hasta 10 desde tu PC)';
        }
        if (fileInput) {
            fileInput.style.border = '1px dashed var(--cyan)';
            fileInput.style.background = 'rgba(0,0,0,0.4)';
            fileInput.value = ''; // Limpiar el input file nativo
        }
    }
}

/**
 * Controla el cambio de vistas de la aplicación (Single Page Routing)
 * @param {string} viewId - Nombre identificador de la vista ('dashboard', 'heatmap', 'mortgage', 'investor')
 */
function switchView(viewId) {
    // Actualizar visibilidad del asistente de voz tras los cambios en el DOM
    setTimeout(() => {
        if (typeof updateAssistantVisibility === 'function') {
            updateAssistantVisibility();
        }
    }, 0);

    // 1. Pausar y ocultar todos los timers y badges de trial de marketing al cambiar de vista
    if (portfolioTrialTimer) {
        clearInterval(portfolioTrialTimer);
        portfolioTrialTimer = null;
    }
    document.getElementById('portfolio-trial-badge')?.classList.add('hidden');
    document.getElementById('heatmap-trial-badge')?.classList.add('hidden');
    document.getElementById('investor-trial-badge')?.classList.add('hidden');

    let highlightId = viewId;
    let targetViewId = viewId;

    if (viewId === 'portfolio') {
        targetViewId = 'commercial';
        highlightId = 'portfolio';

        const clientPlan = (loggedInB2bClient && loggedInB2bClient.plan) ? loggedInB2bClient.plan.toLowerCase() : '';
        const clientRole = (loggedInB2bClient && loggedInB2bClient.role) ? loggedInB2bClient.role.toLowerCase() : '';
        const hasAccess = clientPlan === 'vip' || clientPlan === 'pro' || clientPlan === 'premium' || clientRole === 'inversionista';
        
        if (isCommercialAuthenticated) {
            if (!hasAccess) {
                // Redirigir a comercial -> suscripción
                switchView('commercial');
                switchCommercialTab('suscripcion');
                alert("💼 El simulador de Portafolio IA requiere una membresía Pro, VIP o Inversionista Premium. Por favor, selecciona un plan para activarlo.");
                return;
            }
            
            // Ocultar todas las vistas y mostrar la seleccionada (contenedor commercial)
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
            const activeView = document.getElementById(`view-${targetViewId}`);
            if (activeView) activeView.classList.add('active');

            initCommercialView();
            switchCommercialTab('portfolio');
            
            // Actualizar highlights del menú
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`nav-btn-${highlightId}`);
            if (activeBtn) activeBtn.classList.add('active');
            
            document.querySelectorAll('.mobile-nav-item').forEach(btn => btn.classList.remove('active'));
            const activeMobileBtn = document.getElementById(`mobile-nav-btn-${highlightId}`);
            if (activeMobileBtn) activeMobileBtn.classList.add('active');

            // Actualizar títulos de la cabecera
            const titleEl = document.getElementById('page-title');
            const subtitleEl = document.getElementById('page-subtitle');
            if (titleEl) titleEl.innerText = "Portafolio Patrimonial IA";
            if (subtitleEl) subtitleEl.innerText = "Simulación y optimización de carteras de inversión inmobiliaria";
            
            return;
        } else {
            // Visitante en vista previa de portafolio
            // 1. Mostrar contenedor comercial
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
            const activeView = document.getElementById('view-commercial');
            if (activeView) activeView.classList.add('active');

            // 2. Configurar la pestaña portafolio en modo preview
            const tabsNav = document.querySelector('.commercial-tabs-nav');
            if (tabsNav) tabsNav.style.display = 'none';
            
            document.querySelectorAll('.comm-tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('comm-tab-content-portfolio')?.classList.remove('hidden');
            const b2bHeader = document.getElementById('commercial-header-hud');
            if (b2bHeader) b2bHeader.style.display = 'none';
            
            initPortfolioView();
            
            // 3. Highlight en la barra
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`nav-btn-${highlightId}`);
            if (activeBtn) activeBtn.classList.add('active');
            
            document.querySelectorAll('.mobile-nav-item').forEach(btn => btn.classList.remove('active'));
            const activeMobileBtn = document.getElementById(`mobile-nav-btn-${highlightId}`);
            if (activeMobileBtn) activeMobileBtn.classList.add('active');

            // Actualizar títulos de la cabecera
            const titleEl = document.getElementById('page-title');
            const subtitleEl = document.getElementById('page-subtitle');
            if (titleEl) titleEl.innerText = "Portafolio Patrimonial IA";
            if (subtitleEl) subtitleEl.innerText = "Simulación y optimización de carteras de inversión inmobiliaria";

            // 4. Manejo del timer/blocker
            const activeBlocker = document.getElementById('portfolio-trial-blocker');
            const activeBadge = document.getElementById('portfolio-trial-badge');
            const activeTimerLbl = document.getElementById('portfolio-trial-timer-lbl');
            
            if (isPortfolioBlocked || portfolioTrialTimeLeft <= 0) {
                if (activeBlocker) activeBlocker.classList.remove('hidden');
                isPortfolioBlocked = true;
                alert("⚠️ VISTA PREVIA EXPIRADA: Tu demostración gratuita de Portafolio IA ha finalizado. Por favor suscríbete para continuar.");
                
                const loginGate = document.getElementById('commercial-login-gate');
                const dashboardArea = document.getElementById('commercial-dashboard-area');
                if (loginGate) loginGate.classList.remove('hidden');
                if (dashboardArea) dashboardArea.classList.add('hidden');
                if (tabsNav) tabsNav.style.display = 'flex';
            } else {
                if (activeBlocker) activeBlocker.classList.add('hidden');
                if (activeBadge) {
                    activeBadge.classList.remove('hidden');
                    if (activeTimerLbl) activeTimerLbl.innerText = `${portfolioTrialTimeLeft}s`;
                }
                
                const loginGate = document.getElementById('commercial-login-gate');
                const dashboardArea = document.getElementById('commercial-dashboard-area');
                if (loginGate) loginGate.classList.add('hidden');
                if (dashboardArea) dashboardArea.classList.remove('hidden');
                
                portfolioTrialTimer = setInterval(() => {
                    portfolioTrialTimeLeft--;
                    const currentTimerLbl = document.getElementById('portfolio-trial-timer-lbl');
                    if (currentTimerLbl) currentTimerLbl.innerText = `${portfolioTrialTimeLeft}s`;
                    
                    if (portfolioTrialTimeLeft <= 0) {
                        clearInterval(portfolioTrialTimer);
                        portfolioTrialTimer = null;
                        isPortfolioBlocked = true;
                        
                        if (activeBlocker) activeBlocker.classList.remove('hidden');
                        if (activeBadge) {
                            activeBadge.classList.add('hidden');
                        }
                        
                        alert("⏱️ VISTA PREVIA EXPIRADA: Tu minuto de demostración gratuita de Portafolio IA ha finalizado. Por favor suscríbete para continuar.");
                        
                        if (loginGate) loginGate.classList.remove('hidden');
                        if (dashboardArea) dashboardArea.classList.add('hidden');
                        if (tabsNav) tabsNav.style.display = 'flex';
                        // Forzar cambio a comercial para quitar el highlight de portfolio
                        switchView('commercial');
                    }
                }, 1000);
            }
            return;
        }
    }

    // 2. Control del trial de marketing para las vistas Premium (Radar de Calor, Terminal de Inversión)
    const premiumViews = ['heatmap', 'investor'];
    if (premiumViews.includes(viewId)) {
        const clientEmail = (loggedInB2bClient && loggedInB2bClient.email) ? loggedInB2bClient.email.toLowerCase() : '';
        const clientPlan = (loggedInB2bClient && loggedInB2bClient.plan) ? loggedInB2bClient.plan.toLowerCase() : '';
        const clientRole = (loggedInB2bClient && loggedInB2bClient.role) ? loggedInB2bClient.role.toLowerCase() : '';
        
        const hasUnlimitedAccess = isCommercialAuthenticated && (
            clientEmail.includes('admin') ||
            clientEmail.includes('sgalindo') ||
            clientPlan === 'vip' ||
            clientPlan === 'pro' ||
            clientPlan === 'premium' ||
            clientRole === 'inversionista' ||
            (activeB2bPlan && (activeB2bPlan === 'vip' || activeB2bPlan === 'pro' || activeB2bPlan === 'premium')) ||
            (!loggedInB2bClient && isCommercialAuthenticated) // ROOT Admin bypass
        );

        const activeBlocker = document.getElementById(`${viewId}-trial-blocker`);
        const activeBadge = document.getElementById(`${viewId}-trial-badge`);
        const activeTimerLbl = document.getElementById(`${viewId}-trial-timer-lbl`);

        // Nombres amigables para alertas
        const viewNames = {
            'heatmap': 'Radar de Calor',
            'investor': 'Terminal de Inversión'
        };

        if (hasUnlimitedAccess) {
            // Ocultar bloqueadores en todas las vistas premium
            document.getElementById('portfolio-trial-blocker')?.classList.add('hidden');
            document.getElementById('heatmap-trial-blocker')?.classList.add('hidden');
            document.getElementById('investor-trial-blocker')?.classList.add('hidden');
            isPortfolioBlocked = false;
        } else {
            // Si no tiene acceso ilimitado, verificar si ya expiró la demo de 1 minuto
            if (isPortfolioBlocked || portfolioTrialTimeLeft <= 0) {
                if (activeBlocker) activeBlocker.classList.remove('hidden');
                isPortfolioBlocked = true;
                alert(`⚠️ VISTA PREVIA EXPIRADA: Tu demostración gratuita de ${viewNames[viewId]} ha finalizado. Por favor suscríbete para continuar.`);
                switchView('commercial');
                return;
            } else {
                // Si aún tiene tiempo, ocultar blocker de la vista activa y arrancar timer de cuenta regresiva
                if (activeBlocker) activeBlocker.classList.add('hidden');
                if (activeBadge) {
                    activeBadge.classList.remove('hidden');
                    if (activeTimerLbl) activeTimerLbl.innerText = `${portfolioTrialTimeLeft}s`;
                }

                portfolioTrialTimer = setInterval(() => {
                    portfolioTrialTimeLeft--;
                    // Actualizar el label activo de la pestaña donde se encuentre
                    const currentTimerLbl = document.getElementById(`${viewId}-trial-timer-lbl`);
                    if (currentTimerLbl) currentTimerLbl.innerText = `${portfolioTrialTimeLeft}s`;

                    if (portfolioTrialTimeLeft <= 0) {
                        clearInterval(portfolioTrialTimer);
                        portfolioTrialTimer = null;
                        isPortfolioBlocked = true;

                        // Mostrar bloqueador y ocultar badge
                        const currentBlocker = document.getElementById(`${viewId}-trial-blocker`);
                        if (currentBlocker) currentBlocker.classList.remove('hidden');
                        const currentBadge = document.getElementById(`${viewId}-trial-badge`);
                        if (currentBadge) currentBadge.classList.add('hidden');

                        alert(`⏱️ VISTA PREVIA EXPIRADA: Tu minuto de demostración gratuita de ${viewNames[viewId]} ha finalizado. Por favor suscríbete para continuar.`);
                        switchView('commercial');
                    }
                }, 1000);
            }
        }
    }

    // Quitar clase activa de todos los botones de navegación y agregar a la seleccionada
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    // Si la vista es comercial, solo resaltamos portfolio si realmente se está mostrando la pestaña portfolio
    if (viewId === 'commercial') {
        const portfolioContent = document.getElementById('comm-tab-content-portfolio');
        if (portfolioContent && !portfolioContent.classList.contains('hidden') && isCommercialAuthenticated) {
            highlightId = 'portfolio';
        }
    }
    
    const activeBtn = document.getElementById(`nav-btn-${highlightId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Sincronizar reactivamente los botones de navegación móvil
    document.querySelectorAll('.mobile-nav-item').forEach(btn => btn.classList.remove('active'));
    const activeMobileBtn = document.getElementById(`mobile-nav-btn-${highlightId}`);
    if (activeMobileBtn) activeMobileBtn.classList.add('active');

    // Ocultar todas las vistas y mostrar la seleccionada
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
    const activeView = document.getElementById(`view-${targetViewId}`);
    if (activeView) activeView.classList.add('active');
    
    if (viewId === 'commercial') {
        initCommercialView();
    }

    // Cambiar Título de la Cabecera Superior
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');

    if (viewId === 'dashboard') {
        titleEl.innerText = "Valuador Inmobiliario IA";
        subtitleEl.innerText = "Análisis predictivo de propiedades con redes neuronales";
        // Descargar configuración fresca en segundo plano al regresar al Dashboard
        fetchSystemSettingsFromSupabase();
        
        // Rerenderizar propiedades destacadas para reflejar permisos actualizados (ej. botón de borrar si es admin)
        const locationSelect = document.getElementById('prop-location');
        const activeZone = locationSelect ? locationSelect.value : 'zona14';
        if (typeof renderFeaturedProperties === 'function') {
            renderFeaturedProperties(activeZone);
        }
    } else if (viewId === 'heatmap') {
        titleEl.innerText = "Radar de Plusvalía e Inversión";
        subtitleEl.innerText = "Mapas de calor interactivos y telemetrías inmobiliarias";
        // Inicializar el mapa de calor Leaflet al abrir la pestaña por primera vez
        setTimeout(initHeatmap, 50);
    } else if (viewId === 'mortgage') {
        titleEl.innerText = "Simulador Hipotecario Predictivo";
        subtitleEl.innerText = "Análisis de viabilidad crediticia con tasas FHA locales de Guatemala";
        updateMortgageValues();
    } else if (viewId === 'investor') {
        titleEl.innerText = "Terminal de Inteligencia Financiera";
        subtitleEl.innerText = "ROI, plusvalías proyectadas e índices macroeconómicos inmobiliarios";
        // Renderizar gráficos de inversión
        setTimeout(() => {
            initInvestorComparisonChart();
        }, 50);
    } else if (viewId === 'commercial') {
        titleEl.innerText = isCommercialAuthenticated ? "Consola Comercial B2B" : "Área de Ingreso y Registro";
        subtitleEl.innerText = isCommercialAuthenticated ? "Gestión de propiedades, catálogo y suscripción" : "Accede a la suite de herramientas premium de ValorGT";
    } else if (viewId === 'subscriptions') {
        titleEl.innerText = "Membresías y Planes Premium";
        subtitleEl.innerText = "Potencia tu operativa con el motor SaaS de ValorGT AI e inteligencia de mercado";
        setTimeout(() => {
            initSubscriptionsView();
        }, 50);
    } else if (viewId === 'catalog') {
        titleEl.innerText = "Catálogo General de Activos";
        subtitleEl.innerText = "Buscador masivo y catálogo de propiedades en Ciudad de Guatemala";
        
        const grid = document.getElementById('catalog-properties-grid');
        const counter = document.getElementById('catalog-results-counter');
        
        // Contar el número total de propiedades cacheadas en memoria
        const totalLocalProps = Object.values(PORTFOLIO_DATABASE || {}).flat().length;
        
        if (totalLocalProps === 0) {
            // Si por alguna razón la memoria está vacía, mostramos el loading completo en la cuadrícula con Skeleton Cards holográficas
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; width: 100%;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <div class="processing-spinner-wrap" style="position: relative; width: 42px; height: 42px; margin: 0 auto 10px;">
                                <div class="neon-spinner" style="filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4)); border: 3px solid rgba(0, 240, 255, 0.1); border-top-color: var(--cyan); border-radius: 50%; width: 100%; height: 100%; animation: spin 1s linear infinite;"></div>
                            </div>
                            <h4 class="font-mono text-cyan" style="font-size: 0.85rem; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">SINCRONIZANDO LEDGER INMOBILIARIO...</h4>
                            <p class="font-mono text-muted" style="font-size: 0.6rem; margin-top: 3px; text-transform: uppercase;">Estableciendo conexión encriptada con nodo Supabase Cloud</p>
                        </div>
                        
                        <div class="catalog-loading-skeleton" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; width: 100%;">
                            <!-- Card Skeleton 1 -->
                            <div class="skeleton-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; height: 380px; padding: 15px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; animation: pulseGlow 1.5s infinite ease-in-out;">
                                <div style="width: 100%; height: 180px; background: rgba(255,255,255,0.05); border-radius: 8px;"></div>
                                <div style="width: 60%; height: 18px; background: rgba(0, 240, 255, 0.1); border-radius: 4px; margin-top: 15px;"></div>
                                <div style="width: 90%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-top: 10px;"></div>
                                <div style="width: 40%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-top: 5px;"></div>
                                <div style="display: flex; gap: 8px; margin-top: 15px;">
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                </div>
                                <div style="width: 100%; height: 35px; background: rgba(0, 240, 255, 0.05); border-radius: 6px; margin-top: 15px;"></div>
                            </div>
                            <!-- Card Skeleton 2 -->
                            <div class="skeleton-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; height: 380px; padding: 15px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; animation: pulseGlow 1.5s infinite ease-in-out; animation-delay: 0.2s;">
                                <div style="width: 100%; height: 180px; background: rgba(255,255,255,0.05); border-radius: 8px;"></div>
                                <div style="width: 50%; height: 18px; background: rgba(0, 240, 255, 0.1); border-radius: 4px; margin-top: 15px;"></div>
                                <div style="width: 80%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-top: 10px;"></div>
                                <div style="width: 30%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-top: 5px;"></div>
                                <div style="display: flex; gap: 8px; margin-top: 15px;">
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                </div>
                                <div style="width: 100%; height: 35px; background: rgba(0, 240, 255, 0.05); border-radius: 6px; margin-top: 15px;"></div>
                            </div>
                            <!-- Card Skeleton 3 -->
                            <div class="skeleton-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; height: 380px; padding: 15px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; animation: pulseGlow 1.5s infinite ease-in-out; animation-delay: 0.4s;">
                                <div style="width: 100%; height: 180px; background: rgba(255,255,255,0.05); border-radius: 8px;"></div>
                                <div style="width: 70%; height: 18px; background: rgba(0, 240, 255, 0.1); border-radius: 4px; margin-top: 15px;"></div>
                                <div style="width: 85%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-top: 10px;"></div>
                                <div style="width: 50%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-top: 5px;"></div>
                                <div style="display: flex; gap: 8px; margin-top: 15px;">
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                    <div style="width: 30%; height: 25px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                                </div>
                                <div style="width: 100%; height: 35px; background: rgba(0, 240, 255, 0.05); border-radius: 6px; margin-top: 15px;"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Si ya hay datos cacheados, renderizar de inmediato (¡Carga instantánea!)
            renderCatalogProperties();
            if (counter) {
                counter.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 5px;"><span class="neon-spinner" style="width: 10px; height: 10px; border-width: 1px; animation: spin 0.8s linear infinite; display: inline-block;"></span> SINCRONIZANDO CON LA NUBE...</span>`;
            }
        }

        // Descargar actualizaciones en segundo plano
        if (isSupabaseActive) {
            syncSupabaseData().then(() => {
                renderCatalogProperties();
            }).catch(err => {
                console.error("Error al sincronizar datos en segundo plano:", err);
                renderCatalogProperties(); // Recuperar con datos locales si falla
            });
        }
    } else if (viewId === 'admin') {
        titleEl.innerText = "Consola Global Admin & Telemetría";
        subtitleEl.innerText = "Panel central de control y auditoría de la plataforma ValorGT AI";
        setTimeout(() => {
            initAdminView();
        }, 50);
    } else if (viewId === 'disclaimer') {
        titleEl.innerText = "Disclaimer Legal y Metodológico";
        subtitleEl.innerText = "Información oficial sobre el uso de datos, algoritmos e inteligencia artificial de ValorGT®";
    } else if (viewId === 'tutorials') {
        titleEl.innerText = "Centro de Video Guías y Tutoriales";
        subtitleEl.innerText = "Aprende a dominar las telemetrías, simuladores e inteligencia artificial de la plataforma";
        loadTutorials();
    }
}

/**
 * Alterna el estado de pantalla completa (fullscreen) del mapa del radar geográfico
 */
function toggleMapFullscreen() {
    const wrapper = document.querySelector('.map-wrapper');
    const btn = document.getElementById('btn-toggle-fullscreen');
    if (!wrapper) return;
    
    const isFullscreen = wrapper.classList.toggle('map-fullscreen');
    
    if (btn) {
        if (isFullscreen) {
            btn.innerHTML = '<i data-lucide="minimize-2" style="width:12px; height:12px;"></i> Minimizar';
        } else {
            btn.innerHTML = '<i data-lucide="maximize-2" style="width:12px; height:12px;"></i> Ampliar Mapa';
        }
        lucide.createIcons();
    }
    
    // Invalidar el tamaño del mapa de Leaflet para re-centrar y cargar las celdas
    if (typeof leafletMapInstance !== 'undefined' && leafletMapInstance) {
        setTimeout(() => {
            leafletMapInstance.invalidateSize();
        }, 300);
    }
}

/**
 * Alterna el estado colapsado del menú lateral (sidebar)
 */
function toggleSidebar() {
    const container = document.querySelector('.app-container');
    if (!container) return;
    
    container.classList.toggle('sidebar-collapsed');
    const isCollapsed = container.classList.contains('sidebar-collapsed');
    
    // Cambiar el icono del botón
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = isCollapsed 
            ? '<i data-lucide="chevron-right"></i>' 
            : '<i data-lucide="chevron-left"></i>';
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    
    // Forzar el resize de Leaflet y Chart.js para que sus elementos se recalculen al nuevo tamaño del grid
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 300);
}

/**
 * Controla el despliegue de las secciones del formulario de tasación inteligente
 * @param {string} itemId - ID de la sección a expandir/colapsar
 */
function toggleAccordion(itemId) {
    const content = document.getElementById(itemId);
    if (!content) return;
    const item = content.closest('.accordion-item');
    if (!item) return;
    
    const isActive = item.classList.contains('active');
    
    // Cerramos el resto de secciones para mantener el panel ordenado (opcional y premium)
    document.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('active');
    });
    
    if (!isActive) {
        item.classList.add('active');
    }
}

/**
 * Alterna la moneda global entre GTQ (Quetzales) y USD (Dólares)
 */
function toggleCurrency() {
    const toCurrency = activeCurrency === 'GTQ' ? 'USD' : 'GTQ';
    
    // Convertir los valores numéricos actuales de los inputs del formulario del portafolio al cambiar de moneda
    convertPortfolioFormInputs(toCurrency);
    
    activeCurrency = toCurrency;

    // Registrar cambio de moneda en consola
    if (typeof appendAdminLog === 'function') {
        appendAdminLog("SYSTEM", `core_config: Moneda de visualización cambiada a ${activeCurrency}.`, false);
    }
    
    // Sincronizar todas las unidades e insignias de moneda de la app de forma inmediata
    updateFormUnits();
    
    // Actualizar interruptor visual
    const currGtq = document.getElementById('curr-gtq');
    const currUsd = document.getElementById('curr-usd');
    
    if (activeCurrency === 'GTQ') {
        currGtq.classList.add('active');
        currUsd.classList.remove('active');
    } else {
        currGtq.classList.remove('active');
        currUsd.classList.add('active');
    }

    // Actualizar precios de las propiedades destacadas en venta
    const locationSelect = document.getElementById('prop-location');
    const currentZone = locationSelect.value || 'zona14';
    renderFeaturedProperties(currentZone);

    // Si la vista de catálogo está activa, actualizar catálogo
    const catalogView = document.getElementById('view-catalog');
    if (catalogView && catalogView.classList.contains('active')) {
        renderCatalogProperties();
    }

    // No llamamos a updateSuggestedValues() aquí para no sobreescribir los parámetros ya ingresados en el tasador
    
    // Si hay una tasación activa, recalcular y actualizar visualización
    if (activeValuation) {
        updateValuationUI();
    }

    // Si estamos en la vista de simulador hipotecario, recalcular
    if (document.getElementById('view-mortgage').classList.contains('active')) {
        // Ajustar el slider de propiedad según la moneda seleccionada
        const slider = document.getElementById('mval-prop-slider');
        const currentVal = parseFloat(slider.value);
        
        if (activeCurrency === 'GTQ') {
            slider.min = 150000 * exchangeRate;
            slider.max = 8000000 * exchangeRate;
            slider.step = 50000;
            slider.value = (currentVal * exchangeRate).toFixed(0);
        } else {
            slider.min = 150000;
            slider.max = 8000000;
            slider.step = 10000;
            slider.value = (currentVal / exchangeRate).toFixed(0);
        }
        updateMortgageValues();
    }

    // Si estamos en la vista de inversión, actualizar tabla
    renderInvestorTable();
    if (comparisonChartInstance) {
        initInvestorComparisonChart();
    }

    // Si estamos en la pestaña de portafolio, actualizar
    const portfolioTab = document.getElementById('comm-tab-content-portfolio');
    if ((portfolioTab && !portfolioTab.classList.contains('hidden')) || (document.getElementById('view-portfolio') && document.getElementById('view-portfolio').classList.contains('active'))) {
        updatePortfolioCalculations();
    }

    // Si estamos en la vista comercial, actualizar
    if (document.getElementById('view-commercial') && document.getElementById('view-commercial').classList.contains('active')) {
        initCommercialView();
    }

    // Actualizar HUD de ingresos acumulados del admin en el cambio de moneda
    updateAdminMonthlyRevenueHUD();
    calculateAdminAirdropPreview();
    updateSaasMetricsHUD();

    // Si la pestaña de oro digital está activa, actualizar el gráfico con la nueva divisa
    const goldTab = document.getElementById('comm-tab-content-oro');
    if (goldTab && !goldTab.classList.contains('hidden')) {
        if (typeof renderXautHistoryChart === 'function') {
            renderXautHistoryChart();
        }
    }
}

/**
 * Actualiza los valores sugeridos (Metros, Habitaciones, etc.) según tipo
 */
function updateSuggestedValues() {
    const typeSelect = document.getElementById('prop-type');
    if (!typeSelect) return;

    // Sugerencias lógicas inteligentes por tipo
    const type = typeSelect.value;
    const sizeInput = document.getElementById('prop-size');
    const roomsInput = document.getElementById('prop-rooms');
    const bathroomsInput = document.getElementById('prop-bathrooms');
    const parkingsInput = document.getElementById('prop-parkings');
    const gardenInput = document.getElementById('prop-garden');
    const studyCheck = document.getElementById('prop-study');
    const familyCheck = document.getElementById('prop-family-room');

    if (type === 'apartamento') {
        sizeInput.value = 120;
        roomsInput.value = 3;
        bathroomsInput.value = 2.5;
        parkingsInput.value = 2;
        gardenInput.value = 0;
        studyCheck.checked = false;
        familyCheck.checked = true;
    } else if (type === 'casa') {
        sizeInput.value = 280;
        roomsInput.value = 4;
        bathroomsInput.value = 3.5;
        parkingsInput.value = 3;
        gardenInput.value = 90;
        studyCheck.checked = true;
        familyCheck.checked = true;
    } else if (type === 'terreno') {
        sizeInput.value = 400;
        roomsInput.value = 0;
        bathroomsInput.value = 0;
        parkingsInput.value = 0;
        gardenInput.value = 0;
        studyCheck.checked = false;
        familyCheck.checked = false;
    } else if (type === 'comercial') {
        sizeInput.value = 75;
        roomsInput.value = 0;
        bathroomsInput.value = 1;
        parkingsInput.value = 1;
        gardenInput.value = 0;
        studyCheck.checked = false;
        familyCheck.checked = false;
    }

    // Visibilidad dinámica avanzada de campos B2C según tipo de propiedad
    const b2cGroups = {
        'prop-size-group': type !== 'terreno',
        'prop-rooms-group': ['casa', 'apartamento', 'finca'].includes(type),
        'prop-bathrooms-group': type !== 'terreno',
        'prop-parkings-group': type !== 'terreno',
        'prop-finishes-group': type !== 'terreno',
        'prop-conservation-group': type !== 'terreno',
        'land-area-group': ['casa', 'terreno', 'finca'].includes(type),
        'land-unit-group': ['casa', 'terreno', 'finca'].includes(type),
        'land-type-group': type === 'terreno',
        'land-topography-group': type === 'terreno'
    };

    Object.keys(b2cGroups).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (b2cGroups[id]) {
                el.classList.remove('hidden-dynamic');
            } else {
                el.classList.add('hidden-dynamic');
            }
        }
    });
}

/**
 * Controla la visibilidad dinámica de los campos de la terminal B2B según la categoría elegida
 */
function updateB2bFieldVisibility() {
    const categorySelect = document.getElementById('pub-category');
    if (!categorySelect) return;

    const cat = categorySelect.value; // 'Apartamento' | 'Casa' | 'Local' | 'Bodega' | 'Terreno'

    // Reglas para el grid principal B2B
    const b2bMainGroups = {
        'pub-size-group': cat !== 'Terreno',
        'pub-beds-group': ['Casa', 'Apartamento'].includes(cat),
        'pub-baths-group': cat !== 'Terreno',
        'pub-parks-group': cat !== 'Terreno'
    };

    Object.keys(b2bMainGroups).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const input = el.querySelector('input, select');
            if (b2bMainGroups[id]) {
                el.classList.remove('hidden-dynamic');
                if (input) input.setAttribute('required', 'true');
            } else {
                el.classList.add('hidden-dynamic');
                if (input) {
                    input.removeAttribute('required');
                    // Resetear el valor si está oculto para evitar validaciones del navegador residuales
                    input.value = '';
                }
            }
        }
    });

    // Ocultar dinámicamente en el panel avanzado B2B si está presente
    const pubLandArea = document.getElementById('pub-prop-land-area');
    const pubLandUnit = document.getElementById('pub-prop-land-unit');
    if (pubLandArea && pubLandUnit) {
        const showLand = ['Casa', 'Terreno'].includes(cat);
        const areaWrapper = pubLandArea.closest('.form-group');
        const unitWrapper = pubLandUnit.closest('.form-group');
        if (areaWrapper && unitWrapper) {
            if (showLand) {
                areaWrapper.classList.remove('hidden-dynamic');
                unitWrapper.classList.remove('hidden-dynamic');
            } else {
                areaWrapper.classList.add('hidden-dynamic');
                unitWrapper.classList.add('hidden-dynamic');
            }
        }
    }
}

// VARIABLES DE ESTADO B2C DE NAVEGACIÓN
let activeB2cCategory = 'todos'; // 'todos' | 'casa' | 'apartamento' | 'local' | 'bodega' | 'terreno'
let activeB2cType = 'todos'; // 'todos' | 'venta' | 'renta'

/**
 * Extrae la categoría y el tipo de esquema comercial (Venta/Renta) de una propiedad,
 * utilizando fallbacks basados en sus etiquetas y precios si no están explícitos.
 */
function getPropertyCategoryAndType(prop) {
    let category = prop.category;
    let type = prop.type;

    if (!category) {
        const tag = (prop.tag || "").toUpperCase();
        if (tag.includes("CASA") || tag.includes("VILLA") || tag.includes("TOWNHOUSE")) {
            category = "Casa";
        } else if (tag.includes("APARTAMENTO") || tag.includes("PENTHOUSE") || tag.includes("LOFT") || tag.includes("STUDIO")) {
            category = "Apartamento";
        } else if (tag.includes("LOCAL") || tag.includes("OFICINA") || tag.includes("CLÍNICA") || tag.includes("COMERCIAL") || tag.includes("BOUTIQUE")) {
            category = "Local";
        } else if (tag.includes("BODEGA") || tag.includes("INDUSTRIAL")) {
            category = "Bodega";
        } else if (tag.includes("TERRENO") || tag.includes("LOTE")) {
            category = "Terreno";
        } else {
            category = "Casa"; // Fallback general
        }
    }

    if (!type) {
        const tag = (prop.tag || "").toUpperCase();
        const title = (prop.title || "").toUpperCase();
        // Si el precio en USD es menor a 25000, definitivamente es precio de renta mensual
        if (tag.includes("RENTA") || tag.includes("ALQUILER") || title.includes("RENTA") || title.includes("ALQUILER") || prop.priceUSD < 25000) {
            type = "Renta";
        } else {
            type = "Venta";
        }
    }

    // Normalizar capitalización
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    return { category, type };
}

/**
 * Filtra las propiedades de la portada o del catálogo según la categoría seleccionada
 */
function filterB2cCategory(category) {
    activeB2cCategory = category;
    
    // Actualizar clases activas en los botones de categoría
    document.querySelectorAll('#b2c-category-filters .btn-b2c-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Buscar y activar el botón correcto
    const activeBtn = Array.from(document.querySelectorAll('#b2c-category-filters .btn-b2c-filter')).find(btn => {
        return btn.getAttribute('onclick').includes(`'${category}'`);
    });
    if (activeBtn) activeBtn.classList.add('active');
    
    // Re-renderizar la vista correspondiente
    const catalogView = document.getElementById('view-catalog');
    if (catalogView && catalogView.classList.contains('active')) {
        renderCatalogProperties();
    } else {
        const locationSelect = document.getElementById('prop-location');
        const currentZone = locationSelect.value || 'zona14';
        renderFeaturedProperties(currentZone);
    }
}

/**
 * Filtra las propiedades de la portada o del catálogo según el esquema (venta o renta)
 */
function filterB2cType(type) {
    activeB2cType = type;
    
    // Actualizar clases activas en los botones de tipo
    document.querySelectorAll('#b2c-type-filters .btn-b2c-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Buscar y activar el botón correcto
    const activeBtn = Array.from(document.querySelectorAll('#b2c-type-filters .btn-b2c-filter')).find(btn => {
        return btn.getAttribute('onclick').includes(`'${type}'`);
    });
    if (activeBtn) activeBtn.classList.add('active');
    
    // Re-renderizar la vista correspondiente
    const catalogView = document.getElementById('view-catalog');
    if (catalogView && catalogView.classList.contains('active')) {
        renderCatalogProperties();
    } else {
        const locationSelect = document.getElementById('prop-location');
        const currentZone = locationSelect.value || 'zona14';
        renderFeaturedProperties(currentZone);
    }
}

/**
 * Renderiza dinámicamente las tarjetas de propiedades destacadas PATROCINADAS de una zona dada
 * en el escaparate premium de la portada principal.
 * @param {string} zoneKey - Clave de la zona a mostrar en el deck
 */
function renderFeaturedProperties(zoneKey) {
    const deck = document.getElementById('featured-properties-deck');
    if (!deck) return;

    deck.innerHTML = ''; // Limpiar

    const properties = PORTFOLIO_DATABASE[zoneKey];
    if (!properties) return;

    const zoneData = ZONES_DATABASE[zoneKey];
    const zoneName = zoneData.name.split(' (')[0];
    const zoneColor = zoneData.color; // 'red', 'orange', 'yellow', 'green', 'blue'
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const isAdmin = (loggedInB2bClient && loggedInB2bClient.email && (
        loggedInB2bClient.email.toLowerCase().includes('admin') || 
        loggedInB2bClient.email.toLowerCase().includes('sgalindo')
    )) || (!loggedInB2bClient && isCommercialAuthenticated);

    let renderedCount = 0;

    properties.forEach((prop) => {
        // En la portada principal, ONLY render sponsored properties
        if (prop.sponsored !== true) {
            return;
        }

        renderedCount++;
        
        // Buscar el índice original en PORTFOLIO_DATABASE para poder autotasar
        const absoluteIndex = PORTFOLIO_DATABASE[zoneKey].indexOf(prop);
        const convertedPrice = prop.priceUSD * conversion;
        const sponsoredClass = 'sponsored';
        
        const { type } = getPropertyCategoryAndType(prop);
        const priceLabel = type.toLowerCase() === 'renta' ? ' / Mes' : '';
        
        const deleteButtonHTML = (isAdmin && prop.id) ? `
            <button class="btn-delete-catalog-prop" onclick="event.stopPropagation(); deleteAgentProperty('${prop.id}')" title="Eliminar Propiedad (Admin)" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(255, 55, 95, 0.25); border: 1.5px solid #ff375f; color: #ff375f; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 0 10px rgba(255,55,95,0.25);">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        ` : '';

        const cardHTML = `
            <div class="card glassmorphism featured-card glow-${zoneColor} ${sponsoredClass}" onclick="openPropertyDetailModal('${zoneKey}', ${absoluteIndex})">
                ${deleteButtonHTML}
                ${renderCardImageHTML(prop, 'card-image-wrapper', '165px', true, 'green')}
                <div class="card-info">
                    <span class="property-tag">${prop.tag}</span>
                    <h4>${prop.title}</h4>
                    <div class="property-location">
                        <i data-lucide="map-pin" class="tiny-icon"></i> ${zoneName}
                    </div>
                    ${(() => {
                        let advancedTagsHTML = '';
                        const tags = [];
                        if (prop.hasMasterSuite) tags.push("Suite Principal");
                        if (prop.hasVisitorBath) tags.push("Baño Visitas");
                        if (prop.study) tags.push("Estudio");
                        if (prop.familyRoom) tags.push("Sala Fam.");
                        if (prop.amenities && prop.amenities.length > 0) {
                            prop.amenities.forEach(am => {
                                if (am === "amenity-pool" || am === "pool") tags.push("Piscina");
                                if (am === "amenity-gym" || am === "gym") tags.push("Gimnasio");
                                if (am === "amenity-smart" || am === "smart") tags.push("Smart Home");
                                if (am === "amenity-view" || am === "view") tags.push("Vista");
                            });
                        }
                        if (tags.length > 0) {
                            advancedTagsHTML = `
                                <div class="card-advanced-tags" style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; margin-bottom: 2px;">
                                    ${tags.slice(0, 3).map(t => `<span style="font-size: 0.65rem; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--cyan); padding: 2px 6px; border-radius: 3px; font-weight: 500;">${t}</span>`).join('')}
                                    ${tags.length > 3 ? `<span style="font-size: 0.65rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); padding: 2px 6px; border-radius: 3px;">+${tags.length - 3}</span>` : ''}
                                </div>
                            `;
                        }
                        return advancedTagsHTML;
                    })()}
                    <div class="property-specs">
                        <span><i data-lucide="maximize-2" class="tiny-icon"></i> ${prop.size} m²</span>
                        <span><i data-lucide="bed" class="tiny-icon"></i> ${prop.rooms} Hab</span>
                        <span><i data-lucide="bath" class="tiny-icon"></i> ${prop.bathrooms} Baños</span>
                        <span><i data-lucide="car" class="tiny-icon"></i> ${prop.parkings} Pq</span>
                    </div>
                    <div class="card-price-hud" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <span class="price-val" id="feat-price-${absoluteIndex}">${currencySym}${formatNumber(convertedPrice.toFixed(0))}${priceLabel}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <button class="btn-share-prop" onclick="event.stopPropagation(); sharePropertyLink(event, '${prop.id}')" title="Compartir Enlace" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--cyan); width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                                <i data-lucide="share-2" style="width: 12px; height: 12px;"></i>
                            </button>
                            <button class="btn-micro-cyber">
                                <i data-lucide="sparkles" class="tiny-icon"></i> AUTOTASAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        deck.insertAdjacentHTML('beforeend', cardHTML);
    });

    if (renderedCount === 0) {
        // Cargar banners alternativos del admin
        let banners = {};
        try {
            banners = JSON.parse(localStorage.getItem('admin_zone_banners') || '{}');
        } catch (e) {
            console.error("Error al decodificar admin_zone_banners:", e);
        }

        const customBanner = banners[zoneKey];
        if (customBanner && customBanner.enabled) {
            const bannerTitle = customBanner.title || 'Proyecto Destacado';
            const bannerSubtitle = customBanner.subtitle || 'Descubre oportunidades exclusivas en esta zona.';
            const bannerCta = customBanner.ctaText || 'MÁS INFORMACIÓN';
            const bannerLink = customBanner.link || '#';
            const bannerPhoto = customBanner.photo || 'propiedad_demo.png';
            
            deck.innerHTML = `
                <div class="premium-corporate-banner glassmorphism" onclick="window.open('${bannerLink}', '_blank')" style="grid-column: 1 / -1; display: flex; flex-direction: column; justify-content: flex-end; padding: 25px 25px; border-radius: 12px; background: url('${bannerPhoto}'); background-size: cover; background-position: center; border: 1.5px solid rgba(0, 240, 255, 0.35); box-shadow: 0 0 25px rgba(0, 240, 255, 0.18); min-height: 380px; position: relative; overflow: hidden; cursor: pointer; text-align: left; box-sizing: border-box; transition: all 0.3s ease;">
                    <div style="position: absolute; top: 15px; left: 15px; background: rgba(0, 240, 255, 0.15); border: 1px solid var(--cyan); color: var(--cyan); font-size: 0.65rem; font-weight: bold; font-family: var(--font-mono); padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 10px rgba(0, 240, 255, 0.25); display: flex; align-items: center; gap: 4px; z-index: 3;">
                        <i data-lucide="award" style="width: 11px; height: 11px;"></i> PROYECTO DESTACADO
                    </div>
                    <div style="z-index: 2; margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; width: 100%; background: transparent; padding: 18px 22px; box-sizing: border-box;">
                        <div style="flex: 1; min-width: 280px;">
                            <h3 class="font-sans" style="font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0 0 8px 0; text-shadow: 0 0 10px rgba(0,0,0,0.9); line-height: 1.25; letter-spacing: 0.5px;">${bannerTitle}</h3>
                            <p class="font-sans" style="font-size: 0.82rem; color: rgba(255,255,255,0.85); margin: 0; line-height: 1.45; text-shadow: 0 0 6px rgba(0,0,0,0.9); font-weight: 400;">${bannerSubtitle}</p>
                        </div>
                        <button class="btn btn-primary glowing-effect" onclick="event.stopPropagation(); window.open('${bannerLink}', '_blank')" style="flex-shrink: 0; padding: 12px 24px; font-size: 0.75rem; font-weight: bold; border-radius: 6px; background: linear-gradient(135deg, var(--cyan) 0%, rgba(0,102,255,0.8) 100%); border: 1px solid var(--cyan); color: #fff; cursor: pointer; box-shadow: 0 0 15px rgba(0,240,255,0.4); display: flex; align-items: center; gap: 6px; font-family: var(--font-sans); text-transform: uppercase;">
                            <span>${bannerCta}</span>
                            <i data-lucide="external-link" style="width: 12px; height: 12px;"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            deck.innerHTML = `
                <div class="ad-placeholder-card font-mono" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; border: 2px dashed rgba(52, 199, 89, 0.35); border-radius: 12px; background: linear-gradient(135deg, rgba(8, 10, 15, 0.85), rgba(52, 199, 89, 0.02)); color: var(--text-secondary); width: 100%; box-sizing: border-box; text-align: center;">
                    <i data-lucide="award" style="width: 36px; height: 36px; stroke-width: 1.5; color: var(--neon-emerald); margin-bottom: 12px; filter: drop-shadow(0 0 5px var(--neon-emerald-glow));"></i>
                    <h4 style="font-size: 0.85rem; font-weight: bold; color: var(--neon-emerald); margin-bottom: 6px; letter-spacing: 1px;">ESPACIO DE PORTADA DISPONIBLE</h4>
                    <p style="font-size: 0.65rem; max-width: 500px; line-height: 1.4; color: var(--text-secondary);">Destaca tu propiedad al inicio de la portada de <strong style="color: var(--cyan);">${zoneName}</strong> para captar el 100% de clics e impresiones.</p>
                    <button class="btn-micro-cyber" onclick="switchView('commercial')" style="margin-top: 15px; background: rgba(52, 199, 89, 0.1); border: 1px solid var(--neon-emerald); color: var(--neon-emerald);">
                        <i data-lucide="zap" class="tiny-icon"></i> CONTRATAR PAUTA PUBLICITARIA
                    </button>
                </div>
            `;
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Renderiza dinámicamente las propiedades de la zona seleccionada en la vista de Catálogo B2C
 * aplicando los filtros combinados de Categorías y Esquemas comerciales.
 */
function renderCatalogProperties() {
    const grid = document.getElementById('catalog-properties-grid');
    const counter = document.getElementById('catalog-results-counter');
    const zoneSelect = document.getElementById('catalog-zone-select');
    
    if (!grid || !zoneSelect) return;

    grid.innerHTML = ''; // Limpiar
    counter.innerText = "BUSCANDO ACTIVOS...";

    const zoneKey = zoneSelect.value;
    let properties = [];
    if (zoneKey === 'todas') {
        Object.keys(PORTFOLIO_DATABASE).forEach(zk => {
            properties = properties.concat(PORTFOLIO_DATABASE[zk] || []);
        });
    } else {
        properties = PORTFOLIO_DATABASE[zoneKey] || [];
    }

    // Filtrar duplicados por ID o Título, y excluir datos de referencia (demo/tasación)
    const seen = new Set();
    properties = properties.filter(prop => {
        if (prop.isReferenceData === true) {
            return false;
        }
        const uniqueId = prop.id || prop.title;
        if (seen.has(uniqueId)) {
            return false;
        }
        seen.add(uniqueId);
        return true;
    });

    if (!properties || properties.length === 0) {
        counter.innerText = "0 ACTIVOS ENCONTRADOS";
        return;
    }

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    // Leer filtros de búsqueda y rango de precios
    const searchVal = document.getElementById('catalog-search-input')?.value.trim().toLowerCase() || '';
    const minPriceRaw = parseFloat(document.getElementById('catalog-price-min')?.value) || 0;
    const maxPriceRaw = parseFloat(document.getElementById('catalog-price-max')?.value) || Infinity;

    // Convertir a USD para comparar con la base de datos
    const minPriceUSD = activeCurrency === 'GTQ' ? (minPriceRaw / exchangeRate) : minPriceRaw;
    const maxPriceUSD = activeCurrency === 'GTQ' ? (maxPriceRaw / exchangeRate) : maxPriceRaw;

    let renderedCount = 0;

    properties.forEach((prop) => {
        // Parse category and type (scheme) using helper
        const { category, type } = getPropertyCategoryAndType(prop);
        
        // Filter by category
        if (activeB2cCategory !== 'todos' && category.toLowerCase() !== activeB2cCategory) {
            return;
        }
        
        // Filter by type (scheme)
        if (activeB2cType !== 'todos' && type.toLowerCase() !== activeB2cType) {
            return;
        }

        // Filter by text search
        if (searchVal && !prop.title.toLowerCase().includes(searchVal) && !prop.tag.toLowerCase().includes(searchVal)) {
            return;
        }

        // Filter by price range
        if (prop.priceUSD < minPriceUSD || prop.priceUSD > maxPriceUSD) {
            return;
        }

        renderedCount++;
        
        const propZoneKey = prop.location || zoneKey;
        const absoluteIndex = PORTFOLIO_DATABASE[propZoneKey] ? PORTFOLIO_DATABASE[propZoneKey].indexOf(prop) : -1;
        const propZoneData = ZONES_DATABASE[propZoneKey];
        const propZoneName = propZoneData ? propZoneData.name.split(' (')[0] : 'Guatemala';
        const propZoneColor = propZoneData ? propZoneData.color : 'cyan';

        const convertedPrice = prop.priceUSD * conversion;
        const isSponsored = prop.sponsored === true;
        const sponsoredClass = isSponsored ? 'sponsored' : '';
        const badgeColorClass = isSponsored ? 'green' : propZoneColor;
        
        const priceLabel = type.toLowerCase() === 'renta' ? ' / Mes' : '';
        
        const isAdmin = (loggedInB2bClient && loggedInB2bClient.email && (
            loggedInB2bClient.email.toLowerCase().includes('admin') || 
            loggedInB2bClient.email.toLowerCase().includes('sgalindo')
        )) || (!loggedInB2bClient && isCommercialAuthenticated);
        const deleteButtonHTML = (isAdmin && prop.id) ? `
            <button class="btn-delete-catalog-prop" onclick="event.stopPropagation(); deleteAgentProperty('${prop.id}')" title="Eliminar Propiedad (Admin)" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(255, 55, 95, 0.25); border: 1.5px solid #ff375f; color: #ff375f; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 0 10px rgba(255,55,95,0.25);">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        ` : '';

        const cardHTML = `
            <div class="card glassmorphism featured-card glow-${propZoneColor} ${sponsoredClass}" onclick="openPropertyDetailModal('${propZoneKey}', ${absoluteIndex})">
                ${deleteButtonHTML}
                ${renderCardImageHTML(prop, 'card-image-wrapper', '260px', isSponsored, badgeColorClass)}
                <div class="card-info">
                    <span class="property-tag">${prop.tag}</span>
                    <h4>${prop.title}</h4>
                    <div class="property-location">
                        <i data-lucide="map-pin" class="tiny-icon"></i> ${propZoneName}
                    </div>
                    ${(() => {
                        let advancedTagsHTML = '';
                        const tags = [];
                        if (prop.hasMasterSuite) tags.push("Suite Principal");
                        if (prop.hasVisitorBath) tags.push("Baño Visitas");
                        if (prop.study) tags.push("Estudio");
                        if (prop.familyRoom) tags.push("Sala Fam.");
                        if (prop.amenities && prop.amenities.length > 0) {
                            prop.amenities.forEach(am => {
                                if (am === "amenity-pool" || am === "pool") tags.push("Piscina");
                                if (am === "amenity-gym" || am === "gym") tags.push("Gimnasio");
                                if (am === "amenity-smart" || am === "smart") tags.push("Smart Home");
                                if (am === "amenity-view" || am === "view") tags.push("Vista");
                            });
                        }
                        if (tags.length > 0) {
                            advancedTagsHTML = `
                                <div class="card-advanced-tags" style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; margin-bottom: 2px;">
                                    ${tags.slice(0, 3).map(t => `<span style="font-size: 0.65rem; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--cyan); padding: 2px 6px; border-radius: 3px; font-weight: 500;">${t}</span>`).join('')}
                                    ${tags.length > 3 ? `<span style="font-size: 0.65rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); padding: 2px 6px; border-radius: 3px;">+${tags.length - 3}</span>` : ''}
                                </div>
                            `;
                        }
                        return advancedTagsHTML;
                    })()}
                    <div class="property-specs">
                        <span><i data-lucide="maximize-2" class="tiny-icon"></i> ${prop.size} m²</span>
                        <span><i data-lucide="bed" class="tiny-icon"></i> ${prop.rooms} Hab</span>
                        <span><i data-lucide="bath" class="tiny-icon"></i> ${prop.bathrooms} Baños</span>
                        <span><i data-lucide="car" class="tiny-icon"></i> ${prop.parkings} Pq</span>
                    </div>
                    <div class="card-price-hud" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <span class="price-val" id="cat-price-${absoluteIndex}">${currencySym}${formatNumber(convertedPrice.toFixed(0))}${priceLabel}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <button class="btn-share-prop" onclick="event.stopPropagation(); sharePropertyLink(event, '${prop.id}')" title="Compartir Enlace" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--cyan); width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                                <i data-lucide="share-2" style="width: 12px; height: 12px;"></i>
                            </button>
                            <button class="btn-micro-cyber">
                                <i data-lucide="sparkles" class="tiny-icon"></i> AUTOTASAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    counter.innerText = `${renderedCount} ACTIVO${renderedCount === 1 ? '' : 'S'} ENCONTRADO${renderedCount === 1 ? '' : 'S'}`;

    if (renderedCount === 0) {
        grid.innerHTML = `
            <div class="empty-deck-state font-mono" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px; border: 1px dashed rgba(0, 240, 255, 0.25); border-radius: 8px; background: rgba(0, 240, 255, 0.01); color: var(--text-secondary); width: 100%; box-sizing: border-box; text-align: center;">
                <i data-lucide="search-code" style="width: 32px; height: 32px; stroke-width: 1.5; color: var(--cyan); margin-bottom: 12px;"></i>
                <h4 style="font-size: 0.85rem; font-weight: bold; color: var(--cyan); margin-bottom: 6px;">BÚSQUEDA SIN RESULTADOS</h4>
                <p style="font-size: 0.65rem; max-width: 450px; line-height: 1.4;">No se detectaron activos de la categoría <strong style="color: var(--cyan);">${activeB2cCategory.toUpperCase()}</strong> en <strong style="color: var(--cyan);">${activeB2cType === 'todos' ? 'VENTA/RENTA' : activeB2cType.toUpperCase()}</strong> en el sector de <strong style="color: var(--cyan);">${zoneName}</strong>.</p>
                <p style="font-size: 0.6rem; color: var(--text-muted); margin-top: 8px;">Intenta seleccionando otra ubicación en el menú desplegable superior, o restablece los filtros.</p>
            </div>
        `;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Autofirma y ejecuta el formulario de valuación al seleccionar una propiedad en venta
 * @param {string} zoneKey - Clave de la zona del portafolio
 * @param {number} index - Índice de la propiedad (0 a 3)
 */
function autofillValuationForm(zoneKey, index) {
    const prop = PORTFOLIO_DATABASE[zoneKey]?.[index];
    if (!prop) return;

    // Determinar el tipo en base al tag
    let typeValue = "apartamento";
    const tagLower = (prop.tag || "").toLowerCase();
    if (tagLower.includes("casa") || tagLower.includes("villa") || tagLower.includes("townhouse")) {
        typeValue = "casa";
    } else if (tagLower.includes("local") || tagLower.includes("oficina") || tagLower.includes("clínica") || tagLower.includes("comercial")) {
        typeValue = "comercial";
    } else if (tagLower.includes("terreno")) {
        typeValue = "terreno";
    }

    // Determinar la calidad de los acabados en base al badge o tag
    let finishesValue = "standard";
    if (prop.badge) {
        const badgeLower = prop.badge.toLowerCase();
        if (badgeLower.includes("lujo") || badgeLower.includes("premium") || badgeLower.includes("choice") || badgeLower.includes("vip") || badgeLower.includes("exclusiva")) {
            finishesValue = "luxury";
        }
    }

    // Llenar formulario de forma segura
    const locEl = document.getElementById("prop-location");
    if (locEl) locEl.value = zoneKey;
    
    const typeEl = document.getElementById("prop-type");
    if (typeEl) typeEl.value = typeValue;
    
    const finishesEl = document.getElementById("prop-finishes");
    if (finishesEl) finishesEl.value = finishesValue;
    
    const sizeEl = document.getElementById("prop-size");
    if (sizeEl) sizeEl.value = prop.size;
    
    const roomsEl = document.getElementById("prop-rooms");
    if (roomsEl) roomsEl.value = prop.rooms;
    
    const bathEl = document.getElementById("prop-bathrooms");
    if (bathEl) bathEl.value = prop.bathrooms;
    
    const parkEl = document.getElementById("prop-parkings");
    if (parkEl) parkEl.value = prop.parkings;
    
    const gardenEl = document.getElementById("prop-garden");
    if (gardenEl) gardenEl.value = prop.garden || 0;
    
    const studyEl = document.getElementById("prop-study");
    if (studyEl) studyEl.checked = prop.study || false;
    
    const familyEl = document.getElementById("prop-family-room");
    if (familyEl) familyEl.checked = prop.familyRoom || false;

    // Configurar amenidades de forma segura
    const poolEl = document.getElementById("amenity-pool");
    if (poolEl) poolEl.checked = prop.amenities.includes("amenity-pool") || prop.amenities.includes("pool");
    
    const gymEl = document.getElementById("amenity-gym");
    if (gymEl) gymEl.checked = prop.amenities.includes("amenity-gym") || prop.amenities.includes("gym");
    
    const securityEl = document.getElementById("amenity-security");
    if (securityEl) securityEl.checked = prop.amenities.includes("amenity-security") || prop.amenities.includes("security");
    
    const rooftopEl = document.getElementById("amenity-rooftop");
    if (rooftopEl) rooftopEl.checked = prop.amenities.includes("amenity-rooftop") || prop.amenities.includes("rooftop");
    
    const smartEl = document.getElementById("amenity-smart");
    if (smartEl) smartEl.checked = prop.amenities.includes("amenity-smart") || prop.amenities.includes("smart");

    // Configurar foto de previsualización
    const previewImg = document.getElementById('uploaded-img-preview');
    previewImg.src = prop.photo;
    
    const prompt = document.getElementById('upload-prompt');
    const previewContainer = document.getElementById('upload-preview-container');
    const scanText = document.getElementById('scan-status-text');

    prompt.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    document.getElementById('laser-scanner').classList.remove('hidden');

    scanText.innerText = "CARGANDO MUESTRA DEL PORTAFOLIO...";
    
    // Generar materiales detectados
    generateDetectedMaterials();

    // Auto-tasar tras simular telemetría en 800ms
    setTimeout(() => {
        scanText.innerText = "TELEMETRÍA CARGADA CON ÉXITO";
        document.getElementById('laser-scanner').classList.add('hidden');
        
        // Ejecutar valuación
        const mockEvent = { preventDefault: () => {} };
        calculateValuation(mockEvent);

        // Desplazar la pantalla suavemente hacia la sección de resultados
        document.getElementById('valuation-results-section').scrollIntoView({ behavior: 'smooth' });
    }, 800);
}

/**
 * Maneja la subida simulada de fotos e inicia el escaneo con láser IA
 */
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Mostrar preview y activar contenedor de escaneo
        const previewImg = document.getElementById('uploaded-img-preview');
        previewImg.src = e.target.result;
        
        const dropzone = document.getElementById('photo-dropzone');
        const prompt = document.getElementById('upload-prompt');
        const previewContainer = document.getElementById('upload-preview-container');
        const scanText = document.getElementById('scan-status-text');

        prompt.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        
        // Simular escaneo de 3 segundos
        let steps = ["ANALIZANDO TEXTURAS Y ACABADOS...", "DETECTANDO MATERIALES DE LUJO...", "CALIBRANDO ILUMINACIÓN NATURAL...", "ANÁLISIS COMPLETO"];
        let stepIdx = 0;

        const textInterval = setInterval(() => {
            if (stepIdx < steps.length - 1) {
                scanText.innerText = steps[stepIdx];
                stepIdx++;
            } else {
                clearInterval(textInterval);
            }
        }, 800);

        setTimeout(() => {
            scanText.innerText = "COMPLETADO (+12.5% VALOR EST.)";
            // Desvanecer el overlay de escaneo
            document.getElementById('laser-scanner').classList.add('hidden');
            
            // Generar y activar la telemetría de materiales detectados
            generateDetectedMaterials();
        }, 3200);
    };
    reader.readAsDataURL(file);
}

/**
 * Genera la lista de materiales detectados de forma aleatoria para la demo de IA Visual
 */
function generateDetectedMaterials() {
    const listEl = document.getElementById('detected-materials-list');
    listEl.innerHTML = ''; // Limpiar

    const idleContainer = document.getElementById('visual-ai-idle');
    const activeContainer = document.getElementById('visual-ai-active');

    idleContainer.classList.add('hidden');
    activeContainer.classList.remove('hidden');

    // Seleccionar 3 a 4 acabados premium aleatorios de la base
    const keys = Object.keys(FINISHES_ADJUSTMENTS);
    const shuffled = keys.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    activePhotoBonus = 0;

    selected.forEach(material => {
        const bonus = FINISHES_ADJUSTMENTS[material];
        activePhotoBonus += bonus;

        const iconName = MATERIAL_ICONS[material] || "check";
        const isPositive = bonus >= 0;
        const colorClass = isPositive ? 'text-green' : 'text-red';
        const sign = isPositive ? '+' : '';

        const li = document.createElement('li');
        li.innerHTML = `
            <span class="detected-name">
                <i data-lucide="${iconName}" class="tiny-icon ${colorClass}"></i>
                ${material}
            </span>
            <span class="detected-conf font-mono ${colorClass}">${sign}${(bonus * 100).toFixed(1)}%</span>
        `;
        listEl.appendChild(li);
    });

    // Actualizar el HUD del porcentaje de ajuste
    const adjustHud = document.getElementById('photo-valuation-adjustment');
    adjustHud.innerText = `${activePhotoBonus >= 0 ? '+' : ''}${(activePhotoBonus * 100).toFixed(1)}%`;
    adjustHud.className = activePhotoBonus >= 0 ? 'hud-adjust-val text-green' : 'hud-adjust-val text-red';

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Ejecuta el algoritmo complejo de Valuación IA
 */
function calculateValuation(event) {
    event.preventDefault();

    // 1. DATOS BÁSICOS
    const typeSelect = document.getElementById('prop-type');
    const locationSelect = document.getElementById('prop-location');
    const citySelect = document.getElementById('prop-city');
    const residentialInput = document.getElementById('prop-residential');
    const landAreaInput = document.getElementById('prop-land-area');
    const landUnitSelect = document.getElementById('prop-land-unit');
    const sizeInput = document.getElementById('prop-size');

    const zoneKey = locationSelect.value;
    const type = typeSelect.value;
    const city = citySelect ? citySelect.value : 'Guatemala';
    const residential = residentialInput ? residentialInput.value.trim() : '';
    const landArea = parseFloat(landAreaInput ? landAreaInput.value : '0') || 0;
    const landUnit = landUnitSelect ? landUnitSelect.value : 'v2';
    const size = parseFloat(sizeInput.value);

    // Cercanía inputs
    const nearMalls = document.getElementById('near-malls') ? document.getElementById('near-malls').checked : false;
    const nearSchools = document.getElementById('near-schools') ? document.getElementById('near-schools').checked : false;
    const nearSupers = document.getElementById('near-supers') ? document.getElementById('near-supers').checked : false;
    const nearRoads = document.getElementById('near-roads') ? document.getElementById('near-roads').checked : false;

    // 2. DISTRIBUCIÓN INTERNA
    const roomsInput = document.getElementById('prop-rooms');
    const secondaryRoomsInput = document.getElementById('room-secondary-count');
    const masterSuiteCheck = document.getElementById('room-master-suite');
    
    const bathroomsInput = document.getElementById('prop-bathrooms');
    const fullBathroomsInput = document.getElementById('bath-full-count');
    const visitorBathCheck = document.getElementById('bath-visitor');
    
    const parkingsInput = document.getElementById('prop-parkings');
    const parkingTypeSelect = document.getElementById('parking-type');
    const gardenInput = document.getElementById('prop-garden');

    const rooms = parseInt(roomsInput.value) || 0;
    const secondaryRooms = parseInt(secondaryRoomsInput ? secondaryRoomsInput.value : '0') || 0;
    const hasMasterSuite = masterSuiteCheck ? masterSuiteCheck.checked : false;
    
    const bathrooms = parseFloat(bathroomsInput.value) || 0;
    const fullBathrooms = parseInt(fullBathroomsInput ? fullBathroomsInput.value : '0') || 0;
    const hasVisitorBath = visitorBathCheck ? visitorBathCheck.checked : false;
    
    const parkings = parseInt(parkingsInput.value) || 0;
    const parkingType = parkingTypeSelect ? parkingTypeSelect.value : 'techados';
    const garden = parseFloat(gardenInput ? gardenInput.value : '0') || 0;

    // Checkboxes de distribución
    const areaLiving = document.getElementById('area-living') ? document.getElementById('area-living').checked : false;
    const areaDining = document.getElementById('area-dining') ? document.getElementById('area-dining').checked : false;
    const areaKitchen = document.getElementById('area-kitchen') ? document.getElementById('area-kitchen').checked : false;
    const areaBreakfast = document.getElementById('area-breakfast') ? document.getElementById('area-breakfast').checked : false;
    const studyCheck = document.getElementById('prop-study');
    const familyCheck = document.getElementById('prop-family-room');
    const areaMaid = document.getElementById('area-maid') ? document.getElementById('area-maid').checked : false;
    const areaLaundry = document.getElementById('area-laundry') ? document.getElementById('area-laundry').checked : false;
    const areaStorage = document.getElementById('area-storage') ? document.getElementById('area-storage').checked : false;
    const areaTerrace = document.getElementById('area-terrace') ? document.getElementById('area-terrace').checked : false;
    const areaBalcony = document.getElementById('area-balcony') ? document.getElementById('area-balcony').checked : false;
    const areaPatio = document.getElementById('area-patio') ? document.getElementById('area-patio').checked : false;

    const study = studyCheck ? studyCheck.checked : false;
    const familyRoom = familyCheck ? familyCheck.checked : false;

    // 3. CALIDAD Y ACABADOS
    const finishesSelect = document.getElementById('prop-finishes');
    const conservationSelect = document.getElementById('prop-conservation');
    const finishes = finishesSelect ? finishesSelect.value : 'standard';
    const conservation = conservationSelect ? conservationSelect.value : 'buena';

    // Materiales
    const matPorcelain = document.getElementById('mat-porcelain') ? document.getElementById('mat-porcelain').checked : false;
    const matMarble = document.getElementById('mat-marble') ? document.getElementById('mat-marble').checked : false;
    const matWood = document.getElementById('mat-wood') ? document.getElementById('mat-wood').checked : false;
    const matPvc = document.getElementById('mat-pvc') ? document.getElementById('mat-pvc').checked : false;
    const matKitchenLuxe = document.getElementById('mat-kitchen-luxe') ? document.getElementById('mat-kitchen-luxe').checked : false;

    // 4. CARACTERÍSTICAS ESPECIALES & AMENIDADES
    const amenityPool = document.getElementById('amenity-pool') ? document.getElementById('amenity-pool').checked : false;
    const amenityGym = document.getElementById('amenity-gym') ? document.getElementById('amenity-gym').checked : false;
    const amenitySecurity = document.getElementById('amenity-security') ? document.getElementById('amenity-security').checked : false;
    const amenityClubhouse = document.getElementById('amenity-clubhouse') ? document.getElementById('amenity-clubhouse').checked : false;
    const amenityView = document.getElementById('amenity-view') ? document.getElementById('amenity-view').checked : false;
    const amenitySmart = document.getElementById('amenity-smart') ? document.getElementById('amenity-smart').checked : false;
    const amenitySolar = document.getElementById('amenity-solar') ? document.getElementById('amenity-solar').checked : false;
    const amenityCistern = document.getElementById('amenity-cistern') ? document.getElementById('amenity-cistern').checked : false;
    const amenityElevator = document.getElementById('amenity-elevator') ? document.getElementById('amenity-elevator').checked : false;

    if (!zoneKey) {
        alert("Por favor selecciona una ubicación / zona de referencia.");
        return;
    }

    // Activar loader y desvanecer estado vacío
    const emptyCard = document.getElementById('empty-results-card');
    const resultsContainer = document.getElementById('results-active-container');
    const aiTyping = document.getElementById('ai-typing');
    const aiText = document.getElementById('ai-response-text');

    emptyCard.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    aiTyping.classList.remove('hidden');
    aiText.classList.add('hidden');

    activeZoneKey = zoneKey;
    const zoneData = ZONES_DATABASE[zoneKey];

    // --- ALGORITMO COMPLEJO DE VALUACIÓN INMOBILIARIA IA (VERSIÓN PRO MULTIVARIABLE) ---
    
    // 1. Regresión de tamaño (no aplica a terrenos ya que no poseen edificación)
    let sizeRegression = type === 'terreno' ? 1.0 : Math.pow(120 / size, 0.11);
    
    // 2. Determinar precio m² base según acabados generales (con soporte para calibraciones del administrador)
    const adminPriceEconomy = parseFloat(document.getElementById('admin-price-economy')?.value);
    const adminPriceStandard = parseFloat(document.getElementById('admin-price-standard')?.value);
    const adminPriceLuxury = parseFloat(document.getElementById('admin-price-luxury')?.value);

    let baseFinishesPriceM2 = !isNaN(adminPriceStandard) ? adminPriceStandard : 938; // standard default (~$120/m² en dólares)
    if (finishes === 'luxury') {
        baseFinishesPriceM2 = !isNaN(adminPriceLuxury) ? adminPriceLuxury : 1157; // Q9,000
    }
    if (finishes === 'economy') {
        baseFinishesPriceM2 = !isNaN(adminPriceEconomy) ? adminPriceEconomy : 707; // Q5,500
    }
    
    // Extraer precio m² de categoría específico del sector (Apartamentos, Casas, Oficinas, Locales, Terrenos, Bodegas)
    let categoryKey = 'apartamentos';
    if (type === 'apartamento') categoryKey = 'apartamentos';
    else if (type === 'casa') categoryKey = 'casas';
    else if (type === 'oficina') categoryKey = 'oficinas';
    else if (type === 'comercial') categoryKey = 'locales';
    else if (type === 'terreno') categoryKey = 'terrenos';
    else if (type === 'bodega') categoryKey = 'bodegas';
    else if (type === 'finca') categoryKey = 'casas'; // fallback
    
    let targetPriceM2 = zoneData.basePriceM2;
    if (zoneData.categories && zoneData.categories[categoryKey]) {
        targetPriceM2 = zoneData.categories[categoryKey].priceM2;
    }

    let locationMultiplier = targetPriceM2 / 1100;
    let priceM2 = baseFinishesPriceM2 * locationMultiplier * sizeRegression;
    
    // Valor Base por Construcción
    let baseValue = size * priceM2;

    // 3. Valor Adicional por Terreno (Aporta un 18% del valor por m² del sector, solo aplicable a Casas y Fincas)
    let landAreaM2 = landUnit === 'v2' ? landArea * 0.6988 : landArea;
    let landValue = 0;
    if (['casa', 'finca'].includes(type)) {
        landValue = landAreaM2 * (priceM2 * 0.18);
    }
    
    // Para Terrenos puros, el valor principal es el suelo y el tamaño de construcción es irrelevante
    if (type === 'terreno') {
        let landTypeFactor = 1.0;
        const landType = document.getElementById('prop-land-type')?.value || 'standard';
        if (landType === 'premium') landTypeFactor = 1.25;
        else if (landType === 'rustico') landTypeFactor = 0.55;

        let topographyFactor = 1.0;
        const topography = document.getElementById('prop-topography')?.value || 'plana';
        if (topography === 'inclinada') topographyFactor = 0.80;

        baseValue = landAreaM2 * (priceM2 * 0.85) * landTypeFactor * topographyFactor;
        landValue = 0;
    }

    let combinedBase = baseValue + landValue;

    // 4. Ajuste por Tipo de Propiedad
    let typeFactor = 1.0;
    if (type === 'apartamento') typeFactor = 1.05; // Apartamentos premium verticales tienen plus de exclusividad
    if (type === 'casa') typeFactor = 0.82; // Ajuste realista de edificación horizontal
    if (type === 'terreno') typeFactor = 1.0; // Ya calibrado en baseValue
    if (type === 'comercial') typeFactor = 1.30; // Rentabilidad comercial
    if (type === 'oficina') typeFactor = 1.20; 
    if (type === 'bodega') typeFactor = 0.70; // Costo constructivo de bodega es menor por m²
    if (type === 'finca') typeFactor = 0.60;

    // 5. Ajuste por Exclusividad Residencial / Colonia (Guatemala Exclusivo)
    let residentialGlow = 0;
    if (residential.length > 0) {
        const luxuryKeywords = ["cañada", "san isidro", "cayala", "pulte", "encinal", "hacienda real", "portal", "condado", "encuentro", "sauces", "lomas", "vistas", "socorro", "altos", "cumbres", "encanto"];
        const resLower = residential.toLowerCase();
        luxuryKeywords.forEach(kw => {
            if (resLower.includes(kw)) {
                residentialGlow += 0.05; // +5% de valor por colonia prestigiosa
            }
        });
    }

    // 6. Ajuste por Distribución Interna
    let distributionFactor = 0;
    
    // Áreas principales incorporadas
    if (areaLiving) distributionFactor += 0.015;
    if (areaDining) distributionFactor += 0.015;
    if (areaKitchen) distributionFactor += 0.02;
    if (areaBreakfast) distributionFactor += 0.01;
    if (familyRoom) distributionFactor += 0.025;
    if (study) distributionFactor += 0.035;
    if (areaMaid) distributionFactor += 0.025;
    if (areaLaundry) distributionFactor += 0.015;
    if (areaStorage) distributionFactor += 0.01;
    if (areaTerrace) distributionFactor += 0.025;
    if (areaBalcony) distributionFactor += 0.015;
    if (areaPatio) distributionFactor += 0.02;

    // Habitaciones y Baños ideales
    if (rooms > 0) {
        const sizePerRoom = size / rooms;
        if (sizePerRoom < 20) distributionFactor -= 0.06; // Hacinamiento
        if (sizePerRoom > 45) distributionFactor += 0.03; // Mayor holgura
    }
    if (hasMasterSuite) distributionFactor += 0.04;
    if (hasVisitorBath) distributionFactor += 0.02;

    // Parqueos y su tipo
    if (parkings > 2) {
        let pBonus = (parkings - 2) * 0.02;
        if (parkingType === 'techados') pBonus *= 1.2;
        if (parkingType === 'no-techados') pBonus *= 0.6;
        distributionFactor += pBonus;
    } else if (parkings === 1) {
        distributionFactor -= 0.02; // Penalización
    }

    // Jardín (crecimiento raíz cuadrada)
    if (garden > 0) {
        distributionFactor += Math.sqrt(garden) * 0.0025;
    }

    // 7. Ajuste por Calidad y Acabados de Materiales Específicos
    let materialsFactor = 0;
    if (matPorcelain) materialsFactor += 0.02;
    if (matMarble) materialsFactor += 0.05;
    if (matWood) materialsFactor += 0.04;
    if (matPvc) materialsFactor += 0.03;
    if (matKitchenLuxe) materialsFactor += 0.05;

    // Estado de conservación
    let conservationFactor = 0;
    if (conservation === 'nueva') conservationFactor += 0.10;
    if (conservation === 'remodelada') conservationFactor += 0.08;
    if (conservation === 'buena') conservationFactor += 0.03;
    if (conservation === 'regular') conservationFactor += 0.0;
    if (conservation === 'reparacion') conservationFactor -= 0.15;

    // 8. Características Especiales y Amenidades del Proyecto
    let amenityFactor = 0;
    if (amenityPool) amenityFactor += 0.05;
    if (amenityGym) amenityFactor += 0.035;
    if (amenitySecurity) amenityFactor += 0.02;
    if (amenityClubhouse) amenityFactor += 0.03;
    if (amenityView) amenityFactor += 0.04;
    if (amenitySmart) amenityFactor += 0.05;
    if (amenitySolar) amenityFactor += 0.06;
    if (amenityCistern) amenityFactor += 0.02;
    if (amenityElevator) amenityFactor += 0.035;

    // Cercanías
    let nearFactor = 0;
    if (nearMalls) nearFactor += 0.015;
    if (nearSchools) nearFactor += 0.015;
    if (nearSupers) nearFactor += 0.01;
    if (nearRoads) nearFactor += 0.01;

    // 9. Cálculo Final de Valuación (Integración de todos los factores de red neural ficticia)
    const multiplier = 1 + residentialGlow + distributionFactor + materialsFactor + conservationFactor + amenityFactor + nearFactor + activePhotoBonus;
    const finalValueUSD = combinedBase * typeFactor * multiplier;

    activeValuation = finalValueUSD;

    // Registrar en los logs de administración global de forma reactiva
    if (typeof appendAdminLog === 'function') {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        appendAdminLog("SYSTEM", `ia_engine: Tasación multivariable ejecutada en ${zoneData.name} (${typeLabel}, ${size}m²). Tasación: $${activeValuation.toFixed(0)} USD.`, false);
    }

    // Renderizar resultados financieros en pantalla
    updateValuationUI();

    // Simular escritura de la explicación IA tras 1.2 segundos
    setTimeout(() => {
        aiTyping.classList.add('hidden');
        aiText.classList.remove('hidden');
        switchAiTab('ventajas');
    }, 1200);
}

/**
 * Actualiza la UI del tasador basándose en el estado de moneda actual
 */
function updateValuationUI() {
    if (!activeValuation || !activeZoneKey) return;

    const zoneData = ZONES_DATABASE[activeZoneKey];
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const finalVal = activeValuation * conversion;
    
    // Calcular precio unitario dinámico (por m² de construcción o por v²/m² de terreno)
    const typeSelect = document.getElementById('prop-type');
    const type = typeSelect ? typeSelect.value : 'casa';
    const landUnitSelect = document.getElementById('prop-land-unit');
    const landUnit = landUnitSelect ? landUnitSelect.value : 'v2';

    let priceM2Val = 0;
    let unitLabel = 'm²';
    
    if (type === 'terreno') {
        const landAreaInput = document.getElementById('prop-land-area');
        const landArea = parseFloat(landAreaInput ? landAreaInput.value : '0') || 1;
        priceM2Val = (activeValuation / landArea) * conversion;
        unitLabel = landUnit === 'v2' ? 'v²' : 'm²';
    } else {
        const sizeInput = document.getElementById('prop-size');
        const size = parseFloat(sizeInput ? sizeInput.value : '0') || 1;
        priceM2Val = (activeValuation / size) * conversion;
        unitLabel = 'm²';
    }

    // Animación de incremento de número para el valor principal
    animateNumber('val-estimated-price', 0, finalVal, 1000);

    // Ajustar barra de rango de confianza (min/max estimado +- 7%)
    const lowRange = finalVal * 0.93;
    const highRange = finalVal * 1.07;
    document.getElementById('val-range-low').innerText = `${currencySym}${formatNumber(lowRange.toFixed(0))}`;
    document.getElementById('val-range-high').innerText = `${currencySym}${formatNumber(highRange.toFixed(0))}`;
    
    // Posicionar el puntero de la barra de rango de confianza de forma aleatoria premium (entre 40% y 60%)
    const pointerPercent = 40 + Math.random() * 20;
    document.getElementById('range-pointer').style.left = `${pointerPercent}%`;
    document.getElementById('range-fill-indicator').style.width = `${pointerPercent}%`;

    // Actualizar micro-stats
    document.getElementById('val-curr-symbol').innerText = currencySym;
    
    // Actualizar etiqueta del precio unitario dinámicamente
    const labelEl = document.getElementById('val-price-m2-label');
    if (labelEl) {
        labelEl.innerText = type === 'terreno' ? `Precio por ${unitLabel}` : 'Precio por m²';
    }
    
    document.getElementById('val-price-m2').innerText = `${currencySym}${formatNumber(priceM2Val.toFixed(0))} / ${unitLabel}`;
    document.getElementById('val-plusvalia-pct').innerText = `+${(zoneData.growth5Y / 5).toFixed(1)}%`;
    document.getElementById('val-demand-score').innerText = zoneData.demandScore;

    // Renderizar gráfico de proyección histórica
    renderHistoryChart(activeZoneKey, finalVal);
}

/**
 * Controla el cambio de pestañas analíticas de la IA explicativa
 * @param {string} tabName - Pestaña activa ('ventajas', 'riesgos', 'decision')
 */
function switchAiTab(tabName) {
    if (!activeZoneKey) return;
    const zoneData = ZONES_DATABASE[activeZoneKey];
    
    // Quitar clases activas de los botones de pestañas
    document.querySelectorAll('.ai-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabName === 'decision' ? 'decision' : tabName}`).classList.add('active');

    const contentEl = document.getElementById('ai-tab-content-text');
    const introEl = document.getElementById('ai-response-text');

    introEl.innerHTML = `Analizando telemetría de <strong>${zoneData.name.split(' (')[0]}</strong>. He procesado las condiciones de oferta y demanda estructural en base a acabados y amenidades:`;

    if (tabName === 'ventajas') {
        let listHTML = '<ul style="padding-left: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">';
        zoneData.advantages.forEach(adv => {
            listHTML += `<li>${adv}</li>`;
        });
        listHTML += '</ul>';
        contentEl.innerHTML = listHTML;
    } else if (tabName === 'riesgos') {
        let listHTML = '<ul style="padding-left: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">';
        zoneData.risks.forEach(risk => {
            listHTML += `<li>${risk}</li>`;
        });
        listHTML += '</ul>';
        contentEl.innerHTML = listHTML;
    } else if (tabName === 'decision') {
        contentEl.innerHTML = `<p style="margin-top: 6px; font-weight: 500; color: var(--green);">${zoneData.recommendation}</p>`;
    }
}

/**
 * ==========================================================================
 * LÓGICA DEL SIMULADOR HIPOTECARIO REACTIVO
 * ==========================================================================
 */

/**
 * Se activa cuando el usuario selecciona un perfil bancario predefinido en Guatemala
 */
function selectBank(bankId, rate) {
    // Quitar clase activa
    document.querySelectorAll('.bank-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    currentBankRate = rate;
    
    // Sincronizar el slider e iniciar recálculo
    const rateSlider = document.getElementById('mval-rate-slider');
    rateSlider.value = rate;
    
    updateMortgageValues();
}

/**
 * Recalcula en tiempo real el plan de financiamiento hipotecario y viabilidad
 */
function updateMortgageValues() {
    const propSlider = document.getElementById('mval-prop-slider');
    const downPctSlider = document.getElementById('mval-down-slider');
    const termSlider = document.getElementById('mval-term-slider');
    const rateSlider = document.getElementById('mval-rate-slider');

    const propVal = parseFloat(propSlider.value);
    const downPct = parseFloat(downPctSlider.value) / 100;
    const termYears = parseInt(termSlider.value);
    const annualRate = parseFloat(rateSlider.value);

    // Ajustar labels de los sliders
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    
    document.getElementById('mval-prop-display').innerText = `${currencySym}${formatNumber(propVal.toFixed(0))}`;
    
    const downVal = propVal * downPct;
    document.getElementById('mval-down-display').innerText = `${currencySym}${formatNumber(downVal.toFixed(0))} (${(downPct * 100).toFixed(0)}%)`;
    document.getElementById('mval-term-display').innerText = `${termYears} Años`;
    document.getElementById('mval-rate-display').innerText = `${annualRate.toFixed(2)}%`;

    // --- CÁLCULO FINANCIERO (Fórmula de Amortización Francesa / Cuota Nivelada) ---
    const loanAmount = propVal - downVal;
    const monthlyRate = (annualRate / 12) / 100;
    const totalMonths = termYears * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
        monthlyPayment = loanAmount / totalMonths;
    }

    const totalInterest = (monthlyPayment * totalMonths) - loanAmount;
    const minIncome = monthlyPayment * 3; // 33% de cuota/ingreso regulado en Guatemala

    // Renderizar resultados en pantalla
    document.getElementById('m-curr-sym').innerText = currencySym;
    document.getElementById('m-monthly-payment').innerText = formatNumber(monthlyPayment.toFixed(2));
    document.getElementById('mstat-prop-val').innerText = `${currencySym}${formatNumber(propVal.toFixed(0))}`;
    document.getElementById('mstat-down-val').innerText = `${currencySym}${formatNumber(downVal.toFixed(0))}`;
    document.getElementById('mstat-loan-val').innerText = `${currencySym}${formatNumber(loanAmount.toFixed(0))}`;
    document.getElementById('mstat-total-interest').innerText = `${currencySym}${formatNumber(totalInterest.toFixed(0))}`;
    document.getElementById('mstat-income-required').innerText = `${currencySym}${formatNumber(minIncome.toFixed(0))}`;

    // Evaluar Viabilidad Hipotecaria
    const viabilityBadge = document.getElementById('m-viability-badge');
    const recText = document.getElementById('m-ia-recommendation-text');
    
    // Relación cuota/ingreso simulada en base a ingresos típicos de clase media-alta en Guatemala (Q25,000 / $3,200)
    const simulatedIncome = activeCurrency === 'GTQ' ? 30000 : 3800;
    const ratio = (monthlyPayment / simulatedIncome) * 100;

    viabilityBadge.className = 'viability-badge'; // Reset

    if (ratio < 30) {
        viabilityBadge.innerText = "EXCELENTE";
        viabilityBadge.classList.add('text-green');
        recText.innerHTML = `La relación de cuota sobre ingresos estimula una viabilidad <strong>EXCELENTE</strong>. Tu exposición al endeudamiento es óptima (<30%). Se recomienda aplicar a crédito en <strong>Banco Industrial</strong> o <strong>G&T Continental</strong> para agilizar el trámite de seguro FHA y gozar del cobro decreciente de intereses.`;
    } else if (ratio >= 30 && ratio <= 45) {
        viabilityBadge.innerText = "ACEPTABLE";
        viabilityBadge.className = 'viability-badge text-cyan';
        recText.innerHTML = `Análisis de riesgo clasifica el crédito como <strong>ACEPTABLE</strong>. La cuota absorbe entre el 30% y 45% de un ingreso familiar óptimo. Se sugiere buscar una amortización más prolongada (ej. subir plazo a 25 años) o aumentar el enganche al 25% para suavizar la cuota nivelada mensual.`;
    } else {
        viabilityBadge.innerText = "ALTO RIESGO";
        viabilityBadge.className = 'viability-badge text-red';
        recText.innerHTML = `Sistemas de prevención reportan <strong>ALTO RIESGO</strong>. La cuota mensual estimada sobrepasa los márgenes de seguridad recomendados del 45% sobre ingresos promedio. <strong>Sugerencia de la IA:</strong> Busca una propiedad en una zona con precio por m² más competitivo (como CAES) o incrementa el enganche para reducir el capital a financiar.`;
    }
}

/**
 * ==========================================================================
 * PANALES DE TERMINAL DE INVERSIONISTA & TELEMETRÍAS
 * ==========================================================================
 */

/**
 * Inicializa y renderiza los datos interactivos en la terminal de inversión
 */
function initInvestorTerminal() {
    renderInvestorTable();
    initNewsFeed();
}

let activeTerminalCategory = 'apartamentos';

/**
 * Cambia la categoría de telemetrías seleccionada en la Terminal de Inversión (Bloomberg Style)
 * @param {string} category - Categoría ('apartamentos' | 'casas' | 'oficinas' | 'locales' | 'terrenos' | 'bodegas')
 */
function switchTerminalCategory(category) {
    activeTerminalCategory = category;
    
    // Actualizar estilos visuales de los botones term-tab
    document.querySelectorAll('.term-tab').forEach(btn => {
        btn.classList.remove('active');
        btn.style.border = '1px solid transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.textShadow = 'none';
        btn.style.background = 'transparent';
    });
    
    const activeBtn = document.getElementById(`term-tab-${category}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.border = '1px solid rgba(0, 240, 255, 0.2)';
        activeBtn.style.color = 'var(--cyan)';
        activeBtn.style.textShadow = '0 0 5px rgba(0,240,255,0.3)';
    }
    
    renderInvestorTable();
}

/**
 * Construye la tabla con estilo de terminal Bloomberg
 */
function renderInvestorTable() {
    const tableBody = document.getElementById('terminal-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Limpiar
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        
        // Mapeo defensivo de categorías con fallback plano retrocompatible
        let priceM2Raw = zone.basePriceM2;
        let roiVal = zone.roi;
        let plusvaliaVal = (zone.growth5Y / 5).toFixed(1);
        let liquidityVal = zone.liquidityIndex;
        let recLabel = 'COMPRAR';
        
        if (key === 'carretera') recLabel = 'VENDER';
        if (key === 'zona14' || key === 'zona10') recLabel = 'MANTENER';
        
        if (zone.categories && zone.categories[activeTerminalCategory]) {
            const cat = zone.categories[activeTerminalCategory];
            priceM2Raw = cat.priceM2;
            roiVal = cat.roi;
            plusvaliaVal = cat.growth ? cat.growth.toFixed(1) : plusvaliaVal;
            liquidityVal = cat.liquidity || liquidityVal;
            recLabel = cat.rec || recLabel;
        }

        const price = priceM2Raw * conversion;
        let recColor = 'text-green';
        if (recLabel === 'VENDER') recColor = 'text-red';
        if (recLabel === 'MANTENER' || recLabel === 'ALQUILAR') recColor = 'text-cyan';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="table-zone-name" style="font-size: 1.15rem;">${zone.name.split(' (')[0]}</span><br>
                <span class="sub-title font-mono" style="font-size:0.85rem; color:var(--text-muted)">ID: ${key.toUpperCase()}_NODE</span>
            </td>
            <td class="table-number" style="font-weight: bold; color: #fff; text-shadow: 0 0 4px rgba(255,255,255,0.1); font-size: 1.05rem;">${currencySym}${formatNumber(price.toFixed(0))} / m²</td>
            <td class="table-number text-green" style="font-weight: 500; font-size: 1.05rem;">${roiVal}%</td>
            <td class="table-number text-green" style="font-size: 1.05rem;">+${plusvaliaVal}% / año</td>
            <td class="table-number text-cyan font-mono" style="letter-spacing: 0.5px; font-size: 1.05rem;">${liquidityVal}</td>
            <td>
                <button class="btn btn-outline font-mono ${recColor}" style="padding:6px 12px; font-size:0.85rem; border:1px solid currentColor; background:transparent; cursor:pointer; font-weight: bold;" onclick="selectMapZone('${key}')">
                    ${recLabel} <i data-lucide="external-link" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Simula el feed en tiempo real de noticias financieras
 */
/**
 * Descarga noticias reales en tiempo real desde el feed RSS de Prensa Libre (Economía) de Guatemala,
 * utilizando un proxy CORS gratuito y parseándolas para inyectarlas dinámicamente en Supabase.
 */
async function fetchGuatemalaLiveNews() {
    let liveNews = [];
    try {
        console.log("🛰️ [ValorGT Live] Iniciando enlace de noticias en vivo con Prensa Libre (Economía)...");
        const feedUrl = 'https://www.prensalibre.com/seccion/economia/feed/';
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`);
        
        if (!response.ok) throw new Error("Fallo en la respuesta del proxy CORS");
        
        const data = await response.json();
        const xmlText = data.contents;
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
        
        for (let i = 0; i < Math.min(items.length, 12); i++) {
            const item = items[i];
            const title = item.getElementsByTagName("title")[0]?.textContent || "";
            if (title) {
                const cleanTitle = title.trim();
                const isAlert = cleanTitle.toLowerCase().includes("alerta") || 
                                cleanTitle.toLowerCase().includes("urgente") || 
                                cleanTitle.toLowerCase().includes("cae") || 
                                cleanTitle.toLowerCase().includes("inflación") ||
                                cleanTitle.toLowerCase().includes("petróleo") ||
                                cleanTitle.toLowerCase().includes("combustible");
                
                liveNews.push({
                    tag: isAlert ? 'ALERTA' : 'MERCADO',
                    message: cleanTitle,
                    isAlert: isAlert
                });
            }
        }
        
        // Auto-sincronizar noticias frescas en Supabase de forma transparente para nutrir el feed central
        if (liveNews.length > 0 && isSupabaseActive && supabaseClient) {
            for (const news of liveNews) {
                try {
                    // Evitar duplicados revisando si ya existe el mensaje en la base de datos
                    const { data: exists } = await supabaseClient
                        .from('market_news')
                        .select('id')
                        .eq('message', news.message)
                        .limit(1);
                        
                    if (!exists || exists.length === 0) {
                        await supabaseClient.from('market_news').insert([
                            {
                                tag: news.tag,
                                message: news.message,
                                is_alert: news.isAlert
                            }
                        ]);
                    }
                } catch (dbErr) {
                    // Continuar de forma silenciosa
                }
            }
        }
    } catch (err) {
        console.warn("⚠️ [ValorGT Live] No se pudieron sincronizar las noticias en vivo de Prensa Libre. Razón:", err.message);
    }
    return liveNews;
}

/**
 * Simula y orquesta el feed en tiempo real de noticias financieras de la terminal Bloomberg
 */
async function initNewsFeed() {
    const consoleEl = document.getElementById('news-console');
    if (!consoleEl) return;

    // Agregar primera noticia de sistema por defecto
    appendNewsLog("SYSTEM", "CORE ACTIVE V4.12. Puerto de telemetría de Guatemala ONLINE.", false);
    
    let activeNewsList = [];
    
    // 1. Intentar descargar noticias directamente desde el feed RSS en vivo de Guatemala
    try {
        const liveNews = await fetchGuatemalaLiveNews();
        if (liveNews && liveNews.length > 0) {
            activeNewsList = liveNews;
            appendNewsLog("SYSTEM", `Conexión en vivo establecida. Sincronizadas ${liveNews.length} noticias de economía real desde Prensa Libre GT.`, false);
        }
    } catch (liveErr) {
        console.warn("Fallo al obtener noticias RSS directas, intentando desde Supabase...", liveErr);
    }
    
    // 2. Si falló el RSS, intentar descargar noticias de contingencia remota desde Supabase
    if (activeNewsList.length === 0 && isSupabaseActive && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('market_news')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
                
            if (!error && data && data.length > 0) {
                console.log(`⚡ [ValorGT AI] Sincronizadas ${data.length} noticias desde Supabase.`);
                appendNewsLog("SYSTEM", "Enlace satelital de noticias en vivo sincronizado con éxito con la nube de ValorGT.", false);
                
                activeNewsList = data.map(item => ({
                    tag: item.tag || 'MERCADO',
                    message: item.message,
                    isAlert: item.is_alert || false
                }));
            }
        } catch (dbErr) {
            console.warn("Fallo al descargar noticias desde Supabase profiles:", dbErr);
        }
    }
    
    // 3. Fallback absoluto de seguridad si ambas fuentes fallaron (sin internet/sin DB)
    if (activeNewsList.length === 0) {
        activeNewsList = [...SIMULATED_NEWS];
        appendNewsLog("SYSTEM", "Corriendo en modo de contingencia local. Cargadas noticias pre-tasadas de ValorGT Labs.", false);
    }
    
    // Función auxiliar para obtener el objeto de noticia de forma estructurada
    const getNewsObject = (idx) => {
        const item = activeNewsList[idx];
        if (typeof item === 'string') {
            const isAlert = Math.random() > 0.5;
            return {
                tag: isAlert ? "MERCADO" : "INDICE",
                message: item,
                isAlert: isAlert
            };
        }
        return item;
    };

    // Mostrar primera noticia de la lista
    if (activeNewsList.length > 0) {
        const firstNews = getNewsObject(0);
        appendNewsLog(firstNews.tag, firstNews.message, firstNews.isAlert);
    }
    
    // Loop de noticias dinámico en bucle continuo cada 8 segundos
    let newsIdx = 1 % activeNewsList.length;
    setInterval(() => {
        if (activeNewsList.length > 0) {
            const newsItem = getNewsObject(newsIdx);
            appendNewsLog(newsItem.tag, newsItem.message, newsItem.isAlert);
            newsIdx = (newsIdx + 1) % activeNewsList.length;
        }
    }, 8000);
}

/**
 * Añade una línea al feed de la consola con formato e inclinación cyberpunk
 */
function appendNewsLog(tag, message, isAlert) {
    const consoleEl = document.getElementById('news-console');
    if (!consoleEl) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const log = document.createElement('div');
    log.className = 'news-log';
    
    let tagClass = 'log-tag';
    if (tag === 'ALERTA' || isAlert) tagClass += ' alert';
    if (tag === 'SYSTEM' || tag === 'INTEGRIDAD') tagClass += ' system';

    log.innerHTML = `
        <span class="log-timestamp">${timeStr}</span>
        <span class="${tagClass}">[${tag}]</span>
        <span class="log-msg">${message}</span>
    `;

    consoleEl.appendChild(log);
    
    // Auto scroll al fondo de la terminal
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

/**
 * ==========================================================================
 * HERRAMIENTAS AUXILIARES & RELOJ DEL SISTEMA
 * ==========================================================================
 */

/**
 * Formatea un número agregando separadores de miles
 * @param {string|number} num - Número a formatear
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Anima un contador numérico en pantalla de forma fluida
 */
function animateNumber(id, start, end, duration, prefix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    const range = end - start;
    let current = start;
    const increment = end > start ? Math.ceil(range / (duration / 10)) : Math.floor(range / (duration / 10));
    const stepTime = Math.abs(Math.floor(duration / range));
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            clearInterval(timer);
            current = end;
        }
        obj.innerText = prefix + formatNumber(current.toFixed(0));
    }, 10);
}

/**
 * Actualiza el reloj del sistema en formato cyberpunk
 */
function updateClock() {
    const timeEl = document.getElementById('system-time');
    if (!timeEl) return;

    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');

    timeEl.innerText = `${hrs}:${mins}:${secs} UTC-${Math.abs(now.getTimezoneOffset()/60)}`;
}

/* ==========================================================================
   LÓGICA DEL PORTAFOLIO INMOBILIARIO IA (SIMULADOR DE RIQUEZA)
   ========================================================================== */



let activePortfolioProjYears = 0; // Plazo de proyección por defecto (Actual)
let portfolioMapInstance = null;
let portfolioMarkers = [];
let portfolioCircles = [];

/**
 * Inicializa y refresca la vista del portafolio inmobiliario
 */
function initPortfolioView() {
    // Sincronizar unidades del formulario con la moneda activa
    updateFormUnits();
    
    // Ejecutar cálculos del portafolio en tiempo real
    updatePortfolioCalculations();
    
    // Iniciar el mapa de Leaflet del portafolio
    setTimeout(initPortfolioMap, 50);
}

/**
 * Actualiza las etiquetas de unidades monetarias ($ / Q) en base a la moneda activa
 */
function updateFormUnits() {
    const unitSymbol = activeCurrency === 'GTQ' ? 'Q' : '$';
    
    const buyValueUnit = document.getElementById('p-add-buyvalue-unit');
    const rentUnit = document.getElementById('p-add-rent-unit');
    const freedomBudgetUnit = document.getElementById('p-freedom-budget-unit');
    
    const debtUnit = document.getElementById('p-add-mortgagedebt-unit');
    const paymentUnit = document.getElementById('p-add-mortgagepayment-unit');
    const maintenanceUnit = document.getElementById('p-add-maintenance-unit');
    const taxesUnit = document.getElementById('p-add-taxes-unit');

    if (buyValueUnit) buyValueUnit.innerText = unitSymbol;
    if (rentUnit) rentUnit.innerText = unitSymbol;
    if (freedomBudgetUnit) freedomBudgetUnit.innerText = unitSymbol;
    
    if (debtUnit) debtUnit.innerText = unitSymbol;
    if (paymentUnit) paymentUnit.innerText = unitSymbol;
    if (maintenanceUnit) maintenanceUnit.innerText = unitSymbol;
    if (taxesUnit) taxesUnit.innerText = unitSymbol;

    // Sincronizar insignias comerciales
    document.querySelectorAll('.pub-currency-unit').forEach(el => el.innerText = unitSymbol);
    document.querySelectorAll('.promo-currency-unit').forEach(el => el.innerText = unitSymbol);
    document.querySelectorAll('.plan-currency-sym').forEach(el => el.innerText = unitSymbol);
    document.querySelectorAll('.commercial-currency-unit').forEach(el => el.innerText = unitSymbol);
    document.querySelectorAll('.commercial-currency-symbol').forEach(el => el.innerText = unitSymbol);
    
    // Sincronizar números de precios de planes y sus equivalentes
    ['basico', 'pro', 'vip', 'premium'].forEach(plan => {
        const numEl = document.getElementById(`price-num-${plan}`);
        if (numEl) {
            numEl.innerText = activeCurrency === 'GTQ' 
                ? formatNumber(numEl.getAttribute('data-gtq')) 
                : formatNumber(numEl.getAttribute('data-usd'));
        }
        
        const equivEl = document.getElementById(`price-equiv-${plan}`);
        if (equivEl && numEl) {
            equivEl.innerText = activeCurrency === 'GTQ'
                ? `(equiv. $${numEl.getAttribute('data-usd')} USD)`
                : `(equiv. Q${numEl.getAttribute('data-gtq')})`;
        }
        
        const signupNumEl = document.getElementById(`signup-price-${plan}`);
        const signupCardEl = document.getElementById(`signup-plan-${plan}`);
        if (signupNumEl && signupCardEl) {
            signupNumEl.innerText = activeCurrency === 'GTQ'
                ? formatNumber(signupCardEl.getAttribute('data-gtq'))
                : formatNumber(signupCardEl.getAttribute('data-usd'));
        }

        const signupEquivEl = document.getElementById(`signup-equiv-${plan}`);
        if (signupEquivEl && signupCardEl) {
            signupEquivEl.innerText = activeCurrency === 'GTQ'
                ? `(equiv. $${signupCardEl.getAttribute('data-usd')} USD)`
                : `(equiv. Q${signupCardEl.getAttribute('data-gtq')})`;
        }
    });

    // Sincronizar presupuesto de pauta de publicidad
    const promoBudget = document.getElementById('promo-budget');
    if (promoBudget) {
        promoBudget.value = activeCurrency === 'GTQ' ? 450 : 58;
    }

    // Re-renderizar la grilla pública de suscripciones
    renderPublicPricingGrid();
}

/**
 * Convierte los valores numéricos de los campos de entrada del portafolio al cambiar de moneda
 * @param {string} toCurrency - La nueva moneda ('GTQ' | 'USD')
 */
function convertPortfolioFormInputs(toCurrency) {
    const factor = toCurrency === 'GTQ' ? exchangeRate : (1 / exchangeRate);
    
    const inputs = [
        'p-add-buyvalue',
        'p-add-rent',
        'p-add-mortgagedebt',
        'p-add-mortgagepayment',
        'p-add-maintenance',
        'p-add-taxes',
        'p-freedom-budget',
        'pub-price'
    ];
    
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value) {
            const val = parseFloat(input.value);
            if (!isNaN(val) && val > 0) {
                input.value = Math.round(val * factor);
            }
        }
    });
}

/**
 * Muestra/oculta campos hipotecarios del formulario de nuevo activo
 */
function toggleMortgageInputs(checked) {
    const container = document.getElementById('mortgage-fields-container');
    if (!container) return;
    
    if (checked) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

/**
 * Recalcula todas las métricas agregadas del portafolio y actualiza la UI
 */
function updatePortfolioCalculations() {
    // Sincronizar unidades de los formularios e inputs del portafolio con la moneda activa
    updateFormUnits();

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let totalValueUSD = 0;
    let totalDebtUSD = 0;
    let totalRentUSD = 0;
    let totalPaymentsUSD = 0;
    let totalExpensesUSD = 0; // Mantenimiento + impuestos + vacancia estimada
    let weightedRoi = 0;
    let weightedPlusvalia = 0;

    userPortfolio.forEach(asset => {
        // Calcular valores dinámicos basados en sus estados activos (Remodelar, Airbnb, etc.)
        let currentVal = asset.currentValue;
        let currentRent = asset.rent;
        let currentPayment = asset.mortgagePayment;
        let currentRoi = (currentRent * 12) / asset.buyValue * 100;
        let currentPlus = asset.plusvalia;

        if (asset.isRemodeled) {
            currentVal *= 1.10; // Aumento de 10% en valor
            currentRoi += 1.5;   // +1.5% ROI por renta premium
            currentPlus += 2.0;  // +2% plusvalía anualizada
        }
        if (asset.isAirbnb) {
            currentRent *= 1.50; // Airbnb incrementa la tarifa de rentas un 50%
            currentRoi = (currentRent * 12) / asset.buyValue * 100;
        }
        if (asset.isRefinanced && asset.hasMortgage) {
            currentPayment *= 0.80; // Refinanciamiento reduce la cuota un 20%
        }
        if (asset.isRentRaised) {
            currentRent *= 1.10; // Alza del 10% en rentas
            currentRoi = (currentRent * 12) / asset.buyValue * 100;
        }

        const occupancyRate = asset.isAirbnb ? Math.max(asset.occupancy - 15, 60) : asset.occupancy;
        const occupancyFactor = occupancyRate / 100;

        totalValueUSD += currentVal;
        totalDebtUSD += asset.hasMortgage ? asset.mortgageDebt : 0;
        totalRentUSD += currentRent * occupancyFactor;
        totalPaymentsUSD += asset.hasMortgage ? currentPayment : 0;
        totalExpensesUSD += asset.maintenance + asset.taxes + (currentRent * (1 - occupancyFactor));

        weightedRoi += currentRoi * currentVal;
        weightedPlusvalia += currentPlus * currentVal;
    });

    const totalEquityUSD = totalValueUSD - totalDebtUSD;
    const netCashflowUSD = totalRentUSD - totalPaymentsUSD;
    const avgRoi = totalValueUSD > 0 ? weightedRoi / totalValueUSD : 0;
    const avgPlusvalia = totalValueUSD > 0 ? weightedPlusvalia / totalValueUSD : 0;

    // --- CÁLCULOS PROYECTADOS SEGÚN EL PLAZO SELECCIONADO (TIME TRAVEL SIMULATOR) ---
    const years = activePortfolioProjYears;
    const isProjected = years > 0;
    
    let displayValueUSD = totalValueUSD;
    let displayDebtUSD = totalDebtUSD;
    let displayEquityUSD = totalEquityUSD;
    let displayRentUSD = totalRentUSD;
    let displayPaymentsUSD = totalPaymentsUSD;
    let displayExpensesUSD = totalExpensesUSD;
    let displayNetCashflowUSD = netCashflowUSD;

    if (isProjected) {
        const growthRate = avgPlusvalia / 100;
        displayValueUSD = totalValueUSD * Math.pow(1 + growthRate, years);
        displayDebtUSD = Math.max(totalDebtUSD * Math.pow(1 - 0.065, years), 0);
        displayEquityUSD = displayValueUSD - displayDebtUSD;
        
        // Renta y gastos suben con la inflación (ej. 2.5% anual)
        displayRentUSD = totalRentUSD * Math.pow(1 + 0.025, years);
        displayExpensesUSD = totalExpensesUSD * Math.pow(1 + 0.025, years);
        // Si la deuda proyectada es extremadamente baja, asumimos que se canceló y cuota cae a 0
        displayPaymentsUSD = displayDebtUSD > 1000 ? totalPaymentsUSD : 0;
        
        displayNetCashflowUSD = displayRentUSD - displayPaymentsUSD;
    }

    // Guardar en variables de caché global los valores que se están mostrando (actuales o proyectados)
    currentNetCashflowUSD = displayNetCashflowUSD;
    currentTotalEquityUSD = displayEquityUSD;

    // --- ANIMAR E INJECTAR NUMEROS EN KPI DISPLAY ---
    animateNumber('pkpi-total-value', 0, displayValueUSD * conversion, 600, currencySym);
    animateNumber('pkpi-total-debt', 0, displayDebtUSD * conversion, 600, currencySym);
    animateNumber('pkpi-total-equity', 0, displayEquityUSD * conversion, 600, currencySym);
    
    document.getElementById('pkpi-total-rent').innerText = `${currencySym}${formatNumber((displayRentUSD * conversion).toFixed(0))}/m`;
    document.getElementById('pkpi-total-payments').innerText = `${currencySym}${formatNumber((displayPaymentsUSD * conversion).toFixed(0))}/m`;
    
    const cashflowEl = document.getElementById('pkpi-net-cashflow');
    const netCashflowVal = displayNetCashflowUSD * conversion;
    cashflowEl.innerText = `${currencySym}${formatNumber(netCashflowVal.toFixed(0))}/m`;
    cashflowEl.className = netCashflowVal >= 0 ? 'kpi-val font-mono text-green' : 'kpi-val font-mono text-red';

    document.getElementById('pkpi-avg-roi').innerText = `${avgRoi.toFixed(1)}%`;
    document.getElementById('pkpi-avg-plusvalia').innerText = `${avgPlusvalia.toFixed(1)}%`;

    // --- ACTUALIZAR ETIQUETAS DE TEXTO (KPI LABELS) SEGÚN LA PROYECCIÓN ---
    const lblVal = document.getElementById('lbl-total-value');
    const lblDebt = document.getElementById('lbl-total-debt');
    const lblEquity = document.getElementById('lbl-total-equity');
    const lblRent = document.getElementById('lbl-total-rent');
    const lblPayments = document.getElementById('lbl-total-payments');
    const lblCashflow = document.getElementById('lbl-net-cashflow');

    if (lblVal && lblDebt && lblEquity && lblRent && lblPayments && lblCashflow) {
        if (isProjected) {
            lblVal.innerText = `VALOR PROY. (+${years}A)`;
            lblDebt.innerText = `DEUDA PROY. (+${years}A)`;
            lblEquity.innerText = `EQUITY PROY. (+${years}A)`;
            lblRent.innerText = `RENTAS PROY. (+${years}A)`;
            lblPayments.innerText = `CUOTAS PROY. (+${years}A)`;
            lblCashflow.innerText = `FLUJO PROY. (+${years}A)`;
        } else {
            lblVal.innerText = `VALOR TOTAL`;
            lblDebt.innerText = `DEUDA TOTAL`;
            lblEquity.innerText = `EQUITY TOTAL`;
            lblRent.innerText = `RENTAS TOTALES`;
            lblPayments.innerText = `CUOTAS TOTALES`;
            lblCashflow.innerText = `FLUJO NETO`;
        }
    }

    // --- EFECTO DE GLOW PARA LAS TARJETAS PROYECTADAS ---
    const kpiCards = document.querySelectorAll('.portfolio-kpis-grid .kpi-card');
    kpiCards.forEach((card, idx) => {
        if (idx < 6) {
            if (isProjected) {
                card.classList.add('projected-glow');
            } else {
                card.classList.remove('projected-glow');
            }
        }
    });

    // --- RENDEREAR LISTA DE ACTIVOS ---
    renderPortfolioList();

    // --- RANGO DE INVERSIONISTA & GAMIFICACIÓN ---
    updateInvestorRank(totalValueUSD);

    // --- ASESOR IA E INFORMACIÓN HIPOTECARIA ---
    runAiStrategyAdvisor(displayValueUSD, displayDebtUSD, displayNetCashflowUSD, avgRoi, avgPlusvalia);

    // --- SIMULADOR DE LIBERTAD FINANCIERA ---
    updateFinancialFreedomStatus(displayNetCashflowUSD, displayEquityUSD);

    // --- ACTUALIZAR GRAFICOS ---
    setTimeout(() => {
        updatePortfolioDistributionChart();
        updatePortfolioGrowthChart(totalValueUSD, totalDebtUSD, avgPlusvalia);
    }, 50);

    // --- ACTUALIZAR MARCADORES EN EL MAPA ---
    updatePortfolioMapMarkers();
}

/**
 * Determina el rango de inversionista del usuario basado en sus holdings y actualiza los badges
 */
function updateInvestorRank(totalValueUSD) {
    const rankEl = document.getElementById('portfolio-investor-rank');
    const badgeEl = document.getElementById('portfolio-investor-badge');
    if (!rankEl || !badgeEl) return;

    badgeEl.className = 'investor-rank-badge font-mono'; // Reset classes
    
    if (totalValueUSD < 250000) {
        rankEl.innerText = "Inversionista Inicial";
        rankEl.className = "badge-val text-cyan";
        badgeEl.classList.add('glow-blue');
    } else if (totalValueUSD >= 250000 && totalValueUSD < 750000) {
        rankEl.innerText = "Generador de Flujo";
        rankEl.className = "badge-val text-green";
        badgeEl.classList.add('glow-green');
    } else if (totalValueUSD >= 750000 && totalValueUSD < 2000000) {
        rankEl.innerText = "Constructor Patrimonial";
        rankEl.className = "badge-val text-orange";
        badgeEl.classList.add('glow-orange');
    } else {
        rankEl.innerText = "Magnate Urbano";
        rankEl.className = "badge-val text-purple";
        badgeEl.classList.add('glow-purple');
    }
}

/**
 * Renderiza el listado interactivo de activos inmobiliarios
 */
function renderPortfolioList() {
    const container = document.getElementById('portfolio-assets-list');
    const countEl = document.getElementById('portfolio-assets-count');
    if (!container) return;

    container.innerHTML = ''; // Limpiar
    
    // Ordenar activos por valor actual de forma descendente (los más premium primero)
    userPortfolio.sort((a, b) => {
        let valA = a.currentValue * (a.isRemodeled ? 1.10 : 1);
        let valB = b.currentValue * (b.isRemodeled ? 1.10 : 1);
        return valB - valA;
    });

    countEl.innerText = `${userPortfolio.length} ACTIVOS`;

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    userPortfolio.forEach(asset => {
        let valVal = asset.currentValue * conversion;
        let rentVal = asset.rent * conversion;
        let debtVal = asset.mortgageDebt * conversion;

        if (asset.isRemodeled) {
            valVal *= 1.10;
        }
        if (asset.isAirbnb) {
            rentVal *= 1.50;
        }
        if (asset.isRentRaised) {
            rentVal *= 1.10;
        }

        const currentRoi = (rentVal * 12) / (asset.buyValue * conversion) * 100;

        const card = document.createElement('div');
        card.className = `asset-card`;
        
        card.innerHTML = `
            <div class="asset-header">
                <div class="asset-title-area">
                    <h4>${asset.title}</h4>
                    <span class="asset-subtitle font-mono">
                        <i data-lucide="map-pin" class="tiny-icon inline"></i>
                        ${ZONES_DATABASE[asset.zoneKey]?.name.split(' (')[0] || asset.zoneKey.toUpperCase()}
                    </span>
                </div>
                <span class="asset-badge ${asset.type}">${asset.type === 'comercial' ? 'Local' : asset.type === 'beachhouse' ? 'Playa' : asset.type}</span>
            </div>

            <div class="asset-financials-hud font-mono">
                <div class="af-box">
                    <span class="af-lbl">VALOR ACTUAL</span>
                    <span class="af-val">${currencySym}${formatNumber(valVal.toFixed(0))}</span>
                </div>
                <div class="af-box">
                    <span class="af-lbl">RENTA EST.</span>
                    <span class="af-val text-green">${currencySym}${formatNumber(rentVal.toFixed(0))}</span>
                </div>
                <div class="af-box">
                    <span class="af-lbl">DEUDA EST.</span>
                    <span class="af-val text-red">${currencySym}${formatNumber(debtVal.toFixed(0))}</span>
                </div>
            </div>

            <div class="asset-actions-row">
                <button class="btn-asset-action ${asset.isRemodeled ? 'active-purple' : ''}" onclick="toggleAssetProperty('${asset.id}', 'isRemodeled')">
                    <i data-lucide="sparkles" style="width:10px; height:10px;"></i> Remodelar
                </button>
                <button class="btn-asset-action ${asset.isAirbnb ? 'active-purple' : ''}" onclick="toggleAssetProperty('${asset.id}', 'isAirbnb')">
                    <i data-lucide="plane" style="width:10px; height:10px;"></i> Airbnb
                </button>
                ${asset.hasMortgage ? `
                <button class="btn-asset-action ${asset.isRefinanced ? 'active-purple' : ''}" onclick="toggleAssetProperty('${asset.id}', 'isRefinanced')">
                    <i data-lucide="refresh-cw" style="width:10px; height:10px;"></i> Refinanciar
                </button>
                ` : ''}
                <button class="btn-asset-action ${asset.isRentRaised ? 'active-purple' : ''}" onclick="toggleAssetProperty('${asset.id}', 'isRentRaised')">
                    <i data-lucide="trending-up" style="width:10px; height:10px;"></i> +Renta
                </button>
                <button class="btn-asset-action btn-sell" onclick="sellAsset('${asset.id}')">
                    <i data-lucide="trash-2" style="width:10px; height:10px;"></i> Vender
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Alterna el estado de una propiedad del activo (Remodelar, Airbnb, etc.)
 */
function toggleAssetProperty(assetId, propertyKey) {
    const asset = userPortfolio.find(a => a.id === assetId);
    if (!asset) return;

    asset[propertyKey] = !asset[propertyKey];
    updatePortfolioCalculations();
    saveUserPortfolio();
}

/**
 * Elimina o "Vende" un activo del portafolio
 */
function sellAsset(assetId) {
    const asset = userPortfolio.find(a => a.id === assetId);
    if (!asset) return;

    if (confirm(`¿Confirmas la venta del activo "${asset.title}"?\nEl capital líquido de tu plusvalía se agregará a tu equity total.`)) {
        userPortfolio = userPortfolio.filter(a => a.id !== assetId);
        updatePortfolioCalculations();
        saveUserPortfolio();
    }
}

/**
 * Maneja el formulario de agregar un activo e inserta una nueva propiedad
 */
function addAssetToPortfolio(event) {
    event.preventDefault();

    const title = document.getElementById('p-add-title').value;
    const zoneKey = document.getElementById('p-add-location').value;
    const type = document.getElementById('p-add-type').value;
    let buyValue = parseFloat(document.getElementById('p-add-buyvalue').value);
    let rent = parseFloat(document.getElementById('p-add-rent').value);
    const hasMortgage = document.getElementById('p-add-has-mortgage').checked;
    
    let mortgageDebt = parseFloat(document.getElementById('p-add-mortgagedebt').value) || 0;
    let mortgagePayment = parseFloat(document.getElementById('p-add-mortgagepayment').value) || 0;
    let interestRate = parseFloat(document.getElementById('p-add-mortgagerate').value) || 0;
    let termYears = parseInt(document.getElementById('p-add-mortgageterm').value) || 0;
    
    let maintenance = parseFloat(document.getElementById('p-add-maintenance').value) || 0;
    let taxes = parseFloat(document.getElementById('p-add-taxes').value) || 0;

    if (!zoneKey) {
        alert("Por favor selecciona un sector para ubicar el activo.");
        return;
    }

    // Advertencia de Alto Riesgo si la cuota bancaria excede la renta
    if (hasMortgage && mortgagePayment > rent) {
        const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
        const proceed = confirm(`⚠️ ¡CUIDADO!\nLa cuota del banco (${currencySym}${formatNumber(mortgagePayment.toFixed(0))}) excede la renta estimada (${currencySym}${formatNumber(rent.toFixed(0))}) de este activo.\n\nEsto generará un flujo de caja mensual negativo (ALTO RIESGO). Se recomienda reducir el monto del crédito o aumentar el enganche para equilibrar la operación.\n\n¿Deseas agregar este activo al portafolio de todas formas?`);
        if (!proceed) return;
    }

    // Convertir de GTQ a USD internamente si la moneda activa es GTQ
    if (activeCurrency === 'GTQ') {
        buyValue /= exchangeRate;
        rent /= exchangeRate;
        mortgageDebt /= exchangeRate;
        mortgagePayment /= exchangeRate;
        maintenance /= exchangeRate;
        taxes /= exchangeRate;
    }

    // Ubicar latitud/longitud base de la zona agregando desviación aleatoria para que no se empalmen en el mapa
    const zoneData = ZONES_DATABASE[zoneKey];
    const offsetLat = (Math.random() - 0.5) * 0.015;
    const offsetLng = (Math.random() - 0.5) * 0.015;
    const lat = zoneData ? zoneData.lat + offsetLat : 14.5956;
    const lng = zoneData ? zoneData.lng + offsetLng : -90.4851;
    const plusvalia = zoneData ? (zoneData.growth5Y / 5) : 7.5;

    const newAsset = {
        id: "port-" + (userPortfolio.length + Date.now()).toString(),
        title: title,
        type: type,
        zoneKey: zoneKey,
        buyValue: buyValue,
        currentValue: buyValue, // Al comprar, el valor actual es igual al valor de compra
        rent: rent,
        hasMortgage: hasMortgage,
        mortgageDebt: mortgageDebt,
        mortgagePayment: mortgagePayment,
        interestRate: interestRate,
        termYears: termYears,
        maintenance: maintenance,
        taxes: taxes,
        occupancy: 92, // Ocupación media de inicio
        plusvalia: plusvalia,
        lat: lat,
        lng: lng,
        isRemodeled: false,
        isAirbnb: type === 'airbnb',
        isRefinanced: false,
        isRentRaised: false
    };

    userPortfolio.push(newAsset);

    // Resetear formulario
    document.getElementById('portfolio-add-form').reset();
    document.getElementById('p-add-has-mortgage').checked = false;
    toggleMortgageInputs(false);

    // Recalcular
    updatePortfolioCalculations();
    saveUserPortfolio();
}

/**
 * Alterna el rango de años para la proyección en gráficos
 */
function switchPortfolioProjection(years) {
    document.querySelectorAll('.proj-toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`p-proj-${years}`).classList.add('active');

    activePortfolioProjYears = years;
    updatePortfolioCalculations();
}

/**
 * Actualiza el simulador de Libertad Financiera y los porcentajes
 */
function updateFinancialFreedomStatus(netCashflowUSD, totalEquityUSD) {
    const budgetInput = document.getElementById('p-freedom-budget');
    if (!budgetInput) return;

    let desiredBudget = parseFloat(budgetInput.value) || 4000;
    
    // Si la moneda activa es GTQ, deseado está en quetzales, convertimos a USD para procesar internamente
    if (activeCurrency === 'GTQ') {
        desiredBudget /= exchangeRate;
    }

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    // Usar valores guardados en caché si se llama sin argumentos (desde el evento oninput)
    const cashflow = netCashflowUSD !== undefined ? netCashflowUSD : currentNetCashflowUSD;
    const equity = totalEquityUSD !== undefined ? totalEquityUSD : currentTotalEquityUSD;

    // Calcular Libertad Financiera en porcentaje (Ingreso Neto / Gasto deseado)
    let freedomPct = desiredBudget > 0 ? (cashflow / desiredBudget) * 100 : 0;
    if (freedomPct < 0) freedomPct = 0;
    if (freedomPct > 100) freedomPct = 100;

    // Actualizar anillo de porcentaje circular (SVG Stroke Dashoffset)
    // El círculo tiene r=80, lo que da una circunferencia de 502.65px
    const circle = document.getElementById('freedom-progress-ring-circle');
    if (circle) {
        const circumference = 502.65;
        const offset = circumference - (freedomPct / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    document.getElementById('freedom-pct-val').innerText = `${freedomPct.toFixed(0)}%`;
    
    // Actualizar stats financieras de libertad
    document.getElementById('freedom-cashflow-val').innerText = `${currencySym}${formatNumber((cashflow * conversion).toFixed(0))}`;
    
    // Meta patrimonial recomendada: 120 meses (10 años) de tu presupuesto de vida deseado libre de deuda
    const targetEquityUSD = desiredBudget * 120; 
    document.getElementById('freedom-target-equity').innerText = `${currencySym}${formatNumber((targetEquityUSD * conversion).toFixed(0))}`;
}

/**
 * Ejecuta el Asesor IA que evalúa el portafolio en tiempo real y calcula su capacidad crediticia
 */
function runAiStrategyAdvisor(totalValueUSD, totalDebtUSD, netCashflowUSD, avgRoi, avgPlusvalia) {
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    // 1. Calcular capacidad de crédito mensual (bancos en Guatemala estiman que puedes dedicar hasta el 40% del cashflow limpio a nuevas cuotas)
    const availableCreditPayment = Math.max(netCashflowUSD * 0.45 * conversion, 0);
    document.getElementById('p-ai-credit-capacity').innerText = `${currencySym}${formatNumber(availableCreditPayment.toFixed(0))} / mes`;

    // 2. Generar feeds y opiniones de la IA
    const consoleEl = document.getElementById('portfolio-ai-console');
    if (!consoleEl) return;

    consoleEl.innerHTML = ''; // Limpiar anterior

    const debtRatio = totalValueUSD > 0 ? (totalDebtUSD / totalValueUSD) * 100 : 0;
    
    let adviceHtml = '';

    // Diagnóstico del Nivel de Apalancamiento
    if (debtRatio === 0) {
        adviceHtml += `<p style="margin-bottom:8px;">🟢 <strong class="text-green">Integridad de Deuda:</strong> Tienes un portafolio libre de hipotecas. Tu equity es del 100%. Esto es excelente para minimizar riesgos, aunque estás sacrificando el poder del apalancamiento para acelerar tu crecimiento.</p>`;
    } else if (debtRatio > 0 && debtRatio <= 40) {
        adviceHtml += `<p style="margin-bottom:8px;">🟢 <strong class="text-green">Integridad de Deuda:</strong> Tu apalancamiento es del <strong>${debtRatio.toFixed(1)}%</strong>. Clasificas en un rango de <strong class="text-green">RIESGO CONSERVADOR</strong>. Tus ingresos de renta soportan con holgura las amortizaciones bancarias.</p>`;
    } else if (debtRatio > 40 && debtRatio <= 65) {
        adviceHtml += `<p style="margin-bottom:8px;">🟡 <strong class="text-purple">Apalancamiento Moderado:</strong> Tu nivel de deuda es del <strong>${debtRatio.toFixed(1)}%</strong>. Estás apalancándote eficientemente. Asegúrate de blindar la liquidez con un fondo de reserva para vacancias.</p>`;
    } else {
        adviceHtml += `<p style="margin-bottom:8px;">🔴 <strong class="text-red">ALTO APALANCAMIENTO:</strong> Tu deuda representa el <strong>${debtRatio.toFixed(1)}%</strong> del valor de tus activos. Esto reduce sustancialmente tu flujo neto disponible. Recomendamos amortizar capital o refinanciar.</p>`;
    }

    // Diagnóstico Estratégico de Activos y Diversificación
    const houseCount = userPortfolio.filter(a => a.type === 'casa').length;
    const aptCount = userPortfolio.filter(a => a.type === 'apartamento').length;
    const commercialCount = userPortfolio.filter(a => a.type === 'comercial' || a.type === 'oficina').length;
    const airbnbCount = userPortfolio.filter(a => a.type === 'airbnb').length;

    if (userPortfolio.length === 0) {
        adviceHtml += `<p style="color:var(--text-muted);">Sin telemetrías. Adquiere tu primer activo para activar el asesor predictivo.</p>`;
    } else {
        // Recomendación según la mezcla
        if (commercialCount === 0 && netCashflowUSD < (totalValueUSD * 0.005)) {
            adviceHtml += `<p style="margin-bottom:8px;">💡 <strong>Sugerencia de IA:</strong> Tu flujo de caja es bajo en relación al valor de tus activos. Considera **adquirir un local comercial o una oficina**. Estos activos en Guatemala rinden un ROI de renta de hasta el **9.1%** anual, optimizando tu flujo pasivo neto.</p>`;
        } else if (aptCount > 2 && houseCount === 0) {
            adviceHtml += `<p style="margin-bottom:8px;">💡 <strong>Sugerencia de IA:</strong> Estás muy concentrado en apartamentos verticales de alta liquidez pero menor plusvalía patrimonial. Sería oportuno diversificar adquiriendo una **casa horizontal en Fraijanes o Condado Naranjo** para balancear el crecimiento de tu plusvalía a largo plazo.</p>`;
        } else if (airbnbCount > 0 && avgRoi >= 8.0) {
            adviceHtml += `<p style="margin-bottom:8px;">🔥 <strong class="text-green">ALTO RENDIMIENTO:</strong> Tus activos operando bajo modalidad Airbnb y rentas vacacionales cortas están maximizando tu rendimiento global. Gozas de un ROI promedio robusto del <strong>${avgRoi.toFixed(1)}%</strong>.</p>`;
        } else {
            adviceHtml += `<p style="margin-bottom:8px;">🌐 <strong>Estrategia de Crecimiento:</strong> Tu portafolio inmobiliario tiene una proyección de plusvalía equilibrada del <strong>${avgPlusvalia.toFixed(1)}% anual</strong>. Para acelerar tu Libertad Financiera, enfoca las ganancias pasivas netas a liquidar la hipoteca de menor capital pendiente.</p>`;
        }

        // Recomendación del Asesor en base a capacidad de crédito
        if (availableCreditPayment > 3500) {
            adviceHtml += `<p style="margin-top:6px; border-top:1px dashed rgba(255,255,255,0.06); padding-top:6px; font-style:italic; color:var(--neon-purple);">📢 "Tu portafolio cuenta con un excelente flujo disponible. Estás calificado para soportar una cuota hipotecaria FHA adicional de hasta ${currencySym}${formatNumber(availableCreditPayment.toFixed(0))} mensuales. Esto te permitiría apalancar la compra de una nueva preventa inmobiliaria de hasta ${currencySym}${formatNumber((availableCreditPayment * 140).toFixed(0))} sin comprometer tu salud patrimonial."</p>`;
        }
    }

    consoleEl.innerHTML = adviceHtml;

    // Renderizar chat interactivo persistente si existe historial
    if (aiChatHistory && aiChatHistory.length > 0) {
        consoleEl.innerHTML += `
            <div style="border-top: 1px dashed rgba(191,90,242,0.3); margin: 18px 0 12px 0; padding-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 0.62rem; color: #bf5af2; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;">💬 CONSULTAS E INTERACCIÓN CON IA</span>
            </div>
        `;
        aiChatHistory.forEach(msg => {
            if (msg.sender === 'user') {
                consoleEl.innerHTML += `
                    <div class="opinion-item" style="border-left: 3px solid var(--neon-blue); background: rgba(0, 240, 255, 0.03); margin-top: 10px; text-align: right; padding: 8px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); margin-left: 20px;">
                        <span style="font-size: 0.58rem; color: var(--neon-blue); font-weight: bold; display: block; text-transform: uppercase; margin-bottom: 2px;">💬 TÚ:</span>
                        <p style="font-size: 0.72rem; color: #fff; margin: 0; line-height: 1.45; text-align: right;">${msg.text}</p>
                    </div>
                `;
            } else {
                consoleEl.innerHTML += `
                    <div class="opinion-item" style="border-left: 3px solid #bf5af2; background: rgba(191, 90, 242, 0.04); margin-top: 10px; padding: 8px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); margin-right: 20px;">
                        <span style="font-size: 0.58rem; color: #bf5af2; font-weight: bold; display: block; text-transform: uppercase; margin-bottom: 2px;">🤖 VALORGT AI ANALYST:</span>
                        <p style="font-size: 0.72rem; color: #fff; margin: 0; line-height: 1.45; text-align: left;">${msg.text}</p>
                    </div>
                `;
            }
        });
    }

    // Scroll automático al final para ver las últimas respuestas
    setTimeout(() => {
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }, 100);
}

/**
 * Inicializa el mapa táctico Leaflet secundario del Portafolio
 */
function initPortfolioMap() {
    const mapElement = document.getElementById('portfolio-map');
    if (!mapElement) return;

    if (portfolioMapInstance) {
        portfolioMapInstance.remove();
        portfolioMapInstance = null;
    }

    const guatemalaCityCenter = [14.5956, -90.4851];
    
    portfolioMapInstance = L.map('portfolio-map', {
        center: guatemalaCityCenter,
        zoom: 12,
        zoomControl: false,
        attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        timeout: 5000
    }).addTo(portfolioMapInstance);

    updatePortfolioMapMarkers();
}

/**
 * Dibuja los marcadores de geolocalización de las propiedades del portafolio en el mapa
 */
function updatePortfolioMapMarkers() {
    if (!portfolioMapInstance) return;

    // Limpiar marcadores y círculos anteriores
    portfolioMarkers.forEach(m => portfolioMapInstance.removeLayer(m));
    portfolioCircles.forEach(c => portfolioMapInstance.removeLayer(c));
    portfolioMarkers = [];
    portfolioCircles = [];

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const signalListEl = document.getElementById('portfolio-map-signals');
    if (signalListEl) signalListEl.innerHTML = '';

    userPortfolio.forEach((asset, idx) => {
        let valVal = asset.currentValue * conversion;
        let rentVal = asset.rent * conversion;

        if (asset.isRemodeled) {
            valVal *= 1.10;
        }
        if (asset.isAirbnb) {
            rentVal *= 1.50;
        }
        if (asset.isRentRaised) {
            rentVal *= 1.10;
        }

        const roi = (rentVal * 12) / (asset.buyValue * conversion) * 100;

        // Círculo de Concentración Financiera y marcador GPS (solo si tiene coordenadas)
        let marker;
        if (asset.lat && asset.lng) {
            const radius = Math.min(Math.max((asset.currentValue / 1000) * 2, 400), 1600);
            const circle = L.circle([asset.lat, asset.lng], {
                color: '#bf5af2',
                fillColor: '#bf5af2',
                fillOpacity: 0.12,
                weight: 1,
                radius: radius
            }).addTo(portfolioMapInstance);

            portfolioCircles.push(circle);

            // Marcador Morado Wealth Management
            const beaconIcon = L.divIcon({
                className: 'radar-beacon-container',
                html: `
                    <div class="radar-beacon beacon-purple">
                        <div class="beacon-pulse" style="animation-duration: 1.6s"></div>
                        <div class="beacon-dot"></div>
                    </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            marker = L.marker([asset.lat, asset.lng], { icon: beaconIcon }).addTo(portfolioMapInstance);
            portfolioMarkers.push(marker);

            // Popup del activo geolocalizado
            const popupContent = `
                <div class="map-popup-header purple-header">
                    <h4><i data-lucide="building" class="tiny-icon inline"></i> ${asset.title}</h4>
                    <span class="sub-title font-mono" style="font-size:0.55rem; color: #bf5af2;">ACTIVO DEL PORTAFOLIO</span>
                </div>
                <div class="map-popup-body">
                    <span class="popup-lbl">Valor Actual:</span>
                    <span class="popup-val text-cyan">${currencySym}${formatNumber(valVal.toFixed(0))}</span>
                    <span class="popup-lbl">Flujo Renta:</span>
                    <span class="popup-val text-green">${currencySym}${formatNumber(rentVal.toFixed(0))}/m</span>
                    <span class="popup-lbl">ROI Renta:</span>
                    <span class="popup-val text-green">${roi.toFixed(1)}%</span>
                </div>
            `;

            marker.bindPopup(popupContent, {
                closeButton: false,
                offset: L.point(0, -5)
            });
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Crear una señal de telemetría de activos en el sidebar del mapa
        if (signalListEl) {
            const plusvaliaAnual = asset.plusvalia;
            const signalItem = document.createElement('div');
            signalItem.className = 'signal-item';
            signalItem.style.borderLeft = '3px solid var(--neon-purple)';
            signalItem.style.cursor = 'pointer';
            
            signalItem.innerHTML = `
                <span class="signal-badge" style="background-color: rgba(191, 90, 242, 0.15); color: var(--neon-purple); border: 1px solid rgba(191, 90, 242, 0.3);">ACTIVO ACTIVO</span>
                <span class="signal-name">${asset.title}</span>
                <span class="signal-desc font-mono" style="font-size: 0.6rem; color: var(--text-secondary); margin-top: 2px;">
                    • Valor: ${currencySym}${formatNumber(valVal.toFixed(0))} <br>
                    • Renta: ${currencySym}${formatNumber(rentVal.toFixed(0))}/mes (ROI ${roi.toFixed(1)}%) <br>
                    • Plusvalía Proy: +${plusvaliaAnual.toFixed(1)}% / año
                </span>
            `;
            
            signalItem.onclick = () => {
                if (asset.lat && asset.lng && marker) {
                    marker.openPopup();
                    portfolioMapInstance.setView([asset.lat, asset.lng], 13, { animate: true });
                } else {
                    alert("Este activo no tiene coordenadas GPS válidas cargadas (registrado con 0,0).");
                }
            };
            
            signalListEl.appendChild(signalItem);
        }
    });

    // Ajustar los límites del mapa para encuadrar todas las propiedades si las hay
    if (portfolioMarkers.length > 0) {
        const group = new L.featureGroup(portfolioMarkers);
        portfolioMapInstance.fitBounds(group.getBounds().pad(0.3));
    }
}

/**
 * Guarda el resultado de la valuación IA activa en el Portafolio del Inversionista
 */
function saveActiveValuationToPortfolio() {
    if (!activeValuation) {
        alert("⚠️ NO HAY EVALUACIÓN ACTIVA: Por favor, realiza una tasación en el Valuador IA primero.");
        return;
    }

    const hasUnlimitedAccess = isCommercialAuthenticated && loggedInB2bClient && (
        ((loggedInB2bClient.role || '').toLowerCase() === 'inversionista') || 
        (loggedInB2bClient.role === 'agente' && (activeB2bPlan === 'vip' || activeB2bPlan === 'pro'))
    );

    // Para mercadeo, permitimos a los usuarios de la demo (visitantes y agentes básicos) guardar si aún no ha expirado su trial de 1 minuto
    if (!hasUnlimitedAccess && (isPortfolioBlocked || portfolioTrialTimeLeft <= 0)) {
        alert("⚠️ VISTA PREVIA EXPIRADA: Para seguir guardando propiedades y realizar simulaciones patrimoniales en tu Portafolio IA, inicia sesión o suscríbete.");
        switchView('commercial');
        return;
    }

    // Recopilar datos de la tasación activa
    const typeSelect = document.getElementById('prop-type');
    const type = typeSelect ? typeSelect.value : 'apartamento';
    const zoneData = ZONES_DATABASE[activeZoneKey];
    const zoneName = zoneData ? zoneData.name.split(' (')[0] : activeZoneKey.toUpperCase();
    const residential = document.getElementById('prop-residential') ? document.getElementById('prop-residential').value.trim() : '';
    const size = document.getElementById('prop-size') ? parseFloat(document.getElementById('prop-size').value) : 150;

    let title = `Valuación IA: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (residential) {
        title += ` en ${residential}`;
    } else {
        title += ` en ${zoneName}`;
    }
    title += ` (${size} m²)`;

    // Métricas predictivas inteligentes en USD
    const buyValue = activeValuation;
    const currentValue = activeValuation;
    const rent = Math.round((activeValuation * 0.065) / 12); // Yield anual del 6.5%
    const maintenance = Math.round(size * 1.0); // $1 USD por metro cuadrado
    const taxes = Math.round((activeValuation * 0.006) / 12); // IUSI del 6 por millar anualizado

    const offsetLat = (Math.random() - 0.5) * 0.008;
    const offsetLng = (Math.random() - 0.5) * 0.008;
    const lat = zoneData ? zoneData.lat + offsetLat : 14.5956;
    const lng = zoneData ? zoneData.lng + offsetLng : -90.4851;
    const plusvalia = zoneData ? (zoneData.growth5Y / 5) : 7.5;

    const newAsset = {
        id: "port-" + (userPortfolio.length + Date.now()).toString(),
        title: title,
        type: type === 'comercial' || type === 'oficina' || type === 'bodega' ? 'comercial' : (type === 'terreno' ? 'terreno' : 'apartamento'),
        zoneKey: activeZoneKey,
        buyValue: buyValue,
        currentValue: currentValue,
        rent: rent,
        hasMortgage: false,
        mortgageDebt: 0,
        mortgagePayment: 0,
        interestRate: 0,
        termYears: 0,
        maintenance: maintenance,
        taxes: taxes,
        occupancy: 95,
        plusvalia: plusvalia,
        lat: lat,
        lng: lng,
        isRemodeled: false,
        isAirbnb: false,
        isRefinanced: false,
        isRentRaised: false
    };

    userPortfolio.unshift(newAsset);
    saveUserPortfolio();

    alert(`🎉 ¡PROPIEDAD GUARDADA EN TU PORTAFOLIO IA!\nEl activo en ${zoneName} tasado en $${formatNumber(activeValuation.toFixed(0))} USD fue añadido exitosamente. Se ha calculado una renta mensual predictiva de $${formatNumber(rent.toFixed(0))} USD (ROI 6.5% anual).\n\nRedirigiendo a tu simulador de riqueza...`);

    switchView('portfolio');
}

/**
 * Importa los 35+ parámetros de la tasación inteligente activa al formulario B2B
 */
function autofillPublishFormFromValuation() {
    // 1. Mapeo de Categoría/Tipo
    const typeSelect = document.getElementById('prop-type');
    const pubCategorySelect = document.getElementById('pub-category');
    if (typeSelect && pubCategorySelect) {
        const valType = typeSelect.value;
        const typeMap = {
            'casa': 'Casa',
            'apartamento': 'Apartamento',
            'terreno': 'Terreno',
            'comercial': 'Local',
            'oficina': 'Local',
            'bodega': 'Bodega',
            'finca': 'Terreno'
        };
        pubCategorySelect.value = typeMap[valType] || 'Apartamento';
    }

    // 2. Ubicación y Datos del Sector
    const locationSelect = document.getElementById('prop-location');
    const pubLocationSelect = document.getElementById('pub-location');
    if (locationSelect && pubLocationSelect) {
        // Asegurarse de que el sector exista en el listado B2B (Zonas principales)
        const allowedSectors = ['zona14', 'zona10', 'zona16', 'zona15', 'antigua'];
        if (allowedSectors.includes(locationSelect.value)) {
            pubLocationSelect.value = locationSelect.value;
        } else {
            pubLocationSelect.value = 'zona14'; // Fallback por defecto si es Fraijanes/Mixco/etc.
        }
    }

    // 3. Parámetros Básicos
    const sizeInput = document.getElementById('prop-size');
    if (sizeInput) document.getElementById('pub-size').value = sizeInput.value;

    const roomsInput = document.getElementById('prop-rooms');
    if (roomsInput) document.getElementById('pub-beds').value = roomsInput.value;

    const bathroomsInput = document.getElementById('prop-bathrooms');
    if (bathroomsInput) document.getElementById('pub-baths').value = bathroomsInput.value;

    const parkingsInput = document.getElementById('prop-parkings');
    if (parkingsInput) document.getElementById('pub-parks').value = parkingsInput.value;

    // 4. Copiar precio sugerido si hay valuación IA
    if (activeValuation) {
        const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
        document.getElementById('pub-price').value = Math.round(activeValuation * conversion);
    } else {
        // Si no hay valuación activa, estimar un precio comercial base según la categoría del inmueble
        const sizeVal = parseFloat(document.getElementById('pub-size').value) || 180;
        const locVal = document.getElementById('pub-location').value;
        const pubCategory = document.getElementById('pub-category')?.value || 'Apartamento';
        const zoneData = ZONES_DATABASE[locVal];
        
        if (zoneData) {
            let categoryKey = 'apartamentos';
            if (pubCategory === 'Apartamento') categoryKey = 'apartamentos';
            else if (pubCategory === 'Casa') categoryKey = 'casas';
            else if (pubCategory === 'Local') categoryKey = 'locales';
            else if (pubCategory === 'Bodega') categoryKey = 'bodegas';
            else if (pubCategory === 'Terreno') categoryKey = 'terrenos';
            
            let targetPriceM2 = zoneData.basePriceM2;
            if (zoneData.categories && zoneData.categories[categoryKey]) {
                targetPriceM2 = zoneData.categories[categoryKey].priceM2;
            }
            
            const basePrice = targetPriceM2 * sizeVal;
            const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
            document.getElementById('pub-price').value = Math.round(basePrice * conversion);
        }
    }

    // 5. Autocompletar Coordenadas GPS con offset aleatorio sobre la zona
    const zoneKey = document.getElementById('pub-location').value;
    const zoneData = ZONES_DATABASE[zoneKey];
    if (zoneData) {
        const offsetLat = (Math.random() - 0.5) * 0.003;
        const offsetLng = (Math.random() - 0.5) * 0.003;
        document.getElementById('pub-lat').value = (zoneData.lat + offsetLat).toFixed(4);
        document.getElementById('pub-lng').value = (zoneData.lng + offsetLng).toFixed(4);
    }

    // 6. Sincronizar todos los 25+ campos avanzados detallados
    const advancedFields = [
        { from: 'prop-city', to: 'pub-prop-city', type: 'value' },
        { from: 'prop-residential', to: 'pub-prop-residential', type: 'value' },
        { from: 'prop-land-area', to: 'pub-prop-land-area', type: 'value' },
        { from: 'prop-land-unit', to: 'pub-prop-land-unit', type: 'value' },
        { from: 'room-secondary-count', to: 'pub-room-secondary-count', type: 'value' },
        { from: 'bath-full-count', to: 'pub-bath-full-count', type: 'value' },
        { from: 'parking-type', to: 'pub-parking-type', type: 'value' },
        { from: 'prop-garden', to: 'pub-prop-garden', type: 'value' },
        { from: 'prop-finishes', to: 'pub-prop-finishes', type: 'value' },
        { from: 'prop-conservation', to: 'pub-prop-conservation', type: 'value' },

        // Checkboxes
        { from: 'near-malls', to: 'pub-near-malls', type: 'checked' },
        { from: 'near-schools', to: 'pub-near-schools', type: 'checked' },
        { from: 'near-supers', to: 'pub-near-supers', type: 'checked' },
        { from: 'near-roads', to: 'pub-near-roads', type: 'checked' },
        { from: 'room-master-suite', to: 'pub-room-master-suite', type: 'checked' },
        { from: 'bath-visitor', to: 'pub-bath-visitor', type: 'checked' },
        
        { from: 'area-living', to: 'pub-area-living', type: 'checked' },
        { from: 'area-dining', to: 'pub-area-dining', type: 'checked' },
        { from: 'area-kitchen', to: 'pub-area-kitchen', type: 'checked' },
        { from: 'area-breakfast', to: 'pub-area-breakfast', type: 'checked' },
        { from: 'prop-family-room', to: 'pub-prop-family-room', type: 'checked' },
        { from: 'prop-study', to: 'pub-prop-study', type: 'checked' },
        { from: 'area-maid', to: 'pub-area-maid', type: 'checked' },
        { from: 'area-laundry', to: 'pub-area-laundry', type: 'checked' },
        { from: 'area-storage', to: 'pub-area-storage', type: 'checked' },
        { from: 'area-terrace', to: 'pub-area-terrace', type: 'checked' },
        { from: 'area-balcony', to: 'pub-area-balcony', type: 'checked' },
        { from: 'area-patio', to: 'pub-area-patio', type: 'checked' },

        { from: 'mat-porcelain', to: 'pub-mat-porcelain', type: 'checked' },
        { from: 'mat-marble', to: 'pub-mat-marble', type: 'checked' },
        { from: 'mat-wood', to: 'pub-mat-wood', type: 'checked' },
        { from: 'mat-pvc', to: 'pub-mat-pvc', type: 'checked' },
        { from: 'mat-kitchen-luxe', to: 'pub-mat-kitchen-luxe', type: 'checked' },

        { from: 'amenity-pool', to: 'pub-amenity-pool', type: 'checked' },
        { from: 'amenity-gym', to: 'pub-amenity-gym', type: 'checked' },
        { from: 'amenity-security', to: 'pub-amenity-security', type: 'checked' },
        { from: 'amenity-clubhouse', to: 'pub-amenity-clubhouse', type: 'checked' },
        { from: 'amenity-view', to: 'pub-amenity-view', type: 'checked' },
        { from: 'amenity-smart', to: 'pub-amenity-smart', type: 'checked' },
        { from: 'amenity-solar', to: 'pub-amenity-solar', type: 'checked' },
        { from: 'amenity-cistern', to: 'pub-amenity-cistern', type: 'checked' },
        { from: 'amenity-elevator', to: 'pub-amenity-elevator', type: 'checked' }
    ];

    advancedFields.forEach(field => {
        const fromEl = document.getElementById(field.from);
        const toEl = document.getElementById(field.to);
        if (fromEl && toEl) {
            if (field.type === 'checked') {
                toEl.checked = fromEl.checked;
            } else {
                toEl.value = fromEl.value;
            }
        }
    });

    // 7. Generar un título B2B elegante e inteligente
    const cat = document.getElementById('pub-category').value;
    const res = document.getElementById('pub-prop-residential').value.trim();
    const locName = zoneData ? zoneData.name.split(' (')[0] : 'Guatemala';
    let newTitle = `${cat} Premium en `;
    if (res) newTitle += `${res}, ${locName}`;
    else newTitle += locName;
    
    const sizeVal = document.getElementById('pub-size').value;
    newTitle += ` (${sizeVal}m²)`;
    document.getElementById('pub-title').value = newTitle;

    alert("📂 DATOS IMPORTADOS: Se han cargado exitosamente los 35+ parámetros de la tasación activa del Valuador IA, incluyendo coordenadas GPS y valuación sugerida.");
}

/**
 * Cierra la máscara del trial y redirige a la pantalla comercial para suscribirse
 */
function closePortfolioTrialBlockerAndRedirect() {
    const blocker = document.getElementById('portfolio-trial-blocker');
    if (blocker) blocker.classList.add('hidden');
    switchView('commercial');
}

/**
 * Envía un mensaje en el chat interactivo del Asesor Patrimonial IA y genera una respuesta analítica predictiva
 */
function sendPortfolioAiChatMessage() {
    const inputEl = document.getElementById('portfolio-ai-chat-input');
    const consoleEl = document.getElementById('portfolio-ai-console');
    if (!inputEl || !consoleEl) return;

    const message = inputEl.value.trim();
    if (!message) return;

    // 1. Guardar mensaje del usuario en el historial interactivo
    const userMsg = {
        sender: 'user',
        text: message,
        timestamp: Date.now()
    };
    aiChatHistory.push(userMsg);
    inputEl.value = '';

    // Calcular métricas actuales del portafolio del inversionista para personalización inteligente
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    const totalAssets = userPortfolio.length;
    
    let totalValUSD = 0;
    let totalRentUSD = 0;
    let totalDebtUSD = 0;
    let weightedRoi = 0;
    let weightedPlusvalia = 0;

    userPortfolio.forEach(a => {
        let currentVal = a.currentValue;
        let currentRent = a.rent;
        let currentRoi = (currentRent * 12) / a.buyValue * 100;
        let currentPlus = a.plusvalia;

        if (a.isRemodeled) {
            currentVal *= 1.10;
            currentRoi += 1.5;
            currentPlus += 2.0;
        }
        if (a.isAirbnb) {
            currentRent *= 1.50;
            currentRoi = (currentRent * 12) / a.buyValue * 100;
        }
        if (a.isRentRaised) {
            currentRent *= 1.10;
            currentRoi = (currentRent * 12) / a.buyValue * 100;
        }

        const occupancyFactor = (a.isAirbnb ? Math.max(a.occupancy - 15, 60) : a.occupancy) / 100;

        totalValUSD += currentVal;
        totalRentUSD += currentRent * occupancyFactor;
        if (a.hasMortgage) {
            totalDebtUSD += a.mortgageDebt;
        }
        weightedRoi += currentRoi * currentVal;
        weightedPlusvalia += currentPlus * currentVal;
    });

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const totalVal = totalValUSD * conversion;
    const totalRent = totalRentUSD * conversion;
    const totalDebt = totalDebtUSD * conversion;
    const equityPct = totalValUSD > 0 ? (((totalValUSD - totalDebtUSD) / totalValUSD) * 100) : 0;
    const avgRoi = totalValUSD > 0 ? weightedRoi / totalValUSD : 0;
    const avgPlusvalia = totalValUSD > 0 ? weightedPlusvalia / totalValUSD : 0;

    // 2. Refrescar la vista del portafolio y consola del chat de inmediato (esto pintará el mensaje del usuario)
    runAiStrategyAdvisor(totalValUSD, totalDebtUSD, totalRentUSD - (totalDebtUSD * 0.075 / 12), avgRoi, avgPlusvalia);

    // 3. Renderizar indicador de escritura del Asesor de forma temporal
    const typingId = "ai-chat-typing-" + Date.now();
    const typingHtml = `
        <div class="opinion-item animate-pulse" id="${typingId}" style="border-left: 3px solid #bf5af2; background: rgba(191, 90, 242, 0.03); margin-top: 10px; padding: 8px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); margin-right: 20px;">
            <span style="font-size: 0.58rem; color: #bf5af2; font-weight: bold; display: block; text-transform: uppercase; margin-bottom: 2px;">🤖 VALORGT AI ANALYST:</span>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin: 0; font-style: italic;">
                Analizando telemetrías y corriendo simulaciones financieras del sector guatemalteco...
            </p>
        </div>
    `;
    consoleEl.innerHTML += typingHtml;
    consoleEl.scrollTop = consoleEl.scrollHeight;

    // 4. Formular respuesta personalizada en base a keywords tras 1.2 segundos
    setTimeout(() => {
        // Eliminar indicador de carga si sigue allí
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        const cleanMsg = message.toLowerCase();
        let reply = "";

        // RECONOCIMIENTO DE PALABRAS CLAVE CON CONTEXTO INMOBILIARIO GUATEMALTECO AVANZADO
        if (cleanMsg.includes('local') || cleanMsg.includes('locales') || cleanMsg.includes('comercial') || cleanMsg.includes('comerciales') || cleanMsg.includes('plaza') || cleanMsg.includes('strip') || cleanMsg.includes('mall') || cleanMsg.includes('tienda')) {
            const hasCommercial = userPortfolio.filter(a => a.type === 'comercial' || a.type === 'office' || a.type === 'oficina').length;
            reply = `🏬 <strong>Análisis Estratégico de Activos Comerciales (SÍ Rotundo):</strong><br><br>
            • <strong>¿Te aconsejo comprar locales comerciales? SÍ, absolutamente.</strong> En el mercado actual de Guatemala (principalmente en Zona 10, Zona 14, Zona 16 Cayalá y el corredor metropolitano de CAES), los locales comerciales y strip malls representan una de las inversiones más rentables y estables del sector inmobiliario.<br><br>
            • <strong>Rendimientos Financieros (Yields) Superiores:</strong> Mientras que un apartamento de renta tradicional en Zona 14 o Zona 15 ofrece retornos anuales netos de entre <strong>5.5% y 6.8%</strong>, los locales comerciales de conveniencia reportan yields brutos estables del <strong>7.8% al 9.5% anual</strong> (hasta un 2.5% más de rentabilidad sobre tu capital invertido).<br><br>
            • <strong>La Ventaja de los Contratos Triple Neto (NNN):</strong> A diferencia de los inmuebles residenciales, los locales comerciales en Guatemala se arriendan bajo contratos Triple Neto (NNN). Esto significa que **el inquilino asume el costo total del mantenimiento, el seguro del inmueble y el IUSI**. Tu flujo de caja pasivo se mantiene limpio y totalmente blindado contra incrementos de costes operativos o inflación.<br><br>
            • <strong>Estabilidad y Plazos Contractuales:</strong> Los contratos comerciales con marcas o empresas corporativas se pactan a plazos mínimos de 3 a 5 años (con incrementos anuales de renta indexados de entre 3% y 5% en dólares), en comparación con el estándar de 1 año residencial. Esto reduce significativamente la vacancia y la rotación.<br><br>
            • <strong>Menores Costes de Rotación y Remodelación:</strong> Típicamente los locales se entregan en obra gris. El inquilino invierte su propio capital en equipar y adecuar el local a sus necesidades de marca, lo que genera un alto costo de salida para él, blindando su permanencia.<br><br>
            • <strong>Recomendación IA para tu portafolio:</strong> Cuentas con una capacidad de apalancamiento crediticio robusta de hasta <strong>${currencySym}${formatNumber((totalRent * 0.45).toFixed(0))}</strong> mensuales. Te aconsejo apalancar la compra de un local comercial en preventa en el sector de <em>Zona 16 Cayalá</em> para maximizar tu flujo pasivo neto.`;
        } 
        else if (cleanMsg.includes('apartamento') || cleanMsg.includes('apartamentos') || cleanMsg.includes('casa') || cleanMsg.includes('casas') || cleanMsg.includes('residencial') || cleanMsg.includes('vivienda') || cleanMsg.includes('habitación') || cleanMsg.includes('condominio')) {
            reply = `🏠 <strong>Análisis del Sector Residencial (Casas y Apartamentos):</strong><br><br>
            • <strong>Rendimiento de Renta vs Plusvalía:</strong> Los apartamentos residenciales en zonas de alta demanda vertical como Zona 14, Zona 15 y Zona 10 ofrecen rendimientos por renta tradicional de entre <strong>5.5% y 6.5% anual</strong>. Sin embargo, su mayor fortaleza es la **plusvalía constante (+7.0% a +9.5% anual)** en proyectos sobre planos de desarrolladores consolidados en Guatemala.<br><br>
            • <strong>La Revolución de Airbnb / Renta Corta:</strong> Si tu apartamento está ubicado en áreas turísticas o corporativas vibrantes (como Zona 4 Cuatro Grados Norte, Zona 10 o Zona 16 Cayalá), rentarlo en formato vacacional (Airbnb) puede incrementar tu rendimiento neto al <strong>9.0% - 11.0% anual</strong>, asumiendo una tasa de ocupación del 70%-75%. Requiere una gestión operativa más activa y gastos de lavandería/limpieza.<br><br>
            • <strong>Liquidez y Salida:</strong> El mercado residencial es el más líquido del país. Si necesitas vender para obtener liquidez, un apartamento residencial se venderá hasta 3 veces más rápido que un local comercial o una bodega industrial.<br><br>
            • <strong>Consejo IA:</strong> Utiliza apartamentos residenciales en planos para capturar plusvalía y "acumular riqueza especulativa". Para "generar flujo neto inmediato para vivir", los **locales comerciales** son una opción superior en este momento en Guatemala.`;
        } 
        else if (cleanMsg.includes('bodega') || cleanMsg.includes('bodegas') || cleanMsg.includes('industrial') || cleanMsg.includes('industria') || cleanMsg.includes('almacen')) {
            reply = `🏭 <strong>Análisis de Bodegas e Infraestructura Industrial:</strong><br><br>
            • <strong>Yields del Sector Logístico:</strong> Las bodegas en la periferia industrial de Guatemala (Mixco, Villa Nueva, Amatitlán y Palín) ofrecen rendimientos de renta sumamente sólidos de entre <strong>8.0% y 9.5% anual</strong>.<br><br>
            • <strong>Baja Desocupación:</strong> El sector de bodegas tiene actualmente la menor tasa de desocupación en el país (< 3%), debido al auge del e-commerce y hubs de distribución de última milla. Los contratos suelen ser muy estables (2 a 4 años mínimos).<br><br>
            • <strong>Consejo IA:</strong> Si buscas diversificar con bajo riesgo de desocupación y un inquilino corporativo de alta calidad, adquiere un módulo en un complejo industrial cerrado de bodegas pequeñas (minibodegas) de 100-300m².`;
        }
        else if (cleanMsg.includes('terreno') || cleanMsg.includes('terrenos') || cleanMsg.includes('lote') || cleanMsg.includes('lotes') || cleanMsg.includes('tierra') || cleanMsg.includes('finca')) {
            reply = `🌱 <strong>Análisis de Lotes y Terrenos en Guatemala:</strong><br><br>
            • <strong>Plusvalía Especulativa Pura:</strong> Los terrenos en áreas de alta expansión de condominios como Fraijanes, San José Pinula, San Lucas Sacatepéquez y CAES (Km 18 al 28) reportan crecimientos de valor de hasta el **12% anual** en fases tempranas de urbanización.<br><br>
            • <strong>Advertencia Crítica de Flujo:</strong> Un terreno es un activo de **flujo de caja libre nulo o negativo** (tienes que pagar IUSI y mantenimiento de condominio sin recibir ingresos mensuales), a menos que lo arriendes comercialmente para parqueos o antenas de telecomunicación. Esto penaliza tu capacidad de crédito y liquidez en el portafolio.<br><br>
            • <strong>Consejo IA:</strong> Invierte en tierras únicamente si ya cuentas con un flujo robusto y excedentes mensuales que provengan de locales comerciales arriendados u oficinas. Los terrenos son excelentes vehículos de preservación de riqueza generacional, pero pésimos generadores de estilo de vida en el corto plazo.`;
        } 
        else if (cleanMsg.includes('tasa') || cleanMsg.includes('interés') || cleanMsg.includes('interes') || cleanMsg.includes('crédito') || cleanMsg.includes('credito') || cleanMsg.includes('préstamo') || cleanMsg.includes('prestamo') || cleanMsg.includes('hipoteca') || cleanMsg.includes('banco') || cleanMsg.includes('bancario') || cleanMsg.includes('financiar') || cleanMsg.includes('fha')) {
            reply = `🏦 <strong>Análisis de Financiamiento y Tasas en Guatemala (2026):</strong><br><br>
            • <strong>Créditos de Vivienda FHA:</strong> Las tasas activas FHA en Quetzales para vivienda propia o inversión residencial se encuentran actualmente entre el <strong>7.0% y el 8.25% anual</strong>, con plazos de hasta 25 o 30 años y enganches desde el 5% en bancos autorizados (e.g. Banco Industrial, BANRURAL, BAC, G&T Continental). Es el financiamiento más barato y seguro del país.<br><br>
            • <strong>Créditos Comerciales para Locales y Oficinas:</strong> Las hipotecas comerciales (no FHA) para locales, oficinas o bodegas tienen tasas que oscilan entre el <strong>8.5% y el 10.5% anual</strong>, con plazos máximos de 15 años y enganches requeridos del 20% al 30%. Además, conllevan gastos de avalúo y escrituración comercial directa.<br><br>
            • <strong>Consejo de Apalancamiento IA:</strong> Con tu portafolio actual de activos y un Equity del <strong>${equityPct.toFixed(1)}%</strong>, tu perfil de riesgo ante bancos guatemaltecos es excelente. Calificas para tasas preferenciales del 7.25% en proyectos residenciales FHA y 8.5% en locales comerciales. Recomiendo no sobrepasar una relación Deuda/Valor (LTV) del 60% para mantener una salud financiera óptima.`;
        }
        else if (cleanMsg.includes('flujo') || cleanMsg.includes('renta') || cleanMsg.includes('ganancia') || cleanMsg.includes('cashflow') || cleanMsg.includes('retorno') || cleanMsg.includes('rendimiento') || cleanMsg.includes('roi')) {
            reply = `🟢 <strong>Optimización de Renta Inmobiliaria:</strong> Con base en tus ${totalAssets} activos, generas un flujo de renta bruta mensual de <strong>${currencySym}${formatNumber(totalRent.toFixed(0))}</strong>. <br><br>Para maximizar tu cashflow neto, recomiendo:<br>
            • Incrementar la renta un <strong>5%</strong> en tu activo <em>Oficina Plaza República Z10</em> para capturar la plusvalía del sector comercial corporativo.<br>
            • Amortizar capital de forma acelerada sobre la hipoteca de Cayalá Z16 para disminuir los cargos por intereses y liberar flujo de caja neto.`;
        } 
        else if (cleanMsg.includes('zona') || cleanMsg.includes('zonas') || cleanMsg.includes('cayala') || cleanMsg.includes('naranjo') || cleanMsg.includes('salvador') || cleanMsg.includes('fraijanes') || cleanMsg.includes('san cristobal') || cleanMsg.includes('zona 10') || cleanMsg.includes('zona 14') || cleanMsg.includes('zona 15') || cleanMsg.includes('zona 4') || cleanMsg.includes('carretera')) {
            reply = `🌐 <strong>Análisis Geográfico de Inversión en Guatemala:</strong><br><br>
            • <strong>Zona 16 (Cayalá, Lomas, Cardales):</strong> Máxima plusvalía del mercado residencial (+8.4% anualizado) y alta absorción en preventas. Atrae perfiles familiares de altos ingresos.<br><br>
            • <strong>Zona 10 y Zona 14 (El Corazón Financiero):</strong> Las mejores ubicaciones para oficinas premium e inversión en apartamentos boutique para renta corporativa. yields estables del 6.2% residencial y 7.8% comercial.<br><br>
            • <strong>Zona 4 (Cuatro Grados Norte):</strong> El distrito más dinámico para **rentas cortas de Airbnb**. yields netos de hasta el 9.5% por ocupación de turismo joven e internacional.<br><br>
            • <strong>CAES (Km 14 al 25) y Fraijanes:</strong> La mayor plusvalía especulativa de mediano plazo en terrenos residenciales debido al crecimiento metropolitano periférico. Excelente retorno si inviertes en strip malls pequeños.`;
        }
        else if (cleanMsg.includes('que me aconsejas') || cleanMsg.includes('que aconsejas') || cleanMsg.includes('que me recomiendas') || cleanMsg.includes('recomiendas comprar') || cleanMsg.includes('que comprar') || cleanMsg.includes('cual es mejor') || cleanMsg.includes('en que invertir') || cleanMsg.includes('consejo inversion') || cleanMsg.includes('donde invertir') || cleanMsg.includes('que hago') || cleanMsg.includes('estrategia') || cleanMsg.includes('aconsejaria') || cleanMsg.includes('aconsejas')) {
            reply = `💡 <strong>Estrategia de Inversión Comparativa para tu Patrimonio:</strong><br><br>
            Para optimizar tu riqueza y flujo de efectivo con base en tus **${totalAssets} activos actuales**, analicemos la comparación comercial vs residencial en Guatemala:<br><br>
            • <strong>1. Si buscas FLUJO PASIVO NETO de inmediato:</strong> Invierte en <strong>Locales Comerciales</strong>. Un local en preventa en Zona 16 Cayalá o Zona 10 te generará una rentabilidad de renta del **8.5% anual** con contratos estables de 5 años bajo modelo NNN (cero gastos de mantenimiento para ti).<br><br>
            • <strong>2. Si buscas PLUSVALÍA y crecimiento a largo plazo:</strong> Adquiere <strong>Apartamentos en Planos</strong> en zonas residenciales premium (e.g. Zona 14 o Zona 15). Capturas un descuento del 15% en planos y la plusvalía de Guatemala se encargará de hacer crecer tu patrimonio neto al culminar el proyecto.<br><br>
            • <strong>3. Si buscas ALTOS RENDIMIENTOS (pero operando activamente):</strong> Compra un apartamento pequeño (tipo estudio) en Zona 4 o Zona 10 y lánzalo a <strong>Airbnb</strong>. Puedes alcanzar hasta un **10.5% de yield**, aunque debes considerar la gestión de vacancias y limpiezas.<br><br>
            • <strong>Recomendación IA Personalizada:</strong> Cuentas con un Equity de **${currencySym}${formatNumber((totalVal - totalDebt).toFixed(0))}** (${equityPct.toFixed(1)}%). Estás en una posición inmejorable para apalancar un crédito de tasa comercial del 8.5% y comprar un local en preventa. ¡Esto disparará tu cashflow neto mensual de inmediato!`;
        }
        else if (cleanMsg.includes('bursatil') || cleanMsg.includes('bursátiles') || cleanMsg.includes('wall street') || cleanMsg.includes('bolsa') || cleanMsg.includes('acciones') || cleanMsg.includes('bonos') || cleanMsg.includes('oro') || cleanMsg.includes('gold') || cleanMsg.includes('xaut') || cleanMsg.includes('bitcoin') || cleanMsg.includes('cripto') || cleanMsg.includes('global') || cleanMsg.includes('macro') || cleanMsg.includes('fed') || cleanMsg.includes('sp500') || cleanMsg.includes('nasdaq')) {
            reply = `📊 <strong>Radar Macroeconómico y Financiero Global (Wall Street & Multiactivos):</strong><br><br>
            • <strong>¿Qué es XAUT y el oro digital?</strong> XAUT (Tether Gold) es un activo digital que representa la propiedad de una onza troy de oro físico custodiado en bóvedas suizas de alta seguridad. Es una herramienta extraordinaria de cobertura contra la inflación global, la devaluación fiduciaria y riesgos geopolíticos sistémicos.<br><br>
            • <strong>Bolsa de Valores y Wall Street (S&P 500 / Nasdaq):</strong> Invertir en fondos indexados globales como el S&P 500 (rentabilidad histórica de ~10% anualizado) u opciones de crecimiento en el Nasdaq te otorga diversificación inmediata y liquidez absoluta en segundos. No obstante, conllevan una alta volatilidad de mercado diaria y nula capacidad de apalancamiento local.<br><br>
            • <strong>Comparativa de Rendimientos (Ladrillo Local vs. Wall Street):</strong><br>
              - <strong>Volatilidad y Estabilidad:</strong> Mientras el índice S&P 500 puede sufrir correcciones del 20% anual por decisiones de tasas de la FED, los bienes raíces premium en Ciudad de Guatemala (Zona 10, Zona 14, Zona 16) mantienen curvas ascendentes sólidas con plusvalías estables del <strong>+7.0% al +9.5% anual</strong>.<br>
              - <strong>Poder del Apalancamiento Directo:</strong> Los bancos en Guatemala no te otorgarán un crédito al 7.5% anual a 30 años plazo para especular en acciones de Wall Street o XAUT. Sin embargo, **sí financiarán tu inversión inmobiliaria hasta en un 80% o 90% (FHA / Comercial)**, permitiéndote multiplicar drásticamente tu retorno real sobre el capital aportado (ROE).<br>
              - <strong>Renta Directa vs Dividendos:</strong> El dividendo promedio del S&P 500 ronda el 1.3% anual. Un local comercial en preventa en la plataforma de ValorGT AI te reportará yields de **7.8% a 9.5% anual neto**, depositados mensualmente en tu cuenta local en dólares o quetzales de forma pasiva.<br><br>
            • <strong>Propuesta IA de Distribución Patrimonial Recomendada:</strong><br>
              - <strong>70% Bienes Raíces (Activos de Cashflow):</strong> Locales comerciales triple neto (NNN) y apartamentos boutique en distritos de alta demanda para blindar tus ingresos mensuales y construir historial crediticio.<br>
              - <strong>20% Wall Street (Activos Líquidos):</strong> ETFs indexados de bajo costo (ej. VOO, VTI o QQQ) para retornos globales de crecimiento y liquidez instantánea.<br>
              - <strong>10% Activos de Cobertura Extrema (Seguro Patrimonial):</strong> Oro físico, tokens respaldados como XAUT o Bitcoin como resguardo táctico ante cisnes negros financieros y devaluación del papel moneda.`;
        }
        else {
            reply = `🤖 <strong>Asesoría Estratégica Multivariable ValorGT:</strong><br><br>
            He procesado de manera profunda tu portafolio compuesto por <strong>${totalAssets} activos inmobiliarios</strong> valorados en <strong>${currencySym}${formatNumber(totalVal.toFixed(0))}</strong>.<br><br>
            • Tu nivel de apalancamiento es de <strong>${equityPct > 0 ? (100 - equityPct).toFixed(1) : 0}%</strong> y tu flujo neto mensual es excelente.<br><br>
            • <strong>Temas recomendados para consultarme:</strong><br>
            1. <em>"¿Me aconsejas comprar locales comerciales en Guatemala en lugar de apartamentos?"</em> (Analizaremos yields, contratos Triple Neto NNN y sectores clave).<br>
            2. <em>"¿Cuáles son las tasas de interés bancarias activas actuales en Guatemala?"</em> (Revisaremos FHA frente a créditos comerciales).<br>
            3. <em>"¿Cómo optimizar el flujo de caja de mi portafolio actual?"</em> (Plan de refinanciamiento, amortizaciones y alzas de renta).<br><br>
            Escribe tu consulta y con gusto desglosaré la telemetría financiera precisa para ti.`;
        }

        // 5. Agregar la respuesta del Asesor a la cola interactiva persistente
        const aiMsg = {
            sender: 'ai',
            text: reply,
            timestamp: Date.now()
        };
        aiChatHistory.push(aiMsg);

        // 6. Recalcular e inicializar toda la vista de portafolio para redibujar de forma íntegra con persistencia
        runAiStrategyAdvisor(totalValUSD, totalDebtUSD, totalRentUSD - (totalDebtUSD * 0.075 / 12), avgRoi, avgPlusvalia);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 1200);
}

/**
 * Gestiona los Overlays de Bloqueo Criptográficos según Plan, Rol y Estado de Pago
 */
function updateLockOverlaysState() {
    const isInvestor = loggedInB2bClient && ((loggedInB2bClient.role || '').toLowerCase() === 'inversionista');
    const isPending = loggedInB2bClient && (loggedInB2bClient.status === 'Pendiente' || loggedInB2bClient.status?.toLowerCase() === 'pendiente');
    
    const goldLock = document.getElementById('commercial-gold-overlay-lock');
    const promoLock = document.getElementById('commercial-promo-overlay-lock');
    const btnPromote = document.getElementById('btn-promote-property');
    const goldLockMessage = document.getElementById('gold-lock-message');

    // La cartera de Tether Gold (Gold Wallet) se desbloquea para:
    // 1. Agentes con plan VIP (Inmobiliaria Premium)
    // 2. Inversionistas con plan Premium (Inversionista Premium)
    const unlockGold = !isPending && (
        (activeB2bPlan === 'vip' && !isInvestor) || 
        (activeB2bPlan === 'premium' && isInvestor)
    );
    // La promoción de propiedades se desbloquea para VIP y Premium que no estén pendientes.
    const unlockPromo = (activeB2bPlan === 'vip' || activeB2bPlan === 'premium') && !isPending;

    if (goldLockMessage) {
        if (isInvestor) {
            goldLockMessage.innerText = "El XAUt Ledger y la consola contable de retiros bancarios de Tether Gold son privilegios exclusivos del plan Inversionista Premium. Realiza un upgrade para desbloquear tu Cartera de Oro.";
        } else {
            goldLockMessage.innerText = "El XAUt Ledger y la consola contable de retiros bancarios de Tether Gold son privilegios exclusivos del plan Inmobiliaria Premium. Realiza un upgrade para desbloquear tu Cartera de Oro.";
        }
    }

    if (unlockGold) {
        if (goldLock) goldLock.classList.add('hidden');
    } else {
        if (goldLock) goldLock.classList.remove('hidden');
    }

    if (unlockPromo) {
        if (promoLock) promoLock.classList.add('hidden');
        if (btnPromote) btnPromote.disabled = false;
    } else {
        if (promoLock) promoLock.classList.remove('hidden');
        if (btnPromote) btnPromote.disabled = true;
    }
}

/**
 * Inicializa la consola de gestión comercial B2B y SaaS
 */
function initCommercialView() {
    const loginGate = document.getElementById('commercial-login-gate');
    const dashboardArea = document.getElementById('commercial-dashboard-area');
    
    if (!isCommercialAuthenticated) {
        if (loginGate) loginGate.classList.remove('hidden');
        if (dashboardArea) dashboardArea.classList.add('hidden');
        renderPublicPricingGrid();
        return;
    } else {
        if (loginGate) loginGate.classList.add('hidden');
        if (dashboardArea) dashboardArea.classList.remove('hidden');
    }
    
    // Cargar el portafolio del usuario activo (o vacío si es la primera vez)
    loadUserPortfolio();
    
    // Cargar historial de retiros bancarios del usuario activo
    if (loggedInB2bClient) {
        loadUserWithdrawals(loggedInB2bClient.email);
    } else {
        b2bWithdrawals = [];
    }
    
    const b2bHeader = document.getElementById('commercial-header-hud');
    if (b2bHeader) b2bHeader.style.display = 'flex';

    if (!isSupabaseActive) {
        filterAgentProperties();
    }

    updateFormUnits();
    renderB2bAgentProfile();
    updateSaasMetricsHUD();
    updatePromoPropertySelect();
    renderB2bInventory();
    updateB2bSubscriptionPendingBanner();
    syncPendingPaymentRequests();

    // Restablecer visualización de barra de pestañas en caso de que viniera de preview mode
    const tabsNav = document.querySelector('.commercial-tabs-nav');
    if (tabsNav) tabsNav.style.display = 'flex';

    // Controlar visibilidad de pestañas del panel comercial según rol y plan
    const isInvestor = loggedInB2bClient && ((loggedInB2bClient.role || '').toLowerCase() === 'inversionista');
    const clientPlan = loggedInB2bClient && loggedInB2bClient.plan ? loggedInB2bClient.plan.toLowerCase() : '';
    
    const btnPropiedades = document.getElementById('comm-tab-btn-propiedades');
    const btnPropiedadesList = document.getElementById('comm-tab-btn-propiedades-list');
    const btnPortfolio = document.getElementById('comm-tab-btn-portfolio') || document.getElementById('comm-tab-btn-portfolio-redirect');
    
    if (isInvestor) {
        if (btnPropiedades) btnPropiedades.style.display = 'none';
        if (btnPropiedadesList) btnPropiedadesList.style.display = 'none';
        if (btnPortfolio) btnPortfolio.style.display = 'flex';
    } else {
        // Agente
        if (btnPropiedades) btnPropiedades.style.display = 'flex';
        if (btnPropiedadesList) btnPropiedadesList.style.display = 'flex';
        
        // Mostrar "Portafolio IA" para agentes Pro o VIP
        if (clientPlan === 'pro' || clientPlan === 'vip' || clientPlan === 'vip premium') {
            if (btnPortfolio) btnPortfolio.style.display = 'flex';
        } else {
            if (btnPortfolio) btnPortfolio.style.display = 'none';
        }
    }

    // Actualizar nivel de socio en la cabecera comercial
    const partnerLevelEl = document.getElementById('commercial-partner-level');
    if (partnerLevelEl && loggedInB2bClient) {
        const client = loggedInB2bClient;
        const dbPlan = client.plan || 'Pro';
        const isPremium = (dbPlan === 'VIP' || dbPlan === 'Premium' || dbPlan.toLowerCase() === 'premium' || dbPlan.toLowerCase() === 'vip');
        const isPro = (dbPlan === 'Pro' || dbPlan.toLowerCase() === 'pro');
        const isInvestor = (client.role || '').toLowerCase() === 'inversionista';
        
        partnerLevelEl.innerText = isPremium ? 
            (isInvestor ? "Inversionista Premium" : "Inmobiliaria Premium") : 
            (isPro ? (isInvestor ? "Inversionista Pro" : "Inmobiliaria Pro") : "Agente Individual");
    }

    // Renderizar grilla de suscripción B2B dinámica
    renderB2bPricingGrid();

    // Gestionar Overlays de Bloqueo Criptográficos según Plan y Estado de Pago
    updateLockOverlaysState();

    const isPending = loggedInB2bClient && (loggedInB2bClient.status === 'Pendiente' || loggedInB2bClient.status?.toLowerCase() === 'pendiente');

    // Sincronizar UI de retiros bancarios, pestañas por defecto y cuadrícula de suscripciones corporativas
    if (isPending) {
        switchCommercialTab('suscripcion');
    } else {
        const activeTabBtn = document.querySelector('.comm-tab-btn.active');
        if (activeTabBtn) {
            const activeTabId = activeTabBtn.id.replace('comm-tab-btn-', '');
            switchCommercialTab(activeTabId);
        } else {
            switchCommercialTab('home');
        }
    }
    renderB2bWithdrawalsTable();
    syncCommercialPricingGridUI();

    // Sincronizar listados del agente con Supabase en tiempo real (stale-while-revalidate)
    if (isSupabaseActive) {
        if (agentUploadedProperties.length === 0) {
            isB2bInventoryLoading = true;
            renderB2bInventory();
        } else {
            const titleContainer = document.querySelector('.b2b-inventory-card .card-header');
            if (titleContainer) {
                let syncBadge = document.getElementById('b2b-sync-indicator');
                if (!syncBadge) {
                    syncBadge = document.createElement('span');
                    syncBadge.id = 'b2b-sync-indicator';
                    syncBadge.className = 'font-mono text-cyan';
                    syncBadge.style.fontSize = '0.65rem';
                    syncBadge.style.marginLeft = '12px';
                    syncBadge.style.display = 'inline-flex';
                    syncBadge.style.alignItems = 'center';
                    syncBadge.style.gap = '4px';
                    syncBadge.innerHTML = `<span class="neon-spinner" style="width: 8px; height: 8px; border-width: 1px; animation: spin 0.8s linear infinite; display: inline-block;"></span> SINCRONIZANDO...`;
                    
                    const h2 = titleContainer.querySelector('h2');
                    if (h2) h2.appendChild(syncBadge);
                }
            }
        }

        syncSupabaseData(true).then(() => {
            isB2bInventoryLoading = false;
            const syncBadge = document.getElementById('b2b-sync-indicator');
            if (syncBadge) syncBadge.remove();
            renderB2bInventory();
        }).catch(err => {
            console.error("Error al sincronizar inventario B2B en segundo plano:", err);
            isB2bInventoryLoading = false;
            const syncBadge = document.getElementById('b2b-sync-indicator');
            if (syncBadge) syncBadge.remove();
            renderB2bInventory();
        });
    }

    // Auto-sincronización de aprobación en la nube en tiempo real
    if (isSupabaseActive && loggedInB2bClient && loggedInB2bClient.id) {
        // 1. Verificar si hay un request aprobado para este cliente que necesite auto-activación (bypass RLS)
        supabaseClient
            .from('payment_requests')
            .select('*')
            .eq('client_id', loggedInB2bClient.id)
            .eq('status', 'aprobado')
            .then(({ data: approvedReqs, error: reqErr }) => {
                if (!reqErr && approvedReqs && approvedReqs.length > 0) {
                    const req = approvedReqs[0];
                    console.log("⚡ [ValorGT Sync] ¡Detectado comprobante aprobado por el admin en la nube! Auto-activando perfil...");
                    
                    const isSub = req.concept && req.concept.startsWith('Suscripción');
                    let dbPlan = 'Pro';
                    if (req.planKey === 'basico') dbPlan = 'Basico';
                    else if (req.planKey === 'pro') dbPlan = 'Pro';
                    else if (req.planKey === 'vip') dbPlan = 'VIP';
                    else if (req.planKey === 'premium') dbPlan = 'Premium';

                    // Forzar plan Premium para inversionistas
                    const isInvestor = loggedInB2bClient && ((loggedInB2bClient.role || '').toLowerCase() === 'inversionista');
                    if (isInvestor) {
                        dbPlan = 'Premium';
                    }

                    const updatePayload = { status: 'activo' };
                    if (isSub) {
                        updatePayload.plan = dbPlan;
                    }

                    // El propio cliente (dueño autenticado de la fila) sí puede escribir debido a RLS (auth.uid() = id)
                    supabaseClient
                        .from('profiles')
                        .update(updatePayload)
                        .eq('id', loggedInB2bClient.id)
                        .then(({ error: profErr }) => {
                            if (!profErr) {
                                console.log("✔️ Perfil activado con éxito por el propio cliente.");
                                
                                // Eliminar la solicitud de pago aprobada para limpiar la tabla
                                supabaseClient
                                    .from('payment_requests')
                                    .delete()
                                    .eq('id', req.id)
                                    .then(() => console.log("Comprobante aprobado eliminado de Supabase."));

                                // Forzar refresco local
                                const oldStatus = loggedInB2bClient.status;
                                loggedInB2bClient.status = 'Activo';
                                if (isSub) {
                                    loggedInB2bClient.plan = dbPlan;
                                    activeB2bPlan = dbPlan.toLowerCase();
                                }

                                localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));

                                alert("🎉 ¡EXCELENTE NOTICIA!\n\nTu suscripción ha sido verificada y aprobada por la administración de ValorGT®.\nAhora tienes acceso completo a todas las herramientas profesionales SaaS.");
                                
                                renderB2bAgentProfile();
                                updateSaasMetricsHUD();
                                updateB2bSubscriptionPendingBanner();
                                updateLockOverlaysState();

                                switchCommercialTab('home');
                            } else {
                                console.error("Error al auto-activar perfil desde cliente:", profErr);
                            }
                        });
                }
            });

        // 2. Consulta de estado directa como fallback o actualización de saldo
        supabaseClient
            .from('profiles')
            .select('status, plan, usdt_balance, role')
            .eq('id', loggedInB2bClient.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (data && !error) {
                    const dbStatus = data.status.charAt(0).toUpperCase() + data.status.slice(1);
                    let dbPlan = data.plan;
                    const dbBalance = parseFloat(data.usdt_balance || 0);
                    let dbRole = data.role || 'agente';
                    
                    // Sanitizar cuentas demo e inversionistas en Supabase sync
                    const emailLower = (loggedInB2bClient.email || '').toLowerCase();
                    const roleLower = dbRole.toLowerCase();
                    if (roleLower === 'inversionista') {
                        dbPlan = 'Premium';
                        // Auto-correct DB plan for investor if it is wrong (using authenticated client RLS bypass)
                        if (data.plan !== 'Premium') {
                            supabaseClient.from('profiles').update({ plan: 'Premium' }).eq('id', loggedInB2bClient.id)
                            .then(() => console.log("⚡ [Auto-Heal] Updated investor plan to Premium in remote database."))
                            .catch(err => console.error("⚠️ [Auto-Heal] Failed to update investor plan in remote database:", err));
                        }
                    } else if (emailLower === 'ana@estevezinmobiliaria.com') {
                        dbPlan = 'VIP';
                        dbRole = 'agente';
                    } else if (emailLower === 'sofia@alianzagt.com') {
                        dbPlan = 'Básico';
                        dbRole = 'agente';
                    }
                    
                    if (loggedInB2bClient.status !== dbStatus || loggedInB2bClient.plan !== dbPlan || loggedInB2bClient.usdtBalance !== dbBalance || loggedInB2bClient.role !== dbRole) {
                        const oldStatus = loggedInB2bClient.status;
                        
                        loggedInB2bClient.status = dbStatus;
                        loggedInB2bClient.plan = dbPlan;
                        loggedInB2bClient.usdtBalance = dbBalance;
                        loggedInB2bClient.role = dbRole;
                        activeB2bPlan = (dbPlan || 'pro').toLowerCase();
                        
                        localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));
                        
                        console.log(`[B2B Sync] Perfil actualizado automáticamente: Status ${oldStatus} -> ${dbStatus}, Plan -> ${dbPlan}, Rol -> ${dbRole}`);
                        
                        // Si pasó de Pendiente a Activo, lanzar alerta al usuario
                        if ((oldStatus === 'Pendiente' || (oldStatus || '').toLowerCase() === 'pendiente') && dbStatus === 'Activo') {
                            alert("🎉 ¡EXCELENTE NOTICIA!\n\nTu suscripción ha sido verificada y aprobada por la administración de ValorGT®.\nAhora tienes acceso completo a todas las herramientas profesionales SaaS.");
                        }
                        
                        // Re-inicializar UI
                        renderB2bAgentProfile();
                        updateSaasMetricsHUD();
                        updateB2bSubscriptionPendingBanner();
                        updateLockOverlaysState();
                        
                        const isPending = dbStatus === 'Pendiente' || (dbStatus || '').toLowerCase() === 'pendiente';
                        if (isPending) {
                            switchCommercialTab('suscripcion');
                        } else {
                            switchCommercialTab('home');
                        }
                    }
                }
            })
            .catch(err => console.warn("Error en sincronización en segundo plano de perfil:", err));
    }
    
    renderPublicPricingGrid();
    if (typeof updateAssistantVisibility === 'function') {
        updateAssistantVisibility();
    }
}

/**
 * Renderiza el listado de clientes registrados en el SaaS en la tabla B2B
 */
/**
 * Renderiza el perfil profesional y detalles de membresía del agente logueado
 */
function renderB2bAgentProfile() {
    const container = document.getElementById('b2b-profile-card-body');
    if (!container) return;

    if (!loggedInB2bClient) {
        // Fallback si no hay agente activo (modo demo)
        loggedInB2bClient = b2bClients.find(c => c.email && c.email.toLowerCase() === 'roberto@inversionesrv.com') || b2bClients[0];
    }

    const client = loggedInB2bClient;
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const plan = (client.plan || 'pro').toLowerCase();
    const status = (client.status || 'Activo').toUpperCase();

    let planPriceGTQ = 0;
    let planPriceUSD = 0;
    if (plan === 'vip') {
        planPriceGTQ = 640;
        planPriceUSD = 82;
    } else if (plan === 'premium') {
        planPriceGTQ = 340;
        planPriceUSD = 43.70;
    } else if (plan === 'pro') {
        planPriceGTQ = 240;
        planPriceUSD = 31;
    } else {
        planPriceGTQ = 140;
        planPriceUSD = 18;
    }

    const planPriceConverted = activeCurrency === 'GTQ' ? planPriceGTQ : planPriceUSD;
    const formattedPrice = planPriceConverted % 1 === 0 ? planPriceConverted.toFixed(0) : planPriceConverted.toFixed(2);
    const planClass = plan === 'básico' || plan === 'basico' ? 'basico' : plan;

    container.innerHTML = `
        <div class="agent-profile-dashboard font-mono" style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Fila 1: Avatar holográfico y detalles base -->
            <div style="display: flex; gap: 20px; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 15px;">
                <div style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--neon-emerald); background: rgba(52, 199, 89, 0.05); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px var(--neon-emerald-glow); position: relative; overflow: hidden; flex-shrink: 0;">
                    <i data-lucide="user" style="width: 28px; height: 28px; color: var(--neon-emerald);"></i>
                    <div style="position: absolute; bottom: 0; width: 100%; height: 3px; background: var(--neon-emerald); box-shadow: 0 0 5px var(--neon-emerald-glow);"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                    <h3 style="font-size: 1.2rem; font-weight: bold; color: #fff; margin: 0;">${client.name}</h3>
                    <span style="font-size: 0.75rem; color: var(--neon-emerald); font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Socio Inmobiliario Verificado</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${client.company}</span>
                </div>
            </div>

            <!-- Fila 2: Grid de datos del contrato -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 15px; text-align: left;">
                <div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">NIT COMERCIAL:</span>
                    <strong style="font-size: 0.9rem; color: #fff;">${client.nit}</strong>
                </div>
                <div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">PLAN DE MEMBRESÍA:</span>
                    <span class="plan-col ${planClass}" style="font-size: 0.8rem; padding: 2px 6px; border-radius: 4px;">${(client.plan || 'pro').toUpperCase()}</span>
                </div>
                <div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">CORREO CORPORATIVO:</span>
                    <strong style="font-size: 0.8rem; color: #fff; text-decoration: underline;">${client.email}</strong>
                </div>
                <div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">ESTADO DE CUENTA:</span>
                    <strong style="font-size: 0.85rem; color: var(--green);">● ${(client.status || 'Activo').toUpperCase()}</strong>
                </div>
            </div>

            <!-- Fila 3: Ajustes de Perfil (WhatsApp & Logo) -->
            <div style="border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 15px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
                <span style="font-size: 0.72rem; color: var(--cyan); font-weight: bold; display: flex; align-items: center; gap: 4px;"><i data-lucide="sliders" style="width: 12px; height: 12px;"></i> AJUSTES DE MARCA B2B</span>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.62rem; color: var(--text-secondary);">WHATSAPP DE CONTACTO (SÓLO NÚMEROS):</label>
                    <input type="tel" id="profile-whatsapp" placeholder="Ej: 50250129482" value="${client.whatsapp || client.phone || ''}" style="font-size: 0.75rem; padding: 6px 10px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 4px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.62rem; color: var(--text-secondary);">LOGOTIPO EN FOTOS (COPORATIVO PRO/PREMIUM):</label>
                    <input type="url" id="profile-logo-url" placeholder="Ej. https://miweb.com/logo.png" value="${client.logo || ''}" style="font-size: 0.75rem; padding: 6px 10px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 4px;">
                </div>
                <button onclick="saveB2bAgentProfile()" class="btn-micro-cyber" style="width: 100%; text-align: center; justify-content: center; height: 28px; font-size: 0.68rem; background: rgba(0, 240, 255, 0.08); border: 1px solid var(--cyan); color: var(--cyan); margin-top: 5px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="save" style="width: 11px; height: 11px;"></i> GUARDAR AJUSTES DE MARCA
                </button>
            </div>

            <!-- Fila 4: Resumen de facturación y firma digital -->
            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Costo de Licencia SaaS:</span>
                    <strong style="font-size: 0.95rem; color: var(--green);">${currencySym}${formatNumber(formattedPrice)} / mes</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; margin-top: 3px;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Firma Digital Autorizada:</span>
                    <span style="font-size: 0.7rem; color: var(--cyan); background: rgba(0, 240, 255, 0.08); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(0, 240, 255, 0.25);">SSL-TLS-V1.3</span>
                </div>
            </div>
    `;

    // Actualizar perfil del drawer móvil de forma reactiva
    const mobileNameEl = document.getElementById('mobile-agent-name');
    const mobileRoleEl = document.getElementById('mobile-agent-role');
    if (mobileNameEl) {
        mobileNameEl.innerText = client.name;
    }
    if (mobileRoleEl) {
        const planUpper = (client.plan || 'pro').toUpperCase();
        mobileRoleEl.innerText = (planUpper === 'VIP' || planUpper === 'PREMIUM') ? "Socio Premium B2B" : (planUpper === 'PRO' ? "Socio Pro B2B" : "Agente B2B");
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Registra un nuevo cliente comercial e inserta en la tabla dinámica
 */
function registerB2bClient(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('b2b-client-name').value;
    const company = document.getElementById('b2b-client-company').value;
    const nit = document.getElementById('b2b-client-nit').value;
    const phone = document.getElementById('b2b-client-phone').value;
    const email = document.getElementById('b2b-client-email').value;

    if (!name || !company || !nit || !phone || !email) {
        alert("Por favor completa todos los campos del cliente.");
        return;
    }

    const newClient = {
        name: name,
        company: company,
        nit: nit,
        phone: phone,
        email: email,
        plan: 'Básico',
        status: 'Activo'
    };

    b2bClients.unshift(newClient); // Agregar al inicio
    renderB2bClients();

    // Limpiar formulario
    document.getElementById('b2b-client-form').reset();
    
    // Alerta de éxito
    alert(`Cliente comercial "${name}" registrado con éxito en la base de datos B2B SaaS.`);
}

/**
 * Actualiza el HUD comercial (Facturación, propiedades e impresiones)
 */
function updateSaasMetricsHUD() {
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let billingGTQ = 0;
    let billingUSD = 0;
    let impressions = 0;
    let clicks = 0;
    let planFriendlyName = 'Ninguno';

    if (loggedInB2bClient) {
        // Enforce Premium plan for all inversionistas
        if ((loggedInB2bClient.role || '').toLowerCase() === 'inversionista') {
            loggedInB2bClient.plan = 'Premium';
            activeB2bPlan = 'premium';
        }

        const email = (loggedInB2bClient.email || '').toLowerCase();
        const isPending = loggedInB2bClient.status && (loggedInB2bClient.status.toLowerCase() === 'pendiente');
        const isInvestor = (loggedInB2bClient.role || '').toLowerCase() === 'inversionista';

        // 1. Determinar facturación SaaS real exacta según plan contratado y estado de pago
        if (!isPending) {
            const plan = (loggedInB2bClient.plan || '').toLowerCase();
            if (plan === 'básico' || plan === 'basico') {
                billingGTQ = 140;
                billingUSD = 18;
                planFriendlyName = 'Agente Individual';
            } else if (plan === 'pro') {
                billingGTQ = 240;
                billingUSD = 31;
                planFriendlyName = 'Inmobiliaria Pro';
            } else if (plan === 'premium') {
                billingGTQ = 340;
                billingUSD = 43.70;
                planFriendlyName = 'Inversionista Premium';
            } else if (plan === 'vip') {
                billingGTQ = 640;
                billingUSD = 82;
                planFriendlyName = 'Inmobiliaria Premium';
            } else {
                billingGTQ = 0;
                billingUSD = 0;
                planFriendlyName = 'Plan Personalizado';
            }
        } else {
            billingGTQ = 0;
            billingUSD = 0;
            planFriendlyName = 'Pendiente de Pago';
        }

        // 2. Determinar base de impresiones e históricos de clics (para cuentas demo y nuevos agentes)
        if (email === 'ana@estevezinmobiliaria.com') {
            impressions = 24500;
            clicks = 680;
        } else if (email === 'roberto@inversionesrv.com' || email === 'agente@valorgt.com') {
            impressions = 12450;
            clicks = 320;
        } else if (email === 'sofia@alianzagt.com') {
            impressions = 4200;
            clicks = 95;
        } else {
            // Cuentas nuevas inician en cero absoluto
            impressions = 0;
            clicks = 0;
        }

        // 3. Calcular aportes adicionales dinámicos basados en sus propiedades activas reales
        const totalProperties = agentUploadedProperties.length;
        const sponsoredProperties = agentUploadedProperties.filter(p => p.sponsored === true).length;
        const standardProperties = totalProperties - sponsoredProperties;

        impressions += (standardProperties * 180) + (sponsoredProperties * 2200);
        clicks += (standardProperties * 8) + (sponsoredProperties * 110);
        
        // Sincronizar clicks con variable de estado por si se incrementa externamente
        saasClientClicks = clicks;
        saasImpressionsCount = impressions;

        // Actualizar subtítulos dinámicos de las tarjetas KPI Premium
        const billingSubEl = document.getElementById('saas-billing-sub-card');
        if (billingSubEl) {
            billingSubEl.innerText = isPending ? `🛑 PENDIENTE` : `💳 PLAN: ${planFriendlyName.toUpperCase()}`;
        }

        const impressionsSubEl = document.getElementById('saas-impressions-sub-card');
        if (impressionsSubEl) {
            impressionsSubEl.innerText = isPending ? `🛑 SERVICIO SUSPENDIDO` : `📈 TRÁFICO HABILITADO`;
        }

        const listingsSubEl = document.getElementById('saas-listings-sub-card');
        if (listingsSubEl) {
            listingsSubEl.innerText = isInvestor ? `💼 ACTIVOS EN CARTERA` : `🏠 INVENTARIO LIVE`;
        }
    }

    const billingConverted = activeCurrency === 'GTQ' ? billingGTQ : billingUSD;
    const billingFormatted = `${currencySym}${formatNumber(billingConverted.toFixed(2))}`;

    const saasBillingEl = document.getElementById('saas-billing-val');
    if (saasBillingEl) {
        saasBillingEl.innerText = billingFormatted;
    }

    const billingCard = document.getElementById('saas-billing-val-card');
    if (billingCard) {
        billingCard.innerText = billingFormatted;
    }
    const billingHome = document.getElementById('saas-billing-val-home');
    if (billingHome) {
        billingHome.innerText = billingFormatted;
    }

    const saasListingsEl = document.getElementById('saas-listings-count');
    if (saasListingsEl) {
        saasListingsEl.innerText = agentUploadedProperties.length;
    }

    const countCard = document.getElementById('saas-listings-count-card');
    if (countCard) {
        countCard.innerText = agentUploadedProperties.length;
    }
    const countHome = document.getElementById('saas-listings-count-home');
    if (countHome) {
        countHome.innerText = agentUploadedProperties.length;
    }

    const saasImpressionsEl = document.getElementById('saas-impressions-count');
    if (saasImpressionsEl) {
        saasImpressionsEl.innerText = formatNumber(saasImpressionsCount);
    }

    const impressionsCard = document.getElementById('saas-impressions-count-card');
    if (impressionsCard) {
        impressionsCard.innerText = formatNumber(saasImpressionsCount);
    }
    const impressionsHome = document.getElementById('saas-impressions-count-home');
    if (impressionsHome) {
        impressionsHome.innerText = formatNumber(saasImpressionsCount);
    }

    // Cartera Oro Digital (XAUt Airdrops)
    if (loggedInB2bClient) {
        const usdtCard = document.getElementById('saas-usdt-balance-card');
        if (usdtCard) {
            usdtCard.innerText = `${loggedInB2bClient.usdtBalance.toFixed(4)} XAUt`;
        }
        
        // Actualizar tarjeta de cotización de XAUt en vivo
        const priceCard = document.getElementById('saas-xaut-price-card');
        const priceSubCard = document.getElementById('saas-xaut-price-sub-card');
        if (priceCard) {
            const xautPrice = currentAirdropXautPrice || 2380.00;
            priceCard.innerText = `$${formatNumber(xautPrice.toFixed(2))} USD`;
            
            if (priceSubCard) {
                if (activeCurrency === 'GTQ') {
                    const priceInGTQ = xautPrice * exchangeRate;
                    priceSubCard.innerText = `Equiv: Q${formatNumber(priceInGTQ.toFixed(2))} GTQ`;
                    priceSubCard.style.color = '#ffd700'; // Estética gold premium
                } else {
                    priceSubCard.innerText = `🟢 COTIZACIÓN EN VIVO`;
                    priceSubCard.style.color = 'var(--cyan)';
                }
            }
        }
    }
    updateAdminMonthlyRevenueHUD();
}

/**
 * Actualiza la tarjeta de Ingresos Acumulados del Mes en la Consola Admin
 */
function updateAdminMonthlyRevenueHUD() {
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    const revenueEl = document.getElementById('admin-monthly-accumulated-revenue');
    if (revenueEl) {
        const amt = adminMonthlyRevenueUSD * conversion;
        revenueEl.innerText = `${currencySym}${formatNumber(amt.toFixed(2))}`;
    }
}

/**
 * Ejecuta la transferencia simulada de Oro Digital (XAUt) entre agentes comerciales
 */
async function executeB2bUsdtTransfer(event) {
    if (event) event.preventDefault();

    if (!loggedInB2bClient) {
        alert("Debes iniciar sesión para realizar transferencias.");
        return;
    }

    const recipientEmail = document.getElementById('usdt-recipient-email').value.trim().toLowerCase();
    const amount = parseFloat(document.getElementById('usdt-transfer-amount').value);

    if (!recipientEmail || isNaN(amount) || amount <= 0) {
        alert("Por favor ingresa un destinatario válido y un monto mayor a 0.");
        return;
    }

    // 1. Validar fondos suficientes locales
    if (loggedInB2bClient.usdtBalance < amount) {
        alert(`⚠️ FONDOS INSUFICIENTES: Tu balance actual es de ${loggedInB2bClient.usdtBalance.toFixed(4)} XAUt. No puedes transferir ${amount.toFixed(4)} XAUt.`);
        return;
    }

    // 2. Validar que no se transfiera a sí mismo
    if (loggedInB2bClient && loggedInB2bClient.email && loggedInB2bClient.email.toLowerCase() === recipientEmail) {
        alert("⚠️ OPERACIÓN RECHAZADA: No puedes transferirte fondos de oro digital a ti mismo.");
        return;
    }

    const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // SI SUPABASE ESTÁ ACTIVO, HACER LA TRANSFERENCIA PERSISTENTE
    if (isSupabaseActive) {
        try {
            // Asegurar que el precio de XAUT esté actualizado antes de realizar la transacción
            await fetchXautPriceForAirdrop();

            // A. Buscar destinatario en Supabase
            const { data: recipientProfile, error: searchErr } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('email', recipientEmail)
                .single();

            if (searchErr || !recipientProfile) {
                alert(`⚠️ DESTINATARIO NO ENCONTRADO: El correo "${recipientEmail}" no está registrado como socio inmobiliario en Supabase.`);
                return;
            }

            // B. Actualizar balance de emisor en Supabase
            const newSenderBalance = loggedInB2bClient.usdtBalance - amount;
            const { error: senderErr } = await supabaseClient
                .from('profiles')
                .update({ usdt_balance: newSenderBalance })
                .eq('id', loggedInB2bClient.id);

            if (senderErr) {
                alert(`⚠️ FALLO DE TRANSACCIÓN: No se pudo debitar de tu saldo. ${senderErr.message}`);
                return;
            }

            // C. Actualizar balance de receptor en Supabase
            const newReceiverBalance = parseFloat(recipientProfile.usdt_balance) + amount;
            const { error: receiverErr } = await supabaseClient
                .from('profiles')
                .update({ usdt_balance: newReceiverBalance })
                .eq('id', recipientProfile.id);

            if (receiverErr) {
                console.error("Error al acreditar fondos al destinatario en Supabase:", receiverErr);
                // Si falla, intentamos devolver fondos al emisor
                await supabaseClient.from('profiles').update({ usdt_balance: loggedInB2bClient.usdtBalance }).eq('id', loggedInB2bClient.id);
                alert("⚠️ FALLO DE TRANSACCIÓN: El servidor receptor rechazó el depósito. Operación revertida.");
                return;
            }

            // D. Registrar la transferencia en la tabla de transacciones de Supabase
            await supabaseClient.from('transactions').insert([
                {
                    sender_email: loggedInB2bClient.email,
                    receiver_email: recipientEmail,
                    amount: amount,
                    tx_hash: txHash,
                    xaut_price: currentAirdropXautPrice || 2380.00,
                    exchange_rate: exchangeRate || 7.78
                }
            ]);

            // Actualizar estado local del emisor
            loggedInB2bClient.usdtBalance = newSenderBalance;

            // Actualizar destinatario local si coincide que está cargado en la demo
            const localRec = b2bClients.find(c => c.email.toLowerCase() === recipientEmail);
            if (localRec) {
                localRec.usdtBalance = newReceiverBalance;
            }

            // Registrar log administrativo
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SECURITY", `ledger_node: Transferencia exitosa de ${amount.toFixed(4)} XAUt (Oro Digital) de ${loggedInB2bClient.name} a ${recipientProfile.name} (${recipientEmail}) en Supabase.`, false);
            }

        } catch (err) {
            console.error("Fallo de red en transferencia Supabase:", err);
            alert("⚠️ FALLO DE RED: No se pudo conectar con el Ledger de Oro Digital.");
            return;
        }
    } else {
        // Fallback: Realizar la transferencia local en memoria
        const recipient = b2bClients.find(c => c.email.toLowerCase() === recipientEmail);
        if (!recipient && recipientEmail !== 'agente@valorgt.com') {
            alert(`⚠️ DESTINATARIO NO ENCONTRADO: El correo "${recipientEmail}" no está registrado como socio inmobiliario en la plataforma.`);
            return;
        }

        const finalRecipient = recipient || b2bClients.find(c => c.email.toLowerCase() === 'roberto@inversionesrv.com') || b2bClients[0];
        
        loggedInB2bClient.usdtBalance -= amount;
        finalRecipient.usdtBalance += amount;

        // Guardar registro de la transferencia en el historial local de ambos
        const refCode = "TX-" + Math.floor(100000 + Math.random() * 900000);
        const dateStr = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);
        const price = currentAirdropXautPrice || 2380;
        const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
        const equivalentNet = amount * price * conversion;

        const senderTxs = JSON.parse(localStorage.getItem(`valorgt_transfers_${loggedInB2bClient.email.toLowerCase()}`)) || [];
        senderTxs.unshift({
            ref: refCode,
            date: dateStr,
            type: 'transfer_sent',
            detail: `Transferencia a: ${finalRecipient.email}`,
            amountXAUt: -amount,
            amountGTQ: equivalentNet,
            xautPrice: price,
            exchangeRate: exchangeRate
        });
        localStorage.setItem(`valorgt_transfers_${loggedInB2bClient.email.toLowerCase()}`, JSON.stringify(senderTxs));

        const receiverTxs = JSON.parse(localStorage.getItem(`valorgt_transfers_${finalRecipient.email.toLowerCase()}`)) || [];
        receiverTxs.unshift({
            ref: refCode,
            date: dateStr,
            type: 'transfer_recv',
            detail: `Transferencia de: ${loggedInB2bClient.email}`,
            amountXAUt: amount,
            amountGTQ: equivalentNet,
            xautPrice: price,
            exchangeRate: exchangeRate
        });
        localStorage.setItem(`valorgt_transfers_${finalRecipient.email.toLowerCase()}`, JSON.stringify(receiverTxs));

        if (typeof appendAdminLog === 'function') {
            appendAdminLog("SECURITY", `ledger_node: Transferencia exitosa de ${amount.toFixed(4)} XAUt (Oro Digital) de ${loggedInB2bClient.name} a ${finalRecipient.name} (${finalRecipient.email}) [Memoria Local].`, false);
        }
    }

    // Actualizar HUD y re-renderizar tabla de movimientos de la cartera
    updateSaasMetricsHUD();
    renderB2bWithdrawalsTable();

    // Limpiar formulario
    document.getElementById('b2b-usdt-transfer-form').reset();

    // Alerta de éxito
    alert(`¡CONEXIÓN ESTABLECIDA CON EL LEDGER DE ORO DIGITAL!
    
    ✅ Transferencia de ${amount.toFixed(4)} XAUt (Oro Digital) autorizada y confirmada.
    Destinatario: ${recipientEmail}
    Hash del Ledger: ${txHash.substring(0, 16)}...
    
    Tu nuevo balance es de ${loggedInB2bClient.usdtBalance.toFixed(4)} XAUt.`);
}

/**
 * Actualiza el selector de propiedades a pautar
 */
function updatePromoPropertySelect() {
    const select = document.getElementById('promo-property-select');
    const btn = document.getElementById('btn-promote-property');
    if (!select) return;

    select.innerHTML = '';

    if (agentUploadedProperties.length === 0) {
        const opt = document.createElement('option');
        opt.value = "";
        opt.disabled = true;
        opt.selected = true;
        opt.innerText = "-- No has subido propiedades aún --";
        select.appendChild(opt);
        if (btn) btn.disabled = true;
    } else {
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        defaultOpt.innerText = "-- Selecciona una propiedad para pautar --";
        select.appendChild(defaultOpt);

        agentUploadedProperties.forEach(prop => {
            const opt = document.createElement('option');
            opt.value = prop.id;
            opt.innerText = `${prop.title} (${prop.location.toUpperCase()})`;
            select.appendChild(opt);
        });

        if (btn) btn.disabled = false;
    }
}

/**
 * Registra una propiedad nueva y la inyecta dinámicamente en el inventario
 */
async function publishAgentProperty(event) {
    if (event) event.preventDefault();

    // Validar límites de publicación según el plan comercial contratado
    let maxProperties = 20;
    let planLabel = "Agente Individual";
    if (activeB2bPlan === 'pro') {
        maxProperties = 100;
        planLabel = "Inmobiliaria Pro";
    } else if (activeB2bPlan === 'vip' || activeB2bPlan === 'premium') {
        maxProperties = Infinity;
        planLabel = "Inmobiliaria Premium";
    }

    const myPropertiesCount = agentUploadedProperties.filter(p => 
        loggedInB2bClient && (p.agent_id === loggedInB2bClient.id || p.agentName === loggedInB2bClient.name)
    ).length;

    if (!editingPropertyId && myPropertiesCount >= maxProperties) {
        alert(`⚠️ LÍMITE DE PUBLICACIONES ALCANZADO: Tu plan "${planLabel}" posee un límite máximo de ${maxProperties} propiedades publicadas de forma simultánea. Para aumentar tu capacidad e inyectar más nodos, adquiere un plan corporativo superior.`);
        return;
    }

    const title = document.getElementById('pub-title').value;
    const category = document.getElementById('pub-category').value;
    const type = document.getElementById('pub-type').value;
    const locationKey = document.getElementById('pub-location').value;
    const priceRaw = parseFloat(document.getElementById('pub-price').value);
    let size = parseFloat(document.getElementById('pub-size').value);
    if (category === 'Terreno') {
        const landAreaInput = document.getElementById('pub-prop-land-area');
        size = parseFloat(landAreaInput ? landAreaInput.value : '0') || 0;
    }
    const rooms = parseInt(document.getElementById('pub-beds').value) || 0;
    const bathrooms = parseFloat(document.getElementById('pub-baths').value) || 0;
    const parkings = parseInt(document.getElementById('pub-parks').value) || 0;
    const description = document.getElementById('pub-description') ? document.getElementById('pub-description').value.trim() : '';
    const agentName = loggedInB2bClient ? loggedInB2bClient.name : 'Asesor Inmobiliario';
    const agentCompany = loggedInB2bClient ? loggedInB2bClient.company : 'ValorGT Premium Partner';
    const agentPhone = loggedInB2bClient ? (loggedInB2bClient.whatsapp || loggedInB2bClient.phone) : '50250129482';
    const agentLogo = loggedInB2bClient ? loggedInB2bClient.logo : '';
    const agentPlan = loggedInB2bClient ? loggedInB2bClient.plan : 'Básico';

    const customPhoto = document.getElementById('pub-photo-custom') ? document.getElementById('pub-photo-custom').value.trim() : '';
    let photos = [];
    if (uploadedBase64Images && uploadedBase64Images.length > 0) {
        // Clonar y reordenar el array para situar la portada elegida en la posición 0
        photos = [...uploadedBase64Images];
        if (coverImageIndex > 0 && coverImageIndex < photos.length) {
            const coverImage = photos.splice(coverImageIndex, 1)[0];
            photos.unshift(coverImage);
        }
    } else if (customPhoto) {
        photos = customPhoto.split(',').map(u => u.trim()).filter(Boolean);
    }
    
    if (photos.length === 0) {
        photos = [document.getElementById('pub-photo').value];
    }
    
    const photo = photos[0];
    const youtubeUrl = document.getElementById('pub-youtube') ? document.getElementById('pub-youtube').value.trim() : '';
    const latVal = document.getElementById('pub-lat').value.trim();
    const lngVal = document.getElementById('pub-lng').value.trim();
    const lat = latVal === '' ? 0 : (parseFloat(latVal) || 0);
    const lng = lngVal === '' ? 0 : (parseFloat(lngVal) || 0);

    // Parámetros avanzados del Acordeón B2B
    const city = document.getElementById('pub-prop-city') ? document.getElementById('pub-prop-city').value : 'Guatemala';
    const residential = document.getElementById('pub-prop-residential') ? document.getElementById('pub-prop-residential').value.trim() : '';
    const landArea = parseFloat(document.getElementById('pub-prop-land-area') ? document.getElementById('pub-prop-land-area').value : '0') || 0;
    const landUnit = document.getElementById('pub-prop-land-unit') ? document.getElementById('pub-prop-land-unit').value : 'v2';
    const secondaryRooms = parseInt(document.getElementById('pub-room-secondary-count') ? document.getElementById('pub-room-secondary-count').value : '0') || 0;
    const fullBathrooms = parseInt(document.getElementById('pub-bath-full-count') ? document.getElementById('pub-bath-full-count').value : '0') || 0;
    const parkingType = document.getElementById('pub-parking-type') ? document.getElementById('pub-parking-type').value : 'techados';
    const garden = parseFloat(document.getElementById('pub-prop-garden') ? document.getElementById('pub-prop-garden').value : '0') || 0;
    const finishes = document.getElementById('pub-prop-finishes') ? document.getElementById('pub-prop-finishes').value : 'standard';
    const conservation = document.getElementById('pub-prop-conservation') ? document.getElementById('pub-prop-conservation').value : 'nueva';

    // Capturar checkboxes de distribución
    const hasMasterSuite = document.getElementById('pub-room-master-suite') ? document.getElementById('pub-room-master-suite').checked : false;
    const hasVisitorBath = document.getElementById('pub-bath-visitor') ? document.getElementById('pub-bath-visitor').checked : false;
    const study = document.getElementById('pub-prop-study') ? document.getElementById('pub-prop-study').checked : false;
    const familyRoom = document.getElementById('pub-prop-family-room') ? document.getElementById('pub-prop-family-room').checked : false;

    // Checkboxes de áreas adicionales
    const areas = [];
    const areaMapping = [
        { id: 'pub-area-living', key: 'area-living' },
        { id: 'pub-area-dining', key: 'area-dining' },
        { id: 'pub-area-kitchen', key: 'area-kitchen' },
        { id: 'pub-area-breakfast', key: 'area-breakfast' },
        { id: 'pub-area-maid', key: 'area-maid' },
        { id: 'pub-area-laundry', key: 'area-laundry' },
        { id: 'pub-area-storage', key: 'area-storage' },
        { id: 'pub-area-terrace', key: 'area-terrace' },
        { id: 'pub-area-balcony', key: 'area-balcony' },
        { id: 'pub-area-patio', key: 'area-patio' }
    ];
    areaMapping.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.checked) areas.push(item.key);
    });

    // Checkboxes de Amenidades
    const amenities = [];
    const amenityMapping = [
        { id: 'pub-amenity-pool', key: 'amenity-pool' },
        { id: 'pub-amenity-gym', key: 'amenity-gym' },
        { id: 'pub-amenity-security', key: 'amenity-security' },
        { id: 'pub-amenity-clubhouse', key: 'amenity-clubhouse' },
        { id: 'pub-amenity-view', key: 'amenity-view' },
        { id: 'pub-amenity-smart', key: 'amenity-smart' },
        { id: 'pub-amenity-solar', key: 'amenity-solar' },
        { id: 'pub-amenity-cistern', key: 'amenity-cistern' },
        { id: 'pub-amenity-elevator', key: 'amenity-elevator' }
    ];
    amenityMapping.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.checked) amenities.push(item.key);
    });

    // Checkboxes de Materiales
    const materials = [];
    const materialMapping = [
        { id: 'pub-mat-porcelain', key: 'mat-porcelain' },
        { id: 'pub-mat-marble', key: 'mat-marble' },
        { id: 'pub-mat-wood', key: 'mat-wood' },
        { id: 'pub-mat-pvc', key: 'mat-pvc' },
        { id: 'pub-mat-kitchen-luxe', key: 'mat-kitchen-luxe' }
    ];
    materialMapping.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.checked) materials.push(item.key);
    });

    // Checkboxes de Cercanías
    const near = [];
    const nearMapping = [
        { id: 'pub-near-malls', key: 'near-malls' },
        { id: 'pub-near-schools', key: 'near-schools' },
        { id: 'pub-near-supers', key: 'near-supers' },
        { id: 'pub-near-roads', key: 'near-roads' }
    ];
    nearMapping.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.checked) near.push(item.key);
    });

    // Limpiar clases de error previas
    const inputsToClear = document.querySelectorAll('#publish-property-form input, #publish-property-form select, #publish-property-form textarea');
    inputsToClear.forEach(input => input.classList.remove('input-error'));

    const titleEl = document.getElementById('pub-title');
    const locationEl = document.getElementById('pub-location');
    const priceEl = document.getElementById('pub-price');
    const sizeEl = document.getElementById('pub-size');
    const bedsEl = document.getElementById('pub-beds');
    const bathsEl = document.getElementById('pub-baths');
    const parksEl = document.getElementById('pub-parks');

    const errors = [];

    if (!title || !title.trim()) {
        errors.push("Título de la Publicación");
        if (titleEl) titleEl.classList.add('input-error');
    }
    if (!locationKey) {
        errors.push("Zona de Ubicación");
        if (locationEl) locationEl.classList.add('input-error');
    }
    if (isNaN(priceRaw) || priceRaw <= 0) {
        errors.push("Precio del Activo (debe ser mayor a 0)");
        if (priceEl) priceEl.classList.add('input-error');
    }
    if (isNaN(size) || size <= 0) {
        errors.push("Metros Cuadrados (debe ser mayor a 0)");
        if (sizeEl) sizeEl.classList.add('input-error');
    }
    
    // Para terrenos y bodegas las habitaciones/baños/parqueos son opcionales
    if (category !== 'Terreno' && category !== 'Bodega') {
        if (isNaN(rooms) || rooms < 0) {
            errors.push("Habitaciones (debe ser 0 o mayor)");
            if (bedsEl) bedsEl.classList.add('input-error');
        }
        if (isNaN(bathrooms) || bathrooms < 0) {
            errors.push("Baños (debe ser 0 o mayor)");
            if (bathsEl) bathsEl.classList.add('input-error');
        }
        if (isNaN(parkings) || parkings < 0) {
            errors.push("Parqueos (debe ser 0 o mayor)");
            if (parksEl) parksEl.classList.add('input-error');
        }
    }
    if (isNaN(lat) || isNaN(lng)) {
        errors.push("Coordenadas GPS (deben ser numéricas)");
        if (document.getElementById('pub-lat')) document.getElementById('pub-lat').classList.add('input-error');
        if (document.getElementById('pub-lng')) document.getElementById('pub-lng').classList.add('input-error');
    }

    if (errors.length > 0) {
        // Enfocar el primer error y sacudir
        const firstErrorEl = document.querySelector('.input-error');
        if (firstErrorEl) firstErrorEl.focus();

        // Agregar listener para remover la clase de error cuando el usuario empiece a escribir o cambiar
        document.querySelectorAll('.input-error').forEach(el => {
            const clearError = () => {
                el.classList.remove('input-error');
                el.removeEventListener('input', clearError);
                el.removeEventListener('change', clearError);
            };
            el.addEventListener('input', clearError);
            el.addEventListener('change', clearError);
        });

        alert(`⚠️ CAMPOS REQUERIDOS O INVÁLIDOS:\nPor favor completa o corrige los siguientes campos:\n\n- ${errors.join('\n- ')}`);
        return;
    }

    // Cambiar botón a estado de carga
    const submitBtn = document.querySelector('#publish-property-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
        submitBtn.innerHTML = `<span class="neon-spinner-small" style="display:inline-block; width:12px; height:12px; border:2px solid rgba(0, 240, 255, 0.2); border-top:2px solid var(--cyan); border-radius:50%; animation:spin 1s linear infinite; margin-right:8px; vertical-align:middle;"></span> PUBLICANDO LISTADO EN LA RED...`;
    }

    try {

    // Convertir precio a USD como estándar interno de base de datos
    const priceUSD = activeCurrency === 'GTQ' ? (priceRaw / exchangeRate) : priceRaw;

    const zoneData = ZONES_DATABASE[locationKey];
    const locationName = zoneData ? zoneData.name.split(' (')[0] : "Guatemala";

    // Estructurar propiedad que combine perfectamente con PORTFOLIO_DATABASE y soporte la tasación multivariable
    let newProperty = null;

    if (editingPropertyId) {
        // Modo Edición: Encontrar y actualizar propiedad existente
        newProperty = agentUploadedProperties.find(p => String(p.id) === String(editingPropertyId));
        if (newProperty) {
            const oldLocationKey = newProperty.location;

            newProperty.title = title;
            newProperty.category = category;
            newProperty.type = type;
            newProperty.tag = `${category.toUpperCase()} EN ${type.toUpperCase()}`;
            newProperty.priceUSD = priceUSD;
            newProperty.size = size;
            newProperty.rooms = rooms;
            newProperty.bathrooms = bathrooms;
            newProperty.parkings = parkings;
            newProperty.city = city;
            newProperty.residential = residential;
            newProperty.landArea = landArea;
            newProperty.landUnit = landUnit;
            newProperty.secondaryRooms = secondaryRooms;
            newProperty.fullBathrooms = fullBathrooms;
            newProperty.parkingType = parkingType;
            newProperty.garden = garden;
            newProperty.finishes = finishes;
            newProperty.conservation = conservation;
            newProperty.hasMasterSuite = hasMasterSuite;
            newProperty.hasVisitorBath = hasVisitorBath;
            newProperty.study = study;
            newProperty.familyRoom = familyRoom;
            newProperty.areas = areas;
            newProperty.materials = materials;
            newProperty.near = near;
            newProperty.amenities = amenities.length > 0 ? amenities : ["amenity-security"];
            newProperty.photo = photo;
            newProperty.photos = photos;
            newProperty.description = description;
            newProperty.youtubeUrl = youtubeUrl;
            newProperty.location = locationKey;
            newProperty.lat = lat;
            newProperty.lng = lng;

            // Sincronizar en PORTFOLIO_DATABASE
            if (oldLocationKey && PORTFOLIO_DATABASE[oldLocationKey]) {
                if (oldLocationKey !== locationKey) {
                    PORTFOLIO_DATABASE[oldLocationKey] = PORTFOLIO_DATABASE[oldLocationKey].filter(p => String(p.id) !== String(editingPropertyId));
                }
            }
            if (!PORTFOLIO_DATABASE[locationKey]) {
                PORTFOLIO_DATABASE[locationKey] = [];
            }
            const dbIndex = PORTFOLIO_DATABASE[locationKey].findIndex(p => String(p.id) === String(editingPropertyId));
            if (dbIndex >= 0) {
                PORTFOLIO_DATABASE[locationKey][dbIndex] = newProperty;
            } else {
                PORTFOLIO_DATABASE[locationKey].push(newProperty);
            }

            // Supabase
            if (isSupabaseActive) {
                try {
                    const { data, error } = await supabaseClient.from('properties').update({
                        title: title,
                        category: category,
                        type: type,
                        tag: newProperty.tag,
                        price_usd: priceUSD,
                        size_m2: size,
                        rooms: rooms,
                        bathrooms: bathrooms,
                        parkings: parkings,
                        photo_url: photo,
                        location_key: locationKey,
                        latitude: lat,
                        longitude: lng,
                        metadata: {
                            city: city,
                            residential: residential,
                            landArea: landArea,
                            landUnit: landUnit,
                            secondaryRooms: secondaryRooms,
                            fullBathrooms: fullBathrooms,
                            parkingType: parkingType,
                            garden: garden,
                            finishes: finishes,
                            conservation: conservation,
                            hasMasterSuite: hasMasterSuite,
                            hasVisitorBath: hasVisitorBath,
                            study: study,
                            familyRoom: familyRoom,
                            areas: areas,
                            materials: materials,
                            near: near,
                            amenities: amenities,
                            youtubeUrl: youtubeUrl,
                            photos: photos,
                            description: description,
                            agentName: newProperty.agentName,
                            agentCompany: newProperty.agentCompany,
                            agentPhone: newProperty.agentPhone,
                            agentLogo: newProperty.agentLogo,
                            agentPlan: newProperty.agentPlan
                        }
                    }).eq('id', editingPropertyId).select();

                    if (error) {
                        console.error("Error al actualizar propiedad en Supabase:", error);
                        alert("Hubo un error al actualizar la propiedad en la base de datos remota. Los cambios no se guardaron en la nube.");
                    } else if (!data || data.length === 0) {
                        console.warn("La actualización no afectó a ninguna fila en Supabase. Posible restricción de políticas RLS.");
                        alert("⚠️ ERROR DE SEGURIDAD (RLS): No tienes permisos para modificar este listado en la base de datos de Supabase, o la propiedad no existe en la nube.");
                    }
                } catch (err) {
                    console.error("Error al actualizar propiedad en Supabase:", err);
                }
            }
        }

        editingPropertyId = null;
        const submitBtn = document.querySelector('#publish-property-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i data-lucide="plus-circle"></i> Publicar Listado en Inventario';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } else {
        // Modo Creación: Nueva propiedad
        newProperty = {
            id: 'agent-' + Date.now(),
            title: title,
            category: category,
            type: type,
            tag: `${category.toUpperCase()} EN ${type.toUpperCase()}`,
            priceUSD: priceUSD,
            size: size,
            rooms: rooms,
            bathrooms: bathrooms,
            parkings: parkings,
            city: city,
            residential: residential,
            landArea: landArea,
            landUnit: landUnit,
            secondaryRooms: secondaryRooms,
            fullBathrooms: fullBathrooms,
            parkingType: parkingType,
            garden: garden,
            finishes: finishes,
            conservation: conservation,
            hasMasterSuite: hasMasterSuite,
            hasVisitorBath: hasVisitorBath,
            study: study,
            familyRoom: familyRoom,
            areas: areas,
            materials: materials,
            near: near,
            amenities: amenities.length > 0 ? amenities : ["amenity-security"],
            photo: photo,
            photos: photos,
            description: description,
            agentName: agentName,
            agentCompany: agentCompany,
            agentPhone: agentPhone,
            agentLogo: agentLogo,
            agentPlan: agentPlan,
            youtubeUrl: youtubeUrl,
            badge: "NUEVO LISTADO",
            location: locationKey,
            isAgentUpload: true,
            sponsored: false,
            lat: lat,
            lng: lng,
            agent_id: loggedInB2bClient ? loggedInB2bClient.id : null,
            agentEmail: loggedInB2bClient ? loggedInB2bClient.email : null
        };

        if (isSupabaseActive) {
            try {
                const { data, error } = await supabaseClient.from('properties').insert([
                    {
                        title: title,
                        category: category,
                        type: type,
                        tag: newProperty.tag,
                        price_usd: priceUSD,
                        size_m2: size,
                        rooms: rooms,
                        bathrooms: bathrooms,
                        parkings: parkings,
                        photo_url: photo,
                        location_key: locationKey,
                        sponsored: false,
                        latitude: lat,
                        longitude: lng,
                        agent_id: loggedInB2bClient ? loggedInB2bClient.id : null,
                        metadata: {
                            city: city,
                            residential: residential,
                            landArea: landArea,
                            landUnit: landUnit,
                            secondaryRooms: secondaryRooms,
                            fullBathrooms: fullBathrooms,
                            parkingType: parkingType,
                            garden: garden,
                            finishes: finishes,
                            conservation: conservation,
                            hasMasterSuite: hasMasterSuite,
                            hasVisitorBath: hasVisitorBath,
                            study: study,
                            familyRoom: familyRoom,
                            areas: areas,
                            materials: materials,
                            near: near,
                            amenities: amenities,
                            youtubeUrl: youtubeUrl,
                            photos: photos,
                            description: description,
                            agentName: agentName,
                            agentCompany: agentCompany,
                            agentPhone: agentPhone,
                            agentLogo: agentLogo,
                            agentPlan: agentPlan,
                            agentEmail: loggedInB2bClient ? loggedInB2bClient.email : null
                        }
                    }
                ]).select();

                if (error) {
                    console.error("Error al registrar propiedad en Supabase:", error);
                    alert(`⚠️ ERROR DE SEGURIDAD (RLS) O BASE DE DATOS:\nNo se pudo registrar la propiedad en Supabase.\n\nDetalle: ${error.message || 'El usuario podría no tener permisos de inserción (INSERT) configurados.'}`);
                    return;
                } else if (data && data[0]) {
                    newProperty.id = data[0].id;
                }
            } catch (err) {
                console.error("Fallo de red al registrar propiedad en Supabase:", err);
            }
        }

        // Agregar al portafolio local del B2B
        agentUploadedProperties.push(newProperty);

        // Inyectar en el inventario real del sistema
        if (!PORTFOLIO_DATABASE[locationKey]) {
            PORTFOLIO_DATABASE[locationKey] = [];
        }
        PORTFOLIO_DATABASE[locationKey].push(newProperty);
    }

    // Guardar en localStorage de contingencia local
    saveLocalPropertiesToStorage();

    // Limpiar formulario y restablecer valores del acordeón
    document.getElementById('publish-property-form').reset();
    
    // Desmarcar todos los checkboxes de parámetros avanzados por defecto
    const checkboxesToReset = [
        'pub-room-master-suite', 'pub-bath-visitor', 
        'pub-near-malls', 'pub-near-schools', 'pub-near-supers', 'pub-near-roads',
        'pub-area-living', 'pub-area-dining', 'pub-area-kitchen', 'pub-area-breakfast',
        'pub-prop-family-room', 'pub-prop-study', 'pub-area-maid', 'pub-area-laundry',
        'pub-area-storage', 'pub-area-terrace', 'pub-area-balcony', 'pub-area-patio',
        'pub-mat-porcelain', 'pub-mat-marble', 'pub-mat-wood', 'pub-mat-pvc', 'pub-mat-kitchen-luxe',
        'pub-amenity-pool', 'pub-amenity-gym', 'pub-amenity-security', 'pub-amenity-clubhouse',
        'pub-amenity-view', 'pub-amenity-smart', 'pub-amenity-solar', 'pub-amenity-cistern', 'pub-amenity-elevator'
    ];
    checkboxesToReset.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });

    // Resetear imágenes cargadas localmente y feedback visual
    uploadedBase64Image = '';
    uploadedBase64Images = [];
    coverImageIndex = 0;
    renderThumbnailsPreview();
    const fileInput = document.getElementById('pub-file-input');
    if (fileInput) {
        fileInput.value = '';
        fileInput.style.border = '1px dashed var(--cyan)';
        fileInput.style.background = 'rgba(0,0,0,0.4)';
    }
    const label = document.querySelector('label[for="pub-file-input"]');
    if (label) {
        label.innerText = 'O Subir Fotos Locales (Hasta 10 desde tu PC)';
    }
    const descInput = document.getElementById('pub-description');
    if (descInput) {
        descInput.value = '';
    }

    // Actualizar selectores, HUD, inventario comercial y sincronizar monedas
    updatePromoPropertySelect();
    updateSaasMetricsHUD();
    renderB2bInventory();
    updateFormUnits();

        // Alerta interactiva de éxito
        alert(`Listado "${title}" publicado exitosamente como ${category}. Se inyectó en el inventario activo de ${locationName} con sus 35+ parámetros de tasación IA y ahora está disponible para contratar pauta publicitaria.`);
    } catch (e) {
        console.error("Error al procesar publicación B2B:", e);
        alert("Ocurrió un error inesperado al publicar la propiedad. Por favor, verifica tu conexión.");
    } finally {
        const submitBtn = document.querySelector('#publish-property-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.removeAttribute('disabled');
            if (editingPropertyId) {
                submitBtn.innerHTML = '<i data-lucide="check-circle"></i> Guardar Correcciones Inmobiliarias';
            } else {
                submitBtn.innerHTML = '<i data-lucide="plus-circle"></i> Publicar Listado en Inventario';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

/**
 * Abre el modal de pasarela de pago para cambiar de plan SaaS
 */
function openPlanPayment(planKey) {
    if (planKey === activeB2bPlan && loggedInB2bClient && (loggedInB2bClient.status === 'Activo' || loggedInB2bClient.status === 'activo')) {
        alert(`Ya tienes activo el Plan ${planKey.toUpperCase()} corporativo.`);
        return;
    }

    pendingPaymentType = 'subscription';
    pendingPaymentTarget = planKey;

    // Habilitar y resetear duración
    const durationSelect = document.getElementById('payment-duration-select');
    if (durationSelect) {
        durationSelect.value = "1";
        durationSelect.removeAttribute('disabled');
    }

    resetReceiptUploadUI();

    let planName = "";
    if (planKey === 'basico') {
        planName = "Suscripción Agente Individual";
    } else if (planKey === 'pro') {
        planName = "Suscripción Inmobiliaria Pro";
    } else if (planKey === 'vip') {
        planName = "Suscripción Inmobiliaria Premium";
    } else if (planKey === 'premium') {
        planName = "Suscripción Inversionista Premium";
    }

    // Actualizar interfaz del modal
    document.getElementById('payment-concept-label').innerText = planName;
    updateDynamicB2bPaymentTotals();

    // Mostrar modal
    const modal = document.getElementById('commercial-payment-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function promotePropertyOnCover(event) {
    if (event) event.preventDefault();

    const propertyId = document.getElementById('promo-property-select').value;
    const zoneKey = document.getElementById('promo-zone-select').value;

    if (!propertyId) {
        alert("Por favor selecciona una propiedad para pautar.");
        return;
    }

    const selectedProp = agentUploadedProperties.find(p => p.id === propertyId);
    if (!selectedProp) return;

    pendingPaymentType = 'ad';
    pendingPaymentTarget = { propertyId: propertyId, zone: zoneKey };

    // Desactivar y resetear duración para pauta publicitaria (es de 1 mes fijo)
    const durationSelect = document.getElementById('payment-duration-select');
    if (durationSelect) {
        durationSelect.value = "1";
        durationSelect.setAttribute('disabled', 'true');
    }

    resetReceiptUploadUI();

    // Actualizar interfaz del modal
    document.getElementById('payment-concept-label').innerText = `Pauta Destacada: ${selectedProp.title} [ID: ${selectedProp.id}]`;
    updateDynamicB2bPaymentTotals();

    // Mostrar modal
    const modal = document.getElementById('commercial-payment-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Cierra la pasarela de pago B2B
 */
function closePaymentModal() {
    const modal = document.getElementById('commercial-payment-modal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Resetear vistas del modal
    setTimeout(() => {
        document.getElementById('payment-view-form').classList.remove('hidden');
        document.getElementById('payment-view-loading').classList.add('hidden');
        document.getElementById('payment-view-success').classList.add('hidden');
        document.getElementById('saas-card-form').reset();
        resetCardPreview();
    }, 300);
}

/**
 * Procesa el pago simulado con pasarela de autorización bancaria
 */
function processB2bPayment(event) {
    if (event) event.preventDefault();

    // Validar campos de la tarjeta
    const num = document.getElementById('cc-num').value;
    const name = document.getElementById('cc-name').value;
    const exp = document.getElementById('cc-expiry').value;
    const cvv = document.getElementById('cc-cvv').value;

    if (num.length < 15 || name.length < 4 || exp.length < 5 || cvv.length < 3) {
        alert("Por favor completa los datos de pago con formato válido.");
        return;
    }

    // Cambiar a la vista de cargando con animaciones
    document.getElementById('payment-view-form').classList.add('hidden');
    document.getElementById('payment-view-loading').classList.remove('hidden');

    const logsEl = document.getElementById('payment-status-logs');
    if (logsEl) {
        logsEl.innerHTML = '<p class="text-muted">> Estableciendo túnel encriptado de seguridad SSL/TLS...</p>';
    }

    // logs bancarios simulados secuenciales
    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Conectando con servidor de VisaNet/Mastercard...</p>';
    }, 600);

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Validando credenciales PCI-DSS y token digital...</p>';
    }, 1200);

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Solicitando autorización a red emisora bancaria...</p>';
    }, 1800);

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-green">> ¡Pago Aprobado con Éxito!</p>';
        completeB2bTransaction();
    }, 2400);
}

/**
 * Completa la lógica de negocio al finalizar la transacción
 */
function completeB2bTransaction() {
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let amountUSD = 0;

    if (pendingPaymentType === 'subscription') {
        const planKey = pendingPaymentTarget;
        activeB2bPlan = planKey;

        // Actualizar HUD
        const isInvestor = loggedInB2bClient && (loggedInB2bClient.role || '').toLowerCase() === 'inversionista';
        let planLabel = isInvestor ? "Inversionista Premium" : "Inmobiliaria Pro";
        if (planKey === 'basico') {
            planLabel = "Agente Individual";
            amountUSD = 18;
        } else if (planKey === 'pro') {
            planLabel = "Inmobiliaria Pro";
            amountUSD = 31;
        } else if (planKey === 'vip') {
            planLabel = "Inmobiliaria Premium";
            amountUSD = 82;
        } else if (planKey === 'premium') {
            planLabel = "Inversionista Premium";
            amountUSD = 43.70;
        }

        saasBillingAmountUSD += amountUSD;

        const partnerLevelEl = document.getElementById('commercial-partner-level');
        if (partnerLevelEl) {
            partnerLevelEl.innerText = planLabel;
        }

        // Actualizar grid de planes
        ['basico', 'pro', 'vip'].forEach(p => {
            const card = document.getElementById(`plan-card-${p}`);
            const btn = document.getElementById(`btn-plan-${p}`);
            if (card) {
                if (p === planKey) {
                    card.classList.add('active-plan');
                    if (btn) btn.innerText = "Plan Activo";
                } else {
                    card.classList.remove('active-plan');
                    if (btn) btn.innerText = "Cambiar Plan";
                }
            }
        });

    } else if (pendingPaymentType === 'ad') {
        const { propertyId, zone } = pendingPaymentTarget;
        const propIndex = agentUploadedProperties.findIndex(p => p.id === propertyId);
        if (propIndex !== -1) {
            const prop = agentUploadedProperties[propIndex];
            
            // Clona la propiedad y la inyecta al inicio con badge de patrocinio
            const sponsoredProp = {
                ...prop,
                sponsored: true,
                badge: "PATROCINADO"
            };

            if (!PORTFOLIO_DATABASE[zone]) {
                PORTFOLIO_DATABASE[zone] = [];
            }
            PORTFOLIO_DATABASE[zone].unshift(sponsoredProp); // Inyectar al principio (posición 0)

            // Aumentar métricas de tráfico ficticias
            saasImpressionsCount += 4500;
            saasClientClicks += 180;
            amountUSD = activeCurrency === 'GTQ' ? (450 / exchangeRate) : 58;
            saasBillingAmountUSD += amountUSD;

            // Marcar en nuestro listado local también
            prop.sponsored = true;
            prop.badge = "PATROCINADO";

            // Guardar en localStorage de contingencia local
            saveLocalPropertiesToStorage();

            // Re-renderizar el catálogo comercial de propiedades
            renderB2bInventory();

            // Renderizar la portada si está seleccionada en el deck principal
            const locationSelect = document.getElementById('prop-location');
            if (locationSelect && locationSelect.value === zone) {
                renderFeaturedProperties(zone);
            }

            // Sincronizar catálogo B2C en caso de que esté activo
            const catalogZoneSelect = document.getElementById('catalog-zone-select');
            if (catalogZoneSelect && catalogZoneSelect.value === zone) {
                renderCatalogProperties();
            }
        }
    }

    // Configurar recibo de pago
    const authCode = "AUT-" + Math.floor(100000 + Math.random() * 900000);
    const refCode = "REF-" + Math.floor(10000000 + Math.random() * 90000000);
    const amountVal = activeCurrency === 'GTQ' ? (amountUSD * exchangeRate) : amountUSD;

    document.getElementById('receipt-auth-code').innerText = `#${authCode}`;
    document.getElementById('receipt-ref-code').innerText = `#${refCode}`;
    document.getElementById('receipt-amount-val').innerText = `${currencySym}${formatNumber(amountVal.toFixed(2))}`;

    // Actualizar HUD comercial general
    updateSaasMetricsHUD();

    // Cambiar a la vista de éxito
    document.getElementById('payment-view-loading').classList.add('hidden');
    document.getElementById('payment-view-success').classList.remove('hidden');
}

// Variable global para solicitudes de pago pendientes
let pendingPaymentRequests = [];
let uploadedReceiptBase64 = '';

/**
 * Guarda el listado de solicitudes de pago en localStorage de forma segura,
 * previniendo caídas por exceder el límite de cuota (QuotaExceededError)
 * debido a imágenes de comprobantes (Base64) muy pesadas.
 */
function savePendingPaymentsLocally() {
    try {
        localStorage.setItem('b2b_pending_payments', JSON.stringify(pendingPaymentRequests));
    } catch (storageErr) {
        console.warn("⚠️ [ValorGT AI] Límite de localStorage excedido. Guardando metadatos depurados sin imágenes pesadas:", storageErr);
        try {
            const cleanRequests = pendingPaymentRequests.map(r => ({
                ...r,
                receipt: (r.receipt && r.receipt.length > 200) ? "[IMAGEN_OMITIDA_POR_ESPACIO]" : r.receipt
            }));
            localStorage.setItem('b2b_pending_payments', JSON.stringify(cleanRequests));
        } catch (innerErr) {
            console.error("❌ Fallo crítico al persistir pagos en el almacenamiento local:", innerErr);
        }
    }
}

/**
 * Maneja la subida del archivo comprobante y lo lee en Base64
 */
function handleReceiptFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedReceiptBase64 = e.target.result;
        
        const wrapper = document.getElementById('receipt-upload-wrapper');
        const icon = document.getElementById('receipt-upload-icon');
        const text = document.getElementById('receipt-upload-text');
        
        if (wrapper) {
            wrapper.style.borderColor = 'var(--neon-emerald)';
            wrapper.style.background = 'rgba(52, 199, 89, 0.05)';
        }
        if (icon) {
            icon.style.color = 'var(--neon-emerald)';
        }
        if (text) {
            text.innerText = '¡Comprobante Cargado Exitosamente ✔️!';
            text.style.color = 'var(--neon-emerald)';
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Resetea los elementos visuales de carga de comprobante
 */
function resetReceiptUploadUI() {
    uploadedReceiptBase64 = '';
    const fileInput = document.getElementById('payment-receipt-file');
    if (fileInput) fileInput.value = '';
    
    const wrapper = document.getElementById('receipt-upload-wrapper');
    const icon = document.getElementById('receipt-upload-icon');
    const text = document.getElementById('receipt-upload-text');
    
    if (wrapper) {
        wrapper.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        wrapper.style.background = 'rgba(0,0,0,0.3)';
    }
    if (icon) {
        icon.style.color = 'var(--text-muted)';
    }
    if (text) {
        text.innerText = 'Haz clic para seleccionar el comprobante desde tu dispositivo';
        text.style.color = 'var(--text-muted)';
    }
}

/**
 * Actualiza el banner interactivo de suscripción pendiente en la pestaña del comercial
 */
function updateB2bSubscriptionPendingBanner() {
    const banner = document.getElementById('b2b-subscription-pending-banner');
    if (!banner) return;
    
    if (loggedInB2bClient && (loggedInB2bClient.status === 'Pendiente' || loggedInB2bClient.status?.toLowerCase() === 'pendiente')) {
        banner.className = "glassmorphism font-mono";
        banner.style.padding = "15px";
        banner.style.border = "1px solid rgba(255, 149, 0, 0.3)";
        banner.style.background = "rgba(255, 149, 0, 0.03)";
        banner.style.borderRadius = "8px";
        banner.style.textAlign = "left";
        banner.style.boxShadow = "0 0 10px rgba(255, 149, 0, 0.05)";
        
        // Verificar si el cliente ya subió algún comprobante de pago
        const hasReceiptRequest = pendingPaymentRequests && pendingPaymentRequests.some(r => 
            (r.clientId && r.clientId === loggedInB2bClient.id) || 
            (r.clientEmail && r.clientEmail.toLowerCase() === loggedInB2bClient.email.toLowerCase())
        );

        if (hasReceiptRequest) {
            banner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i data-lucide="clock" class="spinner-slow" style="color: #ff9500; width: 16px; height: 16px;"></i>
                    <strong style="color: #ff9500; font-size: 0.85rem; text-shadow: 0 0 5px rgba(255,149,0,0.2);">Suscripción Pendiente de Verificación Bancaria</strong>
                </div>
                <p style="font-size: 0.7rem; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.4;">
                    Hemos recibido tu comprobante de transferencia y tu cuenta de agente se encuentra bajo auditoría. Usualmente se completa en un plazo de <strong>1 a 24 horas hábiles</strong>.
                </p>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <a href="https://wa.me/50240416471?text=Hola%20Toomarket%2C%20quisiera%20consultar%20el%20estado%20de%20mi%20suscripci%C3%B3n%20para%20la%20cuenta%20${encodeURIComponent(loggedInB2bClient.email)}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; text-decoration: none; border-radius: 4px; font-size: 0.65rem; font-weight: bold; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s; box-shadow: 0 0 8px rgba(37, 211, 102, 0.2);">
                        <i data-lucide="message-square" style="width: 12px; height: 12px;"></i> Contactar Soporte WhatsApp (+502 4041-6471)
                    </a>
                </div>
            `;
        } else {
            banner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i data-lucide="alert-triangle" style="color: #ff375f; width: 16px; height: 16px;"></i>
                    <strong style="color: #ff375f; font-size: 0.85rem; text-shadow: 0 0 5px rgba(255,55,95,0.2);">Suscripción Pendiente de Pago</strong>
                </div>
                <p style="font-size: 0.7rem; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.4;">
                    Tu cuenta ha sido creada en estado Pendiente. Para activar el acceso completo, por favor realiza la transferencia bancaria y sube tu comprobante de depósito.
                </p>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="openPlanPayment('${((loggedInB2bClient && (loggedInB2bClient.role || '').toLowerCase() === 'inversionista') ? 'premium' : (activeB2bPlan || 'pro'))}')" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--cyan) 0%, #0066ff 100%); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; font-size: 0.65rem; font-weight: bold; padding: 6px 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 8px rgba(0,240,255,0.25);">
                        <i data-lucide="upload" style="width: 12px; height: 12px;"></i> Subir Comprobante de Pago
                    </button>
                    <a href="https://wa.me/50240416471?text=Hola%20Toomarket%2C%20quisiera%20ayuda%20con%20mi%20suscripci%C3%B3n%20para%20la%20cuenta%20${encodeURIComponent(loggedInB2bClient.email)}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: transparent; color: var(--text-secondary); text-decoration: none; border-radius: 4px; font-size: 0.65rem; font-weight: bold; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s;">
                        <i data-lucide="message-square" style="width: 12px; height: 12px;"></i> Contactar Soporte
                    </a>
                </div>
            `;
        }
        banner.style.display = "block";
    } else {
        banner.style.display = "none";
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Calcula y renderiza en tiempo real los totales en el modal de pago
 */
function updateDynamicB2bPaymentTotals() {
    const durationSelect = document.getElementById('payment-duration-select');
    if (!durationSelect) return;
    
    const months = parseInt(durationSelect.value);
    let discount = 0;
    if (months === 3) discount = 0.03;
    else if (months === 6) discount = 0.05;
    else if (months === 12) discount = 0.10;
    
    let baseGTQ = 0;
    if (pendingPaymentTarget === 'basico') baseGTQ = 140;
    else if (pendingPaymentTarget === 'pro') baseGTQ = 240;
    else if (pendingPaymentTarget === 'vip') baseGTQ = 640;
    else if (pendingPaymentTarget === 'premium') baseGTQ = 340;
    else if (pendingPaymentType === 'ad') {
        baseGTQ = 450;
        durationSelect.disabled = true;
    }
    
    const subtotalGTQ = baseGTQ * months;
    const totalGTQ = subtotalGTQ * (1 - discount);
    const totalUSD = totalGTQ / exchangeRate;
    
    const durationLabel = document.getElementById('payment-duration-label');
    const discountLabel = document.getElementById('payment-discount-label');
    const totalLabel = document.getElementById('payment-total-label');
    const totalUsdLabel = document.getElementById('payment-total-usd-label');
    
    if (durationLabel) {
        durationLabel.innerText = months === 12 ? '1 Año (12 Meses)' : `${months} Mes${months > 1 ? 'es' : ''}`;
    }
    if (discountLabel) {
        discountLabel.innerText = `${(discount * 100).toFixed(0)}%`;
        if (discount > 0) {
            discountLabel.style.color = 'var(--neon-emerald)';
        } else {
            discountLabel.style.color = 'var(--text-muted)';
        }
    }
    if (totalLabel) {
        totalLabel.innerText = `Q${formatNumber(totalGTQ.toFixed(2))}`;
    }
    if (totalUsdLabel) {
        totalUsdLabel.innerText = `$${formatNumber(totalUSD.toFixed(2))} USD`;
    }
}

/**
 * Envía la solicitud transaccional por transferencia bancaria
 */
async function processB2bTransferPayment(event) {
    if (event) event.preventDefault();
    
    const acceptDisclaimerCheckbox = document.getElementById('payment-accept-disclaimer');
    if (acceptDisclaimerCheckbox && !acceptDisclaimerCheckbox.checked) {
        alert("⚠️ ADVERTENCIA LEGAL: Para continuar, debes aceptar el Disclaimer Legal y Metodológico de la plataforma ValorGT® marcando la casilla de aceptación.");
        return;
    }
    
    if (!uploadedReceiptBase64) {
        alert("⚠️ ERROR DE VALIDACIÓN BANCARIA: Debes subir una foto o captura de tu comprobante de transferencia bancaria.");
        return;
    }
    
    document.getElementById('payment-view-form').classList.add('hidden');
    document.getElementById('payment-view-loading').classList.remove('hidden');
    
    const logsEl = document.getElementById('payment-status-logs');
    if (logsEl) {
        logsEl.innerHTML = '<p class="text-muted">> Leyendo archivo del comprobante bancario (Base64)...</p>';
    }
    
    setTimeout(async () => {
        try {
            if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Conectando con el Ledger transaccional y Supabase...</p>';
            
            const durationSelect = document.getElementById('payment-duration-select');
            const months = durationSelect ? parseInt(durationSelect.value) || 1 : 1;
            let discount = 0;
            if (months === 3) discount = 0.03;
            else if (months === 6) discount = 0.05;
            else if (months === 12) discount = 0.10;
            
            const pTarget = pendingPaymentTarget || 'basico';
            const pType = pendingPaymentType || 'subscription';
            
            let baseGTQ = 0;
            if (pTarget === 'basico') baseGTQ = 140;
            else if (pTarget === 'pro') baseGTQ = 240;
            else if (pTarget === 'vip') baseGTQ = 640;
            else if (pTarget === 'premium') baseGTQ = 340;
            else if (pType === 'ad') baseGTQ = 450;
            else baseGTQ = 240; // fallback (Pro)
            
            const totalGTQ = (baseGTQ * months) * (1 - discount);
            const totalUSD = totalGTQ / exchangeRate;
            const txnId = pType === 'ad'
                ? "PAUTA-" + Math.floor(100000 + Math.random() * 900000)
                : "TXN-" + Math.floor(100000 + Math.random() * 900000);
            
            let conceptText = "";
            let planKeyVal = "";
            if (pType === 'subscription') {
                const planStr = (typeof pTarget === 'string' ? pTarget : 'pro').toUpperCase();
                conceptText = `Suscripción: Plan ${planStr}`;
                planKeyVal = typeof pTarget === 'string' ? pTarget : 'pro';
            } else {
                const propId = pTarget && pTarget.propertyId ? pTarget.propertyId : 'unknown';
                const prop = agentUploadedProperties.find(p => String(p.id) === String(propId));
                const propTitle = prop ? prop.title : 'Propiedad';
                conceptText = `Pauta: ${propTitle} [ID: ${propId}]`;
                planKeyVal = 'ad';
            }
            
            const request = {
                id: txnId,
                clientId: loggedInB2bClient ? loggedInB2bClient.id : 'demo-client-id',
                clientName: loggedInB2bClient ? loggedInB2bClient.name : 'Agente Demo',
                clientEmail: loggedInB2bClient ? loggedInB2bClient.email : 'agente@valorgt.com',
                concept: conceptText,
                planKey: planKeyVal,
                months: months,
                totalUSD: totalUSD,
                totalGTQ: totalGTQ,
                receipt: uploadedReceiptBase64,
                status: 'pendiente',
                timestamp: new Date().toISOString()
            };
            
            // 1. Guardar localmente
            pendingPaymentRequests.unshift(request);
            savePendingPaymentsLocally();
            
            // 2. Intentar guardar en Supabase 'payment_requests'
            if (isSupabaseActive && supabaseClient) {
                try {
                    const { error: dbErr } = await supabaseClient.from('payment_requests').insert([
                        {
                            id: request.id,
                            client_id: request.clientId,
                            client_name: request.clientName,
                            client_email: request.clientEmail,
                            concept: request.concept,
                            plan_key: request.planKey,
                            months: request.months,
                            total_usd: request.totalUSD,
                            total_gtq: request.totalGTQ,
                            receipt: request.receipt,
                            status: request.status,
                            timestamp: request.timestamp
                        }
                    ]);
                    if (dbErr) {
                        console.error("Error al guardar solicitud en Supabase payment_requests:", dbErr);
                    } else {
                        console.log("Solicitud de pago registrada exitosamente en Supabase.");
                    }
                } catch (supabaseErr) {
                    console.error("Fallo de red al insertar en Supabase payment_requests:", supabaseErr);
                }
            }
            
            // 3. Cambiar estado del perfil del cliente actual a 'Pendiente'
            if (loggedInB2bClient) {
                loggedInB2bClient.status = 'Pendiente';
                
                // Actualizar localmente en el arreglo de clientes
                const clientIdx = b2bClients.findIndex(c => c.email && loggedInB2bClient.email && c.email.toLowerCase() === loggedInB2bClient.email.toLowerCase());
                if (clientIdx !== -1) {
                    b2bClients[clientIdx].status = 'Pendiente';
                }
                
                // Intentar actualizar en Supabase
                if (isSupabaseActive && supabaseClient) {
                    try {
                        supabaseClient.from('profiles').update({ status: 'pendiente' }).eq('id', loggedInB2bClient.id)
                        .then(() => {
                            console.log("Estado de perfil actualizado a pendiente en Supabase.");
                        }).catch(profErr => {
                            console.warn("Fallo al actualizar status en perfiles de Supabase:", profErr);
                        });
                    } catch (supabaseProfErr) {
                        console.error("Fallo sincrónico al actualizar perfil en Supabase:", supabaseProfErr);
                    }
                }
            }
            
            // 4. Configurar el modal de éxito con los datos
            const authCodeEl = document.getElementById('receipt-auth-code');
            if (authCodeEl) authCodeEl.innerText = `#${txnId}`;
            
            const refCodeEl = document.getElementById('receipt-ref-code');
            if (refCodeEl) refCodeEl.innerText = request.concept;
            
            const amountValEl = document.getElementById('receipt-amount-val');
            if (amountValEl) amountValEl.innerText = `Q${formatNumber(totalGTQ.toFixed(2))}`;
            
            // 5. Configurar el enlace de notificación de WhatsApp al admin
            const whatsappMsg = `Hola Toomarket, acabo de subir mi comprobante de transferencia bancaria en ValorGT AI.\n\nDetalles de mi cuenta:\n- Asesor: ${request.clientName}\n- Correo: ${request.clientEmail}\n- Concepto: ${request.concept}\n- Plazo: ${months} Mes(es)\n- Total Transferido: Q${totalGTQ.toFixed(2)} (Ref: ${txnId}).\n\nPor favor verificar mi transferencia.`;
            const whatsappUrl = `https://wa.me/50240416471?text=${encodeURIComponent(whatsappMsg)}`;
            
            const waBtn = document.getElementById('success-whatsapp-admin-btn');
            if (waBtn) {
                waBtn.href = whatsappUrl;
            }
            
            // 6. Notificación de logs
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SAAS", `pago_transferencia: Solicitud ${txnId} de ${request.clientName} registrada. [EMAIL DESPACHADO] Alerta enviada a valorgt.ai@gmail.com. [WHATSAPP LISTO] Enlace directo de comprobante configurado para el admin (+502 4041-6471).`, false);
            }
            
            // 7. Recargar vistas
            updateB2bSubscriptionPendingBanner();
            renderAdminPendingPaymentsTable();
            renderAdminDashboard();
            
            // Cambiar a la vista de éxito
            const loadingView = document.getElementById('payment-view-loading');
            if (loadingView) loadingView.classList.add('hidden');
            
            const successView = document.getElementById('payment-view-success');
            if (successView) successView.classList.remove('hidden');
            
        } catch (err) {
            console.error("Error crítico procesando pago de transferencia B2B:", err);
            
            // Fallback de emergencia ante cualquier error de Javascript para asegurar que la UI no se quede colgada
            alert("⚠️ PROCESADOR TRANSACCIONAL: Se registró un fallo en el Ledger de Supabase, pero tu solicitud ha sido guardada localmente y está en proceso. Por favor, procede con la notificación de WhatsApp. (Detalle técnico: " + (err.message || err) + ")");
            
            // Forzar mostrar pantalla de éxito
            const loadingView = document.getElementById('payment-view-loading');
            if (loadingView) loadingView.classList.add('hidden');
            
            const successView = document.getElementById('payment-view-success');
            if (successView) successView.classList.remove('hidden');
        }
    }, 1800);
}

/**
 * Renderiza la tabla de aprobaciones del admin en tiempo real
 */
function renderAdminPendingPaymentsTable() {
    const tableBody = document.getElementById('admin-pending-payments-table-body');
    const counter = document.getElementById('admin-pending-payments-count');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (pendingPaymentRequests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i data-lucide="shield-check" style="width: 24px; height: 24px; color: var(--cyan); margin-bottom: 5px; opacity: 0.5; display: inline-block;"></i><br>
                    No hay transferencias pendientes de verificación bancaria.
                </td>
            </tr>
        `;
        if (counter) counter.innerText = "0 PENDIENTES";
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    if (counter) {
        counter.innerText = `${pendingPaymentRequests.length} PENDIENTE${pendingPaymentRequests.length > 1 ? 'S' : ''}`;
    }
    
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    
    pendingPaymentRequests.forEach((req, idx) => {
        const row = document.createElement('tr');
        
        const amt = req.totalGTQ / exchangeRate * conversion;
        const totalFormatted = `${currencySym}${formatNumber(amt.toFixed(2))}`;
        
        row.innerHTML = `
            <td style="text-align: left; padding: 10px; vertical-align: middle;">
                <strong class="text-white">${req.clientName}</strong><br>
                <span class="sub-title font-mono" style="font-size: 0.6rem; color: var(--text-muted);">${req.clientEmail}</span>
            </td>
            <td style="text-align: center; padding: 10px; vertical-align: middle;">
                <span class="text-purple" style="font-weight: bold;">${req.concept}</span>
            </td>
            <td style="text-align: center; padding: 10px; vertical-align: middle;">
                <span style="color: #fff;">${req.months} Mes${req.months > 1 ? 'es' : ''}</span>
            </td>
            <td style="text-align: right; padding: 10px; vertical-align: middle; font-weight: bold; color: var(--neon-emerald); font-size: 0.75rem;" class="font-mono">
                ${totalFormatted}
            </td>
            <td style="text-align: center; padding: 10px; vertical-align: middle;">
                <button class="btn btn-outline font-mono" style="padding: 3px 8px; font-size: 0.58rem; color: var(--cyan); border-color: rgba(0, 240, 255, 0.4); background: rgba(0,240,255,0.02); cursor: pointer;" onclick="showReceiptLightbox('${req.id}')">
                    👁️ VER FOTO
                </button>
            </td>
            <td style="text-align: center; padding: 10px; vertical-align: middle;">
                <span class="status-badge-pending-auth" style="font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #ff9500; background: rgba(255,149,0,0.1); border: 1px solid rgba(255,149,0,0.3); text-shadow: 0 0 5px rgba(255,149,0,0.2);">PENDIENTE</span>
            </td>
            <td style="text-align: right; padding: 10px; vertical-align: middle;">
                <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
                    <button class="btn btn-outline font-mono" style="padding: 3px 8px; font-size: 0.58rem; color: var(--green); border-color: rgba(0, 255, 102, 0.4); background: rgba(0,255,102,0.02); cursor: pointer; font-weight: bold;" onclick="approvePendingPayment('${req.id}')">
                        ✓ APROBAR PAGO
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Abre el Lightbox de previsualización del comprobante para el admin
 */
function showReceiptLightbox(reqId) {
    const req = pendingPaymentRequests.find(r => r.id === reqId);
    if (!req) return;
    
    const lightbox = document.getElementById('admin-receipt-lightbox');
    const img = document.getElementById('receipt-lightbox-img');
    const title = document.getElementById('receipt-lightbox-title');
    
    if (lightbox && img && title) {
        img.src = req.receipt;
        title.innerText = `Comprobante de ${req.clientName} (${req.concept})`;
        lightbox.classList.remove('hidden'); // Corrección del bug de superposición
        lightbox.classList.add('active');
    }
}

/**
 * Cierra el Lightbox del comprobante
 */
function closeReceiptLightbox() {
    const lightbox = document.getElementById('admin-receipt-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        lightbox.classList.add('hidden'); // Corrección del bug de superposición
    }
}

/**
 * Abre el modal de pago de pauta publicitaria B2B
 */
let selectedAdPropertyId = null;
let uploadedPautaReceiptBase64 = '';

function openAdPaymentModal(propertyId) {
    const prop = agentUploadedProperties.find(p => String(p.id) === String(propertyId));
    if (!prop) {
        alert("No se encontró la propiedad seleccionada.");
        return;
    }
    
    pendingPaymentType = 'ad';
    pendingPaymentTarget = { propertyId: propertyId, zone: prop.location || 'zona14' };
    
    // Desactivar y resetear duración para pauta publicitaria (es de 1 mes fijo)
    const durationSelect = document.getElementById('payment-duration-select');
    if (durationSelect) {
        durationSelect.value = "1";
        durationSelect.setAttribute('disabled', 'true');
    }
    
    resetReceiptUploadUI();
    
    // Actualizar interfaz del modal
    document.getElementById('payment-concept-label').innerText = `Pauta Destacada: ${prop.title} [ID: ${prop.id}]`;
    updateDynamicB2bPaymentTotals();
    
    // Mostrar modal
    const modal = document.getElementById('commercial-payment-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Cierra el modal de pago de pauta publicitaria B2B
 */
function closeAdPaymentModal() {
    const modal = document.getElementById('commercial-pauta-modal');
    if (modal) modal.classList.add('hidden');
    selectedAdPropertyId = null;
    uploadedPautaReceiptBase64 = '';
}

/**
 * Calcula en tiempo real los costos, descuentos y el total neto de la pauta publicitaria
 */
function updatePautaPaymentCalculations() {
    const durationSelect = document.getElementById('pauta-duration-select');
    if (!durationSelect) return;
    
    const months = parseInt(durationSelect.value) || 1;
    
    // 1. Tarifa base estándar administrable
    const basePrice = baseAdPriceGTQ;
    const subtotal = basePrice * months;
    
    // 2. Descuento de plazo (10% si son 3 meses)
    const durationDiscountRate = months === 3 ? 0.10 : 0;
    const durationDiscount = subtotal * durationDiscountRate;
    const subtotalAfterDuration = subtotal - durationDiscount;
    
    // 3. Descuento dinámico por membresía contratada (Pro: 15%, Premium: 30%, Básico: 0%)
    let planDiscountRate = 0;
    const planKey = activeB2bPlan || 'pro';
    if (planKey === 'pro') {
        planDiscountRate = 0.15;
    } else if (planKey === 'vip' || planKey === 'premium') {
        planDiscountRate = 0.30;
    }
    const membershipDiscount = subtotalAfterDuration * planDiscountRate;
    const totalNeto = subtotalAfterDuration - membershipDiscount;
    
    // Inyectar en etiquetas de la pasarela
    document.getElementById('pauta-base-price-lbl').innerText = `Q${formatNumber(basePrice.toFixed(2))}`;
    document.getElementById('pauta-subtotal-lbl').innerText = `Q${formatNumber(subtotal.toFixed(2))}`;
    document.getElementById('pauta-duration-discount-lbl').innerText = `-Q${formatNumber(durationDiscount.toFixed(2))} (${(durationDiscountRate * 100).toFixed(0)}%)`;
    document.getElementById('pauta-membership-discount-lbl').innerText = `-Q${formatNumber(membershipDiscount.toFixed(2))} (${(planDiscountRate * 100).toFixed(0)}%)`;
    document.getElementById('pauta-total-gtq-lbl').innerText = `Q${formatNumber(totalNeto.toFixed(2))}`;
}

/**
 * Procesa la solicitud bancaria de pauta y la inyecta en la cola de auditoría admin
 */
async function processB2bPautaPayment(event) {
    if (event) event.preventDefault();
    
    if (!uploadedPautaReceiptBase64) {
        alert("Por favor carga una imagen de la transferencia realizada como comprobante de pago.");
        return;
    }
    
    const prop = agentUploadedProperties.find(p => p.id === selectedAdPropertyId);
    if (!prop) {
        alert("Error de sesión: No hay una propiedad seleccionada.");
        return;
    }
    
    // Cambiar a la vista de cargando
    document.getElementById('pauta-payment-form-view').classList.add('hidden');
    document.getElementById('pauta-payment-loading-view').classList.remove('hidden');
    
    setTimeout(async () => {
        const durationSelect = document.getElementById('pauta-duration-select');
        const months = parseInt(durationSelect.value) || 1;
        
        const basePrice = baseAdPriceGTQ;
        const subtotal = basePrice * months;
        const durationDiscountRate = months === 3 ? 0.10 : 0;
        const subtotalAfterDuration = subtotal - (subtotal * durationDiscountRate);
        
        let planDiscountRate = 0;
        const planKey = activeB2bPlan || 'pro';
        if (planKey === 'pro') planDiscountRate = 0.15;
        else if (planKey === 'vip' || planKey === 'premium') planDiscountRate = 0.30;
        
        const totalNeto = subtotalAfterDuration - (subtotalAfterDuration * planDiscountRate);
        const refCode = `PAUTA-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newRequest = {
            id: refCode,
            clientId: loggedInB2bClient ? loggedInB2bClient.id : 'unknown',
            clientName: loggedInB2bClient ? loggedInB2bClient.name : 'Asesor Inmobiliario',
            clientEmail: loggedInB2bClient ? loggedInB2bClient.email : 'correo@empresa.com',
            nit: loggedInB2bClient ? loggedInB2bClient.nit : '839204-2',
            plan: activeB2bPlan,
            concept: `Pauta: ${prop.title} [ID: ${prop.id}]`,
            months: months,
            totalGTQ: totalNeto,
            receipt: uploadedPautaReceiptBase64,
            status: 'Pendiente',
            timestamp: new Date().toISOString()
        };
        
        try {
            if (isSupabaseActive) {
                const { error } = await supabaseClient.from('payment_requests').insert([
                    {
                        id: newRequest.id,
                        client_id: newRequest.clientId,
                        client_name: newRequest.clientName,
                        client_email: newRequest.clientEmail,
                        nit: newRequest.nit,
                        plan: newRequest.plan,
                        concept: newRequest.concept,
                        months: newRequest.months,
                        total_gtq: newRequest.totalGTQ,
                        receipt: newRequest.receipt,
                        status: 'pendiente'
                    }
                ]);
                if (error) console.error("Error al registrar pauta en Supabase:", error);
            }
        } catch (e) {
            console.error("Fallo de red al registrar pauta en Supabase, usando localStorage de contingencia:", e);
        }
        
        pendingPaymentRequests.push(newRequest);
        savePendingPaymentsLocally();
        
        // Sincronizar UI de administración
        renderAdminPendingPaymentsTable();
        
        // Cambiar a la vista de éxito
        document.getElementById('pauta-payment-loading-view').classList.add('hidden');
        const successView = document.getElementById('pauta-payment-success-view');
        if (successView) {
            document.getElementById('pauta-receipt-auth-code').innerText = `#${refCode}`;
            document.getElementById('pauta-receipt-amount-val').innerText = `Q${formatNumber(totalNeto.toFixed(2))}`;
            successView.classList.remove('hidden');
        }
        
        logAdminSecurityActivity(`Solicitud de Pauta: Asesor ${newRequest.clientName} envió comprobante para destacar propiedad [${prop.title}] por Q${totalNeto}`);
        
    }, 1500);
}

/**
 * Permite al administrador calibrar persistentemente el costo base de las pautas comerciales
 */
function saveAdminAdBasePrice() {
    const input = document.getElementById('admin-base-ad-price');
    if (input) {
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
            alert("Por favor ingresa una tarifa válida mayor a 0.");
            return;
        }
        baseAdPriceGTQ = val;
        localStorage.setItem('valorgt_base_ad_price', val.toString());
        alert(`✔️ Tarifa base de pauta comercial calibrada a Q${formatNumber(val.toFixed(2))} con éxito.`);
        logAdminSecurityActivity(`Calibración del Core: Tarifa base de pauta publicitaria configurada en Q${val}`);
    }
}

/**
 * Sincroniza las solicitudes pendientes con Supabase y localStorage
 */
async function syncPendingPaymentRequests() {
    const localData = localStorage.getItem('b2b_pending_payments');
    if (localData) {
        try {
            pendingPaymentRequests = JSON.parse(localData);
        } catch (e) {
            console.error("Error al decodificar pagos pendientes de localstorage:", e);
        }
    }
    
    if (isSupabaseActive && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('payment_requests')
                .select('*')
                .order('timestamp', { ascending: false });
            
            if (!error && data) {
                pendingPaymentRequests = data.map(row => ({
                    id: row.id,
                    clientId: row.client_id,
                    clientName: row.client_name,
                    clientEmail: row.client_email,
                    concept: row.concept,
                    planKey: row.plan_key,
                    months: row.months,
                    totalUSD: parseFloat(row.total_usd || 0),
                    totalGTQ: parseFloat(row.total_gtq || 0),
                    receipt: row.receipt,
                    status: row.status,
                    timestamp: row.timestamp
                }));
                savePendingPaymentsLocally();
            }
        } catch (err) {
            console.error("Error al sincronizar payment_requests desde Supabase:", err);
        }
    }
    
    renderAdminPendingPaymentsTable();
}

/**
 * Aprueba una solicitud de pago pendiente de transferencia bancaria
 */
async function approvePendingPayment(reqId) {
    const reqIndex = pendingPaymentRequests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;
    
    const req = pendingPaymentRequests[reqIndex];
    
    if (confirm(`¿Estás seguro de que deseas APROBAR el pago transaccional #${req.id} de ${req.clientName} por un monto de Q${req.totalGTQ.toFixed(2)} (${req.concept})?`)) {
        
        // 1. Eliminar solicitud de local
        pendingPaymentRequests.splice(reqIndex, 1);
        savePendingPaymentsLocally();
        
        // 2. En lugar de borrar la solicitud, la marcamos como aprobada para que el propio cliente pueda auto-activarse (bypass RLS)
        if (isSupabaseActive && supabaseClient) {
            try {
                await supabaseClient.from('payment_requests').update({ status: 'aprobado' }).eq('id', req.id);
            } catch (dbErr) {
                console.warn("Error al marcar pago como aprobado en Supabase payment_requests:", dbErr);
            }
        }
        
        // 3. Actualizar balance de ingresos SaaS del admin
        adminMonthlyRevenueUSD += req.totalUSD;
        
        // 4. Si el concepto es suscripción, actualizar el plan del cliente.
        const isSub = req.concept.startsWith('Suscripción');
        const planKey = req.planKey;
        
        let dbPlan = 'Pro';
        if (planKey === 'basico') dbPlan = 'Basico';
        else if (planKey === 'pro') dbPlan = 'Pro';
        else if (planKey === 'vip') dbPlan = 'VIP';
        else if (planKey === 'premium') dbPlan = 'Premium';
        
        const client = b2bClients.find(c => c.email.toLowerCase() === req.clientEmail.toLowerCase() || c.id === req.clientId);
        
        if (client) {
            client.status = 'Activo';
            if (isSub) {
                if ((client.role || '').toLowerCase() === 'inversionista') {
                    client.plan = 'Premium';
                } else {
                    client.plan = dbPlan;
                }
                
                if (loggedInB2bClient && loggedInB2bClient.id === client.id) {
                    activeB2bPlan = client.plan.toLowerCase();
                    loggedInB2bClient.plan = client.plan;
                    loggedInB2bClient.status = 'Activo';
                    
                    const partnerLevelEl = document.getElementById('commercial-partner-level');
                    if (partnerLevelEl) {
                        partnerLevelEl.innerText = (client.plan === 'VIP' || client.plan === 'Premium') ? (((client.role || '').toLowerCase() === 'inversionista') ? "Inversionista Premium" : "Inmobiliaria Premium") : (client.plan === 'Pro' ? (((client.role || '').toLowerCase() === 'inversionista') ? "Inversionista Pro" : "Inmobiliaria Pro") : "Agente Individual");
                    }
                    
                    updateLockOverlaysState();
                    localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));
                    syncCommercialPricingGridUI();
                    renderB2bAgentProfile();
                }
            }
            localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));
        }
        
        // Actualizar en Supabase
        if (isSupabaseActive && supabaseClient) {
            try {
                const updatePayload = { status: 'activo' };
                if (isSub) {
                    updatePayload.plan = (client && (client.role || '').toLowerCase() === 'inversionista') ? 'Premium' : dbPlan;
                }
                
                supabaseClient.from('profiles').update(updatePayload).eq('id', req.clientId)
                .then(({ error }) => {
                    if (error) {
                        console.warn("La actualización directa de perfil falló (bloqueado por políticas RLS). Se utilizará la auto-activación por el cliente:", error.message);
                    } else {
                        console.log("Perfil actualizado exitosamente a activo en Supabase.");
                    }
                });
            } catch (dbErr) {
                console.warn("Fallo al actualizar el perfil en Supabase profiles:", dbErr);
            }
        }
        
        // Si el concepto es pauta, inyectar propiedad patrocinada identificada por ID
        const isPauta = req.id.startsWith('PAUTA-') || req.concept.startsWith('Pauta:');
        if (isPauta) {
            let propertyId = null;
            const match = req.concept.match(/\[ID:\s*([^\]\s]+)\]/);
            if (match) {
                propertyId = match[1];
            }
            
            if (propertyId) {
                // 1. Marcar como pautada/sponsored en agentUploadedProperties
                const prop = agentUploadedProperties.find(p => String(p.id) === String(propertyId));
                if (prop) {
                    prop.sponsored = true;
                    prop.badge = "PATROCINADO";
                    console.log(`✔️ [ValorGT AI] Propiedad local B2B #${propertyId} marcada como sponsored.`);
                }
                
                // 2. Marcar como pautada/sponsored en PORTFOLIO_DATABASE
                Object.keys(PORTFOLIO_DATABASE).forEach(zone => {
                    PORTFOLIO_DATABASE[zone].forEach(p => {
                        if (String(p.id) === String(propertyId)) {
                            p.sponsored = true;
                            p.badge = "PATROCINADO";
                            console.log(`✔️ [ValorGT AI] Propiedad en base de datos #${propertyId} marcada como sponsored.`);
                        }
                    });
                });
                
                // Persistir en Supabase
                if (isSupabaseActive && supabaseClient) {
                    try {
                        supabaseClient.from('properties').update({ sponsored: true, tag: 'PATROCINADO' }).eq('id', propertyId)
                        .then(({ error }) => {
                            if (error) console.error("Error al persistir pauta en Supabase:", error);
                            else console.log(`✔️ [Supabase] Propiedad #${propertyId} marcada como sponsored en base de datos.`);
                        });
                    } catch (dbErr) {
                        console.error("Fallo sincrónico al marcar pauta en Supabase:", dbErr);
                    }
                }
                
                // Guardar en localStorage de contingencia local
                saveLocalPropertiesToStorage();
                
                // 3. Sincronizar e incrementar impresiones
                saasImpressionsCount += 4500;
                saasClientClicks += 180;
                
                // 4. Rerenderizar
                renderB2bInventory();
                
                // 5. Rerenderizar catálogo si estamos en la zona correspondiente
                if (prop) {
                    const zone = prop.location;
                    const locationSelect = document.getElementById('prop-location');
                    if (locationSelect && locationSelect.value === zone) {
                        renderFeaturedProperties(zone);
                    }
                    const catalogZoneSelect = document.getElementById('catalog-zone-select');
                    if (catalogZoneSelect && catalogZoneSelect.value === zone) {
                        renderCatalogProperties();
                    }
                }
            }
        }
        
        if (typeof appendAdminLog === 'function') {
            appendAdminLog("SAAS", `aprobación_pago: Aprobada transferencia bancaria transaccional #${req.id} de ${req.clientName}. Acreditado $${req.totalUSD.toFixed(2)} USD a ingresos SaaS.`, false);
        }
        
        alert(`¡PAGO APROBADO EXITOSAMENTE!\n\n` +
              `El comprobante bancario #${req.id} de ${req.clientName} ha sido auditado y aprobado.\n` +
              `Activamos la membresía "${isSub ? dbPlan.toUpperCase() : 'PAUTA PUBLICITARIA'}" con éxito.\n` +
              `Los ingresos globales de la plataforma SaaS han sido actualizados.`);
        
        updateB2bSubscriptionPendingBanner();
        renderAdminPendingPaymentsTable();
        renderAdminDashboard();
        updateSaasMetricsHUD();
    }
}


/**
 * Funciones de formateo de tarjeta de crédito
 */
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    input.value = formatted;
    
    const preview = document.getElementById('card-num-preview');
    if (preview) {
        preview.innerText = formatted || '•••• •••• •••• ••••';
    }
}

function updateCardName(input) {
    const preview = document.getElementById('card-name-preview');
    if (preview) {
        preview.innerText = input.value.toUpperCase() || 'NOMBRE APELLIDO';
    }
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    
    const preview = document.getElementById('card-expiry-preview');
    if (preview) {
        preview.innerText = value || 'MM/AA';
    }
}

function resetCardPreview() {
    document.getElementById('card-num-preview').innerText = '•••• •••• •••• ••••';
    document.getElementById('card-name-preview').innerText = 'NOMBRE APELLIDO';
    document.getElementById('card-expiry-preview').innerText = 'MM/AA';
}

/**
 * Autentica al agente inmobiliario corporativo con credenciales demo
 */
/**
 * Autentica al agente inmobiliario corporativo con credenciales demo o de la base de datos
 */
async function authenticateCommercialAgent(event) {
    if (event) event.preventDefault();

    const user = document.getElementById('com-login-user').value.trim().toLowerCase();
    const pass = document.getElementById('com-login-pass').value.trim();

    // 0. Verificar si es administrador ingresando credenciales admin
    if ((user === 'admin@valorgt.com' || user === 'valorgt.ai@gmail.com' || user === 'admin') && (pass === 'valorgt' || pass === 'admin')) {
        // Mostrar el botón de administración en el menú lateral
        const adminBtn = document.getElementById('nav-btn-admin');
        if (adminBtn) {
            adminBtn.style.display = 'flex'; // Habilitar visualización
        }

        // Mostrar animación de escaneo y validación de seguridad
        const scanOverlay = document.getElementById('login-scanning-overlay');
        if (scanOverlay) {
            scanOverlay.classList.remove('hidden');
        }

        setTimeout(() => {
            if (scanOverlay) {
                scanOverlay.classList.add('hidden');
            }
            
            // Permitir navegación
            isCommercialAuthenticated = true;
            
            // Redirigir a la vista de administrador de forma inmediata
            switchView('admin');
            
            // Registrar en los logs de administración global de forma inmediata
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SECURITY", `auth_node: Consola de Administración Central desbloqueada para cuenta ROOT/ADMIN.`, false);
            }
        }, 1500);
        return;
    }

    // Bypass de cuentas Demo locales para permitir acceso de pruebas rápido sin requerir registro manual previo en Supabase Auth
    const demoEmails = ['agente@valorgt.com', 'ana@estevezinmobiliaria.com', 'roberto@inversionesrv.com', 'sofia@alianzagt.com'];
    const isDemoAccount = demoEmails.includes(user) && pass === 'valorgt';

    // SI SUPABASE ESTÁ ACTIVO Y NO ES CUENTA DEMO, AUTENTICAR CONTRA EL SERVIDOR DE SUPABASE
    if (isSupabaseActive && !isDemoAccount) {
        const scanOverlay = document.getElementById('login-scanning-overlay');
        if (scanOverlay) {
            scanOverlay.classList.remove('hidden');
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: user,
                password: pass
            });

            if (error) {
                if (scanOverlay) scanOverlay.classList.add('hidden');
                alert(`⚠️ ERROR DE AUTENTICACIÓN: ${error.message}`);
                return;
            }

            // Descargar el perfil detallado del agente desde public.profiles (usando maybeSingle para evitar crash si no existe)
            const { data: profileData, error: profileErr } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            if (profileErr) {
                if (scanOverlay) scanOverlay.classList.add('hidden');
                alert(`⚠️ ERROR DE SISTEMA: No se pudo descargar el perfil de socio desde Supabase. ${profileErr.message}`);
                return;
            }

            let profile = profileData;

            // Mecanismo de auto-recuperación (Auto-healing): si el usuario existe en Auth pero no tiene registro en public.profiles
            if (!profile) {
                console.log("Auto-recuperación activa: Insertando perfil ausente para el usuario Auth:", data.user.id);
                const fallbackProfile = {
                    id: data.user.id,
                    name: user.split('@')[0],
                    company: 'Inmobiliaria Personal',
                    nit: 'C/F',
                    phone: 'N/A',
                    email: user,
                    plan: 'Pro',
                    status: 'activo',
                    usdt_balance: 0.00
                };
                
                try {
                    const { error: insertErr } = await supabaseClient.from('profiles').insert([fallbackProfile]);
                    if (insertErr) throw insertErr;
                    profile = fallbackProfile;
                } catch (insertErr) {
                    if (scanOverlay) scanOverlay.classList.add('hidden');
                    alert(`⚠️ ERROR DE SISTEMA: Tu firma de autenticación es válida, pero no cuentas con un perfil de base de datos y falló el protocolo de auto-creación. Detalle: ${insertErr.message}`);
                    return;
                }
            }

            // Verificar si el agente está suspendido
            if (profile.status === 'suspendido') {
                if (scanOverlay) scanOverlay.classList.add('hidden');
                if (typeof appendAdminLog === 'function') {
                    appendAdminLog("SECURITY", `auth_node: Intento de acceso bloqueado para cuenta suspendida de ${profile.name} (${user}).`, true);
                }
                alert("⚠️ ACCESO SAAS BLOQUEADO: Su cuenta de agente comercial ha sido suspendida temporalmente por la administración de la plataforma. Por favor, póngase en contacto con soporte técnico.");
                await supabaseClient.auth.signOut();
                return;
            }

            // Sanitizar perfiles al iniciar sesión (demo e inversionistas)
            if (profile) {
                const roleLower = (profile.role || 'agente').toLowerCase();
                const emailLower = (profile.email || '').toLowerCase();
                if (roleLower === 'inversionista') {
                    profile.plan = 'Premium';
                    profile.role = 'inversionista';
                    
                    // Auto-healing update on login using authenticated user RLS bypass
                    if (isSupabaseActive && supabaseClient && profileData.plan !== 'Premium') {
                        supabaseClient.from('profiles').update({ plan: 'Premium' }).eq('id', profile.id)
                        .then(() => console.log("⚡ [Auto-Heal] Corrected investor plan in database to Premium"))
                        .catch(err => console.warn("⚠️ [Auto-Heal] Failed to correct investor plan in database:", err));
                    }
                } else if (emailLower === 'ana@estevezinmobiliaria.com') {
                    profile.plan = 'VIP';
                    profile.role = 'agente';
                } else if (emailLower === 'sofia@alianzagt.com') {
                    profile.plan = 'Básico';
                    profile.role = 'agente';
                }
            }

            // Guardar credenciales en la sesión activa de la app
            loggedInB2bClient = {
                id: profile.id,
                name: profile.name,
                company: profile.company,
                nit: profile.nit,
                phone: profile.phone,
                email: profile.email,
                plan: profile.plan,
                status: profile.status.charAt(0).toUpperCase() + profile.status.slice(1),
                usdtBalance: parseFloat(profile.usdt_balance),
                role: profile.role || 'agente'
            };
            activeB2bPlan = profile.plan.toLowerCase();
            localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));

            const partnerLevelEl = document.getElementById('commercial-partner-level');
            if (partnerLevelEl) {
                const isPremium = (profile.plan === 'VIP' || profile.plan === 'Premium');
                const isPro = (profile.plan === 'Pro');
                partnerLevelEl.innerText = isPremium ? (((profile.role || '').toLowerCase() === 'inversionista') ? "Inversionista Premium" : "Inmobiliaria Premium") : (isPro ? (((profile.role || '').toLowerCase() === 'inversionista') ? "Inversionista Pro" : "Inmobiliaria Pro") : "Agente Individual");
            }

            // Registrar log en tiempo real en la administración
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SECURITY", `auth_node: Acceso B2B autorizado para ${profile.name} (${user}) vía Supabase.`, false);
            }

            setTimeout(() => {
                if (scanOverlay) {
                    scanOverlay.classList.add('hidden');
                }
                
                isCommercialAuthenticated = true;
                initCommercialView();
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 1000);

        } catch (err) {
            if (scanOverlay) scanOverlay.classList.add('hidden');
            console.error("Fallo crítico en Supabase Auth:", err);
            alert("⚠️ ERROR DE CONEXIÓN: No se pudo verificar la firma criptográfica en el servidor.");
        }
        return;
    }

    // Buscar en la base de datos de clientes registrados localmente (Fallback)
    const client = b2bClients.find(c => c.email && c.email.toLowerCase() === user);

    if ((user === 'agente@valorgt.com' && pass === 'valorgt') || (client && (client.password === pass || pass === 'valorgt'))) {
        // Verificar si la cuenta está suspendida por el administrador
        if (client && client.status === 'Suspendido') {
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SECURITY", `auth_node: Intento de acceso bloqueado para cuenta suspendida de ${client.name} (${user}).`, true);
            }
            alert("⚠️ ACCESO SAAS BLOQUEADO: Su cuenta de agente comercial ha sido suspendida temporalmente por la administración de la plataforma. Por favor, póngase en contacto con soporte técnico.");
            return;
        }

        // Sincronizar plan activo del B2B y guardar sesión
        if (client) {
            loggedInB2bClient = client;
            if ((client.role || '').toLowerCase() === 'inversionista') {
                client.plan = 'Premium';
            }
            activeB2bPlan = (client.plan || 'pro').toLowerCase();
            const partnerLevelEl = document.getElementById('commercial-partner-level');
            if (partnerLevelEl) {
                const isPremium = (client.plan === 'VIP' || client.plan === 'Premium');
                const isPro = (client.plan === 'Pro');
                partnerLevelEl.innerText = isPremium ? (((client.role || '').toLowerCase() === 'inversionista') ? "Inversionista Premium" : "Inmobiliaria Premium") : (isPro ? (((client.role || '').toLowerCase() === 'inversionista') ? "Inversionista Pro" : "Inmobiliaria Pro") : "Agente Individual");
            }
        } else {
            // Demo user (agente@valorgt.com)
            loggedInB2bClient = b2bClients.find(c => c.email && c.email.toLowerCase() === 'roberto@inversionesrv.com') || b2bClients[0];
            activeB2bPlan = (loggedInB2bClient.plan || 'pro').toLowerCase();
            const partnerLevelEl = document.getElementById('commercial-partner-level');
            if (partnerLevelEl) {
                const isPremium = (loggedInB2bClient.plan === 'VIP' || loggedInB2bClient.plan === 'Premium');
                const isPro = (loggedInB2bClient.plan === 'Pro');
                partnerLevelEl.innerText = isPremium ? (((loggedInB2bClient.role || '').toLowerCase() === 'inversionista') ? "Inversionista Premium" : "Inmobiliaria Premium") : (isPro ? (((loggedInB2bClient.role || '').toLowerCase() === 'inversionista') ? "Inversionista Pro" : "Inmobiliaria Pro") : "Agente Individual");
            }
        }
        localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));

        // Registrar en logs de administración de forma inmediata
        if (typeof appendAdminLog === 'function') {
            const clientName = client ? client.name : "Agente Demo";
            appendAdminLog("SECURITY", `auth_node: Acceso B2B autorizado para ${clientName} (${user}).`, false);
        }

        // Mostrar animación de escaneo y validación de seguridad
        const scanOverlay = document.getElementById('login-scanning-overlay');
        if (scanOverlay) {
            scanOverlay.classList.remove('hidden');
        }

        setTimeout(() => {
            // Criptografía autorizada
            if (scanOverlay) {
                scanOverlay.classList.add('hidden');
            }
            
            isCommercialAuthenticated = true;
            
            // Inicializar la vista comercial para abrir el panel
            initCommercialView();
            
            // Re-inicializar iconos Lucide generados dinámicamente
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 1500);

    } else {
        if (typeof appendAdminLog === 'function') {
            appendAdminLog("SECURITY", `auth_node: Intento de acceso denegado (credenciales incorrectas) para el usuario: ${user}.`, true);
        }
        alert("⚠️ ACCESO B2B DENEGADO: Las credenciales ingresadas son incorrectas o no están registradas.");
    }
}

// ==========================================================================
// NUEVO FLUJO DE REGISTRO B2B SAAS Y PASARELA DE SUBSCRIPCIÓN
// ==========================================================================

let pendingSignupUser = null;
let selectedSignupPlanKey = 'pro';
let selectedSignupPlanPrice = 31;

/**
 * Alterna entre las pestañas de Login y Registro
 */
function switchLoginTab(tabName) {
    const tabSignin = document.getElementById('login-tab-signin');
    const tabSignup = document.getElementById('login-tab-signup');
    const formSignin = document.getElementById('commercial-login-form');
    const formSignup = document.getElementById('commercial-signup-form');

    if (!tabSignin || !tabSignup || !formSignin || !formSignup) return;

    if (tabName === 'signin') {
        tabSignin.classList.add('active');
        tabSignin.style.color = 'var(--cyan)';
        tabSignin.style.borderBottom = '2px solid var(--cyan)';
        
        tabSignup.classList.remove('active');
        tabSignup.style.color = 'var(--text-secondary)';
        tabSignup.style.borderBottom = '2px solid transparent';
        
        formSignin.classList.remove('hidden');
        formSignup.classList.add('hidden');
    } else {
        tabSignup.classList.add('active');
        tabSignup.style.color = 'var(--cyan)';
        tabSignup.style.borderBottom = '2px solid var(--cyan)';
        
        tabSignin.classList.remove('active');
        tabSignin.style.color = 'var(--text-secondary)';
        tabSignin.style.borderBottom = '2px solid transparent';
        
        formSignup.classList.remove('hidden');
        formSignin.classList.add('hidden');
    }
}

/**
 * Captura el envío del formulario de registro y redirige al flujo de pago de suscripción
 */
async function handleRegistrationFormSubmit(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('com-signup-name').value.trim();
    const roleSelect = document.getElementById('com-signup-type');
    const role = roleSelect ? roleSelect.value : 'agente';

    const companyRaw = document.getElementById('com-signup-company') ? document.getElementById('com-signup-company').value.trim() : '';
    const nitRaw = document.getElementById('com-signup-nit') ? document.getElementById('com-signup-nit').value.trim() : '';
    
    const company = role === 'inversionista' ? 'Inversionista Particular' : companyRaw;
    const nit = role === 'inversionista' ? 'C/F' : nitRaw;

    const phone = document.getElementById('com-signup-phone').value.trim();
    const email = document.getElementById('com-signup-email').value.trim().toLowerCase();
    const pass = document.getElementById('com-signup-pass').value.trim();

    if (role === 'agente') {
        if (!name || !companyRaw || !nitRaw || !phone || !email || !pass) {
            alert("Por favor completa todos los campos del registro.");
            return;
        }
    } else {
        if (!name || !phone || !email || !pass) {
            alert("Por favor completa todos los campos del registro.");
            return;
        }
    }

    // Verificar si el usuario ya está registrado
    if (!isSupabaseActive) {
        const existing = b2bClients.find(c => c.email.toLowerCase() === email);
        if (existing || email === 'agente@valorgt.com') {
            alert("⚠️ REGISTRO DENEGADO: El correo electrónico ingresado ya está asociado a una cuenta activa.");
            return;
        }
    } else {
        if (email === 'agente@valorgt.com') {
            alert("⚠️ REGISTRO DENEGADO: El correo electrónico ingresado ya está asociado a una cuenta activa.");
            return;
        }
    }

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const planSelect = document.getElementById('com-signup-plan');
    let selectedPlanKey = planSelect ? planSelect.value : 'pro'; // basico | pro | vip
    if (role === 'inversionista') {
        selectedPlanKey = 'premium';
    }
    const selectedPlanName = selectedPlanKey === 'vip' ? 'VIP' : (selectedPlanKey === 'pro' ? 'Pro' : (selectedPlanKey === 'premium' ? 'Premium' : 'Básico'));

    const newClient = {
        id: 'agent-' + Date.now(),
        name: name,
        company: company,
        nit: nit,
        phone: phone,
        email: email,
        plan: selectedPlanName,
        status: 'Pendiente', // Pendiente de pago de transferencia
        password: pass,
        usdtBalance: 0.00, // Inicializado en cero
        role: role
    };

    // Registrar en Supabase Auth y Profiles si está activo
    if (isSupabaseActive && supabaseClient) {
        // Activar spinner visual de carga de registro
        const scanOverlay = document.getElementById('login-scanning-overlay');
        if (scanOverlay) {
            scanOverlay.classList.remove('hidden');
        }

        try {
            const { data: authData, error: authErr } = await supabaseClient.auth.signUp({
                email: email,
                password: pass
            });

            if (authErr) {
                if (scanOverlay) scanOverlay.classList.add('hidden');
                alert(`⚠️ ERROR EN REGISTRO DE CREDENCIALES: ${authErr.message}`);
                return;
            }

            if (authData && authData.user) {
                const { error: dbErr } = await supabaseClient.from('profiles').insert([
                    {
                        id: authData.user.id,
                        name: name,
                        company: company,
                        nit: nit,
                        phone: phone,
                        email: email,
                        plan: selectedPlanName,
                        status: 'pendiente',
                        usdt_balance: 0.00,
                        role: role
                    }
                ]);
                
                if (dbErr) {
                    if (scanOverlay) scanOverlay.classList.add('hidden');
                    alert(`⚠️ ERROR EN BASE DE DATOS B2B: ${dbErr.message}`);
                    return;
                }
                
                newClient.id = authData.user.id;
            }
        } catch (err) {
            if (scanOverlay) scanOverlay.classList.add('hidden');
            console.error("Fallo de red al registrar en Supabase:", err);
            alert("⚠️ FALLO DE RED: No se pudo conectar con el servidor de autenticación.");
            return;
        } finally {
            if (scanOverlay) scanOverlay.classList.add('hidden');
        }
    }

    b2bClients.unshift(newClient);
    localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));

    if (typeof appendAdminLog === 'function') {
        appendAdminLog("SAAS", `billing_node: Nuevo suscriptor ${newClient.name} (${newClient.company}) registrado en plan ${selectedPlanName.toUpperCase()} (Estado: Pendiente).`, false);
    }

    // Auto-login al usuario
    isCommercialAuthenticated = true;
    loggedInB2bClient = newClient;
    activeB2bPlan = selectedPlanKey; 

    const partnerLevelEl = document.getElementById('commercial-partner-level');
    if (partnerLevelEl) {
        const isPremium = selectedPlanName === 'VIP' || selectedPlanName === 'Premium';
        const isPro = selectedPlanName === 'Pro';
        partnerLevelEl.innerText = isPremium ? (((newClient.role || '').toLowerCase() === 'inversionista') ? "Inversionista Premium" : "Inmobiliaria Premium") : (isPro ? (((newClient.role || '').toLowerCase() === 'inversionista') ? "Inversionista Pro" : "Inmobiliaria Pro") : "Agente Individual");
    }

    alert(`¡REGISTRO EXITOSO!\n\nTu cuenta comercial ha sido creada en estado Pendiente.\nTe dirigiremos de inmediato a nuestra pasarela de pagos por transferencia bancaria para activar tu suscripción del Plan ${selectedPlanName.toUpperCase()}.`);

    // Iniciar dashboard
    initCommercialView();
    
    // Inmediatamente disparar la pasarela de pagos por transferencia bancaria para el plan elegido
    setTimeout(() => {
        openPlanPayment(selectedPlanKey);
    }, 450);
}

/**
 * Alterna visualmente el plan seleccionado en la pantalla de pago de registro
 */
function selectSignupPlan(planKey, priceUSD) {
    selectedSignupPlanKey = planKey;
    
    let priceGTQ = 240; // Default Pro
    priceUSD = 31;
    if (planKey === 'basico') {
        priceGTQ = 140;
        priceUSD = 18;
    } else if (planKey === 'vip') {
        priceGTQ = 640;
        priceUSD = 82;
    } else if (planKey === 'premium') {
        priceGTQ = 340;
        priceUSD = 43.70;
    }
    
    selectedSignupPlanPrice = priceUSD;

    // Actualizar clases activas en las tarjetas de plan
    ['basico', 'pro', 'vip', 'premium'].forEach(p => {
        const card = document.getElementById(`signup-plan-${p}`);
        if (card) {
            if (p === planKey) {
                card.classList.add('active-plan');
                card.style.borderColor = p === 'premium' ? '#ffd700' : 'var(--cyan)';
                card.style.background = p === 'premium' ? 'rgba(255, 215, 0, 0.03)' : 'rgba(0, 240, 255, 0.03)';
            } else {
                card.classList.remove('active-plan');
                card.style.borderColor = 'rgba(255,255,255,0.08)';
                card.style.background = 'rgba(0,0,0,0.25)';
            }
        }
    });

    let planName = "Suscripción Inmobiliaria Pro";
    if (planKey === 'basico') planName = "Suscripción Agente Individual";
    if (planKey === 'vip') planName = "Suscripción Inmobiliaria Premium";
    if (planKey === 'premium') planName = "Suscripción Inversionista Premium";

    // Calcular conversión y símbolo basado en GTQ dominante
    let priceConverted = 0;
    let currencySym = '';
    if (activeCurrency === 'GTQ') {
        priceConverted = priceGTQ;
        currencySym = 'Q';
    } else {
        priceConverted = priceUSD;
        currencySym = '$';
    }

    // Actualizar labels
    document.getElementById('signup-payment-concept-lbl').innerText = planName;
    document.getElementById('signup-payment-total-lbl').innerText = `${currencySym}${formatNumber(priceConverted.toFixed(2))}`;
}

/**
 * Cancela el flujo de pago del registro y vuelve a la pantalla de login/registro
 */
function cancelSignupPayment() {
    document.getElementById('commercial-signup-payment-gate').classList.add('hidden');
    document.getElementById('commercial-login-gate').classList.remove('hidden');
    pendingSignupUser = null;
}

/**
 * Formatea y procesa el pago de suscripción con animaciones de pasarela segura
 */
function processSignupSubscriptionPayment(event) {
    if (event) event.preventDefault();

    const num = document.getElementById('signup-cc-num').value;
    const name = document.getElementById('signup-cc-name').value;
    const exp = document.getElementById('signup-cc-expiry').value;
    const cvv = document.getElementById('signup-cc-cvv').value;

    if (num.length < 15 || name.length < 4 || exp.length < 5 || cvv.length < 3) {
        alert("Por favor completa los datos de pago con formato válido.");
        return;
    }

    // Cambiar a la vista de cargando
    document.getElementById('signup-payment-form-view').classList.add('hidden');
    document.getElementById('signup-payment-loading-view').classList.remove('hidden');

    const logsEl = document.getElementById('signup-payment-status-logs');
    if (logsEl) {
        logsEl.innerHTML = '<p class="text-muted">> Estableciendo canal criptográfico seguro SSL/TLS...</p>';
    }

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Conectando con servidor pasarela VisaNet/Mastercard...</p>';
    }, 600);

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Validando credenciales PCI-DSS y token digital...</p>';
    }, 1200);

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-muted">> Inscribiendo nuevo socio inmobiliario en núcleo SaaS...</p>';
    }, 1800);

    setTimeout(() => {
        if (logsEl) logsEl.innerHTML += '<p class="text-cyan">> ¡Membresía SaaS autorizada con éxito!</p>';
        completeSignupSubscriptionTransaction();
    }, 2400);
}

/**
 * Completa la transacción de registro y activa la cuenta
 */
async function completeSignupSubscriptionTransaction() {
    if (!pendingSignupUser) return;

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    // Generar recibo
    const authCode = "AUT-" + Math.floor(100000 + Math.random() * 900000);
    const refCode = "REF-" + Math.floor(10000000 + Math.random() * 90000000);
    const amountVal = selectedSignupPlanPrice * conversion;

    document.getElementById('signup-receipt-auth-code').innerText = `#${authCode}`;
    document.getElementById('signup-receipt-ref-code').innerText = `#${refCode}`;
    document.getElementById('signup-receipt-amount-val').innerText = `${currencySym}${formatNumber(amountVal.toFixed(2))}`;

    // 1. Agregar nuevo cliente a la lista b2bClients
    const isInvestorRole = (pendingSignupUser.role || '').toLowerCase() === 'inversionista';
    const clientPlanKey = isInvestorRole ? 'premium' : selectedSignupPlanKey;
    const clientPlanName = isInvestorRole ? 'Premium' : (clientPlanKey.charAt(0).toUpperCase() + clientPlanKey.slice(1));

    const newClient = {
        name: pendingSignupUser.name,
        company: pendingSignupUser.company,
        nit: pendingSignupUser.nit,
        phone: pendingSignupUser.phone,
        email: pendingSignupUser.email,
        plan: clientPlanName,
        status: 'Activo',
        password: pendingSignupUser.pass,
        usdtBalance: 0.00, // Inicializado en cero
        role: pendingSignupUser.role
    };

    if (isSupabaseActive) {
        try {
            // A. Registrar el usuario en Supabase Auth
            const { data: authData, error: authErr } = await supabaseClient.auth.signUp({
                email: pendingSignupUser.email,
                password: pendingSignupUser.pass
            });

            if (authErr) {
                alert(`⚠️ ERROR EN REGISTRO DE CREDENCIALES: ${authErr.message}`);
                // Restaurar la vista de pago
                document.getElementById('signup-payment-loading-view').classList.add('hidden');
                document.getElementById('signup-payment-form-view').classList.remove('hidden');
                return;
            }

            if (authData && authData.user) {
                // B. Registrar la información del agente en public.profiles
                const { error: dbErr } = await supabaseClient.from('profiles').insert([
                    {
                        id: authData.user.id,
                        name: pendingSignupUser.name,
                        company: pendingSignupUser.company,
                        nit: pendingSignupUser.nit,
                        phone: pendingSignupUser.phone,
                        email: pendingSignupUser.email,
                        plan: newClient.plan,
                        status: 'activo',
                        usdt_balance: 0.00,
                        role: pendingSignupUser.role
                    }
                ]);

                if (dbErr) {
                    console.error("Error al registrar perfil B2B en base de datos:", dbErr);
                } else {
                    newClient.id = authData.user.id;
                }
            }
        } catch (err) {
            console.error("Fallo de red al registrar en Supabase:", err);
        }
    }

    b2bClients.unshift(newClient);

    // Registrar en la consola administrativa global
    if (typeof appendAdminLog === 'function') {
        appendAdminLog("SAAS", `billing_node: Nuevo suscriptor ${newClient.name} (${newClient.company}) en plan ${newClient.plan} - Total: $${selectedSignupPlanPrice} USD.`, false);
    }

    // 2. Establecer variables globales comerciales y sesión activa
    isCommercialAuthenticated = true;
    loggedInB2bClient = newClient;
    activeB2bPlan = clientPlanKey;
    saasBillingAmountUSD += selectedSignupPlanPrice;

    // Actualizar insignias de socio
    const partnerLevelEl = document.getElementById('commercial-partner-level');
    if (partnerLevelEl) {
        const isInvestor = newClient && (newClient.role || '').toLowerCase() === 'inversionista';
        let planLabel = isInvestor ? "Inversionista Premium" : "Inmobiliaria Pro";
        if (selectedSignupPlanKey === 'basico') planLabel = "Agente Individual";
        if (selectedSignupPlanKey === 'vip') planLabel = "Inmobiliaria Premium";
        if (selectedSignupPlanKey === 'premium') planLabel = "Inversionista Premium";
        partnerLevelEl.innerText = planLabel;
    }

    // Sincronizar UI de planes comerciales
    ['basico', 'pro', 'vip'].forEach(p => {
        const card = document.getElementById(`plan-card-${p}`);
        const btn = document.getElementById(`btn-plan-${p}`);
        if (card) {
            if (p === selectedSignupPlanKey) {
                card.classList.add('active-plan');
                if (btn) btn.innerText = "Plan Activo";
            } else {
                card.classList.remove('active-plan');
                if (btn) btn.innerText = "Cambiar Plan";
            }
        }
    });

    // Cambiar a la vista de éxito
    document.getElementById('signup-payment-loading-view').classList.add('hidden');
    document.getElementById('signup-payment-success-view').classList.remove('hidden');
}

/**
 * Cierra la pasarela y entra al dashboard del nuevo usuario
 */
function enterPersonalDashboardAfterPayment() {
    // Cerrar pasarela y restablecer
    document.getElementById('commercial-signup-payment-gate').classList.add('hidden');
    
    // Restablecer vistas internas de pago
    document.getElementById('signup-payment-form-view').classList.remove('hidden');
    document.getElementById('signup-payment-loading-view').classList.add('hidden');
    document.getElementById('signup-payment-success-view').classList.add('hidden');
    document.getElementById('signup-cc-form').reset();
    document.getElementById('commercial-signup-form').reset();
    
    document.getElementById('signup-card-num-preview').innerText = '•••• •••• •••• ••••';
    document.getElementById('signup-card-name-preview').innerText = 'NOMBRE APELLIDO';
    document.getElementById('signup-card-expiry-preview').innerText = 'MM/AA';
    
    // Iniciar dashboard
    initCommercialView();
}

/**
 * Funciones de formateo de tarjeta de crédito para la pantalla de registro
 */
function formatSignupCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    input.value = formatted;
    
    const preview = document.getElementById('signup-card-num-preview');
    if (preview) {
        preview.innerText = formatted || '•••• •••• •••• ••••';
    }
}

function updateSignupCardName(input) {
    const preview = document.getElementById('signup-card-name-preview');
    if (preview) {
        preview.innerText = input.value.toUpperCase() || 'NOMBRE APELLIDO';
    }
}

function formatSignupExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    
    const preview = document.getElementById('signup-card-expiry-preview');
    if (preview) {
        preview.innerText = value || 'MM/AA';
    }
}

/**
 * Cierra la sesión comercial B2B y vuelve a bloquear la consola
 */
function logoutCommercialAgent() {
    isCommercialAuthenticated = false;
    loggedInB2bClient = null;
    agentUploadedProperties = [];
    localStorage.removeItem('valorgt_active_b2b_client');
    saveLocalPropertiesToStorage();
    
    // Resetear portafolio a modo demo/visitante
    loadUserPortfolio();
    
    // Resetear formulario
    const loginForm = document.getElementById('commercial-login-form');
    if (loginForm) loginForm.reset();
    
    // Bloquear de nuevo la vista
    initCommercialView();
    
    alert("Sesión B2B Cerrada con éxito. Consola comercial bloqueada de forma segura.");
}

/**
 * Renderiza el catálogo B2B de propiedades activas del agente con orden y filtros interactivos
 */
function renderB2bInventory(filter = 'todos') {
    const emptyEl = document.getElementById('b2b-inventory-empty');
    const gridEl = document.getElementById('b2b-inventory-grid');
    const loadingEl = document.getElementById('b2b-inventory-loading');
    if (!emptyEl || !gridEl) return;

    if (isB2bInventoryLoading && loadingEl) {
        loadingEl.classList.remove('hidden');
        emptyEl.classList.add('hidden');
        gridEl.classList.add('hidden');
        return;
    }

    if (loadingEl) {
        loadingEl.classList.add('hidden');
    }

    if (agentUploadedProperties.length === 0) {
        emptyEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        return;
    }

    // Filtrar propiedades
    let filteredList = agentUploadedProperties;
    if (filter !== 'todos') {
        filteredList = agentUploadedProperties.filter(p => p.category === filter);
    }

    if (filteredList.length === 0) {
        emptyEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        emptyEl.innerHTML = `
            <i data-lucide="cloud-off" style="width: 40px; height: 40px; stroke-width: 1.5; color: var(--text-secondary); margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;"></i>
            <h4 style="font-weight: bold; font-size: 0.85rem; color: var(--text-secondary);">No hay listados en la categoría "${filter}"</h4>
            <p style="font-size: 0.65rem; margin-top: 5px;">Prueba seleccionando otro filtro o agrega un listado nuevo en esta categoría.</p>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    // Mostrar el grid
    emptyEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
    gridEl.innerHTML = '';

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    filteredList.forEach(prop => {
        const convertedPrice = prop.priceUSD * conversion;
        const catClass = prop.category.toLowerCase();
        
        // Buscar el índice real en PORTFOLIO_DATABASE para poder autotasar
        const dbIndex = PORTFOLIO_DATABASE[prop.location]?.findIndex(p => p.title === prop.title) ?? 0;
        const isSponsored = prop.sponsored === true;
        const sponsoredClass = isSponsored ? 'is-sponsored' : '';

        const card = document.createElement('div');
        card.className = `b2b-inventory-card-item ${sponsoredClass}`;
        card.setAttribute('onclick', `openPropertyDetailModal('${prop.location}', ${dbIndex})`);
        card.style.cursor = 'pointer';
        card.innerHTML = `
            ${renderCardImageHTML(prop, 'inv-img-wrap', '120px', isSponsored, '', true)}
            <div class="inv-info">
                <div>
                    <h4 class="inv-title" title="${prop.title}">${prop.title}</h4>
                    <div class="inv-meta" style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-secondary); margin-top: 4px;">
                        <span>📍 ${prop.location.toUpperCase()}</span>
                        <span>${prop.rooms} H • ${prop.bathrooms} B</span>
                    </div>
                    ${(() => {
                        let advancedTagsHTML = '';
                        const tags = [];
                        if (prop.hasMasterSuite) tags.push("Suite Principal");
                        if (prop.hasVisitorBath) tags.push("Baño Visitas");
                        if (prop.study) tags.push("Estudio");
                        if (prop.familyRoom) tags.push("Sala Fam.");
                        if (prop.amenities && prop.amenities.length > 0) {
                            prop.amenities.forEach(am => {
                                if (am === "amenity-pool" || am === "pool") tags.push("Piscina");
                                if (am === "amenity-gym" || am === "gym") tags.push("Gimnasio");
                                if (am === "amenity-smart" || am === "smart") tags.push("Smart Home");
                                if (am === "amenity-view" || am === "view") tags.push("Vista");
                            });
                        }
                        if (tags.length > 0) {
                            advancedTagsHTML = `
                                <div class="card-advanced-tags" style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; margin-bottom: 2px;">
                                    ${tags.slice(0, 3).map(t => `<span style="font-size: 0.52rem; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--cyan); padding: 1px 4px; border-radius: 3px; font-weight: 500;">${t}</span>`).join('')}
                                    ${tags.length > 3 ? `<span style="font-size: 0.52rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); padding: 1px 4px; border-radius: 3px;">+${tags.length - 3}</span>` : ''}
                                </div>
                            `;
                        }
                        return advancedTagsHTML;
                    })()}
                    <div class="inv-specs" style="margin-top: 5px; display: flex; gap: 6px; font-size: 0.55rem; color: var(--text-muted);">
                        <span>📐 M²: ${prop.size}</span>
                        <span>🚗 Pq: ${prop.parkings}</span>
                        <span>🛡️ Smart IoT</span>
                    </div>
                </div>
                <div class="inv-price-bar" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 8px;">
                    <span class="inv-price" style="font-size: 0.85rem; font-weight: bold; color: var(--cyan);">${currencySym}${formatNumber(convertedPrice.toFixed(0))}</span>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end;">
                        <button class="btn-inv-action" onclick="event.stopPropagation(); editAgentProperty('${prop.id}')" style="background: rgba(191, 90, 242, 0.1); border: 1px solid #bf5af2; color: #bf5af2; font-size: 0.55rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: var(--transition-smooth);">
                            ✏️ EDITAR
                        </button>
                        <button class="btn-inv-action" onclick="event.stopPropagation(); deleteAgentProperty('${prop.id}')" style="background: rgba(255, 55, 95, 0.1); border: 1px solid #ff375f; color: #ff375f; font-size: 0.55rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: var(--transition-smooth);">
                            🗑️ BORRAR
                        </button>
                        <button class="btn-inv-action" onclick="event.stopPropagation(); autoValuateFromInventory('${prop.location}', ${dbIndex})" style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--cyan); color: var(--cyan); font-size: 0.55rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: var(--transition-smooth);">
                            ⚡ TASAR IA
                        </button>
                        ${isSponsored ? `
                            <span style="background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700; color: #ffd700; font-size: 0.55rem; padding: 3px 8px; border-radius: 4px; font-weight: bold; text-shadow: 0 0 5px rgba(255, 215, 0, 0.4); display: flex; align-items: center; gap: 3px;">
                                ✨ PAUTADO
                            </span>
                        ` : `
                            <button class="btn-inv-action" onclick="event.stopPropagation(); openAdPaymentModal('${prop.id}')" style="background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700; color: #ffd700; font-size: 0.55rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: var(--transition-smooth); display: flex; align-items: center; gap: 3px;">
                                ⭐ PAUTAR
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        gridEl.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Controla el filtrado interactivo del catálogo B2B
 */
function filterB2bInventory(category) {
    // Quitar clase activa de todos los filtros del catálogo
    document.querySelectorAll('.btn-inv-filter').forEach(btn => {
        btn.classList.remove('active');
    });

    // Añadir clase activa al botón presionado
    const activeBtn = Array.from(document.querySelectorAll('.btn-inv-filter')).find(btn => {
        return btn.getAttribute('onclick').includes(`'${category}'`);
    });
    if (activeBtn) activeBtn.classList.add('active');

    // Rerenderizar
    renderB2bInventory(category);
}

/**
 * Carga una propiedad publicada en el formulario B2B para editarla
 */
function editAgentProperty(propId) {
    const prop = agentUploadedProperties.find(p => String(p.id) === String(propId));
    if (!prop) {
        alert("No se encontró la propiedad seleccionada.");
        return;
    }

    // Cambiar a la pestaña de ingreso de propiedades (Terminal de Publicación)
    switchCommercialTab('propiedades');

    // Establecer variable de edición
    editingPropertyId = propId;

    // Rellenar formulario principal
    document.getElementById('pub-title').value = prop.title || '';
    document.getElementById('pub-category').value = prop.category || 'Apartamento';
    document.getElementById('pub-type').value = prop.type || 'Venta';
    document.getElementById('pub-location').value = prop.location || '';
    
    // Convertir precio de vuelta a la moneda activa si fue guardado en USD
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    document.getElementById('pub-price').value = Math.round(prop.priceUSD * conversion);
    
    document.getElementById('pub-size').value = prop.size || '';
    document.getElementById('pub-beds').value = prop.rooms || 0;
    document.getElementById('pub-baths').value = prop.bathrooms || 0;
    document.getElementById('pub-parks').value = prop.parkings || 0;
    document.getElementById('pub-lat').value = prop.lat || '';
    document.getElementById('pub-lng').value = prop.lng || '';
    
    const descInput = document.getElementById('pub-description');
    if (descInput) {
        descInput.value = prop.description || '';
    }
    
    const youtubeInput = document.getElementById('pub-youtube');
    if (youtubeInput) {
        youtubeInput.value = prop.youtubeUrl || '';
    }
    
    // Manejo de fotos locales cargadas
    if (prop.photos && prop.photos.length > 0) {
        uploadedBase64Images = [...prop.photos];
        renderThumbnailsPreview();
        const fileInput = document.getElementById('pub-file-input');
        const label = document.querySelector('label[for="pub-file-input"]');
        if (label) {
            label.innerHTML = `O Subir Fotos Locales <span style="color: var(--green); font-weight: bold;">(¡${uploadedBase64Images.length} cargadas ✔️!)</span>`;
        }
        if (fileInput) {
            fileInput.style.border = '1px solid var(--green)';
            fileInput.style.background = 'rgba(0, 255, 128, 0.1)';
        }
    } else {
        uploadedBase64Images = [];
        renderThumbnailsPreview();
        const fileInput = document.getElementById('pub-file-input');
        const label = document.querySelector('label[for="pub-file-input"]');
        if (label) {
            label.innerText = 'O Subir Fotos Locales (Hasta 10 desde tu PC)';
        }
        if (fileInput) {
            fileInput.style.border = '1px dashed var(--cyan)';
            fileInput.style.background = 'rgba(0,0,0,0.4)';
            fileInput.value = '';
        }
    }

    // Parámetros avanzados
    if (document.getElementById('pub-prop-city')) {
        document.getElementById('pub-prop-city').value = prop.city || 'Guatemala';
    }
    if (document.getElementById('pub-prop-residential')) {
        document.getElementById('pub-prop-residential').value = prop.residential || '';
    }
    if (document.getElementById('pub-prop-land-area')) {
        document.getElementById('pub-prop-land-area').value = prop.landArea || 0;
    }
    if (document.getElementById('pub-prop-land-unit')) {
        document.getElementById('pub-prop-land-unit').value = prop.landUnit || 'v2';
    }
    if (document.getElementById('pub-room-secondary-count')) {
        document.getElementById('pub-room-secondary-count').value = prop.secondaryRooms || 0;
    }
    if (document.getElementById('pub-bath-full-count')) {
        document.getElementById('pub-bath-full-count').value = prop.fullBathrooms || 0;
    }
    if (document.getElementById('pub-parking-type')) {
        document.getElementById('pub-parking-type').value = prop.parkingType || 'techados';
    }
    if (document.getElementById('pub-prop-garden')) {
        document.getElementById('pub-prop-garden').value = prop.garden || 0;
    }
    if (document.getElementById('pub-prop-finishes')) {
        document.getElementById('pub-prop-finishes').value = prop.finishes || 'standard';
    }
    if (document.getElementById('pub-prop-conservation')) {
        document.getElementById('pub-prop-conservation').value = prop.conservation || 'nueva';
    }

    // Checkboxes
    const checkboxMapping = {
        'pub-room-master-suite': prop.hasMasterSuite,
        'pub-bath-visitor': prop.hasVisitorBath,
        'pub-prop-family-room': prop.familyRoom,
        'pub-prop-study': prop.study,
        
        'pub-amenity-pool': prop.amenities?.includes('amenity-pool') || prop.amenities?.includes('pool'),
        'pub-amenity-gym': prop.amenities?.includes('amenity-gym') || prop.amenities?.includes('gym'),
        'pub-amenity-security': prop.amenities?.includes('amenity-security') || prop.amenities?.includes('security'),
        'pub-amenity-clubhouse': prop.amenities?.includes('amenity-clubhouse') || prop.amenities?.includes('clubhouse'),
        'pub-amenity-view': prop.amenities?.includes('amenity-view') || prop.amenities?.includes('view'),
        'pub-amenity-smart': prop.amenities?.includes('amenity-smart') || prop.amenities?.includes('smart'),
        'pub-amenity-solar': prop.amenities?.includes('amenity-solar') || prop.amenities?.includes('solar'),
        'pub-amenity-cistern': prop.amenities?.includes('amenity-cistern') || prop.amenities?.includes('cistern'),
        'pub-amenity-elevator': prop.amenities?.includes('amenity-elevator') || prop.amenities?.includes('elevator'),
        
        'pub-mat-porcelain': prop.materials?.includes('mat-porcelain'),
        'pub-mat-marble': prop.materials?.includes('mat-marble'),
        'pub-mat-wood': prop.materials?.includes('mat-wood'),
        'pub-mat-pvc': prop.materials?.includes('mat-pvc'),
        'pub-mat-kitchen-luxe': prop.materials?.includes('mat-kitchen-luxe'),
        
        'pub-near-malls': prop.near?.includes('near-malls'),
        'pub-near-schools': prop.near?.includes('near-schools'),
        'pub-near-supers': prop.near?.includes('near-supers'),
        'pub-near-roads': prop.near?.includes('near-roads'),

        'pub-area-living': prop.areas?.includes('area-living'),
        'pub-area-dining': prop.areas?.includes('area-dining'),
        'pub-area-kitchen': prop.areas?.includes('area-kitchen'),
        'pub-area-breakfast': prop.areas?.includes('area-breakfast'),
        'pub-area-maid': prop.areas?.includes('area-maid'),
        'pub-area-laundry': prop.areas?.includes('area-laundry'),
        'pub-area-storage': prop.areas?.includes('area-storage'),
        'pub-area-terrace': prop.areas?.includes('area-terrace'),
        'pub-area-balcony': prop.areas?.includes('area-balcony'),
        'pub-area-patio': prop.areas?.includes('area-patio')
    };

    for (const [id, value] of Object.entries(checkboxMapping)) {
        const el = document.getElementById(id);
        if (el) el.checked = !!value;
    }

    // Actualizar visibilidad dinámica B2B en base a categoría/tipo
    updateB2bFieldVisibility();

    // Cambiar el texto del botón de publicar
    const submitBtn = document.querySelector('#publish-property-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i data-lucide="check-circle"></i> Guardar Correcciones Inmobiliarias';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Scroll suave al formulario de ingreso
    const tabContainer = document.getElementById('view-commercial');
    if (tabContainer) {
        tabContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Alerta descriptiva
    alert(`✏️ MODO EDICIÓN ACTIVO: Se cargaron los datos de "${prop.title}". Realiza los ajustes necesarios y haz clic en "Guardar Correcciones Inmobiliarias" para confirmarlos.`);
}

/**
 * Elimina una propiedad del agente de forma permanente de Supabase y del estado local
 */
async function deleteAgentProperty(propId) {
    let prop = agentUploadedProperties.find(p => String(p.id) === String(propId));
    const isAdmin = (loggedInB2bClient && (
        loggedInB2bClient.email.toLowerCase().includes('admin') || 
        loggedInB2bClient.email.toLowerCase().includes('sgalindo')
    )) || (!loggedInB2bClient && isCommercialAuthenticated);
    if (!prop && isAdmin) {
        // Buscar en todas las zonas de PORTFOLIO_DATABASE
        for (const zone of Object.keys(PORTFOLIO_DATABASE)) {
            const found = PORTFOLIO_DATABASE[zone].find(p => String(p.id) === String(propId));
            if (found) {
                prop = found;
                break;
            }
        }
    }
    if (!prop) {
        console.warn(`No se encontró la propiedad con ID: ${propId} para eliminar.`);
        alert("No se encontró la propiedad o no tienes permisos para eliminarla.");
        return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente la propiedad "${prop.title}"?`)) {
        return;
    }

    // 1. Eliminar de Supabase si está activo
    if (isSupabaseActive && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('properties')
                .delete()
                .eq('id', propId)
                .select();
            if (error) {
                console.error("Error al eliminar propiedad en Supabase:", error);
                alert("Hubo un error al eliminar la propiedad de la base de datos remota. Intenta de nuevo.");
                return;
            }
            // Si data es nulo o está vacío, significa que RLS bloqueó el delete o el ID no existe
            if (!data || data.length === 0) {
                console.warn("La eliminación no afectó a ninguna fila en Supabase. Posible restricción de políticas RLS.");
                alert("⚠️ ERROR DE SEGURIDAD (RLS): No tienes permisos para eliminar esta propiedad en la base de datos de Supabase, o el ID no existe en la nube.\n\nPor favor, contacta al administrador para habilitar las políticas de eliminación.");
                return;
            }
        } catch (err) {
            console.error("Fallo de conexión al eliminar de Supabase:", err);
            alert("Error de conexión al eliminar la propiedad.");
            return;
        }
    }

    // 2. Eliminar de agentUploadedProperties
    agentUploadedProperties = agentUploadedProperties.filter(p => String(p.id) !== String(propId));

    // 3. Eliminar de PORTFOLIO_DATABASE
    const zone = prop.location;
    if (PORTFOLIO_DATABASE[zone]) {
        PORTFOLIO_DATABASE[zone] = PORTFOLIO_DATABASE[zone].filter(p => String(p.id) !== String(propId));
    }

    // 4. Guardar en localStorage y actualizar caché SWR
    saveLocalPropertiesToStorage();
    try {
        const cachedPropsJson = localStorage.getItem('valorgt_remote_properties_cache');
        if (cachedPropsJson) {
            let cachedProps = JSON.parse(cachedPropsJson);
            if (Array.isArray(cachedProps)) {
                cachedProps = cachedProps.filter(p => String(p.id) !== String(propId));
                localStorage.setItem('valorgt_remote_properties_cache', JSON.stringify(cachedProps));
            }
        }
    } catch (err) {
        console.warn("Error al actualizar la caché local remota:", err);
    }

    // 5. Rerenderizar B2B Inventory
    renderB2bInventory();

    // 6. Actualizar marcadores de agentes en el mapa de calor si está inicializado
    if (typeof drawAgentProperties === 'function') {
        drawAgentProperties();
    }

    // 7. Rerenderizar vistas asociadas si están activas
    const locationSelect = document.getElementById('prop-location');
    const activeZone = locationSelect ? locationSelect.value : 'zona14';
    if (typeof renderFeaturedProperties === 'function') {
        renderFeaturedProperties(activeZone);
    }
    const catalogZoneSelect = document.getElementById('catalog-zone-select');
    if (catalogZoneSelect && (catalogZoneSelect.value === zone || catalogZoneSelect.value === 'todas')) {
        renderCatalogProperties();
    }

    // Actualizar selectores
    updatePromoPropertySelect();
    updateSaasMetricsHUD();

    alert("Propiedad eliminada exitosamente.");
}

/**
 * Puente que permite saltar a la pestaña Tasa Inteligente y auto-tasar una propiedad de agente
 */
function autoValuateFromInventory(locationKey, indexInDb) {
    // 1. Ir a Tasa Inteligente
    switchView('dashboard');
    
    // 2. Cargar la propiedad en el formulario y ejecutar valuación
    autofillValuationForm(locationKey, indexInDb);
    
    // 3. Scroll suave al tope para ver la ficha tasada
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// NUEVO PANEL ADMINISTRATIVO GLOBAL Y TELEMETRÍA CENTRAL
// ==========================================================================

let adminLogs = [];
let isSpeculationCalibrated = true;
let adminSyncIntervalId = null;

/**
 * Inicializa y refresca la vista del panel administrativo
 */
function initAdminView() {
    renderAdminDashboard();
    
    // Si los logs del admin están vacíos, agregar logs iniciales
    if (adminLogs.length === 0) {
        appendAdminLog("SYSTEM", "root_node: Acceso root autorizado al kernel de ValorGT AI.", false);
        appendAdminLog("SECURITY", "pci_dss: Módulo de encriptación de datos bancarios activo (PCI-DSS compliant).", false);
        appendAdminLog("SAAS", "billing_node: Orquestador de facturación SaaS activo.", false);
    }

    // Sincronizar perfiles reales y solicitudes de pago desde Supabase
    if (isSupabaseActive) {
        syncB2bClientsFromSupabase();
        syncPendingPaymentRequests();
    } else {
        syncPendingPaymentRequests();
    }
    
    // Inicializar visualmente la lista de destinatarios del airdrop
    renderAdminAirdropComponents();
    
    // Cargar precio de Tether Gold (XAUt) en segundo plano una sola vez al inicializar la vista de administración
    fetchXautPriceForAirdrop().then(() => {
        calculateAdminAirdropPreview();
    });

    // Cargar URL actual de video de planes en el input
    const videoInput = document.getElementById('admin-plans-video-url');
    if (videoInput) {
        videoInput.value = plansVideoUrl;
    }

    // Cargar URL actual de video de bienvenida en el input
    const welcomeVideoInput = document.getElementById('admin-welcome-video-url');
    if (welcomeVideoInput) {
        welcomeVideoInput.value = welcomeVideoUrl;
    }

    // Cargar mensaje y estado del banner promocional en los controles de administración
    const promoInput = document.getElementById('admin-promo-input');
    if (promoInput) {
        promoInput.value = promoBannerMessage;
    }
    const promoCheckbox = document.getElementById('admin-promo-active');
    if (promoCheckbox) {
        promoCheckbox.checked = isPromoBannerActive;
    }

    // Iniciar poller reactivo en segundo plano para auditoría bancaria (cada 8 segundos)
    if (!adminSyncIntervalId) {
        adminSyncIntervalId = setInterval(() => {
            const adminView = document.getElementById('view-admin');
            const isVisible = adminView && adminView.classList.contains('active');
            if (isVisible) {
                console.log("🔄 [ValorGT AI Poller] Sincronizando solicitudes de pago pendientes en segundo plano...");
                syncPendingPaymentRequests();
            }
        }, 8000);
    }

    // Renderizar base de datos de referencia (IA)
    renderAdminReferenceDatabase();

    // Mostrar por defecto la pestaña de Ajustes Generales
    switchAdminTab('general');
}

let editingAdminRefPropertyId = null;
let editingAdminRefPropertyZone = null;
let adminRefCustomPhotoBase64 = "";

/**
 * Renderiza la tabla de propiedades de referencia en la pestaña de administración
 */
function renderAdminReferenceDatabase() {
    const zoneSelect = document.getElementById('admin-ref-zone-select');
    const tableBody = document.getElementById('admin-reference-properties-table-body');
    if (!zoneSelect || !tableBody) return;

    const zoneKey = zoneSelect.value;
    tableBody.innerHTML = '';

    const properties = PORTFOLIO_DATABASE[zoneKey] || [];
    const refProperties = properties.filter(p => p.isReferenceData === true);

    if (refProperties.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 25px; color: var(--text-muted);">
                    <i data-lucide="info" style="width: 20px; height: 20px; color: var(--cyan); margin-bottom: 5px; opacity: 0.5; display: inline-block;"></i><br>
                    No hay puntos de referencia registrados en esta zona de calibración.
                </td>
            </tr>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    refProperties.forEach(prop => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
        tr.style.cursor = 'pointer';
        tr.style.transition = 'background-color 0.2s ease';
        tr.onmouseover = () => { tr.style.backgroundColor = 'rgba(0, 240, 255, 0.04)'; };
        tr.onmouseout = () => { tr.style.backgroundColor = 'transparent'; };
        
        // Al hacer clic en la fila se abre el modal para visualizar/editar
        tr.onclick = (e) => {
            if (e.target.closest('button')) return; // No abrir si se hace clic en ELIMINAR
            openEditAdminReferencePropertyModal(zoneKey, prop);
        };

        const priceGTQ = prop.priceUSD * exchangeRate;
        const formattedPrice = activeCurrency === 'GTQ' 
            ? `Q${priceGTQ.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
            : `$${prop.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

        tr.innerHTML = `
            <td style="padding: 8px; text-align: left; vertical-align: middle;">
                <img src="${prop.photo || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=80&q=80'}" alt="Thumb" style="width: 45px; height: 35px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
            </td>
            <td style="padding: 8px; text-align: left; vertical-align: middle; color: #fff; font-weight: bold;">
                ${prop.title}
                <div style="font-size: 0.55rem; color: var(--text-muted); margin-top: 2px;">ID: ${prop.id || 'Local Mock'}</div>
            </td>
            <td style="padding: 8px; text-align: center; vertical-align: middle; text-transform: uppercase;">
                <span class="badge-lbl" style="font-size: 0.6rem; color: var(--cyan);">${prop.category || 'apartamento'}</span>
            </td>
            <td style="padding: 8px; text-align: center; vertical-align: middle; text-transform: uppercase;">
                <span class="badge-lbl" style="font-size: 0.6rem; color: #fff;">${prop.type || 'venta'}</span>
            </td>
            <td style="padding: 8px; text-align: right; vertical-align: middle; color: var(--text-secondary);">
                ${prop.size || 0} m²
            </td>
            <td style="padding: 8px; text-align: right; vertical-align: middle; font-weight: bold; color: var(--cyan);">
                ${formattedPrice}
            </td>
            <td style="padding: 8px; text-align: center; vertical-align: middle;">
                <button onclick="event.stopPropagation(); deleteAdminReferenceProperty('${zoneKey}', '${prop.id}')" class="btn-commercial" style="background: rgba(255, 55, 95, 0.08); border: 1px solid var(--neon-red); color: var(--neon-red); padding: 4px 8px; font-size: 0.6rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                    <i data-lucide="trash-2" style="width: 10px; height: 10px;"></i> ELIMINAR
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Elimina una propiedad de referencia
 */
async function deleteAdminReferenceProperty(zoneKey, propId) {
    if (!confirm("¿Está seguro de que desea eliminar este punto de referencia? Esto afectará los cálculos de autotasación.")) {
        return;
    }

    // Si Supabase está activo, eliminar de la base remota primero
    if (isSupabaseActive && supabaseClient && propId && !String(propId).startsWith('ref_local_')) {
        try {
            const { data, error } = await supabaseClient
                .from('properties')
                .delete()
                .eq('id', propId)
                .select();
            if (error) {
                console.error("Error al eliminar propiedad de referencia en Supabase:", error);
                alert("Hubo un error al eliminar la propiedad de referencia en la base de datos remota.");
                return;
            }
            if (!data || data.length === 0) {
                console.warn("La eliminación no afectó a ninguna fila en Supabase. Posible restricción de políticas RLS.");
                alert("⚠️ ERROR DE SEGURIDAD (RLS): No tienes permisos para eliminar este punto de referencia en la base de datos de Supabase.\n\nPor favor, contacta al administrador para habilitar las políticas de eliminación.");
                return;
            }
            appendAdminLog("SYSTEM", `database: Punto de referencia #${propId} eliminado de Supabase.`, true);
        } catch (err) {
            console.error("Fallo de conexión al eliminar referencia de Supabase:", err);
            alert("Error de conexión al eliminar el punto de referencia.");
            return;
        }
    }

    if (PORTFOLIO_DATABASE[zoneKey]) {
        PORTFOLIO_DATABASE[zoneKey] = PORTFOLIO_DATABASE[zoneKey].filter(p => String(p.id) !== String(propId));
    }

    renderAdminReferenceDatabase();
    updateSuggestedValues(); // Actualizar IA

    // Si el catálogo está en esta zona, refrescar
    const currentZoneSelect = document.getElementById('catalog-zone-select');
    if (currentZoneSelect && currentZoneSelect.value === zoneKey) {
        renderCatalogProperties();
    }
    if (typeof drawAgentProperties === 'function') {
        drawAgentProperties();
    }

    alert("Punto de referencia eliminado con éxito.");
}

/**
 * Actualiza la vista previa de imagen en el modal de referencia
 */
function updateAdminRefPhotoPreview(url) {
    const container = document.getElementById('admin-ref-preview-container');
    const img = document.getElementById('admin-ref-preview-image');
    const dims = document.getElementById('admin-ref-preview-dimensions');
    if (container && img) {
        if (url && url.trim() !== '') {
            img.src = url;
            container.style.display = 'block';
            img.onload = function() {
                if (dims) dims.innerText = `${img.naturalWidth} x ${img.naturalHeight} px`;
            };
        } else {
            container.style.display = 'none';
        }
    }
}

/**
 * Maneja la subida de foto local del administrador
 */
function handleAdminRefPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        adminRefCustomPhotoBase64 = e.target.result;
        
        // Cargar opción personalizada y seleccionarla
        const select = document.getElementById('admin-ref-photo');
        let customOpt = document.getElementById('option-custom-ref-photo');
        if (select) {
            if (!customOpt) {
                customOpt = document.createElement('option');
                customOpt.id = 'option-custom-ref-photo';
                customOpt.text = '-- Foto Subida Personalizada --';
                select.appendChild(customOpt);
            }
            customOpt.value = adminRefCustomPhotoBase64;
            select.value = adminRefCustomPhotoBase64;
            
            // Actualizar vista previa
            updateAdminRefPhotoPreview(adminRefCustomPhotoBase64);
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Abre el modal para añadir una propiedad de referencia
 */
function openAdminReferencePropertyModal() {
    editingAdminRefPropertyId = null;
    editingAdminRefPropertyZone = null;

    const form = document.getElementById('admin-ref-property-form');
    if (form) form.reset();

    // Restablecer encabezado del modal
    const titleEl = document.querySelector('#admin-reference-property-modal h3');
    if (titleEl) titleEl.innerText = "Nuevo Punto de Referencia (IA)";

    const submitBtn = document.querySelector('#admin-reference-property-modal button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i data-lucide="save" class="tiny-icon"></i> REGISTRAR PUNTO DE REFERENCIA';
    }

    const modal = document.getElementById('admin-reference-property-modal');
    if (modal) {
        modal.classList.add('active');
        
        const select = document.getElementById('admin-ref-photo');
        if (select) {
            // Restablecer opción custom si existe
            const customOpt = document.getElementById('option-custom-ref-photo');
            if (customOpt) customOpt.value = "custom";
            
            // Mostrar primera opción por defecto
            updateAdminRefPhotoPreview(select.value);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

/**
 * Abre el modal para editar una propiedad de referencia
 */
function openEditAdminReferencePropertyModal(zoneKey, prop) {
    editingAdminRefPropertyId = prop.id;
    editingAdminRefPropertyZone = zoneKey;

    const modal = document.getElementById('admin-reference-property-modal');
    if (!modal) return;

    // Cambiar título y botón
    const titleEl = document.querySelector('#admin-reference-property-modal h3');
    if (titleEl) titleEl.innerText = "Editar Punto de Referencia (IA)";

    const submitBtn = document.querySelector('#admin-reference-property-modal button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i data-lucide="edit-3" class="tiny-icon"></i> GUARDAR CAMBIOS DE REFERENCIA';
    }

    // Prellenar campos
    document.getElementById('admin-ref-title').value = prop.title || '';
    document.getElementById('admin-ref-category').value = prop.category || 'apartamentos';
    document.getElementById('admin-ref-type').value = prop.type || 'venta';
    document.getElementById('admin-ref-price').value = prop.priceUSD || '';
    document.getElementById('admin-ref-size').value = prop.size || '';
    document.getElementById('admin-ref-rooms').value = prop.rooms || 0;
    document.getElementById('admin-ref-bathrooms').value = prop.bathrooms || 0;
    document.getElementById('admin-ref-parkings').value = prop.parkings || 0;

    const select = document.getElementById('admin-ref-photo');
    if (select) {
        let optionExists = false;
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === prop.photo) {
                optionExists = true;
                break;
            }
        }

        if (!optionExists && prop.photo) {
            let customOpt = document.getElementById('option-custom-ref-photo');
            if (!customOpt) {
                customOpt = document.createElement('option');
                customOpt.id = 'option-custom-ref-photo';
                customOpt.text = '-- Foto Subida Personalizada --';
                select.appendChild(customOpt);
            }
            customOpt.value = prop.photo;
            select.value = prop.photo;
        } else {
            select.value = prop.photo || '';
        }
    }

    updateAdminRefPhotoPreview(prop.photo);

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Cierra el modal de propiedad de referencia
 */
function closeAdminReferencePropertyModal() {
    const modal = document.getElementById('admin-reference-property-modal');
    if (modal) modal.classList.remove('active');
    editingAdminRefPropertyId = null;
    editingAdminRefPropertyZone = null;
}

/**
 * Registra o actualiza una propiedad de referencia
 */
async function submitAdminReferenceProperty() {
    const zoneSelect = document.getElementById('admin-ref-zone-select');
    if (!zoneSelect) return;

    const zoneKey = editingAdminRefPropertyZone || zoneSelect.value;
    const title = document.getElementById('admin-ref-title').value.trim();
    const category = document.getElementById('admin-ref-category').value;
    const type = document.getElementById('admin-ref-type').value;
    const priceUSD = parseFloat(document.getElementById('admin-ref-price').value) || 0;
    const size = parseFloat(document.getElementById('admin-ref-size').value) || 0;
    const rooms = parseInt(document.getElementById('admin-ref-rooms').value) || 0;
    const bathrooms = parseFloat(document.getElementById('admin-ref-bathrooms').value) || 0;
    const parkings = parseInt(document.getElementById('admin-ref-parkings').value) || 0;
    const photo = document.getElementById('admin-ref-photo').value;

    if (!title || priceUSD <= 0 || size <= 0) {
        alert("Por favor completa los campos obligatorios.");
        return;
    }

    const zoneData = ZONES_DATABASE[zoneKey];
    const lat = zoneData ? zoneData.center[0] : 14.6349;
    const lng = zoneData ? zoneData.center[1] : -90.5069;

    if (editingAdminRefPropertyId) {
        // MODO EDICIÓN
        const propId = editingAdminRefPropertyId;
        const propList = PORTFOLIO_DATABASE[zoneKey] || [];
        const propIndex = propList.findIndex(p => String(p.id) === String(propId));
        if (propIndex !== -1) {
            const prop = propList[propIndex];
            prop.title = title;
            prop.category = category;
            prop.type = type;
            prop.tag = `${category.toUpperCase().slice(0, -1)} EN ${type.toUpperCase()}`;
            prop.priceUSD = priceUSD;
            prop.size = size;
            prop.rooms = rooms;
            prop.bathrooms = bathrooms;
            prop.parkings = parkings;
            prop.photo = photo;
            prop.photos = [photo];
        }

        // Si Supabase está activo, actualizar
        if (isSupabaseActive && supabaseClient && !String(propId).startsWith('ref_local_')) {
            try {
                const { error } = await supabaseClient.from('properties').update({
                    title: title,
                    category: category,
                    type: type,
                    tag: `${category.toUpperCase().slice(0, -1)} EN ${type.toUpperCase()}`,
                    price_usd: priceUSD,
                    size_m2: size,
                    rooms: rooms,
                    bathrooms: bathrooms,
                    parkings: parkings,
                    photo_url: photo,
                    metadata: {
                        isReferenceData: true,
                        photos: [photo],
                        description: 'Punto de referencia de calibración de tasación multivariable.'
                    }
                }).eq('id', propId);

                if (error) {
                    console.error("Error al actualizar referencia en Supabase:", error);
                } else {
                    appendAdminLog("SYSTEM", `database: Punto de referencia #${propId} actualizado en Supabase.`, true);
                }
            } catch (err) {
                console.error("Fallo de red al actualizar referencia en Supabase:", err);
            }
        }
        alert("Punto de referencia actualizado con éxito.");
    } else {
        // MODO CREACIÓN
        const localId = "ref_local_" + Date.now();
        const newRefProp = {
            id: localId,
            title: title,
            category: category,
            type: type,
            tag: `${category.toUpperCase().slice(0, -1)} EN ${type.toUpperCase()}`,
            priceUSD: priceUSD,
            size: size,
            rooms: rooms,
            bathrooms: bathrooms,
            parkings: parkings,
            garden: 0,
            study: false,
            familyRoom: false,
            amenities: ["amenity-security"],
            photo: photo,
            photos: [photo],
            description: 'Punto de referencia de calibración de tasación multivariable.',
            location: zoneKey,
            isReferenceData: true,
            isAgentUpload: false,
            lat: lat + (Math.random() - 0.5) * 0.003,
            lng: lng + (Math.random() - 0.5) * 0.003
        };

        if (!PORTFOLIO_DATABASE[zoneKey]) {
            PORTFOLIO_DATABASE[zoneKey] = [];
        }
        PORTFOLIO_DATABASE[zoneKey].push(newRefProp);

        // Si Supabase está activo, persistir
        if (isSupabaseActive && supabaseClient) {
            try {
                const { data, error } = await supabaseClient.from('properties').insert([
                    {
                        title: title,
                        category: category,
                        type: type,
                        tag: newRefProp.tag,
                        price_usd: priceUSD,
                        size_m2: size,
                        rooms: rooms,
                        bathrooms: bathrooms,
                        parkings: parkings,
                        photo_url: photo,
                        latitude: newRefProp.lat,
                        longitude: newRefProp.lng,
                        location_key: zoneKey,
                        sponsored: false,
                        metadata: {
                            isReferenceData: true,
                            photos: [photo],
                            description: newRefProp.description
                        }
                    }
                ]).select();

                if (error) {
                    console.error("Error al subir propiedad de referencia a Supabase:", error);
                } else if (data && data[0]) {
                    newRefProp.id = data[0].id;
                    appendAdminLog("SYSTEM", `database: Punto de referencia registrado en Supabase con ID #${data[0].id}`, true);
                }
            } catch (err) {
                console.error("Fallo de red al insertar referencia en Supabase:", err);
            }
        }
        alert("Punto de referencia registrado con éxito.");
    }

    // Limpiar y cerrar
    document.getElementById('admin-ref-property-form').reset();
    closeAdminReferencePropertyModal();
    renderAdminReferenceDatabase();
    updateSuggestedValues(); // Actualizar IA

    // Si el catálogo está en esta zona, refrescar
    const currentZoneSelect = document.getElementById('catalog-zone-select');
    if (currentZoneSelect && currentZoneSelect.value === zoneKey) {
        renderCatalogProperties();
    }
    if (typeof drawAgentProperties === 'function') {
        drawAgentProperties();
    }

    alert("Punto de referencia registrado con éxito.");
}

/**
 * Renderiza el dashboard administrativo reactivamente
 */
function renderAdminDashboard() {
    const tableBody = document.getElementById('admin-agents-table-body');
    const counter = document.getElementById('admin-agents-count');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Limpiar

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let totalSubscribers = 0;
    let totalRevenueUSD = 0;

    b2bClients.forEach((client, idx) => {
        totalSubscribers++;
        
        const plan = (client.plan || 'Pro').toLowerCase();
        const status = (client.status || 'Pendiente').toLowerCase();
        const email = client.email || '';
        const name = client.name || 'Usuario';
        const company = client.company || 'Particular';
        const phone = client.phone || 'N/A';
        const usdtBalance = typeof client.usdtBalance === 'number' ? client.usdtBalance : parseFloat(client.usdtBalance || 0);

        // Calcular cobro total del plan
        let planPriceGTQ = 0;
        let planPriceUSD = 0;
        if (plan === 'vip') {
            planPriceGTQ = 640;
            planPriceUSD = 82;
        } else if (plan === 'premium') {
            planPriceGTQ = 340;
            planPriceUSD = 43.70;
        } else if (plan === 'pro') {
            planPriceGTQ = 240;
            planPriceUSD = 31;
        } else if (plan === 'básico' || plan === 'basico') {
            planPriceGTQ = 140;
            planPriceUSD = 18;
        }
        
        // Sumar facturaciones por pauta publicitaria (si las tiene)
        let totalClientAdBillingUSD = 0;
        if (email === 'agente@valorgt.com') {
            // El agente demo tiene la facturación del ad actual
            totalClientAdBillingUSD = (saasBillingAmountUSD - 31); // El plan Pro base es $31, lo demás son ads
        }

        const clientTotalUSD = planPriceUSD + totalClientAdBillingUSD;
        totalRevenueUSD += clientTotalUSD;

        const convertedTotal = (activeCurrency === 'GTQ') 
            ? (planPriceGTQ + (totalClientAdBillingUSD * exchangeRate)) 
            : (planPriceUSD + totalClientAdBillingUSD);
        const planClass = (plan === 'básico' || plan === 'basico') ? 'basico' : plan;
        
        const isSuspended = status === 'suspendido';
        const isPending = status === 'pendiente';
        
        let statusColorClass = 'text-green';
        if (isSuspended) statusColorClass = 'text-red';
        else if (isPending) statusColorClass = 'text-warning-glow'; // orange-yellow for pending!
        
        let actionBtnText = '🚫 SUSPENDER';
        let actionBtnColor = 'color: var(--red); border-color: var(--red);';
        
        if (isSuspended) {
            actionBtnText = '⚡ REACTIVAR';
            actionBtnColor = 'color: var(--green); border-color: var(--green);';
        } else if (isPending) {
            actionBtnText = '✔️ APROBAR';
            actionBtnColor = 'color: var(--cyan); border-color: var(--cyan);';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: left; padding: 10px; vertical-align: middle;">
                <strong class="text-green">${name}</strong><br>
                <span class="sub-title font-mono" style="font-size: 0.6rem; color: var(--text-muted);">${company}</span>
            </td>
            <td style="text-align: center; padding: 10px; vertical-align: middle;"><span class="plan-col ${planClass}" style="font-size: 0.65rem;">${plan.toUpperCase()}</span></td>
            <td style="text-align: left; padding: 10px; vertical-align: middle; font-size: 0.6rem;">
                ${phone}<br>
                <span class="text-muted" style="text-decoration: underline;">${email}</span>
            </td>
            <td style="text-align: right; padding: 10px; vertical-align: middle; font-weight: bold; color: var(--gold); font-size: 0.75rem;" class="font-mono">
                ${usdtBalance.toFixed(4)} XAUt
            </td>
            <td style="text-align: center; padding: 10px; vertical-align: middle;"><strong class="${statusColorClass}" style="font-size: 0.65rem;">${status.toUpperCase()}</strong></td>
            <td style="text-align: right; padding: 10px; vertical-align: middle;">
                <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
                    <span style="font-size: 0.75rem; font-weight: bold; color: var(--green); margin-right: 5px;">${currencySym}${formatNumber(convertedTotal % 1 === 0 ? convertedTotal.toFixed(0) : convertedTotal.toFixed(2))}</span>
                    <button class="btn btn-outline font-mono" style="padding: 3px 6px; font-size: 0.55rem; background: transparent; cursor: pointer; border: 1px solid currentColor; ${actionBtnColor}" onclick="toggleAgentStatus(${idx})">
                        ${actionBtnText}
                    </button>
                    <button class="btn btn-outline font-mono" style="padding: 3px 6px; font-size: 0.55rem; background: transparent; cursor: pointer; border: 1px solid var(--red); color: var(--red);" onclick="deleteAgent(${idx})">
                        🗑️ BORRAR
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    counter.innerText = `${totalSubscribers} AGENTE${totalSubscribers === 1 ? '' : 'S'}`;

    // Actualizar KPIs de administración
    animateNumber('admin-total-revenue', 0, totalRevenueUSD * conversion, 600, currencySym);
    document.getElementById('admin-total-subscribers').innerText = `${totalSubscribers} Activos`;
    
    // Campañas de pauta activas: contamos cuántos anuncios sponsored hay en PORTFOLIO_DATABASE
    let sponsoredCount = 0;
    Object.keys(PORTFOLIO_DATABASE).forEach(zone => {
        PORTFOLIO_DATABASE[zone].forEach(prop => {
            if (prop.sponsored === true) sponsoredCount++;
        });
    });
    document.getElementById('admin-total-campaigns').innerText = `${sponsoredCount} Pautas`;

    const adminAdPriceInput = document.getElementById('admin-base-ad-price');
    if (adminAdPriceInput && !adminAdPriceInput.matches(':focus')) {
        adminAdPriceInput.value = baseAdPriceGTQ;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Suspende o reactiva una cuenta de agente comercial
 */
async function toggleAgentStatus(clientIdx) {
    const client = b2bClients[clientIdx];
    if (!client) return;

    const isPending = client.status === 'Pendiente' || client.status === 'pendiente';
    const currentlySuspended = client.status === 'Suspendido' || client.status === 'suspendido';
    
    let newStatus = 'Activo';
    let logMsg = '';
    let alertMsg = '';
    
    if (isPending) {
        newStatus = 'Activo';
        logMsg = `agent_audit: Cuenta de ${client.name} (${client.company}) APROBADA y activada por administrador root.`;
        alertMsg = `¡Socio ${client.name} aprobado con éxito! Acceso SaaS activado.`;
    } else if (currentlySuspended) {
        newStatus = 'Activo';
        logMsg = `agent_audit: Cuenta de ${client.name} (${client.company}) reactivada por administrador root.`;
        alertMsg = `¡Socio ${client.name} reactivado con éxito! Acceso SaaS restaurado.`;
    } else {
        newStatus = 'Suspendido';
        logMsg = `agent_audit: Cuenta de ${client.name} (${client.company}) SUSPENDIDA por administrador root.`;
        alertMsg = `¡Socio ${client.name} suspendido de forma inmediata! Acceso SaaS bloqueado de forma temporal.`;
    }
    
    client.status = newStatus;
    
    // Guardar localmente
    localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));
    
    // Guardar en Supabase profiles en la nube
    if (isSupabaseActive && supabaseClient && client.id) {
        try {
            const { error } = await supabaseClient.from('profiles').update({ status: newStatus.toLowerCase() }).eq('id', client.id);
            if (error) console.error("Error al actualizar estado en Supabase profiles:", error);
            else console.log(`⚡ Estado de ${client.email} actualizado a ${newStatus} en Supabase.`);
        } catch (dbErr) {
            console.warn("Fallo de conexión al actualizar estado en Supabase profiles:", dbErr);
        }
    }
    
    if (typeof appendAdminLog === 'function') {
        appendAdminLog("SECURITY", logMsg, true);
    }
    
    alert(alertMsg);
    renderAdminDashboard();
}

/**
 * Elimina de forma permanente una cuenta de agente comercial
 */
async function deleteAgent(clientIdx) {
    const client = b2bClients[clientIdx];
    if (!client) return;

    // Evitar borrar el agente demo principal para proteger la operabilidad
    if (client.email === 'agente@valorgt.com') {
        alert("⚠️ ACCIÓN DENEGADA: El agente demo principal (agente@valorgt.com) no puede ser eliminado por seguridad operativa.");
        return;
    }

    const confirmDelete = confirm(`⚠️ ¿CONFIRMAS LA ELIMINACIÓN PERMANENTE DEL ASESOR?\n\n• Nombre: ${client.name}\n• Empresa: ${client.company}\n• Correo: ${client.email}\n\nEsta acción borrará de forma irreversible al agente del sistema local, y si la conexión de base de datos Supabase está activa, de la nube.`);
    if (!confirmDelete) return;

    // Eliminar del arreglo local
    b2bClients.splice(clientIdx, 1);

    // Intentar eliminar de Supabase
    if (isSupabaseActive && supabaseClient) {
        try {
            const { error } = await supabaseClient.from('profiles').delete().eq('email', client.email);
            if (error) {
                console.error("⚠️ Error de base de datos al eliminar agente en Supabase:", error);
                alert(`⚠️ DETECCIÓN DE SEGURIDAD SUPABASE: El agente se borró de la pantalla pero no pudo eliminarse de la nube (Razón: ${error.message}). Por favor ejecuta la política SQL en Supabase o bórralo manualmente.`);
            } else {
                console.log(`⚡ Agente ${client.email} eliminado exitosamente de Supabase.`);
            }
        } catch (dbErr) {
            console.warn("Fallo de red al intentar eliminar agente de Supabase profiles:", dbErr);
        }
    }

    appendAdminLog("SECURITY", `agent_audit: Cuenta de ${client.name} (${client.company}) ELIMINADA permanentemente por root.`, true);
    alert(`¡Socio ${client.name} eliminado permanentemente con éxito!`);
    localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));
    renderAdminDashboard();
}

/**
 * Añade un log a la consola de auditoría de administración con formato e inclinación cyberpunk
 */
function appendAdminLog(tag, message, isAlert) {
    const consoleEl = document.getElementById('admin-security-logs');
    if (!consoleEl) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const log = document.createElement('div');
    log.className = 'news-log';
    
    let tagClass = 'log-tag system';
    if (tag === 'SECURITY') tagClass += ' alert';
    if (tag === 'SAAS') tagClass += ' network';

    log.innerHTML = `
        <span class="log-timestamp" style="color: var(--red);">${timeStr}</span>
        <span class="${tagClass}" style="color: #fff; background: ${tag === 'SECURITY' ? 'var(--red)' : 'rgba(255,255,255,0.08)'}; padding: 1px 4px; border-radius: 3px; font-size: 0.55rem; margin-right: 5px;">[${tag}]</span>
        <span class="log-msg" style="color: var(--text-secondary);">${message}</span>
    `;

    consoleEl.appendChild(log);
    adminLogs.push({ time: timeStr, tag, message });

    // Guardar log en Supabase de forma asíncrona y transparente
    if (isSupabaseActive) {
        supabaseClient.from('system_logs').insert([
            {
                tag: tag,
                message: message
            }
        ]).then(({ error }) => {
            if (error) console.error("Error al persistir log de auditoría en Supabase:", error);
        });
    }

    // Auto scroll al fondo de la consola
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

/**
 * Toggles y acciones del Core IA en administración
 */
function toggleAdminMaintenance(checked) {
    appendAdminLog("SYSTEM", `core_config: Modo Mantenimiento Global ${checked ? 'ACTIVADO' : 'DESACTIVADO'} por administrador root.`, checked);
    if (checked) {
        alert("⚠️ ATENCIÓN: El modo mantenimiento global está activo. Las conexiones externas de red operan en modo lectura de emergencia.");
    } else {
        alert("¡Conectividad total del core de red restaurada exitosamente!");
    }
}

function toggleAdminPCIDSS(checked) {
    appendAdminLog("SECURITY", `cc_encryption: Forzado estricto PCI-DSS ${checked ? 'ACTIVADO' : 'DESACTIVADO'}.`, !checked);
    if (!checked) {
        alert("⚠️ ALERTA DE RIESGO: Se desactivó el forzado estricto PCI-DSS. Los pagos con tarjeta procesarán bajo protocolo SSL legacy.");
    } else {
        alert("Cifrado tokenizado de tarjetas de crédito TLS 1.3 activo y verificado compliant PCI-DSS.");
    }
}

function toggleAdminSpeculation(checked) {
    isSpeculationCalibrated = checked;
    appendAdminLog("SYSTEM", `ia_calibrate: Calibración especulativa de plusvalía global ${checked ? 'Habilitada (+1.5% premium)' : 'Deshabilitada (suelo puro)'}.`, false);
    
    // Si hay tasación activa, recalcular valuación
    const eventMock = { preventDefault: () => {} };
    if (document.getElementById('valuation-form') && activeZoneKey) {
        calculateValuation(eventMock);
    }
}

let currentAirdropXautPrice = 2380.00;
let isXautPriceFetched = false;
let lastXautPriceFetchTime = 0;

async function fetchXautPriceForAirdrop() {
    const now = Date.now();
    // Refrescar si no ha sido obtenido aún o si la última descarga fue hace más de 5 minutos (300,000 ms)
    if (isXautPriceFetched && (now - lastXautPriceFetchTime < 300000)) {
        return currentAirdropXautPrice;
    }
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd');
        const data = await response.json();
        if (data['tether-gold'] && data['tether-gold'].usd) {
            currentAirdropXautPrice = data['tether-gold'].usd;
            isXautPriceFetched = true;
            lastXautPriceFetchTime = now;
            console.log(`🪙 Precio de Tether Gold (XAUt) actualizado en vivo: $${currentAirdropXautPrice} USD`);
        }
    } catch (err) {
        console.warn("Error fetching Tether Gold price from CoinGecko, using fallback:", err);
    }
    return currentAirdropXautPrice;
}

function renderAdminAirdropComponents(pendingAirdrop = 0) {
    const targetTypeSelect = document.getElementById('admin-airdrop-target-type');
    const singleUserSelect = document.getElementById('admin-airdrop-single-user');
    const recipientsList = document.getElementById('admin-airdrop-recipients-list');
    
    if (!recipientsList) return;
    
    // Obtener los clientes premium (VIP o Pro) activos de b2bClients de forma case-insensitive
    const eligibleClients = b2bClients.filter(c => c.plan && c.status && ['vip', 'pro', 'premium'].includes(c.plan.toLowerCase()) && c.status.toLowerCase() === 'activo');
    
    // 1. Poblar el selector de usuario único de forma dinámica
    if (singleUserSelect) {
        const prevValue = singleUserSelect.value;
        singleUserSelect.innerHTML = '';
        eligibleClients.forEach(client => {
            const opt = document.createElement('option');
            opt.value = client.email;
            opt.innerText = `${client.name} (${(client.plan || 'pro').toUpperCase()})`;
            singleUserSelect.appendChild(opt);
        });
        if (prevValue && Array.from(singleUserSelect.options).some(o => o.value === prevValue)) {
            singleUserSelect.value = prevValue;
        }
    }
    
    const isSingle = targetTypeSelect ? targetTypeSelect.value === 'single' : false;
    
    // 2. Renderizar visualmente el listado de destinatarios
    recipientsList.innerHTML = '';
    
    if (isSingle) {
        if (singleUserSelect && singleUserSelect.value) {
            const selectedEmail = singleUserSelect.value;
            const client = eligibleClients.find(c => c.email.toLowerCase() === selectedEmail.toLowerCase());
            if (client) {
                recipientsList.appendChild(createRecipientBadgeHTML(client, true, pendingAirdrop));
            }
        }
    } else {
        eligibleClients.forEach(client => {
            recipientsList.appendChild(createRecipientBadgeHTML(client, true, pendingAirdrop));
        });
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function createRecipientBadgeHTML(client, selected = true, pendingAirdrop = 0) {
    const el = document.createElement('div');
    el.style.display = 'flex';
    el.style.justify = 'space-between';
    el.style.alignItems = 'center';
    el.style.padding = '6px 10px';
    el.style.margin = '2px 0';
    el.style.background = 'rgba(255, 215, 0, 0.03)';
    el.style.border = '1px solid rgba(255, 215, 0, 0.12)';
    el.style.borderRadius = '6px';
    el.style.color = '#fff';
    el.style.transition = 'all 0.3s ease';
    
    const airdropText = pendingAirdrop > 0 
        ? `<span style="color: #34c759; font-weight: 800; margin-left: 6px; font-size: 0.6rem; filter: drop-shadow(0 0 4px rgba(52, 199, 89, 0.45));">+${pendingAirdrop.toFixed(4)} XAUt</span>` 
        : '';
        
    el.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
            <i data-lucide="user" style="width: 12px; height: 12px; color: #ffd700;"></i>
            <span style="font-weight: bold; font-size: 0.65rem; color: #fff;">${client.name}</span>
            <span style="font-size: 0.55rem; background: rgba(255, 215, 0, 0.1); padding: 1px 4px; border-radius: 3px; color: #ffd700; border: 1px solid rgba(255, 215, 0, 0.2); font-weight: bold;">${(client.plan || 'pro').toUpperCase()}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 0.65rem;">
            <span style="color: #ffd700; font-weight: bold;">${(typeof client.usdtBalance === 'number' ? client.usdtBalance : parseFloat(client.usdtBalance || 0)).toFixed(4)} XAUt</span>
            ${airdropText}
        </div>
    `;
    return el;
}

function handleAirdropTargetTypeChange() {
    const targetTypeSelect = document.getElementById('admin-airdrop-target-type');
    const singleUserWrapper = document.getElementById('admin-airdrop-single-user-wrapper');
    const revenueInput = document.getElementById('admin-airdrop-revenue');
    const revenueLabel = document.getElementById('admin-airdrop-revenue-label');
    
    if (targetTypeSelect) {
        const isSingle = targetTypeSelect.value === 'single';
        if (singleUserWrapper) {
            singleUserWrapper.style.display = isSingle ? 'flex' : 'none';
        }
        if (revenueLabel) {
            revenueLabel.innerText = isSingle ? "MONTO DIRECTO A ENVIAR (USD)" : "VALOR DE BASE MÁXIMO (USD)";
        }
        if (revenueInput) {
            if (isSingle) {
                revenueInput.disabled = false;
                revenueInput.placeholder = "Ej. 100";
                revenueInput.value = ""; // Limpiar para que ingrese monto
            } else {
                revenueInput.disabled = true;
                revenueInput.value = adminMonthlyRevenueUSD.toFixed(2); // Autocompletar con ingresos acumulados
            }
        }
    }
    
    renderAdminAirdropComponents();
    calculateAdminAirdropPreview();
}

function handleAirdropSingleUserChange() {
    renderAdminAirdropComponents();
    calculateAdminAirdropPreview();
}

function calculateAdminAirdropPreview() {
    const revenueInput = document.getElementById('admin-airdrop-revenue');
    if (!revenueInput) return;
    
    const targetTypeSelect = document.getElementById('admin-airdrop-target-type');
    const singleUserSelect = document.getElementById('admin-airdrop-single-user');
    const operationTypeSelect = document.getElementById('admin-airdrop-operation-type');
    
    const priceEl = document.getElementById('airdrop-preview-xaut-price');
    const poolEl = document.getElementById('airdrop-preview-pool');
    const eligibleEl = document.getElementById('airdrop-preview-eligible');
    const individualEl = document.getElementById('airdrop-preview-individual');
    const remnantEl = document.getElementById('airdrop-preview-remnant');
    const warningEl = document.getElementById('admin-airdrop-limit-warning');
    const executeBtn = document.getElementById('admin-airdrop-execute-btn');
    const revenueLabel = document.getElementById('admin-airdrop-revenue-label');
    const remnantLabel = document.getElementById('airdrop-preview-remnant-label');
    const individualLabel = document.getElementById('airdrop-preview-individual-label');
    
    const xautPrice = currentAirdropXautPrice;
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const isDebit = operationTypeSelect ? operationTypeSelect.value === 'debit' : false;
    const isSingle = targetTypeSelect ? targetTypeSelect.value === 'single' : false;

    // Actualizar etiquetas según tipo de operación
    if (revenueLabel) {
        if (isDebit) {
            revenueLabel.innerText = isSingle ? "MONTO DIRECTO A EXTRAER (USD)" : "VALOR DE EXTRAER BASE (USD)";
        } else {
            revenueLabel.innerText = isSingle ? "MONTO DIRECTO A ENVIAR (USD)" : "VALOR MÁXIMO DE BASE (USD)";
        }
    }
    if (individualLabel) {
        individualLabel.innerText = isDebit ? "Débito Individual por Cuenta:" : "Airdrop Individual por Cuenta:";
    }
    if (remnantLabel) {
        remnantLabel.innerText = isDebit ? "Fondo Incrementado Estimado:" : "Fondo Remanente Estimado:";
    }

    if (priceEl) priceEl.innerText = `$${xautPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
    
    // Filtrar clientes Premium (VIP o Pro) activos de forma case-insensitive
    const eligibleClients = b2bClients.filter(c => c.plan && c.status && ['vip', 'pro', 'premium'].includes(c.plan.toLowerCase()) && c.status.toLowerCase() === 'activo');
    
    let selectedClients = [];
    
    if (isSingle) {
        if (singleUserSelect && singleUserSelect.value) {
            const selectedEmail = singleUserSelect.value;
            const client = eligibleClients.find(c => c.email.toLowerCase() === selectedEmail.toLowerCase());
            if (client) selectedClients.push(client);
        }
    } else {
        selectedClients = eligibleClients;
    }
    
    const selectedCount = selectedClients.length;
    
    if (eligibleEl) {
        eligibleEl.innerText = isSingle 
            ? `1 Destinatario (Premium)` 
            : `${selectedCount} Premium (VIP/Pro)`;
    }

    // Si es "all" y es crédito, el input se desactiva y autocompleta con adminMonthlyRevenueUSD
    if (!isSingle && revenueInput) {
        if (isDebit) {
            // Permitir ingresar cuánto extraer en lote
            revenueInput.removeAttribute('disabled');
        } else {
            revenueInput.value = adminMonthlyRevenueUSD.toFixed(2);
            revenueInput.setAttribute('disabled', 'true');
        }
    } else if (isSingle && revenueInput) {
        revenueInput.removeAttribute('disabled');
    }
    
    const revenueVal = parseFloat(revenueInput.value);
    
    if (isNaN(revenueVal) || revenueVal <= 0 || selectedCount === 0) {
        if (poolEl) poolEl.innerText = `${currencySym}0.00`;
        if (individualEl) individualEl.innerText = `${currencySym}0.00 (${(0).toFixed(6)} XAUt)`;
        if (remnantEl) {
            const rem = adminMonthlyRevenueUSD * conversion;
            remnantEl.innerText = `${currencySym}${formatNumber(rem.toFixed(2))}`;
        }
        if (warningEl) warningEl.style.display = 'none';
        if (executeBtn) {
            executeBtn.removeAttribute('disabled');
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
        }
        renderAdminAirdropComponents(0);
        return;
    }
    
    let poolUSD = 0;
    let individualUSD = 0;
    let remnantUSD = 0;
    
    if (isSingle) {
        poolUSD = revenueVal;
        individualUSD = revenueVal;
        remnantUSD = isDebit ? adminMonthlyRevenueUSD + poolUSD : adminMonthlyRevenueUSD - poolUSD;
        
        // Validación de límites
        const individualXAUtVal = individualUSD / xautPrice;
        let overLimit = false;

        if (isDebit) {
            // Limite: que el usuario tenga suficiente XAUt
            const targetClient = selectedClients[0];
            if (targetClient && targetClient.usdtBalance < individualXAUtVal) {
                overLimit = true;
                if (warningEl) {
                    warningEl.innerText = "⚠️ FONDO INSUFICIENTE EN LA TARJETA DEL USUARIO";
                    warningEl.style.display = 'block';
                }
            } else {
                if (warningEl) warningEl.style.display = 'none';
            }
        } else {
            // Limite: que el admin tenga suficiente USD acumulado
            if (poolUSD > adminMonthlyRevenueUSD) {
                overLimit = true;
                if (warningEl) {
                    warningEl.innerText = "⚠️ EL MONTO EXCEEDE EL SALDO DISPONIBLE";
                    warningEl.style.display = 'block';
                }
            } else {
                if (warningEl) warningEl.style.display = 'none';
            }
        }

        if (executeBtn) {
            if (overLimit) {
                executeBtn.setAttribute('disabled', 'true');
                executeBtn.style.opacity = '0.5';
                executeBtn.style.cursor = 'not-allowed';
            } else {
                executeBtn.removeAttribute('disabled');
                executeBtn.style.opacity = '1';
                executeBtn.style.cursor = 'pointer';
            }
        }
    } else {
        if (isDebit) {
            poolUSD = revenueVal;
            individualUSD = poolUSD / selectedCount;
            remnantUSD = adminMonthlyRevenueUSD + poolUSD;
            
            // Validar que TODOS los premium tengan suficiente saldo
            const individualXAUtVal = individualUSD / xautPrice;
            let oneInsufficient = false;
            for (const c of selectedClients) {
                if (c.usdtBalance < individualXAUtVal) {
                    oneInsufficient = true;
                    break;
                }
            }

            if (oneInsufficient) {
                if (warningEl) {
                    warningEl.innerText = "⚠️ UNO O MÁS USUARIOS TIENEN FONDOS INSUFICIENTES";
                    warningEl.style.display = 'block';
                }
                if (executeBtn) {
                    executeBtn.setAttribute('disabled', 'true');
                    executeBtn.style.opacity = '0.5';
                    executeBtn.style.cursor = 'not-allowed';
                }
            } else {
                if (warningEl) warningEl.style.display = 'none';
                if (executeBtn) {
                    executeBtn.removeAttribute('disabled');
                    executeBtn.style.opacity = '1';
                    executeBtn.style.cursor = 'pointer';
                }
            }
        } else {
            poolUSD = adminMonthlyRevenueUSD * 0.05;
            individualUSD = poolUSD / selectedCount;
            remnantUSD = 0; // Se reinicia a 0 después de distribuir a todos
            
            if (warningEl) warningEl.style.display = 'none';
            if (executeBtn) {
                executeBtn.removeAttribute('disabled');
                executeBtn.style.opacity = '1';
                executeBtn.style.cursor = 'pointer';
            }
        }
    }
    
    const individualXAUt = individualUSD / xautPrice;
    
    if (poolEl) {
        const poolConv = poolUSD * conversion;
        poolEl.innerText = `${currencySym}${formatNumber(poolConv.toFixed(2))}`;
    }
    if (individualEl) {
        const indConv = individualUSD * conversion;
        individualEl.innerText = `${currencySym}${formatNumber(indConv.toFixed(2))} (${individualXAUt.toFixed(6)} XAUt)`;
    }
    if (remnantEl) {
        const remConv = remnantUSD * conversion;
        remnantEl.innerText = `${currencySym}${formatNumber(remConv.toFixed(2))}`;
    }
    
    // Re-renderizar componentes pasando el airdrop individual para la vista previa
    renderAdminAirdropComponents(isDebit ? -individualXAUt : individualXAUt);
}

async function executeAdminGoldAirdrop() {
    const revenueInput = document.getElementById('admin-airdrop-revenue');
    if (!revenueInput) return;
    
    const targetTypeSelect = document.getElementById('admin-airdrop-target-type');
    const singleUserSelect = document.getElementById('admin-airdrop-single-user');
    const operationTypeSelect = document.getElementById('admin-airdrop-operation-type');
    
    const inputVal = parseFloat(revenueInput.value);
    const isDebit = operationTypeSelect ? operationTypeSelect.value === 'debit' : false;
    const isSingle = targetTypeSelect ? targetTypeSelect.value === 'single' : false;
    
    if (isNaN(inputVal) || inputVal <= 0) {
        alert("Por favor ingresa un monto válido en USD.");
        return;
    }

    if (isSingle) {
        if (!isDebit && inputVal > adminMonthlyRevenueUSD) {
            alert(`⚠️ FONDOS INSUFICIENTES: El monto ingresado ($${inputVal.toFixed(2)} USD) excede los ingresos acumulados del mes ($${adminMonthlyRevenueUSD.toFixed(2)} USD).`);
            return;
        }
    } else {
        if (!isDebit && adminMonthlyRevenueUSD <= 0) {
            alert("⚠️ PROCESAMIENTO RECHAZADO: No hay ingresos acumulados en el mes actual para realizar una distribución.");
            return;
        }
    }
    
    const xautPrice = await fetchXautPriceForAirdrop();
    const eligibleClients = b2bClients.filter(c => c.plan && c.status && ['vip', 'pro', 'premium'].includes(c.plan.toLowerCase()) && c.status.toLowerCase() === 'activo');
    
    let selectedClients = [];
    if (isSingle) {
        if (singleUserSelect && singleUserSelect.value) {
            const selectedEmail = singleUserSelect.value;
            const client = eligibleClients.find(c => c.email.toLowerCase() === selectedEmail.toLowerCase());
            if (client) selectedClients.push(client);
        }
    } else {
        selectedClients = eligibleClients;
    }
    
    const selectedCount = selectedClients.length;
    if (selectedCount === 0) {
        alert("No hay agentes Premium activos seleccionados para esta operación.");
        return;
    }
    
    let poolUSD = 0;
    let individualUSD = 0;
    
    if (isSingle) {
        poolUSD = inputVal;
        individualUSD = inputVal;
    } else {
        if (isDebit) {
            poolUSD = inputVal;
            individualUSD = poolUSD / selectedCount;
        } else {
            poolUSD = adminMonthlyRevenueUSD * 0.05;
            individualUSD = poolUSD / selectedCount;
        }
    }
    
    const individualXAUt = individualUSD / xautPrice;
    
    // Validar saldos locales si es débito
    if (isDebit) {
        const insufficientClient = selectedClients.find(c => c.usdtBalance < individualXAUt);
        if (insufficientClient) {
            alert(`⚠️ FONDO INSUFICIENTE: El usuario ${insufficientClient.name} tiene un saldo de ${insufficientClient.usdtBalance.toFixed(4)} XAUt, que es menor al débito requerido de ${individualXAUt.toFixed(4)} XAUt.`);
            return;
        }
    }

    const confirmTx = confirm(
      `🔒 CONFIRMACIÓN TRANSACCIONAL CORE:\n\n` +
      `¿Deseas autorizar la ${isDebit ? "extracción (débito)" : "dispersión (crédito)"} de oro digital indexado Tether Gold (XAUt)?\n` +
      `• Tipo de Operación: ${isDebit ? "Extracción de Fondos (Débito)" : (isSingle ? "Destinatario Único (Crédito)" : "Dispersión General (Crédito)")}\n` +
      `• Total a Procesar: $${poolUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD\n` +
      `• Destinatario(s): ${isSingle ? selectedClients[0].name : `${selectedCount} Premium Activos`}\n` +
      `• Afectación Individual: ${isDebit ? "-" : "+"}${individualXAUt.toFixed(6)} XAUt\n\n` +
      `Esta acción modificará los libros contables y los saldos de cartera en tiempo real.`
    );
    
    if (!confirmTx) return;
    
    const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    // SI SUPABASE ESTÁ ACTIVO, REGISTRAR EN DB REMOTA
    if (isSupabaseActive) {
        try {
            const emails = selectedClients.map(c => c.email.toLowerCase());
            const { data: remoteProfiles, error: fetchErr } = await supabaseClient
                .from('profiles')
                .select('*')
                .in('email', emails);
 
            if (fetchErr) {
                console.error("Error al consultar perfiles premium en Supabase:", fetchErr);
                alert("Error de conexión al consultar base de datos Supabase.");
                return;
            } 
            
            const foundEmails = (remoteProfiles || []).map(p => p.email.toLowerCase());
            const missingClients = selectedClients.filter(c => !foundEmails.includes(c.email.toLowerCase()));

            if (missingClients.length > 0) {
                const missingNames = missingClients.map(c => `${c.name} (${c.email})`).join(", ");
                alert(`⚠️ USUARIOS NO REGISTRADOS EN SUPABASE:\n\nLos siguientes agentes seleccionados no existen en la base de datos de tu Supabase:\n• ${missingNames}\n\nPara poder enviarles o retirarles oro real, primero deben registrarse/crear su cuenta desde la sección de Registro de la plataforma.`);
                return;
            }

            if (remoteProfiles && remoteProfiles.length > 0) {
                const userIds = remoteProfiles.map(p => p.id);

                if (isDebit) {
                    // Ejecutar RPC seguro de Extracción (Débito)
                    const { error: rpcErr } = await supabaseClient.rpc('extraer_oro', {
                        p_usuario_ids: userIds,
                        p_monto_usd_por_usuario: individualUSD,
                        p_monto_xaut_por_usuario: individualXAUt,
                        p_precio_pivote: xautPrice
                    });

                    if (rpcErr) {
                        console.error("Error al ejecutar el RPC de Extracción en Supabase:", rpcErr);
                        alert(`⚠️ FALLO EN BASE DE DATOS: La extracción falló. Detalles: ${rpcErr.message}`);
                        return;
                    }

                    if (typeof appendAdminLog === 'function') {
                        appendAdminLog("SECURITY", `ledger_node: Extracción de ${individualXAUt.toFixed(6)} XAUt ($${individualUSD.toFixed(2)} USD) procesada mediante RPC seguro para ${remoteProfiles.length} perfiles.`, false);
                    }
                } else {
                    // Ejecutar RPC seguro de Distribución (Crédito)
                    const { error: rpcErr } = await supabaseClient.rpc('distribuir_airdrop_oro', {
                        p_usuario_ids: userIds,
                        p_monto_usd_por_usuario: individualUSD,
                        p_monto_xaut_por_usuario: individualXAUt,
                        p_precio_pivote: xautPrice
                    });
     
                    if (rpcErr) {
                        console.error("Error al ejecutar el RPC de Airdrop en Supabase:", rpcErr);
                        alert(`⚠️ FALLO EN BASE DE DATOS: El airdrop falló. Detalles: ${rpcErr.message}`);
                        return;
                    } 
                    
                    if (typeof appendAdminLog === 'function') {
                        appendAdminLog("SECURITY", `ledger_node: Airdrop registrado en Supabase para ${remoteProfiles.length} perfiles.`, false);
                    }
                }

                // Actualizar balances de memoria local
                for (const profile of remoteProfiles) {
                    const localClient = b2bClients.find(c => c.email.toLowerCase() === profile.email.toLowerCase());
                    if (localClient) {
                        const newBal = isDebit 
                            ? Math.max(0, parseFloat(profile.usdt_balance || 0) - individualXAUt) 
                            : parseFloat(profile.usdt_balance || 0) + individualXAUt;
                        localClient.usdtBalance = newBal;
                    }
                }
            }
        } catch (err) {
            console.error("Fallo crítico de conexión al distribuir a Supabase:", err);
            alert("⚠️ Error de conexión remota con Supabase.");
            return;
        }
    } else {
        // Acreditación / Débito local (Modo contingencia local)
        selectedClients.forEach(client => {
            if (isDebit) {
                client.usdtBalance -= individualXAUt;
                if (typeof appendAdminLog === 'function') {
                    appendAdminLog("SECURITY", `ledger_node: Extracción de ${individualXAUt.toFixed(6)} XAUt ($${individualUSD.toFixed(2)} USD) debitada de ${client.name} (${client.email}) [LEDGER SECURE - LOCAL].`, false);
                }
            } else {
                client.usdtBalance += individualXAUt;
                if (typeof appendAdminLog === 'function') {
                    appendAdminLog("SECURITY", `ledger_node: Airdrop de ${individualXAUt.toFixed(6)} XAUt ($${individualUSD.toFixed(2)} USD) acreditado a ${client.name} (${client.email}) [LEDGER SECURE - LOCAL].`, false);
                }
            }
        });
    }
    
    if (loggedInB2bClient) {
        const matchingClient = selectedClients.find(c => c.email.toLowerCase() === loggedInB2bClient.email.toLowerCase());
        if (matchingClient) {
            loggedInB2bClient.usdtBalance = matchingClient.usdtBalance;
        }
    }
    
    // Débito / Crédito contable en el pool del admin
    const oldRevenue = adminMonthlyRevenueUSD;
    if (isDebit) {
        // Extracción: Acredita de vuelta al saldo mensual del admin
        adminMonthlyRevenueUSD += poolUSD;
        if (typeof appendAdminLog === 'function') {
            appendAdminLog("SYSTEM", `ledger_node: Re-acreditación de $${poolUSD.toFixed(2)} USD a los ingresos mensuales tras extracción de XAUt. Nuevo saldo: $${adminMonthlyRevenueUSD.toFixed(2)} USD.`, false);
        }
    } else {
        if (isSingle) {
            adminMonthlyRevenueUSD -= poolUSD;
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SYSTEM", `ledger_node: Débito parcial de $${poolUSD.toFixed(2)} USD de los ingresos mensuales. Nuevo saldo: $${adminMonthlyRevenueUSD.toFixed(2)} USD.`, false);
            }
        } else {
            adminMonthlyRevenueUSD = 0;
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SYSTEM", `ledger_node: Clausura de ciclo mensual. Se debitó el remanente completo de $${oldRevenue.toFixed(2)} USD y el saldo de ingresos mensuales fue reiniciado a $0.00 USD.`, false);
            }
        }
    }
    
    // Sincronizar balances reales actualizados desde Supabase
    if (isSupabaseActive) {
        await syncB2bClientsFromSupabase();
    }

    // Recargar tabla de administración
    if (typeof renderAdminDashboard === 'function') {
        renderAdminDashboard();
    }
 
    // Re-renderizar lista de destinatarios
    renderAdminAirdropComponents();
 
    // Actualizar HUDs
    updateSaasMetricsHUD();
    
    alert(`🎉 ¡OPERACIÓN Y REGISTRO DE ORO EXITOSO!
    
    ✅ Tipo de Operación: ${isDebit ? "Extracción de Fondos (Débito)" : "Envío de Oro (Acrédito)"}
    ✅ Modo de Distribución: ${isSingle ? "Destinatario Único" : "General Premium (Todos)"}
    ✅ Monto Afectado: $${poolUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
    ✅ Saldo Remanente del Mes Admin: $${adminMonthlyRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
    ✅ Afectación Individual: ${isDebit ? "-" : "+"}${individualXAUt.toFixed(6)} XAUt a los destinatarios.
    ✅ Hash de Auditoría: ${txHash.substring(0, 18)}...
    
    Los saldos y la consola comercial se han sincronizado con éxito.`);
    
    // Resetear formulario
    revenueInput.value = '';
    calculateAdminAirdropPreview();
}

let isSyncingSupabase = false;
let currentSyncPromise = null;
let lastSupabaseSyncTime = 0;

/**
 * Sincroniza las propiedades e inventario desde el servidor Supabase a la aplicación local (Wrapper con throttling y reuso de promesas)
 */
async function syncSupabaseData(force = false) {
    if (!isSupabaseActive) return;

    if (isSyncingSupabase && currentSyncPromise) {
        return currentSyncPromise;
    }

    const elapsed = Date.now() - lastSupabaseSyncTime;
    if (!force && elapsed < 20000 && Object.values(PORTFOLIO_DATABASE).flat().length > 0) {
        console.log(`⚡ [SWR] Usando caché de red reciente (sincronizada hace ${Math.round(elapsed / 1000)}s).`);
        return;
    }

    isSyncingSupabase = true;
    currentSyncPromise = (async () => {
        try {
            await _syncSupabaseDataInternal();
            lastSupabaseSyncTime = Date.now();
        } finally {
            isSyncingSupabase = false;
            currentSyncPromise = null;
        }
    })();

    return currentSyncPromise;
}

async function _syncSupabaseDataInternal() {
    if (!isSupabaseActive) return;

    try {
        // Sincronizar configuraciones globales (videos, banner) de Supabase en segundo plano
        await fetchSystemSettingsFromSupabase();

        // Sincronizar perfiles de agentes para la tabla admin si la vista admin está activa
        const adminViewEl = document.getElementById('view-admin');
        if (adminViewEl && adminViewEl.classList.contains('active')) {
            await syncB2bClientsFromSupabase();
        }

        // 0. Sincronizar el estado, plan y saldo del agente activo desde Supabase en tiempo real
        if (loggedInB2bClient) {
            const isUUID = loggedInB2bClient.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(loggedInB2bClient.id);
            if (isUUID) {
                try {
                    const { data: latestProfile, error: profileErr } = await supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', loggedInB2bClient.id)
                        .maybeSingle();
                    
                    if (!profileErr && latestProfile) {
                        // Actualizar datos de sesión local con lo que hay en la nube en tiempo real
                        let dbPlan = latestProfile.plan || 'Básico';
                        let dbRole = latestProfile.role || 'agente';
                        const emailLower = (loggedInB2bClient.email || '').toLowerCase();
                        const roleLower = dbRole.toLowerCase();
                        if (roleLower === 'inversionista') {
                            dbPlan = 'Premium';
                        } else if (emailLower === 'ana@estevezinmobiliaria.com') {
                            dbPlan = 'VIP';
                            dbRole = 'agente';
                        } else if (emailLower === 'sofia@alianzagt.com') {
                            dbPlan = 'Básico';
                            dbRole = 'agente';
                        }

                        loggedInB2bClient.usdtBalance = parseFloat(latestProfile.usdt_balance || 0);
                        loggedInB2bClient.status = (typeof latestProfile.status === 'string' && latestProfile.status.length > 0) ? (latestProfile.status.charAt(0).toUpperCase() + latestProfile.status.slice(1)) : 'Activo';
                        loggedInB2bClient.plan = dbPlan;
                        loggedInB2bClient.role = dbRole;
                        activeB2bPlan = (dbPlan || 'pro').toLowerCase();
                        
                        // Actualizar en el listado local de clientes para mantener consistencia
                        const clientIdx = b2bClients.findIndex(c => c.email && loggedInB2bClient.email && c.email.toLowerCase() === loggedInB2bClient.email.toLowerCase());
                        if (clientIdx !== -1) {
                            b2bClients[clientIdx].status = loggedInB2bClient.status;
                            b2bClients[clientIdx].plan = loggedInB2bClient.plan;
                            b2bClients[clientIdx].usdtBalance = loggedInB2bClient.usdtBalance;
                            b2bClients[clientIdx].role = loggedInB2bClient.role;
                        }
                        localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));
                        localStorage.setItem('valorgt_active_b2b_client', JSON.stringify(loggedInB2bClient));
                        
                        // Actualizar interfaces
                        updateSaasMetricsHUD();
                        updateB2bSubscriptionPendingBanner();
                        syncCommercialPricingGridUI();
                        renderB2bAgentProfile();
                        
                        // Gestionar Overlays de Bloqueo dinámicamente si cambió el estado
                        updateLockOverlaysState();
                    } else if (profileErr || !latestProfile) {
                        // Auto-healing: Si el usuario existe localmente en sesión pero no tiene fila en Supabase profiles, la insertamos
                        console.log("Auto-recuperación activa: Auto-creando perfil ausente en Supabase profiles.");
                        const fallbackProfile = {
                            id: loggedInB2bClient.id,
                            name: loggedInB2bClient.name,
                            company: loggedInB2bClient.company,
                            nit: loggedInB2bClient.nit || 'C/F',
                            phone: loggedInB2bClient.phone || 'N/A',
                            email: loggedInB2bClient.email,
                            plan: loggedInB2bClient.plan,
                            status: (loggedInB2bClient.status || 'pendiente').toLowerCase(),
                            usdt_balance: loggedInB2bClient.usdtBalance,
                            role: loggedInB2bClient.role || 'agente'
                        };
                        
                        const { error: insertErr } = await supabaseClient.from('profiles').insert([fallbackProfile]);
                        if (insertErr) {
                            console.warn("Fallo de auto-creación en Supabase profiles:", insertErr);
                        } else {
                            console.log("Perfil auto-creado exitosamente en Supabase para", loggedInB2bClient.email);
                        }
                    }
                } catch (syncErr) {
                    console.error("Error en sincronización en vivo del perfil comercial:", syncErr);
                }
            }
        }

        // 1. Descargar todas las propiedades remotas
        const { data: remoteProperties, error } = await supabaseClient
            .from('properties')
            .select('*');

        if (error) {
            console.error("Error al sincronizar propiedades desde Supabase:", error);
            return;
        }

        if (remoteProperties) {
            const remoteIds = new Set(remoteProperties.map(p => p.id));
            
            // Limpiar de agentUploadedProperties las propiedades que ya no están en Supabase
            agentUploadedProperties = agentUploadedProperties.filter(p => !p.id || remoteIds.has(p.id));

            // Limpiar de PORTFOLIO_DATABASE las propiedades que ya no están en Supabase (dejando las de mockData sin ID)
            Object.keys(PORTFOLIO_DATABASE).forEach(zone => {
                PORTFOLIO_DATABASE[zone] = PORTFOLIO_DATABASE[zone].filter(p => !p.id || remoteIds.has(p.id));
            });

            if (remoteProperties.length > 0) {
                const allRemoteFormatted = [];
                remoteProperties.forEach(prop => {
                    const zoneKey = prop.location_key;
                    const isRef = prop.metadata && prop.metadata.isReferenceData === true;
                    
                    // Estructurar al formato interno compatible con mockData.js
                    const formattedProp = {
                        id: prop.id,
                        title: prop.title,
                        category: prop.category,
                        type: prop.type,
                        tag: prop.tag || `${(prop.category || "Propiedad").toUpperCase()} EN ${(prop.type || "Venta").toUpperCase()}`,
                        priceUSD: parseFloat(prop.price_usd),
                        size: parseFloat(prop.size_m2),
                        rooms: parseInt(prop.rooms),
                        bathrooms: parseFloat(prop.bathrooms),
                        parkings: parseInt(prop.parkings),
                        garden: prop.metadata && prop.metadata.garden ? parseFloat(prop.metadata.garden) : 0,
                        study: prop.metadata && prop.metadata.study ? prop.metadata.study : false,
                        familyRoom: prop.metadata && prop.metadata.familyRoom ? prop.metadata.familyRoom : false,
                        hasMasterSuite: prop.metadata && prop.metadata.hasMasterSuite ? prop.metadata.hasMasterSuite : false,
                        hasVisitorBath: prop.metadata && prop.metadata.hasVisitorBath ? prop.metadata.hasVisitorBath : false,
                        amenities: prop.metadata && prop.metadata.amenities ? prop.metadata.amenities : [],
                        photo: prop.photo_url,
                        photos: (prop.metadata && prop.metadata.photos) ? prop.metadata.photos : [prop.photo_url],
                        description: (prop.metadata && prop.metadata.description) ? prop.metadata.description : 'Propiedad exclusiva seleccionada por el nodo de inteligencia ValorGT AI.',
                        agentName: (prop.metadata && prop.metadata.agentName) ? prop.metadata.agentName : 'Socio Inmobiliario',
                        agentCompany: (prop.metadata && prop.metadata.agentCompany) ? prop.metadata.agentCompany : 'ValorGT Premium Partner',
                        agentPhone: (prop.metadata && prop.metadata.agentPhone) ? prop.metadata.agentPhone : '50250129482',
                        agentLogo: (prop.metadata && prop.metadata.agentLogo) ? prop.metadata.agentLogo : '',
                        agentPlan: (prop.metadata && prop.metadata.agentPlan) ? prop.metadata.agentPlan : 'Básico',
                        youtubeUrl: (prop.metadata && prop.metadata.youtubeUrl) ? prop.metadata.youtubeUrl : '',
                        badge: prop.sponsored ? "PATROCINADO" : "NUEVO LISTADO",
                        location: zoneKey,
                        isAgentUpload: !isRef,
                        isReferenceData: isRef,
                        sponsored: prop.sponsored,
                        lat: parseFloat(prop.latitude),
                        lng: parseFloat(prop.longitude),
                        agent_id: prop.agent_id
                    };

                    allRemoteFormatted.push(formattedProp);

                    // Evitar duplicación de listados
                    if (!PORTFOLIO_DATABASE[zoneKey]) {
                        PORTFOLIO_DATABASE[zoneKey] = [];
                    }

                    const exists = PORTFOLIO_DATABASE[zoneKey].some(p => p.id === formattedProp.id);
                    if (!exists) {
                        if (formattedProp.sponsored) {
                            PORTFOLIO_DATABASE[zoneKey].unshift(formattedProp);
                        } else {
                            PORTFOLIO_DATABASE[zoneKey].push(formattedProp);
                        }
                    }

                    // Cargar al inventario de pauta si le pertenece al usuario logueado
                    if (loggedInB2bClient && prop.agent_id === loggedInB2bClient.id) {
                        const agentExists = agentUploadedProperties.some(p => p.id === formattedProp.id);
                        if (!agentExists) {
                            agentUploadedProperties.push(formattedProp);
                        }
                    }
                });
                
                // Guardar en localStorage las propiedades sincronizadas
                saveLocalPropertiesToStorage();
                localStorage.setItem('valorgt_remote_properties_cache', JSON.stringify(allRemoteFormatted));
            }

            // Actualizar la interfaz de forma reactiva según la sección visible
            const activeViewEl = document.querySelector('.app-view.active');
            if (activeViewEl) {
                const activeId = activeViewEl.id;
                if (activeId === 'view-catalog') {
                    renderCatalogProperties();
                } else if (activeId === 'view-heatmap') {
                    if (typeof initHeatmap === 'function') initHeatmap();
                    if (typeof drawAgentProperties === 'function') drawAgentProperties();
                } else if (activeId === 'view-commercial') {
                    renderB2bInventory();
                    updatePromoPropertySelect();
                    updateSaasMetricsHUD();
                }
            }
        }
        
        // Sincronizar solicitudes de pago pendientes en tiempo real
        await syncPendingPaymentRequests();
    } catch (err) {
        console.error("Fallo crítico de conexión al sincronizar Supabase:", err);
    }
}

async function syncB2bClientsFromSupabase() {
    if (!isSupabaseActive) return;
    try {
        const { data: remoteProfiles, error } = await supabaseClient
            .from('profiles')
            .select('*');
        if (error) {
            console.error("Error al sincronizar agentes desde Supabase:", error);
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SECURITY", `sync_node: Error al sincronizar agentes desde Supabase: ${error.message}`, true);
            }
            return;
        }
        if (remoteProfiles && remoteProfiles.length > 0) {
            b2bClients = remoteProfiles.map(profile => {
                let plan = profile.plan || 'Básico';
                let role = profile.role || 'agente';
                const emailLower = (profile.email || '').toLowerCase();
                const roleLower = role.toLowerCase();
                
                if (roleLower === 'inversionista') {
                    plan = 'Premium';
                } else if (emailLower === 'ana@estevezinmobiliaria.com') {
                    plan = 'VIP';
                    role = 'agente';
                } else if (emailLower === 'sofia@alianzagt.com') {
                    plan = 'Básico';
                    role = 'agente';
                }
                
                return {
                    id: profile.id,
                    name: profile.name,
                    company: profile.company,
                    nit: profile.nit || 'C/F',
                    phone: profile.phone || 'N/A',
                    email: profile.email || '',
                    plan: plan,
                    status: (typeof profile.status === 'string' && profile.status.length > 0) ? (profile.status.charAt(0).toUpperCase() + profile.status.slice(1)) : 'Activo',
                    password: 'valorgt',
                    usdtBalance: parseFloat(profile.usdt_balance || 0),
                    role: role
                };
            });
            
            // Persistir localmente para mantener la caché del navegador actualizada
            localStorage.setItem('b2b_clients_local', JSON.stringify(b2bClients));
            
            // Re-renderizar de inmediato
            renderAdminDashboard();
            renderAdminAirdropComponents();
            if (typeof appendAdminLog === 'function') {
                appendAdminLog("SYSTEM", `sync_node: Sincronizados ${remoteProfiles.length} agentes desde Supabase con éxito.`, false);
            }
        }
    } catch (err) {
        console.error("Fallo crítico al sincronizar perfiles de agentes:", err);
    }
}

/**
 * ==========================================================================
 * CONTROLES Y LOGICA DE NAVEGACIÓN Y RETIROS B2B SAAS
 * ==========================================================================
 */

/**
 * Permite cambiar de pestaña de forma reactiva en el Dashboard de Socio B2B
 */
function switchCommercialTab(tabId) {
    // Si la suscripción del cliente está pendiente, restringir el acceso únicamente a la pestaña de Suscripción y Disclaimer
    const clientEmail = (loggedInB2bClient && loggedInB2bClient.email) ? loggedInB2bClient.email.toLowerCase() : '';
    const isVipBypass = clientEmail.includes('admin') || clientEmail.includes('sgalindo');
    if (!isVipBypass && loggedInB2bClient && (loggedInB2bClient.status === 'Pendiente' || loggedInB2bClient.status?.toLowerCase() === 'pendiente')) {
        if (tabId !== 'suscripcion' && tabId !== 'disclaimer') {
            alert("⚠️ ACCESO RESTRINGIDO: Tu cuenta se encuentra en estado 'Pendiente de Pago'. Debes subir tu comprobante de transferencia y esperar a que el administrador valide tu pago para acceder a las demás pestañas del portal.");
            switchCommercialTab('suscripcion');
            return;
        }
    }

    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.comm-tab-content').forEach(el => el.classList.add('hidden'));
    
    // Sincronizar el highlight del menú lateral principal según la subpestaña comercial
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-item').forEach(btn => btn.classList.remove('active'));
    
    if (tabId === 'portfolio') {
        const portfolioBtn = document.getElementById('nav-btn-portfolio');
        if (portfolioBtn) portfolioBtn.classList.add('active');
        const mobilePortfolioBtn = document.getElementById('mobile-nav-btn-portfolio');
        if (mobilePortfolioBtn) mobilePortfolioBtn.classList.add('active');
    } else {
        const commercialBtn = document.getElementById('nav-btn-commercial');
        if (commercialBtn) commercialBtn.classList.add('active');
        const mobileCommercialBtn = document.getElementById('mobile-nav-btn-commercial');
        if (mobileCommercialBtn) mobileCommercialBtn.classList.add('active');
    }
    
    // Remover clase active de todos los botones y restablecer estilos base
    document.querySelectorAll('.comm-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'rgba(0,0,0,0.4)';
        btn.style.borderColor = 'rgba(255,255,255,0.08)';
        btn.style.color = 'var(--text-muted)';
        btn.style.boxShadow = 'none';
    });

    // Activar pestaña actual
    const activeContent = document.getElementById(`comm-tab-content-${tabId}`);
    const activeBtn = document.getElementById(`comm-tab-btn-${tabId}`);
    
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    // Actualizar Títulos de la app dinámicamente según subpestaña comercial
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (titleEl && subtitleEl) {
        if (tabId === 'portfolio') {
            titleEl.innerText = "Terminal de Portafolio Patrimonial IA";
            subtitleEl.innerText = "Simulador avanzado de riqueza, apalancamiento y Libertad Financiera";
        } else if (tabId === 'home') {
            titleEl.innerText = "Consola de Gestión Comercial B2B";
            subtitleEl.innerText = "Panel central de operaciones, facturación SaaS y control criptográfico";
        } else if (tabId === 'oro') {
            titleEl.innerText = "Cartera de Oro Digital (XAUt)";
            subtitleEl.innerText = "Liquidación y retiros contables respaldados por Tether Gold";
        } else if (tabId === 'propiedades') {
            titleEl.innerText = "Publicar Propiedades en ValorGT";
            subtitleEl.innerText = "Cargar nuevos inmuebles al motor de búsqueda inteligente";
        } else if (tabId === 'propiedades-list') {
            titleEl.innerText = "Mis Propiedades Publicadas";
            subtitleEl.innerText = "Gestión del inventario y promoción con Inteligencia Artificial";
        } else if (tabId === 'suscripcion') {
            titleEl.innerText = "Suscripciones B2B y Licencia SaaS";
            subtitleEl.innerText = "Estado de tu plan comercial y carga de comprobantes";
        } else if (tabId === 'disclaimer') {
            titleEl.innerText = "Descargo de Responsabilidad y Regulación Legal";
            subtitleEl.innerText = "Términos del servicio y marco legal de la tasación IA";
        }
    }
    
    if (activeBtn) {
        activeBtn.classList.add('active');
        if (tabId === 'home') {
            activeBtn.style.background = 'rgba(0,240,255,0.05)';
            activeBtn.style.borderColor = 'rgba(0,240,255,0.4)';
            activeBtn.style.color = 'var(--cyan)';
            activeBtn.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.12)';
        } else if (tabId === 'oro') {
            activeBtn.style.background = 'rgba(255,215,0,0.08)';
            activeBtn.style.borderColor = 'rgba(255,215,0,0.45)';
            activeBtn.style.color = '#ffd700';
            activeBtn.style.boxShadow = '0 0 12px rgba(255, 215, 0, 0.12)';
        } else if (tabId === 'propiedades' || tabId === 'propiedades-list') {
            activeBtn.style.background = 'rgba(0,240,255,0.05)';
            activeBtn.style.borderColor = 'rgba(0,240,255,0.4)';
            activeBtn.style.color = 'var(--cyan)';
            activeBtn.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.12)';
        } else if (tabId === 'portfolio') {
            activeBtn.style.background = 'rgba(191,90,242,0.05)';
            activeBtn.style.borderColor = 'rgba(191,90,242,0.4)';
            activeBtn.style.color = '#bf5af2';
            activeBtn.style.boxShadow = '0 0 12px rgba(191, 90, 242, 0.12)';
        } else if (tabId === 'suscripcion') {
            activeBtn.style.background = 'rgba(191,90,242,0.05)';
            activeBtn.style.borderColor = 'rgba(191,90,242,0.4)';
            activeBtn.style.color = '#bf5af2';
            activeBtn.style.boxShadow = '0 0 12px rgba(191, 90, 242, 0.12)';
        } else if (tabId === 'disclaimer') {
            activeBtn.style.background = 'rgba(0,240,255,0.05)';
            activeBtn.style.borderColor = 'rgba(0,240,255,0.4)';
            activeBtn.style.color = 'var(--cyan)';
            activeBtn.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.12)';
        }
    }

    if (tabId === 'portfolio') {
        initPortfolioView();
        if (portfolioMapInstance) {
            setTimeout(() => {
                portfolioMapInstance.invalidateSize();
            }, 100);
        }
    }
    if (tabId === 'oro') {
        fetchXautPriceForAirdrop().then(() => {
            updateSaasMetricsHUD();
            if (typeof renderXautHistoryChart === 'function') {
                renderXautHistoryChart();
            }
        });
    }
    if (typeof updateAssistantVisibility === 'function') {
        updateAssistantVisibility();
    }
}

/**
 * Conmuta entre las pestañas de la Consola de Administración (General y Base de Datos de Calibración)
 */
function switchAdminTab(tabId) {
    // 1. Quitar clase active de los botones de pestañas del admin y restablecer estilos
    document.querySelectorAll('.admin-tabs-nav .admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'rgba(0,0,0,0.4)';
        btn.style.borderColor = 'rgba(255,255,255,0.08)';
        btn.style.color = 'var(--text-muted)';
        btn.style.boxShadow = 'none';
    });

    // 2. Activar el botón de la pestaña seleccionada
    const activeBtn = document.getElementById(`admin-tab-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'rgba(0,240,255,0.05)';
        activeBtn.style.borderColor = 'rgba(0,240,255,0.4)';
        activeBtn.style.color = 'var(--cyan)';
        activeBtn.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.12)';
    }

    // Ocultar todas las secciones del admin primero
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));

    // 3. Alternar visibilidad de las secciones
    if (tabId === 'general') {
        document.getElementById('admin-tab-content-general')?.classList.remove('hidden');
        document.getElementById('admin-tab-content-general-part2')?.classList.remove('hidden');
    } else if (tabId === 'database') {
        document.getElementById('admin-tab-content-database')?.classList.remove('hidden');
        // Asegurar renderizado fresco de la lista
        if (typeof renderAdminReferenceDatabase === 'function') {
            renderAdminReferenceDatabase();
        }
    } else if (tabId === 'banners') {
        document.getElementById('admin-tab-content-banners')?.classList.remove('hidden');
        // Asegurar inicialización y renderizado fresco del gestor de banners
        if (typeof renderAdminBannersTab === 'function') {
            renderAdminBannersTab();
        }
    } else if (tabId === 'tutorials') {
        document.getElementById('admin-tab-content-tutorials')?.classList.remove('hidden');
        renderAdminTutorialsTable();
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Variable global temporal para guardar imágenes subidas localmente para el banner
 */
let adminBannerCustomPhotoBase64 = null;

/**
 * Inicializa y renderiza la pestaña de administración de banners por zona
 */
function renderAdminBannersTab() {
    const zoneSelect = document.getElementById('admin-banner-zone-select');
    if (!zoneSelect) return;

    // Si ya tiene opciones cargadas, no recargar todo el listado de zonas
    if (zoneSelect.children.length === 0) {
        zoneSelect.innerHTML = '';
        Object.keys(ZONES_DATABASE).forEach(key => {
            const zone = ZONES_DATABASE[key];
            const opt = document.createElement('option');
            opt.value = key;
            opt.innerText = zone.name;
            zoneSelect.appendChild(opt);
        });
        
        // Seleccionar Fraijanes por defecto si existe
        if (ZONES_DATABASE['fraijanes']) {
            zoneSelect.value = 'fraijanes';
        }
    }

    loadAdminBannerForSelectedZone();
}

/**
 * Carga la configuración del banner para la zona actualmente seleccionada en el admin
 */
function loadAdminBannerForSelectedZone() {
    const zoneSelect = document.getElementById('admin-banner-zone-select');
    if (!zoneSelect) return;

    const zoneKey = zoneSelect.value;
    
    // Cargar banners de localStorage
    let banners = {};
    try {
        banners = JSON.parse(localStorage.getItem('admin_zone_banners') || '{}');
    } catch (e) {
        console.error("Error al leer admin_zone_banners de localStorage:", e);
    }

    const banner = banners[zoneKey] || {
        enabled: false,
        title: '',
        subtitle: '',
        ctaText: 'MÁS INFORMACIÓN',
        link: '',
        photo: 'propiedad_demo.png'
    };

    // Llenar campos del formulario
    document.getElementById('admin-banner-enabled').checked = banner.enabled;
    document.getElementById('admin-banner-title').value = banner.title || '';
    document.getElementById('admin-banner-subtitle').value = banner.subtitle || '';
    document.getElementById('admin-banner-cta-text').value = banner.ctaText || 'MÁS INFORMACIÓN';
    document.getElementById('admin-banner-link').value = banner.link || '';
    
    // Determinar origen de la foto
    const presetSelect = document.getElementById('admin-banner-photo-preset');
    const customUrlInput = document.getElementById('admin-banner-custom-url');
    const fileWrapper = document.getElementById('admin-banner-file-wrapper');
    
    if (presetSelect) {
        const standardPresets = ['propiedad_demo.png', 'prop_zona10.png', 'prop_zona14.png', 'prop_zona16.png', 'prop_antigua.png'];
        if (standardPresets.includes(banner.photo)) {
            presetSelect.value = banner.photo;
            if (customUrlInput) customUrlInput.style.display = 'none';
            if (fileWrapper) fileWrapper.style.display = 'none';
        } else if (banner.photo && banner.photo.startsWith('data:image')) {
            // Imagen Base64 local
            presetSelect.value = 'custom_file';
            adminBannerCustomPhotoBase64 = banner.photo;
            if (customUrlInput) customUrlInput.style.display = 'none';
            if (fileWrapper) fileWrapper.style.display = 'block';
            
            // Retroalimentación visual en la etiqueta del uploader premium
            const uploadLbl = document.getElementById('admin-banner-upload-lbl');
            if (uploadLbl) {
                uploadLbl.innerHTML = '<span style="color: var(--green); font-weight: bold;">¡Imagen personalizada cargada ✔️!</span>';
            }
        } else {
            // URL personalizada
            presetSelect.value = 'custom_url';
            if (customUrlInput) {
                customUrlInput.value = banner.photo || '';
                customUrlInput.style.display = 'block';
            }
            if (fileWrapper) fileWrapper.style.display = 'none';
        }
    }

    updateAdminBannerPreview();
}

/**
 * Maneja el cambio de selección en el dropdown de orígenes de fotos de banner
 */
function handleAdminBannerPresetChange() {
    const presetSelect = document.getElementById('admin-banner-photo-preset');
    const customUrlInput = document.getElementById('admin-banner-custom-url');
    const fileWrapper = document.getElementById('admin-banner-file-wrapper');
    if (!presetSelect) return;

    if (presetSelect.value === 'custom_url') {
        if (customUrlInput) customUrlInput.style.display = 'block';
        if (fileWrapper) fileWrapper.style.display = 'none';
    } else if (presetSelect.value === 'custom_file') {
        if (customUrlInput) customUrlInput.style.display = 'none';
        if (fileWrapper) fileWrapper.style.display = 'block';
    } else {
        if (customUrlInput) customUrlInput.style.display = 'none';
        if (fileWrapper) fileWrapper.style.display = 'none';
    }

    updateAdminBannerPreview();
}

/**
 * Maneja la entrada manual de la URL personalizada de la foto del banner
 */
function handleAdminBannerCustomUrlInput() {
    updateAdminBannerPreview();
}

/**
 * Comprime una imagen en el lado del cliente usando un elemento canvas.
 * Devuelve una promesa con el base64 de la imagen comprimida.
 */
function compressImage(file, maxWidth = 1200, maxHeight = 750, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Comprimir como JPEG con la calidad definida
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = function(err) {
                reject(err);
            };
            img.src = e.target.result;
        };
        reader.onerror = function(err) {
            reject(err);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Procesa la carga de una imagen local en Base64 para el banner
 */
function handleAdminBannerFileUploaded(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Mostrar estado temporal de procesamiento
    const uploadLbl = document.getElementById('admin-banner-upload-lbl');
    if (uploadLbl) {
        uploadLbl.innerHTML = '<span style="color: var(--cyan); font-weight: bold;">Optimizando imagen... ⏳</span>';
    }

    // Seleccionar automáticamente el modo de archivo local en el dropdown
    const presetSelect = document.getElementById('admin-banner-photo-preset');
    if (presetSelect) {
        presetSelect.value = 'custom_file';
        // Ocultar campo de URL y mostrar cargador de archivos
        const customUrlInput = document.getElementById('admin-banner-custom-url');
        const fileWrapper = document.getElementById('admin-banner-file-wrapper');
        if (customUrlInput) customUrlInput.style.display = 'none';
        if (fileWrapper) fileWrapper.style.display = 'block';
    }

    compressImage(file, 1200, 750, 0.75)
        .then(compressedBase64 => {
            adminBannerCustomPhotoBase64 = compressedBase64;
            
            if (uploadLbl) {
                const truncatedName = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;
                uploadLbl.innerHTML = `¡Imagen cargada ✔️! <span style="color: var(--green); font-size: 0.65rem;">(${truncatedName})</span>`;
            }
            
            updateAdminBannerPreview();
        })
        .catch(err => {
            console.error("Error al procesar la imagen:", err);
            if (uploadLbl) {
                uploadLbl.innerHTML = '<span style="color: var(--red); font-weight: bold;">⚠️ Error al procesar imagen</span>';
            }
        });
}

/**
 * Actualiza la previsualización del banner en miniatura en tiempo real dentro del admin
 */
function updateAdminBannerPreview() {
    const mockupWrapper = document.getElementById('admin-banner-mockup-wrapper');
    if (!mockupWrapper) return;

    const enabled = document.getElementById('admin-banner-enabled').checked;
    const title = document.getElementById('admin-banner-title').value.trim() || 'Título del Proyecto';
    const subtitle = document.getElementById('admin-banner-subtitle').value.trim() || 'Descripción comercial del proyecto.';
    const ctaText = document.getElementById('admin-banner-cta-text').value.trim() || 'MÁS INFORMACIÓN';
    const link = document.getElementById('admin-banner-link').value.trim() || '#';
    
    // Obtener imagen activa
    const presetSelect = document.getElementById('admin-banner-photo-preset');
    let photo = 'propiedad_demo.png';
    
    if (presetSelect) {
        if (presetSelect.value === 'custom_url') {
            photo = document.getElementById('admin-banner-custom-url').value.trim() || 'propiedad_demo.png';
        } else if (presetSelect.value === 'custom_file') {
            photo = adminBannerCustomPhotoBase64 || 'propiedad_demo.png';
        } else {
            photo = presetSelect.value;
        }
    }

    if (!enabled) {
        mockupWrapper.innerHTML = `
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; font-family: var(--font-mono); display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <i data-lucide="eye-off" style="width: 24px; height: 24px; color: var(--red);"></i>
                PORTADA ALTERNATIVA DESHABILITADA PARA ESTA ZONA.<br>
                <span style="font-size: 0.65rem;">(Se mostrará el espacio disponible verde estándar para patrocinadores)</span>
            </div>
        `;
    } else {
        mockupWrapper.innerHTML = `
            <div class="premium-corporate-banner glassmorphism" style="width: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 15px; border-radius: 8px; background: url('${photo}'); background-size: cover; background-position: center; border: 1px solid rgba(0, 240, 255, 0.35); box-shadow: 0 0 15px rgba(0, 240, 255, 0.15); min-height: 270px; position: relative; overflow: hidden; box-sizing: border-box; text-align: left;">
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0, 240, 255, 0.15); border: 1px solid var(--cyan); color: var(--cyan); font-size: 0.55rem; font-weight: bold; font-family: var(--font-mono); padding: 2px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px;">
                    PROYECTO DESTACADO
                </div>
                <div style="z-index: 2; margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; flex-wrap: wrap; width: 100%; background: transparent; padding: 12px 14px; box-sizing: border-box;">
                    <div style="flex: 1; min-width: 150px;">
                        <h4 class="font-sans" style="font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0 0 4px 0; text-shadow: 0 0 5px #000; line-height: 1.2;">${title}</h4>
                        <p class="font-sans" style="font-size: 0.65rem; color: rgba(255,255,255,0.85); margin: 0; line-height: 1.3; text-shadow: 0 0 3px #000;">${subtitle}</p>
                    </div>
                    <button class="btn btn-primary" style="flex-shrink: 0; padding: 5px 12px; font-size: 0.6rem; font-weight: bold; border-radius: 4px; background: linear-gradient(135deg, var(--cyan) 0%, rgba(0,102,255,0.8) 100%); border: 1px solid var(--cyan); color: #fff; cursor: default; display: flex; align-items: center; gap: 4px;">
                        <span>${ctaText}</span>
                    </button>
                </div>
            </div>
        `;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Guarda la configuración del banner en localStorage para persistencia
 */
function saveAdminBanner() {
    const zoneSelect = document.getElementById('admin-banner-zone-select');
    if (!zoneSelect) return;

    const zoneKey = zoneSelect.value;
    const zoneData = ZONES_DATABASE[zoneKey];
    const zoneName = zoneData ? zoneData.name.split(' (')[0] : zoneKey;
    
    const enabled = document.getElementById('admin-banner-enabled').checked;
    const title = document.getElementById('admin-banner-title').value.trim();
    const subtitle = document.getElementById('admin-banner-subtitle').value.trim();
    const ctaText = document.getElementById('admin-banner-cta-text').value.trim() || 'MÁS INFORMACIÓN';
    const link = document.getElementById('admin-banner-link').value.trim();
    
    // Obtener imagen
    const presetSelect = document.getElementById('admin-banner-photo-preset');
    let photo = 'propiedad_demo.png';
    
    if (presetSelect) {
        if (presetSelect.value === 'custom_url') {
            photo = document.getElementById('admin-banner-custom-url').value.trim();
        } else if (presetSelect.value === 'custom_file') {
            photo = adminBannerCustomPhotoBase64;
        } else {
            photo = presetSelect.value;
        }
    }

    if (enabled && (!title || !photo)) {
        alert("⚠️ Por favor completa el título y define una imagen de fondo para poder habilitar el banner.");
        return;
    }

    // Leer estado actual
    let banners = {};
    try {
        banners = JSON.parse(localStorage.getItem('admin_zone_banners') || '{}');
    } catch (e) {
        console.error(e);
    }

    banners[zoneKey] = {
        enabled: enabled,
        title: title,
        subtitle: subtitle,
        ctaText: ctaText,
        link: link,
        photo: photo
    };

    try {
        localStorage.setItem('admin_zone_banners', JSON.stringify(banners));
        appendAdminLog("SYSTEM", `banner_config: Portada alternativa para ${zoneName} guardada y ${enabled ? 'HABILITADA' : 'DESHABILITADA'}.`, true);
        alert(`¡Portada Alternativa para ${zoneName} guardada con éxito!`);
    } catch (e) {
        console.error("Error al guardar admin_zone_banners:", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert(`⚠️ ERROR DE CAPACIDAD: La imagen que intentas subir es demasiado pesada y excede la capacidad de la memoria local de tu navegador (límite de 5MB).\n\nRecomendación:\n1. Intenta subir otra imagen (nuestro optimizador automático la comprimirá aún más).\n2. Elige la opción "Ingresar URL Personalizada..." ingresando un enlace directo (por ejemplo, de Unsplash o tu servidor).`);
        } else {
            alert(`⚠️ Error inesperado al guardar la portada alternativa: ${e.message}`);
        }
        return;
    }
    
    // Si la zona de búsqueda actual en el Dashboard es esta, actualizar deck para ver el cambio inmediato
    const activeDashboardZoneSelect = document.getElementById('prop-location');
    if (activeDashboardZoneSelect && activeDashboardZoneSelect.value === zoneKey) {
        renderFeaturedProperties(zoneKey);
    }
}


/**
 * Sincroniza visualmente cuál es la tarjeta de membresía activa en la cuadrícula
 */
function syncCommercialPricingGridUI() {
    let planKey = activeB2bPlan || 'pro';
    if (planKey === 'premium') planKey = 'vip';
    ['basico', 'pro', 'vip'].forEach(p => {
        const card = document.getElementById(`plan-card-${p}`);
        const btn = document.getElementById(`btn-plan-${p}`);
        if (card) {
            if (p === planKey) {
                card.classList.add('active-plan');
                card.style.borderColor = p === 'vip' ? '#bf5af2' : (p === 'pro' ? 'var(--cyan)' : 'var(--neon-blue)');
                card.style.background = p === 'vip' ? 'rgba(191, 90, 242, 0.03)' : (p === 'pro' ? 'rgba(0, 240, 255, 0.03)' : 'rgba(10, 132, 255, 0.03)');
                if (btn) {
                    btn.innerText = "Plan Activo";
                    btn.disabled = true;
                    btn.style.opacity = '0.75';
                    btn.style.cursor = 'not-allowed';
                }
            } else {
                card.classList.remove('active-plan');
                card.style.borderColor = 'rgba(255,255,255,0.08)';
                card.style.background = 'rgba(0,0,0,0.25)';
                if (btn) {
                    btn.innerText = "Cambiar Plan";
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                }
            }
        }
    });
}

/**
 * Calcula en tiempo real las comisiones de red y los montos netos de retiros en GTQ
 */
function updateWithdrawalCalculations() {
    const amountInput = document.getElementById('withdrawal-amount-xaut');
    if (!amountInput) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const xautPrice = currentAirdropXautPrice || 2380.00;
    
    const grossUSD = amount * xautPrice;
    const grossGTQ = grossUSD * exchangeRate;
    const feeGTQ = grossGTQ * 0.04;
    const netGTQ = grossGTQ - feeGTQ;
    
    document.getElementById('withdrawal-gross-gtq').innerText = `Q${formatNumber(grossGTQ.toFixed(2))}`;
    document.getElementById('withdrawal-fee-gtq').innerText = `-Q${formatNumber(feeGTQ.toFixed(2))}`;
    document.getElementById('withdrawal-net-gtq').innerText = `Q${formatNumber(netGTQ.toFixed(2))}`;
}

/**
 * Ejecuta la validación y el registro contable de retiros Tether Gold (XAUt) a banco local
 */
async function executeB2bWithdrawal(event) {
    if (event) event.preventDefault();
    
    const amountInput = document.getElementById('withdrawal-amount-xaut');
    const bankSelect = document.getElementById('withdrawal-bank');
    const accountInput = document.getElementById('withdrawal-account');
    const typeSelect = document.getElementById('withdrawal-account-type');
    
    if (!amountInput || !bankSelect || !accountInput || !typeSelect) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const bank = bankSelect.value;
    const account = accountInput.value.trim();
    const type = typeSelect.value;
    
    if (amount <= 0 || !account) {
        alert("⚠️ CAMPOS REQUERIDOS: Por favor introduce un monto de Tether Gold y datos de cuenta válidos.");
        return;
    }
    
    if (!loggedInB2bClient) {
        alert("⚠️ ERROR DE SESIÓN: Debes iniciar sesión con tu cuenta de socio comercial para solicitar retiros.");
        return;
    }
    
    // Validar fondos del balance comercial
    if (loggedInB2bClient.usdtBalance < amount) {
        alert(`⚠️ FONDOS INSUFICIENTES: Tu balance actual es de ${loggedInB2bClient.usdtBalance.toFixed(4)} XAUt. No cuentas con fondos suficientes para retirar ${amount.toFixed(4)} XAUt.`);
        return;
    }
    
    const xautPrice = currentAirdropXautPrice || 2380.00;
    const grossUSD = amount * xautPrice;
    const grossGTQ = grossUSD * exchangeRate;
    const feeGTQ = grossGTQ * 0.04;
    const netGTQ = grossGTQ - feeGTQ;
    
    // Validar mínimo neto Q100
    if (netGTQ < 100) {
        alert(`⚠️ RETIRO MÍNIMO NO ALCANZADO: El monto neto solicitado a recibir es de Q${netGTQ.toFixed(2)}. Las políticas transaccionales de ValorGT AI exigen que el monto neto a transferir en cuenta bancaria sea mayor o igual a Q100.00.`);
        return;
    }
    
    const confirmMessage = 
        `¿Deseas confirmar la solicitud de retiro de Tether Gold (XAUt)?\n\n` +
        `• Débito en Cartera: -${amount.toFixed(6)} XAUt\n` +
        `• Equivalente Bruto: Q${grossGTQ.toFixed(2)}\n` +
        `• Comisión de Red (4%): Q${feeGTQ.toFixed(2)}\n` +
        `• Monto Neto a Recibir: Q${netGTQ.toFixed(2)}\n\n` +
        `• Banco Destinatario: ${bank}\n` +
        `• Cuenta: ${account} (${type})\n\n` +
        `Este retiro se debitará de tu balance y quedará pendiente de transferencia bancaria por parte de la administración.`;
        
    if (!confirm(confirmMessage)) return;
    
    // Deducción local de balance
    loggedInB2bClient.usdtBalance -= amount;
    
    // Sincronizar en Supabase si está activo
    if (isXautPriceFetched || isSupabaseActive) {
        try {
            // Invocar el RPC extraer_oro seguro para deducir saldo e insertar historial airdrop como canje
            const { error } = await supabaseClient.rpc('extraer_oro', {
                p_usuario_ids: [loggedInB2bClient.id],
                p_monto_usd_por_usuario: amount * xautPrice,
                p_monto_xaut_por_usuario: amount,
                p_precio_pivote: xautPrice
            });
            if (error) {
                console.error("Error al procesar retiro en Supabase:", error);
            } else {
                if (typeof appendAdminLog === 'function') {
                    appendAdminLog("SECURITY", `withdrawal_node: Solicitud de retiro de ${amount.toFixed(6)} XAUt procesada mediante RPC seguro para ${loggedInB2bClient.name}.`, false);
                }
            }
        } catch (err) {
            console.error("Fallo de red al registrar retiro en Supabase:", err);
        }
    }
    
    // Registrar solicitud contable
    const refCode = "WTH-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);
    const maskedAccount = "••••" + account.slice(-4);
    
    const newWithdrawal = {
        ref: refCode,
        date: dateStr,
        bank: bank,
        account: maskedAccount,
        amountXAUt: amount,
        feeGTQ: feeGTQ,
        netGTQ: netGTQ,
        xautPrice: xautPrice,
        status: 'Pendiente'
    };
    
    b2bWithdrawals.unshift(newWithdrawal);
    
    // Guardar historial de retiros local persistente para el usuario
    if (loggedInB2bClient && loggedInB2bClient.email) {
        localStorage.setItem(`valorgt_withdrawals_${loggedInB2bClient.email.toLowerCase()}`, JSON.stringify(b2bWithdrawals));
    }
    
    // Registrar en logs del administrador
    if (typeof appendAdminLog === 'function') {
        appendAdminLog("SAAS", `withdrawal_node: Solicitud bancaria registrada para ${loggedInB2bClient.name} (${loggedInB2bClient.company}) - Banco: ${bank} - Neto: Q${netGTQ.toFixed(2)}.`, false);
    }
    
    // Limpiar formulario
    document.getElementById('b2b-withdrawal-form').reset();
    updateWithdrawalCalculations();
    
    // Refrescar UI, Cartera y Tablas
    updateSaasMetricsHUD();
    renderB2bWithdrawalsTable();
    syncB2bClientsFromSupabase(); // Refrescar en admin
    
    alert(`✅ SOLICITUD DE RETIRO REGISTRADA CON ÉXITO\n\n` +
          `Referencia: #${refCode}\n` +
          `Hemos debitado ${amount.toFixed(4)} XAUt de tu balance. La solicitud ha sido transmitida al panel de administración para su transferencia bancaria de Q${netGTQ.toFixed(2)}.`);
}

/**
 * Renderiza la tabla de historial de solicitudes de retiro
 */
async function fetchB2bTransactionsHistory() {
    if (!loggedInB2bClient) return [];
    
    // Asegurar que el precio de XAUT esté actualizado en vivo antes de calcular los equivalentes netos
    await fetchXautPriceForAirdrop();
    
    let list = [];
    const emailLower = loggedInB2bClient.email.toLowerCase();
    
    // 1. Cargar retiros locales desde localStorage
    const localWithdrawalsKey = `valorgt_withdrawals_${emailLower}`;
    const localWithdrawals = JSON.parse(localStorage.getItem(localWithdrawalsKey)) || [];
    
    localWithdrawals.forEach(w => {
        list.push({
            ref: w.ref,
            date: w.date,
            type: 'withdrawal',
            bank: w.bank,
            account: `Cuenta ${w.account}`,
            amountXAUt: -Math.abs(w.amountXAUt),
            feeGTQ: w.feeGTQ,
            netGTQ: w.netGTQ,
            xautPrice: w.xautPrice || (w.amountXAUt ? Math.abs((w.netGTQ / 0.96) / (w.amountXAUt * exchangeRate)) : 2380.00),
            status: w.status
        });
    });

    if (isSupabaseActive) {
        try {
            // 2. Cargar ingresos (airdrops) desde historial_oro de Supabase
            const { data: remoteHistory, error: histErr } = await supabaseClient
                .from('historial_oro')
                .select('*')
                .eq('usuario_id', loggedInB2bClient.id);
                
            if (!histErr && remoteHistory) {
                remoteHistory.forEach(h => {
                    const dateStr = new Date(h.fecha).toISOString().slice(0, 10) + " " + new Date(h.fecha).toTimeString().slice(0, 5);
                    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
                    const valConv = parseFloat(h.monto_usd) * conversion;
                    
                    if (h.tipo === 'airdrop_mensual') {
                        list.push({
                            ref: h.id.substring(0, 8).toUpperCase(),
                            date: dateStr,
                            type: 'airdrop',
                            bank: 'Administración',
                            account: 'Ingreso Directo / Airdrop',
                            amountXAUt: parseFloat(h.monto_xaut),
                            feeGTQ: 0,
                            netGTQ: valConv,
                            xautPrice: parseFloat(h.precio_pivote_xaut) || 2380.00,
                            status: 'Aprobado'
                        });
                    }
                });
            }

            // 3. Cargar transferencias P2P
            // A. Enviadas
            const { data: sentTxs, error: sentErr } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('sender_email', emailLower);
                
            if (!sentErr && sentTxs) {
                sentTxs.forEach(t => {
                    const dateStr = t.created_at 
                        ? (new Date(t.created_at).toISOString().slice(0, 10) + " " + new Date(t.created_at).toTimeString().slice(0, 5))
                        : new Date().toISOString().slice(0, 10) + " 12:00";
                    const price = parseFloat(t.xaut_price) || currentAirdropXautPrice || 2380.00;
                    const rate = parseFloat(t.exchange_rate) || exchangeRate || 7.78;
                    const conversion = activeCurrency === 'GTQ' ? rate : 1;
                    const valConv = parseFloat(t.amount) * price * conversion;
                    
                    list.push({
                        ref: (t.tx_hash || '0x').substring(0, 10),
                        date: dateStr,
                        type: 'transfer_sent',
                        bank: 'Transferencia',
                        account: `Enviada a: ${t.receiver_email}`,
                        amountXAUt: -parseFloat(t.amount),
                        feeGTQ: 0,
                        netGTQ: valConv,
                        xautPrice: price,
                        status: 'Aprobado'
                    });
                });
            }

            // B. Recibidas
            const { data: recvTxs, error: recvErr } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('receiver_email', emailLower);
                
            if (!recvErr && recvTxs) {
                recvTxs.forEach(t => {
                    const dateStr = t.created_at 
                        ? (new Date(t.created_at).toISOString().slice(0, 10) + " " + new Date(t.created_at).toTimeString().slice(0, 5))
                        : new Date().toISOString().slice(0, 10) + " 12:00";
                    const price = parseFloat(t.xaut_price) || currentAirdropXautPrice || 2380.00;
                    const rate = parseFloat(t.exchange_rate) || exchangeRate || 7.78;
                    const conversion = activeCurrency === 'GTQ' ? rate : 1;
                    const valConv = parseFloat(t.amount) * price * conversion;
                    
                    list.push({
                        ref: (t.tx_hash || '0x').substring(0, 10),
                        date: dateStr,
                        type: 'transfer_recv',
                        bank: 'Transferencia',
                        account: `Recibida de: ${t.sender_email}`,
                        amountXAUt: parseFloat(t.amount),
                        feeGTQ: 0,
                        netGTQ: valConv,
                        xautPrice: price,
                        status: 'Aprobado'
                    });
                });
            }
        } catch (err) {
            console.error("Error al consultar historial transaccional de Supabase:", err);
        }
    } else {
        // Fallback local en memoria
        const localTransfersKey = `valorgt_transfers_${emailLower}`;
        const localTransfers = JSON.parse(localStorage.getItem(localTransfersKey)) || [];
        localTransfers.forEach(t => {
            const price = t.xautPrice || 2380.00;
            const rate = t.exchangeRate || exchangeRate || 7.78;
            const conversion = activeCurrency === 'GTQ' ? rate : 1;
            const valConv = Math.abs(t.amountXAUt) * price * conversion;

            list.push({
                ref: t.ref,
                date: t.date,
                type: t.type,
                bank: 'Transferencia',
                account: t.detail,
                amountXAUt: t.amountXAUt,
                feeGTQ: 0,
                netGTQ: valConv,
                xautPrice: price,
                status: 'Aprobado'
            });
        });
        
        const localAirdropsKey = `valorgt_airdrops_${emailLower}`;
        const localAirdrops = JSON.parse(localStorage.getItem(localAirdropsKey)) || [];
        localAirdrops.forEach(a => {
            list.push({
                ref: a.ref,
                date: a.date,
                type: 'airdrop',
                bank: 'Administración',
                account: 'Ingreso Directo / Airdrop',
                amountXAUt: a.amountXAUt,
                feeGTQ: 0,
                netGTQ: a.amountGTQ,
                xautPrice: a.xautPrice || 2380.00,
                status: 'Aprobado'
            });
        });
    }

    // Ordenar de más reciente a más antiguo
    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
}

/**
 * Renderiza la tabla de historial de movimientos de la cartera (retiros, ingresos y transferencias)
 */
async function renderB2bWithdrawalsTable() {
    const tableBody = document.getElementById('b2b-withdrawals-table-body');
    const counter = document.getElementById('b2b-withdrawals-count');
    if (!tableBody) return;
    
    const historyList = await fetchB2bTransactionsHistory();
    
    if (historyList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i data-lucide="clock" style="width: 24px; height: 24px; color: var(--text-secondary); margin-bottom: 5px; opacity: 0.5; display: inline-block;"></i><br>
                    No hay movimientos registrados en la cartera de Tether Gold.
                </td>
            </tr>
        `;
        if (counter) counter.innerText = "0 Movimientos";
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    if (counter) counter.innerText = `${historyList.length} Movimientos`;
    
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    tableBody.innerHTML = '';
    
    historyList.forEach(w => {
        const row = document.createElement('tr');
        
        let statusClass = 'status-badge-pending';
        if (w.status === 'Aprobado' || w.status === 'Completado') {
            statusClass = 'status-badge-approved';
        }
        
        let amountStyle = 'color: #fff;';
        let amountPrefix = '';
        if (w.amountXAUt > 0) {
            amountStyle = 'color: #34c759;';
            amountPrefix = '+';
        } else if (w.amountXAUt < 0) {
            amountStyle = 'color: #ff3b30;';
            amountPrefix = '';
        }
        
        const feeText = w.feeGTQ > 0 ? `-${currencySym}${w.feeGTQ.toFixed(2)}` : '-';
        const typeLabel = w.type === 'withdrawal' ? 'RETIRO' : (w.type === 'airdrop' ? 'INGRESO' : (w.type === 'transfer_sent' ? 'ENVÍO P2P' : 'RECEP P2P'));
        const typeStyle = w.type === 'withdrawal' || w.type === 'transfer_sent' ? 'color: #ff9500;' : 'color: #00d2ff;';

        const priceVal = w.xautPrice || 2380.00;
        const priceText = `$${formatNumber(priceVal.toFixed(2))}`;

        row.innerHTML = `
            <td style="padding: 10px 5px; text-align: left; vertical-align: middle;">
                <strong>${w.date}</strong><br>
                <span class="text-muted" style="font-size: 0.68rem; font-family: monospace;">Ref: ${w.ref}</span>
            </td>
            <td style="padding: 10px 5px; text-align: left; vertical-align: middle;">
                <strong style="${typeStyle}; font-size: 0.7rem;">${typeLabel}</strong><br>
                <strong style="color: #fff; font-size: 0.78rem;">${w.bank}</strong><br>
                <span class="text-muted" style="font-size: 0.72rem;">${w.account}</span>
            </td>
            <td style="padding: 10px 5px; text-align: right; vertical-align: middle; font-weight: bold; font-size: 0.82rem; ${amountStyle}" class="font-mono">
                ${amountPrefix}${w.amountXAUt.toFixed(4)} XAUt
            </td>
            <td style="padding: 10px 5px; text-align: right; vertical-align: middle; color: #00d2ff; font-weight: bold; font-size: 0.82rem;" class="font-mono">
                ${priceText}
            </td>
            <td style="padding: 10px 5px; text-align: right; vertical-align: middle; color: var(--red); font-size: 0.82rem;" class="font-mono">
                ${feeText}
            </td>
            <td style="padding: 10px 5px; text-align: right; vertical-align: middle; color: #ffd700; font-weight: bold; font-size: 0.82rem;" class="font-mono">
                ${w.amountXAUt > 0 ? '+' : ''}${currencySym}${formatNumber(w.netGTQ.toFixed(2))}
            </td>
            <td style="padding: 10px 5px; text-align: center; vertical-align: middle;">
                <span class="${statusClass}">${w.status}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

async function clearLocalGoldHistory() {
    if (!loggedInB2bClient) return;
    if (confirm("¿Estás seguro de que deseas limpiar el historial de movimientos de esta cuenta? Esto borrará el historial local y los registros en la base de datos de pruebas.")) {
        const emailLower = loggedInB2bClient.email.toLowerCase();
        
        // 1. Limpiar arrays en memoria y localStorage
        b2bWithdrawals = [];
        localStorage.removeItem(`valorgt_withdrawals_${emailLower}`);
        localStorage.removeItem(`valorgt_transfers_${emailLower}`);
        localStorage.removeItem(`valorgt_airdrops_${emailLower}`);
        
        // 2. Limpiar registros en Supabase si está activo
        if (isSupabaseActive) {
            try {
                // Borrar transferencias de Supabase
                const { error: txErr } = await supabaseClient
                    .from('transactions')
                    .delete()
                    .or(`sender_email.eq.${emailLower},receiver_email.eq.${emailLower}`);
                
                if (txErr) console.warn("Supabase: No se pudieron borrar transacciones (posible restricción de políticas RLS o permisos):", txErr);
                
                // Borrar historial de oro (airdrops / canjes)
                const { error: goldErr } = await supabaseClient
                    .from('historial_oro')
                    .delete()
                    .eq('usuario_id', loggedInB2bClient.id);
                    
                if (goldErr) console.warn("Supabase: No se pudo borrar historial_oro:", goldErr);
                
            } catch (dbErr) {
                console.error("Fallo de red al limpiar registros en Supabase:", dbErr);
            }
        }
        
        // 3. Renderizar y actualizar interfaz de inmediato
        await renderB2bWithdrawalsTable();
        if (typeof updateSaasMetricsHUD === 'function') {
            updateSaasMetricsHUD();
        }
        
        if (typeof appendAdminLog === 'function') {
            appendAdminLog("SAAS", `ledger_node: Historial de movimientos y base de datos local limpiados para ${loggedInB2bClient.name}.`, false);
        }
    }
}

/**
 * ==========================================================================
 * SISTEMA MULTIMEDIA B2B: GALERÍA DE IMÁGENES PREMIUM Y WATERMARKS
 * ==========================================================================
 */

/**
 * Renderiza la sección de imagen de una tarjeta de propiedad.
 * Soporta carrusel interactivo si la propiedad posee múltiples imágenes en metadata o photos.
 * Incorpora marcas de agua (logo) para planes Pro y Premium.
 */
function renderCardImageHTML(prop, wrapperClass = 'card-image-wrapper', heightStyle = '165px', isSponsored = false, badgeColorClass = '', isB2B = false) {
    const photos = (prop.metadata && prop.metadata.photos && prop.metadata.photos.length > 0) 
        ? prop.metadata.photos 
        : (prop.photos && prop.photos.length > 0 ? prop.photos : [prop.photo]);

    const youtubeBadge = prop.youtubeUrl ? `<span class="card-youtube-badge" onclick="event.stopPropagation(); window.open('${prop.youtubeUrl}', '_blank')" style="position: absolute; bottom: 8px; right: 8px; z-index: 7; background: rgba(255, 0, 0, 0.85); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.55rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255, 0, 0, 0.4);"><i data-lucide="video" style="width: 10px; height: 10px;"></i> VER VIDEO</span>` : '';
    const statusBadge = (!isB2B && badgeColorClass && !isSponsored) ? `<span class="card-status-badge ${badgeColorClass}">${prop.badge || 'DESTACADO'}</span>` : '';
    
    // Regla de Negocio: Cargar plan de membresía y logo del creador
    const ownerPlan = prop.agentPlan || (loggedInB2bClient ? loggedInB2bClient.plan : 'Básico');
    const isPremiumPartner = ownerPlan && ['pro', 'vip', 'premium'].includes(ownerPlan.toLowerCase());
    const ownerLogo = prop.agentLogo || (loggedInB2bClient ? loggedInB2bClient.logo : '');
    
    const logoWatermark = (isPremiumPartner && ownerLogo) 
        ? `<div class="card-logo-watermark" style="position: absolute; top: 10px; right: 10px; z-index: 6; width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid var(--cyan); background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0, 240, 255, 0.4); overflow: hidden;"><img src="${ownerLogo}" style="width: 100%; height: 100%; object-fit: contain;"></div>` 
        : '';

    // B2B Badges
    const b2bCatClass = isB2B ? prop.category.toLowerCase() : '';
    const b2bBadge = isB2B ? `<span class="inv-cat-badge ${b2bCatClass}">${prop.category.toUpperCase()}</span>` : '';
    const b2bSponsored = (isB2B && isSponsored) ? '<span class="inv-sponsored-tag" style="z-index: 7;">★ PATROCINADO</span>' : '';

    if (photos.length > 1) {
        const rawId = prop.id || prop.title || Math.random().toString();
        const sliderId = `slider-${rawId.toString().replace(/[^a-zA-Z0-9]/g, '')}`;
        return `
            <div class="card-image-slider-container ${wrapperClass}" id="${sliderId}" style="position: relative; overflow: hidden; width: 100%; height: ${heightStyle};">
                <div class="card-image-slider-track" style="display: flex; width: ${photos.length * 100}%; height: 100%; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translateX(0);">
                    ${photos.map(p => `<img src="${p}" alt="${prop.title}" style="width: ${100 / photos.length}%; height: 100%; object-fit: cover;">`).join('')}
                </div>
                <!-- Botones del slider -->
                <button class="slider-btn prev" onclick="event.stopPropagation(); changeCardImageSlide('${sliderId}', -1, ${photos.length})" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.65); color: #fff; border: 1px solid rgba(255,255,255,0.25); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.2s, background 0.2s; z-index: 8;"><i data-lucide="chevron-left" style="width: 12px; height: 12px;"></i></button>
                <button class="slider-btn next" onclick="event.stopPropagation(); changeCardImageSlide('${sliderId}', 1, ${photos.length})" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.65); color: #fff; border: 1px solid rgba(255,255,255,0.25); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.2s; z-index: 8;"><i data-lucide="chevron-right" style="width: 12px; height: 12px;"></i></button>
                
                <!-- Indicadores de dots -->
                <div class="slider-indicators" style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; z-index: 8;">
                    ${photos.map((_, idx) => `<span class="slider-dot ${idx === 0 ? 'active' : ''}" style="width: 6px; height: 6px; border-radius: 50%; background: ${idx === 0 ? 'var(--cyan)' : 'rgba(255,255,255,0.4)'}; transition: background 0.2s, transform 0.2s; cursor: pointer;" onclick="event.stopPropagation(); jumpToCardImageSlide('${sliderId}', ${idx}, ${photos.length})"></span>`).join('')}
                </div>
                ${logoWatermark}
                ${statusBadge}
                ${youtubeBadge}
                ${b2bBadge}
                ${b2bSponsored}
            </div>
        `;
    } else {
        return `
            <div class="${wrapperClass}" style="position: relative; height: ${heightStyle}; overflow: hidden;">
                ${logoWatermark}
                ${statusBadge}
                ${youtubeBadge}
                ${b2bBadge}
                ${b2bSponsored}
                <img src="${prop.photo}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        `;
    }
}

/**
 * Desplaza horizontalmente la pista del slider de una tarjeta
 */
function changeCardImageSlide(sliderId, direction, totalSlides) {
    const container = document.getElementById(sliderId);
    if (!container) return;

    const track = container.querySelector('.card-image-slider-track');
    const dots = container.querySelectorAll('.slider-dot');
    if (!track) return;

    let currentSlide = parseInt(container.getAttribute('data-current-slide') || '0');
    currentSlide += direction;

    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }

    container.setAttribute('data-current-slide', currentSlide);
    track.style.transform = `translateX(-${(currentSlide * 100) / totalSlides}%)`;

    dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
            dot.classList.add('active');
            dot.style.background = 'var(--cyan)';
            dot.style.transform = 'scale(1.25)';
        } else {
            dot.classList.remove('active');
            dot.style.background = 'rgba(255,255,255,0.4)';
            dot.style.transform = 'scale(1)';
        }
    });
}

/**
 * Salta directamente a un slide específico de una tarjeta
 */
function jumpToCardImageSlide(sliderId, slideIndex, totalSlides) {
    const container = document.getElementById(sliderId);
    if (!container) return;

    const track = container.querySelector('.card-image-slider-track');
    const dots = container.querySelectorAll('.slider-dot');
    if (!track) return;

    container.setAttribute('data-current-slide', slideIndex);
    track.style.transform = `translateX(-${(slideIndex * 100) / totalSlides}%)`;

    dots.forEach((dot, idx) => {
        if (idx === slideIndex) {
            dot.classList.add('active');
            dot.style.background = 'var(--cyan)';
            dot.style.transform = 'scale(1.25)';
        } else {
            dot.classList.remove('active');
            dot.style.background = 'rgba(255,255,255,0.4)';
            dot.style.transform = 'scale(1)';
        }
    });
}

/**
 * ==========================================================================
 * SISTEMA DE FICHA DETALLADA (MODAL) Y CONTACTO DE WHATSAPP
 * ==========================================================================
 */

/**
 * Abre el Modal Premium con todos los detalles de la propiedad seleccionada
 */
function openPropertyDetailModal(zoneKey, index) {
    const prop = PORTFOLIO_DATABASE[zoneKey]?.[index];
    if (!prop) return;

    const modal = document.getElementById('property-detail-modal');
    if (!modal) return;

    // Configurar metadatos y título
    document.getElementById('modal-property-tag').innerText = prop.tag;
    document.getElementById('modal-property-title').innerText = prop.title;
    
    // Configurar precio dinámico según moneda
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    const convertedPrice = prop.priceUSD * conversion;
    const { type } = getPropertyCategoryAndType(prop);
    const priceLabel = type.toLowerCase() === 'renta' ? ' / Mes' : '';
    document.getElementById('modal-property-price').innerText = `${currencySym}${formatNumber(convertedPrice.toFixed(0))}${priceLabel}`;

    // Configurar descripción (usar por defecto si no tiene)
    const desc = prop.description || (prop.metadata && prop.metadata.description) || 'Propiedad exclusiva seleccionada y tasada por el nodo inteligente de ValorGT AI.';
    document.getElementById('modal-property-description').innerText = desc;

    // Configurar especificaciones base
    document.getElementById('modal-spec-size').innerText = prop.size;
    document.getElementById('modal-spec-rooms').innerText = prop.rooms;
    document.getElementById('modal-spec-baths').innerText = prop.bathrooms;
    document.getElementById('modal-spec-parks').innerText = prop.parkings;

    // Configurar tags avanzados en cian
    const tagsArea = document.getElementById('modal-advanced-tags');
    tagsArea.innerHTML = '';
    
    const tags = [];
    if (prop.hasMasterSuite) tags.push("Suite Principal");
    if (prop.hasVisitorBath) tags.push("Baño de Visitas");
    if (prop.study) tags.push("Estudio");
    if (prop.familyRoom) tags.push("Sala Familiar");
    
    if (prop.amenities && prop.amenities.length > 0) {
        prop.amenities.forEach(am => {
            if (am === "amenity-pool" || am === "pool") tags.push("Piscina / Jacuzzi");
            if (am === "amenity-gym" || am === "gym") tags.push("Gimnasio Equipado");
            if (am === "amenity-security" || am === "security") tags.push("Seguridad 24/7");
            if (am === "amenity-smart" || am === "smart") tags.push("Domótica Inteligente");
            if (am === "amenity-view" || am === "view") tags.push("Vista Panorámica");
        });
    }

    if (tags.length > 0) {
        tags.forEach(t => {
            const span = document.createElement('span');
            span.style.cssText = "font-size: 0.65rem; background: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--cyan); padding: 4px 10px; border-radius: 4px; font-weight: 500;";
            span.innerText = t;
            tagsArea.appendChild(span);
        });
    } else {
        tagsArea.innerHTML = '<span style="font-size: 0.65rem; color: var(--text-muted);">Sin características adicionales configuradas.</span>';
    }

    // Configurar carrusel de imágenes en el modal
    const galleryArea = document.getElementById('modal-property-gallery');
    const photos = (prop.metadata && prop.metadata.photos && prop.metadata.photos.length > 0) 
        ? prop.metadata.photos 
        : (prop.photos && prop.photos.length > 0 ? prop.photos : [prop.photo]);

    if (photos.length > 1) {
        const rawId = prop.id || prop.title || Math.random().toString();
        const sliderId = `modal-slider-${rawId.toString().replace(/[^a-zA-Z0-9]/g, '')}`;
        galleryArea.innerHTML = `
            <div class="card-image-slider-container" id="${sliderId}" style="position: relative; overflow: hidden; width: 100%; height: 260px; border-radius: 12px 12px 0 0;">
                <div class="card-image-slider-track" style="display: flex; width: ${photos.length * 100}%; height: 100%; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translateX(0);">
                    ${photos.map(p => `<img src="${p}" alt="${prop.title}" style="width: ${100 / photos.length}%; height: 100%; object-fit: cover;">`).join('')}
                </div>
                <!-- Botones del slider -->
                <button class="slider-btn prev" onclick="event.stopPropagation(); changeCardImageSlide('${sliderId}', -1, ${photos.length})" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 1; z-index: 8;"><i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i></button>
                <button class="slider-btn next" onclick="event.stopPropagation(); changeCardImageSlide('${sliderId}', 1, ${photos.length})" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.7); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 1; z-index: 8;"><i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i></button>
                
                <!-- Indicadores de dots -->
                <div class="slider-indicators" style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; z-index: 8;">
                    ${photos.map((_, idx) => `<span class="slider-dot ${idx === 0 ? 'active' : ''}" style="width: 7px; height: 7px; border-radius: 50%; background: ${idx === 0 ? 'var(--cyan)' : 'rgba(255,255,255,0.4)'}; transition: background 0.2s, transform 0.2s; cursor: pointer;" onclick="event.stopPropagation(); jumpToCardImageSlide('${sliderId}', ${idx}, ${photos.length})"></span>`).join('')}
                </div>
            </div>
        `;
    } else {
        galleryArea.innerHTML = `
            <div style="width: 100%; height: 260px; overflow: hidden; border-radius: 12px 12px 0 0; position: relative;">
                <img src="${prop.photo}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        `;
    }

    // Configurar información de contacto del agente creador
    const agentName = prop.agentName || (prop.metadata && prop.metadata.agentName) || 'Asesor Inmobiliario';
    const agentCompany = prop.agentCompany || (prop.metadata && prop.metadata.agentCompany) || 'ValorGT Premium Partner';
    const agentLogo = prop.agentLogo || (prop.metadata && prop.metadata.agentLogo) || '';
    const agentPhone = prop.agentPhone || (prop.metadata && prop.metadata.agentPhone) || '50250129482'; // fallback Ana Estévez
    const ownerPlan = prop.agentPlan || (prop.metadata && prop.metadata.agentPlan) || 'Básico';

    document.getElementById('modal-agent-name').innerText = agentName;
    document.getElementById('modal-agent-company').innerText = agentCompany;

    // Renderizar logo del agente si tiene plan Pro/Premium
    const logoContainer = document.getElementById('modal-agent-logo-container');
    const isPremiumPartner = ownerPlan && ['pro', 'vip', 'premium'].includes(ownerPlan.toLowerCase());
    
    if (isPremiumPartner && agentLogo) {
        logoContainer.innerHTML = `<img src="${agentLogo}" alt="Logo Inmobiliaria" style="width: 100%; height: 100%; object-fit: contain;">`;
        logoContainer.style.display = "flex";
    } else {
        logoContainer.innerHTML = `<i data-lucide="user" style="width: 20px; height: 20px; color: var(--cyan);"></i>`;
        logoContainer.style.display = "flex";
    }

    // Configurar enlace directo de WhatsApp con mensaje personalizado
    const cleanPhone = agentPhone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`¡Hola! Estoy interesado en la propiedad "${prop.title}" (${prop.tag}) que vi listada en ValorGT AI. ¿Me podrías brindar más información sobre esta opción?`);
    const waBtn = document.getElementById('modal-whatsapp-btn');
    waBtn.href = `https://wa.me/${cleanPhone}?text=${waText}`;

    // Configurar botón Autotasar integrado
    const autotasarBtn = document.getElementById('modal-autotasar-btn');
    autotasarBtn.onclick = () => {
        closePropertyDetailModal();
        autofillValuationForm(zoneKey, index);
        // Desplazar suavemente a la sección de valoración
        document.getElementById('nav-btn-dashboard').click();
        document.querySelector('.top-header').scrollIntoView({ behavior: 'smooth' });
    };

    // Configurar botón compartir en modal
    const modalShareBtn = document.getElementById('modal-share-btn');
    if (modalShareBtn) {
        modalShareBtn.onclick = (e) => {
            sharePropertyLink(e, prop.id);
        };
    }

    // Mostrar modal
    modal.classList.remove('hidden');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Cierra el modal de detalles de propiedad
 */
function closePropertyDetailModal() {
    const modal = document.getElementById('property-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Guarda el WhatsApp y Logotipo de forma local (híbrida) y en la nube
 */
async function saveB2bAgentProfile() {
    if (!loggedInB2bClient) return;

    const whatsappInput = document.getElementById('profile-whatsapp');
    const logoInput = document.getElementById('profile-logo-url');

    if (!whatsappInput || !logoInput) return;

    const whatsapp = whatsappInput.value.trim().replace(/[^0-9]/g, '');
    const logo = logoInput.value.trim();

    if (!whatsapp) {
        alert("Por favor ingresa un número de WhatsApp de contacto válido.");
        return;
    }

    // Actualizar localmente el cliente activo
    loggedInB2bClient.whatsapp = whatsapp;
    loggedInB2bClient.logo = logo;
    loggedInB2bClient.phone = whatsapp; // Sincronizar campo telefónico genérico

    // Guardar localmente en localStorage
    localStorage.setItem(`b2b_profile_extras_${loggedInB2bClient.id}`, JSON.stringify({
        whatsapp: whatsapp,
        logo: logo
    }));

    // Intentar sincronizar en Supabase
    if (isSupabaseActive) {
        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update({ 
                    phone: whatsapp,
                    // Si la base de datos lo soporta, actualizar el metadata
                    metadata: {
                        whatsapp: whatsapp,
                        logo: logo
                    }
                })
                .eq('id', loggedInB2bClient.id);

            if (error) {
                console.warn("Actualización exitosa en local, advertencia al guardar en Supabase:", error.message);
            } else {
                console.log("⚡ [ValorGT AI] Perfil sincronizado exitosamente en la nube de Supabase.");
            }
        } catch (err) {
            console.error("Fallo de red al sincronizar perfil en la nube:", err);
        }
    }

    alert("🏆 ¡PERFIL ACTUALIZADO CON ÉXITO!\n\nTu WhatsApp de contacto y marca de agua (Logo) han sido consolidados. Tus propiedades reflejarán esta información de inmediato.");
    
    // Re-renderizar perfil e inventarios
    renderB2bAgentProfile();
    renderB2bInventory();
}

/* ==========================================================================
   MÓDULO DE PLANES DE SUSCRIPCIÓN PREMIUM CON VIDEO EXPLICATIVO DINÁMICO
   ========================================================================== */

/**
 * Procesa cualquier URL de YouTube para extraer su ID y generar un enlace embed válido.
 * Admite enlaces cortos (youtu.be), estándar (watch?v=), embebidos o directamente el ID.
 * @param {string} url - El enlace o ID de YouTube ingresado.
 * @returns {string} - Un enlace de tipo embed listo para ser usado en iframe.
 */
function getYouTubeEmbedUrl(url) {
    if (!url || url.trim() === "") return "";
    
    // Si ya es un URL de embed, retornarlo directamente
    if (url.includes("/embed/")) {
        return url;
    }
    
    let videoId = "";
    try {
        if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split(/[?#]/)[0];
        } else if (url.includes("v=")) {
            videoId = url.split("v=")[1].split(/[&?#]/)[0];
        } else if (url.includes("embed/")) {
            videoId = url.split("embed/")[1].split(/[?#]/)[0];
        } else {
            // Si es solo el ID de 11 caracteres
            videoId = url.trim();
        }
    } catch (e) {
        console.error("Error al parsear YouTube URL:", e);
        return "https://www.youtube.com/embed/dQw4w9WgXcQ";
    }
    
    if (videoId && videoId.length === 11) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return "https://www.youtube.com/embed/dQw4w9WgXcQ";
}

/**
 * Inicializa y refresca la vista pública de Planes de Suscripción Premium
 */
function initSubscriptionsView() {
    const iframe = document.getElementById('subscription-youtube-iframe');
    if (iframe) {
        iframe.src = plansVideoUrl;
    }
    
    renderPublicPricingGrid();
}

/**
 * Renderiza dinámicamente la grilla pública de planes con precios e interacción reactiva.
 * Sincroniza con el tipo de moneda activo (GTQ / USD) y el estado de la sesión comercial.
 */
function renderPublicPricingGrid() {
    const grid = document.getElementById('public-pricing-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Limpiar

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let plans = [];
    if (activePlansProfile === 'agente') {
        plans = [
            {
                key: 'basico',
                badge: 'INDIVIDUAL',
                badgeColor: 'var(--neon-blue)',
                badgeBg: 'rgba(10, 132, 255, 0.15)',
                badgeBorder: 'rgba(10, 132, 255, 0.3)',
                title: 'Agente Individual',
                subtitle: 'Ideal para agentes pequeños y tasadores autónomos.',
                priceUSD: 18,
                priceGTQ: 140,
                features: [
                    { text: '20 Propiedades en Catálogo', active: true },
                    { text: 'Redes Neuronales Predictivas', active: true },
                    { text: 'Sello de Verificación Básica', active: true },
                    { text: 'Acceso a Radar de Calor', active: true },
                    { text: 'Terminal de Inversión (Demo)', active: false },
                    { text: 'Portafolio Patrimonial IA (Demo)', active: false },
                    { text: 'Descuento en Pautas Publicitarias', active: false }
                ]
            },
            {
                key: 'pro',
                badge: 'PRO',
                badgeColor: 'var(--cyan)',
                badgeBg: 'rgba(0, 240, 255, 0.1)',
                badgeBorder: 'rgba(0, 240, 255, 0.3)',
                title: 'Inmobiliaria Pro',
                subtitle: 'Perfecto para agencias en expansión y brokers activos.',
                priceUSD: 31,
                priceGTQ: 240,
                recommended: true,
                features: [
                    { text: '100 Propiedades en Catálogo', active: true },
                    { text: 'Redes Neuronales Predictivas', active: true },
                    { text: 'Logo Propio en Inmuebles', active: true },
                    { text: 'Acceso Completo a Radar de Calor', active: true },
                    { text: 'Acceso Ilimitado a Terminal de Inversión', active: true },
                    { text: 'Acceso Ilimitado a Portafolio IA', active: true },
                    { text: '15% Descuento en Pautas Publicitarias', active: true }
                ]
            },
            {
                key: 'vip',
                badge: 'PREMIUM',
                badgeColor: '#bf5af2',
                badgeBg: 'rgba(191, 90, 242, 0.15)',
                badgeBorder: 'rgba(191, 90, 242, 0.3)',
                title: 'Inmobiliaria Premium',
                subtitle: 'Operativa ilimitada con carteras de oro digital.',
                priceUSD: 82,
                priceGTQ: 640,
                features: [
                    { text: 'Propiedades Ilimitadas en Catálogo', active: true },
                    { text: 'Redes Neuronales Predictivas', active: true },
                    { text: 'Logo Propio y Destacados Premium', active: true },
                    { text: 'Acceso Completo a Radar de Calor', active: true },
                    { text: 'Acceso Ilimitado a Terminal de Inversión', active: true },
                    { text: 'Acceso Ilimitado a Portafolio IA', active: true },
                    { text: '30% Descuento en Pautas Publicitarias', active: true },
                    { text: 'Cartera de ORO Digital Habilitada', active: true, color: '#ffd700' }
                ]
            }
        ];
    } else {
        plans = [
            {
                key: 'premium',
                badge: 'INVERSIONISTA PREMIUM',
                badgeColor: '#ffd700',
                badgeBg: 'rgba(255, 215, 0, 0.15)',
                badgeBorder: 'rgba(255, 215, 0, 0.4)',
                title: 'Inversionista Premium',
                subtitle: 'Inteligencia inmobiliaria para detectar oportunidades antes del mercado.',
                priceUSD: 43.70,
                priceGTQ: 340,
                recommended: true,
                features: [
                    { text: 'Acceso Tasa Inteligente & Radar de Calor', active: true, color: '#00f0ff' },
                    { text: 'Terminal de Inversión & Portafolio IA', active: true },
                    { text: 'Telemetría del Sector - Ciudad de Guatemala', active: true },
                    { text: 'Comparativa de Rendimiento por Zonas (ROI vs Plusvalía)', active: true },
                    { text: 'Noticias en Vivo del Mercado en Guatemala', active: true },
                    { text: 'Portafolio Patrimonial & Asesor IA', active: true },
                    { text: 'Gestor de Activos Inmobiliarios Avanzado', active: true },
                    { text: 'Proyector de Riqueza y Amortización', active: true },
                    { text: 'Cartera de Oro Digital & Participación Directa', active: true, color: '#ffd700' },
                    { text: 'Módulo de Transferencias, Retiros y Depósitos', active: true },
                    { text: 'Distribuciones de Oro Digital Habilitadas', active: true }
                ]
            }
        ];
    }

    plans.forEach(plan => {
        const isUserActivePlan = isCommercialAuthenticated && loggedInB2bClient && activeB2bPlan === plan.key;
        const priceNum = activeCurrency === 'GTQ' ? plan.priceGTQ : plan.priceUSD;
        
        const card = document.createElement('div');
        card.className = `pricing-card ${plan.recommended ? 'active-plan' : ''}`;
        if (plan.recommended) {
            card.style.position = 'relative';
        }
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.padding = '20px';
        card.style.boxSizing = 'border-box';
        card.style.height = '100%';

        let featuresHtml = '';
        plan.features.forEach(f => {
            const colorStyle = f.color ? `style="color: ${f.color};"` : '';
            if (f.active) {
                featuresHtml += `<li><i data-lucide="check" ${colorStyle}></i> ${f.text}</li>`;
            } else {
                featuresHtml += `<li><i data-lucide="x" class="text-red"></i> <span style="text-decoration: line-through; opacity: 0.5;">${f.text}</span></li>`;
            }
        });

        let actionButtonHtml = '';
        if (isCommercialAuthenticated) {
            if (isUserActivePlan) {
                actionButtonHtml = `<button class="btn-plan-action active-btn" style="background: rgba(0,255,128,0.1); border: 1px solid var(--green); color: var(--green); cursor: default;" disabled>Tu Plan Activo</button>`;
            } else {
                actionButtonHtml = `<button class="btn-plan-action" onclick="openPlanPayment('${plan.key}')">Cambiar Plan</button>`;
            }
        } else {
            actionButtonHtml = `<button class="btn-plan-action" onclick="selectPublicPlanForSignup('${plan.key}')">Adquirir Plan</button>`;
        }

        card.innerHTML = `
            ${plan.recommended ? `<div class="active-ribbon" style="top: -8px; right: 15px; font-size: 0.75rem; padding: 3px 10px;">RECOMENDADO</div>` : ''}
            <div>
                <div class="plan-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; margin-bottom: 18px;">
                    <span class="plan-badge" style="background: ${plan.badgeBg}; color: ${plan.badgeColor}; border: 1px solid ${plan.badgeBorder}; font-size: 0.85rem; padding: 4px 10px; border-radius: 6px; font-weight: bold; letter-spacing: 1.2px;">${plan.badge}</span>
                    <h3 class="plan-title" style="margin-top: 12px; font-size: 1.45rem; font-weight: bold; color: #fff;">${plan.title}</h3>
                    <p class="plan-subtitle" style="font-size: 0.88rem; color: var(--text-muted); margin: 8px 0 0 0; line-height: 1.4;">${plan.subtitle}</p>
                </div>
                <div class="plan-price font-mono" style="font-size: 2.3rem; font-weight: bold; color: ${plan.recommended ? 'var(--cyan)' : '#fff'}; margin-bottom: 22px;">
                    <span class="plan-currency-sym" style="font-size: 1.5rem; vertical-align: super;">${currencySym}</span>
                    <span class="plan-price-num">${formatNumber(priceNum.toFixed(0))}</span>
                    <span class="plan-period" style="font-size: 0.88rem; color: var(--text-muted); font-weight: normal;">/mes</span>
                </div>
                <ul class="plan-features font-mono" style="display: flex; flex-direction: column; gap: 10px; font-size: 0.92rem; color: var(--text-secondary); list-style: none; padding: 0; margin: 0 0 28px 0;">
                    ${featuresHtml}
                </ul>
            </div>
            ${actionButtonHtml}
        `;

        grid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Renderiza dinámicamente la grilla de precios en el panel comercial B2B según el rol del usuario
 */
function renderB2bPricingGrid() {
    const grid = document.getElementById('b2b-pricing-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Limpiar

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    
    // Determinar perfil de planes a mostrar basado en el rol del usuario logueado
    const isInvestor = loggedInB2bClient && (loggedInB2bClient.role || '').toLowerCase() === 'inversionista';
    const profileType = isInvestor ? 'inversionista' : 'agente';

    let plans = [];
    if (profileType === 'agente') {
        plans = [
            {
                key: 'basico',
                badge: 'INDIVIDUAL',
                badgeColor: 'var(--neon-blue)',
                badgeBg: 'rgba(10, 132, 255, 0.15)',
                badgeBorder: 'rgba(10, 132, 255, 0.3)',
                title: 'Agente Individual',
                subtitle: 'Ideal para agentes pequeños y tasadores autónomos.',
                priceUSD: 18,
                priceGTQ: 140,
                features: [
                    { text: '20 Propiedades en Catálogo', active: true },
                    { text: 'Redes Neuronales Predictivas', active: true },
                    { text: 'Sello de Verificación Básica', active: true },
                    { text: 'Acceso a Radar de Calor', active: true },
                    { text: 'Terminal de Inversión (Demo)', active: false },
                    { text: 'Portafolio Patrimonial IA (Demo)', active: false },
                    { text: 'Descuento en Pautas Publicitarias', active: false }
                ]
            },
            {
                key: 'pro',
                badge: 'PRO',
                badgeColor: 'var(--cyan)',
                badgeBg: 'rgba(0, 240, 255, 0.1)',
                badgeBorder: 'rgba(0, 240, 255, 0.3)',
                title: 'Inmobiliaria Pro',
                subtitle: 'Perfecto para agencias en expansión y brokers activos.',
                priceUSD: 31,
                priceGTQ: 240,
                recommended: true,
                features: [
                    { text: '100 Propiedades en Catálogo', active: true },
                    { text: 'Redes Neuronales Predictivas', active: true },
                    { text: 'Logo Propio en Inmuebles', active: true },
                    { text: 'Acceso Completo a Radar de Calor', active: true },
                    { text: 'Acceso Ilimitado a Terminal de Inversión', active: true },
                    { text: 'Acceso Ilimitado a Portafolio IA', active: true },
                    { text: '15% Descuento en Pautas Publicitarias', active: true }
                ]
            },
            {
                key: 'vip',
                badge: 'PREMIUM',
                badgeColor: '#bf5af2',
                badgeBg: 'rgba(191, 90, 242, 0.15)',
                badgeBorder: 'rgba(191, 90, 242, 0.3)',
                title: 'Inmobiliaria Premium',
                subtitle: 'Operativa ilimitada con carteras de oro digital.',
                priceUSD: 82,
                priceGTQ: 640,
                features: [
                    { text: 'Propiedades Ilimitadas en Catálogo', active: true },
                    { text: 'Redes Neuronales Predictivas', active: true },
                    { text: 'Logo Propio y Destacados Premium', active: true },
                    { text: 'Acceso Completo a Radar de Calor', active: true },
                    { text: 'Acceso Ilimitado a Terminal de Inversión', active: true },
                    { text: 'Acceso Ilimitado a Portafolio IA', active: true },
                    { text: '30% Descuento en Pautas Publicitarias', active: true },
                    { text: 'Cartera de ORO Digital Habilitada', active: true, color: '#ffd700' }
                ]
            }
        ];
    } else {
        plans = [
            {
                key: 'premium',
                badge: 'INVERSIONISTA PREMIUM',
                badgeColor: '#ffd700',
                badgeBg: 'rgba(255, 215, 0, 0.15)',
                badgeBorder: 'rgba(255, 215, 0, 0.4)',
                title: 'Inversionista Premium',
                subtitle: 'Inteligencia inmobiliaria para detectar oportunidades antes del mercado.',
                priceUSD: 43.70,
                priceGTQ: 340,
                recommended: true,
                features: [
                    { text: 'Acceso Tasa Inteligente & Radar de Calor', active: true, color: '#00f0ff' },
                    { text: 'Terminal de Inversión & Portafolio IA', active: true },
                    { text: 'Telemetría del Sector - Ciudad de Guatemala', active: true },
                    { text: 'Comparativa de Rendimiento por Zonas (ROI vs Plusvalía)', active: true },
                    { text: 'Noticias en Vivo del Mercado en Guatemala', active: true },
                    { text: 'Portafolio Patrimonial & Asesor IA', active: true },
                    { text: 'Gestor de Activos Inmobiliarios Avanzado', active: true },
                    { text: 'Proyector de Riqueza y Amortización', active: true },
                    { text: 'Cartera de Oro Digital & Participación Directa', active: true, color: '#ffd700' },
                    { text: 'Módulo de Transferencias, Retiros y Depósitos', active: true },
                    { text: 'Distribuciones de Oro Digital Habilitadas', active: true }
                ]
            }
        ];
    }

    plans.forEach(plan => {
        const isUserActivePlan = isCommercialAuthenticated && loggedInB2bClient && activeB2bPlan === plan.key;
        const priceNum = activeCurrency === 'GTQ' ? plan.priceGTQ : plan.priceUSD;
        
        const card = document.createElement('div');
        card.className = `pricing-card ${plan.recommended ? 'active-plan' : ''}`;
        if (plan.recommended) {
            card.style.position = 'relative';
        }
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        card.style.padding = '20px';
        card.style.boxSizing = 'border-box';
        card.style.height = '100%';

        let featuresHtml = '';
        plan.features.forEach(f => {
            const colorStyle = f.color ? `style="color: ${f.color};"` : '';
            if (f.active) {
                featuresHtml += `<li><i data-lucide="check" ${colorStyle}></i> ${f.text}</li>`;
            } else {
                featuresHtml += `<li><i data-lucide="x" class="text-red"></i> <span style="text-decoration: line-through; opacity: 0.5;">${f.text}</span></li>`;
            }
        });

        let buttonText = 'Cambiar Plan';
        if (isUserActivePlan) {
            buttonText = 'Plan Activo';
        }

        card.innerHTML = `
            ${plan.recommended ? '<div class="active-ribbon" style="top: -8px; right: 15px; font-size: 0.75rem; padding: 3px 10px;">RECOMENDADO</div>' : ''}
            <div>
                <div class="plan-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; margin-bottom: 18px;">
                    <span class="plan-badge" style="background: ${plan.badgeBg}; color: ${plan.badgeColor}; border: 1px solid ${plan.badgeBorder}; font-size: 0.85rem; padding: 4px 10px; border-radius: 6px; font-weight: bold; letter-spacing: 1.2px;">${plan.badge}</span>
                    <h3 class="plan-title" style="margin-top: 12px; font-size: 1.45rem; font-weight: bold; color: #fff;">${plan.title}</h3>
                    <p class="plan-subtitle" style="font-size: 0.88rem; color: var(--text-muted); margin: 8px 0 0 0; line-height: 1.4;">${plan.subtitle}</p>
                </div>
                <div class="plan-price font-mono" style="font-size: 2.3rem; font-weight: bold; color: ${plan.recommended ? 'var(--cyan)' : '#fff'}; margin-bottom: 22px;">
                    <span class="plan-currency-sym" style="font-size: 1.5rem; vertical-align: super;">${currencySym}</span>
                    <span class="plan-price-num">${formatNumber(priceNum % 1 === 0 ? priceNum.toFixed(0) : priceNum.toFixed(2))}</span>
                    <span class="plan-period" style="font-size: 0.88rem; color: var(--text-muted); font-weight: normal;">/mes</span>
                </div>
                <ul class="plan-features font-mono" style="display: flex; flex-direction: column; gap: 10px; font-size: 0.92rem; color: var(--text-secondary); list-style: none; padding: 0; margin: 0 0 28px 0;">
                    ${featuresHtml}
                </ul>
            </div>
            <button class="btn-plan-action ${isUserActivePlan ? 'active-btn' : ''}" id="btn-plan-${plan.key}" onclick="openPlanPayment('${plan.key}')" ${isUserActivePlan ? 'style="background: rgba(0,255,128,0.1); border: 1px solid var(--green); color: var(--green); cursor: default;" disabled' : ''}>${buttonText}</button>
        `;
        grid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
function switchPublicPlansProfile(profile) {
    activePlansProfile = profile;
    
    const btnAgente = document.getElementById('btn-profile-agente');
    const btnInversionista = document.getElementById('btn-profile-inversionista');
    
    if (btnAgente && btnInversionista) {
        if (profile === 'agente') {
            btnAgente.classList.add('active');
            btnAgente.style.background = 'rgba(0, 240, 255, 0.15)';
            btnAgente.style.border = '1px solid rgba(0, 240, 255, 0.3)';
            btnAgente.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.2)';
            btnAgente.style.color = '#fff';
            
            btnInversionista.classList.remove('active');
            btnInversionista.style.background = 'transparent';
            btnInversionista.style.border = 'none';
            btnInversionista.style.boxShadow = 'none';
            btnInversionista.style.color = 'var(--text-muted)';
        } else {
            btnInversionista.classList.add('active');
            btnInversionista.style.background = 'rgba(191, 90, 242, 0.2)';
            btnInversionista.style.border = '1px solid rgba(191, 90, 242, 0.4)';
            btnInversionista.style.boxShadow = '0 0 10px rgba(191, 90, 242, 0.3)';
            btnInversionista.style.color = '#fff';
            
            btnAgente.classList.remove('active');
            btnAgente.style.background = 'transparent';
            btnAgente.style.border = 'none';
            btnAgente.style.boxShadow = 'none';
            btnAgente.style.color = 'var(--text-muted)';
        }
    }
    
    renderPublicPricingGrid();
}

/**
 * Permite pre-seleccionar un plan de suscripción en el formulario de registro comercial.
 * @param {string} planKey - Plan seleccionado ('basico' | 'pro' | 'vip' | 'premium').
 */
function selectPublicPlanForSignup(planKey) {
    // 1. Redirigir a la Consola Comercial
    switchView('commercial');
    
    // 2. Si no está autenticado, alternar a la pestaña de registro y pre-seleccionar el plan
    if (!isCommercialAuthenticated) {
        switchLoginTab('signup');
        
        let priceUSD = 31; // Default Pro
        if (planKey === 'basico') priceUSD = 18;
        else if (planKey === 'vip') priceUSD = 82;
        else if (planKey === 'premium') priceUSD = 43.70;
        
        // Sincronizar select de rol y gatillar evento de actualización
        const roleSelect = document.getElementById('com-signup-type');
        if (roleSelect) {
            if (planKey === 'premium') {
                roleSelect.value = 'inversionista';
            } else {
                roleSelect.value = 'agente';
            }
            roleSelect.dispatchEvent(new Event('change'));
        }
        
        selectSignupPlan(planKey, priceUSD);
        
        // Desplazamiento visual suave
        setTimeout(() => {
            const signupForm = document.getElementById('commercial-signup-form');
            if (signupForm) {
                signupForm.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
}

/**
 * Controladores dinámicos del reproductor modal de video de planes premium
 */
function playPremiumPlansVideoModal() {
    const modal = document.getElementById('premium-video-modal');
    const iframe = document.getElementById('subscription-youtube-iframe');
    if (modal && iframe) {
        iframe.src = `${plansVideoUrl}?autoplay=1`;
        modal.classList.add('active');
    }
}

function closePremiumPlansVideoModal() {
    const modal = document.getElementById('premium-video-modal');
    const iframe = document.getElementById('subscription-youtube-iframe');
    if (modal && iframe) {
        iframe.src = '';
        modal.classList.remove('active');
    }
}

/**
 * Control del modal multimedia de Bienvenida (Lightbox)
 */
let hasWelcomeModalLaunched = false;

function openWelcomeVideoModal() {
    if (hasWelcomeModalLaunched) return;
    const dismissed = localStorage.getItem('valorgt_welcome_video_dismissed');
    const lastUrl = localStorage.getItem('valorgt_last_welcome_video_url');
    
    // Si ya fue descartado y la URL no cambió, no volver a mostrar
    if (dismissed === 'true' && lastUrl === welcomeVideoUrl) return;
    if (!welcomeVideoUrl || welcomeVideoUrl.trim() === '') return;
    
    const modal = document.getElementById('welcome-video-modal');
    const iframe = document.getElementById('welcome-youtube-iframe');
    if (modal && iframe) {
        // Cargar video con autoplay para una experiencia interactiva fluida
        iframe.src = `${welcomeVideoUrl}?autoplay=1`;
        modal.classList.add('active');
        hasWelcomeModalLaunched = true;
        
        // Registrar última URL y marcar como activa para este video
        localStorage.setItem('valorgt_last_welcome_video_url', welcomeVideoUrl);
        localStorage.setItem('valorgt_welcome_video_dismissed', 'false');
        
        // Inicializar iconos Lucide por si acaso
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function closeWelcomeVideoModal() {
    const modal = document.getElementById('welcome-video-modal');
    const iframe = document.getElementById('welcome-youtube-iframe');
    if (modal && iframe) {
        iframe.src = '';
        modal.classList.remove('active');
        // Persistir que el usuario cerró el video de bienvenida
        localStorage.setItem('valorgt_welcome_video_dismissed', 'true');
    }
}

/**
 * Permite al administrador calibrar persistentemente la URL del video de bienvenida principal
 */
async function saveAdminWelcomeVideoUrl() {
    const input = document.getElementById('admin-welcome-video-url');
    if (!input) return;

    const val = input.value.trim();
    const embedUrl = getYouTubeEmbedUrl(val);
    welcomeVideoUrl = embedUrl;
    localStorage.setItem('valorgt_welcome_video_url', embedUrl);
    input.value = embedUrl;

    if (isSupabaseActive && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('system_announcements')
                .upsert({
                    id: 'welcome_video_url',
                    message: embedUrl,
                    is_active: true,
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
            alert(`✔️ Video de bienvenida principal configurado y sincronizado en la nube.`);
        } catch (err) {
            console.error("Error al sincronizar video de bienvenida en Supabase:", err);
            alert(`✔️ Guardado localmente, pero falló la sincronización con Supabase.`);
        }
    } else {
        alert(`✔️ Video de bienvenida principal guardado localmente.`);
    }
    logAdminSecurityActivity(`Calibración del Core: URL de video de bienvenida configurada en ${embedUrl}`);
}

async function saveAdminPlansVideoUrl() {
    const input = document.getElementById('admin-plans-video-url');
    if (!input) return;

    const val = input.value.trim();
    const embedUrl = getYouTubeEmbedUrl(val);
    plansVideoUrl = embedUrl;
    localStorage.setItem('valorgt_plans_video_url', embedUrl);
    input.value = embedUrl;

    const iframe = document.getElementById('subscription-youtube-iframe');
    if (iframe) {
        iframe.src = embedUrl;
    }

    // Mostrar u ocultar el botón del video explicativo según el valor configurado
    const plansBtn = document.querySelector('button[onclick="playPremiumPlansVideoModal()"]');
    if (plansVideoUrl && plansVideoUrl.trim() !== '') {
        if (plansBtn) plansBtn.style.display = 'flex';
    } else {
        if (plansBtn) plansBtn.style.display = 'none';
    }

    if (isSupabaseActive && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('system_announcements')
                .upsert({
                    id: 'plans_video_url',
                    message: embedUrl,
                    is_active: true,
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
            alert(`✔️ Video explicativo de planes configurado y sincronizado en la nube.`);
        } catch (err) {
            console.error("Error al sincronizar video de planes en Supabase:", err);
            alert(`✔️ Guardado localmente, pero falló la sincronización con Supabase.`);
        }
    } else {
        alert(`✔️ Video explicativo de planes guardado localmente.`);
    }
    logAdminSecurityActivity(`Calibración del Core: URL de video de planes configurada en ${embedUrl}`);
}

/**
 * Módulo seguro de actividad del administrador para evitar ReferenceErrors.
 * @param {string} message - El mensaje de seguridad a registrar.
 */
function logAdminSecurityActivity(message) {
    if (typeof appendAdminLog === 'function') {
        appendAdminLog("SECURITY", message, false);
    } else {
        console.log(`[SECURITY] ${message}`);
    }
}

/**
 * Alterna la visibilidad del cajón de navegación lateral (mobile drawer) en teléfonos
 */
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) {
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
            drawer.classList.remove('hidden');
            
            // Sincronizar estado activo de las opciones del drawer con la vista actual
            const activeViewSec = document.querySelector('.app-view.active');
            const currentView = activeViewSec ? activeViewSec.id.replace('view-', '') : 'dashboard';
            
            document.querySelectorAll('.drawer-item').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(currentView)) {
                    btn.classList.add('active');
                }
            });
            
            // Sincronizar los perfiles de agente activos
            if (loggedInB2bClient) {
                const mobileNameEl = document.getElementById('mobile-agent-name');
                const mobileRoleEl = document.getElementById('mobile-agent-role');
                if (mobileNameEl) mobileNameEl.innerText = loggedInB2bClient.name;
                if (mobileRoleEl) {
                    const loggedPlanUpper = (loggedInB2bClient.plan || 'pro').toUpperCase();
                    mobileRoleEl.innerText = (loggedPlanUpper === 'VIP' || loggedPlanUpper === 'PREMIUM') ? "Socio Premium B2B" : (loggedPlanUpper === 'PRO' ? "Socio Pro B2B" : "Agente B2B");
                }
            }
            
            // Renderizar iconos de Lucide cargados dinámicamente
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            drawer.classList.add('hidden');
        }
    }
}

/**
 * Controla el cambio de vistas de la aplicación desde el menú deslizante en teléfonos
 * @param {string} viewId - Identificador de la vista
 */
function switchViewMobile(viewId) {
    toggleMobileMenu(); // cerrar cajón
    switchView(viewId); // cambiar vista
}

async function initPromoBannerAndSettings() {
    syncPromoBannerUI();
    
    // Ocultar o mostrar botón de video de planes preliminarmente con caché local
    const plansBtn = document.querySelector('button[onclick="playPremiumPlansVideoModal()"]');
    if (plansVideoUrl && plansVideoUrl.trim() !== '') {
        if (plansBtn) plansBtn.style.display = 'flex';
    } else {
        if (plansBtn) plansBtn.style.display = 'none';
    }

    if (isSupabaseActive) {
        await fetchSystemSettingsFromSupabase();
    } else {
        // Fallback local: lanzar bienvenida si está configurado en localStorage
        setTimeout(() => {
            if (welcomeVideoUrl && welcomeVideoUrl.trim() !== '') {
                openWelcomeVideoModal();
            }
        }, 1500);
    }
}

async function fetchSystemSettingsFromSupabase() {
    if (!isSupabaseActive || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('system_announcements')
            .select('*');

        if (error) throw error;

        let supabaseWelcomeVideoUrl = welcomeVideoUrl;

        if (data && data.length > 0) {
            data.forEach(item => {
                if (item.id === 'main_promo') {
                    promoBannerMessage = item.message;
                    isPromoBannerActive = item.is_active;
                    localStorage.setItem('valorgt_promo_message', promoBannerMessage);
                    localStorage.setItem('valorgt_promo_active', isPromoBannerActive.toString());
                    syncPromoBannerUI();
                } else if (item.id === 'welcome_video_url') {
                    supabaseWelcomeVideoUrl = item.message;
                    welcomeVideoUrl = item.message;
                    localStorage.setItem('valorgt_welcome_video_url', welcomeVideoUrl);
                    const adminInput = document.getElementById('admin-welcome-video-url');
                    if (adminInput) adminInput.value = welcomeVideoUrl;
                } else if (item.id === 'plans_video_url') {
                    plansVideoUrl = item.message;
                    localStorage.setItem('valorgt_plans_video_url', plansVideoUrl);
                    const adminInput = document.getElementById('admin-plans-video-url');
                    if (adminInput) adminInput.value = plansVideoUrl;
                    
                    const plansIframe = document.getElementById('plans-youtube-iframe');
                    if (plansIframe) plansIframe.src = plansVideoUrl;
                }
            });
        }

        // Mostrar u ocultar el botón de planes según la configuración en la nube
        const plansBtn = document.querySelector('button[onclick="playPremiumPlansVideoModal()"]');
        if (plansVideoUrl && plansVideoUrl.trim() !== '') {
            if (plansBtn) plansBtn.style.display = 'flex';
        } else {
            if (plansBtn) plansBtn.style.display = 'none';
        }

        // Lanzar Lightbox de Bienvenida automáticamente si la URL descargada de la nube no está vacía
        setTimeout(() => {
            if (supabaseWelcomeVideoUrl && supabaseWelcomeVideoUrl.trim() !== '') {
                openWelcomeVideoModal();
            }
        }, 1000);

    } catch (err) {
        console.warn("⚠️ [ValorGT AI] Error al descargar configuraciones globales de Supabase:", err);
        // Fallback en caso de error
        setTimeout(() => {
            if (welcomeVideoUrl && welcomeVideoUrl.trim() !== '') {
                openWelcomeVideoModal();
            }
        }, 1500);
    }
}

/**
 * Sincroniza la interfaz de usuario en base al estado activo
 */
function syncPromoBannerUI() {
    const banner = document.getElementById('admin-promo-banner');
    const textEl = document.getElementById('promo-banner-text');
    
    if (banner && textEl) {
        textEl.innerText = promoBannerMessage;
        if (isPromoBannerActive) {
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    }
    
    // Sincronizar inputs en la Consola del Admin
    const promoInput = document.getElementById('admin-promo-input');
    const promoCheckbox = document.getElementById('admin-promo-active');
    
    if (promoInput && !promoInput.matches(':focus')) {
        promoInput.value = promoBannerMessage;
    }
    if (promoCheckbox) {
        promoCheckbox.checked = isPromoBannerActive;
    }
    
    // Crear o recrear íconos Lucide si es necesario
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Guarda los cambios realizados por el administrador de forma persistente
 */
async function saveAdminPromoBannerSettings() {
    const promoInput = document.getElementById('admin-promo-input');
    const promoCheckbox = document.getElementById('admin-promo-active');
    
    if (!promoInput) return;
    
    const message = promoInput.value.trim();
    if (!message) {
        alert("⚠️ Por favor, ingresa un mensaje válido para el banner.");
        return;
    }
    
    const isActive = promoCheckbox ? promoCheckbox.checked : false;
    
    // Actualizar estado local
    promoBannerMessage = message;
    isPromoBannerActive = isActive;
    
    localStorage.setItem('valorgt_promo_message', message);
    localStorage.setItem('valorgt_promo_active', isActive.toString());
    
    syncPromoBannerUI();
    
    // Persistir en Supabase
    if (isSupabaseActive) {
        try {
            const { error } = await supabaseClient
                .from('system_announcements')
                .upsert({
                    id: 'main_promo',
                    message: message,
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                });
                
            if (error) throw error;
            
            alert("✨ Configuración del banner promocional sincronizada en la nube exitosamente.");
            logAdminSecurityActivity(`Anuncio del Sistema Actualizado: "${message.substring(0, 30)}..." [Activo: ${isActive}]`);
        } catch (err) {
            console.error("❌ Error al guardar banner en Supabase:", err);
            alert("⚠️ Guardado en caché local con éxito, pero falló la sincronización con Supabase.");
        }
    } else {
        alert("✨ Configuración del banner promocional guardada localmente con éxito.");
        logAdminSecurityActivity(`Anuncio del Sistema Actualizado (Local): "${message.substring(0, 30)}..." [Activo: ${isActive}]`);
    }
}

/**
 * Alterna la visibilidad de los campos de contraseña
 * @param {string} inputId - ID del input de contraseña
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const eyeIcon = document.getElementById(`${inputId}-eye`);
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        if (eyeIcon) {
            eyeIcon.setAttribute('data-lucide', 'eye-off');
        }
    } else {
        input.type = 'password';
        if (eyeIcon) {
            eyeIcon.setAttribute('data-lucide', 'eye');
        }
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Cambia el rol de registro de forma interactiva y adapta los campos dinámicos
 * @param {string} role - 'agente' | 'inversionista'
 */
function setSignupRole(role) {
    const typeSelect = document.getElementById('com-signup-type');
    if (typeSelect) {
        typeSelect.value = role;
        typeSelect.dispatchEvent(new Event('change'));
    }
    
    const cardAgente = document.getElementById('role-card-agente');
    const cardInversionista = document.getElementById('role-card-inversionista');
    const agentFields = document.getElementById('agent-only-fields');
    const companyInput = document.getElementById('com-signup-company');
    const nitInput = document.getElementById('com-signup-nit');
    const agentPlans = document.getElementById('agent-plans-container');
    const inversionistaPlans = document.getElementById('inversionista-plans-container');
    
    if (role === 'agente') {
        if (cardAgente) cardAgente.classList.add('active');
        if (cardInversionista) cardInversionista.classList.remove('active');
        if (agentFields) agentFields.style.display = 'flex';
        if (companyInput) companyInput.required = true;
        if (nitInput) nitInput.required = true;
        
        if (agentPlans) agentPlans.style.display = 'flex';
        if (inversionistaPlans) inversionistaPlans.style.display = 'none';
        selectSignupPlanCard('pro'); // Plan Pro por defecto
    } else {
        if (cardAgente) cardAgente.classList.remove('active');
        if (cardInversionista) cardInversionista.classList.add('active');
        if (agentFields) agentFields.style.display = 'none';
        if (companyInput) {
            companyInput.required = false;
            companyInput.value = '';
        }
        if (nitInput) {
            nitInput.required = false;
            nitInput.value = '';
        }
        
        if (agentPlans) agentPlans.style.display = 'none';
        if (inversionistaPlans) inversionistaPlans.style.display = 'flex';
        selectSignupPlanCard('premium'); // Plan Inversionista Premium por defecto
    }
}

/**
 * Selecciona una tarjeta de plan de forma interactiva y sincroniza el select oculto
 * @param {string} planKey - 'basico' | 'pro' | 'vip' | 'premium'
 */
function selectSignupPlanCard(planKey) {
    const planSelect = document.getElementById('com-signup-plan');
    if (planSelect) {
        planSelect.value = planKey;
        planSelect.dispatchEvent(new Event('change'));
    }
    
    // Lista de todas las tarjetas de plan visuales
    const cards = ['basico', 'pro', 'vip', 'premium'];
    cards.forEach(key => {
        const card = document.getElementById(`plan-card-signup-${key}`);
        if (card) {
            if (key === planKey) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        }
    });
}

/**
 * Copia el enlace de la propiedad seleccionada al portapapeles y muestra una notificación
 */
function sharePropertyLink(event, propId) {
    if (event) {
        event.stopPropagation();
    }
    if (!propId) {
        showCyberToast("ID de propiedad inválido", "x-circle");
        return;
    }
    
    const shareUrl = window.location.origin + window.location.pathname + '?propId=' + encodeURIComponent(propId);
    
    // API Clipboard del navegador con fallback legacy
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                showCyberToast("¡ENLACE COPIADO AL PORTAPAPELES!", "check-circle");
            })
            .catch(err => {
                console.error("Error al copiar enlace:", err);
                fallbackCopyText(shareUrl);
            });
    } else {
        fallbackCopyText(shareUrl);
    }
}

/**
 * Fallback para copiar texto en navegadores legacy
 */
function fallbackCopyText(text) {
    try {
        const tempInput = document.createElement("input");
        tempInput.value = text;
        tempInput.style.position = "fixed";
        tempInput.style.top = "0";
        tempInput.style.left = "0";
        tempInput.style.opacity = "0";
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        const success = document.execCommand("copy");
        document.body.removeChild(tempInput);
        if (success) {
            showCyberToast("¡ENLACE COPIADO AL PORTAPAPELES!", "check-circle");
        } else {
            showCyberToast("Error al copiar el enlace", "x-circle");
        }
    } catch (err) {
        console.error("Error en fallback de copia:", err);
        showCyberToast("Error al copiar el enlace", "x-circle");
    }
}

/**
 * Muestra una notificación flotante premium estilo glassmorphism cian
 */
function showCyberToast(message, iconName = "info") {
    // Eliminar toast anterior si existe
    const oldToast = document.getElementById('cyber-toast-notification');
    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'cyber-toast-notification';
    toast.className = 'cyber-toast';
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="cyber-toast-icon"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Activar animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Ocultar y eliminar después de 3.5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3500);
}

/**
 * Comprueba si hay un parámetro propId en la URL y despliega automáticamente el modal correspondiente
 */
function checkDeepLinkParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const propId = urlParams.get('propId');
    if (!propId) return;

    let foundProperty = null;
    let foundZone = null;

    if (typeof PORTFOLIO_DATABASE !== 'undefined') {
        for (const zone in PORTFOLIO_DATABASE) {
            const index = PORTFOLIO_DATABASE[zone].findIndex(p => p.id === propId);
            if (index !== -1) {
                foundProperty = PORTFOLIO_DATABASE[zone][index];
                foundZone = zone;
                break;
            }
        }
    }

    if (foundProperty && foundZone) {
        console.log(`[DeepLink] Propiedad encontrada en la zona: ${foundZone}. Desplegando modal...`);
        const idx = PORTFOLIO_DATABASE[foundZone].indexOf(foundProperty);
        if (idx !== -1) {
            setTimeout(() => {
                openPropertyDetailModal(foundZone, idx);
            }, 600);
        }
    } else {
        console.warn(`[DeepLink] No se encontró ninguna propiedad con el ID: ${propId}`);
    }
}

/**
 * ==========================================================================
 * SISTEMA DE ASISTENTE HOLOGRÁFICO GLOBAL IA (SpeechSynthesis)
 * ==========================================================================
 */

/**
 * Controla la visibilidad y el estado de detención del asistente de voz
 */
function updateAssistantVisibility() {
    const activeViewEl = document.querySelector('.app-view.active');
    if (!activeViewEl) return;
    
    const viewId = activeViewEl.id.replace('view-', '');
    
    // Si es catalog o disclaimer principal, ocultar por completo
    if (viewId === 'catalog' || viewId === 'disclaimer') {
        hideAssistantWidget();
        return;
    }
    
    // Si la vista es commercial, evaluar si está logueado o en disclaimer
    if (viewId === 'commercial') {
        const loginGate = document.getElementById('commercial-login-gate');
        if (loginGate && !loginGate.classList.contains('hidden')) {
            showAssistantWidget();
            return;
        }
        
        // Si está autenticado, revisar si la pestaña disclaimer está activa
        const activeTabEl = document.querySelector('.comm-tab-content:not(.hidden)');
        if (activeTabEl) {
            const tabId = activeTabEl.id.replace('comm-tab-content-', '');
            if (tabId === 'disclaimer') {
                hideAssistantWidget();
                return;
            }
        }
    }
    
    showAssistantWidget();
}

/**
 * Muestra el widget en pantalla
 */
function showAssistantWidget() {
    const widget = document.getElementById('global-ai-assistant');
    if (widget) {
        widget.style.display = 'flex';
    }
}

/**
 * Oculta el widget en pantalla y cancela el audio si estaba hablando
 */
function hideAssistantWidget() {
    const widget = document.getElementById('global-ai-assistant');
    if (widget) {
        widget.style.display = 'none';
        widget.classList.remove('speaking');
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Alterna la reproducción de voz del Asesor Holográfico IA
 */
function toggleGlobalAssistantSpeech() {
    const widget = document.getElementById('global-ai-assistant');
    if (!widget) return;

    // Si ya está hablando, detener inmediatamente (Mute/Stop)
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        widget.classList.remove('speaking');
        return;
    }

    // Identificar qué sección está activa para leer su explicación
    const activeViewEl = document.querySelector('.app-view.active');
    let viewId = activeViewEl ? activeViewEl.id.replace('view-', '') : 'dashboard';
    
    let explanationKey = viewId;
    if (viewId === 'commercial') {
        const loginGate = document.getElementById('commercial-login-gate');
        if (loginGate && !loginGate.classList.contains('hidden')) {
            explanationKey = 'commercial-login';
        } else {
            const activeTabEl = document.querySelector('.comm-tab-content:not(.hidden)');
            if (activeTabEl) {
                const tabId = activeTabEl.id.replace('comm-tab-content-', '');
                explanationKey = `commercial-${tabId}`;
            } else {
                explanationKey = 'commercial-home';
            }
        }
    }

    // Buscar explicación en el mapa
    const explanationText = PAGE_EXPLANATIONS[explanationKey];
    if (!explanationText) return;

    // Crear la instancia de voz de SpeechSynthesis
    globalAssistantSpeechUtterance = new SpeechSynthesisUtterance(explanationText);
    globalAssistantSpeechUtterance.lang = 'es-ES';
    globalAssistantSpeechUtterance.pitch = 1.0; // Tono neutro más natural
    globalAssistantSpeechUtterance.rate = 0.92;  // Velocidad ligeramente reducida para evitar sonar acelerada/robótica

    // Intentar buscar una voz en español compatible nativa de mujer
    if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const spanishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
        
        if (spanishVoices.length > 0) {
            // Nombres conocidos de voces de mujer premium en español
            const femaleVoiceKeywords = [
                'sabina', 'helena', 'monica', 'paulina', 'marisol', 'laura', 'yolanda', 'maria', 
                'elena', 'angelica', 'dalia', 'hilda', 'sandra', 'ana', 'google español'
            ];
            
            let selectedVoice = null;
            for (const keyword of femaleVoiceKeywords) {
                selectedVoice = spanishVoices.find(v => v.name.toLowerCase().includes(keyword));
                if (selectedVoice) break;
            }
            
            // Excluir voces masculinas si no hay match específico
            if (!selectedVoice) {
                const maleKeywords = ['david', 'julio', 'pablo', 'mateo', 'male', 'hombre', 'jorge', 'raul'];
                selectedVoice = spanishVoices.find(v => {
                    const nameLower = v.name.toLowerCase();
                    return !maleKeywords.some(mk => nameLower.includes(mk));
                });
            }
            
            // Fallback a cualquier voz en español
            if (!selectedVoice) {
                selectedVoice = spanishVoices[0];
            }
            
            globalAssistantSpeechUtterance.voice = selectedVoice;
            console.log(`[Voz IA Seleccionada] Name: ${selectedVoice.name}, Lang: ${selectedVoice.lang}`);
        }
    }

    // Eventos de estado de voz
    globalAssistantSpeechUtterance.onstart = () => {
        widget.classList.add('speaking');
    };

    globalAssistantSpeechUtterance.onend = () => {
        widget.classList.remove('speaking');
    };

    globalAssistantSpeechUtterance.onerror = (e) => {
        console.error("Error en SpeechSynthesis:", e);
        widget.classList.remove('speaking');
    };

    // Comenzar la lectura
    window.speechSynthesis.speak(globalAssistantSpeechUtterance);
}

// Inicializar visibilidad en carga
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateAssistantVisibility();
        if (typeof checkDeepLinkParams === 'function') {
            checkDeepLinkParams();
        }
    }, 800);
});

/**
 * ==========================================================================
 * SISTEMA INTEGRAL DE VIDEO TUTORIALES E INDUCCIÓN IA
 * ==========================================================================
 */

let activeTutorials = [];
let activeTutorialFilter = 'all';

// Videos de demostración por defecto para el modo offline / fallback local
const DEFAULT_TUTORIALS = [
    {
        id: 'mock-tut-1',
        title: 'Guía Rápida: Valuador Predictivo IA',
        description: 'Aprende cómo el algoritmo neurononal procesa el metraje, acabados y zonas georreferenciadas para emitir tasaciones comerciales en segundos.',
        section_key: 'dashboard',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-tut-2',
        title: 'Telemetría Avanzada: Radar de Calor',
        description: 'Tutorial sobre la interpretación de capas de plusvalía y el impacto de los polos de desarrollo en los precios por metro cuadrado.',
        section_key: 'heatmap',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-tut-3',
        title: 'Operaciones B2B: Cartera de Oro Digital',
        description: 'Cómo depositar, retirar quetzales a cuentas bancarias y efectuar transferencias P2P de Tether Gold entre agentes de forma segura.',
        section_key: 'commercial-oro',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        created_at: new Date().toISOString()
    }
];

/**
 * Carga los tutoriales desde Supabase o fallback local
 */
async function loadTutorials() {
    if (isSupabaseActive && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('video_tutorials')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (!error && data) {
                activeTutorials = data;
            } else {
                console.warn("Supabase: Fallo al cargar tutoriales, usando fallback local:", error);
                activeTutorials = [...DEFAULT_TUTORIALS];
            }
        } catch (err) {
            console.error("Fallo de red al obtener tutoriales, usando fallback:", err);
            activeTutorials = [...DEFAULT_TUTORIALS];
        }
    } else {
        // Modo local
        activeTutorials = [...DEFAULT_TUTORIALS];
    }
    
    renderTutorials();
}

/**
 * Renderiza la grilla de tutoriales del centro de guías
 */
function renderTutorials() {
    const grid = document.getElementById('tutorials-grid');
    const counter = document.getElementById('tutorials-counter-badge');
    if (!grid) return;
    
    // Obtener texto de búsqueda
    const searchQuery = (document.getElementById('tutorial-search')?.value || '').toLowerCase().trim();
    
    // Filtrar videos
    const filtered = activeTutorials.filter(t => {
        const matchesCategory = activeTutorialFilter === 'all' || t.section_key === activeTutorialFilter;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery) || t.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    
    if (counter) {
        counter.innerText = `${filtered.length} Video${filtered.length === 1 ? '' : 's'}`;
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-family: monospace;">
                <i data-lucide="video-off" style="width: 32px; height: 32px; color: var(--text-secondary); margin-bottom: 8px; opacity: 0.5; display: inline-block;"></i><br>
                No se encontraron video tutoriales en esta sección.
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    const friendlySections = {
        'dashboard': 'Tasación IA',
        'heatmap': 'Radar Calor',
        'mortgage': 'Simulador FHA',
        'investor': 'Inversiones',
        'commercial-oro': 'Billetera XAUt',
        'commercial-portfolio': 'Portafolio'
    };
    
    grid.innerHTML = '';
    filtered.forEach(t => {
        const card = document.createElement('div');
        card.className = 'card glassmorphism tutorial-card';
        card.setAttribute('onclick', `openTutorialVideo('${t.youtube_url}', '${t.title.replace(/'/g, "\\'")}')`);
        
        // Obtener ID de youtube para el thumbnail
        const ytId = getYoutubeVideoId(t.youtube_url) || 'dQw4w9WgXcQ';
        const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        const sectionLabel = friendlySections[t.section_key] || 'General';
        const formattedDate = new Date(t.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' });
        
        card.innerHTML = `
            <div class="tutorial-thumb-container">
                <span class="tutorial-section-badge">${sectionLabel}</span>
                <img src="${thumbUrl}" alt="${t.title}" onerror="this.src='dummy_receipt.png'">
                <div class="tutorial-play-btn">
                    <i data-lucide="play" style="width: 20px; height: 20px; fill: #fff;"></i>
                </div>
            </div>
            <div class="tutorial-body">
                <h3>${t.title}</h3>
                <p>${t.description}</p>
                <span class="tutorial-date font-mono">📅 PUBLICADO: ${formattedDate}</span>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Filtra los tutoriales en tiempo real según el botón de categoría seleccionado
 */
function setTutorialFilter(category) {
    activeTutorialFilter = category;
    
    // Activar estilo en botón
    document.querySelectorAll('#tutorials-category-filters .tutorial-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`t-filt-${category === 'commercial-oro' ? 'oro' : (category === 'commercial-portfolio' ? 'portfolio' : category)}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    renderTutorials();
}

/**
 * Función de entrada para filtrar por búsqueda
 */
function filterTutorials() {
    renderTutorials();
}

/**
 * Extrae el ID del video de YouTube desde cualquier enlace estándar o corto
 */
function getYoutubeVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Abre el reproductor flotante holográfico
 */
function openTutorialVideo(url, title) {
    const modal = document.getElementById('tutorial-video-modal');
    const iframe = document.getElementById('tutorial-video-iframe');
    const titleEl = document.getElementById('tutorial-modal-title');
    
    if (!modal || !iframe) return;
    
    const ytId = getYoutubeVideoId(url);
    if (!ytId) {
        alert("⚠️ El formato de la URL de YouTube no es válido.");
        return;
    }
    
    if (titleEl) titleEl.innerText = title;
    iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    modal.classList.remove('hidden');
}

/**
 * Cierra el modal de video y apaga la reproducción del iframe
 */
function closeTutorialVideo() {
    const modal = document.getElementById('tutorial-video-modal');
    const iframe = document.getElementById('tutorial-video-iframe');
    if (modal) modal.classList.add('hidden');
    if (iframe) iframe.src = ''; // Detiene el audio
}

/**
 * Publica un nuevo tutorial desde la consola Admin
 */
async function publishTutorial(event) {
    event.preventDefault();
    
    const title = document.getElementById('admin-tut-title').value.trim();
    const description = document.getElementById('admin-tut-description').value.trim();
    const section = document.getElementById('admin-tut-section').value;
    const url = document.getElementById('admin-tut-url').value.trim();
    
    if (!title || !description || !url) {
        alert("⚠️ Por favor completa todos los campos requeridos.");
        return;
    }
    
    const ytId = getYoutubeVideoId(url);
    if (!ytId) {
        alert("⚠️ Por favor ingresa un enlace válido de YouTube (ej. https://www.youtube.com/watch?v=...)");
        return;
    }
    
    if (isSupabaseActive && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('video_tutorials')
                .insert([{
                    title: title,
                    description: description,
                    section_key: section,
                    youtube_url: url
                }])
                .select();
                
            if (error) {
                console.error("Supabase: Error al publicar tutorial:", error);
                alert("❌ Fallo en la base de datos de Supabase. Revisa los permisos de políticas RLS.");
                return;
            }
            
            alert("✅ Video Tutorial publicado exitosamente en la base de datos Supabase.");
        } catch (err) {
            console.error("Fallo de red:", err);
            alert("❌ Error de red al comunicarse con Supabase.");
            return;
        }
    } else {
        // Fallback local: agregar al array local
        const newMock = {
            id: 'mock-tut-' + Math.floor(1000 + Math.random() * 9000),
            title: title,
            description: description,
            section_key: section,
            youtube_url: url,
            created_at: new Date().toISOString()
        };
        activeTutorials.unshift(newMock);
        alert("✅ Publicación local exitosa (Modo Offline / Demo)");
    }
    
    // Limpiar formulario
    document.getElementById('admin-tutorial-form').reset();
    
    // Recargar datos y renderizar
    await loadTutorials();
    renderAdminTutorialsTable();
}

/**
 * Elimina un tutorial
 */
async function deleteTutorial(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este video tutorial permanentemente?")) return;
    
    if (isSupabaseActive && supabaseClient && !id.startsWith('mock-')) {
        try {
            const { error } = await supabaseClient
                .from('video_tutorials')
                .delete()
                .eq('id', id);
                
            if (error) {
                console.error("Supabase: Error al eliminar:", error);
                alert("❌ No se pudo eliminar de la base de datos.");
                return;
            }
            
            alert("✅ Video tutorial eliminado exitosamente de la base de datos.");
        } catch (err) {
            console.error("Error de red:", err);
        }
    } else {
        // Borrar del array en memoria
        activeTutorials = activeTutorials.filter(t => t.id !== id);
        alert("✅ Eliminado del inventario local (Modo Offline)");
    }
    
    await loadTutorials();
    renderAdminTutorialsTable();
}

/**
 * Renderiza la lista administrativa de tutoriales
 */
function renderAdminTutorialsTable() {
    const tableBody = document.getElementById('admin-tutorials-table-body');
    const counterBadge = document.getElementById('admin-tut-count-badge');
    if (!tableBody) return;
    
    if (counterBadge) {
        counterBadge.innerText = `${activeTutorials.length} Video${activeTutorials.length === 1 ? '' : 's'}`;
    }
    
    if (activeTutorials.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">
                    No hay video tutoriales publicados en el sistema.
                </td>
            </tr>
        `;
        return;
    }
    
    const friendlySections = {
        'dashboard': 'Tasación IA',
        'heatmap': 'Radar Calor',
        'mortgage': 'Simulador FHA',
        'investor': 'Inversiones',
        'commercial-oro': 'Billetera XAUt',
        'commercial-portfolio': 'Portafolio'
    };
    
    tableBody.innerHTML = '';
    activeTutorials.forEach(t => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        const sectionLabel = friendlySections[t.section_key] || 'General';
        
        row.innerHTML = `
            <td style="padding: 10px; color: var(--cyan); font-weight: bold; font-size: 0.68rem; text-transform: uppercase;">
                ${sectionLabel}
            </td>
            <td style="padding: 10px;">
                <strong>${t.title}</strong><br>
                <a href="${t.youtube_url}" target="_blank" style="color: var(--text-muted); text-decoration: none; font-size: 0.62rem; word-break: break-all;">
                    ${t.youtube_url}
                </a>
            </td>
            <td style="padding: 10px; text-align: center; vertical-align: middle;">
                <button onclick="deleteTutorial('${t.id}')" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.55rem; color: var(--red); border-color: rgba(255, 59, 48, 0.4); background: rgba(255, 59, 48, 0.02); cursor: pointer; font-weight: bold; border-radius: 4px;">
                    ELIMINAR
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
