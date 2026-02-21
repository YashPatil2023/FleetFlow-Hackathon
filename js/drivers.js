/* ============================================
   FleetFlow — Module 7: Driver Performance & Safety
   ============================================ */

const Drivers = {
    render() {
        const drivers = App.getData('drivers') || [];
        const main = document.getElementById('main-content');

        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Driver Performance & Safety</h1>
                    <p class="page-header-sub">Monitor driver profiles, safety scores, and license status</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Drivers.openAddModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Driver
                    </button>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card blue">
                    <div class="kpi-label">Total Drivers</div>
                    <div class="kpi-value">${drivers.length}</div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-label">In Duty</div>
                    <div class="kpi-value">${drivers.filter(d => d.dutyStatus === 'In Duty').length}</div>
                </div>
                <div class="kpi-card yellow">
                    <div class="kpi-label">On Break</div>
                    <div class="kpi-value">${drivers.filter(d => d.dutyStatus === 'Taking a Break').length}</div>
                </div>
                <div class="kpi-card red">
                    <div class="kpi-label">Suspended</div>
                    <div class="kpi-value">${drivers.filter(d => d.dutyStatus === 'Suspended').length}</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3>Driver Profiles</h3>
                    <div class="table-filters">
                        <select id="drv-filter" onchange="Drivers.filter()">
                            <option value="">All Status</option>
                            <option value="In Duty">In Duty</option>
                            <option value="Taking a Break">Taking a Break</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>
                <div id="drivers-table-body">
                    ${this.renderTable(drivers)}
                </div>
            </div>
        `;
    },

    renderTable(drivers) {
        if (drivers.length === 0) {
            return '<div class="table-empty">No drivers registered yet.</div>';
        }
        const today = new Date().toISOString().split('T')[0];
        return `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>License #</th>
                        <th>Expiry</th>
                        <th>Completion Rate</th>
                        <th>Safety Score</th>
                        <th>Complaints</th>
                        <th>Duty Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${drivers.map(d => {
            const expired = d.expiry < today;
            const scoreClass = d.safetyScore >= 90 ? 'green' : d.safetyScore >= 70 ? 'yellow' : 'red';
            const dutyClass = d.dutyStatus === 'In Duty' ? 'green' : d.dutyStatus === 'Taking a Break' ? 'yellow' : 'red';
            return `
                            <tr>
                                <td class="text-bold">${d.name}</td>
                                <td>${d.license}</td>
                                <td>
                                    <span class="${expired ? 'text-red' : ''}">${d.expiry}</span>
                                    ${expired ? '<br><small class="text-red">⚠ EXPIRED — Locked</small>' : ''}
                                </td>
                                <td>
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <div style="flex:1;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;max-width:80px;">
                                            <div style="width:${d.completionRate}%;height:100%;background:var(--accent-green);border-radius:3px;"></div>
                                        </div>
                                        <span>${d.completionRate}%</span>
                                    </div>
                                </td>
                                <td><span class="badge badge-${scoreClass}">${d.safetyScore}%</span></td>
                                <td>${d.complaints}</td>
                                <td><span class="badge badge-${dutyClass}">${d.dutyStatus}</span></td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn edit" onclick="Drivers.openEditModal('${d.id}')" title="Edit">✎</button>
                                        <button class="action-btn delete" onclick="Drivers.delete('${d.id}')" title="Delete">✕</button>
                                    </div>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    },

    filter() {
        const status = document.getElementById('drv-filter').value;
        let drivers = App.getData('drivers') || [];
        if (status) drivers = drivers.filter(d => d.dutyStatus === status);
        document.getElementById('drivers-table-body').innerHTML = this.renderTable(drivers);
    },

    openAddModal() {
        const body = `
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="d-name" placeholder="e.g. Rajesh Kumar">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>License Number *</label>
                    <input type="text" id="d-license" placeholder="e.g. 23223">
                </div>
                <div class="form-group">
                    <label>License Expiry *</label>
                    <input type="date" id="d-expiry">
                </div>
            </div>
            <div class="form-group">
                <label>Duty Status</label>
                <select id="d-duty">
                    <option value="In Duty">In Duty</option>
                    <option value="Taking a Break">Taking a Break</option>
                    <option value="Suspended">Suspended</option>
                </select>
            </div>
            <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:12px;margin-top:8px;">
                <small style="color:var(--accent-blue);">ℹ <strong>Safety Lock:</strong> Drivers with expired licenses are automatically blocked from being assigned to new trips.</small>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Drivers.save()">Add Driver</button>
        `;
        App.showModal('Add New Driver', body, footer);
    },

    openEditModal(id) {
        const d = (App.getData('drivers') || []).find(dr => dr.id === id);
        if (!d) return;
        const body = `
            <input type="hidden" id="d-edit-id" value="${d.id}">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="d-name" value="${d.name}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>License Number *</label>
                    <input type="text" id="d-license" value="${d.license}">
                </div>
                <div class="form-group">
                    <label>License Expiry *</label>
                    <input type="date" id="d-expiry" value="${d.expiry}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duty Status</label>
                    <select id="d-duty">
                        <option ${d.dutyStatus === 'In Duty' ? 'selected' : ''}>In Duty</option>
                        <option ${d.dutyStatus === 'Taking a Break' ? 'selected' : ''}>Taking a Break</option>
                        <option ${d.dutyStatus === 'Suspended' ? 'selected' : ''}>Suspended</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Safety Score (%)</label>
                    <input type="number" id="d-score" value="${d.safetyScore}" min="0" max="100">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Completion Rate (%)</label>
                    <input type="number" id="d-rate" value="${d.completionRate}" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>Complaints</label>
                    <input type="number" id="d-complaints" value="${d.complaints}" min="0">
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Drivers.update()">Update Driver</button>
        `;
        App.showModal('Edit Driver', body, footer);
    },

    save() {
        const name = document.getElementById('d-name').value.trim();
        const license = document.getElementById('d-license').value.trim();
        const expiry = document.getElementById('d-expiry').value;
        const dutyStatus = document.getElementById('d-duty').value;

        if (!name || !license || !expiry) {
            App.toast('Please fill in all required fields', 'warning');
            return;
        }

        const drivers = App.getData('drivers') || [];
        const id = App.genId('D');
        drivers.push({
            id, name, license, expiry, dutyStatus,
            completionRate: 0, safetyScore: 100, complaints: 0
        });
        App.setData('drivers', drivers);
        App.closeModal();
        App.toast('Driver added successfully!', 'success');
        this.render();
    },

    update() {
        const editId = document.getElementById('d-edit-id').value;
        const drivers = App.getData('drivers') || [];
        const idx = drivers.findIndex(d => d.id === editId);
        if (idx === -1) return;

        drivers[idx].name = document.getElementById('d-name').value.trim();
        drivers[idx].license = document.getElementById('d-license').value.trim();
        drivers[idx].expiry = document.getElementById('d-expiry').value;
        drivers[idx].dutyStatus = document.getElementById('d-duty').value;
        drivers[idx].safetyScore = parseInt(document.getElementById('d-score').value) || 0;
        drivers[idx].completionRate = parseInt(document.getElementById('d-rate').value) || 0;
        drivers[idx].complaints = parseInt(document.getElementById('d-complaints').value) || 0;

        App.setData('drivers', drivers);
        App.closeModal();
        App.toast('Driver updated!', 'success');
        this.render();
    },

    delete(id) {
        if (!confirm('Remove this driver?')) return;
        let drivers = App.getData('drivers') || [];
        drivers = drivers.filter(d => d.id !== id);
        App.setData('drivers', drivers);
        App.toast('Driver removed', 'info');
        this.render();
    }
};
