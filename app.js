// Controlador Principal do Sistema HelpDesk Pro
class AppController {
  constructor() {
    this.currentTab = 'tickets'; // 'tickets', 'dashboard', 'management', 'kb'
    this.currentTicketFilter = {
      status: 'all',
      priority: 'all',
      sector: 'all',
      search: ''
    };
    this.selectedTicketId = null;
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  init() {
    // Purga imediata de qualquer chamado de teste antigo que possa estar no cache do navegador
    if (window.db && window.db.data && window.db.data.tickets) {
      const hasMockTickets = window.db.data.tickets.some(t => 
        t.title === 'Computador não liga após queda de energia' || 
        (t.id && t.id.startsWith('TICK-10'))
      );
      if (hasMockTickets) {
        window.db.data.tickets = [];
        window.db.saveData();
      }
    }

    this.setupTheme();
    this.setupAuth();

    // Se não estiver logado, exibe a tela de login e interrompe
    const authUser = window.db.getAuthenticatedUser();
    if (!authUser) {
      this.showLoginScreen();
      return;
    }

    this.hideLoginScreen();
    this.updateUserBadge(authUser);
    this.applyRolePermissions(authUser);
    this.setupUserSwitcher();
    this.setupNavigation();
    this.setupModals();
    this.setupTicketFilters();
    this.setupForms();
    this.renderAll();

    // Sincronização em segundo plano com o Google Sheets
    if (window.db && window.db.loadFromSheets) {
      window.db.loadFromSheets().then(loaded => {
        if (loaded) {
          const current = window.db.getAuthenticatedUser() || authUser;
          this.updateUserBadge(current);
          this.applyRolePermissions(current);
          this.setupUserSwitcher();
          this.renderAll();
          this.showToast('Conectado à Planilha Google Sheets com sucesso!', 'success');
        }
      });
    }
  }

  showLoginScreen() {
    const screen = document.getElementById('loginScreen');
    if (screen) {
      screen.classList.remove('d-none');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('loginEmail');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  hideLoginScreen() {
    const screen = document.getElementById('loginScreen');
    if (screen) {
      screen.classList.add('d-none');
      document.body.style.overflow = '';
    }
  }

  setupAuth() {
    if (this._authSetupDone) return;
    this._authSetupDone = true;

    const formLogin = document.getElementById('formLogin');
    const loginErrorMsg = document.getElementById('loginErrorMsg');
    const loginErrorText = document.getElementById('loginErrorText');
    const btnToggle = document.getElementById('btnTogglePassword');
    const pwdInput = document.getElementById('loginPassword');

    if (btnToggle && pwdInput) {
      btnToggle.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        btnToggle.innerHTML = isPwd ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (loginErrorMsg) loginErrorMsg.classList.add('d-none');

        const user = window.db.authenticate(username, password);
        if (user) {
          this.hideLoginScreen();
          this.updateUserBadge(user);
          this.applyRolePermissions(user);
          this.setupUserSwitcher();
          this.setupNavigation();
          this.setupModals();
          this.setupTicketFilters();
          this.setupForms();
          this.renderAll();
          this.showToast(`Bem-vindo(a), ${user.name}!`, 'success');
        } else {
          if (loginErrorMsg) {
            loginErrorMsg.classList.remove('d-none');
            if (loginErrorText) {
              loginErrorText.innerText = 'Nome de usuário ou senha inválidos. Tente novamente.';
            }
          }
        }
      });
    }

    // Botões de Logout
    const btnLogout = document.getElementById('btnLogout');
    const topbarBtnLogout = document.getElementById('topbarBtnLogout');

    const handleLogout = () => {
      if (confirm('Deseja realmente encerrar sua sessão?')) {
        window.db.logout();
        this.showLoginScreen();
        const pwdInput = document.getElementById('loginPassword');
        if (pwdInput) pwdInput.value = '';
        this.showToast('Sessão encerrada com sucesso.', 'info');
      }
    };

    if (btnLogout) btnLogout.addEventListener('click', handleLogout);
    if (topbarBtnLogout) topbarBtnLogout.addEventListener('click', handleLogout);
  }

  setupTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('HELPDESK_THEME') || 'dark';
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
      document.body.classList.remove('light-theme');
      if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('HELPDESK_THEME', isLight ? 'light' : 'dark');
        themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        
        // Re-renderizar gráficos para atualizar cores de eixos
        if (window.dashboardManager) {
          window.dashboardManager.render();
        }
      });
    }
  }

  setupUserSwitcher() {
    const select = document.getElementById('userSwitcherSelect');
    if (!select) return;

    const users = window.db.getUsers();
    const currentUser = window.db.getCurrentUser();

    select.innerHTML = users.map(u => {
      const roleLabel = u.role === 'admin' ? '🛡️ Admin' : u.role === 'tech' ? '🔧 Técnico' : '👤 Usuário';
      return `<option value="${this.escapeHtml(u.id)}" ${u.id === currentUser.id ? 'selected' : ''}>
        ${this.escapeHtml(u.name)} (${roleLabel} - ${this.escapeHtml(u.sectorName)})
      </option>`;
    }).join('');

    select.addEventListener('change', (e) => {
      const user = window.db.setCurrentUser(e.target.value);
      this.updateUserBadge(user);
      this.applyRolePermissions(user);
      this.renderTickets();
      this.showToast(`Perfil alterado para: ${user.name} (${user.role.toUpperCase()})`, 'info');
    });

    this.updateUserBadge(currentUser);
    this.applyRolePermissions(currentUser);
  }

  updateUserBadge(user) {
    if (!user) return;

    // Topbar
    const topAvatar = document.getElementById('currentUserAvatar');
    const topName = document.getElementById('currentUserName');
    const topRole = document.getElementById('currentUserRole');

    const roleName = user.role === 'admin' ? 'ADMINISTRADOR' : user.role === 'tech' ? 'SUPORTE TÉCNICO' : 'COLABORADOR';
    const roleClass = `role-badge role-${user.role}`;

    if (topAvatar) topAvatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;
    if (topName) topName.innerText = user.name;
    if (topRole) {
      topRole.className = roleClass;
      topRole.innerText = roleName;
    }

    // Sidebar Footer
    const sideAvatar = document.getElementById('sidebarUserAvatar');
    const sideName = document.getElementById('sidebarUserName');
    const sideRole = document.getElementById('sidebarUserRole');

    if (sideAvatar) sideAvatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;
    if (sideName) sideName.innerText = user.name;
    if (sideRole) {
      sideRole.className = roleClass;
      sideRole.innerText = roleName;
    }
  }

  applyRolePermissions(user) {
    if (!user) return;
    const adminTabs = document.querySelectorAll('.admin-only');
    const adminCards = document.querySelectorAll('.admin-feature');
    const staffTabs = document.querySelectorAll('.staff-only');

    // Gestão de abas de Administrador
    if (user.role === 'admin') {
      adminTabs.forEach(el => el.classList.remove('d-none'));
      adminCards.forEach(el => el.classList.remove('d-none'));
    } else {
      adminTabs.forEach(el => el.classList.add('d-none'));
      adminCards.forEach(el => el.classList.add('d-none'));
    }

    // Perfil Padrão (Colaborador comum): Apenas abertura e acompanhamento de chamados
    if (user.role === 'user') {
      staffTabs.forEach(el => el.classList.add('d-none'));
      // Se estiver em outra aba (dashboard, kb, gestão), redireciona obrigatoriamente para chamados
      if (this.currentTab !== 'tickets') {
        this.switchTab('tickets');
      }
    } else {
      staffTabs.forEach(el => el.classList.remove('d-none'));
    }
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-tab-link');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Sub-abas da gestão admin
    const adminSubTabs = document.querySelectorAll('.admin-subnav-btn');
    adminSubTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        adminSubTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.subtab;
        document.querySelectorAll('.admin-subtab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        const activePane = document.getElementById(`subtab-${target}`);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  switchTab(tabName) {
    const user = window.db.getCurrentUser();
    
    // Bloqueios de perfil
    if (user.role === 'user' && tabName !== 'tickets') {
      this.showToast('Acesso exclusivo ao painel de chamados para colaboradores.', 'info');
      return;
    }

    if (tabName === 'management' && user.role !== 'admin') {
      this.showToast('Acesso restrito: Apenas administradores têm acesso à Gestão e Controle.', 'error');
      return;
    }

    this.currentTab = tabName;

    // Atualizar links
    document.querySelectorAll('.nav-tab-link').forEach(item => {
      if (item.dataset.tab === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Atualizar seções
    document.querySelectorAll('.app-tab-content').forEach(section => {
      section.classList.remove('active');
    });

    const activeSection = document.getElementById(`tab-${tabName}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    if (tabName === 'dashboard') {
      window.dashboardManager.init();
    } else if (tabName === 'management') {
      this.renderManagementTables();
    } else if (tabName === 'kb') {
      this.renderKnowledgeBase();
    } else {
      this.renderTickets();
    }
  }

  setupTicketFilters() {
    const searchInput = document.getElementById('ticketSearchInput');
    const statusSelect = document.getElementById('filterStatus');
    const prioritySelect = document.getElementById('filterPriority');
    const sectorSelect = document.getElementById('filterSector');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentTicketFilter.search = e.target.value.toLowerCase();
        this.renderTickets();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentTicketFilter.status = e.target.value;
        this.renderTickets();
      });
    }

    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        this.currentTicketFilter.priority = e.target.value;
        this.renderTickets();
      });
    }

    if (sectorSelect) {
      sectorSelect.addEventListener('change', (e) => {
        this.currentTicketFilter.sector = e.target.value;
        this.renderTickets();
      });
    }
  }

  setupModals() {
    // Abrir Modal de Novo Chamado
    const btnNewTicket = document.getElementById('btnOpenNewTicket');
    if (btnNewTicket) {
      btnNewTicket.addEventListener('click', () => {
        this.openModal('modalNewTicket');
        this.populateNewTicketSelects();
      });
    }

    // Botão Limpar Chamados (Zerar base)
    const btnClear = document.getElementById('btnClearAllTickets');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Atenção: Deseja realmente zerar todos os chamados da base? Esta ação é definitiva.')) {
          window.db.resetTickets();
          this.renderAll();
          if (window.dashboardManager) window.dashboardManager.render();
          this.showToast('Todos os chamados foram removidos com sucesso! Base limpa.', 'info');
        }
      });
    }

    // Fechar modais ao clicar no X ou fora
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.btn-close-modal')) {
          this.closeModal(modal.id);
        }
      });
    });

    // Atalho ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          this.closeModal(m.id);
        });
      }
    });

    // Botões de cadastro no Admin
    const btnNewUser = document.getElementById('btnOpenNewUserModal');
    if (btnNewUser) {
      btnNewUser.addEventListener('click', () => {
        this.populateSectorSelect('newUserSectorSelect');
        this.openModal('modalNewUser');
      });
    }

    const btnNewSector = document.getElementById('btnOpenNewSectorModal');
    if (btnNewSector) {
      btnNewSector.addEventListener('click', () => {
        this.openModal('modalNewSector');
      });
    }

    const btnNewProblemType = document.getElementById('btnOpenNewProblemTypeModal');
    if (btnNewProblemType) {
      btnNewProblemType.addEventListener('click', () => {
        this.openModal('modalNewProblemType');
      });
    }

    // Botão resetar dados
    const btnReset = document.getElementById('btnResetDatabase');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Deseja realmente restaurar os dados de demonstração iniciais? Suas alterações locais serão resetadas.')) {
          window.db.resetToDefault();
          this.showToast('Base de dados restaurada com sucesso!', 'success');
          this.init();
        }
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  setupForms() {
    // Form Novo Chamado
    const formNewTicket = document.getElementById('formNewTicket');
    if (formNewTicket) {
      formNewTicket.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = window.db.getCurrentUser();

        const data = {
          title: document.getElementById('ticketTitle').value.trim(),
          sectorId: document.getElementById('ticketSectorSelect').value,
          problemTypeId: document.getElementById('ticketProblemTypeSelect').value,
          priority: document.getElementById('ticketPrioritySelect').value,
          assetTag: document.getElementById('ticketAssetTag').value.trim() || 'NÃO ESPECIFICADO',
          description: document.getElementById('ticketDescription').value.trim(),
          userId: currentUser.id
        };

        if (!data.title || !data.description) {
          this.showToast('Por favor preencha todos os campos obrigatórios.', 'warning');
          return;
        }

        const newTicket = window.db.createTicket(data);
        this.closeModal('modalNewTicket');
        formNewTicket.reset();
        this.showToast(`Chamado #${newTicket.id} aberto com sucesso!`, 'success');
        this.renderTickets();

        // Se o modal de detalhes puder ser aberto, abre direto
        this.openTicketDetails(newTicket.id);
      });
    }

    // Form Solução Aplicada
    const formSolution = document.getElementById('formApplySolution');
    if (formSolution) {
      formSolution.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!this.selectedTicketId) return;

        const summary = document.getElementById('solutionSummary').value.trim();
        const timeSpent = document.getElementById('solutionTimeSpent').value;
        const notes = document.getElementById('solutionNotes').value.trim();

        if (!summary) {
          this.showToast('Por favor descreva a solução técnica aplicada.', 'warning');
          return;
        }

        window.db.applySolution(this.selectedTicketId, {
          appliedBy: window.db.getCurrentUser().name,
          summary: summary,
          timeSpentHours: timeSpent,
          preventiveNotes: notes
        });

        this.showToast('Solução aplicada registrada e chamado CONCLUÍDO!', 'success');
        this.renderTicketDetailsContent(this.selectedTicketId);
        this.renderTickets();
      });
    }

    // Form Comentário / Interação
    const formComment = document.getElementById('formAddComment');
    if (formComment) {
      formComment.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = document.getElementById('commentInput');
        const text = textInput.value.trim();
        if (!text || !this.selectedTicketId) return;

        window.db.addComment(this.selectedTicketId, text, window.db.getCurrentUser().name);
        textInput.value = '';
        this.renderTicketDetailsContent(this.selectedTicketId);
        this.showToast('Mensagem enviada no chamado.', 'info');
      });
    }

    // Form Novo Usuário
    const formNewUser = document.getElementById('formNewUser');
    if (formNewUser) {
      formNewUser.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newUserName').value.trim();
        const username = document.getElementById('newUserUsername').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const role = document.getElementById('newUserRole').value;
        const sectorId = document.getElementById('newUserSectorSelect').value;
        const jobTitle = document.getElementById('newUserJobTitle').value.trim();
        const password = document.getElementById('newUserPassword').value.trim();

        if (!name || !username || !password) {
          this.showToast('Por favor preencha nome, nome de usuário e senha.', 'warning');
          return;
        }

        try {
          window.db.createUser({ name, username, email, role, sectorId, jobTitle, password });
          this.closeModal('modalNewUser');
          formNewUser.reset();
          this.showToast(`Usuário @${username} cadastrado com sucesso!`, 'success');
          this.setupUserSwitcher();
          this.renderManagementTables();
        } catch (err) {
          this.showToast(err.message || 'Erro ao cadastrar usuário.', 'error');
        }
      });
    }

    // Form Editar Usuário / Administrador
    const formEditUser = document.getElementById('formEditUser');
    if (formEditUser) {
      formEditUser.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editUserId').value;
        const name = document.getElementById('editUserName').value.trim();
        const username = document.getElementById('editUserUsername').value.trim();
        const email = document.getElementById('editUserEmail').value.trim();
        const role = document.getElementById('editUserRole').value;
        const sectorId = document.getElementById('editUserSectorSelect').value;
        const jobTitle = document.getElementById('editUserJobTitle').value.trim();
        const password = document.getElementById('editUserPassword').value.trim();

        const updatePayload = { name, username, email, role, sectorId, jobTitle };
        if (password) {
          updatePayload.password = password;
        }

        try {
          window.db.updateUser(id, updatePayload);
          this.closeModal('modalEditUser');
          this.showToast(`Cadastro de @${username} atualizado com sucesso!`, 'success');
          this.setupUserSwitcher();
          this.renderManagementTables();
        } catch (err) {
          this.showToast(err.message || 'Erro ao atualizar usuário.', 'error');
        }
      });
    }

    // Form Novo Setor
    const formNewSector = document.getElementById('formNewSector');
    if (formNewSector) {
      formNewSector.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newSectorName').value.trim();
        const code = document.getElementById('newSectorCode').value.trim();
        const color = document.getElementById('newSectorColor').value;

        window.db.createSector({ name, code, color });
        this.closeModal('modalNewSector');
        formNewSector.reset();
        this.showToast(`Setor "${name}" criado com sucesso!`, 'success');
        this.populateFilterSectors();
        this.renderManagementTables();
      });
    }

    // Form Novo Tipo de Problema
    const formNewProblemType = document.getElementById('formNewProblemType');
    if (formNewProblemType) {
      formNewProblemType.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newProbName').value.trim();
        const category = document.getElementById('newProbCategory').value.trim();
        const slaHours = document.getElementById('newProbSla').value;
        const color = document.getElementById('newProbColor').value;

        window.db.createProblemType({ name, category, slaHours, color });
        this.closeModal('modalNewProblemType');
        formNewProblemType.reset();
        this.showToast(`Tipo de problema "${name}" criado com sucesso!`, 'success');
        this.renderManagementTables();
      });
    }
  }

  populateFilterSectors() {
    const filterSector = document.getElementById('filterSector');
    if (!filterSector) return;

    const sectors = window.db.getSectors();
    let html = '<option value="all">Todos os Setores</option>';
    sectors.forEach(s => {
      html += `<option value="${s.id}">${s.name}</option>`;
    });
    filterSector.innerHTML = html;
  }

  populateNewTicketSelects() {
    const sectorSelect = document.getElementById('ticketSectorSelect');
    const problemSelect = document.getElementById('ticketProblemTypeSelect');
    const sectors = window.db.getSectors();
    const problemTypes = window.db.getProblemTypes();
    const currentUser = window.db.getCurrentUser();

    if (sectorSelect) {
      sectorSelect.innerHTML = sectors.map(s => 
        `<option value="${s.id}" ${s.id === currentUser.sectorId ? 'selected' : ''}>${s.name}</option>`
      ).join('');
    }

    if (problemSelect) {
      problemSelect.innerHTML = problemTypes.map(p => 
        `<option value="${p.id}">${p.name} (${p.category}) - SLA: ${p.slaHours}h</option>`
      ).join('');
    }
  }

  populateSectorSelect(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const sectors = window.db.getSectors();
    el.innerHTML = sectors.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  renderAll() {
    this.populateFilterSectors();
    this.renderTickets();
  }

  renderTickets() {
    const container = document.getElementById('ticketsContainer');
    if (!container) return;

    const allTickets = window.db.getTickets();
    const currentUser = window.db.getCurrentUser();

    // Filtros
    let filtered = allTickets.filter(t => {
      // Se for usuário comum, ele vê apenas os seus chamados ou do seu setor
      if (currentUser.role === 'user') {
        const isMyTicket = t.userId === currentUser.id || t.sectorId === currentUser.sectorId;
        if (!isMyTicket) return false;
      }

      if (this.currentTicketFilter.status !== 'all' && t.status !== this.currentTicketFilter.status) return false;
      if (this.currentTicketFilter.priority !== 'all' && t.priority !== this.currentTicketFilter.priority) return false;
      if (this.currentTicketFilter.sector !== 'all' && t.sectorId !== this.currentTicketFilter.sector) return false;

      if (this.currentTicketFilter.search) {
        const q = this.currentTicketFilter.search;
        const matches = t.id.toLowerCase().includes(q) ||
                        t.title.toLowerCase().includes(q) ||
                        t.description.toLowerCase().includes(q) ||
                        t.userName.toLowerCase().includes(q) ||
                        t.problemTypeName.toLowerCase().includes(q) ||
                        (t.solution && t.solution.summary.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });

    // Atualizar badge de contagem
    const countBadge = document.getElementById('ticketResultsCount');
    if (countBadge) {
      countBadge.innerText = `${filtered.length} chamado(s)`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-inbox"></i></div>
          <h3>Nenhum chamado encontrado</h3>
          <p class="text-muted">Não há registros para os filtros selecionados ou para o seu perfil.</p>
          <button class="btn btn-primary mt-3" onclick="app.switchTab('tickets'); document.getElementById('btnOpenNewTicket').click();">
            <i class="fa-solid fa-plus"></i> Abrir Novo Chamado
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(t => {
      const statusBadge = this.getStatusBadge(t.status);
      const priorityBadge = this.getPriorityBadge(t.priority);
      const dateFormatted = new Date(t.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const hasSolution = !!t.solution;

      html += `
        <div class="ticket-card ${t.status}" onclick="app.openTicketDetails('${this.escapeHtml(t.id)}')">
          <div class="ticket-header">
            <div class="ticket-meta-left">
              <span class="ticket-id">${this.escapeHtml(t.id)}</span>
              <span class="ticket-date"><i class="fa-regular fa-clock"></i> ${dateFormatted}</span>
              <span class="ticket-sector-tag"><i class="fa-solid fa-building"></i> ${this.escapeHtml(t.sectorName)}</span>
            </div>
            <div class="ticket-badges">
              ${priorityBadge}
              ${statusBadge}
            </div>
          </div>

          <h3 class="ticket-title">${this.escapeHtml(t.title)}</h3>
          <p class="ticket-desc">${this.escapeHtml(t.description)}</p>

          <div class="ticket-tags-row">
            <span class="problem-type-pill">
              <i class="fa-solid fa-wrench"></i> ${this.escapeHtml(t.problemTypeName)}
            </span>
            <span class="asset-tag-pill">
              <i class="fa-solid fa-barcode"></i> ${this.escapeHtml(t.assetTag)}
            </span>
            <span class="requester-pill">
              <i class="fa-solid fa-user"></i> ${this.escapeHtml(t.userName)}
            </span>
          </div>

          ${hasSolution ? `
            <div class="ticket-solution-preview">
              <div class="solution-preview-title">
                <i class="fa-solid fa-circle-check text-success"></i> Solução Aplicada por <strong>${this.escapeHtml(t.solution.appliedBy)}</strong>:
              </div>
              <div class="solution-preview-text">"${this.escapeHtml(t.solution.summary)}"</div>
            </div>
          ` : `
            <div class="ticket-waiting-badge">
              <i class="fa-solid fa-hourglass-half"></i> Aguardando diagnóstico e solução técnica
            </div>
          `}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  openTicketDetails(ticketId) {
    this.selectedTicketId = ticketId;
    this.renderTicketDetailsContent(ticketId);
    this.openModal('modalTicketDetails');
  }

  renderTicketDetailsContent(ticketId) {
    const t = window.db.getTicketById(ticketId);
    if (!t) return;

    const currentUser = window.db.getCurrentUser();
    const canManage = currentUser.role === 'admin' || currentUser.role === 'tech';

    document.getElementById('modalTicketTitle').innerText = `${t.id} - ${t.title}`;
    
    // Status badges no topo
    const badgeContainer = document.getElementById('modalTicketBadges');
    badgeContainer.innerHTML = `
      ${this.getPriorityBadge(t.priority)}
      ${this.getStatusBadge(t.status)}
    `;

    // Informações gerais
    const detailsContainer = document.getElementById('modalTicketInfo');
    detailsContainer.innerHTML = `
      <div class="info-grid">
        <div class="info-item">
          <label>Solicitante:</label>
          <div class="info-val"><strong>${this.escapeHtml(t.userName)}</strong> (${this.escapeHtml(t.userEmail)})</div>
        </div>
        <div class="info-item">
          <label>Setor / Departamento:</label>
          <div class="info-val"><i class="fa-solid fa-building"></i> ${this.escapeHtml(t.sectorName)}</div>
        </div>
        <div class="info-item">
          <label>Tipo de Problema:</label>
          <div class="info-val"><span class="badge-type">${this.escapeHtml(t.problemTypeName)}</span></div>
        </div>
        <div class="info-item">
          <label>Patrimônio / Equipamento:</label>
          <div class="info-val"><i class="fa-solid fa-tag"></i> ${this.escapeHtml(t.assetTag)}</div>
        </div>
        <div class="info-item">
          <label>Data de Abertura:</label>
          <div class="info-val">${new Date(t.createdAt).toLocaleString('pt-BR')}</div>
        </div>
        <div class="info-item">
          <label>Última Atualização:</label>
          <div class="info-val">${new Date(t.updatedAt).toLocaleString('pt-BR')}</div>
        </div>
      </div>
      
      <div class="ticket-full-description mt-3">
        <label>Descrição do Problema Relatado:</label>
        <p class="description-box">${this.escapeHtml(t.description)}</p>
      </div>
    `;

    // Bloco da Solução Aplicada
    const solutionContainer = document.getElementById('modalTicketSolutionSection');
    if (t.solution) {
      solutionContainer.innerHTML = `
        <div class="applied-solution-card">
          <div class="solution-header">
            <h4><i class="fa-solid fa-circle-check text-success"></i> Solução Aplicada com Sucesso</h4>
            <span class="solution-date">${new Date(t.solution.date).toLocaleString('pt-BR')}</span>
          </div>
          <div class="solution-body">
            <p class="solution-summary"><strong>Resumo Técnico:</strong> ${this.escapeHtml(t.solution.summary)}</p>
            ${t.solution.preventiveNotes ? `<p class="solution-preventive"><strong>Ações Preventivas / Recomendações:</strong> ${this.escapeHtml(t.solution.preventiveNotes)}</p>` : ''}
            <div class="solution-meta">
              <span><i class="fa-solid fa-user-gear"></i> Resolvido por: <strong>${this.escapeHtml(t.solution.appliedBy)}</strong></span>
              <span><i class="fa-solid fa-stopwatch"></i> Tempo de Execução: <strong>${this.escapeHtml(t.solution.timeSpentHours)} horas</strong></span>
            </div>
          </div>
        </div>
      `;
    } else {
      // Chamado ainda não tem solução
      if (canManage) {
        solutionContainer.innerHTML = `
          <div class="solution-form-container">
            <h4><i class="fa-solid fa-screwdriver-wrench"></i> Registrar Solução Técnica Aplicada</h4>
            <p class="text-muted">Ao registrar a solução, o chamado será marcado automaticamente como <strong>Concluído</strong>.</p>
            <form id="formApplySolution" class="mt-2">
              <div class="form-group mb-2">
                <label>Descrição da Solução Aplicada *</label>
                <textarea id="solutionSummary" class="form-control" rows="3" placeholder="Descreva os procedimentos executados para solucionar o problema..." required></textarea>
              </div>
              <div class="row-2-cols mb-2">
                <div class="form-group">
                  <label>Tempo Gasto (em horas)</label>
                  <input type="number" id="solutionTimeSpent" class="form-control" value="1.0" step="0.1" min="0.1" required>
                </div>
                <div class="form-group">
                  <label>Ações Preventivas / Observações</label>
                  <input type="text" id="solutionNotes" class="form-control" placeholder="Ex: Substituído cabo; orientado usuário.">
                </div>
              </div>
              <button type="submit" class="btn btn-success w-100">
                <i class="fa-solid fa-check-double"></i> Concluir Chamado e Salvar Solução
              </button>
            </form>
          </div>
        `;
        this.setupForms(); // reatacha o evento do form de solução
      } else {
        solutionContainer.innerHTML = `
          <div class="alert alert-info">
            <i class="fa-solid fa-clock"></i> Este chamado ainda está em análise pela equipe de suporte de TI. A solução aplicada será exibida aqui assim que o técnico finalizar o atendimento.
          </div>
        `;
      }
    }

    // Ações de Admin / Técnico (mudar status, atribuir técnico)
    const adminActionsContainer = document.getElementById('modalTicketAdminActions');
    if (canManage) {
      const techUsers = window.db.getUsers().filter(u => u.role === 'admin' || u.role === 'tech');
      
      adminActionsContainer.innerHTML = `
        <div class="admin-quick-actions">
          <label><strong>Gestão Rápida do Chamado (Admin/Técnico):</strong></label>
          <div class="actions-row mt-1">
            <div class="action-select-group">
              <span>Status:</span>
              <select id="quickStatusSelect" class="form-control form-control-sm">
                <option value="aberto" ${t.status === 'aberto' ? 'selected' : ''}>Aberto</option>
                <option value="em_atendimento" ${t.status === 'em_atendimento' ? 'selected' : ''}>Em Atendimento</option>
                <option value="concluido" ${t.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                <option value="cancelado" ${t.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>

            <div class="action-select-group">
              <span>Técnico Responsável:</span>
              <select id="quickTechSelect" class="form-control form-control-sm">
                <option value="">Não atribuído</option>
                ${techUsers.map(u => `<option value="${this.escapeHtml(u.id)}" ${u.id === t.assignedToId ? 'selected' : ''}>${this.escapeHtml(u.name)}</option>`).join('')}
              </select>
            </div>
            
            <button id="btnSaveQuickActions" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-floppy-disk"></i> Atualizar
            </button>
          </div>
        </div>
      `;

      document.getElementById('btnSaveQuickActions').addEventListener('click', () => {
        const newStatus = document.getElementById('quickStatusSelect').value;
        const newTech = document.getElementById('quickTechSelect').value || null;

        window.db.updateTicket(t.id, {
          status: newStatus,
          assignedToId: newTech
        });

        this.showToast('Chamado atualizado com sucesso!', 'success');
        this.renderTicketDetailsContent(t.id);
        this.renderTickets();
      });
    } else {
      adminActionsContainer.innerHTML = '';
    }

    // Histórico de comentários / Timeline
    const commentsList = document.getElementById('modalTicketTimeline');
    commentsList.innerHTML = t.comments.map(c => `
      <div class="timeline-entry">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-meta">
            <strong>${this.escapeHtml(c.authorName)}</strong> • <span>${new Date(c.date).toLocaleString('pt-BR')}</span>
          </div>
          <div class="timeline-text">${this.escapeHtml(c.text)}</div>
        </div>
      </div>
    `).join('');
  }

  renderManagementTables() {
    this.renderUsersTable();
    this.renderSectorsTable();
    this.renderProblemTypesTable();
  }

  renderUsersTable() {
    const tableBody = document.getElementById('tableUsersBody');
    if (!tableBody) return;

    const users = window.db.getUsers();
    const adminCount = users.filter(u => u.role === 'admin').length;

    tableBody.innerHTML = users.map(u => {
      const isSoleAdmin = u.role === 'admin' && adminCount <= 1;

      return `
      <tr>
        <td>
          <div class="user-row-cell">
            <img src="${encodeURI(u.avatar || '')}" class="avatar-sm" alt="${this.escapeHtml(u.name)}">
            <div>
              <strong>${this.escapeHtml(u.name)}</strong>
              <div class="text-muted text-xs">
                <span class="user-handle" style="color: var(--primary-light); font-weight: 600;">@${this.escapeHtml(u.username || 'usuario')}</span> • ${this.escapeHtml(u.email || 'Sem e-mail')}
              </div>
            </div>
          </div>
        </td>
        <td><span class="role-badge role-${this.escapeHtml(u.role)}">${this.escapeHtml(u.role.toUpperCase())}</span></td>
        <td>${this.escapeHtml(u.sectorName)}</td>
        <td>${this.escapeHtml(u.jobTitle)}</td>
        <td>${this.escapeHtml(u.phone || '-')}</td>
        <td class="text-right" style="white-space: nowrap;">
          <button class="btn btn-icon btn-outline btn-sm mr-1" onclick="app.openEditUserModal('${this.escapeHtml(u.id)}')" title="Editar Cadastro / Alterar Senha">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          ${!isSoleAdmin ? `
            <button class="btn btn-icon btn-danger-soft btn-sm" onclick="app.deleteUser('${this.escapeHtml(u.id)}')" title="Excluir Usuário">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          ` : `<span class="badge badge-locked" title="Único administrador ativo no sistema. Para remover, cadastre ou promova outro primeiro."><i class="fa-solid fa-shield"></i> Único Admin</span>`}
        </td>
      </tr>
      `;
    }).join('');
  }

  openEditUserModal(userId) {
    const user = window.db.getUserById(userId);
    if (!user) {
      this.showToast('Usuário não encontrado.', 'error');
      return;
    }

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name || '';
    document.getElementById('editUserUsername').value = user.username || '';
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserRole').value = user.role || 'user';
    document.getElementById('editUserJobTitle').value = user.jobTitle || '';
    document.getElementById('editUserPassword').value = '';

    const sectorSelect = document.getElementById('editUserSectorSelect');
    if (sectorSelect) {
      const sectors = window.db.getSectors();
      sectorSelect.innerHTML = sectors.map(s => 
        `<option value="${s.id}" ${s.id === user.sectorId ? 'selected' : ''}>${s.name}</option>`
      ).join('');
    }

    this.openModal('modalEditUser');
  }

  renderSectorsTable() {
    const tableBody = document.getElementById('tableSectorsBody');
    if (!tableBody) return;

    const sectors = window.db.getSectors();
    const tickets = window.db.getTickets();

    tableBody.innerHTML = sectors.map(s => {
      const ticketCount = tickets.filter(t => t.sectorId === s.id).length;
      return `
        <tr>
          <td>
            <div class="sector-tag" style="border-left: 4px solid ${s.color}">
              <i class="fa-solid ${s.icon || 'fa-building'}" style="color: ${s.color}"></i>
              <strong>${s.name}</strong>
            </div>
          </td>
          <td><code>${s.code}</code></td>
          <td><span class="badge badge-counter">${ticketCount} chamados</span></td>
          <td>
            <div class="color-preview-box" style="background-color: ${s.color}"></div>
          </td>
          <td class="text-right">
            <button class="btn btn-icon btn-danger-soft" onclick="app.deleteSector('${s.id}')" title="Excluir Setor">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderProblemTypesTable() {
    const tableBody = document.getElementById('tableProblemTypesBody');
    if (!tableBody) return;

    const problemTypes = window.db.getProblemTypes();
    const tickets = window.db.getTickets();

    tableBody.innerHTML = problemTypes.map(p => {
      const count = tickets.filter(t => t.problemTypeId === p.id).length;
      return `
        <tr>
          <td>
            <div class="problem-type-cell">
              <span class="color-dot" style="background-color: ${p.color}"></span>
              <strong>${p.name}</strong>
            </div>
          </td>
          <td><span class="badge badge-category">${p.category}</span></td>
          <td><i class="fa-regular fa-clock"></i> ${p.slaHours} horas</td>
          <td><span class="badge badge-counter">${count} ocorrência(s)</span></td>
          <td class="text-right">
            <button class="btn btn-icon btn-danger-soft" onclick="app.deleteProblemType('${p.id}')" title="Excluir Tipo de Problema">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderKnowledgeBase() {
    const container = document.getElementById('kbContainer');
    if (!container) return;

    const tickets = window.db.getTickets().filter(t => t.solution);

    if (tickets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-book-bookmark"></i></div>
          <h3>Nenhuma solução documentada ainda</h3>
          <p class="text-muted">À medida que chamados forem resolvidos pela equipe técnica, as soluções ficarão disponíveis nesta base.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tickets.map(t => `
      <div class="kb-card">
        <div class="kb-header">
          <span class="badge-type">${t.problemTypeName}</span>
          <span class="kb-date">${new Date(t.solution.date).toLocaleDateString('pt-BR')}</span>
        </div>
        <h4 class="kb-title">${t.title}</h4>
        <div class="kb-body">
          <p class="kb-solution"><strong>Solução:</strong> ${t.solution.summary}</p>
          ${t.solution.preventiveNotes ? `<p class="kb-notes"><strong>Observação Preventiva:</strong> ${t.solution.preventiveNotes}</p>` : ''}
        </div>
        <div class="kb-footer">
          <span><i class="fa-solid fa-user-check"></i> Autor: ${t.solution.appliedBy}</span>
          <span><i class="fa-solid fa-stopwatch"></i> Tempo: ${t.solution.timeSpentHours}h</span>
          <button class="btn btn-xs btn-outline" onclick="app.openTicketDetails('${t.id}')">Ver Chamado #${t.id}</button>
        </div>
      </div>
    `).join('');
  }

  deleteUser(id) {
    const currentUser = window.db.getCurrentUser();
    if (currentUser.role !== 'admin') {
      this.showToast('Acesso negado: apenas administradores podem remover usuários.', 'error');
      return;
    }
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        window.db.deleteUser(id);
        this.showToast('Usuário removido com sucesso.', 'info');
        this.setupUserSwitcher();
        this.renderUsersTable();
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }
  }

  deleteSector(id) {
    const currentUser = window.db.getCurrentUser();
    if (currentUser.role !== 'admin') {
      this.showToast('Acesso negado: apenas administradores podem remover setores.', 'error');
      return;
    }
    if (confirm('Tem certeza que deseja remover este setor?')) {
      window.db.deleteSector(id);
      this.showToast('Setor removido.', 'info');
      this.populateFilterSectors();
      this.renderSectorsTable();
    }
  }

  deleteProblemType(id) {
    const currentUser = window.db.getCurrentUser();
    if (currentUser.role !== 'admin') {
      this.showToast('Acesso negado: apenas administradores podem remover tipos de problema.', 'error');
      return;
    }
    if (confirm('Tem certeza que deseja remover este tipo de problema?')) {
      window.db.deleteProblemType(id);
      this.showToast('Tipo de problema removido.', 'info');
      this.renderProblemTypesTable();
    }
  }

  getStatusBadge(status) {
    switch (status) {
      case 'aberto':
        return `<span class="badge badge-status badge-aberto"><i class="fa-solid fa-circle-dot"></i> Aberto</span>`;
      case 'em_atendimento':
        return `<span class="badge badge-status badge-em_atendimento"><i class="fa-solid fa-arrows-rotate fa-spin"></i> Em Atendimento</span>`;
      case 'concluido':
        return `<span class="badge badge-status badge-concluido"><i class="fa-solid fa-circle-check"></i> Concluído</span>`;
      case 'cancelado':
        return `<span class="badge badge-status badge-cancelado"><i class="fa-solid fa-circle-xmark"></i> Cancelado</span>`;
      default:
        return `<span class="badge badge-status">${status}</span>`;
    }
  }

  getPriorityBadge(priority) {
    switch (priority) {
      case 'critica':
        return `<span class="badge badge-prio badge-critica"><i class="fa-solid fa-fire"></i> Crítica</span>`;
      case 'alta':
        return `<span class="badge badge-prio badge-alta"><i class="fa-solid fa-angles-up"></i> Alta</span>`;
      case 'media':
        return `<span class="badge badge-prio badge-media"><i class="fa-solid fa-angle-up"></i> Média</span>`;
      case 'baixa':
        return `<span class="badge badge-prio badge-baixa"><i class="fa-solid fa-angle-down"></i> Baixa</span>`;
      default:
        return `<span class="badge badge-prio">${priority}</span>`;
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${this.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
  window.app.init();
});
