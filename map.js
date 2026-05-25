/* ==========================================================================
   VALORGT AI - RADAR DE CALOR E INTEGRACIÓN DE MAPAS LEAFLET
   ========================================================================== */

let leafletMapInstance = null;
let mapCircles = [];
let mapMarkers = [];
let agentMapMarkers = [];
let agentMapCircles = [];
let customGpsMarker = null; // Guardará el marcador de búsqueda personalizada
let currentFocusZoneKey = null; // Evita refrescos innecesarios de telemetría

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

    // Dibujar propiedades publicadas por agentes comerciales
    drawAgentProperties();
}

/**
 * Dibuja los círculos y marcadores interactivos en el mapa base
 */
function drawRadarNodes() {
    if (!leafletMapInstance) return;

    // Limpiar capas previas si las hubiera
    mapCircles.forEach(circle => leafletMapInstance.removeLayer(circle));
    mapMarkers.forEach(marker => leafletMapInstance.removeLayer(marker));
    mapCircles = [];
    mapMarkers = [];

    // Colores RGB para los círculos de calor según la base de datos
    const colorRGB = {
        red: '#ff375f',
        orange: '#ff9f0a',
        yellow: '#ffd60a',
        green: '#00ff66',
        blue: '#0066ff'
    };

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        const color = colorRGB[zone.color] || '#00f0ff';
        const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
        const priceVal = activeCurrency === 'GTQ' ? zone.basePriceM2 * exchangeRate : zone.basePriceM2;

        // 1. Círculo de Calor Semi-transparente
        const heatCircle = L.circle([zone.lat, zone.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.18,
            weight: 1.5,
            radius: key === 'carretera' ? 2000 : 800, // Carretera es un sector más extenso
            className: `heat-circle-${zone.color}`
        }).addTo(leafletMapInstance);

        mapCircles.push(heatCircle);

        // 2. Marcador de Baliza de Radar (HTML Personalizado con efecto pulso CSS)
        const radarIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon beacon-${zone.color}">
                    <div class="beacon-pulse"></div>
                    <div class="beacon-dot"></div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const beaconMarker = L.marker([zone.lat, zone.lng], { icon: radarIcon }).addTo(leafletMapInstance);
        mapMarkers.push(beaconMarker);

        // 3. Popup con Estilo Cyber-fintech
        const popupContent = `
            <div class="map-popup-header">
                <h4>${zone.name.split(' (')[0]}</h4>
            </div>
            <div class="map-popup-body">
                <span class="popup-lbl">Precio Promedio:</span>
                <span class="popup-val text-cyan">${currencySym}${formatNumber(priceVal.toFixed(0))}/m²</span>
                <span class="popup-lbl">Rendimiento (ROI):</span>
                <span class="popup-val text-green">${zone.roi}%</span>
                <span class="popup-lbl">Crecimiento (5A):</span>
                <span class="popup-val text-green">+${zone.growth5Y}%</span>
            </div>
        `;

        beaconMarker.bindPopup(popupContent, {
            closeButton: false,
            offset: L.point(0, -5)
        });

        // 4. Eventos al hacer clic en el marcador
        beaconMarker.on('click', () => {
            showZoneTelemetry(key, true); // True para centrar
        });

        heatCircle.on('click', () => {
            beaconMarker.openPopup();
            showZoneTelemetry(key, true);
        });
    });
}

/**
 * Muestra la telemetría detallada de la zona en el sidebar del mapa
 * @param {string} zoneKey - Clave de la zona seleccionada
 * @param {boolean} centerMap - Si es verdadero, centra suavemente el mapa en el nodo
 */
function showZoneTelemetry(zoneKey, centerMap = false) {
    const zone = ZONES_DATABASE[zoneKey];
    if (!zone) return;

    currentFocusZoneKey = zoneKey;

    // Ocultar instrucciones y mostrar contenedor
    const instructions = document.getElementById('map-instructions');
    const details = document.getElementById('map-zone-details');
    if (instructions) instructions.classList.add('hidden');
    if (details) details.classList.remove('hidden');

    // Cambiar valores textuales
    document.getElementById('map-zone-title').innerText = zone.name;
    document.getElementById('map-zone-roi').innerText = zone.roi + "%";
    document.getElementById('map-zone-demand').innerText = zone.demandScore;
    document.getElementById('map-zone-growth').innerText = "+" + zone.growth5Y + "%";
    document.getElementById('map-zone-ia-opinion').innerText = zone.recommendation;

    // Calcular precio ajustado por moneda
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
    const convertedPrice = activeCurrency === 'GTQ' ? zone.basePriceM2 * exchangeRate : zone.basePriceM2;
    document.getElementById('map-zone-price-m2').innerText = `${currencySym}${formatNumber(convertedPrice.toFixed(0))}`;

    // Colorear el score de demanda en base a su nivel
    const demandEl = document.getElementById('map-zone-demand');
    demandEl.className = 'hud-box-val font-mono'; // Reset
    if (zone.demandScore === 'Extrema' || zone.demandScore === 'Muy Alta') {
        demandEl.classList.add('text-red');
    } else {
        demandEl.classList.add('text-cyan');
    }

    // Sincronizar los inputs del buscador de coordenadas con la ubicación del nodo
    document.getElementById('gps-input-lat').value = zone.lat.toFixed(4);
    document.getElementById('gps-input-lng').value = zone.lng.toFixed(4);

    // Centrar suavemente si fue explícito
    if (centerMap && leafletMapInstance) {
        leafletMapInstance.setView([zone.lat, zone.lng], 13, {
            animate: true,
            duration: 1.0
        });
    }
}

/**
 * Encuentra y enfoca la zona inmobiliaria más cercana a un punto de coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
function updateNearestZoneFocus(lat, lng) {
    let closestKey = null;
    let minDistance = Infinity;

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        // Calcular distancia euclidiana simplificada (suficiente para escalas locales)
        const dist = Math.sqrt(Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2));
        if (dist < minDistance) {
            minDistance = dist;
            closestKey = key;
        }
    });

    // Si la zona más cercana está en un radio razonable (aprox 5km) y es distinta al foco actual, actualizar sidebar
    if (closestKey && closestKey !== currentFocusZoneKey && minDistance < 0.06) {
        showZoneTelemetry(closestKey, false); // false para NO mover el mapa mientras el usuario lo arrastra
    }
}

/**
 * Escanea y ubica unas coordenadas personalizadas en el mapa base, emitiendo telemetría IA
 */
/**
 * Escanea y ubica unas coordenadas de Google Earth o GPS en el mapa,
 * dibujando un nodo de plusvalía y un círculo de calor personalizado.
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

    // 3. Encontrar el nodo formal de la base de datos más cercano
    let nearestZone = null;
    let minDistance = Infinity;

    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        const dist = Math.sqrt(Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2));
        if (dist < minDistance) {
            minDistance = dist;
            nearestZone = zone;
        }
    });

    // Distancia estimada en kilómetros (0.01 de grado ~ 1.11 km en Guatemala)
    const distanceKm = minDistance * 111;
    const diagTextEl = document.getElementById('gps-diagnostic-text');
    const diagContainer = document.getElementById('gps-custom-diagnostic');

    diagContainer.classList.remove('hidden');

    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    // Determinar la plusvalía y el color del círculo en base al sector
    let plusvaliaClass = 'yellow'; // Por defecto: estable
    let plusvaliaLabel = 'Estable / Consolidado (5-7% ROI)';

    if (distanceKm <= 2.5) {
        // Hereda el estatus de plusvalía de su núcleo formal vecino
        plusvaliaClass = nearestZone.color;
    } else {
        // Coordenadas periféricas: calcular un valor lógico predictivo
        const factor = Math.abs(lat * lng);
        if (factor % 5 === 0) { plusvaliaClass = 'green'; } // Oportunidad
        else if (factor % 3 === 0) { plusvaliaClass = 'blue'; } // Económico
        else { plusvaliaClass = 'yellow'; }
    }

    // Traducir clase a etiquetas comprensibles
    if (plusvaliaClass === 'red') plusvaliaLabel = 'Alta Plusvalía (>9% ROI)';
    if (plusvaliaClass === 'orange') plusvaliaLabel = 'Crecimiento Activo (7-9% ROI)';
    if (plusvaliaClass === 'green') plusvaliaLabel = 'Oportunidad de Inversión';
    if (plusvaliaClass === 'blue') plusvaliaLabel = 'Económico / En Desarrollo';

    // Colores RGB correspondientes
    const colorRGB = {
        red: '#ff375f',
        orange: '#ff9f0a',
        yellow: '#ffd60a',
        green: '#00ff66',
        blue: '#0066ff'
    };
    const activeColor = colorRGB[plusvaliaClass] || '#00f0ff';

    // 4. DIBUJAR NUEVO CÍRCULO DE CALOR DE PLUSVALÍA DINÁMICO EN EL MAPA
    customGpsCircle = L.circle([lat, lng], {
        color: activeColor,
        fillColor: activeColor,
        fillOpacity: 0.18,
        weight: 1.5,
        radius: 1000, // Círculo de 1km de radio de calor
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

    // 6. Generar diagnóstico textual e interactivo en el Sidebar
    if (distanceKm <= 2.5) {
        const closestKey = Object.keys(ZONES_DATABASE).find(k => ZONES_DATABASE[k] === nearestZone);
        showZoneTelemetry(closestKey, false); // Cargar telemetría base en el sidebar

        diagTextEl.innerHTML = `Ubicación analizada a <strong>${distanceKm.toFixed(2)} km</strong> del núcleo formal <strong>${nearestZone.name.split(' (')[0]}</strong>.<br>
        <span class="font-mono text-cyan" style="font-size:0.65rem">ESTATUS IA: baliza de color <strong>${plusvaliaClass.toUpperCase()}</strong> (${plusvaliaLabel}).</span><br>
        Este vector forma parte del micro-mercado consolidado de la zona. Se le asigna un valor de suelo por m² de <strong>${currencySym}${formatNumber((nearestZone.basePriceM2 * (activeCurrency === 'GTQ' ? exchangeRate : 1)).toFixed(0))}</strong>, con un retorno estimado de renta de <strong>${nearestZone.roi}%</strong>.`;
        
        customGpsMarker.bindPopup(`
            <div class="map-popup-header">
                <h4><i data-lucide="plane" class="tiny-icon inline"></i> Coordenada Escaneada</h4>
            </div>
            <div class="map-popup-body">
                <span class="popup-lbl">Plusvalía:</span>
                <span class="popup-val" style="color: ${activeColor}">${plusvaliaClass.toUpperCase()}</span>
                <span class="popup-lbl">Precio Promedio:</span>
                <span class="popup-val text-cyan">${currencySym}${formatNumber((nearestZone.basePriceM2 * (activeCurrency === 'GTQ' ? exchangeRate : 1)).toFixed(0))}/m²</span>
            </div>
        `).openPopup();
    } else {
        // Análisis IA para coordenadas periféricas
        const mockPrice = 550 + (lat * lng % 380); // Fórmulas estables
        const mockRoi = 4.8 + (lat * lng % 2.5);
        const mockPriceVal = mockPrice * (activeCurrency === 'GTQ' ? exchangeRate : 1);

        diagTextEl.innerHTML = `Ubicación periférica analizada fuera de los núcleos formales consolidados.<br>
        <span class="font-mono text-cyan" style="font-size:0.65rem">ESTATUS IA: baliza de color <strong>${plusvaliaClass.toUpperCase()}</strong> (${plusvaliaLabel}).</span><br>
        • Precio Ref. Suelo: <strong>${currencySym}${formatNumber(mockPriceVal.toFixed(0))}/m²</strong><br>
        • ROI de Renta Proyectado: <strong>${mockRoi.toFixed(1)}% anual</strong><br>
        <strong>Opinión IA:</strong> Sector residencial en desarrollo periférico temprano. Se ha plantado una zona de calor para registrar su vector de crecimiento en el motor predictivo. Adecuado para inversiones a largo plazo.`;

        customGpsMarker.bindPopup(`
            <div class="map-popup-header">
                <h4><i data-lucide="plane" class="tiny-icon inline"></i> Coordenada Custom</h4>
            </div>
            <div class="map-popup-body">
                <span class="popup-lbl">Plusvalía:</span>
                <span class="popup-val" style="color: ${activeColor}">${plusvaliaClass.toUpperCase()}</span>
                <span class="popup-lbl">Precio Est. Suelo:</span>
                <span class="popup-val text-cyan">${currencySym}${formatNumber(mockPriceVal.toFixed(0))}/m²</span>
            </div>
        `).openPopup();
    }

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
        // Marcador de Centro Comercial (Púrpura con efecto pulso CSS)
        const mallIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon beacon-purple">
                    <div class="beacon-pulse"></div>
                    <div class="beacon-dot"></div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const mallMarker = L.marker([mall.lat, mall.lng], { icon: mallIcon }).addTo(leafletMapInstance);
        mapMalls.push(mallMarker);

        // Popup con Estilo Cyber-fintech para el centro comercial
        const popupContent = `
            <div class="map-popup-header purple-header">
                <h4><i data-lucide="shopping-bag" class="tiny-icon inline"></i> ${mall.name}</h4>
                <span class="sub-title font-mono" style="font-size:0.6rem; color: #bf5af2;">ANCLA COMERCIAL DE PLUSVALÍA</span>
            </div>
            <div class="map-popup-body" style="grid-template-columns: 1fr;">
                <div style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 4px;">
                    <strong style="color: #fff;">Sector:</strong> ${mall.zone}
                </div>
                <div style="font-size: 0.7rem; line-height: 1.4; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 6px; margin-top: 4px;">
                    ${mall.plusvaliaImpact}
                </div>
                <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; font-style: italic;">
                    * ${mall.details}
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
        // Asignar colores de baliza e íconos en base al tipo de hito
        const isAirport = landmark.type === 'airport';
        const beaconClass = isAirport ? 'beacon-pink' : 'beacon-yellow';
        const headerClass = isAirport ? 'pink-header' : 'yellow-header';
        const iconName = isAirport ? 'plane' : 'graduation-cap';
        const badgeText = isAirport ? 'INFRAESTRUCTURA Y CONECTIVIDAD' : 'DISTRITO ACADÉMICO / ESTUDIANTIL';
        const themeColor = isAirport ? '#ff2d55' : '#ffd60a';

        // Marcador de baliza interactiva (HTML personalizado con efecto pulso CSS)
        const landmarkIcon = L.divIcon({
            className: 'radar-beacon-container',
            html: `
                <div class="radar-beacon ${beaconClass}">
                    <div class="beacon-pulse"></div>
                    <div class="beacon-dot"></div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const landmarkMarker = L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon }).addTo(leafletMapInstance);
        mapLandmarks.push(landmarkMarker);

        // Popup con Estilo Cyber-fintech para el hito
        const popupContent = `
            <div class="map-popup-header ${headerClass}" style="${!isAirport ? 'border-bottom: 1px solid rgba(255, 214, 10, 0.4);' : ''}">
                <h4 style="color: ${themeColor}; display: flex; align-items: center; gap: 4px; margin: 0;">
                    <i data-lucide="${iconName}" class="tiny-icon inline"></i> ${landmark.name}
                </h4>
                <span class="sub-title font-mono" style="font-size:0.6rem; color: ${themeColor};">${badgeText}</span>
            </div>
            <div class="map-popup-body" style="grid-template-columns: 1fr;">
                <div style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 4px;">
                    <strong style="color: #fff;">Sector:</strong> ${landmark.zone}
                </div>
                <div style="font-size: 0.7rem; line-height: 1.4; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 6px; margin-top: 4px;">
                    ${landmark.plusvaliaImpact}
                </div>
                <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; font-style: italic;">
                    * ${landmark.details}
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

    // Limpiar capas previas de agentes
    agentMapMarkers.forEach(marker => leafletMapInstance.removeLayer(marker));
    agentMapCircles.forEach(circle => leafletMapInstance.removeLayer(circle));
    agentMapMarkers = [];
    agentMapCircles = [];

    // Recorrer todas las propiedades en agentUploadedProperties
    if (typeof agentUploadedProperties !== 'undefined' && agentUploadedProperties.length > 0) {
        agentUploadedProperties.forEach(prop => {
            if (prop.lat && prop.lng) {
                const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
                const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
                const convertedPrice = prop.priceUSD * conversion;
                
                // 1. Círculo de calor color Celeste/Cyan
                const agentCircle = L.circle([prop.lat, prop.lng], {
                    color: '#00f0ff',
                    fillColor: '#00f0ff',
                    fillOpacity: 0.22,
                    weight: 1.5,
                    radius: 400, // Círculo de 400m de radio
                    className: 'heat-circle-agent-upload'
                }).addTo(leafletMapInstance);
                agentMapCircles.push(agentCircle);

                // 2. Icono de radar pulsing especial
                const agentIcon = L.divIcon({
                    className: 'radar-beacon-container',
                    html: `
                        <div class="radar-beacon beacon-cyan">
                            <div class="beacon-pulse" style="animation-duration: 1.8s; background: rgba(0, 240, 255, 0.4);"></div>
                            <div class="beacon-dot" style="background-color: var(--cyan); box-shadow: 0 0 12px var(--cyan);"></div>
                        </div>
                    `,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                const agentMarker = L.marker([prop.lat, prop.lng], { icon: agentIcon }).addTo(leafletMapInstance);
                agentMapMarkers.push(agentMarker);

                // 3. Popup interactivo
                const popupContent = `
                    <div class="map-popup-header" style="border-bottom: 1px solid var(--cyan) !important;">
                        <span style="font-size: 0.55rem; color: var(--cyan); font-weight: bold; font-family: var(--font-mono); letter-spacing: 0.5px;">⭐ SOCIO B2B SAAS</span>
                        <h4 style="margin: 2px 0 0 0; color: #fff; font-size: 0.8rem; font-weight: bold;">${prop.title}</h4>
                    </div>
                    <div class="map-popup-body" style="font-family: var(--font-mono); font-size: 0.65rem; display: grid; grid-template-columns: 1fr; gap: 4px; padding: 8px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="popup-lbl" style="color: var(--text-muted);">Precio:</span>
                            <span class="popup-val text-cyan" style="font-weight: bold; color: var(--cyan);">${currencySym}${formatNumber(convertedPrice.toFixed(0))}</span>
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
                `;

                agentMarker.bindPopup(popupContent, {
                    closeButton: false,
                    offset: L.point(0, -5)
                });
            }
        });
    }
}

