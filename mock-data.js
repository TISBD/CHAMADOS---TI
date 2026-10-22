const STORAGE_KEY = 'HELPDESK_PRO_DATA_V6';

const INITIAL_SECTORS = [
  { id: 'sec-1', name: 'Tecnologia & TI', code: 'TI', icon: 'fa-server', color: '#6366f1' },
  { id: 'sec-2', name: 'Financeiro & Contábil', code: 'FIN', icon: 'fa-coins', color: '#10b981' },
  { id: 'sec-3', name: 'Recursos Humanos', code: 'RH', icon: 'fa-users', color: '#ec4899' },
  { id: 'sec-4', name: 'Comercial & Vendas', code: 'COM', icon: 'fa-chart-line', color: '#f59e0b' },
  { id: 'sec-5', name: 'Operações & Logística', code: 'LOG', icon: 'fa-truck-fast', color: '#06b6d4' },
  { id: 'sec-6', name: 'Diretoria & Jurídico', code: 'DIR', icon: 'fa-scale-balanced', color: '#8b5cf6' }
];

const INITIAL_PROBLEM_TYPES = [
  { id: 'prob-1', name: 'Falha de Hardware', category: 'Equipamento', slaHours: 8, icon: 'fa-microchip', color: '#ef4444' },
  { id: 'prob-2', name: 'Lentidão / Travamento de PC', category: 'Performance', slaHours: 4, icon: 'fa-gauge-simple-high', color: '#f97316' },
  { id: 'prob-3', name: 'Rede & Wi-Fi Oscilando', category: 'Infraestrutura', slaHours: 2, icon: 'fa-wifi', color: '#3b82f6' },
  { id: 'prob-4', name: 'Impressora / Periférico', category: 'Periféricos', slaHours: 6, icon: 'fa-print', color: '#14b8a6' },
  { id: 'prob-5', name: 'Acesso / Redefinição de Senha', category: 'Segurança & Contas', slaHours: 1, icon: 'fa-key', color: '#a855f7' },
  { id: 'prob-6', name: 'Erro no Sistema ERP / Software', category: 'Software', slaHours: 4, icon: 'fa-laptop-code', color: '#06b6d4' },
  { id: 'prob-7', name: 'E-mail Corporativo / Outlook', category: 'Comunicação', slaHours: 3, icon: 'fa-envelope-open-text', color: '#3b82f6' },
  { id: 'prob-8', name: 'Instalação de Programas', category: 'Requisição', slaHours: 12, icon: 'fa-download', color: '#10b981' },
  { id: 'prob-9', name: 'Manutenção Preventiva / Backup', category: 'Manutenção', slaHours: 24, icon: 'fa-screwdriver-wrench', color: '#64748b' }
];

const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Administrador TI',
    username: 'admin',
    email: 'admin@empresa.com',
    password: 'admin',
    role: 'admin',
    sectorId: 'sec-1',
    sectorName: 'Tecnologia & TI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 98765-4321',
    jobTitle: 'Gestor de TI & Infra'
  }
];

class HelpDeskStorage {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    // Limpeza forçada de dados e versões antigas em cache
    try {
      localStorage.removeItem('HELPDESK_PRO_DATA_V1');
      localStorage.removeItem('HELPDESK_PRO_DATA_V2');
      localStorage.removeItem('HELPDESK_PRO_DATA_V3');
      localStorage.removeItem('HELPDESK_PRO_DATA_V4');
      localStorage.removeItem('HELPDESK_PRO_DATA_V5');
    } catch (e) {}

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Garante que o array de usuários e administradores esteja consistente
        if (!parsed.users || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        }
        // Assegura username e password para cada usuário
        parsed.users.forEach(u => {
          if (!u.username) {
            u.username = u.email ? u.email.split('@')[0] : (u.role === 'admin' ? 'admin' : `user${u.id}`);
          }
          if (!u.password) {
            u.password = u.role === 'admin' ? 'admin' : '123456';
          }
        });

        // Sincroniza currentUser com a sessão autenticada ativa
        const session = localStorage.getItem('HELPDESK_AUTH_SESSION');
        if (session) {
          try {
            const { userId } = JSON.parse(session);
            const authUser = parsed.users.find(u => u.id === userId);
            if (authUser) {
              parsed.currentUser = authUser;
            }
          } catch(e) {}
        }

        // Migração: garante que dados são re-salvos após correções de autenticação
        if (!parsed._migrationV6b) {
          parsed._migrationV6b = true;
          // Força normalização e re-save de todos os usuários
          parsed.users.forEach(u => {
            u.username = (u.username || '').trim().toLowerCase() || (u.email ? u.email.split('@')[0].toLowerCase() : `user${u.id}`);
            u.password = (u.password || '').trim() || (u.role === 'admin' ? 'admin' : '123456');
          });
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch(e) {}
          console.log('[loadData] Migração V6b aplicada - dados normalizados.');
        }

        console.log('[loadData] Usuários carregados do localStorage:', parsed.users.map(u => ({
          id: u.id, username: u.username, passLength: (u.password || '').length, role: u.role
        })));

        return parsed;
      }
    } catch (e) {
      console.warn('Falha ao carregar do localStorage, usando valores padrão.', e);
    }

    const defaultData = {
      sectors: INITIAL_SECTORS,
      problemTypes: INITIAL_PROBLEM_TYPES,
      users: INITIAL_USERS,
      tickets: [], // Sistema zerado sem chamados inventados
      currentUser: INITIAL_USERS[0]
    };

    this.saveData(defaultData);
    return defaultData;
  }

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
    } catch (e) {
      console.error('Falha ao salvar no localStorage', e);
    }
  }

  resetTickets() {
    this.data.tickets = [];
    this.saveData();
    return [];
  }

  // Métodos CRUD de Chamados
  getTickets() {
    return this.data.tickets;
  }

  getTicketById(id) {
    return this.data.tickets.find(t => t.id === id);
  }

  createTicket(ticketData) {
    const counter = this.data.tickets.length + 1001;
    const newId = `TICK-${counter}`;
    const nowIso = new Date().toISOString();

    const problem = this.data.problemTypes.find(p => p.id === ticketData.problemTypeId);
    const sector = this.data.sectors.find(s => s.id === ticketData.sectorId);
    const user = this.data.users.find(u => u.id === ticketData.userId) || this.data.currentUser;

    const newTicket = {
      id: newId,
      title: ticketData.title,
      description: ticketData.description,
      sectorId: sector ? sector.id : 'sec-1',
      sectorName: sector ? sector.name : 'Geral',
      problemTypeId: problem ? problem.id : 'prob-1',
      problemTypeName: problem ? problem.name : 'Outros',
      problemCategory: problem ? problem.category : 'Geral',
      priority: ticketData.priority || 'media',
      status: 'aberto',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      assignedToId: null,
      assetTag: ticketData.assetTag || 'N/A',
      createdAt: nowIso,
      updatedAt: nowIso,
      solution: null,
      rating: null,
      comments: [
        {
          id: `cmt-${Date.now()}`,
          authorName: user.name,
          date: nowIso,
          text: `Chamado aberto via portal de autoatendimento.`
        }
      ]
    };

    this.data.tickets.unshift(newTicket);
    this.saveData();
    this.syncWithSheets('createTicket', newTicket);
    return newTicket;
  }

  updateTicket(id, updates) {
    const ticket = this.getTicketById(id);
    if (!ticket) return null;

    Object.assign(ticket, updates, { updatedAt: new Date().toISOString() });
    this.saveData();
    this.syncWithSheets('updateTicket', ticket);
    return ticket;
  }

  applySolution(ticketId, solutionData) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    const nowIso = new Date().toISOString();
    ticket.status = 'concluido';
    ticket.updatedAt = nowIso;
    ticket.solution = {
      appliedBy: solutionData.appliedBy || this.data.currentUser.name,
      date: nowIso,
      summary: solutionData.summary,
      timeSpentHours: parseFloat(solutionData.timeSpentHours) || 1.0,
      preventiveNotes: solutionData.preventiveNotes || ''
    };

    ticket.comments.push({
      id: `cmt-${Date.now()}`,
      authorName: ticket.solution.appliedBy,
      date: nowIso,
      text: `Solução aplicada: ${solutionData.summary}`
    });

    this.saveData();
    this.syncWithSheets('registerSolution', {
      ticketId,
      userEmail: ticket.userEmail || (ticket.userId ? (this.getUserById(ticket.userId) || {}).email : ''),
      userName: ticket.userName,
      title: ticket.title,
      sectorName: ticket.sectorName,
      ...solutionData
    });
    return ticket;
  }

  addComment(ticketId, text, authorName) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return null;

    ticket.comments.push({
      id: `cmt-${Date.now()}`,
      authorName: authorName || this.data.currentUser.name,
      date: new Date().toISOString(),
      text: text
    });

    ticket.updatedAt = new Date().toISOString();
    this.saveData();
    return ticket;
  }

  // Setores
  getSectors() {
    return this.data.sectors;
  }

  createSector(sectorData) {
    const newSector = {
      id: `sec-${Date.now()}`,
      name: sectorData.name,
      code: sectorData.code.toUpperCase(),
      icon: sectorData.icon || 'fa-building',
      color: sectorData.color || '#6366f1'
    };
    this.data.sectors.push(newSector);
    this.saveData();
    this.syncWithSheets('createSector', newSector);
    return newSector;
  }

  deleteSector(id) {
    this.data.sectors = this.data.sectors.filter(s => s.id !== id);
    this.saveData();
  }

  // Tipos de Problemas
  getProblemTypes() {
    return this.data.problemTypes;
  }

  createProblemType(typeData) {
    const newType = {
      id: `prob-${Date.now()}`,
      name: typeData.name,
      category: typeData.category || 'Geral',
      slaHours: parseInt(typeData.slaHours) || 4,
      icon: typeData.icon || 'fa-triangle-exclamation',
      color: typeData.color || '#f59e0b'
    };
    this.data.problemTypes.push(newType);
    this.saveData();
    this.syncWithSheets('createProblemType', newType);
    return newType;
  }

  deleteProblemType(id) {
    this.data.problemTypes = this.data.problemTypes.filter(p => p.id !== id);
    this.saveData();
  }

  // Usuários
  getUsers() {
    return this.data.users;
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const sector = this.data.sectors.find(s => s.id === userData.sectorId);
    const cleanUsername = (userData.username || '').trim().toLowerCase() || 
                          (userData.email ? userData.email.split('@')[0].toLowerCase() : `user${Date.now()}`);

    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      username: cleanUsername,
      email: userData.email ? userData.email.trim() : `${cleanUsername}@empresa.com`,
      password: (userData.password || '').trim() || '123456',
      role: userData.role || 'user',
      sectorId: sector ? sector.id : 'sec-1',
      sectorName: sector ? sector.name : 'Geral',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
      phone: userData.phone || '',
      jobTitle: userData.jobTitle || (userData.role === 'admin' ? 'Administrador do Sistema' : 'Colaborador')
    };
    this.data.users.push(newUser);
    this.saveData();
    console.log('[CreateUser] Novo usuário salvo:', { 
      id: newUser.id, username: newUser.username, email: newUser.email, 
      passLength: newUser.password.length, role: newUser.role 
    });
    this.syncWithSheets('createUser', newUser);
    return newUser;
  }

  updateUser(id, userData) {
    const user = this.getUserById(id);
    if (!user) return null;

    if (userData.name) user.name = userData.name.trim();
    if (userData.username) user.username = userData.username.trim().toLowerCase();
    if (userData.email) user.email = userData.email.trim();
    if (userData.password) user.password = userData.password.trim();
    if (userData.role) user.role = userData.role;
    if (userData.jobTitle) user.jobTitle = userData.jobTitle.trim();
    if (userData.phone !== undefined) user.phone = userData.phone.trim();
    if (userData.sectorId) {
      const sector = this.data.sectors.find(s => s.id === userData.sectorId);
      if (sector) {
        user.sectorId = sector.id;
        user.sectorName = sector.name;
      }
    }

    if (this.data.currentUser && this.data.currentUser.id === id) {
      this.data.currentUser = user;
    }
    this.saveData();
    return user;
  }

  deleteUser(id) {
    const userToDelete = this.data.users.find(u => u.id === id);
    const adminCount = this.data.users.filter(u => u.role === 'admin').length;
    
    // Permite remover qualquer administrador desde que não seja o último do sistema
    if (userToDelete && userToDelete.role === 'admin' && adminCount <= 1) {
      throw new Error('Operação bloqueada: O sistema deve ter pelo menos 1 administrador ativo.');
    }

    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.currentUser && this.data.currentUser.id === id) {
      this.data.currentUser = this.data.users[0] || INITIAL_USERS[0];
    }
    this.saveData();
  }

  // Usuário Atual
  getCurrentUser() {
    return this.data.currentUser;
  }

  setCurrentUser(userId) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      this.data.currentUser = user;
      this.saveData();
      return user;
    }
    return null;
  }

  // Métodos de Autenticação (Nome de Usuário e Senha)
  authenticate(usernameOrEmail, password) {
    const cleanInput = (usernameOrEmail || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    console.log('[Auth] Tentativa de login:', { input: cleanInput, passLength: cleanPass.length });
    console.log('[Auth] Usuários registrados:', this.data.users.map(u => ({
      id: u.id, username: u.username, email: u.email, name: u.name, passLength: (u.password || '').length
    })));

    const user = this.data.users.find(u => {
      const uUsername = (u.username || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      
      const usernameMatch = uUsername === cleanInput;
      const emailMatch = uEmail === cleanInput;
      const nameMatch = uName === cleanInput;
      
      if (!usernameMatch && !emailMatch && !nameMatch) return false;

      // Validação de senha
      const storedPass = (u.password || '').trim();
      const passMatch = cleanPass === storedPass;
      
      console.log('[Auth] Verificando:', { 
        userId: u.id, uUsername, usernameMatch, emailMatch, nameMatch,
        storedPassLength: storedPass.length, cleanPassLength: cleanPass.length, passMatch 
      });
      
      return passMatch || (cleanPass === 'admin' && u.role === 'admin' && !storedPass);
    });

    if (user) {
      this.data.currentUser = user;
      try {
        localStorage.setItem('HELPDESK_AUTH_SESSION', JSON.stringify({ userId: user.id, loggedAt: Date.now() }));
      } catch(e) {}
      this.saveData();
      console.log('[Auth] Login bem-sucedido:', user.name, user.role);
      return user;
    }
    console.warn('[Auth] Login falhou para:', cleanInput);
    return null;
  }

  getAuthenticatedUser() {
    try {
      const session = localStorage.getItem('HELPDESK_AUTH_SESSION');
      if (session) {
        const { userId } = JSON.parse(session);
        const user = this.data.users.find(u => u.id === userId);
        if (user) {
          this.data.currentUser = user;
          return user;
        }
      }
    } catch(e) {}
    return null;
  }

  logout() {
    try {
      localStorage.removeItem('HELPDESK_AUTH_SESSION');
    } catch(e) {}
    this.data.currentUser = null;
  }

  // Sincronização com o Google Sheets
  async syncWithSheets(action, payload) {
    if (!window.CONFIG || !window.CONFIG.GOOGLE_SHEETS_API_URL) return;
    try {
      await fetch(window.CONFIG.GOOGLE_SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: payload })
      });
      console.log(`[Google Sheets] Sincronização disparada: ${action}`);
    } catch (err) {
      console.warn(`[Google Sheets] Falha na sincronização:`, err);
    }
  }

  async loadFromSheets() {
    if (!window.CONFIG || !window.CONFIG.GOOGLE_SHEETS_API_URL) return false;
    try {
      const res = await fetch(`${window.CONFIG.GOOGLE_SHEETS_API_URL}?action=all`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          if (json.tickets && json.tickets.length > 0) this.data.tickets = json.tickets;
          if (json.sectors && json.sectors.length > 0) this.data.sectors = json.sectors;
          if (json.problemTypes && json.problemTypes.length > 0) this.data.problemTypes = json.problemTypes;
          if (json.users && json.users.length > 0) {
            // Mescla usuários da planilha com usuários locais criados
            // Preserva dados locais (como password e username) que podem não estar na planilha
            const userMap = new Map();
            // Primeiro, adiciona todos os usuários locais como base
            this.data.users.forEach(u => userMap.set(u.id, { ...u }));
            // Depois, mescla dados remotos SEM sobrescrever campos sensíveis vazios
            json.users.forEach(remoteUser => {
              const localUser = userMap.get(remoteUser.id);
              if (localUser) {
                // Mescla, mas preserva password e username locais se o remoto estiver vazio
                const merged = { ...localUser };
                Object.keys(remoteUser).forEach(key => {
                  const remoteVal = remoteUser[key];
                  // Só sobrescreve se o valor remoto for preenchido
                  if (remoteVal !== undefined && remoteVal !== null && remoteVal !== '') {
                    // Para password e username, só sobrescreve se o valor local estiver vazio
                    if ((key === 'password' || key === 'username') && localUser[key]) {
                      return; // Mantém o valor local
                    }
                    merged[key] = remoteVal;
                  }
                });
                userMap.set(remoteUser.id, merged);
              } else {
                // Usuário novo vindo da planilha, adiciona com fallbacks
                const newRemote = { ...remoteUser };
                if (!newRemote.username) {
                  newRemote.username = newRemote.email ? newRemote.email.split('@')[0] : `user${newRemote.id}`;
                }
                if (!newRemote.password) {
                  newRemote.password = newRemote.role === 'admin' ? 'admin' : '123456';
                }
                userMap.set(remoteUser.id, newRemote);
              }
            });
            this.data.users = Array.from(userMap.values());
            console.log('[loadFromSheets] Usuários mesclados:', this.data.users.map(u => ({ 
              id: u.id, username: u.username, passLength: (u.password || '').length 
            })));
          }

          // Reafirma a sessão do usuário atualmente logado
          const session = localStorage.getItem('HELPDESK_AUTH_SESSION');
          if (session) {
            try {
              const { userId } = JSON.parse(session);
              const authUser = this.data.users.find(u => u.id === userId);
              if (authUser) {
                this.data.currentUser = authUser;
              }
            } catch(e) {}
          }

          this.saveData();
          return true;
        }
      }
    } catch (e) {
      console.info('[Google Sheets] Carregamento inicial via armazenamento local.');
    }
    return false;
  }
}

// Instância global para ser consumida pela aplicação
window.db = new HelpDeskStorage();
