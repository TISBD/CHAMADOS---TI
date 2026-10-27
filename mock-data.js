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
        if (!parsed.users || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        }

        // Garante que o administrador master (admin/admin) SEMPRE exista na base
        const hasMasterAdmin = parsed.users.some(u => u.id === 'usr-admin' || u.username === 'admin');
        if (!hasMasterAdmin) {
          parsed.users.unshift({ ...INITIAL_USERS[0] });
        }

        // Assegura username e password seguros para cada usuário sem quebrar com números
        parsed.users.forEach(u => {
          u.name = String(u.name || '').trim() || 'Usuário';
          let cleanUsername = String(u.username || '').trim().toLowerCase().replace(/^@/, '');
          if (!cleanUsername) {
            cleanUsername = u.email ? String(u.email).split('@')[0].toLowerCase() : (u.role === 'admin' ? 'admin' : `user${u.id}`);
          }
          u.username = cleanUsername;

          let cleanPass = String(u.password !== undefined && u.password !== null ? u.password : '').trim();
          if (!cleanPass) {
            cleanPass = u.role === 'admin' ? 'admin' : '123456';
          }
          u.password = cleanPass;

          if (u.email) u.email = String(u.email).trim().toLowerCase();
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

        return parsed;
      }
    } catch (e) {
      console.warn('Falha ao carregar do localStorage, usando valores padrão.', e);
    }

    const defaultData = {
      sectors: INITIAL_SECTORS,
      problemTypes: INITIAL_PROBLEM_TYPES,
      users: INITIAL_USERS,
      tickets: [],
      currentUser: INITIAL_USERS[0]
    };

    this.saveData(defaultData);
    return defaultData;
  }

  getDeletedUserIds() {
    try {
      const stored = localStorage.getItem('HELPDESK_DELETED_USER_IDS');
      return stored ? JSON.parse(stored) : [];
    } catch(e) {
      return [];
    }
  }

  addDeletedUserId(id) {
    try {
      const list = this.getDeletedUserIds();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('HELPDESK_DELETED_USER_IDS', JSON.stringify(list));
      }
    } catch(e) {}
  }

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
    } catch (e) {
      console.error('Falha ao salvar no localStorage', e);
    }
  }

  resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('HELPDESK_AUTH_SESSION');
    } catch(e) {}
    this.data = this.loadData();
    return this.data;
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
    let rawUsername = String(userData.username || '').trim().toLowerCase().replace(/^@/, '');
    if (!rawUsername && userData.email) {
      rawUsername = String(userData.email).split('@')[0].toLowerCase();
    }
    if (!rawUsername) {
      rawUsername = `user${Date.now()}`;
    }

    const cleanPass = String(userData.password !== undefined && userData.password !== null ? userData.password : '').trim() || '123456';
    const cleanName = String(userData.name || '').trim();
    const cleanEmail = userData.email ? String(userData.email).trim().toLowerCase() : `${rawUsername}@empresa.com`;

    const newUser = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      username: rawUsername,
      email: cleanEmail,
      password: cleanPass,
      role: userData.role || 'user',
      sectorId: sector ? sector.id : 'sec-1',
      sectorName: sector ? sector.name : 'Geral',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=6366f1&color=fff`,
      phone: userData.phone ? String(userData.phone).trim() : '',
      jobTitle: userData.jobTitle ? String(userData.jobTitle).trim() : (userData.role === 'admin' ? 'Administrador do Sistema' : 'Colaborador'),
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveData();
    console.log('[CreateUser] Novo usuário salvo com sucesso:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      passLength: newUser.password.length,
      role: newUser.role
    });

    this.syncWithSheets('createUser', newUser);
    return newUser;
  }

  updateUser(id, userData) {
    const user = this.getUserById(id);
    if (!user) return null;

    if (userData.name) user.name = String(userData.name).trim();
    if (userData.username) user.username = String(userData.username).trim().toLowerCase().replace(/^@/, '');
    if (userData.email) user.email = String(userData.email).trim().toLowerCase();
    if (userData.password !== undefined && userData.password !== null && String(userData.password).trim() !== '') {
      user.password = String(userData.password).trim();
    }
    if (userData.role) user.role = userData.role;
    if (userData.jobTitle) user.jobTitle = String(userData.jobTitle).trim();
    if (userData.phone !== undefined) user.phone = String(userData.phone).trim();
    if (userData.sectorId) {
      const sector = this.data.sectors.find(s => s.id === userData.sectorId);
      if (sector) {
        user.sectorId = sector.id;
        user.sectorName = sector.name;
      }
    }
    user._localUpdated = Date.now();

    if (this.data.currentUser && this.data.currentUser.id === id) {
      this.data.currentUser = user;
    }
    this.saveData();
    this.syncWithSheets('updateUser', user);
    return user;
  }

  deleteUser(id) {
    if (id === 'usr-admin') {
      throw new Error('Operação bloqueada: O administrador master inicial (admin) não pode ser removido.');
    }

    const userToDelete = this.data.users.find(u => u.id === id);
    const adminCount = this.data.users.filter(u => u.role === 'admin').length;
    
    // Permite remover qualquer administrador desde que não seja o último do sistema
    if (userToDelete && userToDelete.role === 'admin' && adminCount <= 1) {
      throw new Error('Operação bloqueada: O sistema deve ter pelo menos 1 administrador ativo.');
    }

    // Registra tombstone para impedir que a planilha reimporte esse usuário apagado
    this.addDeletedUserId(id);

    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.currentUser && this.data.currentUser.id === id) {
      this.data.currentUser = this.data.users.find(u => u.id === 'usr-admin') || this.data.users[0] || INITIAL_USERS[0];
    }
    this.saveData();
    this.syncWithSheets('deleteUser', { id });
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

  // Métodos de Autenticação (Nome de Usuário, E-mail ou Nome Completo + Senha)
  authenticate(usernameOrEmail, password) {
    const cleanInput = String(usernameOrEmail || '').trim().toLowerCase().replace(/^@/, '');
    const cleanPass = String(password !== undefined && password !== null ? password : '').trim();

    if (!cleanInput || !cleanPass) return null;

    console.log('[Auth] Tentativa de login:', { input: cleanInput, passLength: cleanPass.length });

    // Fallback mestre incondicional: admin / admin sempre tem acesso garantido ao sistema
    if (cleanInput === 'admin' && cleanPass === 'admin') {
      let masterAdmin = this.data.users.find(u => u.id === 'usr-admin' || u.username === 'admin');
      if (!masterAdmin) {
        masterAdmin = { ...INITIAL_USERS[0] };
        this.data.users.unshift(masterAdmin);
      }
      this.data.currentUser = masterAdmin;
      try {
        localStorage.setItem('HELPDESK_AUTH_SESSION', JSON.stringify({ userId: masterAdmin.id, loggedAt: Date.now() }));
      } catch(e) {}
      this.saveData();
      console.log('[Auth] Login master admin autorizado!');
      return masterAdmin;
    }

    const user = this.data.users.find(u => {
      const uUsername = String(u.username || '').trim().toLowerCase().replace(/^@/, '');
      const uEmail = String(u.email || '').trim().toLowerCase();
      const uName = String(u.name || '').trim().toLowerCase();
      const uEmailPrefix = uEmail ? uEmail.split('@')[0] : '';
      
      const usernameMatch = uUsername === cleanInput;
      const emailMatch = uEmail === cleanInput || uEmailPrefix === cleanInput;
      const nameMatch = uName === cleanInput;
      
      if (!usernameMatch && !emailMatch && !nameMatch) return false;

      // Validação de senha
      const storedPass = String(u.password !== undefined && u.password !== null ? u.password : '').trim();
      
      // Match de senha exata
      if (storedPass && cleanPass === storedPass) return true;

      // Fallback para admin
      if (u.role === 'admin' && cleanPass === 'admin') return true;

      // Fallback para usuário importado da planilha sem senha definida (padrão 123456)
      if (!storedPass && cleanPass === '123456') return true;

      return false;
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

  // Autenticação Assíncrona com sincronização em tempo real com Google Sheets
  async authenticateAsync(usernameOrEmail, password) {
    // 1. Tenta autenticar na base local
    let user = this.authenticate(usernameOrEmail, password);
    if (user) return user;

    // 2. Se falhar e a API do Sheets estiver configurada, sincroniza com a planilha e tenta novamente
    if (window.CONFIG && window.CONFIG.GOOGLE_SHEETS_API_URL) {
      console.log('[Auth] Usuário não encontrado localmente. Consultando Google Sheets em tempo real...');
      try {
        const loaded = await this.loadFromSheets();
        if (loaded) {
          user = this.authenticate(usernameOrEmail, password);
          if (user) return user;
        }
      } catch (err) {
        console.warn('[Auth] Falha ao consultar Sheets no login:', err);
      }
    }

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
      if (!res.ok) {
        console.warn(`[Google Sheets] API retornou status ${res.status}. Usando dados locais.`);
        return false;
      }
      const json = await res.json();
      if (json && json.success) {
        // Adaptação dos chamados
        if (json.tickets && json.tickets.length > 0) {
          this.data.tickets = json.tickets.map(t => {
            if (!t.solution && (t.solutionSummary || t.solutionTimeSpent)) {
              t.solution = {
                summary: t.solutionSummary || '',
                timeSpentHours: t.solutionTimeSpent || '1.0',
                preventiveNotes: t.solutionPreventive || '',
                appliedBy: t.assignedName || 'Equipe de TI',
                date: t.updatedAt || t.createdAt || new Date().toISOString()
              };
            }
            if (!t.comments) {
              if (t.timelineJson && Array.isArray(t.timelineJson)) {
                t.comments = t.timelineJson.map(item => ({
                  authorName: item.author || 'Sistema',
                  text: item.text || '',
                  date: item.date || new Date().toISOString()
                }));
              } else {
                t.comments = [];
              }
            }
            return t;
          });
        }
        if (json.sectors && json.sectors.length > 0) this.data.sectors = json.sectors;
        if (json.problemTypes && json.problemTypes.length > 0) this.data.problemTypes = json.problemTypes;
        
        if (json.users && json.users.length > 0) {
          const deletedIds = this.getDeletedUserIds();
          const userMap = new Map();

          // Carrega todos os usuários locais como base inicial
          this.data.users.forEach(u => {
            if (!deletedIds.includes(u.id)) {
              userMap.set(u.id, { ...u });
            }
          });

          // Mescla com usuários recebidos da planilha
          json.users.forEach(remoteUser => {
            // Ignora usuários que foram explicitamente excluídos nesta aplicação
            if (!remoteUser.id || deletedIds.includes(remoteUser.id)) return;

            const localUser = userMap.get(remoteUser.id);
            if (localUser) {
              const merged = { ...localUser };
              // Se o usuário foi editado localmente nesta sessão, preserva as edições locais
              if (!localUser._localUpdated) {
                Object.keys(remoteUser).forEach(key => {
                  const remoteVal = remoteUser[key];
                  if (remoteVal !== undefined && remoteVal !== null && remoteVal !== '') {
                    if ((key === 'password' || key === 'username') && localUser[key]) {
                      return;
                    }
                    merged[key] = remoteVal;
                  }
                });
              }

              // Garante normalização de strings
              merged.username = String(merged.username || localUser.username || (merged.email ? merged.email.split('@')[0] : `user${merged.id}`)).trim().toLowerCase().replace(/^@/, '');
              merged.password = String(merged.password || localUser.password || (merged.role === 'admin' ? 'admin' : '123456')).trim();
              userMap.set(remoteUser.id, merged);
            } else {
              // Novo usuário vindo da planilha
              const newRemote = { ...remoteUser };
              newRemote.name = String(newRemote.name || 'Usuário').trim();
              newRemote.username = String(newRemote.username || (newRemote.email ? newRemote.email.split('@')[0] : `user${newRemote.id}`)).trim().toLowerCase().replace(/^@/, '');
              newRemote.password = String(newRemote.password !== undefined && newRemote.password !== null && String(newRemote.password).trim() !== '' ? newRemote.password : (newRemote.role === 'admin' ? 'admin' : '123456')).trim();
              newRemote.role = newRemote.role || 'user';
              newRemote.sectorId = newRemote.sectorId || 'sec-1';
              newRemote.sectorName = newRemote.sectorName || 'Tecnologia & TI';
              userMap.set(remoteUser.id, newRemote);
            }
          });

          // Garante que o administrador master inicial (admin/admin) NUNCA seja removido
          if (!userMap.has('usr-admin')) {
            userMap.set('usr-admin', { ...INITIAL_USERS[0] });
          }

          this.data.users = Array.from(userMap.values());
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
    } catch (e) {
      console.info('[Google Sheets] Sem conexão com a planilha. Usando armazenamento local.', e);
    }
    return false;
  }
}

// Instância global para ser consumida pela aplicação
window.db = new HelpDeskStorage();
