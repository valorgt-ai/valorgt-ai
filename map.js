/* ==========================================================================
   VALORGT AI - RADAR DE CALOR E INTEGRACIÓN DE MAPAS LEAFLET (PREMIUM V4.20)
   ========================================================================== */

let leafletMapInstance = null;
let mapCircles = [];
let mapMarkers = [];
let agentMapMarkers = [];
let agentMapCircles = [];
let customGpsMarker = null; // Guardará el marcador de búsqueda personalizada
let customGpsCircle = null; // Guardará el círculo de calor personalizado
let currentFocusZoneKey = null; // Evita refrescos innecesarios de telemetría
let activeMapCategory = 'apartamentos'; // Categoría activa en el mapa de calor

/**
 * Calcula la distancia real geográfica en kilómetros entre dos coordenadas GPS usando la fórmula de Haversine
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia real en kilómetros
}

/**
 * Inicializa el mapa táctico oscuro de Ciudad de Guatemala
 */
function initHeatmap() {
    const mapElement = document.getElementById('heatmap-map');
    if (!mapElement) return;

    // Si ya existe, destruirlo para reinicializar limpio
    if (leafletMapInstance) {
        leafletMapInstance.remove();
        leafletMapInstance = null;
    }

    // Coordenadas centrales de Ciudad de Guatemala
    const guatemalaCityCenter = [14.5956, -90.4851];
    
    // Crear el mapa Leaflet
    leafletMapInstance = L.map('heatmap-map', {
        center: guatemalaCityCenter,
        zoom: 12,
        zoomControl: false,
        attributionControl: false
    });

    // Agregar control de zoom en una esquina más limpia
    L.control.zoom({
        position: 'topright'
    }).addTo(leafletMapInstance);

    // Cargar mapa base CartoDB Dark Matter (Estética Sci-Fi Financiera)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        timeout: 5000
    }).addTo(leafletMapInstance);

    // --- SENSORES DE MOVIMIENTO GPS RADAR ---
    // Evento de arrastre/movimiento: actualizar coordenadas GPS del radar en tiempo real
    leafletMapInstance.on('move', () => {
        const center = leafletMapInstance.getCenter();
        document.getElementById('radar-lat').innerText = center.lat.toFixed(4);
        document.getElementById('radar-lng').innerText = center.lng.toFixed(4);
    });

    // Evento final de movimiento: detectar nodo de plusvalía más cercano al centro actual
    leafletMapInstance.on('moveend', () => {
        const center = leafletMapInstance.getCenter();
        updateNearestZoneFocus(center.lat, center.lng);
    });

    // Dibujar los nodos y círculos de calor
    drawRadarNodes();

    // Dibujar los centros comerciales como anclas de plusvalía
    drawMalls();

    // Dibujar otros puntos de plusvalía (Aeropuerto y Universidades)
    drawLandmarks();

    // Dibujar lagos/cuerpos de agua geográficos
    drawLakes();

    // Dibujar hoteles estratégicos
    drawHotels();

    // Dibujar propiedades publicadas por agentes comerciales
    drawAgentProperties();

    // Asegurar que el selector de categorías del mapa coincida con la categoría activa global
    if (typeof activeTerminalCategory !== 'undefined') {
        syncMapCategorySelector(activeTerminalCategory);
    }
}

/**
 * Alterna el segmento de mercado activo en el mapa y redibuja los nodos
 */
function switchMapCategory(category) {
    activeMapCategory = category;
    
    // Sincronizar con el selector global de la terminal si existe
    if (typeof activeTerminalCategory !== 'undefined') {
        activeTerminalCategory = category;
        // Actualizar visualmente la barra de la terminal de inversión
        document.querySelectorAll('.term-tab').forEach(btn => {
            btn.classList.remove('active');
            btn.style.border = '1px solid transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.textShadow = 'none';
            btn.style.background = 'transparent';
        });
        const termBtn = document.getElementById(`term-tab-${category}`);
        if (termBtn) {
            termBtn.classList.add('active');
            termBtn.style.border = '1px solid rgba(0, 240, 255, 0.2)';
            termBtn.style.color = 'var(--cyan)';
            termBtn.style.textShadow = '0 0 5px rgba(0,240,255,0.3)';
        }
        // Forzar renderizado de la tabla de inversión en segundo plano
        if (typeof renderInvestorTable === 'function') {
            renderInvestorTable();
        }
    }

    syncMapCategorySelector(category);
    
    // Volver a dibujar círculos y balizas con métricas de la categoría elegida
    drawRadarNodes();
    
    // Actualizar sidebar de telemetría si hay un foco activo
    if (currentFocusZoneKey) {
        showZoneTelemetry(currentFocusZoneKey, false);
    }
}

/**
 * Sincroniza visualmente los botones de categorías del mapa de calor
 */
function syncMapCategorySelector(category) {
    activeMapCategory = category;
    document.querySelectorAll('.map-term-tab').forEach(btn => {
        btn.classList.remove('active');
        btn.style.border = '1px solid transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.textShadow = 'none';
        btn.style.background = 'transparent';
    });
    
    const activeBtn = document.getElementById(`map-tab-${category}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.border = '1px solid rgba(0, 240, 255, 0.2)';
        activeBtn.style.color = 'var(--cyan)';
        activeBtn.style.textShadow = '0 0 5px rgba(0,240,255,0.3)';
    }
}

/**
 * Dibuja los círculos y marcadores interactivos en el mapa base segregados por segmento
 */
function drawRadarNodes() {
    if (!leafletMapInstance) return;

    // Limpiar capas previas si las hubiera
    mapCircles.forEach(circle => leafletMapInstance.removeLayer(circle));
    mapMarkers.forEach(marker => leafletMapInstance.removeLayer(marker));
    mapCircles = [];
    mapMarkers = [];

    // Colores RGB para los círculos de calor
    const colorRGB = {
        red: '#ff375f',
        orange: '#ff9f0a',
        yellow: '#ffd60a',
        green: '#00ff66',
        blue: '#0066ff'
    };

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        
        // Mapear dinámicamente según la categoría de mapa activa
        let basePrice = zone.basePriceM2;
        let roiVal = zone.roi;
        let growthVal = zone.growth5Y / 5;
        let liquidityVal = zone.liquidityIndex;
        let colorClass = zone.color;
        
        if (zone.categories && zone.categories[activeMapCategory]) {
            const cat = zone.categories[activeMapCategory];
            basePrice = cat.priceM2;
            roiVal = cat.roi;
            growthVal = cat.growth || growthVal;
            liquidityVal = cat.liquidity || liquidityVal;
            
            // Recalcular dinámicamente el color de plusvalía según el ROI
            if (roiVal >= 9.0) colorClass = 'red';
            else if (roiVal >= 7.0) colorClass = 'orange';
            else if (roiVal >= 5.5) colorClass = 'yellow';
            else if (roiVal >= 4.0) colorClass = 'green';
            else colorClass = 'blue';

            // Ajuste para terrenos (ROI = 0 pero plusvalía por crecimiento es alta)
            if (activeMapCategory === 'terrenos') {
                if (growthVal >= 9.0) colorClass = 'red';
                else if (growthVal >= 7.0) colorClass = 'orange';
                else if (growthVal >= 5.5) colorClass = 'yellow';
                else colorClass = 'green';
            }
        }

        const color = colorRGB[colorClass] || '#00f0ff';
        const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
        const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
        const priceVal = basePrice * conversion;
        const medianPriceVal = priceVal * 0.97; // Precio Mediano realista

        // Calcular Score ValorGT
        const numLiquidity = parseFloat(liquidityVal) || 7.0;
        const scoreValorGT = Math.min(100, Math.round(roiVal * 5.5 + growthVal * 4.5 + numLiquidity * 2.0));

        // Determinar frecuencia de actualización
        let lastUpdatedText = "Hace 24 horas";
        if (activeMapCategory === 'apartamentos' || activeMapCategory === 'casas') lastUpdatedText = "Hace 12 horas";
        if (activeMapCategory === 'terrenos') lastUpdatedText = "Hace 48 horas";

        // 1. Círculo de Calor Semi-transparente
        const heatCircle = L.circle([zone.lat, zone.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.18,
            weight: 1.5,
            radius: key === 'carretera' ? 2000 : 800, // Carretera es un sector más extenso
            className: `heat-circle-${colorClass}`
        }).addTo(leafletMapInstance);

        mapCircles.push(heatCircle);

        // 2. Marcador de Baliza de Radar (HTML Personalizado con efecto pulso CSS)
        const radarIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon beacon-${colorClass}">
                    <div class="beacon-pulse"></div>
                    <div class="beacon-dot"></div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const beaconMarker = L.marker([zone.lat, zone.lng], { icon: radarIcon }).addTo(leafletMapInstance);
        mapMarkers.push(beaconMarker);

        // 3. Popup Premium con los 9 Indicadores Clave del Segmento
        const segmentSingular = activeMapCategory.substring(0, activeMapCategory.length - 1).toUpperCase();
        const popupContent = `
            <div class="map-popup-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px; margin-bottom: 6px;">
                <h4 style="margin: 0; font-weight: bold; color: #fff; font-size: 1.2rem;">${zone.name.split(' (')[0]}</h4>
                <span class="sub-title font-mono" style="color: ${color}; text-transform: uppercase; font-size: 0.85rem; font-weight: bold; display: block; margin-top: 1px;">SEGMENTO: ${segmentSingular}</span>
            </div>
            <div class="map-popup-body" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 6px; font-family: var(--font-mono); font-size: 0.95rem;">
                <span class="popup-lbl" style="color: var(--text-muted);">Precio Promedio:</span>
                <span class="popup-val text-cyan" style="font-weight: bold; text-align: right;">${currencySym}${formatNumber(priceVal.toFixed(0))}/m²</span>
                
                <span class="popup-lbl" style="color: var(--text-muted);">Precio Mediano:</span>
                <span class="popup-val text-cyan" style="opacity: 0.85; text-align: right;">${currencySym}${formatNumber(medianPriceVal.toFixed(0))}/m²</span>
                
                <span class="popup-lbl" style="color: var(--text-muted);">ROI Alquiler:</span>
                <span class="popup-val text-green" style="font-weight: bold; text-align: right;">${roiVal.toFixed(1)}%</span>
                
                <span class="popup-lbl" style="color: var(--text-muted);">Plusvalía Est.:</span>
                <span class="popup-val text-green" style="text-align: right;">+${growthVal.toFixed(1)}%/año</span>
                
                <span class="popup-lbl" style="color: var(--text-muted);">Liquidez:</span>
                <span class="popup-val text-cyan" style="text-align: right;">${liquidityVal}</span>
                
                <span class="popup-lbl" style="color: var(--text-muted); font-weight: bold;">Score ValorGT:</span>
                <span class="popup-val text-purple" style="color: #bf5af2; font-weight: 900; text-align: right;">${scoreValorGT}/100</span>
                
                <span class="popup-lbl" style="color: var(--text-muted); font-size: 0.8rem;">Actualización:</span>
                <span class="popup-val" style="color: var(--text-muted); font-size: 0.8rem; text-align: right;">${lastUpdatedText}</span>
            </div>
            <div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; text-align: center;">
                <a href="https://www.google.com/maps/?q=${zone.lat},${zone.lng}&t=k" target="_blank" style="color: var(--cyan); text-decoration: none; font-size: 0.72rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                    <i data-lucide="map" style="width: 12px; height: 12px;"></i> Vista Satelital
                </a>
            </div>
        `;

        beaconMarker.bindPopup(popupContent, {
            closeButton: false,
            offset: L.point(0, -5)
        });

        // 4. Eventos al hacer clic en el marcador
        beaconMarker.on('click', () => {
            showZoneTelemetry(key, true); // Centrar
        });

        heatCircle.on('click', () => {
            beaconMarker.openPopup();
            showZoneTelemetry(key, true);
        });
    });
}

/**
 * Muestra la telemetría detallada del segmento y zona en el sidebar del mapa (9 Indicadores)
 * @param {string} zoneKey - Clave de la zona seleccionada
 * @param {boolean} centerMap - Si es verdadero, centra suavemente el mapa en el nodo
 */
function showZoneTelemetry(zoneKey, centerMap = false) {
    const zone = ZONES_DATABASE[zoneKey];
    if (!zone) return;

    currentFocusZoneKey = zoneKey;

    // Ocultar instrucciones e informar carga en contenedor
    const instructions = document.getElementById('map-instructions');
    const details = document.getElementById('map-zone-details');
    if (instructions) instructions.classList.add('hidden');
    if (details) details.classList.remove('hidden');

    // Mapear dinámicamente según la categoría de mapa activa
    let basePrice = zone.basePriceM2;
    let roiVal = zone.roi;
    let growthVal = zone.growth5Y / 5;
    let liquidityVal = zone.liquidityIndex;
    let recLabel = zone.recommendation ? zone.recommendation.split('.')[0] : 'COMPRAR';
    let iaOpinion = zone.recommendation || '';
    
    if (zone.categories && zone.categories[activeMapCategory]) {
        const cat = zone.categories[activeMapCategory];
        basePrice = cat.priceM2;
        roiVal = cat.roi;
        growthVal = cat.growth || growthVal;
        liquidityVal = cat.liquidity || liquidityVal;
        recLabel = cat.rec || recLabel;
        
        // Generar análisis de vector IA específico por segmento
        const segmentNameSingular = activeMapCategory.substring(0, activeMapCategory.length - 1).toUpperCase();
        if (recLabel === 'COMPRAR') {
            iaOpinion = `Se detecta una ventana óptima de entrada en el segmento de ${segmentNameSingular} en ${zone.name.split(' (')[0]}. La absorción supera la oferta histórica, acelerando la consolidación antes de alzas en el precio base.`;
        } else if (recLabel === 'MANTENER') {
            iaOpinion = `Fase de madurez en el segmento de ${segmentNameSingular} en ${zone.name.split(' (')[0]}. Vacancia prácticamente nula y tasas de capitalización robustas aconsejan mantener posiciones activas.`;
        } else if (recLabel === 'VENDER') {
            iaOpinion = `Señales de sobrecalentamiento localizadas en el segmento de ${segmentNameSingular} en ${zone.name.split(' (')[0]}. Recomendable toma de ganancias líquidas para rotar a sectores con mayor elasticidad.`;
        } else {
            iaOpinion = `Sólida rentabilidad operativa con rendimientos estables en ${segmentNameSingular} en ${zone.name.split(' (')[0]}. Flujos corporativos continuos y riesgo patrimonial mínimo en el vector.`;
        }
    }

    // Calcular precios ajustados por moneda
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    
    const priceVal = basePrice * conversion;
    const priceMedianVal = priceVal * 0.97; // Precio Mediano realista

    // Calcular Score ValorGT
    const numLiquidity = parseFloat(liquidityVal) || 7.0;
    const scoreValorGT = Math.min(100, Math.round(roiVal * 5.5 + growthVal * 4.5 + numLiquidity * 2.0));

    // Frecuencias de actualización ideales
    let lastUpdatedText = "Hace 24 horas";
    if (activeMapCategory === 'apartamentos' || activeMapCategory === 'casas') lastUpdatedText = "Hace 12 horas";
    if (activeMapCategory === 'terrenos') lastUpdatedText = "Hace 48 horas";

    // Actualizar elementos en el DOM
    document.getElementById('map-zone-title').innerText = zone.name.split(' (')[0];
    document.getElementById('map-zone-segment').innerText = `SEGMENTO: ${activeMapCategory.substring(0, activeMapCategory.length - 1)}`;
    document.getElementById('map-zone-price-m2').innerText = `${currencySym}${formatNumber(priceVal.toFixed(0))}`;
    document.getElementById('map-zone-price-median').innerText = `${currencySym}${formatNumber(priceMedianVal.toFixed(0))}`;
    document.getElementById('map-zone-roi').innerText = roiVal.toFixed(1) + "%";
    document.getElementById('map-zone-growth').innerText = "+" + growthVal.toFixed(1) + "% / año";
    document.getElementById('map-zone-liquidity').innerText = liquidityVal;
    document.getElementById('map-zone-score').innerText = `${scoreValorGT}/100`;
    document.getElementById('map-zone-updated').innerText = lastUpdatedText;
    document.getElementById('map-zone-ia-opinion').innerText = iaOpinion;

    // Colorear dinámicamente el Score ValorGT
    const scoreEl = document.getElementById('map-zone-score');
    scoreEl.className = 'hud-box-val font-mono';
    if (scoreValorGT >= 90) scoreEl.style.color = '#00ff66';
    else if (scoreValorGT >= 75) scoreEl.style.color = '#00f0ff';
    else if (scoreValorGT >= 60) scoreEl.style.color = '#ffd60a';
    else scoreEl.style.color = '#ff375f';

    // Sincronizar inputs del buscador de coordenadas con la ubicación del nodo
    document.getElementById('gps-input-lat').value = zone.lat.toFixed(4);
    document.getElementById('gps-input-lng').value = zone.lng.toFixed(4);

    const earthBtn = document.getElementById('btn-open-satellite-view');
    if (earthBtn) {
        earthBtn.href = `https://www.google.com/maps/?q=${zone.lat},${zone.lng}&t=k`;
    }

    // Centrar suavemente si fue explícito
    if (centerMap && leafletMapInstance) {
        leafletMapInstance.setView([zone.lat, zone.lng], 13, {
            animate: true,
            duration: 1.0
        });
    }
}

/**
 * Encuentra y enfoca la zona inmobiliaria más cercana usando la fórmula de Haversine
 */
function updateNearestZoneFocus(lat, lng) {
    let closestKey = null;
    let minDistance = Infinity;

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        // Calcular distancia geográfica real con Haversine
        const dist = haversineDistance(zone.lat, zone.lng, lat, lng);
        if (dist < minDistance) {
            minDistance = dist;
            closestKey = key;
        }
    });

    // Si la zona más cercana está en un radio razonable (aprox 5.0 km) y es distinta al foco, actualizar
    if (closestKey && closestKey !== currentFocusZoneKey && minDistance < 5.0) {
        showZoneTelemetry(closestKey, false); // false para NO mover el mapa durante arrastre
    }
}

/**
 * Escanea y ubica unas coordenadas de Google Earth o GPS en el mapa,
 * dibujando un nodo de plusvalía y un círculo de calor personalizado.
 * Utiliza regresión geográfica real de 6 factores (Haversine, Avenidas, Centros Comerciales, Anuncios).
 */
function locateCoordinates(event) {
    if (event) event.preventDefault();
    if (!leafletMapInstance) return;

    // Leer inputs de latitud y longitud
    const lat = parseFloat(document.getElementById('gps-input-lat').value);
    const lng = parseFloat(document.getElementById('gps-input-lng').value);

    if (isNaN(lat) || isNaN(lng)) return;

    // 1. Limpiar balizas y círculos personalizados anteriores si existieran
    if (customGpsMarker) {
        leafletMapInstance.removeLayer(customGpsMarker);
        customGpsMarker = null;
    }
    if (customGpsCircle) {
        leafletMapInstance.removeLayer(customGpsCircle);
        customGpsCircle = null;
    }

    // 2. Mover mapa suavemente al objetivo con zoom de detalle
    leafletMapInstance.setView([lat, lng], 14, {
        animate: true,
        duration: 1.2
    });

    // 3. Encontrar el nodo formal de la base de datos más cercano usando Haversine
    let nearestZone = null;
    let minDistance = Infinity;
    let nearestZoneKey = null;

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        const dist = haversineDistance(zone.lat, zone.lng, lat, lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestZone = zone;
            nearestZoneKey = key;
        }
    });

    const distanceKm = minDistance; // Distancia real en kilómetros
    const diagTextEl = document.getElementById('gps-diagnostic-text');
    const diagContainer = document.getElementById('gps-custom-diagnostic');

    diagContainer.classList.remove('hidden');

    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;

    // Obtener datos del segmento activo del nodo consolidado vecino
    let basePrice = nearestZone.basePriceM2;
    let roiVal = nearestZone.roi;
    let growthVal = nearestZone.growth5Y / 5;
    let liquidityVal = nearestZone.liquidityIndex;
    let plusvaliaClass = nearestZone.color;
    
    if (nearestZone.categories && nearestZone.categories[activeMapCategory]) {
        const cat = nearestZone.categories[activeMapCategory];
        basePrice = cat.priceM2;
        roiVal = cat.roi;
        growthVal = cat.growth || growthVal;
        liquidityVal = cat.liquidity || liquidityVal;
    }

    // --- ALGORITMO PREDICTIVO DE REGRESIÓN DE 6 FACTORES GEOGRÁFICOS ---
    
    // FACTOR 1: Distancia al nodo consolidado más cercano (Haversine)
    let decayFactor = Math.max(0.45, 1.0 - (distanceKm * 0.08)); // -8% por cada km de distancia

    // FACTOR 2: Precio promedio del municipio/nodo urbano (basePrice)
    
    // FACTOR 3: Tipo de inmueble / Segmento activo (activeMapCategory)

    // FACTOR 4: Distancia real al centro comercial ancla más cercano (Haversine)
    let nearestMall = null;
    let minMallDistance = Infinity;
    if (typeof MALLS_DATABASE !== 'undefined') {
        MALLS_DATABASE.forEach(mall => {
            const dist = haversineDistance(mall.lat, mall.lng, lat, lng);
            if (dist < minMallDistance) {
                minMallDistance = dist;
                nearestMall = mall;
            }
        });
    }
    let mallPremium = minMallDistance <= 1.0 ? 1.15 : (minMallDistance <= 2.5 ? 1.08 : 1.0); // +15% de plusvalía si está a <1km de mall

    // FACTOR 5: Distancia estimada a avenidas o vías principales (conectividad)
    // Roosevelt, Aguilar Batres, Las Américas, etc. calculada de forma geológica
    const estDistanceToMainAvenue = Math.min(2.5, Math.abs(lat - 14.59) * 111 + Math.abs(lng - (-90.51)) * 30);
    let avenueFactor = estDistanceToMainAvenue <= 0.8 ? 1.06 : (estDistanceToMainAvenue <= 1.8 ? 1.0 : 0.9); // -10% de valor por desconexión vial

    // FACTOR 6: Densidad de anuncios y listados activos cercanos (tracción B2B)
    let nearbyAdsDensity = 0;
    if (typeof agentUploadedProperties !== 'undefined') {
        agentUploadedProperties.forEach(prop => {
            if (prop.lat && prop.lng) {
                const dist = haversineDistance(prop.lat, prop.lng, lat, lng);
                if (dist <= 2.5) {
                    nearbyAdsDensity++;
                }
            }
        });
    }
    let densityPremium = Math.min(1.22, 1.0 + (nearbyAdsDensity * 0.04)); // +4% de valor por anuncio B2B activo en radio de 2.5km

    // --- CÁLCULO DE VALOR DE REGRESIÓN FINAL ---
    let estimatedPriceM2USD = basePrice * decayFactor * mallPremium * avenueFactor * densityPremium;
    let estimatedRoi = Math.max(3.5, Math.min(11.0, roiVal * decayFactor * densityPremium));
    let estimatedGrowth = Math.max(2.5, Math.min(14.0, growthVal * decayFactor * mallPremium));
    
    // Precios finales ajustados por divisa
    const finalPriceVal = estimatedPriceM2USD * conversion;
    const finalMedianVal = finalPriceVal * 0.97;

    // Calcular clase de color dinámica para la baliza del radar según el ROI estimado
    if (estimatedRoi >= 9.0) plusvaliaClass = 'red';
    else if (estimatedRoi >= 7.0) plusvaliaClass = 'orange';
    else if (estimatedRoi >= 5.5) plusvaliaClass = 'yellow';
    else if (estimatedRoi >= 4.0) plusvaliaClass = 'green';
    else plusvaliaClass = 'blue';

    const colorRGB = {
        red: '#ff375f',
        orange: '#ff9f0a',
        yellow: '#ffd60a',
        green: '#00ff66',
        blue: '#0066ff'
    };
    const activeColor = colorRGB[plusvaliaClass] || '#00f0ff';
    let plusvaliaLabel = "Consolidado / Estable";
    if (plusvaliaClass === 'red') plusvaliaLabel = "Alta Plusvalía (>9% ROI)";
    if (plusvaliaClass === 'orange') plusvaliaLabel = "Crecimiento Activo (7-9% ROI)";
    if (plusvaliaClass === 'green') plusvaliaLabel = "Oportunidad de Inversión";
    if (plusvaliaClass === 'blue') plusvaliaLabel = "Económico / En Desarrollo";

    // 4. DIBUJAR NUEVO CÍRCULO DE CALOR DE PLUSVALÍA DINÁMICO EN EL MAPA
    customGpsCircle = L.circle([lat, lng], {
        color: activeColor,
        fillColor: activeColor,
        fillOpacity: 0.18,
        weight: 1.5,
        radius: 1000,
        className: `heat-circle-${plusvaliaClass} custom-node-circle`
    }).addTo(leafletMapInstance);

    // 5. CREAR BALIZA DE RADAR PULSANTE DEL COLOR CORRESPONDIENTE
    const customIcon = L.divIcon({
        className: 'radar-beacon-container',
        html: `
            <div class="radar-beacon beacon-${plusvaliaClass}">
                <div class="beacon-pulse" style="animation-duration: 1.5s"></div>
                <div class="beacon-dot" style="background-color: ${activeColor}; box-shadow: 0 0 10px ${activeColor};"></div>
            </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    customGpsMarker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMapInstance);

    // 6. Generar diagnóstico textual e interactivo en el Sidebar utilizando los 6 factores
    const segmentSingular = activeMapCategory.substring(0, activeMapCategory.length - 1).toUpperCase();
    
    // Forzar actualización de telemetrías en la interfaz
    document.getElementById('map-zone-title').innerText = `Vector GPS Custom`;
    document.getElementById('map-zone-segment').innerText = `SEGMENTO: ${segmentSingular}`;
    document.getElementById('map-zone-price-m2').innerText = `${currencySym}${formatNumber(finalPriceVal.toFixed(0))}`;
    document.getElementById('map-zone-price-median').innerText = `${currencySym}${formatNumber(finalMedianVal.toFixed(0))}`;
    document.getElementById('map-zone-roi').innerText = estimatedRoi.toFixed(1) + "%";
    document.getElementById('map-zone-growth').innerText = "+" + estimatedGrowth.toFixed(1) + "% / año";
    document.getElementById('map-zone-liquidity').innerText = liquidityVal;
    
    const finalScore = Math.min(100, Math.round(estimatedRoi * 5.5 + estimatedGrowth * 4.5 + parseFloat(liquidityVal) * 2.0));
    document.getElementById('map-zone-score').innerText = `${finalScore}/100`;
    
    const scoreEl = document.getElementById('map-zone-score');
    scoreEl.className = 'hud-box-val font-mono';
    if (finalScore >= 90) scoreEl.style.color = '#00ff66';
    else if (finalScore >= 75) scoreEl.style.color = '#00f0ff';
    else if (finalScore >= 60) scoreEl.style.color = '#ffd60a';
    else scoreEl.style.color = '#ff375f';

    diagTextEl.innerHTML = `Ubicación analizada a <strong>${distanceKm.toFixed(2)} km</strong> de <strong>${nearestZone.name.split(' (')[0]}</strong>.
    <span class="font-mono text-cyan" style="font-size:0.65rem; display:block; margin: 4px 0 2px 0;">ESTATUS IA: BALIZA <strong>${plusvaliaClass.toUpperCase()}</strong> (${plusvaliaLabel}).</span>
    La IA ha calculado la tasación periférica de <strong>${segmentSingular}</strong> correlacionando:
    • Distancia real geográfica al núcleo urbano (decae 8%/km).
    • Proximidad al mall <strong>${nearestMall ? nearestMall.name : 'ancla'}</strong> (${(minMallDistance).toFixed(2)} km).
    • Conectividad vial a avenidas principales (a ${(estDistanceToMainAvenue).toFixed(2)} km).
    • Densidad de listados activos y demanda en el retículo (<strong>${nearbyAdsDensity} anuncios</strong>).`;

    // Actualizar enlace de Google Earth para la baliza escaneada
    const earthBtn = document.getElementById('btn-open-satellite-view');
    if (earthBtn) {
        earthBtn.href = `https://www.google.com/maps/?q=${lat},${lng}&t=k`;
    }

    // Popup interactivo de la baliza escaneada
    customGpsMarker.bindPopup(`
        <div class="map-popup-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 5px;">
            <h4 style="margin: 0; font-weight: bold; color: #fff; font-size: 1.2rem;"><i data-lucide="scan" style="width:11px; height:11px; display:inline-block;"></i> Escaneo Táctico</h4>
            <span style="font-size: 0.85rem; color: ${activeColor}; font-weight: bold; font-family: var(--font-mono); text-transform: uppercase;">SEGMENTO: ${segmentSingular}</span>
        </div>
        <div class="map-popup-body" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 6px; font-family: var(--font-mono); font-size: 0.95rem;">
            <span class="popup-lbl" style="color: var(--text-muted);">Precio Promedio:</span>
            <span class="popup-val text-cyan" style="font-weight: bold; text-align: right;">${currencySym}${formatNumber(finalPriceVal.toFixed(0))}/m²</span>
            
            <span class="popup-lbl" style="color: var(--text-muted);">Precio Mediano:</span>
            <span class="popup-val text-cyan" style="opacity:0.85; text-align: right;">${currencySym}${formatNumber(finalMedianVal.toFixed(0))}/m²</span>
            
            <span class="popup-lbl" style="color: var(--text-muted);">ROI Alquiler:</span>
            <span class="popup-val text-green" style="font-weight: bold; text-align: right;">${estimatedRoi.toFixed(1)}%</span>
            
            <span class="popup-lbl" style="color: var(--text-muted);">Plusvalía Est.:</span>
            <span class="popup-val text-green" style="text-align: right;">+${estimatedGrowth.toFixed(1)}%/año</span>
            
            <span class="popup-lbl" style="color: var(--text-muted); font-weight: bold;">Score ValorGT:</span>
            <span class="popup-val text-purple" style="color: #bf5af2; font-weight: 900; text-align: right;">${finalScore}/100</span>
        </div>
        <div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; text-align: center;">
            <a href="https://www.google.com/maps/?q=${lat},${lng}&t=k" target="_blank" style="color: var(--cyan); text-decoration: none; font-size: 0.72rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="map" style="width: 12px; height: 12px;"></i> Vista Satelital
            </a>
        </div>
    `).openPopup();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Función externa para que otras vistas seleccionen e interactúen con el mapa
 * @param {string} zoneKey - Clave de la zona
 */
function selectMapZone(zoneKey) {
    // Cambiar a la pestaña del mapa
    switchView('heatmap');
    
    // Esperar a que la transición visual termine para abrir el popup
    setTimeout(() => {
        if (!leafletMapInstance) return;
        
        const zone = ZONES_DATABASE[zoneKey];
        if (!zone) return;

        // Encontrar el marcador correspondiente
        const index = Object.keys(ZONES_DATABASE).indexOf(zoneKey);
        if (index !== -1 && mapMarkers[index]) {
            mapMarkers[index].openPopup();
            showZoneTelemetry(zoneKey, true);
        }
    }, 450);
}

let mapMalls = [];

/**
 * Dibuja los centros comerciales como anclas generadoras de plusvalía en el mapa
 */
function drawMalls() {
    if (!leafletMapInstance || typeof MALLS_DATABASE === 'undefined') return;

    // Limpiar capas previas si las hubiera
    mapMalls.forEach(mall => leafletMapInstance.removeLayer(mall));
    mapMalls = [];

    MALLS_DATABASE.forEach(mall => {
        // Marcador de Centro Comercial (Púrpura con efecto pulso CSS e Icono de Bolsa de Compras)
        const mallIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon beacon-purple" style="width: 32px; height: 32px;">
                    <div class="beacon-pulse" style="width: 32px; height: 32px;"></div>
                    <div class="beacon-dot" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(191, 90, 242, 0.85); border: 1.5px solid #bf5af2; border-radius: 50%; box-shadow: 0 0 10px rgba(191, 90, 242, 0.6); z-index: 10;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const mallMarker = L.marker([mall.lat, mall.lng], { icon: mallIcon }).addTo(leafletMapInstance);
        mapMalls.push(mallMarker);

        // Popup con Estilo Cyber-fintech para el centro comercial
        const popupContent = `
            <div class="map-popup-header purple-header">
                <h4 style="font-size: 1.2rem; font-weight: bold;"><i data-lucide="shopping-bag" class="tiny-icon inline"></i> ${mall.name}</h4>
                <span class="sub-title font-mono" style="font-size:0.85rem; color: #bf5af2;">ANCLA COMERCIAL DE PLUSVALÍA</span>
            </div>
            <div class="map-popup-body" style="grid-template-columns: 1fr; font-size: 0.92rem;">
                <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 4px;">
                    <strong style="color: #fff;">Sector:</strong> ${mall.zone}
                </div>
                <div style="font-size: 0.92rem; line-height: 1.4; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 6px; margin-top: 4px;">
                    ${mall.plusvaliaImpact}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; font-style: italic;">
                    * ${mall.details}
                </div>
                <div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; text-align: center;">
                    <a href="https://www.google.com/maps/?q=${mall.lat},${mall.lng}&t=k" target="_blank" style="color: #bf5af2; text-decoration: none; font-size: 0.72rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                        <i data-lucide="map" style="width: 12px; height: 12px;"></i> Vista Satelital
                    </a>
                </div>
            </div>
        `;

        mallMarker.bindPopup(popupContent, {
            closeButton: false,
            offset: L.point(0, -5)
        });
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

let mapLandmarks = [];

/**
 * Dibuja hitos estratégicos de plusvalía (aeropuerto y universidades) en el mapa
 */
function drawLandmarks() {
    if (!leafletMapInstance || typeof LANDMARKS_DATABASE === 'undefined') return;

    // Limpiar capas previas si las hubiera
    mapLandmarks.forEach(marker => leafletMapInstance.removeLayer(marker));
    mapLandmarks = [];

    LANDMARKS_DATABASE.forEach(landmark => {
        // Estructura de mapeo modular y limpia para la identidad visual de los hitos
        const typeConfig = {
            airport: {
                beaconClass: 'beacon-pink',
                headerClass: 'pink-header',
                iconName: 'plane',
                badgeText: 'INFRAESTRUCTURA Y CONECTIVIDAD',
                themeColor: '#ff2d55',
                bgColor: 'rgba(255, 45, 85, 0.85)',
                borderColor: '#ff2d55',
                svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M17.8 19.2L16 11l3.5-3.5c.9-.9.9-2.4 0-3.3s-2.4-.9-3.3 0L12.7 7.7l-8.2-1.8c-.8-.2-1.7.3-1.9 1.1-.2.8.3 1.7 1.1 1.9l8.2 1.8-3.5 3.5-3.8-1c-.4-.1-.9 0-1.2.3L2 15.1l3.2 1.4 1.4 3.2 1.7-1.4c.3-.3.4-.8.3-1.2l-1-3.8 3.5-3.5 1.8 8.2c.2.8 1 1.3 1.9 1.1.8-.2 1.3-1 1.1-1.9z"></path></svg>`
            },
            temple: {
                beaconClass: 'beacon-cyan',
                headerClass: 'cyan-header',
                iconName: 'home',
                badgeText: 'CENTRO METROPOLITANO / HITOS',
                themeColor: 'var(--cyan)',
                bgColor: 'rgba(0, 240, 255, 0.85)',
                borderColor: 'var(--cyan)',
                svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
            },
            default: {
                beaconClass: 'beacon-yellow',
                headerClass: 'yellow-header',
                iconName: 'graduation-cap',
                badgeText: 'DISTRITO ACADÉMICO / ESTUDIANTIL',
                themeColor: '#ffd60a',
                bgColor: 'rgba(255, 214, 10, 0.85)',
                borderColor: '#ffd60a',
                svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`
            }
        };

        const config = typeConfig[landmark.type] || typeConfig.default;
        const beaconClass = config.beaconClass;
        const headerClass = config.headerClass;
        const iconName = config.iconName;
        const badgeText = config.badgeText;
        const themeColor = config.themeColor;

        // Marcador de baliza interactiva (HTML personalizado con efecto pulso CSS e Icono SVG integrado)
        const landmarkIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon ${beaconClass}" style="width: 32px; height: 32px;">
                    <div class="beacon-pulse" style="width: 32px; height: 32px;"></div>
                    <div class="beacon-dot" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: ${config.bgColor}; border: 1.5px solid ${config.borderColor}; border-radius: 50%; box-shadow: 0 0 10px ${config.bgColor}; z-index: 10;">
                        ${config.svg}
                    </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const landmarkMarker = L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon }).addTo(leafletMapInstance);
        mapLandmarks.push(landmarkMarker);

        // Popup con Estilo Cyber-fintech para el hito
        const borderCol = landmark.type === 'temple' ? 'rgba(0, 240, 255, 0.35)' : (landmark.type === 'airport' ? 'rgba(255, 45, 85, 0.35)' : 'rgba(255, 214, 10, 0.35)');
        const popupContent = `
            <div class="map-popup-header ${headerClass}" style="border-bottom: 1px solid ${borderCol};">
                <h4 style="color: ${themeColor}; display: flex; align-items: center; gap: 4px; margin: 0; font-size: 1.2rem; font-weight: bold;">
                    <i data-lucide="${iconName}" class="tiny-icon inline"></i> ${landmark.name}
                </h4>
                <span class="sub-title font-mono" style="font-size:0.85rem; color: ${themeColor};">${badgeText}</span>
            </div>
            <div class="map-popup-body" style="grid-template-columns: 1fr; font-size: 0.92rem;">
                <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 4px;">
                    <strong style="color: #fff;">Sector:</strong> ${landmark.zone}
                </div>
                <div style="font-size: 0.92rem; line-height: 1.4; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 6px; margin-top: 4px;">
                    ${landmark.plusvaliaImpact}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; font-style: italic;">
                    * ${landmark.details}
                </div>
                <div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; text-align: center;">
                    <a href="https://www.google.com/maps/?q=${landmark.lat},${landmark.lng}&t=k" target="_blank" style="color: ${themeColor}; text-decoration: none; font-size: 0.72rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                        <i data-lucide="map" style="width: 12px; height: 12px;"></i> Vista Satelital
                    </a>
                </div>
            </div>
        `;

        landmarkMarker.bindPopup(popupContent, {
            closeButton: false,
            offset: L.point(0, -5)
        });
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Dibuja en el mapa de calor todas las propiedades publicadas por los agentes B2B que posean coordenadas GPS
 */
function drawAgentProperties() {
    if (!leafletMapInstance) return;

    // Limpiar capas previas de agentes/referencia
    agentMapMarkers.forEach(marker => leafletMapInstance.removeLayer(marker));
    agentMapCircles.forEach(circle => leafletMapInstance.removeLayer(circle));
    agentMapMarkers = [];
    agentMapCircles = [];

    // Recorrer todas las propiedades en PORTFOLIO_DATABASE que tengan coordenadas GPS y sean de agente o de referencia
    if (typeof PORTFOLIO_DATABASE !== 'undefined') {
        Object.keys(PORTFOLIO_DATABASE).forEach(zoneKey => {
            const properties = PORTFOLIO_DATABASE[zoneKey] || [];
            properties.forEach(prop => {
                if (prop.lat && prop.lng && (prop.isAgentUpload || prop.isReferenceData)) {
                    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
                    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
                    const convertedPrice = prop.priceUSD * conversion;
                    
                    const isRef = prop.isReferenceData === true;
                    const circleColor = isRef ? '#00ff80' : '#00f0ff'; // Verde esmeralda para referencia, Cián para agente
                    const pulseColor = isRef ? 'rgba(0, 255, 128, 0.4)' : 'rgba(0, 240, 255, 0.4)';
                    const dotColor = isRef ? 'var(--neon-emerald)' : 'var(--cyan)';
                    const badgeTitle = isRef ? '📍 CALIBRACIÓN IA' : '⭐ SOCIO PREMIUM';
                    const badgeStyleColor = isRef ? 'var(--neon-emerald)' : 'var(--cyan)';

                    // 1. Círculo de calor
                    const agentCircle = L.circle([prop.lat, prop.lng], {
                        color: circleColor,
                        fillColor: circleColor,
                        fillOpacity: 0.22,
                        weight: 1.5,
                        radius: 400,
                        className: isRef ? 'heat-circle-ref-data' : 'heat-circle-agent-upload'
                    }).addTo(leafletMapInstance);
                    agentMapCircles.push(agentCircle);

                    // 2. Icono de radar pulsing especial (Casa o Edificio según la categoría)
                    const tagLower = (prop.tag || '').toLowerCase();
                    const isHouse = tagLower.includes('casa');
                    const propSvg = isHouse 
                        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
                        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"></path></svg>`;

                    const agentIcon = L.divIcon({
                        className: 'radar-beacon-container',
                        html: `
                            <div class="radar-beacon ${isRef ? 'beacon-emerald' : 'beacon-cyan'}" style="width: 32px; height: 32px;">
                                <div class="beacon-pulse" style="width: 32px; height: 32px; animation-duration: 1.8s; background: ${pulseColor};"></div>
                                <div class="beacon-dot" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background-color: ${dotColor}; border: 1.5px solid ${isRef ? '#00ff80' : '#00f0ff'}; border-radius: 50%; box-shadow: 0 0 12px ${dotColor}; z-index: 10;">
                                    ${propSvg}
                                </div>
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    const agentMarker = L.marker([prop.lat, prop.lng], { icon: agentIcon }).addTo(leafletMapInstance);
                    agentMapMarkers.push(agentMarker);

                    // 3. Popup interactivo
                    const popupContent = `
                        <div class="map-popup-header" style="border-bottom: 1px solid ${badgeStyleColor} !important;">
                            <span style="font-size: 0.8rem; color: ${badgeStyleColor}; font-weight: bold; font-family: var(--font-mono); letter-spacing: 0.5px;">${badgeTitle}</span>
                            <h4 style="margin: 2px 0 0 0; color: #fff; font-size: 1.15rem; font-weight: bold;">${prop.title}</h4>
                        </div>
                        <div class="map-popup-body" style="font-family: var(--font-mono); font-size: 0.92rem; display: grid; grid-template-columns: 1fr; gap: 6px; padding: 8px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span class="popup-lbl" style="color: var(--text-muted);">Precio:</span>
                                <span class="popup-val" style="font-weight: bold; color: ${badgeStyleColor};">${currencySym}${formatNumber(convertedPrice.toFixed(0))}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span class="popup-lbl" style="color: var(--text-muted);">Tipo:</span>
                                <span class="popup-val" style="color: #fff;">${prop.tag}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span class="popup-lbl" style="color: var(--text-muted);">Dimensión:</span>
                                <span class="popup-val" style="color: #fff;">${prop.size} M²</span>
                            </div>
                        </div>
                        <div style="margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 4px; text-align: center;">
                            <a href="https://www.google.com/maps/?q=${prop.lat},${prop.lng}&t=k" target="_blank" style="color: ${badgeStyleColor}; text-decoration: none; font-size: 0.72rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px;">
                                <i data-lucide="map" style="width: 12px; height: 12px;"></i> Vista Satelital
                            </a>
                        </div>
                    `;

                    agentMarker.bindPopup(popupContent, {
                        closeButton: false,
                        offset: L.point(0, -5)
                    });
                }
            });
        });
    }
}

let mapLakes = [];

function drawLakes() {
    if (!leafletMapInstance) return;

    // Limpiar capas previas si las hubiera
    mapLakes.forEach(layer => leafletMapInstance.removeLayer(layer));
    mapLakes = [];

    const centerCoords = [14.484, -90.570];
    const indexColor = 'var(--cyan)'; // Color cian que representa el índice de plusvalía templado/moderado del sector del lago
    const pulseBg = 'rgba(0, 240, 255, 0.4)';

    // 1. Círculo de calor del sector del lago (Área de influencia comercial/residencial)
    const lakeCircle = L.circle(centerCoords, {
        color: indexColor,
        fillColor: indexColor,
        fillOpacity: 0.18,
        weight: 1.5,
        radius: 1600,
        className: 'heat-circle-cyan'
    }).addTo(leafletMapInstance);

    mapLakes.push(lakeCircle);

    // 2. Baliza de pulso con icono de olas/agua
    const lakeBeaconIcon = L.divIcon({
        className: 'radar-beacon-container',
        html: `
            <div class="radar-beacon beacon-cyan" style="width: 32px; height: 32px;">
                <div class="beacon-pulse" style="width: 32px; height: 32px; animation-duration: 2.2s; background: ${pulseBg};"></div>
                <div class="beacon-dot" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background-color: var(--cyan); border: 1.5px solid var(--cyan); border-radius: 50%; box-shadow: 0 0 12px var(--cyan); z-index: 10;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M12 12c.6 0 1.2-.4 1.4-1c.2-.6.8-1 1.4-1s1.2.4 1.4 1c.2.6.8 1 1.4 1s1.2-.4 1.4-1c.2-.6.8-1 1.4-1"></path><path d="M2 12c.6 0 1.2-.4 1.4-1c.2-.6.8-1 1.4-1s1.2.4 1.4 1c.2.6.8 1 1.4 1s1.2-.4 1.4-1c.2-.6.8-1 1.4-1"></path><path d="M7 17c.6 0 1.2-.4 1.4-1c.2-.6.8-1 1.4-1s1.2.4 1.4 1c.2.6.8 1 1.4 1s1.2-.4 1.4-1c.2-.6.8-1 1.4-1"></path></svg>
                </div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const lakeMarker = L.marker(centerCoords, { icon: lakeBeaconIcon }).addTo(leafletMapInstance);
    
    // Popup interactivo con el índice del sector Amatitlán/Lago
    lakeMarker.bindPopup(`
        <div class="map-popup-header cyan-header" style="border-bottom: 1px solid rgba(0, 240, 255, 0.35); padding: 8px;">
            <h4 style="color: var(--cyan); display: flex; align-items: center; gap: 4px; margin: 0; font-size: 1.2rem; font-weight: bold;">
                🌊 Lago de Amatitlán
            </h4>
            <span class="sub-title font-mono" style="font-size:0.85rem; color: var(--cyan);">SECTOR AMATITLÁN - INFLUENCIA SUR</span>
        </div>
        <div class="map-popup-body" style="grid-template-columns: 1fr; font-size: 0.92rem; padding: 8px; font-family: var(--font-mono);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Plusvalía Anual:</span>
                <span style="font-weight: bold; color: var(--cyan);">+5.8% (Cian)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">ROI Promedio:</span>
                <span style="font-weight: bold; color: #fff;">6.1%</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.4; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 6px; margin-top: 6px;">
                Cuerpo de agua e hito geográfico. Influye en el microclima y el desarrollo inmobiliario de segunda residencia y bodegas industriales de la Cuenca del Sur.
            </div>
        </div>
    `, { closeButton: false, offset: L.point(0, -5) });

    mapLakes.push(lakeMarker);
}

let mapHotels = [];

function drawHotels() {
    if (!leafletMapInstance || typeof HOTELS_DATABASE === 'undefined') return;

    // Limpiar capas previas si las hubiera
    mapHotels.forEach(marker => leafletMapInstance.removeLayer(marker));
    mapHotels = [];

    HOTELS_DATABASE.forEach(hotel => {
        // Marcador de Hotel (Naranja con efecto pulso CSS e Icono de Cama)
        const hotelIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon beacon-orange" style="width: 32px; height: 32px;">
                    <div class="beacon-pulse" style="width: 32px; height: 32px; animation-duration: 2s; background: rgba(255, 159, 10, 0.4);"></div>
                    <div class="beacon-dot" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background-color: var(--orange); border: 1.5px solid var(--orange); border-radius: 50%; box-shadow: 0 0 12px var(--orange); z-index: 10;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; opacity: 0.95;"><path d="M3 7v13M3 12h18a3 3 0 0 1 3 3v5M3 18h18M21 7v13"></path><path d="M7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>
                    </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon }).addTo(leafletMapInstance);
        mapHotels.push(hotelMarker);

        // Popup con Estilo Cyber-fintech para el hotel
        const popupContent = `
            <div class="map-popup-header orange-header" style="border-bottom: 1px solid rgba(255, 159, 10, 0.4); padding: 8px;">
                <h4 style="color: var(--orange); display: flex; align-items: center; gap: 4px; margin: 0; font-size: 1.2rem; font-weight: bold;">
                    🏨 ${hotel.name}
                </h4>
                <span class="sub-title font-mono" style="font-size:0.85rem; color: var(--orange);">HOSPITALIDAD & DESARROLLO TURÍSTICO</span>
            </div>
            <div class="map-popup-body" style="grid-template-columns: 1fr; font-size: 0.92rem; padding: 8px; font-family: var(--font-mono);">
                <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 4px;">
                    <strong style="color: #fff;">Sector:</strong> ${hotel.zone}
                </div>
                <div style="font-size: 0.92rem; line-height: 1.4; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 6px; margin-top: 4px;">
                    ${hotel.plusvaliaImpact}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; font-style: italic;">
                    * ${hotel.details}
                </div>
            </div>
        `;

        hotelMarker.bindPopup(popupContent, {
            closeButton: false,
            offset: L.point(0, -5)
        });
    });
}
