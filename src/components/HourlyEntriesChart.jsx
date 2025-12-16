import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import '../index.css';

/**
 * Hourly Entries Chart Component
 * 
 * Displays a beautiful bar chart showing ticket entries per hour
 * Features:
 * - Animated bars with gradient fills
 * - Peak hour highlighting
 * - Responsive design
 * - Hover tooltips
 */
const HourlyEntriesChart = ({ data, peakHour, maxEntries }) => {
    if (!data || data.length === 0) {
        return (
            <div className="hourly-entries-chart empty-state">
                <div className="empty-icon">📊</div>
                <p className="empty-text">No hay datos de entradas por hora aún</p>
                <p className="empty-subtitle">Los datos aparecerán cuando se escaneen tickets</p>
            </div>
        );
    }

    // Calculate percentage for each bar
    const maxValue = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="hourly-entries-chart">
            {/* Header */}
            <div className="chart-header">
                <h3 className="chart-title">
                    <Clock size={24} />
                    Entradas por Hora
                </h3>
                {peakHour && (
                    <div className="peak-hour-badge">
                        <TrendingUp size={16} />
                        <span>Hora pico: {peakHour} ({maxEntries} entradas)</span>
                    </div>
                )}
            </div>

            {/* Chart Grid */}
            <div className="hourly-chart-container">
                {/* Y-axis labels */}
                <div className="chart-y-axis">
                    <span className="y-axis-label">{maxValue}</span>
                    <span className="y-axis-label">{Math.floor(maxValue / 2)}</span>
                    <span className="y-axis-label">0</span>
                </div>

                {/* Bars */}
                <div className="chart-bars-container">
                    {data.map((entry, index) => {
                        const percentage = (entry.count / maxValue) * 100;
                        const isPeak = entry.hour_label === peakHour;

                        return (
                            <div key={entry.hour} className="chart-bar-wrapper">
                                {/* Bar */}
                                <div className="chart-bar-column">
                                    <div
                                        className={`chart-bar ${isPeak ? 'peak' : ''}`}
                                        style={{
                                            height: `${percentage}%`,
                                            animationDelay: `${index * 0.05}s`
                                        }}
                                        data-count={entry.count}
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="chart-tooltip">
                                            <strong>{entry.hour_label}</strong>
                                            <span>{entry.count} entrada{entry.count !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* X-axis label */}
                                <div className="chart-x-label">
                                    {entry.hour_label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-color normal"></div>
                    <span>Entradas</span>
                </div>
                {peakHour && (
                    <div className="legend-item">
                        <div className="legend-color peak"></div>
                        <span>Hora pico</span>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="chart-summary">
                <div className="summary-stat">
                    <span className="summary-label">Total de horas activas:</span>
                    <span className="summary-value">{data.length}</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-label">Promedio por hora:</span>
                    <span className="summary-value">
                        {(data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HourlyEntriesChart;
