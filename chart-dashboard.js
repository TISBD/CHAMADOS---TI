// Módulo do Dashboard com visualização avançada dos Tipos de Problemas Mês a Mês
class DashboardManager {
  constructor() {
    this.chartMonthly = null;
    this.chartDistribution = null;
    this.chartSectors = null;
    this.currentChartType = 'bar'; // 'bar', 'line', 'stacked'
    this.selectedYear = 2026;
    this.selectedSectorFilter = 'all';

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    this.monthShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    this.monthNames = monthNames;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const yearSelect = document.getElementById('dashYearSelect');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        this.selectedYear = parseInt(e.target.value);
        this.render();
      });
    }

    const sectorSelect = document.getElementById('dashSectorSelect');
    if (sectorSelect) {
      sectorSelect.addEventListener('change', (e) => {
        this.selectedSectorFilter = e.target.value;
        this.render();
      });
    }

    const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
    chartTypeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        chartTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentChartType = btn.dataset.chartType;
        this.renderMonthlyChart();
      });
    });

    const exportBtn = document.getElementById('btnExportDashReport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportReport();
      });
    }
  }

  getFilteredTickets() {
    const tickets = window.db.getTickets();
    return tickets.filter(t => {
      const ticketYear = new Date(t.createdAt).getFullYear();
      if (ticketYear !== this.selectedYear) return false;
      if (this.selectedSectorFilter !== 'all' && t.sectorId !== this.selectedSectorFilter) return false;
      return true;
    });
  }

  render() {
    this.updateSectorFilterOptions();
    this.renderKPIs();
    this.renderMonthlyChart();
    this.renderDistributionChart();
    this.renderSectorChart();
    this.renderHeatmapTable();
  }

  updateSectorFilterOptions() {
    const select = document.getElementById('dashSectorSelect');
    if (!select) return;
    const currentVal = select.value;
    const sectors = window.db.getSectors();

    let html = '<option value="all">🏢 Todos os Setores</option>';
    sectors.forEach(s => {
      html += `<option value="${s.id}" ${s.id === currentVal ? 'selected' : ''}>${s.name}</option>`;
    });
    select.innerHTML = html;
  }

  renderKPIs() {
    const tickets = this.getFilteredTickets();
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === 'concluido').length;
    const inProgress = tickets.filter(t => t.status === 'em_atendimento').length;
    const open = tickets.filter(t => t.status === 'aberto').length;
    const critical = tickets.filter(t => t.priority === 'critica' || t.priority === 'alta').length;

    // Resolução %
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // MTTR (Tempo Médio de Atendimento com Solução)
    let totalHours = 0;
    let countWithTime = 0;
    tickets.forEach(t => {
      if (t.solution && t.solution.timeSpentHours) {
        totalHours += t.solution.timeSpentHours;
        countWithTime++;
      }
    });
    const avgHours = countWithTime > 0 ? (totalHours / countWithTime).toFixed(1) : '1.5';

    // Tipo mais incidente
    const typeCounts = {};
    tickets.forEach(t => {
      typeCounts[t.problemTypeName] = (typeCounts[t.problemTypeName] || 0) + 1;
    });
    let topType = 'N/A';
    let maxCount = 0;
    Object.entries(typeCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topType = name;
      }
    });

    document.getElementById('kpiTotalTickets').innerText = total;
    document.getElementById('kpiResolvedRate').innerText = `${resolutionRate}%`;
    document.getElementById('kpiResolvedCount').innerText = `${resolved} resolvidos de ${total}`;
    document.getElementById('kpiAvgResolutionTime').innerText = `${avgHours}h`;
    document.getElementById('kpiCriticalTickets').innerText = critical;
    document.getElementById('kpiTopProblem').innerText = topType;
    document.getElementById('kpiTopProblemCount').innerText = `${maxCount} ocorrência(s)`;
  }

  // Processamento Mês a Mês dos Tipos de Problemas
  getMonthlyDataByProblemType() {
    const tickets = this.getFilteredTickets();
    const problemTypes = window.db.getProblemTypes();

    // Map problemTypeId -> array de 12 meses
    const mapping = {};
    problemTypes.forEach(p => {
      mapping[p.id] = {
        name: p.name,
        color: p.color || '#6366f1',
        category: p.category,
        months: new Array(12).fill(0),
        total: 0
      };
    });

    tickets.forEach(t => {
      const d = new Date(t.createdAt);
      const m = d.getMonth(); // 0 a 11
      if (mapping[t.problemTypeId]) {
        mapping[t.problemTypeId].months[m] += 1;
        mapping[t.problemTypeId].total += 1;
      }
    });

    return mapping;
  }

  renderMonthlyChart() {
    const ctx = document.getElementById('chartMonthlyProblems');
    if (!ctx) return;

    if (this.chartMonthly) {
      this.chartMonthly.destroy();
    }

    const mapping = this.getMonthlyDataByProblemType();
    const isStacked = this.currentChartType === 'stacked';
    const chartType = this.currentChartType === 'line' ? 'line' : 'bar';

    const datasets = Object.values(mapping)
      .filter(item => item.total > 0 || true) // mostra todos ou ativos
      .map(item => {
        const baseColor = item.color;
        return {
          label: item.name,
          data: item.months,
          backgroundColor: chartType === 'line' ? this.hexToRgba(baseColor, 0.15) : this.hexToRgba(baseColor, 0.8),
          borderColor: baseColor,
          borderWidth: chartType === 'line' ? 3 : 1.5,
          borderRadius: chartType === 'bar' ? 6 : 0,
          tension: 0.35,
          fill: chartType === 'line',
          pointRadius: chartType === 'line' ? 4 : 0,
          pointHoverRadius: 6,
          stack: isStacked ? 'stack1' : undefined
        };
      });

    this.chartMonthly = new Chart(ctx, {
      type: chartType,
      data: {
        labels: this.monthShort,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              useBorderRadius: true,
              borderRadius: 3,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
                weight: '500'
              },
              color: document.body.classList.contains('light-theme') ? '#334155' : '#cbd5e1'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              title: (items) => `Mês: ${this.monthNames[items[0].dataIndex]} de ${this.selectedYear}`,
              footer: (items) => {
                const total = items.reduce((sum, item) => sum + item.parsed.y, 0);
                return `Total no mês: ${total} chamado(s)`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: isStacked,
            grid: {
              color: document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: document.body.classList.contains('light-theme') ? '#64748b' : '#94a3b8',
              font: { weight: '600' }
            }
          },
          y: {
            stacked: isStacked,
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: document.body.classList.contains('light-theme') ? '#64748b' : '#94a3b8'
            },
            grid: {
              color: document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)'
            }
          }
        }
      }
    });
  }

  renderDistributionChart() {
    const ctx = document.getElementById('chartDistribution');
    if (!ctx) return;

    if (this.chartDistribution) {
      this.chartDistribution.destroy();
    }

    const mapping = this.getMonthlyDataByProblemType();
    const items = Object.values(mapping).filter(i => i.total > 0);

    const labels = items.map(i => i.name);
    const data = items.map(i => i.total);
    const colors = items.map(i => i.color);

    this.chartDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: document.body.classList.contains('light-theme') ? '#ffffff' : '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              color: document.body.classList.contains('light-theme') ? '#334155' : '#cbd5e1'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${value} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  renderSectorChart() {
    const ctx = document.getElementById('chartSectors');
    if (!ctx) return;

    if (this.chartSectors) {
      this.chartSectors.destroy();
    }

    const tickets = this.getFilteredTickets();
    const sectors = window.db.getSectors();

    const sectorCounts = {};
    sectors.forEach(s => sectorCounts[s.id] = { name: s.name, color: s.color, count: 0 });

    tickets.forEach(t => {
      if (sectorCounts[t.sectorId]) {
        sectorCounts[t.sectorId].count += 1;
      }
    });

    const items = Object.values(sectorCounts);

    this.chartSectors = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: items.map(i => i.name.split('&')[0].trim()),
        datasets: [{
          label: 'Chamados por Setor',
          data: items.map(i => i.count),
          backgroundColor: items.map(i => this.hexToRgba(i.color, 0.75)),
          borderColor: items.map(i => i.color),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0, color: document.body.classList.contains('light-theme') ? '#64748b' : '#94a3b8' },
            grid: { color: document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: { color: document.body.classList.contains('light-theme') ? '#334155' : '#cbd5e1', font: { weight: '600' } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // Tabela / Matriz de Cruzamento Mês a Mês
  renderHeatmapTable() {
    const tableBody = document.getElementById('heatmapTableBody');
    if (!tableBody) return;

    const mapping = this.getMonthlyDataByProblemType();
    const totalTickets = this.getFilteredTickets().length;

    // Calcular totais por coluna (meses)
    const monthTotals = new Array(12).fill(0);
    Object.values(mapping).forEach(p => {
      p.months.forEach((val, idx) => {
        monthTotals[idx] += val;
      });
    });

    let html = '';
    Object.values(mapping).forEach(p => {
      const pct = totalTickets > 0 ? ((p.total / totalTickets) * 100).toFixed(1) : 0;
      
      html += `<tr>
        <td class="sticky-col">
          <div class="problem-label">
            <span class="color-dot" style="background-color: ${p.color}"></span>
            <strong>${p.name}</strong>
          </div>
        </td>`;

      p.months.forEach(val => {
        const heatClass = val === 0 ? 'heat-0' : val === 1 ? 'heat-1' : val === 2 ? 'heat-2' : 'heat-3';
        html += `<td class="text-center heat-cell ${heatClass}">
          <span>${val > 0 ? val : '-'}</span>
        </td>`;
      });

      html += `
        <td class="text-center font-bold text-highlight">${p.total}</td>
        <td class="text-center font-semibold text-muted">${pct}%</td>
      </tr>`;
    });

    // Linha de Rodapé com Totais Mensais
    let footerHtml = `<tr>
      <td class="sticky-col font-bold">TOTAL GERAL DO MÊS</td>`;
    monthTotals.forEach(mTot => {
      footerHtml += `<td class="text-center font-bold text-accent">${mTot}</td>`;
    });
    footerHtml += `
      <td class="text-center font-bold text-primary">${totalTickets}</td>
      <td class="text-center font-bold text-primary">100%</td>
    </tr>`;

    tableBody.innerHTML = html;
    const footerElem = document.getElementById('heatmapTableFooter');
    if (footerElem) {
      footerElem.innerHTML = footerHtml;
    }
  }

  exportReport() {
    const tickets = this.getFilteredTickets();
    const headers = ['ID', 'Título', 'Setor', 'Tipo de Problema', 'Prioridade', 'Status', 'Solicitante', 'Data Criação', 'Solução Aplicada', 'Tempo (h)'];
    
    const rows = tickets.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.sectorName}"`,
      `"${t.problemTypeName}"`,
      t.priority.toUpperCase(),
      t.status.toUpperCase(),
      `"${t.userName}"`,
      t.createdAt.split('T')[0],
      `"${(t.solution ? t.solution.summary : '').replace(/"/g, '""')}"`,
      t.solution ? t.solution.timeSpentHours : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_HelpDesk_Ano_${this.selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

window.dashboardManager = new DashboardManager();
