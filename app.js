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
let activeB2bPlan = 'pro'; // 'basico' | 'pro' | 'vip'
let isCommercialAuthenticated = false;
let loggedInB2bClient = null;
let saasBillingAmountUSD = 149; // Inicializado con el cobro mensual del plan Pro por defecto
let saasImpressionsCount = 12450;
let saasClientClicks = 320;
let b2bClients = [
    { name: 'Ana Estévez', company: 'Estévez Inmobiliaria', nit: '4593021-3', phone: '5012-9482', email: 'ana@estevezinmobiliaria.com', plan: 'VIP', status: 'Activo', password: 'valorgt', usdtBalance: 250, role: 'agente' },
    { name: 'Roberto Valenzuela', company: 'Inversiones R.V.', nit: '8294012-8', phone: '4002-8593', email: 'roberto@inversionesrv.com', plan: 'Pro', status: 'Activo', password: 'valorgt', usdtBalance: 100, role: 'inversionista' },
    { name: 'Sofía Rodas', company: 'Bienes Raíces Alianza', nit: '3940294-2', phone: '3948-2049', email: 'sofia@alianzagt.com', plan: 'Básico', status: 'Activo', password: 'valorgt', usdtBalance: 50, role: 'agente' }
];
let agentUploadedProperties = [];
let pendingPaymentType = null; // 'subscription' | 'ad'
let pendingPaymentTarget = null; // 'basico' | 'pro' | 'vip' o un objeto { propertyId, zone }

// Variables de Control para la Vista Previa de Marketing del Portafolio IA (1 minuto)
let portfolioTrialTimer = null;
let portfolioTrialTimeLeft = 60; // 60 segundos
let isPortfolioBlocked = false;

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

    // Sincronizar datos de Supabase si está activo
    if (isSupabaseActive) {
        syncSupabaseData();
    }
});

/**
 * Controla el cambio de vistas de la aplicación (Single Page Routing)
 * @param {string} viewId - Nombre identificador de la vista ('dashboard', 'heatmap', 'mortgage', 'investor')
 */
function switchView(viewId) {
    // 1. Pausar y restablecer el timer del trial de marketing al cambiar de vista
    if (portfolioTrialTimer) {
        clearInterval(portfolioTrialTimer);
        portfolioTrialTimer = null;
    }
    const trialBadge = document.getElementById('portfolio-trial-badge');
    if (trialBadge) trialBadge.classList.add('hidden');

    // 2. Control del trial del Portafolio IA
    if (viewId === 'portfolio') {
        const hasUnlimitedAccess = isCommercialAuthenticated && loggedInB2bClient && (
            loggedInB2bClient.role === 'inversionista' || 
            (loggedInB2bClient.role === 'agente' && (activeB2bPlan === 'vip' || activeB2bPlan === 'pro'))
        );

        const blocker = document.getElementById('portfolio-trial-blocker');

        if (hasUnlimitedAccess) {
            // Ocultar cualquier bloqueador de demo
            if (blocker) blocker.classList.add('hidden');
            isPortfolioBlocked = false;
        } else {
            // Si no tiene acceso ilimitado, verificar si ya expiró el trial de 1 minuto
            if (isPortfolioBlocked || portfolioTrialTimeLeft <= 0) {
                if (blocker) blocker.classList.remove('hidden');
                isPortfolioBlocked = true;
                alert("⚠️ VISTA PREVIA EXPIRADA: Tu demostración gratuita del Portafolio IA ha finalizado. Por favor suscríbete para continuar.");
                switchView('commercial');
                return;
            } else {
                // Si aún tiene tiempo, mostrar badge y arrancar timer de cuenta regresiva
                if (blocker) blocker.classList.add('hidden');
                if (trialBadge) {
                    trialBadge.classList.remove('hidden');
                    const lbl = document.getElementById('portfolio-trial-timer-lbl');
                    if (lbl) lbl.innerText = `${portfolioTrialTimeLeft}s`;
                }

                portfolioTrialTimer = setInterval(() => {
                    portfolioTrialTimeLeft--;
                    const lbl = document.getElementById('portfolio-trial-timer-lbl');
                    if (lbl) lbl.innerText = `${portfolioTrialTimeLeft}s`;

                    if (portfolioTrialTimeLeft <= 0) {
                        clearInterval(portfolioTrialTimer);
                        portfolioTrialTimer = null;
                        isPortfolioBlocked = true;

                        const activeBlocker = document.getElementById('portfolio-trial-blocker');
                        if (activeBlocker) activeBlocker.classList.remove('hidden');
                        if (trialBadge) trialBadge.classList.add('hidden');

                        alert("⏱️ VISTA PREVIA EXPIRADA: Tu minuto de demostración gratuita del Portafolio IA ha finalizado. Por favor suscríbete para continuar.");
                        switchView('commercial');
                    }
                }, 1000);
            }
        }
    }

    // Quitar clase activa de todos los botones de navegación y agregar a la seleccionada
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-btn-${viewId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Ocultar todas las vistas y mostrar la seleccionada
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) activeView.classList.add('active');

    // Cambiar Título de la Cabecera Superior
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');

    if (viewId === 'dashboard') {
        titleEl.innerText = "Valuador Inmobiliario IA";
        subtitleEl.innerText = "Análisis predictivo de propiedades con redes neuronales";
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
    } else if (viewId === 'portfolio') {
        titleEl.innerText = "Terminal de Portafolio Patrimonial IA";
        subtitleEl.innerText = "Simulador avanzado de riqueza, apalancamiento y Libertad Financiera";
        setTimeout(() => {
            initPortfolioView();
        }, 50);
    } else if (viewId === 'commercial') {
        titleEl.innerText = "Consola de Gestión Comercial B2B";
        subtitleEl.innerText = "Registro de clientes, planes corporativos y pautas publicitarias de portada";
        setTimeout(() => {
            initCommercialView();
        }, 50);
    } else if (viewId === 'catalog') {
        titleEl.innerText = "Catálogo General de Activos";
        subtitleEl.innerText = "Buscador masivo y catálogo de propiedades en Ciudad de Guatemala";
        setTimeout(() => {
            renderCatalogProperties();
        }, 50);
    } else if (viewId === 'admin') {
        titleEl.innerText = "Consola Global Admin & Telemetría";
        subtitleEl.innerText = "Panel central de control y auditoría de la plataforma ValorGT AI";
        setTimeout(() => {
            initAdminView();
        }, 50);
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

    // Si estamos en la vista de portafolio, actualizar
    if (document.getElementById('view-portfolio').classList.contains('active')) {
        updatePortfolioCalculations();
    }

    // Si estamos en la vista comercial, actualizar
    if (document.getElementById('view-commercial') && document.getElementById('view-commercial').classList.contains('active')) {
        initCommercialView();
    }
}

/**
 * Actualiza los valores sugeridos (Metros, Habitaciones, etc.) según zona y tipo
 */
function updateSuggestedValues() {
    const locationSelect = document.getElementById('prop-location');
    const typeSelect = document.getElementById('prop-type');
    
    if (!locationSelect.value) return;

    // Actualizar el portafolio destacado
    renderFeaturedProperties(locationSelect.value);

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
        
        const cardHTML = `
            <div class="card glassmorphism featured-card glow-${zoneColor} ${sponsoredClass}" onclick="autofillValuationForm('${zoneKey}', ${absoluteIndex})">
                <div class="card-image-wrapper">
                    <img src="${prop.photo}" alt="${prop.title}">
                </div>
                <div class="card-info">
                    <span class="property-tag">${prop.tag}</span>
                    <h4>${prop.title}</h4>
                    <div class="property-location">
                        <i data-lucide="map-pin" class="tiny-icon"></i> ${zoneName}
                    </div>
                    <div class="property-specs">
                        <span><i data-lucide="maximize-2" class="tiny-icon"></i> ${prop.size} m²</span>
                        <span><i data-lucide="bed" class="tiny-icon"></i> ${prop.rooms} Hab</span>
                        <span><i data-lucide="bath" class="tiny-icon"></i> ${prop.bathrooms} Baños</span>
                        <span><i data-lucide="car" class="tiny-icon"></i> ${prop.parkings} Pq</span>
                    </div>
                    <div class="card-price-hud">
                        <span class="price-val" id="feat-price-${absoluteIndex}">${currencySym}${formatNumber(convertedPrice.toFixed(0))}${priceLabel}</span>
                        <button class="btn-micro-cyber">
                            <i data-lucide="sparkles" class="tiny-icon"></i> AUTOTASAR
                        </button>
                    </div>
                </div>
            </div>
        `;
        deck.insertAdjacentHTML('beforeend', cardHTML);
    });

    if (renderedCount === 0) {
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
    const properties = PORTFOLIO_DATABASE[zoneKey];
    if (!properties) {
        counter.innerText = "0 ACTIVOS ENCONTRADOS";
        return;
    }

    const zoneData = ZONES_DATABASE[zoneKey];
    const zoneName = zoneData.name.split(' (')[0];
    const zoneColor = zoneData.color; // 'red', 'orange', 'yellow', 'green', 'blue'
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
        
        // Find absolute index in original array to ensure autotasar works flawlessly
        const absoluteIndex = PORTFOLIO_DATABASE[zoneKey].indexOf(prop);
        const convertedPrice = prop.priceUSD * conversion;
        const isSponsored = prop.sponsored === true;
        const sponsoredClass = isSponsored ? 'sponsored' : '';
        const badgeColorClass = isSponsored ? 'green' : zoneColor;
        
        const priceLabel = type.toLowerCase() === 'renta' ? ' / Mes' : '';
        
        const cardHTML = `
            <div class="card glassmorphism featured-card glow-${zoneColor} ${sponsoredClass}" onclick="autofillValuationForm('${zoneKey}', ${absoluteIndex})">
                <div class="card-image-wrapper">
                    ${isSponsored ? '' : `<span class="card-status-badge ${badgeColorClass}">${prop.badge || 'DESTACADO'}</span>`}
                    <img src="${prop.photo}" alt="${prop.title}">
                </div>
                <div class="card-info">
                    <span class="property-tag">${prop.tag}</span>
                    <h4>${prop.title}</h4>
                    <div class="property-location">
                        <i data-lucide="map-pin" class="tiny-icon"></i> ${zoneName}
                    </div>
                    <div class="property-specs">
                        <span><i data-lucide="maximize-2" class="tiny-icon"></i> ${prop.size} m²</span>
                        <span><i data-lucide="bed" class="tiny-icon"></i> ${prop.rooms} Hab</span>
                        <span><i data-lucide="bath" class="tiny-icon"></i> ${prop.bathrooms} Baños</span>
                        <span><i data-lucide="car" class="tiny-icon"></i> ${prop.parkings} Pq</span>
                    </div>
                    <div class="card-price-hud">
                        <span class="price-val" id="cat-price-${absoluteIndex}">${currencySym}${formatNumber(convertedPrice.toFixed(0))}${priceLabel}</span>
                        <button class="btn-micro-cyber">
                            <i data-lucide="sparkles" class="tiny-icon"></i> AUTOTASAR
                        </button>
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
    const tagLower = prop.tag.toLowerCase();
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
    
    // 1. Regresión de tamaño
    let sizeRegression = Math.pow(120 / size, 0.11);
    
    // 2. Determinar precio m² base según acabados generales
    // standard (semi-lujo/medios): Q7,300, economy: Q5,500, luxury: Q9,000
    let baseFinishesPriceM2 = 938; // standard default (~$120/m² en dólares)
    if (finishes === 'luxury') baseFinishesPriceM2 = 1157; // Q9,000
    if (finishes === 'economy') baseFinishesPriceM2 = 707; // Q5,500
    
    let locationMultiplier = zoneData.basePriceM2 / 1100;
    let priceM2 = baseFinishesPriceM2 * locationMultiplier * sizeRegression;
    
    // Valor Base por Construcción
    let baseValue = size * priceM2;

    // 3. Valor Adicional por Terreno (Aporta un 18% del valor por m² del sector)
    let landAreaM2 = landUnit === 'v2' ? landArea * 0.6988 : landArea;
    let landValue = landAreaM2 * (priceM2 * 0.18);
    
    // Para Terrenos puros, el valor principal es el suelo y el tamaño de construcción es irrelevante
    if (type === 'terreno') {
        baseValue = landAreaM2 * (priceM2 * 0.85); // 85% del precio m² del sector
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
    const priceM2Val = (activeValuation / parseFloat(document.getElementById('prop-size').value)) * conversion;

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
    document.getElementById('val-price-m2').innerText = `${currencySym}${formatNumber(priceM2Val.toFixed(0))} / m²`;
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
        recText.innerHTML = `Sistemas de prevención reportan <strong>ALTO RIESGO</strong>. La cuota mensual estimada sobrepasa los márgenes de seguridad recomendados del 45% sobre ingresos promedio. <strong>Sugerencia de la IA:</strong> Busca una propiedad en una zona con precio por m² más competitivo (como Carretera a El Salvador) o incrementa el enganche para reducir el capital a financiar.`;
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
        const price = zone.basePriceM2 * conversion;
        const plusvalia = (zone.growth5Y / 5).toFixed(1);

        let recColor = 'text-green';
        let recLabel = 'COMPRAR';
        if (key === 'carretera') { recColor = 'text-red'; recLabel = 'VENDER'; }
        if (key === 'zona14' || key === 'zona10') { recColor = 'text-cyan'; recLabel = 'MANTENER'; }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="table-zone-name">${zone.name.split(' (')[0]}</span><br>
                <span class="sub-title font-mono" style="font-size:0.65rem; color:var(--text-muted)">ID: ${key.toUpperCase()}_NODE</span>
            </td>
            <td class="table-number">${currencySym}${formatNumber(price.toFixed(0))} / m²</td>
            <td class="table-number text-green">${zone.roi}%</td>
            <td class="table-number text-green">+${plusvalia}% / año</td>
            <td class="table-number text-cyan font-mono">${zone.liquidityIndex}</td>
            <td>
                <button class="btn btn-outline font-mono ${recColor}" style="padding:4px 8px; font-size:0.65rem; border:1px solid currentColor; background:transparent; cursor:pointer;" onclick="selectMapZone('${key}')">
                    ${recLabel} <i data-lucide="external-link" style="width:10px; height:10px; display:inline-block; vertical-align:middle;"></i>
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
function initNewsFeed() {
    const consoleEl = document.getElementById('news-console');
    if (!consoleEl) return;

    // Agregar primeras noticias por defecto
    appendNewsLog("SYSTEM", "CORE ACTIVE V4.12. Puerto de telemetría de Guatemala ONLINE.", false);
    appendNewsLog("ALERTA", "Fuerte tracción inmobiliaria detectada en Zona 4. Plusvalías superan proyecciones.", true);
    
    // Loop de noticias simulado cada 8 segundos
    let newsIdx = 0;
    setInterval(() => {
        const isAlert = Math.random() > 0.5;
        const tag = isAlert ? "MERCADO" : "INDICE";
        const msg = SIMULATED_NEWS[newsIdx];
        
        appendNewsLog(tag, msg, isAlert);
        
        newsIdx = (newsIdx + 1) % SIMULATED_NEWS.length;
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
function animateNumber(id, start, end, duration) {
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
        obj.innerText = formatNumber(current.toFixed(0));
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

// Base de datos de portafolio inicial (Guardada internamente en USD por defecto)
let userPortfolio = [
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
    
    // Sincronizar números de precios de planes
    ['basico', 'pro', 'vip'].forEach(plan => {
        const numEl = document.getElementById(`price-num-${plan}`);
        if (numEl) {
            numEl.innerText = activeCurrency === 'GTQ' 
                ? formatNumber(numEl.getAttribute('data-gtq')) 
                : formatNumber(numEl.getAttribute('data-usd'));
        }
    });

    // Sincronizar presupuesto de pauta de publicidad
    const promoBudget = document.getElementById('promo-budget');
    if (promoBudget) {
        promoBudget.value = activeCurrency === 'GTQ' ? 450 : 58;
    }
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
    const netCashflowUSD = totalRentUSD - totalPaymentsUSD - totalExpensesUSD;
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
        
        displayNetCashflowUSD = displayRentUSD - displayPaymentsUSD - displayExpensesUSD;
    }

    // Guardar en variables de caché global los valores que se están mostrando (actuales o proyectados)
    currentNetCashflowUSD = displayNetCashflowUSD;
    currentTotalEquityUSD = displayEquityUSD;

    // --- ANIMAR E INJECTAR NUMEROS EN KPI DISPLAY ---
    animateNumber('pkpi-total-value', 0, displayValueUSD * conversion, 600);
    animateNumber('pkpi-total-debt', 0, displayDebtUSD * conversion, 600);
    animateNumber('pkpi-total-equity', 0, displayEquityUSD * conversion, 600);
    
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
    // El círculo tiene r=50, lo que da una circunferencia de 314.16px
    const circle = document.getElementById('freedom-progress-ring-circle');
    if (circle) {
        const offset = 314.16 - (freedomPct / 100) * 314.16;
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

        // Círculo de Concentración Financiera (el radio depende del valor del activo)
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

        const marker = L.marker([asset.lat, asset.lng], { icon: beaconIcon }).addTo(portfolioMapInstance);
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
                marker.openPopup();
                portfolioMapInstance.setView([asset.lat, asset.lng], 13, { animate: true });
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
        loggedInB2bClient.role === 'inversionista' || 
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
        // Si no hay valuación activa, estimar un precio comercial base
        const sizeVal = parseFloat(document.getElementById('pub-size').value) || 180;
        const locVal = document.getElementById('pub-location').value;
        const zoneData = ZONES_DATABASE[locVal];
        if (zoneData) {
            const basePrice = zoneData.basePriceM2 * sizeVal;
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

    // 1. Renderizar mensaje del usuario
    const userMsgHtml = `
        <div class="opinion-item" style="border-left: 3px solid var(--neon-blue); background: rgba(0, 240, 255, 0.03); margin-top: 10px; text-align: right; padding: 6px; border-radius: 4px;">
            <span style="font-size: 0.6rem; color: var(--neon-blue); font-weight: bold; display: block; text-transform: uppercase;">💬 TÚ:</span>
            <p style="font-size: 0.72rem; color: #fff; margin: 3px 0 0 0; line-height: 1.4;">${message}</p>
        </div>
    `;
    consoleEl.innerHTML += userMsgHtml;
    inputEl.value = '';
    consoleEl.scrollTop = consoleEl.scrollHeight;

    // 2. Renderizar indicador de escritura del Asesor
    const typingId = "ai-chat-typing-" + Date.now();
    const typingHtml = `
        <div class="opinion-item" id="${typingId}" style="border-left: 3px solid #bf5af2; background: rgba(191, 90, 242, 0.03); margin-top: 10px; padding: 6px; border-radius: 4px;">
            <span style="font-size: 0.6rem; color: #bf5af2; font-weight: bold; display: block; text-transform: uppercase;">🤖 VALORGT AI ANALYST:</span>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin: 3px 0 0 0; font-style: italic;">
                Analizando estructura multivariable de tu patrimonio y métricas macroeconómicas...
            </p>
        </div>
    `;
    consoleEl.innerHTML += typingHtml;
    consoleEl.scrollTop = consoleEl.scrollHeight;

    // 3. Formular respuesta personalizada en base a keywords tras 1.2 segundos
    setTimeout(() => {
        // Eliminar indicador de carga
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        const cleanMsg = message.toLowerCase();
        let reply = "";

        // Calcular métricas actuales del portafolio del inversionista para personalización inteligente
        const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
        const totalAssets = userPortfolio.length;
        
        let totalValUSD = 0;
        let totalRentUSD = 0;
        let totalDebtUSD = 0;
        userPortfolio.forEach(a => {
            totalValUSD += a.currentValue;
            totalRentUSD += a.rent;
            if (a.hasMortgage) {
                totalDebtUSD += a.mortgageDebt;
            }
        });

        const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
        const totalVal = totalValUSD * conversion;
        const totalRent = totalRentUSD * conversion;
        const totalDebt = totalDebtUSD * conversion;
        const equityPct = totalValUSD > 0 ? (((totalValUSD - totalDebtUSD) / totalValUSD) * 100) : 0;

        if (cleanMsg.includes('flujo') || cleanMsg.includes('renta') || cleanMsg.includes('ganancia') || cleanMsg.includes('cashflow') || cleanMsg.includes('retorno')) {
            reply = `🟢 <strong>Optimización de Renta Inmobiliaria:</strong> Con base en tus ${totalAssets} activos, generas un flujo de renta bruta mensual de <strong>${currencySym}${formatNumber(totalRent.toFixed(0))}</strong>. <br><br>Para maximizar tu cashflow neto, recomiendo:<br>
            • Incrementar la renta un <strong>5%</strong> en tu activo <em>Oficina Plaza República Z10</em> para capturar la plusvalía del sector comercial corporativo.<br>
            • Amortizar capital de forma acelerada sobre la hipoteca de Cayalá Z16 para disminuir los cargos por intereses y liberar flujo de caja neto.`;
        } else if (cleanMsg.includes('deuda') || cleanMsg.includes('hipoteca') || cleanMsg.includes('refinanciar') || cleanMsg.includes('apalanca') || cleanMsg.includes('crédito') || cleanMsg.includes('banco')) {
            reply = `🌐 <strong>Estructura de Apalancamiento IA:</strong> Tu patrimonio total asciende a <strong>${currencySym}${formatNumber(totalVal.toFixed(0))}</strong> con una deuda consolidada de <strong>${currencySym}${formatNumber(totalDebt.toFixed(0))}</strong> (un Equity del <strong>${equityPct.toFixed(1)}%</strong>). <br><br>
            • Tu salud de apalancamiento es excelente. Al tener un Equity robusto, calificas para financiamiento FHA premium con tasa preferencial.<br>
            • Recomiendo refinanciar la hipoteca de la <em>Oficina en Zona 10</em> si logras negociar una tasa FHA inferior al <strong>7.25% anual</strong>, lo que ahorraría miles en amortización.`;
        } else if (cleanMsg.includes('comprar') || cleanMsg.includes('adquirir') || cleanMsg.includes('invertir') || cleanMsg.includes('plusvalía') || cleanMsg.includes('zona') || cleanMsg.includes('sector')) {
            reply = `🚀 <strong>Planificación de Adquisiciones IA:</strong> Tu activo en <em>Zona 16 Cayalá</em> lidera tu portafolio con una plusvalía de <strong>+8.4% anual</strong>. <br><br>
            • Si deseas adquirir tu próximo activo, el motor analítico predice un crecimiento acelerado en <strong>Zona 14 (La Cañada)</strong> y <strong>Zona 15</strong> debido a escasez de terrenos premium.<br>
            • Cuentas con una capacidad crediticia disponible de <strong>${currencySym}${formatNumber((totalRent * 0.4).toFixed(0))} mensuales</strong>. Esto te permite apalancar una preventa de apartamento en Zona 14 de hasta <strong>${currencySym}${formatNumber((totalRent * 50).toFixed(0))}</strong> sin arriesgar tu liquidez.`;
        } else {
            reply = `🤖 <strong>Asesoría Estratégica Multivariable:</strong> Entendido. He analizado tu portafolio de <strong>${totalAssets} activos</strong> valorados en <strong>${currencySym}${formatNumber(totalVal.toFixed(0))}</strong>.<br><br>
            • Tu Equity es del <strong>${equityPct.toFixed(1)}%</strong>, lo cual te coloca en una posición sumamente conservadora y con alta solvencia crediticia bancaria.<br>
            • ¿Te gustaría que analicemos el impacto financiero de adquirir una nueva propiedad, refinanciar Plaza República Z10, o realizar un plan de retiro acelerado mediante plusvalía compuesta?`;
        }

        const aiMsgHtml = `
            <div class="opinion-item" style="border-left: 3px solid #bf5af2; background: rgba(191, 90, 242, 0.03); margin-top: 10px; padding: 6px; border-radius: 4px;">
                <span style="font-size: 0.6rem; color: #bf5af2; font-weight: bold; display: block; text-transform: uppercase;">🤖 VALORGT AI ANALYST:</span>
                <p style="font-size: 0.72rem; color: #fff; margin: 3px 0 0 0; line-height: 1.4;">${reply}</p>
            </div>
        `;
        consoleEl.innerHTML += aiMsgHtml;
        consoleEl.scrollTop = consoleEl.scrollHeight;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 1200);
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
        return;
    } else {
        if (loginGate) loginGate.classList.add('hidden');
        if (dashboardArea) dashboardArea.classList.remove('hidden');
    }

    updateFormUnits();
    renderB2bAgentProfile();
    updateSaasMetricsHUD();
    updatePromoPropertySelect();
    renderB2bInventory();

    // Sincronizar listados del agente con Supabase en tiempo real
    if (isSupabaseActive) {
        syncSupabaseData();
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
        loggedInB2bClient = b2bClients.find(c => c.email.toLowerCase() === 'roberto@inversionesrv.com') || b2bClients[0];
    }

    const client = loggedInB2bClient;
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let planPriceUSD = 0;
    if (client.plan.toLowerCase() === 'vip') planPriceUSD = 399;
    else if (client.plan.toLowerCase() === 'pro') planPriceUSD = 149;
    else planPriceUSD = 49;

    const planPriceConverted = planPriceUSD * conversion;
    const planClass = client.plan.toLowerCase() === 'básico' || client.plan.toLowerCase() === 'basico' ? 'basico' : client.plan.toLowerCase();

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
                    <span class="plan-col ${planClass}" style="font-size: 0.8rem; padding: 2px 6px; border-radius: 4px;">${client.plan.toUpperCase()}</span>
                </div>
                <div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">CORREO CORPORATIVO:</span>
                    <strong style="font-size: 0.8rem; color: #fff; text-decoration: underline;">${client.email}</strong>
                </div>
                <div>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">ESTADO DE CUENTA:</span>
                    <strong style="font-size: 0.85rem; color: var(--green);">● ${client.status.toUpperCase()}</strong>
                </div>
            </div>

            <!-- Fila 3: Resumen de facturación y firma digital -->
            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Costo de Licencia SaaS:</span>
                    <strong style="font-size: 0.95rem; color: var(--green);">${currencySym}${formatNumber(planPriceConverted.toFixed(0))} / mes</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; margin-top: 3px;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Firma Digital Autorizada:</span>
                    <span style="font-size: 0.7rem; color: var(--cyan); background: rgba(0, 240, 255, 0.08); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(0, 240, 255, 0.25);">SSL-TLS-V1.3</span>
                </div>
            </div>
        </div>
    `;

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
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const billingConverted = saasBillingAmountUSD * conversion;
    const billingFormatted = `${currencySym}${formatNumber(billingConverted.toFixed(2))}`;

    const saasBillingEl = document.getElementById('saas-billing-val');
    if (saasBillingEl) {
        saasBillingEl.innerText = billingFormatted;
    }

    const billingCard = document.getElementById('saas-billing-val-card');
    if (billingCard) {
        billingCard.innerText = billingFormatted;
    }

    const saasListingsEl = document.getElementById('saas-listings-count');
    if (saasListingsEl) {
        saasListingsEl.innerText = agentUploadedProperties.length;
    }

    const countCard = document.getElementById('saas-listings-count-card');
    if (countCard) {
        countCard.innerText = agentUploadedProperties.length;
    }

    const saasImpressionsEl = document.getElementById('saas-impressions-count');
    if (saasImpressionsEl) {
        saasImpressionsEl.innerText = formatNumber(saasImpressionsCount);
    }

    const impressionsCard = document.getElementById('saas-impressions-count-card');
    if (impressionsCard) {
        impressionsCard.innerText = formatNumber(saasImpressionsCount);
    }

    // Cartera USDT (Airdrops)
    if (loggedInB2bClient) {
        const usdtCard = document.getElementById('saas-usdt-balance-card');
        if (usdtCard) {
            usdtCard.innerText = `${loggedInB2bClient.usdtBalance.toFixed(2)} USDT`;
        }
    }
}

/**
 * Ejecuta la transferencia simulada de USDT entre agentes comerciales
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
        alert(`⚠️ FONDOS INSUFICIENTES: Tu balance actual es de ${loggedInB2bClient.usdtBalance.toFixed(2)} USDT. No puedes transferir ${amount.toFixed(2)} USDT.`);
        return;
    }

    // 2. Validar que no se transfiera a sí mismo
    if (loggedInB2bClient.email.toLowerCase() === recipientEmail) {
        alert("⚠️ OPERACIÓN RECHAZADA: No puedes transferirte fondos USDT a ti mismo.");
        return;
    }

    const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // SI SUPABASE ESTÁ ACTIVO, HACER LA TRANSFERENCIA PERSISTENTE
    if (isSupabaseActive) {
        try {
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
                    tx_hash: txHash
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
                appendAdminLog("SECURITY", `ledger_node: Transferencia exitosa de ${amount.toFixed(2)} USDT de ${loggedInB2bClient.name} a ${recipientProfile.name} (${recipientEmail}) en Supabase.`, false);
            }

        } catch (err) {
            console.error("Fallo de red en transferencia Supabase:", err);
            alert("⚠️ FALLO DE RED: No se pudo conectar con el Ledger de la Blockchain.");
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

        if (typeof appendAdminLog === 'function') {
            appendAdminLog("SECURITY", `ledger_node: Transferencia exitosa de ${amount.toFixed(2)} USDT de ${loggedInB2bClient.name} a ${finalRecipient.name} (${finalRecipient.email}) [Memoria Local].`, false);
        }
    }

    // Actualizar HUD
    updateSaasMetricsHUD();

    // Limpiar formulario
    document.getElementById('b2b-usdt-transfer-form').reset();

    // Alerta de éxito
    alert(`¡CONEXIÓN ESTABLECIDA CON LA BLOCKCHAIN!
    
    ✅ Transferencia de ${amount.toFixed(2)} USDT autorizada y confirmada.
    Destinatario: ${recipientEmail}
    Hash del bloque: ${txHash.substring(0, 16)}...
    
    Tu nuevo balance es de ${loggedInB2bClient.usdtBalance.toFixed(2)} USDT.`);
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

    const title = document.getElementById('pub-title').value;
    const category = document.getElementById('pub-category').value;
    const type = document.getElementById('pub-type').value;
    const locationKey = document.getElementById('pub-location').value;
    const priceRaw = parseFloat(document.getElementById('pub-price').value);
    const size = parseFloat(document.getElementById('pub-size').value);
    const rooms = parseInt(document.getElementById('pub-beds').value);
    const bathrooms = parseFloat(document.getElementById('pub-baths').value);
    const parkings = parseInt(document.getElementById('pub-parks').value);
    const photo = document.getElementById('pub-photo').value;
    const lat = parseFloat(document.getElementById('pub-lat').value);
    const lng = parseFloat(document.getElementById('pub-lng').value);

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

    if (!title || !priceRaw || !size || !rooms || !bathrooms || !parkings || isNaN(lat) || isNaN(lng)) {
        alert("Por favor completa todos los campos del listado, incluyendo coordenadas GPS válidas.");
        return;
    }

    // Convertir precio a USD como estándar interno de base de datos
    const priceUSD = activeCurrency === 'GTQ' ? (priceRaw / exchangeRate) : priceRaw;

    const zoneData = ZONES_DATABASE[locationKey];
    const locationName = zoneData ? zoneData.name.split(' (')[0] : "Guatemala";

    // Estructurar propiedad que combine perfectamente con PORTFOLIO_DATABASE y soporte la tasación multivariable
    const newProperty = {
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
        badge: "NUEVO LISTADO",
        location: locationKey,
        isAgentUpload: true,
        sponsored: false,
        lat: lat,
        lng: lng
    };

    if (isSupabaseActive) {
        try {
            // Guardar en Supabase incluyendo los campos avanzados en el payload de properties
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
                        amenities: amenities
                    }
                }
            ]).select();

            if (error) {
                console.error("Error al registrar propiedad en Supabase:", error);
            } else if (data && data[0]) {
                newProperty.id = data[0].id; // Reemplazar con el UUID generado en Supabase
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

    // Limpiar formulario y restablecer valores del acordeón
    document.getElementById('publish-property-form').reset();
    
    // Forzar checkboxes y selectores por defecto
    if (document.getElementById('pub-room-master-suite')) document.getElementById('pub-room-master-suite').checked = true;
    if (document.getElementById('pub-bath-visitor')) document.getElementById('pub-bath-visitor').checked = true;
    if (document.getElementById('pub-near-malls')) document.getElementById('pub-near-malls').checked = true;
    if (document.getElementById('pub-near-schools')) document.getElementById('pub-near-schools').checked = true;
    if (document.getElementById('pub-area-living')) document.getElementById('pub-area-living').checked = true;
    if (document.getElementById('pub-area-dining')) document.getElementById('pub-area-dining').checked = true;
    if (document.getElementById('pub-area-kitchen')) document.getElementById('pub-area-kitchen').checked = true;
    if (document.getElementById('pub-area-laundry')) document.getElementById('pub-area-laundry').checked = true;
    if (document.getElementById('pub-mat-porcelain')) document.getElementById('pub-mat-porcelain').checked = true;
    if (document.getElementById('pub-mat-pvc')) document.getElementById('pub-mat-pvc').checked = true;
    if (document.getElementById('pub-mat-kitchen-luxe')) document.getElementById('pub-mat-kitchen-luxe').checked = true;
    if (document.getElementById('pub-amenity-security')) document.getElementById('pub-amenity-security').checked = true;
    if (document.getElementById('pub-amenity-view')) document.getElementById('pub-amenity-view').checked = true;
    if (document.getElementById('pub-amenity-cistern')) document.getElementById('pub-amenity-cistern').checked = true;

    // Actualizar selectores, HUD, inventario comercial y sincronizar monedas
    updatePromoPropertySelect();
    updateSaasMetricsHUD();
    renderB2bInventory();
    updateFormUnits();

    // Alerta interactiva de éxito
    alert(`Listado "${title}" publicado exitosamente como ${category}. Se inyectó en el inventario activo de ${locationName} con sus 35+ parámetros de tasación IA y ahora está disponible para contratar pauta publicitaria.`);
}

/**
 * Abre el modal de pasarela de pago para cambiar de plan SaaS
 */
function openPlanPayment(planKey) {
    if (planKey === activeB2bPlan) {
        alert(`Ya tienes activo el Plan ${planKey.toUpperCase()} corporativo.`);
        return;
    }

    pendingPaymentType = 'subscription';
    pendingPaymentTarget = planKey;

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    let planName = "";
    let planPriceUSD = 0;

    if (planKey === 'basico') {
        planName = "Suscripción Agente Básico";
        planPriceUSD = 49;
    } else if (planKey === 'pro') {
        planName = "Suscripción Inmobiliaria Pro";
        planPriceUSD = 149;
    } else if (planKey === 'vip') {
        planName = "Suscripción Desarrollador VIP";
        planPriceUSD = 399;
    }

    const priceConverted = planPriceUSD * conversion;

    // Actualizar interfaz del modal
    document.getElementById('payment-concept-label').innerText = planName;
    document.getElementById('payment-total-label').innerText = `${currencySym}${formatNumber(priceConverted.toFixed(2))}`;

    // Mostrar modal
    const modal = document.getElementById('commercial-payment-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Abre el modal de pasarela de pago para contratar publicidad
 */
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

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    
    // El precio fijo de pauta publicitaria es Q450 o USD $58
    const priceConverted = activeCurrency === 'GTQ' ? 450 : 58;

    // Actualizar interfaz del modal
    document.getElementById('payment-concept-label').innerText = `Pauta Destacada: ${selectedProp.title} en Portada ${zoneKey.toUpperCase()}`;
    document.getElementById('payment-total-label').innerText = `${currencySym}${formatNumber(priceConverted.toFixed(2))}`;

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
        let planLabel = "Inmobiliaria Pro";
        if (planKey === 'basico') {
            planLabel = "Agente Básico";
            amountUSD = 49;
        } else if (planKey === 'pro') {
            planLabel = "Inmobiliaria Pro";
            amountUSD = 149;
        } else if (planKey === 'vip') {
            planLabel = "Desarrollador VIP";
            amountUSD = 399;
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
    if ((user === 'admin@valorgt.com' || user === 'admin') && (pass === 'valorgt' || pass === 'admin')) {
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

            alert("¡Acceso ROOT/ADMIN Concedido! Consola Global de Administración desbloqueada con éxito.");
        }, 1500);
        return;
    }

    // Bypass de cuentas Demo locales para permitir acceso de pruebas rápido sin requerir registro manual previo en Supabase Auth
    const isDemoAccount = (user === 'agente@valorgt.com' && pass === 'valorgt') || 
                          b2bClients.some(c => c.email.toLowerCase() === user && (c.password === pass || pass === 'valorgt'));

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

            // Descargar el perfil detallado del agente desde public.profiles
            const { data: profile, error: profileErr } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileErr) {
                if (scanOverlay) scanOverlay.classList.add('hidden');
                alert(`⚠️ ERROR DE SISTEMA: No se pudo descargar el perfil de socio desde Supabase. ${profileErr.message}`);
                return;
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
                usdtBalance: parseFloat(profile.usdt_balance)
            };
            activeB2bPlan = profile.plan.toLowerCase();

            const partnerLevelEl = document.getElementById('commercial-partner-level');
            if (partnerLevelEl) {
                partnerLevelEl.innerText = profile.plan === 'VIP' ? "Desarrollador VIP" : (profile.plan === 'Pro' ? "Inmobiliaria Pro" : "Agente Básico");
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
    const client = b2bClients.find(c => c.email.toLowerCase() === user);

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
            activeB2bPlan = client.plan.toLowerCase();
            const partnerLevelEl = document.getElementById('commercial-partner-level');
            if (partnerLevelEl) {
                partnerLevelEl.innerText = client.plan === 'VIP' ? "Desarrollador VIP" : (client.plan === 'Pro' ? "Inmobiliaria Pro" : "Agente Básico");
            }
        } else {
            // Demo user (agente@valorgt.com)
            loggedInB2bClient = b2bClients.find(c => c.email.toLowerCase() === 'roberto@inversionesrv.com') || b2bClients[0];
            activeB2bPlan = 'pro';
            const partnerLevelEl = document.getElementById('commercial-partner-level');
            if (partnerLevelEl) {
                partnerLevelEl.innerText = "Inmobiliaria Pro";
            }
        }

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

            alert("¡Acceso B2B Concedido! Firma digital y certificado de socio inmobiliario validados.");
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
let selectedSignupPlanPrice = 149;

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
function handleRegistrationFormSubmit(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('com-signup-name').value.trim();
    const company = document.getElementById('com-signup-company').value.trim();
    const nit = document.getElementById('com-signup-nit').value.trim();
    const phone = document.getElementById('com-signup-phone').value.trim();
    const email = document.getElementById('com-signup-email').value.trim().toLowerCase();
    const pass = document.getElementById('com-signup-pass').value.trim();
    const roleSelect = document.getElementById('com-signup-type');
    const role = roleSelect ? roleSelect.value : 'agente';

    if (!name || !company || !nit || !phone || !email || !pass) {
        alert("Por favor completa todos los campos del registro.");
        return;
    }

    // Verificar si el usuario ya está registrado
    const existing = b2bClients.find(c => c.email.toLowerCase() === email);
    if (existing || email === 'agente@valorgt.com') {
        alert("⚠️ REGISTRO DENEGADO: El correo electrónico corporativo ingresado ya está asociado a una cuenta activa.");
        return;
    }

    // Guardar temporalmente los datos del nuevo usuario
    pendingSignupUser = { name, company, nit, phone, email, pass, role };

    // Configurar pantalla de pago de suscripción
    document.getElementById('commercial-login-gate').classList.add('hidden');
    document.getElementById('commercial-signup-payment-gate').classList.remove('hidden');
    
    // Seleccionar plan recomendado 'pro' por defecto
    selectSignupPlan('pro', 149);

    alert(`¡Registro previo completado! Se ha establecido tu perfil. Por favor, selecciona un plan de suscripción e ingresa tus datos de tarjeta para activar tu cuenta.`);
}

/**
 * Alterna visualmente el plan seleccionado en la pantalla de pago de registro
 */
function selectSignupPlan(planKey, priceUSD) {
    selectedSignupPlanKey = planKey;
    selectedSignupPlanPrice = priceUSD;

    // Actualizar clases activas en las tarjetas de plan
    ['basico', 'pro', 'vip'].forEach(p => {
        const card = document.getElementById(`signup-plan-${p}`);
        if (card) {
            if (p === planKey) {
                card.classList.add('active-plan');
                card.style.borderColor = 'var(--cyan)';
                card.style.background = 'rgba(0, 240, 255, 0.03)';
            } else {
                card.classList.remove('active-plan');
                card.style.borderColor = 'rgba(255,255,255,0.08)';
                card.style.background = 'rgba(0,0,0,0.25)';
            }
        }
    });

    // Calcular conversión y símbolo
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    const priceConverted = priceUSD * conversion;

    let planName = "Suscripción Inmobiliaria Pro";
    if (planKey === 'basico') planName = "Suscripción Agente Básico";
    if (planKey === 'vip') planName = "Suscripción Desarrollador VIP";

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
    const newClient = {
        name: pendingSignupUser.name,
        company: pendingSignupUser.company,
        nit: pendingSignupUser.nit,
        phone: pendingSignupUser.phone,
        email: pendingSignupUser.email,
        plan: selectedSignupPlanKey.charAt(0).toUpperCase() + selectedSignupPlanKey.slice(1),
        status: 'Activo',
        password: pendingSignupUser.pass,
        usdtBalance: 100.00, // Airdrop de bienvenida
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
                        usdt_balance: 100.00,
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
    activeB2bPlan = selectedSignupPlanKey;
    saasBillingAmountUSD += selectedSignupPlanPrice;

    // Actualizar insignias de socio
    const partnerLevelEl = document.getElementById('commercial-partner-level');
    if (partnerLevelEl) {
        let planLabel = "Inmobiliaria Pro";
        if (selectedSignupPlanKey === 'basico') planLabel = "Agente Básico";
        if (selectedSignupPlanKey === 'vip') planLabel = "Desarrollador VIP";
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
    if (!emptyEl || !gridEl) return;

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
        card.innerHTML = `
            <div class="inv-img-wrap">
                <span class="inv-cat-badge ${catClass}">${prop.category.toUpperCase()}</span>
                ${isSponsored ? '<span class="inv-sponsored-tag">★ PATROCINADO</span>' : ''}
                <img src="${prop.photo}" alt="${prop.title}">
            </div>
            <div class="inv-info">
                <div>
                    <h4 class="inv-title" title="${prop.title}">${prop.title}</h4>
                    <div class="inv-meta" style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-secondary); margin-top: 4px;">
                        <span>📍 ${prop.location.toUpperCase()}</span>
                        <span>${prop.rooms} H • ${prop.bathrooms} B</span>
                    </div>
                    <div class="inv-specs" style="margin-top: 5px; display: flex; gap: 6px; font-size: 0.55rem; color: var(--text-muted);">
                        <span>📐 M²: ${prop.size}</span>
                        <span>🚗 Pq: ${prop.parkings}</span>
                        <span>🛡️ Smart IoT</span>
                    </div>
                </div>
                <div class="inv-price-bar" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 8px;">
                    <span class="inv-price" style="font-size: 0.85rem; font-weight: bold; color: var(--cyan);">${currencySym}${formatNumber(convertedPrice.toFixed(0))}</span>
                    <button class="btn-inv-action" onclick="autoValuateFromInventory('${prop.location}', ${dbIndex})" style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--cyan); color: var(--cyan); font-size: 0.55rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: var(--transition-smooth);">
                        ⚡ TASAR IA
                    </button>
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
        
        // Calcular cobro total del plan
        let planPriceUSD = 0;
        if (client.plan.toLowerCase() === 'vip') planPriceUSD = 399;
        else if (client.plan.toLowerCase() === 'pro') planPriceUSD = 149;
        else if (client.plan.toLowerCase() === 'básico' || client.plan.toLowerCase() === 'basico') planPriceUSD = 49;
        
        // Sumar facturaciones por pauta publicitaria (si las tiene)
        let totalClientAdBillingUSD = 0;
        if (client.email === 'agente@valorgt.com') {
            // El agente demo tiene la facturación del ad actual
            totalClientAdBillingUSD = (saasBillingAmountUSD - 149); // El plan Pro base es $149, lo demás son ads
        }

        const clientTotalUSD = planPriceUSD + totalClientAdBillingUSD;
        totalRevenueUSD += clientTotalUSD;

        const convertedTotal = clientTotalUSD * conversion;
        const planClass = (client.plan.toLowerCase() === 'básico' || client.plan.toLowerCase() === 'basico') ? 'basico' : client.plan.toLowerCase();
        
        const isSuspended = client.status === 'Suspendido';
        const statusColorClass = isSuspended ? 'text-red' : 'text-green';
        const actionBtnText = isSuspended ? '⚡ REACTIVAR' : '🚫 SUSPENDER';
        const actionBtnColor = isSuspended ? 'color: var(--green); border-color: var(--green);' : 'color: var(--red); border-color: var(--red);';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong class="text-green">${client.name}</strong><br>
                <span class="sub-title font-mono" style="font-size: 0.6rem; color: var(--text-muted);">${client.company}</span>
            </td>
            <td><span class="plan-col ${planClass}" style="font-size: 0.65rem;">${client.plan.toUpperCase()}</span></td>
            <td style="font-size: 0.6rem;">
                ${client.phone}<br>
                <span class="text-muted" style="text-decoration: underline;">${client.email}</span>
            </td>
            <td><strong class="${statusColorClass}" style="font-size: 0.65rem;">${client.status.toUpperCase()}</strong></td>
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 0.75rem; font-weight: bold; color: var(--green); margin-right: 5px;">${currencySym}${formatNumber(convertedTotal.toFixed(0))}</span>
                    <button class="btn btn-outline font-mono" style="padding: 3px 6px; font-size: 0.55rem; background: transparent; cursor: pointer; border: 1px solid currentColor; ${actionBtnColor}" onclick="toggleAgentStatus(${idx})">
                        ${actionBtnText}
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    counter.innerText = `${totalSubscribers} AGENTE${totalSubscribers === 1 ? '' : 'S'}`;

    // Actualizar KPIs de administración
    animateNumber('admin-total-revenue', 0, totalRevenueUSD * conversion, 600);
    document.getElementById('admin-total-subscribers').innerText = `${totalSubscribers} Activos`;
    
    // Campañas de pauta activas: contamos cuántos anuncios sponsored hay en PORTFOLIO_DATABASE
    let sponsoredCount = 0;
    Object.keys(PORTFOLIO_DATABASE).forEach(zone => {
        PORTFOLIO_DATABASE[zone].forEach(prop => {
            if (prop.sponsored === true) sponsoredCount++;
        });
    });
    document.getElementById('admin-total-campaigns').innerText = `${sponsoredCount} Pautas`;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Suspende o reactiva una cuenta de agente comercial
 */
function toggleAgentStatus(clientIdx) {
    const client = b2bClients[clientIdx];
    if (!client) return;

    const currentlySuspended = client.status === 'Suspendido';
    if (currentlySuspended) {
        client.status = 'Activo';
        appendAdminLog("SECURITY", `agent_audit: Cuenta de ${client.name} (${client.company}) reactivada por administrador root.`, true);
        alert(`¡Socio ${client.name} reactivado con éxito! Acceso SaaS restaurado.`);
    } else {
        client.status = 'Suspendido';
        appendAdminLog("SECURITY", `agent_audit: Cuenta de ${client.name} (${client.company}) SUSPENDIDA por administrador root.`, true);
        alert(`¡Socio ${client.name} suspendido de forma inmediata! Acceso SaaS bloqueado de forma temporal.`);
    }

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
    
    alert(`Calibración del motor IA de plusvalías recalibrado a ${checked ? 'Burbuja Prime (+1.5% anual)' : 'Estable (suelo tradicional)'}.`);
}

/**
 * Sincroniza las propiedades e inventario desde el servidor Supabase a la aplicación local
 */
async function syncSupabaseData() {
    if (!isSupabaseActive) return;

    try {
        // 1. Descargar todas las propiedades remotas
        const { data: remoteProperties, error } = await supabaseClient
            .from('properties')
            .select('*');

        if (error) {
            console.error("Error al sincronizar propiedades desde Supabase:", error);
            return;
        }

        if (remoteProperties && remoteProperties.length > 0) {
            remoteProperties.forEach(prop => {
                const zoneKey = prop.location_key;
                
                // Estructurar al formato interno compatible con mockData.js
                const formattedProp = {
                    id: prop.id,
                    title: prop.title,
                    category: prop.category,
                    type: prop.type,
                    tag: prop.tag,
                    priceUSD: parseFloat(prop.price_usd),
                    size: parseFloat(prop.size_m2),
                    rooms: parseInt(prop.rooms),
                    bathrooms: parseFloat(prop.bathrooms),
                    parkings: parseInt(prop.parkings),
                    garden: 0,
                    study: true,
                    familyRoom: true,
                    amenities: ["amenity-security", "amenity-smart"],
                    photo: prop.photo_url,
                    badge: prop.sponsored ? "PATROCINADO" : "NUEVO LISTADO",
                    location: zoneKey,
                    isAgentUpload: true,
                    sponsored: prop.sponsored,
                    lat: parseFloat(prop.latitude),
                    lng: parseFloat(prop.longitude)
                };

                // Evitar duplicación de listados
                if (!PORTFOLIO_DATABASE[zoneKey]) {
                    PORTFOLIO_DATABASE[zoneKey] = [];
                }

                const exists = PORTFOLIO_DATABASE[zoneKey].some(p => p.id === formattedProp.id || p.title === formattedProp.title);
                if (!exists) {
                    if (formattedProp.sponsored) {
                        PORTFOLIO_DATABASE[zoneKey].unshift(formattedProp);
                    } else {
                        PORTFOLIO_DATABASE[zoneKey].push(formattedProp);
                    }
                }

                // Cargar al inventario de pauta si le pertenece al usuario logueado
                if (loggedInB2bClient && prop.agent_id === loggedInB2bClient.id) {
                    const agentExists = agentUploadedProperties.some(p => p.id === formattedProp.id || p.title === formattedProp.title);
                    if (!agentExists) {
                        agentUploadedProperties.push(formattedProp);
                    }
                }
            });

            // Actualizar la interfaz de forma reactiva según la sección visible
            const activeViewEl = document.querySelector('.app-view.active');
            if (activeViewEl) {
                const activeId = activeViewEl.id;
                if (activeId === 'view-catalog') {
                    renderCatalogProperties();
                } else if (activeId === 'view-heatmap') {
                    if (typeof initHeatmap === 'function') initHeatmap();
                } else if (activeId === 'view-commercial') {
                    renderB2bInventory();
                    updatePromoPropertySelect();
                    updateSaasMetricsHUD();
                }
            }
        }
    } catch (err) {
        console.error("Fallo crítico de conexión al sincronizar Supabase:", err);
    }
}



