/* ==========================================================================
   VALORGT AI - BASE DE DATOS Y TELEMETRÍAS MOCK (GUATEMALA SECTOR)
   ========================================================================== */

const ZONES_DATABASE = {
    zona10: {
        name: "Zona 10 (Zona Viva / Reforma)",
        basePriceM2: 1850, // USD
        roi: 8.2, // % anual de rentabilidad de renta
        growth5Y: 36, // % de plusvalía acumulada en 5 años
        demandScore: "Muy Alta",
        liquidityIndex: "9.2/10",
        lat: 14.5986,
        lng: -90.5085,
        color: "red", // Alta plusvalía
        categories: {
            apartamentos: { priceM2: 1850, roi: 8.2, liquidity: "9.2/10", growth: 7.2, rec: "MANTENER" },
            casas: { priceM2: 1650, roi: 6.5, liquidity: "7.8/10", growth: 5.5, rec: "COMPRAR" },
            oficinas: { priceM2: 1950, roi: 8.8, liquidity: "8.9/10", growth: 6.8, rec: "COMPRAR" },
            locales: { priceM2: 2300, roi: 9.5, liquidity: "9.1/10", growth: 8.0, rec: "COMPRAR" },
            terrenos: { priceM2: 1100, roi: 0.0, liquidity: "6.5/10", growth: 10.0, rec: "COMPRAR" },
            bodegas: { priceM2: 950, roi: 7.9, liquidity: "8.0/10", growth: 5.0, rec: "COMPRAR" }
        },
        advantages: [
            "Ubicación en el núcleo corporativo e industrial de la capital.",
            "Altísima demanda de ejecutivos y expatriados de embajadas y multinacionales.",
            "Excelente conectividad a centros comerciales premium, clínicas y restaurantes."
        ],
        risks: [
            "Niveles elevados de congestión vehicular en horas pico.",
            "Escasez de terrenos disponibles, lo que limita nuevos desarrollos horizontales.",
            "Costos elevados de mantenimiento y cuotas de condominio."
        ],
        recommendation: "MANTENER/ALQUILAR. Zona 10 ofrece uno de los retornos por alquiler más estables del país. La renta corporativa dolarizada amortiza rápidamente cualquier apalancamiento financiero."
    },
    zona14: {
        name: "Zona 14 (La Cañada / Américas)",
        basePriceM2: 2100, // USD
        roi: 7.5,
        growth5Y: 30,
        demandScore: "Alta",
        liquidityIndex: "8.5/10",
        lat: 14.5828,
        lng: -90.5147,
        color: "red",
        categories: {
            apartamentos: { priceM2: 2100, roi: 7.5, liquidity: "8.5/10", growth: 6.0, rec: "MANTENER" },
            casas: { priceM2: 2400, roi: 6.2, liquidity: "8.0/10", growth: 5.2, rec: "MANTENER" },
            oficinas: { priceM2: 2050, roi: 7.9, liquidity: "8.1/10", growth: 5.8, rec: "MANTENER" },
            locales: { priceM2: 2600, roi: 8.7, liquidity: "8.3/10", growth: 6.5, rec: "MANTENER" },
            terrenos: { priceM2: 1400, roi: 0.0, liquidity: "7.2/10", growth: 9.5, rec: "COMPRAR" },
            bodegas: { priceM2: 1100, roi: 7.2, liquidity: "7.0/10", growth: 4.8, rec: "MANTENER" }
        },
        advantages: [
            "Exclusividad residencial y alto estatus socioeconómico.",
            "Presencia de extensas áreas caminables como la Avenida Las Américas.",
            "Excelente seguridad del entorno y controles vecinales robustos."
        ],
        risks: [
            "Precios de entrada sumamente altos, lo que disminuye el ROI inmediato por alquiler.",
            "Regulación estricta de alturas y construcciones en sub-sectores específicos."
        ],
        recommendation: "MANTENER. Es la zona patrimonial más estable de Centroamérica. Ideal para preservar capital familiar de largo plazo frente a volatilidad de mercados financieros internacionales."
    },
    zona15: {
        name: "Zona 15 (Vista Hermosa I, II, III)",
        basePriceM2: 1950,
        roi: 7.8,
        growth5Y: 32,
        demandScore: "Muy Alta",
        liquidityIndex: "8.9/10",
        lat: 14.5956,
        lng: -90.4851,
        color: "orange", // Crecimiento
        categories: {
            apartamentos: { priceM2: 1950, roi: 7.8, liquidity: "8.9/10", growth: 6.4, rec: "COMPRAR" },
            casas: { priceM2: 1800, roi: 6.6, liquidity: "8.2/10", growth: 5.8, rec: "COMPRAR" },
            oficinas: { priceM2: 1850, roi: 7.5, liquidity: "8.0/10", growth: 6.0, rec: "COMPRAR" },
            locales: { priceM2: 2200, roi: 8.9, liquidity: "8.5/10", growth: 7.4, rec: "COMPRAR" },
            terrenos: { priceM2: 1250, roi: 0.0, liquidity: "6.8/10", growth: 9.0, rec: "COMPRAR" },
            bodegas: { priceM2: 980, roi: 7.0, liquidity: "7.2/10", growth: 4.5, rec: "MANTENER" }
        },
        advantages: [
            "Entorno residencial tranquilo pero sumamente céntrico.",
            "Acceso inmediato a prestigiosos colegios y universidades (UVALLE, URL).",
            "Fuerte desarrollo de proyectos de apartamentos de lujo."
        ],
        risks: [
            "Saturación de retornos viales en el Boulevard Vista Hermosa.",
            "Restricciones de suministro de agua potable en ciertos sectores del norte de la zona."
        ],
        recommendation: "COMPRAR / ALQUILAR. Excelente balance para familias jóvenes de alto perfil. La cercanía universitaria garantiza un pool constante de inquilinos de nivel medio-alto."
    },
    zona16: {
        name: "Zona 16 (Cayalá / Lomas de San Isidro)",
        basePriceM2: 1750,
        roi: 8.6,
        growth5Y: 42,
        demandScore: "Extrema",
        liquidityIndex: "9.5/10",
        lat: 14.6111,
        lng: -90.4725,
        color: "red",
        categories: {
            apartamentos: { priceM2: 1750, roi: 8.6, liquidity: "9.5/10", growth: 8.4, rec: "COMPRAR" },
            casas: { priceM2: 1950, roi: 7.4, liquidity: "9.0/10", growth: 7.8, rec: "COMPRAR" },
            oficinas: { priceM2: 1800, roi: 8.2, liquidity: "8.8/10", growth: 7.2, rec: "COMPRAR" },
            locales: { priceM2: 2400, roi: 9.3, liquidity: "9.2/10", growth: 8.8, rec: "COMPRAR" },
            terrenos: { priceM2: 1300, roi: 0.0, liquidity: "8.2/10", growth: 11.2, rec: "COMPRAR" },
            bodegas: { priceM2: 1150, roi: 8.0, liquidity: "8.4/10", growth: 6.0, rec: "COMPRAR" }
        },
        advantages: [
            "Planificación urbana avanzada estilo 'New Urbanism' alrededor de Ciudad Cayalá.",
            "Gran plusvalía traccionada por amenidades comerciales, cines, clubes y colegios premium.",
            "Amplias facilidades de seguridad e infraestructura vial dedicada."
        ],
        risks: [
            "Altos cobros de peaje indirecto y cuotas urbanas.",
            "Tránsito pesado en accesos clave (Paso a desnivel de Landívar y tramos residenciales)."
        ],
        recommendation: "COMPRAR. Zona 16 es el epicentro de la especulación inmobiliaria premium en Guatemala. Las preventas suelen revalorizarse hasta un 15% antes de su entrega física."
    },
    zona4: {
        name: "Zona 4 (Cantón Exposición / Tecnológico)",
        basePriceM2: 1600,
        roi: 9.1,
        growth5Y: 48,
        demandScore: "Muy Alta",
        liquidityIndex: "9.0/10",
        lat: 14.6203,
        lng: -90.5159,
        color: "green", // Oportunidad
        categories: {
            apartamentos: { priceM2: 1600, roi: 9.1, liquidity: "9.0/10", growth: 9.6, rec: "COMPRAR" },
            casas: { priceM2: 1350, roi: 6.8, liquidity: "7.2/10", growth: 6.5, rec: "COMPRAR" },
            oficinas: { priceM2: 1500, roi: 8.5, liquidity: "8.4/10", growth: 7.8, rec: "COMPRAR" },
            locales: { priceM2: 1950, roi: 9.8, liquidity: "9.2/10", growth: 10.2, rec: "COMPRAR" },
            terrenos: { priceM2: 980, roi: 0.0, liquidity: "8.0/10", growth: 12.5, rec: "COMPRAR" },
            bodegas: { priceM2: 1200, roi: 8.9, liquidity: "8.5/10", growth: 7.0, rec: "COMPRAR" }
        },
        advantages: [
            "Distrito cultural, gastronómico e innovador de la ciudad (Hub Tecnológico).",
            "Atracción de nómadas digitales y jóvenes profesionales que buscan 'Coliving'.",
            "Acceso directo a transporte público masivo (Transmetro) y ciclovías."
        ],
        risks: [
            "Persistencia de problemas de seguridad urbana en áreas colindantes.",
            "Ruido elevado debido a la intensa actividad comercial y de entretenimiento."
        ],
        recommendation: "COMPRAR/ALQUILAR (RECOMENDADO). El ROI más alto de la ciudad. Diseñar unidades de tamaño reducido (micro-apartamentos) enfocados en Airbnb o rentas temporales para optimizar el rendimiento."
    },
    carretera: {
        name: "Carretera a El Salvador (Km 10 - Km 17)",
        basePriceM2: 1100,
        roi: 6.8,
        growth5Y: 22,
        demandScore: "Media-Alta",
        liquidityIndex: "7.1/10",
        lat: 14.5501,
        lng: -90.4350,
        color: "blue", // Económico
        categories: {
            apartamentos: { priceM2: 1100, roi: 6.8, liquidity: "7.1/10", growth: 4.4, rec: "MANTENER" },
            casas: { priceM2: 950, roi: 6.2, liquidity: "6.8/10", growth: 3.8, rec: "ALQUILAR" },
            oficinas: { priceM2: 1050, roi: 7.0, liquidity: "6.5/10", growth: 4.0, rec: "MANTENER" },
            locales: { priceM2: 1350, roi: 7.8, liquidity: "7.2/10", growth: 5.2, rec: "COMPRAR" },
            terrenos: { priceM2: 650, roi: 0.0, liquidity: "5.8/10", growth: 7.0, rec: "VENDER" },
            bodegas: { priceM2: 820, roi: 6.5, liquidity: "6.9/10", growth: 3.5, rec: "MANTENER" }
        },
        advantages: [
            "Precios de terreno por metro cuadrado inferiores a la ciudad central.",
            "Clima templado, áreas arboladas y residencias horizontales amplias con jardín.",
            "Saturación de nuevos centros comerciales suburbanos y colegios bilingües."
        ],
        risks: [
            "Severo problema de tráfico en el único embudo vial de ingreso y salida.",
            "Vulnerabilidad ante eventos sísmicos y deslizamientos de taludes en temporadas de lluvia."
        ],
        recommendation: "ALQUILAR / VENDER. Para inversores individuales, la rotación de alquileres residenciales grandes es lenta. Es preferible liquidar inventario horizontal antiguo y migrar hacia apartamentos céntricos."
    },
    fraijanes: {
        name: "Fraijanes (Km 18 - Km 25, Condominios Premium)",
        basePriceM2: 1250,
        roi: 7.2,
        growth5Y: 28,
        demandScore: "Alta",
        liquidityIndex: "7.9/10",
        lat: 14.4633,
        lng: -90.4412,
        color: "orange", // Crecimiento
        categories: {
            apartamentos: { priceM2: 1200, roi: 7.2, liquidity: "7.9/10", growth: 5.6, rec: "COMPRAR" },
            casas: { priceM2: 1250, roi: 6.8, liquidity: "7.5/10", growth: 5.2, rec: "COMPRAR" },
            oficinas: { priceM2: 1150, roi: 7.0, liquidity: "7.0/10", growth: 4.8, rec: "MANTENER" },
            locales: { priceM2: 1450, roi: 8.0, liquidity: "7.8/10", growth: 6.0, rec: "COMPRAR" },
            terrenos: { priceM2: 750, roi: 0.0, liquidity: "6.5/10", growth: 8.0, rec: "COMPRAR" },
            bodegas: { priceM2: 880, roi: 6.9, liquidity: "7.2/10", growth: 4.2, rec: "MANTENER" }
        },
        advantages: [
            "Tierra residencial con costos por metro cuadrado muy competitivos.",
            "Clima de montaña templado y abundante vegetación, ideal para familias con mascotas.",
            "Rápido desarrollo de centros educativos de primer nivel y plazas comerciales de conveniencia."
        ],
        risks: [
            "Tránsito pesado durante horas pico en el embudo vial de Carretera a El Salvador.",
            "Dependencia absoluta de vehículos motorizados para movilización a centros de trabajo."
        ],
        recommendation: "COMPRAR. Fraijanes es una excelente opción de vivienda horizontal familiar estable. El desarrollo de plazas comerciales de conveniencia locales reduce la necesidad de viajar al núcleo diariamente."
    },
    mixco: {
        name: "Mixco (San Cristóbal / Zona 8 de Mixco)",
        basePriceM2: 1150,
        roi: 6.9,
        growth5Y: 24,
        demandScore: "Alta",
        liquidityIndex: "8.1/10",
        lat: 14.5985,
        lng: -90.5898,
        color: "yellow", // Estable
        categories: {
            apartamentos: { priceM2: 1050, roi: 6.9, liquidity: "8.1/10", growth: 4.8, rec: "MANTENER" },
            casas: { priceM2: 1150, roi: 6.5, liquidity: "7.9/10", growth: 4.5, rec: "MANTENER" },
            oficinas: { priceM2: 1100, roi: 7.2, liquidity: "7.5/10", growth: 4.2, rec: "MANTENER" },
            locales: { priceM2: 1400, roi: 8.2, liquidity: "8.0/10", growth: 5.5, rec: "COMPRAR" },
            terrenos: { priceM2: 700, roi: 0.0, liquidity: "7.0/10", growth: 7.5, rec: "COMPRAR" },
            bodegas: { priceM2: 920, roi: 7.4, liquidity: "7.8/10", growth: 4.0, rec: "MANTENER" }
        },
        advantages: [
            "Sector habitacional horizontal sumamente consolidado y autosuficiente.",
            "Múltiples accesos de salida hacia Calzada Roosevelt, Aguilar Batres y el Periférico.",
            "Excelente densidad de supermercados, gimnasios, clubes y plazas comerciales locales."
        ],
        risks: [
            "Tránsito vehicular denso en las conexiones con los puentes de acceso en horas pico.",
            "Restricciones estructurales en barrancos del Boulevard Principal en época lluviosa."
        ],
        recommendation: "MANTENER. San Cristóbal opera como una ciudad satélite muy robusta. Los alquileres residenciales tienen una demanda constante impulsada por familias locales de clase media."
    },
    antigua: {
        name: "Antigua Guatemala (Sacatepéquez)",
        basePriceM2: 2400,
        roi: 8.9,
        growth5Y: 38,
        demandScore: "Extrema",
        liquidityIndex: "8.7/10",
        lat: 14.5573,
        lng: -90.7332,
        color: "orange",
        categories: {
            apartamentos: { priceM2: 2300, roi: 8.9, liquidity: "8.7/10", growth: 7.6, rec: "ALQUILAR" },
            casas: { priceM2: 2400, roi: 8.2, liquidity: "8.5/10", growth: 7.2, rec: "ALQUILAR" },
            oficinas: { priceM2: 2100, roi: 7.5, liquidity: "7.8/10", growth: 6.2, rec: "MANTENER" },
            locales: { priceM2: 2800, roi: 9.5, liquidity: "9.0/10", growth: 9.0, rec: "COMPRAR" },
            terrenos: { priceM2: 1800, roi: 0.0, liquidity: "8.0/10", growth: 12.0, rec: "COMPRAR" },
            bodegas: { priceM2: 1300, roi: 7.0, liquidity: "7.2/10", growth: 5.0, rec: "MANTENER" }
        },
        advantages: [
            "Mercado turístico internacional e histórico con demanda en moneda extranjera.",
            "Patrimonio de la Humanidad por la UNESCO, lo que garantiza escasez perpetua de inventario.",
            "Preferido mundialmente para segundas viviendas de retiro y rentas vacacionales cortas."
        ],
        risks: [
            "Altísimas restricciones arquitectónicas y normativas de conservación (CNPAG).",
            "Mantenimiento costoso debido a la edad y naturaleza estructural de las propiedades coloniales."
        ],
        recommendation: "ALQUILAR (AIRBNB). El turismo internacional e interno empuja tarifas por noche sumamente rentables. Estilo colonial bien mantenido con conectividad Wi-Fi de alta velocidad es un activo generador de cashflow invaluable."
    }
};

const FINISHES_ADJUSTMENTS = {
    "Piso de madera de ingeniería / chapa de lujo": 0.05,
    "Cocina gourmet con isla y cuarzo premium": 0.07,
    "Mosaicos y grifería italiana / alemana": 0.04,
    "Domótica y automatización de luces Lutron/Control4": 0.06,
    "Ventanería de doble vidrio termoacústica europea": 0.04,
    "Deterioro visible en muros o pintura exterior": -0.06,
    "Grietas superficiales de asentamiento en tablayeso": -0.03,
    "Iluminación LED indirecta integrada en cielos": 0.03,
    "Acabados modernos / Remodelación completa": 0.08,
    "Luminosidad natural óptima": 0.04
};

const SIMULATED_NEWS = [
    "IA predictiva reporta alza del 4.2% en solicitudes FHA en Banco Industrial para segundo semestre.",
    "Cayalá anuncia fase de expansión vertical corporativa; precios preventa tocan Q18,000 por metro cuadrado.",
    "Municipalidad de Guatemala autoriza incentivos tributarios para Edificios de Modelos Urbanos de Vivienda en Zona 4.",
    "Inversores institucionales europeos adquieren portafolio residencial multifamiliar en Zona 15 por $14.5M USD.",
    "Cámara de Construcción prevé incremento en costo del acero estructurado, empujando valores del m² vertical en 3.5%.",
    "Estudio de ValorGT AI detecta auge del 28% de inquilinos solteros buscando micro-apartamentos en Zona Viva.",
    "CNPAG aprueba nuevas pautas de restauración en Antigua Guatemala para fachadas residenciales de uso turístico.",
    "Fondo de Inversión Inmobiliaria local (FIDI) completa ronda de capitalización de Q120 millones para proyectos en Zona 16."
];

const PORTFOLIO_DATABASE = {
    zona10: [
        {
            title: "Loft Ejecutivo Design Center",
            tag: "APARTAMENTO TECNOLÓGICO",
            priceUSD: 222000,
            size: 120, rooms: 2, bathrooms: 2.0, parkings: 2, garden: 0, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-gym", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Penthouse Plaza República",
            tag: "PENTHOUSE PREMIUM",
            priceUSD: 444000,
            size: 240, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "LUJO EXTREMO"
        },
        {
            title: "Oficina Corporativa Geminis 10",
            tag: "OFICINA COMERCIAL",
            priceUSD: 148000,
            size: 80, rooms: 0, bathrooms: 1.0, parkings: 1, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona14.png",
            badge: "EXCELENTE ROI"
        },
        {
            title: "Residencia Premium Las Margaritas",
            tag: "CASA RESIDENCIAL",
            priceUSD: 555000,
            size: 300, rooms: 4, bathrooms: 4.5, parkings: 3, garden: 60, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym"],
            photo: "prop_zona16.png",
            badge: "PREMIUM"
        },
        {
            title: "Apartamento Boutique Zona Viva",
            tag: "APARTAMENTO BOUTIQUE",
            priceUSD: 310000,
            size: 160, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "IA SUGGESTED"
        },
        {
            title: "Bodega Industrial Las Margaritas",
            tag: "BODEGA EN RENTA",
            priceUSD: 4500,
            size: 450, rooms: 0, bathrooms: 2.0, parkings: 4, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona10.png",
            badge: "EXCELENTE RENTA",
            category: "Bodega",
            type: "Renta"
        },
        {
            title: "Terreno Premium Los Próceres",
            tag: "TERRENO EN VENTA",
            priceUSD: 950000,
            size: 1200, rooms: 0, bathrooms: 0, parkings: 0, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona16.png",
            badge: "ZONA PRIME",
            category: "Terreno",
            type: "Venta"
        }
    ],
    zona14: [
        {
            title: "Edificio Las Américas",
            tag: "APARTAMENTO PREMIUM",
            priceUSD: 385000,
            size: 180, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photo: "prop_zona14.png",
            badge: "RECOMENDADO",
            sponsored: true
        },
        {
            title: "Apartamento Premium La Cañada",
            tag: "APARTAMENTO DE LUJO",
            priceUSD: 525000,
            size: 250, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "LUJO EXCLUSIVO",
            sponsored: true
        },
        {
            title: "Villa Residencial Las Charcas",
            tag: "CASA FAMILIAR",
            priceUSD: 630000,
            size: 300, rooms: 4, bathrooms: 4.5, parkings: 3, garden: 80, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona16.png",
            badge: "EXCLUSIVA",
            sponsored: true
        },
        {
            title: "Penthouse Exclusivo Europlaza",
            tag: "PENTHOUSE VIP",
            priceUSD: 840000,
            size: 400, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "PATRIMONIAL",
            sponsored: true
        },
        {
            title: "Apartamento Exclusivo Américas",
            tag: "APARTAMENTO DE LUJO",
            priceUSD: 450000,
            size: 210, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photo: "prop_zona14.png",
            badge: "LUJO EXTREMO",
            sponsored: true
        },
        {
            title: "Bodega de Distribución Las Américas",
            tag: "BODEGA EN RENTA",
            priceUSD: 5200,
            size: 550, rooms: 0, bathrooms: 2.0, parkings: 5, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona14.png",
            badge: "LOGÍSTICA PRIME",
            category: "Bodega",
            type: "Renta"
        },
        {
            title: "Terreno Comercial Av. Las Américas",
            tag: "TERRENO EN VENTA",
            priceUSD: 1450000,
            size: 1800, rooms: 0, bathrooms: 0, parkings: 0, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "propiedad_demo.png",
            badge: "DESARROLLO VERTICAL",
            category: "Terreno",
            type: "Venta"
        }
    ],
    zona15: [
        {
            title: "Apartamento Vista Hermosa II",
            tag: "APARTAMENTO RESIDENCIAL",
            priceUSD: 273000,
            size: 140, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photo: "prop_zona14.png",
            badge: "RECOMENDADO"
        },
        {
            title: "Casa Familiar Vista Hermosa I",
            tag: "CASA RESIDENCIAL",
            priceUSD: 624000,
            size: 320, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photo: "prop_zona16.png",
            badge: "ALTA PLUSVALÍA"
        },
        {
            title: "Boutique Apartment VH III",
            tag: "APARTAMENTO BOUTIQUE",
            priceUSD: 351000,
            size: 180, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photo: "prop propiedad_demo.png",
            photo: "propiedad_demo.png",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Oficina Corporativa Multi-Médica",
            tag: "OFICINA CLÍNICA",
            priceUSD: 195000,
            size: 100, rooms: 0, bathrooms: 2.0, parkings: 2, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona10.png",
            badge: "SECTOR MÉDICO"
        },
        {
            title: "Loft VH IV Premium",
            tag: "LOFT EXCLUSIVO",
            priceUSD: 265000,
            size: 130, rooms: 2, bathrooms: 2.0, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "EXCELENTE ROI"
        },
        {
            title: "Bodega Logística Vista Hermosa",
            tag: "BODEGA EN RENTA",
            priceUSD: 3900,
            size: 400, rooms: 0, bathrooms: 2.0, parkings: 4, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona14.png",
            badge: "EXCELENTE UBICACIÓN",
            category: "Bodega",
            type: "Renta"
        },
        {
            title: "Terreno Comercial Vista Hermosa III",
            tag: "TERRENO EN VENTA",
            priceUSD: 850000,
            size: 1000, rooms: 0, bathrooms: 0, parkings: 0, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona16.png",
            badge: "ZONA PRIME",
            category: "Terreno",
            type: "Venta"
        }
    ],
    zona16: [
        {
            title: "Residencial Lomas de San Isidro",
            tag: "CASA DE LUJO",
            priceUSD: 650000,
            size: 350, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 120, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-smart"],
            photo: "prop_zona16.png",
            badge: "ALTA PLUSVALÍA"
        },
        {
            title: "Apartamento Acacias Cayalá",
            tag: "APARTAMENTO PREMIUM",
            priceUSD: 315000,
            size: 180, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photo: "prop_zona14.png",
            badge: "EXCELENTE ROI"
        },
        {
            title: "Casa Minimalista Jacarandas",
            tag: "CASA RESIDENCIAL",
            priceUSD: 560000,
            size: 320, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 90, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "MODERNA"
        },
        {
            title: "Penthouse Cardales de Cayalá",
            tag: "PENTHOUSE VIP",
            priceUSD: 490000,
            size: 280, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Apartamento Preventa Cayalá Z16",
            tag: "APARTAMENTO PREMIUM",
            priceUSD: 380000,
            size: 190, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photo: "prop_zona16.png",
            badge: "PREVENTA"
        },
        {
            title: "Complejo Bodegas San Isidro",
            tag: "BODEGA EN RENTA",
            priceUSD: 4800,
            size: 500, rooms: 0, bathrooms: 2.0, parkings: 6, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona10.png",
            badge: "ALTA SEGURIDAD",
            category: "Bodega",
            type: "Renta"
        },
        {
            title: "Terreno Residencial Jacarandas Cayalá",
            tag: "TERRENO EN VENTA",
            priceUSD: 620000,
            size: 800, rooms: 0, bathrooms: 0, parkings: 0, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "propiedad_demo.png",
            badge: "EXCLUSIVO CAYALÁ",
            category: "Terreno",
            type: "Venta"
        }
    ],
    zona4: [
        {
            title: "Loft Studio 4 Grados Norte",
            tag: "MICRO-APARTAMENTO",
            priceUSD: 128000,
            size: 80, rooms: 1, bathrooms: 1.0, parkings: 1, garden: 0, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "ALTO RENDIMIENTO"
        },
        {
            title: "Apartamento Coliving Cantón",
            tag: "APARTAMENTO COLIVING",
            priceUSD: 192000,
            size: 120, rooms: 2, bathrooms: 2.0, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photo: "prop_zona14.png",
            badge: "AIRBNB READY"
        },
        {
            title: "Local Comercial XPO1",
            tag: "LOCAL COMERCIAL",
            priceUSD: 160000,
            size: 100, rooms: 0, bathrooms: 1.5, parkings: 1, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "propiedad_demo.png",
            badge: "OPORTUNIDAD"
        },
        {
            title: "Oficina Tecnológica Granat",
            tag: "OFICINA CORPORATIVA",
            priceUSD: 240000,
            size: 150, rooms: 0, bathrooms: 2.0, parkings: 2, garden: 0, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-smart"],
            photo: "prop_zona16.png",
            badge: "INVERSOR"
        },
        {
            title: "Loft Exclusivo XPO1",
            tag: "MICRO-APARTAMENTO",
            priceUSD: 145000,
            size: 90, rooms: 1, bathrooms: 1.0, parkings: 1, garden: 0, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-rooftop", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "ALTO RENDIMIENTO"
        },
        {
            title: "Bodega Urbana Cantón Exposición",
            tag: "BODEGA EN RENTA",
            priceUSD: 2900,
            size: 300, rooms: 0, bathrooms: 1.5, parkings: 2, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona10.png",
            badge: "HUB LOGÍSTICO",
            category: "Bodega",
            type: "Renta"
        },
        {
            title: "Terreno de Oportunidad Zona 4",
            tag: "TERRENO EN VENTA",
            priceUSD: 540000,
            size: 600, rooms: 0, bathrooms: 0, parkings: 0, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photo: "prop_zona14.png",
            badge: "PARA DESARROLLADORES",
            category: "Terreno",
            type: "Venta"
        }
    ],
    carretera: [
        {
            title: "Casa en Encinos del Naranjo (Km 13)",
            tag: "CASA FAMILIAR",
            priceUSD: 275000,
            size: 250, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona16.png",
            badge: "EXCELENTE PRECIO"
        },
        {
            title: "Residencia Bosques de las Luces",
            tag: "CASA EN CONDOMINIO",
            priceUSD: 440000,
            size: 400, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 180, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool"],
            photo: "propiedad_demo.png",
            badge: "PREMIUM"
        },
        {
            title: "Apartamento Las Luces (Km 12)",
            tag: "APARTAMENTO SUBURBANO",
            priceUSD: 165000,
            size: 150, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photo: "prop_zona14.png",
            badge: "RECOMENDADO"
        },
        {
            title: "Casa Quinta Los Eucaliptos",
            tag: "CASA RESIDENCIAL",
            priceUSD: 385000,
            size: 350, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 150, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona10.png",
            badge: "ESTABLE"
        },
        {
            title: "Residencia Campestre Km 16",
            tag: "CASA CON JARDÍN",
            priceUSD: 320000,
            size: 290, rooms: 4, bathrooms: 4.5, parkings: 3, garden: 120, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "CLIMA TEMPLADO"
        }
    ],
    fraijanes: [
        {
            title: "Residencia Las Alturas Km 20",
            tag: "CASA FAMILIAR RESIDENCIAL",
            priceUSD: 375000,
            size: 300, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 140, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym"],
            photo: "propiedad_demo.png",
            badge: "CRECIMIENTO"
        },
        {
            title: "Casa de Campo El Cortijo",
            tag: "CASA QUINTA",
            priceUSD: 437500,
            size: 350, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 200, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photo: "prop_zona16.png",
            badge: "CLIMA MONTAÑA"
        },
        {
            title: "Townhouse Condominio Arrazola",
            tag: "CASA EN CONDOMINIO",
            priceUSD: 225000,
            size: 180, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 50, study: false, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona14.png",
            badge: "RECOMENDADO"
        },
        {
            title: "Residencia Premium Cañadas de Fraijanes",
            tag: "CASA RESIDENCIAL DE LUJO",
            priceUSD: 500000,
            size: 400, rooms: 5, bathrooms: 5.5, parkings: 4, garden: 160, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Casa en Bosque Fraijanes",
            tag: "CASA HORIZONTAL",
            priceUSD: 295000,
            size: 260, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona16.png",
            badge: "CRECIMIENTO"
        }
    ],
    mixco: [
        {
            title: "Casa en Condominio Pinares",
            tag: "CASA FAMILIAR",
            priceUSD: 287500,
            size: 250, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 80, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona16.png",
            badge: "SECTOR EXCLUSIVO"
        },
        {
            title: "Townhouse Boulevard Principal",
            tag: "CASA MODERNA",
            priceUSD: 207000,
            size: 180, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 40, study: false, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "prop_zona14.png",
            badge: "EXCELENTE PRECIO"
        },
        {
            title: "Apartamento Vista al Valle (San Cristóbal)",
            tag: "APARTAMENTO RESIDENCIAL",
            priceUSD: 138000,
            size: 120, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photo: "prop_zona10.png",
            badge: "VISTA AL VALLE"
        },
        {
            title: "Residencia Campo Verde",
            tag: "CASA GRANDE",
            priceUSD: 345000,
            size: 300, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "ESTABLE"
        },
        {
            title: "Casa Residencial Condado Naranjo",
            tag: "CASA RESIDENCIAL",
            priceUSD: 245000,
            size: 220, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 60, study: false, familyRoom: true,
            amenities: ["amenity-security"],
            photo: "propiedad_demo.png",
            badge: "RECOMENDADO"
        }
    ],
    antigua: [
        {
            title: "Residencial Santa Inés",
            tag: "VILLA COLONIAL",
            priceUSD: 980000,
            size: 420, rooms: 5, bathrooms: 5.5, parkings: 2, garden: 180, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photo: "prop_antigua.png",
            badge: "PATRIMONIAL"
        },
        {
            title: "Casa Ruinas del Rosario",
            tag: "CASA COLONIAL HISTÓRICA",
            priceUSD: 840000,
            size: 350, rooms: 4, bathrooms: 4.5, parkings: 2, garden: 120, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool", "amenity-smart"],
            photo: "propiedad_demo.png",
            badge: "LUJO COLONIAL"
        },
        {
            title: "Villa Colonial San Juan",
            tag: "VILLA DE DESCANSO",
            priceUSD: 576000,
            size: 240, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 150, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photo: "prop_zona16.png",
            badge: "AIRBNB READY"
        },
        {
            title: "Loft Histórico Arco de Santa Catalina",
            tag: "LOFT EXCLUSIVO COLONIAL",
            priceUSD: 432000,
            size: 180, rooms: 2, bathrooms: 2.0, parkings: 1, garden: 40, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-rooftop", "amenity-smart"],
            photo: "prop_zona10.png",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Casa Colonial con Jacuzzi",
            tag: "CASA HISTÓRICA AIRBNB",
            priceUSD: 720000,
            size: 280, rooms: 4, bathrooms: 4.5, parkings: 2, garden: 90, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photo: "prop_antigua.png",
            badge: "TOP AIRBNB"
        }
    ],
};

const MALLS_DATABASE = [
    {
        name: "Oakland Mall",
        zone: "Zona 10",
        lat: 14.5975,
        lng: -90.5065,
        plusvaliaImpact: "Ancla de alta gama. Eleva el valor de reventa en +15% para apartamentos y oficinas corporativas en un radio de 1.5 km, traccionando la consolidación de la Zona Viva.",
        details: "Centro comercial insignia de Spectrum con marcas globales exclusivas y áreas gastronómicas premium."
    },
    {
        name: "Ciudad Cayalá",
        zone: "Zona 16",
        lat: 14.6120,
        lng: -90.4705,
        plusvaliaImpact: "Mega-desarrollo urbano. Elevó el precio por metro cuadrado residencial en Zona 16 de $900 USD a más de $1,800 USD en menos de una década, siendo el principal motor especulativo de la zona.",
        details: "Ciudad planificada neourbanística con plazas, comercios de lujo, cines y áreas residenciales integradas."
    },
    {
        name: "Pradera Concepción",
        zone: "Carretera a El Salvador",
        lat: 14.5422,
        lng: -90.4285,
        plusvaliaImpact: "Eje suburbano primario. Consolida la demanda habitacional de Carretera a El Salvador y Fraijanes, incrementando el interés comercial y mitigando la necesidad de movilización diaria a la capital.",
        details: "Complejo comercial de gran escala que sirve como hub de conveniencia e infraestructura para el sector oriente."
    },
    {
        name: "Miraflores",
        zone: "Zona 11",
        lat: 14.6212,
        lng: -90.5495,
        plusvaliaImpact: "Eje de desarrollo Roosevelt. Catalizador de revalorización en Zona 11 y cercanías de Mixco. Impulsa la transición de industria horizontal antigua a macro-desarrollos verticales densos.",
        details: "Uno de los centros comerciales más visitados del país, conectado con el museo de arqueología Miraflores."
    },
    {
        name: "Naranjo Mall",
        zone: "Mixco",
        lat: 14.6415,
        lng: -90.5665,
        plusvaliaImpact: "Ancla de crecimiento norte. Detona el desarrollo inmobiliario de clase media-alta en Condado Naranjo y sectores de Mixco, elevando el valor del m² urbanizable en un +22% en 5 años.",
        details: "Punto de encuentro comercial e infraestructura vial dedicada para el área residencial planificada del Naranjo."
    },
    {
        name: "Plaza Fontabella",
        zone: "Zona 10",
        lat: 14.5992,
        lng: -90.5110,
        plusvaliaImpact: "Lifestyle premium. Aporta una prima de valor del +8% en hotelería de negocios y alquileres corporativos dolarizados circundantes gracias a su ambiente caminable de alta seguridad.",
        details: "Estilo arquitectónico colonial europeo con boutiques finas, cafés y entorno corporativo premium."
    }
];

const LANDMARKS_DATABASE = [
    {
        name: "Aeropuerto Internacional La Aurora",
        type: "airport",
        zone: "Zona 13",
        lat: 14.5828,
        lng: -90.5280,
        plusvaliaImpact: "Nodo logístico y comercial de Guatemala. Su proximidad genera una demanda constante de rentas vacacionales y corporativas de corta estancia (Airbnb) en zonas 9, 10 y 13. Adicionalmente, el cono de aproximación impone regulaciones estrictas de altura constructiva vertical.",
        details: "Principal terminal aérea de entrada al país, conectando a Guatemala con el tráfico global de pasajeros."
    },
    {
        name: "Campus Central USAC",
        type: "university",
        zone: "Zona 12",
        lat: 14.5885,
        lng: -90.5515,
        plusvaliaImpact: "Fuerza motriz estudiantil. Genera una densa demanda de alquileres económicos y de coste medio, pensiones y servicios en Zonas 12 y 11. Dinamiza intensamente el comercio en el eje de la Calzada Aguilar Batres.",
        details: "Única universidad estatal pública del país, centro de la vida académica de miles de estudiantes guatemaltecos."
    },
    {
        name: "Campus Vista Hermosa (Valle & Landívar)",
        type: "university",
        zone: "Zona 15",
        lat: 14.5915,
        lng: -90.4795,
        plusvaliaImpact: "Eje académico premium de Zona 15. Provoca un auge en el desarrollo de micro-apartamentos y colivings estudiantiles verticales en Vista Hermosa III y áreas de Zona 16, atrayendo inversiones de renta residencial.",
        details: "Complejo académico que alberga las sedes de las prestigiosas universidades URL y UVG."
    },
    {
        name: "Universidad Francisco Marroquín",
        type: "university",
        zone: "Zona 10",
        lat: 14.6048,
        lng: -90.5058,
        plusvaliaImpact: "Distrito intelectual de alto nivel adquisitivo. Incrementa el atractivo residencial premium del sector de Zona 10 y Vista Hermosa I, atrayendo a profesionales, investigadores y estudiantes extranjeros.",
        details: "Prestigioso campus privado reconocido internacionalmente por sus jardines integrados y diseño arquitectónico."
    },
    {
        name: "Universidad del Istmo (UNIS)",
        type: "university",
        zone: "Carretera a El Salvador",
        lat: 14.4820,
        lng: -90.4180,
        plusvaliaImpact: "Ancla académica y ecológica del sector oriente. Su traslado a Fraijanes actuó como un potente imán habitacional, estimulando el desarrollo de condominios residenciales de alto perfil, residencias de estudiantes y plazas comerciales de conveniencia.",
        details: "Prestigioso campus privado ubicado en Fraijanes, diseñado con altos criterios ecológicos y eficiencia energética."
    },
    {
        name: "Mega-Templo Casa de Dios",
        type: "temple",
        zone: "Fraijanes / Km 22",
        lat: 14.4752,
        lng: -90.4357,
        plusvaliaImpact: "Hito de congregación masiva. Dinamiza intensamente el tráfico de fin de semana y cataliza el desarrollo de residenciales horizontales cerrados premium y plazas de servicio a lo largo de la Carretera a El Salvador (Km 18-Km 25).",
        details: "Uno de los templos cristianos más grandes de Latinoamérica, punto de referencia geográfico y de influencia socioeconómica en el sector oriente."
    }
];


