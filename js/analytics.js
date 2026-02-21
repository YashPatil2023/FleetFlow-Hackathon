/* ============================================
   FleetFlow — Module 8: Operational Analytics
   ============================================ */

const Analytics = {
    charts: [],

    render() {
        const vehicles = App.getData('vehicles') || [];
        const trips = App.getData('trips') || [];
        const expenses = App.getData('expenses') || [];
        const maintenance = App.getData('maintenance') || [];

        const totalFuel = expenses.reduce((s, e) => s + (e.fuelExpense || 0), 0);
        const totalMaint = maintenance.reduce((s, m) => s + (m.cost || 0), 0);
        const totalRevenue = trips.length * 5000; // Simulated revenue per trip
        const totalCost = totalFuel + totalMaint;
        const roi = totalCost > 0 ? (((totalRevenue - totalCost) / totalCost) * 100).toFixed(1) : 0;
        const utilRate = vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'Ready').length / vehicles.length) * 100) : 0;

        // Destroy old charts
        this.charts.forEach(c => c.destroy());
        this.charts = [];

        const main = document.getElementById('main-content');
        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Operational Analytics & Reports</h1>
                    <p class="page-header-sub">Business insights and financial reports</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="window.print()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Download Report
                    </button>
                </div>
            </div>

            <!-- KPIs -->
            <div class="kpi-grid">
                <div class="kpi-card yellow">
                    <div class="kpi-label">Total Fuel Cost</div>
                    <div class="kpi-value">${App.currency(totalFuel)}</div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-label">Fleet ROI</div>
                    <div class="kpi-value">${roi > 0 ? '+' : ''}${roi}%</div>
                    <div class="kpi-change ${roi >= 0 ? 'up' : 'down'}">${roi >= 0 ? '↑ Profitable' : '↓ Loss'}</div>
                </div>
                <div class="kpi-card blue">
                    <div class="kpi-label">Utilization Rate</div>
                    <div class="kpi-value">${utilRate}%</div>
                </div>
                <div class="kpi-card red">
                    <div class="kpi-label">Maintenance Spend</div>
                    <div class="kpi-value">${App.currency(totalMaint)}</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Fuel Efficiency Trend</h3>
                    <canvas id="chart-fuel"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Top 5 Costliest Vehicles</h3>
                    <canvas id="chart-vehicles"></canvas>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Trip Status Distribution</h3>
                    <canvas id="chart-trips"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Driver Safety Scores</h3>
                    <canvas id="chart-drivers"></canvas>
                </div>
            </div>

            <!-- Monthly Summary -->
            <div class="table-container mt-16">
                <div class="table-header">
                    <h3>Monthly Summary of Results</h3>
                </div>
                ${this.renderMonthlySummary(totalRevenue, totalFuel, totalMaint)}
            </div>
        `;

        // Init charts after DOM render
        setTimeout(() => this.initCharts(), 50);
    },

    initCharts() {
        const chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#9ca3b4', font: { family: 'Inter' } } }
            },
            scales: {
                x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(42,45,62,0.5)' } },
                y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(42,45,62,0.5)' } }
            }
        };

        // 1. Fuel Efficiency Trend (Line)
        const fuelCtx = document.getElementById('chart-fuel');
        if (fuelCtx) {
            const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
            const fuelData = this.generateTrendData(5, 2000, 5000);
            this.charts.push(new Chart(fuelCtx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Fuel Cost (₹)',
                        data: fuelData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#f59e0b',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: { ...chartDefaults, plugins: { ...chartDefaults.plugins } }
            }));
        }

        // 2. Top 5 Costliest Vehicles (Bar)
        const vehCtx = document.getElementById('chart-vehicles');
        if (vehCtx) {
            const vehicles = App.getData('vehicles') || [];
            const expenses = App.getData('expenses') || [];
            const trips = App.getData('trips') || [];
            const maint = App.getData('maintenance') || [];

            const costMap = {};
            vehicles.forEach(v => { costMap[v.id] = { label: v.make + ' ' + v.model, cost: 0 }; });

            expenses.forEach(e => {
                const t = trips.find(tr => tr.id === e.tripId);
                if (t && costMap[t.vehicleId]) costMap[t.vehicleId].cost += (e.fuelExpense || 0) + (e.miscExpense || 0);
            });
            maint.forEach(m => {
                if (costMap[m.vehicleId]) costMap[m.vehicleId].cost += m.cost || 0;
            });

            const sorted = Object.values(costMap).sort((a, b) => b.cost - a.cost).slice(0, 5);

            this.charts.push(new Chart(vehCtx, {
                type: 'bar',
                data: {
                    labels: sorted.map(s => s.label),
                    datasets: [{
                        label: 'Total Cost (₹)',
                        data: sorted.map(s => s.cost),
                        backgroundColor: ['#6C63FF', '#3B82F6', '#06b6d4', '#8b5cf6', '#ec4899'],
                        borderRadius: 6,
                        barThickness: 40
                    }]
                },
                options: { ...chartDefaults, indexAxis: 'y' }
            }));
        }

        // 3. Trip Status Distribution (Doughnut)
        const tripCtx = document.getElementById('chart-trips');
        if (tripCtx) {
            const trips = App.getData('trips') || [];
            const statuses = ['Dispatched', 'In Transit', 'Delivered', 'Completed'];
            const counts = statuses.map(s => trips.filter(t => t.status === s).length);

            this.charts.push(new Chart(tripCtx, {
                type: 'doughnut',
                data: {
                    labels: statuses,
                    datasets: [{
                        data: counts,
                        backgroundColor: ['#f59e0b', '#3B82F6', '#06b6d4', '#10b981'],
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#9ca3b4', font: { family: 'Inter' }, padding: 16 }
                        }
                    }
                }
            }));
        }

        // 4. Driver Safety Scores (Radar)
        const drvCtx = document.getElementById('chart-drivers');
        if (drvCtx) {
            const drivers = App.getData('drivers') || [];
            this.charts.push(new Chart(drvCtx, {
                type: 'radar',
                data: {
                    labels: drivers.map(d => d.name),
                    datasets: [{
                        label: 'Safety Score',
                        data: drivers.map(d => d.safetyScore),
                        backgroundColor: 'rgba(108,99,255,0.2)',
                        borderColor: '#6C63FF',
                        pointBackgroundColor: '#6C63FF',
                        pointRadius: 4
                    }, {
                        label: 'Completion Rate',
                        data: drivers.map(d => d.completionRate),
                        backgroundColor: 'rgba(16,185,129,0.2)',
                        borderColor: '#10b981',
                        pointBackgroundColor: '#10b981',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(42,45,62,0.5)' },
                            grid: { color: 'rgba(42,45,62,0.5)' },
                            pointLabels: { color: '#9ca3b4', font: { family: 'Inter', size: 12 } },
                            ticks: { display: false },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#9ca3b4', font: { family: 'Inter' }, padding: 16 }
                        }
                    }
                }
            }));
        }
    },

    generateTrendData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min)) + min);
        }
        return data;
    },

    renderMonthlySummary(revenue, fuel, maint) {
        // Simulate monthly breakdown
        const months = [
            { month: 'Oct 2025', rev: Math.round(revenue * 0.18), fuel: Math.round(fuel * 0.15), maint: Math.round(maint * 0.1) },
            { month: 'Nov 2025', rev: Math.round(revenue * 0.22), fuel: Math.round(fuel * 0.2), maint: Math.round(maint * 0.25) },
            { month: 'Dec 2025', rev: Math.round(revenue * 0.2), fuel: Math.round(fuel * 0.22), maint: Math.round(maint * 0.15) },
            { month: 'Jan 2026', rev: Math.round(revenue * 0.18), fuel: Math.round(fuel * 0.18), maint: Math.round(maint * 0.2) },
            { month: 'Feb 2026', rev: Math.round(revenue * 0.22), fuel: Math.round(fuel * 0.25), maint: Math.round(maint * 0.3) },
        ];

        return `
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Revenue</th>
                        <th>Fuel Costs</th>
                        <th>Maintenance</th>
                        <th>Net Profit</th>
                    </tr>
                </thead>
                <tbody>
                    ${months.map(m => {
            const net = m.rev - m.fuel - m.maint;
            return `
                            <tr>
                                <td class="text-bold">${m.month}</td>
                                <td class="text-green">${App.currency(m.rev)}</td>
                                <td>${App.currency(m.fuel)}</td>
                                <td>${App.currency(m.maint)}</td>
                                <td class="${net >= 0 ? 'text-green' : 'text-red'} text-bold">${App.currency(net)}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    }
};
