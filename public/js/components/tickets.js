/**
 * Componente de Gestão e Listagem de Chamados
 */

class TicketsComponent {
  constructor() {
    this.filters = {
      status: 'all',
      priority: 'all',
      category_id: 'all',
      department_id: 'all',
      search: '',
      orderBy: 'date'
    };
    this.pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
  }

  init() {
    this.bindEvents();
    this.loadTickets();
  }

  bindEvents() {
    const searchInput = document.getElementById('ticketSearch');
    if (searchInput) {
      let timeout = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.filters.search = e.target.value.trim();
          this.pagination.page = 1;
          this.loadTickets();
        }, 350);
      });
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.pagination.page = 1;
        this.loadTickets();
      });
    }

    const filterPriority = document.getElementById('filterPriority');
    if (filterPriority) {
      filterPriority.addEventListener('change', (e) => {
        this.filters.priority = e.target.value;
        this.pagination.page = 1;
        this.loadTickets();
      });
    }

    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) {
      filterCategory.addEventListener('change', (e) => {
        this.filters.category_id = e.target.value;
        this.pagination.page = 1;
        this.loadTickets();
      });
    }

    const btnPrev = document.getElementById('btnPrevPage');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.pagination.page > 1) {
          this.pagination.page -= 1;
          this.loadTickets();
        }
      });
    }

    const btnNext = document.getElementById('btnNextPage');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.pagination.page < this.pagination.totalPages) {
          this.pagination.page += 1;
          this.loadTickets();
        }
      });
    }
  }

  async loadTickets() {
    const tbody = document.getElementById('ticketsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 40px; color: var(--text-dim);">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 8px; display:block;"></i>
          Carregando chamados...
        </td>
      </tr>
    `;

    try {
      const res = await window.api.get('/tickets', {
        ...this.filters,
        page: this.pagination.page,
        limit: this.pagination.limit
      });

      this.pagination = res.pagination;
      this.renderTickets(res.data);
      this.renderPaginationInfo();
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 30px; color: var(--danger);">
            <i class="fa-solid fa-triangle-exclamation"></i> Falha ao carregar chamados: ${window.appState.escapeHtml(err.message)}
          </td>
        </tr>
      `;
    }
  }

  renderTickets(tickets) {
    const tbody = document.getElementById('ticketsTableBody');
    if (!tbody) return;

    if (!tickets || tickets.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 48px; color: var(--text-dim);">
            <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; display:block;"></i>
            Nenhum chamado encontrado com os filtros atuais.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      const sla = t.sla_compliance || {};
      const slaBadge = `<span class="badge-sla sla-${sla.status}">${sla.label || 'SLA'}</span>`;
      const techName = t.technician_name ? window.appState.escapeHtml(t.technician_name) : '<span style="color:var(--text-dim);font-style:italic;">Não atribuído</span>';
      const deptCode = t.department_code ? `<span style="font-size:0.75rem; color:var(--text-dim);">(${t.department_code})</span>` : '';

      return `
        <tr onclick="window.ticketDetailComponent.openModal('${t.id}')">
          <td style="font-weight:700; color:var(--primary); font-family:monospace; font-size:0.95rem;">
            #${window.appState.escapeHtml(t.code)}
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-main);">${window.appState.escapeHtml(t.title)}</div>
            <div style="font-size:0.75rem; color:var(--text-dim); display:flex; gap:10px; margin-top:2px;">
              <span><i class="fa-solid ${t.category_icon || 'fa-folder'}"></i> ${window.appState.escapeHtml(t.category_name || '-')}</span>
              ${t.asset_tag ? `<span><i class="fa-solid fa-laptop"></i> ${t.asset_tag}</span>` : ''}
            </div>
          </td>
          <td>
            <span class="badge-status status-${t.status}">
              ${this.getStatusLabel(t.status)}
            </span>
          </td>
          <td>
            <span class="badge-priority prio-${t.priority}">${t.priority}</span>
          </td>
          <td>
            ${slaBadge}
          </td>
          <td>
            <div style="font-size:0.85rem; font-weight:500;">${window.appState.escapeHtml(t.requester_name || '-')} ${deptCode}</div>
            <div style="font-size:0.75rem; color:var(--text-dim);">${window.appState.formatDate(t.created_at)}</div>
          </td>
          <td>
            <div style="font-size:0.85rem;">${techName}</div>
          </td>
        </tr>
      `;
    }).join('');
  }

  getStatusLabel(status) {
    const map = {
      ABERTO: 'Aberto',
      EM_TRIAGEM: 'Em Triagem',
      EM_ATENDIMENTO: 'Em Atendimento',
      PENDENTE_USUARIO: 'Pendente Usuário',
      RESOLVIDO: 'Resolvido',
      FECHADO: 'Fechado',
      CANCELADO: 'Cancelado'
    };
    return map[status] || status;
  }

  renderPaginationInfo() {
    const info = document.getElementById('paginationInfo');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');

    if (info) {
      info.textContent = `Página ${this.pagination.page} de ${this.pagination.totalPages} (${this.pagination.total} chamados)`;
    }
    if (btnPrev) btnPrev.disabled = this.pagination.page <= 1;
    if (btnNext) btnNext.disabled = this.pagination.page >= this.pagination.totalPages;
  }
}

window.ticketsComponent = new TicketsComponent();
