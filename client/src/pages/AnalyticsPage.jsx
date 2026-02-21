import { useState, useEffect } from 'react';
import API from '../services/api';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale, Filler);

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    useEffect(() => { load(); }, []);
    const load = async () => { try { const res = await API.get('/analytics'); setData(res.data); } catch (err) { console.error(err); } };

    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
    if (!data) return <div className="page-enter"><div className="table-empty">Loading analytics...</div></div>;

    const { kpis, tripStatusDist, topCostlyVehicles, driverScores, monthlySummary } = data;
    const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3b4', font: { family: 'Inter' } } } }, scales: { x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(42,45,62,0.5)' } }, y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(42,45,62,0.5)' } } } };

    return (
        <div className="page-enter">
            <div className="page-header">
                <div><h1>Operational Analytics & Reports</h1><p className="page-header-sub">Business insights and financial reports</p></div>
                <button className="btn btn-secondary" onClick={() => window.print()}>🖨 Print Report</button>
            </div>
            <div className="kpi-grid">
                <div className="kpi-card yellow"><div className="kpi-label">Total Fuel Cost</div><div className="kpi-value">{fmt(kpis.totalFuel)}</div></div>
                <div className="kpi-card green"><div className="kpi-label">Fleet ROI</div><div className="kpi-value">{kpis.roi > 0 ? '+' : ''}{kpis.roi}%</div><div className={`kpi-change ${kpis.roi >= 0 ? 'up' : 'down'}`}>{kpis.roi >= 0 ? '↑ Profitable' : '↓ Loss'}</div></div>
                <div className="kpi-card blue"><div className="kpi-label">Utilization Rate</div><div className="kpi-value">{kpis.utilRate}%</div></div>
                <div className="kpi-card red"><div className="kpi-label">Maintenance Spend</div><div className="kpi-value">{fmt(kpis.totalMaint)}</div></div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Fuel Efficiency Trend</h3>
                    <div className="chart-wrap"><Line data={{ labels: monthlySummary.map(m => m.month.split(' ')[0]), datasets: [{ label: 'Fuel Cost (₹)', data: monthlySummary.map(m => m.fuel), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#f59e0b', pointRadius: 5 }] }} options={chartOpts} /></div>
                </div>
                <div className="chart-card">
                    <h3>Top Costliest Vehicles</h3>
                    <div className="chart-wrap"><Bar data={{ labels: topCostlyVehicles.map(v => v.name), datasets: [{ label: 'Total Cost (₹)', data: topCostlyVehicles.map(v => v.total), backgroundColor: ['#6C63FF', '#3B82F6', '#06b6d4', '#8b5cf6', '#ec4899'], borderRadius: 6 }] }} options={{ ...chartOpts, indexAxis: 'y' }} /></div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Trip Status Distribution</h3>
                    <div className="chart-wrap"><Doughnut data={{ labels: Object.keys(tripStatusDist), datasets: [{ data: Object.values(tripStatusDist), backgroundColor: ['#f59e0b', '#3B82F6', '#06b6d4', '#10b981'], borderWidth: 0, hoverOffset: 8 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3b4', padding: 16 } } } }} /></div>
                </div>
                <div className="chart-card">
                    <h3>Driver Safety Scores</h3>
                    <div className="chart-wrap"><Radar data={{ labels: driverScores.map(d => d.name), datasets: [{ label: 'Safety', data: driverScores.map(d => d.safety_score), backgroundColor: 'rgba(108,99,255,0.2)', borderColor: '#6C63FF', pointBackgroundColor: '#6C63FF' }, { label: 'Completion', data: driverScores.map(d => d.completion_rate), backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981', pointBackgroundColor: '#10b981' }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: 'rgba(42,45,62,0.5)' }, grid: { color: 'rgba(42,45,62,0.5)' }, pointLabels: { color: '#9ca3b4' }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } }, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3b4', padding: 16 } } } }} /></div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header"><h3>Monthly Summary</h3></div>
                <table><thead><tr><th>Month</th><th>Revenue</th><th>Fuel</th><th>Maintenance</th><th>Net Profit</th></tr></thead>
                    <tbody>{monthlySummary.map(m => (
                        <tr key={m.month}><td className="text-bold">{m.month}</td><td className="text-green">{fmt(m.revenue)}</td><td>{fmt(m.fuel)}</td><td>{fmt(m.maintenance)}</td>
                            <td className={`text-bold ${m.net >= 0 ? 'text-green' : 'text-red'}`}>{fmt(m.net)}</td></tr>
                    ))}</tbody></table>
            </div>
        </div>
    );
}
