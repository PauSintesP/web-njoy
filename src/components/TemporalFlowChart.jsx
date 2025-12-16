import React from 'react';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import '../index.css';

/**
 * Temporal Flow Chart Component
 * 
 * Beautiful line chart showing cumulative entries over time
 * Features:
 * - Smooth animated gradient line
 * - Event hour marker
 * - Interactive points with tooltips
 * - Area fill with gradient
 * - Time range: 2h before event to 4h after (or last scan)
 */
const TemporalFlowChart = ({ data, eventHour, totalEntries }) => {
    // Debug logging
    console.log('TemporalFlowChart data:', data);
    console.log('Event hour:', eventHour);
    console.log('Total entries:', totalEntries);

    if (!data || data.length === 0) {
        console.log('No data - showing empty state');
        return (
            <div className="temporal-flow-chart empty-state">
                <div className="empty-icon">📈</div>
                <p className="empty-text">No hay datos de flujo temporal aún</p>
                <p className="empty-subtitle">El gráfico se generará cuando se escaneen tickets</p>
            </div>
        );
    }

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.cumulative), 1);
    const minHour = Math.min(...data.map(d => d.hour));
    const maxHour = Math.max(...data.map(d => d.hour));

    // Generate SVG path for the line
    const generatePath = () => {
        const width = 100; // percentage
        const height = 100; // percentage
        const xScale = width / (data.length - 1 || 1);

        const points = data.map((point, index) => {
            const x = index * xScale;
            const y = height - (point.cumulative / maxValue) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    // Generate area path (for gradient fill)
    const generateAreaPath = () => {
        const width = 100;
        const height = 100;
        const xScale = width / (data.length - 1 || 1);

        const points = data.map((point, index) => {
            const x = index * xScale;
            const y = height - (point.cumulative / maxValue) * height;
            return `${x},${y}`;
        });

        return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
    };

    // Find event hour position
    const eventHourIndex = data.findIndex(d => d.hour === eventHour);
    const eventHourPosition = eventHourIndex >= 0
        ? (eventHourIndex / (data.length - 1)) * 100
        : null;

    return (
        <div className="temporal-flow-chart">
            {/* Header */}
            <div className="chart-header">
                <h3 className="chart-title">
                    <Activity size={24} />
                    Flujo Acumulado del Evento
                </h3>
                <div className="flow-stats">
                    <div className="flow-stat">
                        <Clock size={16} />
                        <span>De {data[0]?.hour_label} a {data[data.length - 1]?.hour_label}</span>
                    </div>
                    <div className="flow-stat highlight">
                        <TrendingUp size={16} />
                        <span>{totalEntries} entradas totales</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="flow-chart-container">
                {/* Y-axis labels */}
                <div className="flow-y-axis">
                    <span className="y-axis-label">{maxValue}</span>
                    <span className="y-axis-label">{Math.floor(maxValue * 0.75)}</span>
                    <span className="y-axis-label">{Math.floor(maxValue * 0.5)}</span>
                    <span className="y-axis-label">{Math.floor(maxValue * 0.25)}</span>
                    <span className="y-axis-label">0</span>
                </div>

                {/* SVG Chart */}
                <div className="flow-chart-svg-container">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="flow-svg">
                        <defs>
                            {/* Gradient for area fill */}
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
                            </linearGradient>

                            {/* Gradient for line stroke */}
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="50%" stopColor="var(--accent)" />
                                <stop offset="100%" stopColor="var(--primary)" />
                            </linearGradient>
                        </defs>

                        {/* Area fill */}
                        <path
                            d={generateAreaPath()}
                            fill="url(#areaGradient)"
                            className="flow-area"
                        />

                        {/* Line */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="flow-line"
                        />
                    </svg>

                    {/* Event hour marker */}
                    {eventHourPosition !== null && (
                        <div
                            className="event-hour-marker"
                            style={{ left: `${eventHourPosition}%` }}
                        >
                            <div className="marker-line"></div>
                            <div className="marker-label">
                                <Clock size={14} />
                                Inicio Evento
                            </div>
                        </div>
                    )}

                    {/* Interactive points */}
                    <div className="flow-points-overlay">
                        {data.map((point, index) => {
                            console.log('Point:', JSON.stringify(point), 'Index:', index);

                            // Show points only where cumulative is greater than 0 (there's data)
                            // Skip first/last points if they're flat (no entries yet)
                            if (point.cumulative === 0) {
                                console.log('Skipping point with cumulative 0');
                                return null;
                            }

                            const xPos = (index / (data.length - 1)) * 100;
                            const yPos = 100 - (point.cumulative / maxValue) * 100;

                            console.log(`Rendering point at ${point.hour_label}: x=${xPos}%, y=${yPos}%`);

                            return (
                                <div
                                    key={index}
                                    className="flow-point"
                                    style={{
                                        left: `${xPos}%`,
                                        bottom: `${yPos}%`
                                    }}
                                >
                                    <div className="point-dot"></div>
                                    <div className="point-tooltip">
                                        <strong>{point.hour_label}</strong>
                                        <span>{point.cumulative} personas acumuladas</span>
                                        <span className="increment">+{point.count} nuevas</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* X-axis labels */}
                <div className="flow-x-axis">
                    {data.map((point, index) => {
                        // Show label every 2 hours or first/last
                        const showLabel = index === 0 ||
                            index === data.length - 1 ||
                            index % 2 === 0;

                        return showLabel ? (
                            <div
                                key={index}
                                className="x-axis-label"
                                style={{ left: `${(index / (data.length - 1)) * 100}%` }}
                            >
                                {point.hour_label}
                            </div>
                        ) : null;
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="flow-summary">
                <div className="summary-item">
                    <span className="summary-icon">⚡</span>
                    <div>
                        <p className="summary-label">Velocidad promedio</p>
                        <p className="summary-value">
                            {(totalEntries / data.length).toFixed(1)} personas/hora
                        </p>
                    </div>
                </div>
                <div className="summary-item">
                    <span className="summary-icon">🕐</span>
                    <div>
                        <p className="summary-label">Duración del flujo</p>
                        <p className="summary-value">
                            {data.length} horas
                        </p>
                    </div>
                </div>
                <div className="summary-item">
                    <span className="summary-icon">📊</span>
                    <div>
                        <p className="summary-label">Mayor incremento</p>
                        <p className="summary-value">
                            {Math.max(...data.map(d => d.count))} personas/hora
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemporalFlowChart;
