/* ==========================================================================
   VALORGT AI - CONFIGURACIÓN DE GRÁFICOS COMPLEJOS CON CHART.JS
   ========================================================================== */

let historyChartInstance = null;
let comparisonChartInstance = null;

// Configuración global de Chart.js para temas oscuros
Chart.defaults.color = '#9da4b0';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

/**
 * Inicializa y actualiza el gráfico de proyección histórica y futura de plusvalía
 * @param {string} zoneKey - Clave de la zona (ej. 'zona10')
 * @param {number} baseValue - Valor tasado actual
 */
function renderHistoryChart(zoneKey, baseValue) {
    const ctx = document.getElementById('valuationHistoryChart');
    if (!ctx) return;

    const zoneData = ZONES_DATABASE[zoneKey];
    if (!zoneData) return;

    // Calcular valores proyectados basados en el histórico de la zona y la tasa de plusvalía
    const growthRate = zoneData.growth5Y / 5 / 100; // Tasa promedio anual
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const years = ['-3A', '-2A', '-1A', 'Actual', '+1A', '+2A', '+3A', '+4A', '+5A'];
    
    // Proyecciones hacia atrás y hacia adelante
    const dataValues = [
        baseValue * Math.pow(1 - growthRate, 3),
        baseValue * Math.pow(1 - growthRate, 2),
        baseValue * (1 - growthRate),
        baseValue,
        baseValue * (1 + growthRate),
        baseValue * Math.pow(1 + growthRate, 2),
        baseValue * Math.pow(1 + growthRate, 3),
        baseValue * Math.pow(1 + growthRate, 4),
        baseValue * Math.pow(1 + growthRate, 5)
    ];

    if (historyChartInstance) {
        historyChartInstance.destroy();
    }

    // Gradiente para el área del gráfico
    const chartContext = ctx.getContext('2d');
    const gradient = chartContext.createLinearGradient(0, 0, 0, ctx.height || 230);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 102, 255, 0.0)');

    historyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Valor Proyectado Inmueble',
                data: dataValues,
                borderColor: '#00f0ff',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#00f0ff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                backgroundColor: gradient,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 12, 16, 0.95)',
                    titleColor: '#00f0ff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(0, 240, 255, 0.25)',
                    borderWidth: 1,
                    displayColors: false,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed.y;
                            return ` ${context.dataset.label}: ${currencySym}${formatNumber(value.toFixed(0))}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1e6) {
                                return currencySym + (value / 1e6).toFixed(1) + 'M';
                            } else if (value >= 1e3) {
                                return currencySym + (value / 1e3).toFixed(0) + 'k';
                            }
                            return currencySym + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inicializa el gráfico comparativo para inversores (ROI vs Plusvalía)
 */
function initInvestorComparisonChart() {
    const ctx = document.getElementById('investorComparisonChart');
    if (!ctx) return;

    const labels = [];
    const roiData = [];
    const plusvaliaData = [];

    // Extraer datos de la base de datos
    Object.keys(ZONES_DATABASE).forEach(key => {
        const zone = ZONES_DATABASE[key];
        labels.push(zone.name.split(' (')[0]); // Nombre sin subtítulo
        roiData.push(zone.roi);
        plusvaliaData.push(zone.growth5Y / 5); // Tasa anualizada (5 años / 5)
    });

    if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
    }

    comparisonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Rendimiento de Renta (ROI Anual %)',
                    data: roiData,
                    backgroundColor: 'rgba(0, 102, 255, 0.65)',
                    borderColor: '#0066ff',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    hoverBackgroundColor: '#0066ff'
                },
                {
                    label: 'Plusvalía Anualizada Proyectada (%)',
                    data: plusvaliaData,
                    backgroundColor: 'rgba(0, 255, 102, 0.65)',
                    borderColor: '#00ff66',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    hoverBackgroundColor: '#00ff66'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 12, 16, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/* ==========================================================================
   GRAFICOS COMPLEJOS PARA EL PORTAFOLIO INMOBILIARIO IA
   ========================================================================== */

let portfolioGrowthChartInstance = null;
let portfolioDistributionChartInstance = null;

/**
 * Actualiza el gráfico Doughnut de Distribución de Activos
 */
function updatePortfolioDistributionChart() {
    const ctx = document.getElementById('portfolioDistributionChart');
    if (!ctx) return;

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;

    // Agrupar el valor actual por tipo de activo
    const distributionData = {};
    
    userPortfolio.forEach(asset => {
        let currentVal = asset.currentValue;
        if (asset.isRemodeled) currentVal *= 1.10;
        
        const typeLabel = asset.type.toUpperCase();
        distributionData[typeLabel] = (distributionData[typeLabel] || 0) + (currentVal * conversion);
    });

    const labels = Object.keys(distributionData);
    const dataValues = Object.values(distributionData);

    if (portfolioDistributionChartInstance) {
        portfolioDistributionChartInstance.destroy();
    }

    if (labels.length === 0) {
        // Graficar estado vacío
        portfolioDistributionChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Sin Activos'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255,255,255,0.05)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
        return;
    }

    // Colores futuristas para los tipos de activos
    const themeColors = [
        '#bf5af2', // Morado (Apartamento/Comercial)
        '#00f0ff', // Cyan (Loft/Oficina)
        '#00ff66', // Verde (Casa)
        '#ff9f0a', // Naranja (Terreno)
        '#ff375f', // Rojo (Airbnb)
        '#0066ff', // Azul (Bodega)
        '#ff2d55', // Rosa (Playa)
        '#ffd60a'  // Amarillo (Otros)
    ];

    portfolioDistributionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: themeColors.slice(0, labels.length),
                borderColor: '#121418',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        padding: 10,
                        font: { size: 10 },
                        color: '#9da4b0'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 12, 16, 0.95)',
                    borderColor: 'rgba(191, 90, 242, 0.25)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';
                            return ` ${context.label}: ${currencySym}${formatNumber(context.parsed.toFixed(0))}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el gráfico de área apilada de Crecimiento Patrimonial (Equity vs Deuda)
 */
function updatePortfolioGrowthChart(totalValueUSD, totalDebtUSD, avgPlusvalia) {
    const ctx = document.getElementById('portfolioGrowthChart');
    if (!ctx) return;

    const conversion = activeCurrency === 'GTQ' ? exchangeRate : 1;
    const currencySym = activeCurrency === 'GTQ' ? 'Q' : '$';

    const years = activePortfolioProjYears; // 1, 5, 10, 20
    const steps = 6; // Número de puntos en el eje X
    
    const labels = [];
    const equityData = [];
    const debtData = [];

    const stepYears = years / (steps - 1);
    const growthRate = avgPlusvalia / 100;

    for (let i = 0; i < steps; i++) {
        const t = i * stepYears;
        const label = t === 0 ? 'Actual' : `+${t.toFixed(t % 1 === 0 ? 0 : 1)}A`;
        labels.push(label);

        // Crecimiento compuesto del valor del activo
        const projectedValue = totalValueUSD * Math.pow(1 + growthRate, t);
        
        // Amortización gradual de la deuda (disminución del 6.5% de capital anual aproximado)
        const projectedDebt = Math.max(totalDebtUSD * Math.pow(1 - 0.065, t), 0);
        
        // El equity es el valor neto (Activo - Deuda)
        const projectedEquity = projectedValue - projectedDebt;

        equityData.push(projectedEquity * conversion);
        debtData.push(projectedDebt * conversion);
    }

    // Actualizar leyendas numéricas del pie del gráfico con el valor del último año de la proyección
    const finalEquity = equityData[steps - 1];
    const finalDebt = debtData[steps - 1];
    document.getElementById('p-proj-equity-val').innerText = `${currencySym}${formatNumber(finalEquity.toFixed(0))}`;
    document.getElementById('p-proj-debt-val').innerText = `${currencySym}${formatNumber(finalDebt.toFixed(0))}`;

    if (portfolioGrowthChartInstance) {
        portfolioGrowthChartInstance.destroy();
    }

    portfolioGrowthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Patrimonio Neto (Equity)',
                    data: equityData,
                    borderColor: '#bf5af2', // Morado
                    backgroundColor: 'rgba(191, 90, 242, 0.12)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#bf5af2',
                    pointRadius: 3
                },
                {
                    label: 'Deuda Pendiente',
                    data: debtData,
                    borderColor: '#ff375f', // Rojo
                    backgroundColor: 'rgba(255, 55, 95, 0.04)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointBackgroundColor: '#ff375f',
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        color: '#9da4b0',
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 12, 16, 0.95)',
                    borderColor: 'rgba(191, 90, 242, 0.25)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${currencySym}${formatNumber(context.parsed.y.toFixed(0))}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#9da4b0', font: { size: 9 } }
                },
                y: {
                    stacked: false,
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: {
                        color: '#9da4b0',
                        font: { size: 9 },
                        callback: function(value) {
                            if (value >= 1e6) {
                                return currencySym + (value / 1e6).toFixed(1) + 'M';
                            } else if (value >= 1e3) {
                                return currencySym + (value / 1e3).toFixed(0) + 'k';
                            }
                            return currencySym + value;
                        }
                    }
                }
            }
        }
    });
}
