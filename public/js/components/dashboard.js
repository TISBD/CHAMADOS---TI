/**
 * Componente do Dashboard Operacional e Matriz Mês a Mês
 */

class DashboardComponent {
  constructor() {
    this.charts = {};
  }

  async loadDashboard() {
    try {
      const res = await window.api.get('/dashboard/metrics');
      const { kpis, charts } = res.data;
      this.renderKpis(kpis);
      this.renderCharts(charts);
      this.renderMonthlyMatrix(charts.monthlyMatrix);
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    }
  }

  renderKpis(kpis) {
    document.getElementById('kpiTotal').textContent = kpis.total || 0;
    document.getElementById('kpiOpen').textContent = kpis.open || 0;
    document.getElementById('kpiInProgress').textContent = kpis.inProgress || 0;
    document.getElementById('kpiResolved').textContent = kpis.resolved || 0;
    document.getElementById('kpiMttr').textContent = kpis.mttr?.formatted || '0m';
    document.getElementById('kpiMtta').textContent = kpis.mtta?.formatted || '0m';
    document.getElementById('kpiSla').textContent = `${kpis.slaCompliance?.percentage || 100}%`;
    document.getElementById('kpiCsat').textContent = `${kpis.csat?.average || '5.0'} / 5.0`;
  }

  renderCharts(chartsData) {
    if (typeof Chart === 'undefined') return;

    // Destrói instâncias anteriores
    if (this.charts.cat) this.charts.cat.destroy();
    if (this.charts.dept) this.charts.dept.destroy();
    if (this.charts.prio) this.charts.prio.destroy();

    // 1. Gráfico de Categorias
    const ctxCat = document.getElementById('chartCategories');
    if (ctxCat) {
      const catLabels = chartsData.categories.map(c => c.name);
      const catCounts = chartsData.categories.map(c => c.count);
      const catColors = chartsData.categories.map(c => c.color || '#6366f1');

      this.charts.cat = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catCounts,
            backgroundColor: catColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, color: '#9ca3af' } }
          }
        }
      });
    }

    // 2. Gráfico de Departamentos
    const ctxDept = document.getElementById('chartDepartments');
    if (ctxDept) {
      const deptLabels = chartsData.departments.map(d => d.code || d.name);
      const deptCounts = chartsData.departments.map(d => d.count);

      this.charts.dept = new Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: deptLabels,
          datasets: [{
            label: 'Chamados por Setor',
            data: deptCounts,
            backgroundColor: '#06b6d4',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // 3. Gráfico de Prioridades
    const ctxPrio = document.getElementById('chartPriorities');
    if (ctxPrio) {
      const prioLabels = chartsData.priorities.map(p => p.priority);
      const prioCounts = chartsData.priorities.map(p => p.count);
      const colorMap = { CRITICA: '#ef4444', ALTA: '#f97316', MEDIA: '#3b82f6', BAIXA: '#10b981' };

      this.charts.prio = new Chart(ctxPrio, {
        type: 'pie',
        data: {
          labels: prioLabels,
          datasets: [{
            data: prioCounts,
            backgroundColor: prioLabels.map(p => colorMap[p] || '#6366f1'),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, color: '#9ca3af' } }
          }
        }
      });
    }
  }

  renderMonthlyMatrix(matrix) {
    const tableBody = document.getElementById('monthlyMatrixBody');
    const tableFoot = document.getElementById('monthlyMatrixFoot');
    if (!tableBody || !matrix) return;

    let totalGlobal = 0;
    matrix.monthlyTotals.forEach(t => totalGlobal += t);

    tableBody.innerHTML = matrix.categoryRows.map(row => {
      const share = totalGlobal > 0 ? ((row.total / totalGlobal) * 100).toFixed(1) : 0;
      const monthCols = row.monthlyCounts.map(count => {
        let bgStyle = '';
        if (count > 0) {
          const intensity = Math.min(1, count / 5);
          bgStyle = `background: rgba(99, 102, 241, ${0.15 + intensity * 0.4}); font-weight:700; color:#fff;`;
        }
        return `<td style="text-align:center; ${bgStyle}">${count}</td>`;
      }).join('');

      return `
        <tr>
          <td style="font-weight:600;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${row.color}; margin-right:8px;"></span>
            ${window.appState.escapeHtml(row.categoryName)}
          </td>
          ${monthCols}
          <td style="text-align:center; font-weight:700; background:var(--bg-surface-hover);">${row.total}</td>
          <td style="text-align:center; font-weight:600; color:var(--text-dim);">${share}%</td>
        </tr>
      `;
    }).join('');

    if (tableFoot) {
      const footCols = matrix.monthlyTotals.map(total => `
        <td style="text-align:center; font-weight:700;">${total}</td>
      `).join('');

      tableFoot.innerHTML = `
        <tr style="background:var(--bg-secondary); border-top:2px solid var(--border-color);">
          <td style="font-weight:700; text-transform:uppercase;">Total Mensal</td>
          ${footCols}
          <td style="text-align:center; font-weight:800; color:var(--primary); font-size:1rem;">${totalGlobal}</td>
          <td style="text-align:center; font-weight:700;">100%</td>
        </tr>
      `;
    }
  }
}

window.dashboardComponent = new DashboardComponent();
