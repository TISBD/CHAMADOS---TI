/**
 * Controlador Geral da SPA - HelpDesk Pro
 */

class AppController {
  constructor() {
    this.currentTab = 'tickets';
  }

  async init() {
    this.setupTheme();
    this.setupEventListeners();
    window.kbComponent.setupDeflectionListener();

    // Verifica autenticação
    const token = window.api.getToken();
    if (token) {
      try {
        const res = await window.api.get('/auth/me');
        window.appState.setUser(res.data);
        this.onAuthenticated();
      } catch (e) {
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  }

  setupTheme() {
    const saved = localStorage.getItem('HELPDESK_THEME') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeIcon(saved);

    const btnTheme = document.getElementById('btnThemeToggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('HELPDESK_THEME', next);
        this.updateThemeIcon(next);
      });
    }
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
    }
  }

  showLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.display = 'flex';
  }

  hideLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  onAuthenticated() {
    this.hideLogin();
    this.updateUserBadge();
    this.applyRbacVisibility();
    this.loadAuxiliaryData();
    this.switchTab('tickets');
    this.loadNotifications();
  }

  updateUserBadge() {
    const user = window.appState.getUser();
    if (!user) return;

    const avatar = document.getElementById('sidebarAvatar');
    const name = document.getElementById('sidebarUserName');
    const role = document.getElementById('sidebarUserRole');

    if (avatar) avatar.src = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
    if (name) name.textContent = user.name;
    if (role) {
      role.className = `user-role-badge role-${user.role}`;
      role.textContent = user.role === 'admin' ? 'Administrador' : (user.role === 'technician' ? 'Técnico de TI' : 'Colaborador');
    }
  }

  applyRbacVisibility() {
    const isTech = window.appState.isTechnician();
    const isAdmin = window.appState.isAdmin();

    // Abas restritas
    const tabDash = document.querySelector('[data-tab="dashboard"]');
    if (tabDash) tabDash.style.display = isTech ? 'flex' : 'none';

    const tabUsers = document.querySelector('[data-tab="users"]');
    if (tabUsers) tabUsers.style.display = isAdmin ? 'flex' : 'none';

    const tabAudit = document.querySelector('[data-tab="audit"]');
    if (tabAudit) tabAudit.style.display = isAdmin ? 'flex' : 'none';
  }

  async loadAuxiliaryData() {
    try {
      const [cats, depts, assets] = await Promise.all([
        window.api.get('/categories'),
        window.api.get('/departments'),
        window.api.get('/assets')
      ]);

      window.appState.categories = cats.data;
      window.appState.departments = depts.data;
      window.appState.assets = assets.data;

      this.populateDropdowns();
    } catch (e) {
      console.warn('Erro ao carregar dados auxiliares:', e);
    }
  }

  populateDropdowns() {
    // Categorias no modal de Novo Chamado
    const selectCat = document.getElementById('newTicketCategory');
    const filterCat = document.getElementById('filterCategory');
    if (selectCat && window.appState.categories) {
      selectCat.innerHTML = '<option value="">Selecione a Categoria...</option>' +
        window.appState.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
    if (filterCat && window.appState.categories) {
      filterCat.innerHTML = '<option value="all">Todas as Categorias</option>' +
        window.appState.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Ativos no modal de Novo Chamado
    const selectAsset = document.getElementById('newTicketAsset');
    if (selectAsset && window.appState.assets) {
      selectAsset.innerHTML = '<option value="">Nenhum ativo vinculado</option>' +
        window.appState.assets.map(a => `<option value="${a.id}">${a.asset_tag} - ${a.name}</option>`).join('');
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Atualiza navegação
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
    });

    // Exibe a view correspondente
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    // Carrega dados da view
    if (tabId === 'tickets') {
      window.ticketsComponent.init();
    } else if (tabId === 'dashboard') {
      window.dashboardComponent.loadDashboard();
    } else if (tabId === 'kb') {
      window.kbComponent.loadArticles();
    } else if (tabId === 'assets') {
      window.assetsComponent.loadAssets();
    } else if (tabId === 'users') {
      window.usersComponent.loadUsers();
    } else if (tabId === 'audit') {
      window.auditComponent.loadAuditLogs();
    }
  }

  setupEventListeners() {
    // Navegação por abas
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
      el.addEventListener('click', () => {
        const tab = el.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Form de Login
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const btnSubmit = formLogin.querySelector('button[type="submit"]');

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

        try {
          const res = await window.api.post('/auth/login', { email, password });
          window.api.setToken(res.data.token);
          window.appState.setUser(res.data.user);
          this.onAuthenticated();
          this.showToast(`Bem-vindo, ${res.data.user.name}!`, 'success');
        } catch (err) {
          this.showToast(err.message, 'danger');
        } finally {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = 'Acessar Central de TI <i class="fa-solid fa-arrow-right"></i>';
        }
      });
    }

    // Botões Demo de Login Rápido
    document.querySelectorAll('.btn-demo').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const pass = btn.getAttribute('data-pass');
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = pass;
        formLogin.requestSubmit();
      });
    });

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        window.api.setToken(null);
        window.appState.setUser(null);
        this.showLogin();
      });
    }

    // Modal de Novo Chamado
    const btnOpenNewTicket = document.getElementById('btnOpenNewTicket');
    const modalNewTicket = document.getElementById('newTicketModal');
    if (btnOpenNewTicket && modalNewTicket) {
      btnOpenNewTicket.addEventListener('click', () => {
        modalNewTicket.classList.add('active');
      });
    }

    // Form de Criação de Chamado
    const formNewTicket = document.getElementById('formNewTicket');
    if (formNewTicket) {
      formNewTicket.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('newTicketTitle').value.trim();
        const category_id = document.getElementById('newTicketCategory').value;
        const priority = document.getElementById('newTicketPriority').value;
        const asset_id = document.getElementById('newTicketAsset').value;
        const description = document.getElementById('newTicketDescription').value.trim();
        const fileInput = document.getElementById('newTicketFile');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_id', category_id);
        formData.append('priority', priority);
        if (asset_id) formData.append('asset_id', asset_id);
        formData.append('description', description);
        if (fileInput && fileInput.files[0]) {
          formData.append('attachment', fileInput.files[0]);
        }

        const btn = formNewTicket.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';

        try {
          const res = await window.api.post('/tickets', formData);
          this.showToast(`Chamado #${res.data.code} aberto com sucesso!`, 'success');
          modalNewTicket.classList.remove('active');
          formNewTicket.reset();
          document.getElementById('kbSuggestionsBox').style.display = 'none';
          window.ticketsComponent.loadTickets();
        } catch (err) {
          this.showToast(err.message, 'danger');
        } finally {
          btn.disabled = false;
          btn.innerHTML = 'Abrir Chamado';
        }
      });
    }

    // Form de Resolução Técnica
    const formResolve = document.getElementById('formResolveTicket');
    if (formResolve) {
      formResolve.addEventListener('submit', async (e) => {
        e.preventDefault();
        const modal = document.getElementById('resolveModal');
        const ticketId = modal.getAttribute('data-ticket-id');
        const summary = document.getElementById('resolveSummary').value.trim();
        const rootCause = document.getElementById('resolveRootCause').value.trim();
        const timeSpent = document.getElementById('resolveTimeSpent').value;

        try {
          await window.api.patch(`/tickets/${ticketId}/status`, {
            status: 'RESOLVIDO',
            resolution_summary: summary,
            root_cause: rootCause,
            time_spent_minutes: timeSpent
          });
          this.showToast('Chamado resolvido com sucesso!', 'success');
          modal.classList.remove('active');
          formResolve.reset();
          window.ticketDetailComponent.openModal(ticketId);
          window.ticketsComponent.loadTickets();
        } catch (err) {
          this.showToast(err.message, 'danger');
        }
      });
    }

    // Form de Avaliação CSAT
    const formCsat = document.getElementById('formCsat');
    if (formCsat) {
      formCsat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const modal = document.getElementById('csatModal');
        const ticketId = modal.getAttribute('data-ticket-id');
        const rating = document.querySelector('input[name="csatRating"]:checked')?.value || 5;
        const comment = document.getElementById('csatComment').value.trim();

        try {
          await window.api.post('/csat', { ticket_id: ticketId, rating, comment });
          this.showToast('Avaliação registrada! Muito obrigado.', 'success');
          modal.classList.remove('active');
          formCsat.reset();
          window.ticketDetailComponent.openModal(ticketId);
        } catch (err) {
          this.showToast(err.message, 'danger');
        }
      });
    }

    // Fechar modais ao clicar no X ou fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('active');
      });
    });

    // Notificações Dropdown Toggle
    const btnNotif = document.getElementById('btnNotifications');
    const notifDropdown = document.getElementById('notificationsDropdown');
    if (btnNotif && notifDropdown) {
      btnNotif.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
      });
      document.addEventListener('click', () => notifDropdown.classList.remove('show'));
    }
  }

  async loadNotifications() {
    try {
      const res = await window.api.get('/notifications');
      const list = res.data || [];
      const unread = list.filter(n => !n.is_read);

      const dot = document.getElementById('notifDot');
      if (dot) dot.style.display = unread.length > 0 ? 'block' : 'none';

      const container = document.getElementById('notificationsList');
      if (!container) return;

      if (list.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:12px; color:var(--text-dim); font-size:0.8rem;">Nenhuma notificação recente.</div>';
        return;
      }

      container.innerHTML = list.slice(0, 5).map(n => `
        <div style="padding:8px 0; border-bottom:1px solid var(--border-color); font-size:0.8rem;">
          <div style="font-weight:600; color:var(--text-main);">${window.appState.escapeHtml(n.title)}</div>
          <div style="color:var(--text-muted); margin-top:2px;">${window.appState.escapeHtml(n.message)}</div>
          <div style="font-size:0.7rem; color:var(--text-dim); margin-top:2px;">${window.appState.formatDate(n.created_at)}</div>
        </div>
      `).join('');
    } catch (e) {}
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = {
      success: 'fa-circle-check',
      danger: 'fa-circle-xmark',
      info: 'fa-circle-info'
    };

    toast.innerHTML = `
      <i class="fa-solid ${iconMap[type] || 'fa-bell'}" style="font-size:1.1rem; color:var(--${type});"></i>
      <span>${window.appState.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.app = new AppController();
document.addEventListener('DOMContentLoaded', () => window.app.init());
