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
            terrenos: { priceM2: 1350, roi: 0.0, liquidity: "6.5/10", growth: 10.0, rec: "COMPRAR" },
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
            terrenos: { priceM2: 1500, roi: 0.0, liquidity: "7.2/10", growth: 9.5, rec: "COMPRAR" },
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
            terrenos: { priceM2: 1150, roi: 0.0, liquidity: "6.8/10", growth: 9.0, rec: "COMPRAR" },
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
            terrenos: { priceM2: 800, roi: 0.0, liquidity: "8.2/10", growth: 11.2, rec: "COMPRAR" },
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
            terrenos: { priceM2: 1000, roi: 0.0, liquidity: "8.0/10", growth: 12.5, rec: "COMPRAR" },
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
        name: "CAES (Km 10 - Km 17)",
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
            terrenos: { priceM2: 250, roi: 0.0, liquidity: "5.8/10", growth: 7.0, rec: "VENDER" },
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
            terrenos: { priceM2: 185, roi: 0.0, liquidity: "6.5/10", growth: 8.0, rec: "COMPRAR" },
            bodegas: { priceM2: 880, roi: 6.9, liquidity: "7.2/10", growth: 4.2, rec: "MANTENER" }
        },
        advantages: [
            "Tierra residencial con costos por metro cuadrado muy competitivos.",
            "Clima de montaña templado y abundante vegetación, ideal para familias con mascotas.",
            "Rápido desarrollo de centros educativos de primer nivel y plazas comerciales de conveniencia."
        ],
        risks: [
            "Tránsito pesado durante horas pico en el embudo vial de CAES.",
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
            terrenos: { priceM2: 270, roi: 0.0, liquidity: "7.0/10", growth: 7.5, rec: "COMPRAR" },
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
            terrenos: { priceM2: 500, roi: 0.0, liquidity: "8.0/10", growth: 12.0, rec: "COMPRAR" },
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
    },
    carretera_high: {
        name: "CAES (Km 18 - Km 25)",
        basePriceM2: 950,
        roi: 6.4,
        growth5Y: 20,
        demandScore: "Media",
        liquidityIndex: "6.8/10",
        lat: 14.5123,
        lng: -90.4102,
        color: "blue",
        categories: {
            apartamentos: { priceM2: 950, roi: 6.4, liquidity: "6.8/10", growth: 4.0, rec: "COMPRAR" },
            casas: { priceM2: 850, roi: 6.0, liquidity: "6.5/10", growth: 3.5, rec: "ALQUILAR" },
            oficinas: { priceM2: 900, roi: 6.5, liquidity: "6.0/10", growth: 3.2, rec: "MANTENER" },
            locales: { priceM2: 1100, roi: 7.2, liquidity: "6.9/10", growth: 4.5, rec: "COMPRAR" },
            terrenos: { priceM2: 170, roi: 0.0, liquidity: "5.5/10", growth: 6.0, rec: "VENDER" },
            bodegas: { priceM2: 750, roi: 6.2, liquidity: "6.2/10", growth: 3.0, rec: "MANTENER" }
        },
        advantages: [
            "Costos de tierra muy bajos por metro cuadrado.",
            "Condominios horizontales de gran tamaño con extensos jardines.",
            "Clima de montaña agradable alejado de la contaminación de la ciudad."
        ],
        risks: [
            "Tiempos de traslado prolongados debido al único embudo de ingreso.",
            "Menor cobertura de agua municipal en proyectos residenciales antiguos."
        ],
        recommendation: "ALQUILAR/COMPRAR. Ideal para familias grandes que priorizan la amplitud física y la naturaleza frente a la cercanía corporativa."
    },
    pinula: {
        name: "San José Pinula (Condominios / Clubes)",
        basePriceM2: 850,
        roi: 6.2,
        growth5Y: 18,
        demandScore: "Media",
        liquidityIndex: "6.5/10",
        lat: 14.5456,
        lng: -90.4132,
        color: "blue",
        categories: {
            apartamentos: { priceM2: 800, roi: 6.0, liquidity: "6.0/10", growth: 3.5, rec: "COMPRAR" },
            casas: { priceM2: 850, roi: 6.2, liquidity: "6.5/10", growth: 3.6, rec: "COMPRAR" },
            oficinas: { priceM2: 780, roi: 5.8, liquidity: "5.5/10", growth: 3.0, rec: "MANTENER" },
            locales: { priceM2: 1050, roi: 7.0, liquidity: "6.7/10", growth: 4.2, rec: "COMPRAR" },
            terrenos: { priceM2: 100, roi: 0.0, liquidity: "5.8/10", growth: 5.5, rec: "COMPRAR" },
            bodegas: { priceM2: 700, roi: 6.0, liquidity: "6.0/10", growth: 2.8, rec: "MANTENER" }
        },
        advantages: [
            "Excelente oferta de colegios bilingües y campos de golf residenciales.",
            "Tierra fértil y entorno natural boscoso muy tranquilo.",
            "Precios de primera vivienda sumamente competitivos para clase media."
        ],
        risks: [
            "Tránsito pesado durante el tramo de salida hacia el Km 17.",
            "Menor cantidad de alternativas comerciales de gran escala."
        ],
        recommendation: "COMPRAR. Excelente opción para familias con niños en edad escolar que buscan condominios cerrados con áreas recreativas amplias."
    },
    zona11: {
        name: "Zona 11 (Majadas / Las Charcas)",
        basePriceM2: 1550,
        roi: 7.9,
        growth5Y: 34,
        demandScore: "Muy Alta",
        liquidityIndex: "9.0/10",
        lat: 14.6190,
        lng: -90.5510,
        color: "orange",
        categories: {
            apartamentos: { priceM2: 1550, roi: 7.9, liquidity: "9.0/10", growth: 6.8, rec: "COMPRAR" },
            casas: { priceM2: 1450, roi: 6.8, liquidity: "8.2/10", growth: 5.5, rec: "COMPRAR" },
            oficinas: { priceM2: 1600, roi: 8.2, liquidity: "8.5/10", growth: 6.5, rec: "COMPRAR" },
            locales: { priceM2: 2100, roi: 9.2, liquidity: "9.0/10", growth: 8.2, rec: "COMPRAR" },
            terrenos: { priceM2: 590, roi: 0.0, liquidity: "7.5/10", growth: 9.8, rec: "COMPRAR" },
            bodegas: { priceM2: 1100, roi: 7.8, liquidity: "8.0/10", growth: 5.2, rec: "MANTENER" }
        },
        advantages: [
            "Gran conectividad comercial gracias al polo de desarrollo de Majadas.",
            "Ubicación céntrica con salidas rápidas hacia el Periférico y Roosevelt.",
            "Fuerte crecimiento vertical en zonas habitacionales consolidadas."
        ],
        risks: [
            "Congestión vehicular intensa en nodos clave de la Roosevelt.",
            "Precios de preventa en alza constante en los últimos 3 años."
        ],
        recommendation: "COMPRAR/ALQUILAR. Zona 11 ofrece una de las tasas de absorción y renta más dinámicas de la ciudad. Muy atractiva para profesionales jóvenes."
    },
    zona12: {
        name: "Zona 12 (El Trébol / Reformita)",
        basePriceM2: 1100,
        roi: 7.4,
        growth5Y: 26,
        demandScore: "Alta",
        liquidityIndex: "8.2/10",
        lat: 14.6020,
        lng: -90.5360,
        color: "yellow",
        categories: {
            apartamentos: { priceM2: 1050, roi: 7.4, liquidity: "8.2/10", growth: 5.2, rec: "COMPRAR" },
            casas: { priceM2: 1100, roi: 6.5, liquidity: "7.8/10", growth: 4.8, rec: "MANTENER" },
            oficinas: { priceM2: 1000, roi: 6.8, liquidity: "7.2/10", growth: 4.2, rec: "MANTENER" },
            locales: { priceM2: 1350, roi: 8.5, liquidity: "8.1/10", growth: 6.2, rec: "COMPRAR" },
            terrenos: { priceM2: 340, roi: 0.0, liquidity: "6.9/10", growth: 7.8, rec: "COMPRAR" },
            bodegas: { priceM2: 890, roi: 7.6, liquidity: "7.9/10", growth: 4.0, rec: "MANTENER" }
        },
        advantages: [
            "Cercanía inmediata a la Universidad de San Carlos de Guatemala (USAC).",
            "Polo comercial e industrial muy activo y de alta densidad laboral.",
            "Precios de alquiler accesibles para el mercado estudiantil y comercial."
        ],
        risks: [
            "Problemas de seguridad en sectores no controlados del interior.",
            "Congestión vial de transporte pesado en la Calzada Atanasio Tzul."
        ],
        recommendation: "COMPRAR (INVERSIONISTAS). Ideal para construir apartamentos pequeños para estudiantes (coliving estudiantil) debido a la inmensa demanda de la USAC."
    },
    zona9: {
        name: "Zona 9 (Terminal / Montúfar)",
        basePriceM2: 1300,
        roi: 7.8,
        growth5Y: 30,
        demandScore: "Media-Alta",
        liquidityIndex: "7.8/10",
        lat: 14.6120,
        lng: -90.5180,
        color: "yellow",
        categories: {
            apartamentos: { priceM2: 1250, roi: 7.5, liquidity: "7.5/10", growth: 5.6, rec: "COMPRAR" },
            casas: { priceM2: 1150, roi: 6.2, liquidity: "6.8/10", growth: 4.5, rec: "MANTENER" },
            oficinas: { priceM2: 1300, roi: 7.8, liquidity: "7.8/10", growth: 5.8, rec: "COMPRAR" },
            locales: { priceM2: 1750, roi: 8.9, liquidity: "8.3/10", growth: 7.2, rec: "COMPRAR" },
            terrenos: { priceM2: 670, roi: 0.0, liquidity: "7.0/10", growth: 8.5, rec: "COMPRAR" },
            bodegas: { priceM2: 980, roi: 8.0, liquidity: "8.0/10", growth: 4.8, rec: "COMPRAR" }
        },
        advantages: [
            "Ubicación central óptima con acceso inmediato a transporte público.",
            "Distrito corporativo tradicional de oficinas e importadoras.",
            "Gran demanda para bodegas de última milla y distribución local."
        ],
        risks: [
            "Contaminación auditiva y visual debido a la alta densidad de tránsito comercial.",
            "Sectores comerciales desordenados alrededor del mercado de la Terminal."
        ],
        recommendation: "MANTENER/ALQUILAR. Fuerte desempeño comercial para oficinas corporativas de tamaño medio e importadoras. Excelente retorno en bodegas urbanas."
    },
    zona13: {
        name: "Zona 13 (Aurora / Hincapié)",
        basePriceM2: 1450,
        roi: 8.0,
        growth5Y: 31,
        demandScore: "Muy Alta",
        liquidityIndex: "8.6/10",
        lat: 14.5900,
        lng: -90.5280,
        color: "orange",
        categories: {
            apartamentos: { priceM2: 1450, roi: 8.0, liquidity: "8.6/10", growth: 6.2, rec: "COMPRAR" },
            casas: { priceM2: 1350, roi: 6.8, liquidity: "7.5/10", growth: 5.0, rec: "COMPRAR" },
            oficinas: { priceM2: 1400, roi: 7.5, liquidity: "7.8/10", growth: 5.6, rec: "COMPRAR" },
            locales: { priceM2: 1850, roi: 8.6, liquidity: "8.2/10", growth: 6.8, rec: "COMPRAR" },
            terrenos: { priceM2: 590, roi: 0.0, liquidity: "7.2/10", growth: 8.8, rec: "COMPRAR" },
            bodegas: { priceM2: 1050, roi: 7.8, liquidity: "8.1/10", growth: 4.5, rec: "MANTENER" }
        },
        advantages: [
            "Cercanía estratégica al Aeropuerto Internacional La Aurora.",
            "Rodeado de áreas culturales de museos y del Zoológico La Aurora.",
            "Gran demanda de ejecutivos de aerolíneas e inversores en Airbnb."
        ],
        risks: [
            "Limitaciones de altura por el cono de aproximación aeronáutica.",
            "Niveles de ruido de turbinas en sub-sectores de paso de aeronaves."
        ],
        recommendation: "COMPRAR (AIRBNB). Excelente zona para desarrollar edificios de apartamentos pequeños orientados a hospedajes de corta duración (turistas y viajeros)."
    },
    zona7: {
        name: "Zona 7 (El Naranjo / Landívar)",
        basePriceM2: 1280,
        roi: 7.5,
        growth5Y: 29,
        demandScore: "Alta",
        liquidityIndex: "8.0/10",
        lat: 14.6380,
        lng: -90.5480,
        color: "yellow",
        categories: {
            apartamentos: { priceM2: 1220, roi: 7.2, liquidity: "7.8/10", growth: 5.8, rec: "COMPRAR" },
            casas: { priceM2: 1280, roi: 6.8, liquidity: "8.0/10", growth: 5.4, rec: "COMPRAR" },
            oficinas: { priceM2: 1200, roi: 7.0, liquidity: "7.2/10", growth: 4.8, rec: "MANTENER" },
            locales: { priceM2: 1550, roi: 8.2, liquidity: "8.0/10", growth: 6.2, rec: "COMPRAR" },
            terrenos: { priceM2: 400, roi: 0.0, liquidity: "6.8/10", growth: 8.2, rec: "COMPRAR" },
            bodegas: { priceM2: 950, roi: 7.5, liquidity: "7.5/10", growth: 4.2, rec: "MANTENER" }
        },
        advantages: [
            "Crecimiento explosivo residencial y de comercio en Condado El Naranjo.",
            "Infraestructura vial de primer nivel en el Boulevard Principal.",
            "Excelente nivel de seguridad y garitas de acceso vecinales."
        ],
        risks: [
            "Embudos viales en el tramo de incorporación hacia el Periférico y Roosevelt.",
            "Precios de terreno por vara cuadrada en alza acelerada."
        ],
        recommendation: "COMPRAR. El Naranjo es un polo habitacional muy cotizado para primera vivienda residencial por familias jóvenes de clase media y alta."
    },
    zona1: {
        name: "Zona 1 (Centro Histórico)",
        basePriceM2: 1200,
        roi: 8.5,
        growth5Y: 35,
        demandScore: "Muy Alta",
        liquidityIndex: "8.3/10",
        lat: 14.6349,
        lng: -90.5113,
        color: "green",
        categories: {
            apartamentos: { priceM2: 1150, roi: 8.5, liquidity: "8.3/10", growth: 7.2, rec: "COMPRAR" },
            casas: { priceM2: 1200, roi: 7.5, liquidity: "7.8/10", growth: 5.8, rec: "COMPRAR" },
            oficinas: { priceM2: 1100, roi: 7.2, liquidity: "7.0/10", growth: 4.5, rec: "MANTENER" },
            locales: { priceM2: 1650, roi: 9.2, liquidity: "8.5/10", growth: 8.0, rec: "COMPRAR" },
            terrenos: { priceM2: 400, roi: 0.0, liquidity: "6.5/10", growth: 9.2, rec: "COMPRAR" },
            bodegas: { priceM2: 850, roi: 7.0, liquidity: "7.0/10", growth: 3.8, rec: "MANTENER" }
        },
        advantages: [
            "Gentrificación cultural muy activa de jóvenes universitarios e inversores.",
            "Polo gastronómico, comercial y bohemio consolidado en Paseo de la Sexta.",
            "Arquitectura patrimonial histórica de alto valor estético."
        ],
        risks: [
            "Falta de parqueos privados y alta congestión peatonal.",
            "Normativas de remodelación históricas estrictas por el IDAEH."
        ],
        recommendation: "COMPRAR (INVERSIONISTAS). La gentrificación de apartamentos antiguos renovados y cafés de moda ofrece un crecimiento de plusvalía y demanda de alquiler muy veloz."
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
            photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=85",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Penthouse Plaza República",
            tag: "PENTHOUSE PREMIUM",
            priceUSD: 444000,
            size: 240, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85",
            badge: "LUJO EXTREMO"
        },
        {
            title: "Oficina Corporativa Geminis 10",
            tag: "OFICINA COMERCIAL",
            priceUSD: 148000,
            size: 80, rooms: 0, bathrooms: 1.0, parkings: 1, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85",
            badge: "EXCELENTE ROI"
        },
        {
            title: "Residencia Premium Las Margaritas",
            tag: "CASA RESIDENCIAL",
            priceUSD: 555000,
            size: 300, rooms: 4, bathrooms: 4.5, parkings: 3, garden: 60, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym"],
            photos: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=85",
            badge: "PREMIUM"
        },
        {
            title: "Apartamento Boutique Zona Viva",
            tag: "APARTAMENTO BOUTIQUE",
            priceUSD: 310000,
            size: 160, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85",
            badge: "IA SUGGESTED"
        },
        {
            title: "Bodega Industrial Las Margaritas",
            tag: "BODEGA EN RENTA",
            priceUSD: 4500,
            size: 450, rooms: 0, bathrooms: 2.0, parkings: 4, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=85",
            badge: "RECOMENDADO",
            sponsored: true
        },
        {
            title: "Apartamento Premium La Cañada",
            tag: "APARTAMENTO DE LUJO",
            priceUSD: 525000,
            size: 250, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85",
            badge: "LUJO EXCLUSIVO",
            sponsored: true
        },
        {
            title: "Villa Residencial Las Charcas",
            tag: "CASA FAMILIAR",
            priceUSD: 630000,
            size: 300, rooms: 4, bathrooms: 4.5, parkings: 3, garden: 80, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85",
            badge: "EXCLUSIVA",
            sponsored: true
        },
        {
            title: "Penthouse Exclusivo Europlaza",
            tag: "PENTHOUSE VIP",
            priceUSD: 840000,
            size: 400, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=85",
            badge: "PATRIMONIAL",
            sponsored: true
        },
        {
            title: "Apartamento Exclusivo Américas",
            tag: "APARTAMENTO DE LUJO",
            priceUSD: 450000,
            size: 210, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=85",
            badge: "LUJO EXTREMO",
            sponsored: true
        },
        {
            title: "Bodega de Distribución Las Américas",
            tag: "BODEGA EN RENTA",
            priceUSD: 5200,
            size: 550, rooms: 0, bathrooms: 2.0, parkings: 5, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=85",
            badge: "RECOMENDADO"
        },
        {
            title: "Casa Familiar Vista Hermosa I",
            tag: "CASA RESIDENCIAL",
            priceUSD: 624000,
            size: 320, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85",
            badge: "ALTA PLUSVALÍA"
        },
        {
            title: "Boutique Apartment VH III",
            tag: "APARTAMENTO BOUTIQUE",
            priceUSD: 351000,
            size: 180, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=85",
            photo: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=85",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Oficina Corporativa Multi-Médica",
            tag: "OFICINA CLÍNICA",
            priceUSD: 195000,
            size: 100, rooms: 0, bathrooms: 2.0, parkings: 2, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=85",
            badge: "SECTOR MÉDICO"
        },
        {
            title: "Loft VH IV Premium",
            tag: "LOFT EXCLUSIVO",
            priceUSD: 265000,
            size: 130, rooms: 2, bathrooms: 2.0, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=85",
            badge: "EXCELENTE ROI"
        },
        {
            title: "Bodega Logística Vista Hermosa",
            tag: "BODEGA EN RENTA",
            priceUSD: 3900,
            size: 400, rooms: 0, bathrooms: 2.0, parkings: 4, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1500530815614-230a33d82752?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=85",
            badge: "ALTA PLUSVALÍA"
        },
        {
            title: "Apartamento Acacias Cayalá",
            tag: "APARTAMENTO PREMIUM",
            priceUSD: 315000,
            size: 180, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85",
            badge: "EXCELENTE ROI"
        },
        {
            title: "Casa Minimalista Jacarandas",
            tag: "CASA RESIDENCIAL",
            priceUSD: 560000,
            size: 320, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 90, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=85",
            badge: "MODERNA"
        },
        {
            title: "Penthouse Cardales de Cayalá",
            tag: "PENTHOUSE VIP",
            priceUSD: 490000,
            size: 280, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=85",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Apartamento Preventa Cayalá Z16",
            tag: "APARTAMENTO PREMIUM",
            priceUSD: 380000,
            size: 190, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 0, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=800&q=85",
            badge: "PREVENTA"
        },
        {
            title: "Complejo Bodegas San Isidro",
            tag: "BODEGA EN RENTA",
            priceUSD: 4800,
            size: 500, rooms: 0, bathrooms: 2.0, parkings: 6, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1500530815614-230a33d82752?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=85",
            badge: "ALTO RENDIMIENTO"
        },
        {
            title: "Apartamento Coliving Cantón",
            tag: "APARTAMENTO COLIVING",
            priceUSD: 192000,
            size: 120, rooms: 2, bathrooms: 2.0, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=85",
            badge: "AIRBNB READY"
        },
        {
            title: "Local Comercial XPO1",
            tag: "LOCAL COMERCIAL",
            priceUSD: 160000,
            size: 100, rooms: 0, bathrooms: 1.5, parkings: 1, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=85",
            badge: "OPORTUNIDAD"
        },
        {
            title: "Oficina Tecnológica Granat",
            tag: "OFICINA CORPORATIVA",
            priceUSD: 240000,
            size: 150, rooms: 0, bathrooms: 2.0, parkings: 2, garden: 0, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85",
            badge: "INVERSOR"
        },
        {
            title: "Loft Exclusivo XPO1",
            tag: "MICRO-APARTAMENTO",
            priceUSD: 145000,
            size: 90, rooms: 1, bathrooms: 1.0, parkings: 1, garden: 0, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-rooftop", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85",
            badge: "ALTO RENDIMIENTO"
        },
        {
            title: "Bodega Urbana Cantón Exposición",
            tag: "BODEGA EN RENTA",
            priceUSD: 2900,
            size: 300, rooms: 0, bathrooms: 1.5, parkings: 2, garden: 0, study: false, familyRoom: false,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1500530815614-230a33d82752?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1500530815614-230a33d82752?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=85",
            badge: "EXCELENTE PRECIO"
        },
        {
            title: "Residencia Bosques de las Luces",
            tag: "CASA EN CONDOMINIO",
            priceUSD: 440000,
            size: 400, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 180, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-pool"],
            photos: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=85",
            badge: "PREMIUM"
        },
        {
            title: "Apartamento Las Luces (Km 12)",
            tag: "APARTAMENTO SUBURBANO",
            priceUSD: 165000,
            size: 150, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=85",
            badge: "RECOMENDADO"
        },
        {
            title: "Casa Quinta Los Eucaliptos",
            tag: "CASA RESIDENCIAL",
            priceUSD: 385000,
            size: 350, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 150, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=85",
            badge: "ESTABLE"
        },
        {
            title: "Residencia Campestre Km 16",
            tag: "CASA CON JARDÍN",
            priceUSD: 320000,
            size: 290, rooms: 4, bathrooms: 4.5, parkings: 3, garden: 120, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=85",
            badge: "CRECIMIENTO"
        },
        {
            title: "Casa de Campo El Cortijo",
            tag: "CASA QUINTA",
            priceUSD: 437500,
            size: 350, rooms: 4, bathrooms: 4.5, parkings: 4, garden: 200, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photos: ["https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=85",
            badge: "CLIMA MONTAÑA"
        },
        {
            title: "Townhouse Condominio Arrazola",
            tag: "CASA EN CONDOMINIO",
            priceUSD: 225000,
            size: 180, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 50, study: false, familyRoom: true,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=85",
            badge: "RECOMENDADO"
        },
        {
            title: "Residencia Premium Cañadas de Fraijanes",
            tag: "CASA RESIDENCIAL DE LUJO",
            priceUSD: 500000,
            size: 400, rooms: 5, bathrooms: 5.5, parkings: 4, garden: 160, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=85",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Casa en Bosque Fraijanes",
            tag: "CASA HORIZONTAL",
            priceUSD: 295000,
            size: 260, rooms: 3, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=85",
            badge: "SECTOR EXCLUSIVO"
        },
        {
            title: "Townhouse Boulevard Principal",
            tag: "CASA MODERNA",
            priceUSD: 207000,
            size: 180, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 40, study: false, familyRoom: true,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=85",
            badge: "EXCELENTE PRECIO"
        },
        {
            title: "Apartamento Vista al Valle (San Cristóbal)",
            tag: "APARTAMENTO RESIDENCIAL",
            priceUSD: 138000,
            size: 120, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 0, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-gym", "amenity-rooftop"],
            photos: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85",
            badge: "VISTA AL VALLE"
        },
        {
            title: "Residencia Campo Verde",
            tag: "CASA GRANDE",
            priceUSD: 345000,
            size: 300, rooms: 4, bathrooms: 3.5, parkings: 3, garden: 100, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=85",
            badge: "ESTABLE"
        },
        {
            title: "Casa Residencial Condado Naranjo",
            tag: "CASA RESIDENCIAL",
            priceUSD: 245000,
            size: 220, rooms: 3, bathrooms: 2.5, parkings: 2, garden: 60, study: false, familyRoom: true,
            amenities: ["amenity-security"],
            photos: ["https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=85",
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
            photos: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85",
            badge: "PATRIMONIAL"
        },
        {
            title: "Casa Ruinas del Rosario",
            tag: "CASA COLONIAL HISTÓRICA",
            priceUSD: 840000,
            size: 350, rooms: 4, bathrooms: 4.5, parkings: 2, garden: 120, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=85",
            badge: "LUJO COLONIAL"
        },
        {
            title: "Villa Colonial San Juan",
            tag: "VILLA DE DESCANSO",
            priceUSD: 576000,
            size: 240, rooms: 3, bathrooms: 3.5, parkings: 2, garden: 150, study: false, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photos: ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85",
            badge: "AIRBNB READY"
        },
        {
            title: "Loft Histórico Arco de Santa Catalina",
            tag: "LOFT EXCLUSIVO COLONIAL",
            priceUSD: 432000,
            size: 180, rooms: 2, bathrooms: 2.0, parkings: 1, garden: 40, study: true, familyRoom: false,
            amenities: ["amenity-security", "amenity-rooftop", "amenity-smart"],
            photos: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=85",
            badge: "IA TOP CHOICE"
        },
        {
            title: "Casa Colonial con Jacuzzi",
            tag: "CASA HISTÓRICA AIRBNB",
            priceUSD: 720000,
            size: 280, rooms: 4, bathrooms: 4.5, parkings: 2, garden: 90, study: true, familyRoom: true,
            amenities: ["amenity-security", "amenity-pool"],
            photos: ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85"],
            photo: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=85",
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
        zone: "CAES",
        lat: 14.5422,
        lng: -90.4285,
        plusvaliaImpact: "Eje suburbano primario. Consolida la demanda habitacional de CAES y Fraijanes, incrementando el interés comercial y mitigando la necesidad de movilización diaria a la capital.",
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
        zone: "CAES",
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
        plusvaliaImpact: "Hito de congregación masiva. Dinamiza intensamente el tráfico de fin de semana y cataliza el desarrollo de residenciales horizontales cerrados premium y plazas de servicio a lo largo de la CAES (Km 18-Km 25).",
        details: "Uno de los templos cristianos más grandes de Latinoamérica, punto de referencia geográfico y de influencia socioeconómica en el sector oriente."
    }
];


