import React from 'react';
import '../index.css';

/**
 * AttendanceChart component - displays attendance comparison
 * @param {number} ticketsSold - Total tickets sold
 * @param {number} ticketsScanned - Total tickets scanned (attended)
 * @param {number} attendanceRate - Attendance rate percentage
 */
const AttendanceChart = ({ ticketsSold, ticketsScanned, attendanceRate }) => {
    const notAttended = ticketsSold - ticketsScanned;

    return (
        <div className="attendance-chart">
            <h3 className="chart-title">📊 Asistencia vs Ventas</h3>

            <div className="chart-bars">
                <div className="chart-bar-container">
                    <div className="chart-label">
                        <span className="label-text">Asistieron</span>
                        <span className="label-value">{ticketsScanned}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill progress-success"
                            style={{ width: `${(ticketsScanned / ticketsSold) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="chart-bar-container">
                    <div className="chart-label">
                        <span className="label-text">No asistieron</span>
                        <span className="label-value">{notAttended}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill progress-warning"
                            style={{ width: `${(notAttended / ticketsSold) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="chart-summary">
                <div className="summary-item">
                    <span className="summary-label">Tasa de asistencia:</span>
                    <span className="summary-value">{attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total vendidas:</span>
                    <span className="summary-value">{ticketsSold}</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;
