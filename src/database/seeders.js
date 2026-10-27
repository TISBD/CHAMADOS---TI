const bcrypt = require('bcryptjs');
const { getDatabase } = require('./connection');
const { SlaCalculator } = require('../domain/slaRules');
const { Priority, TicketStatus, InteractionType, Roles, AssetStatus } = require('../domain/enums');

function runSeeders() {
  const db = getDatabase();

  // Verifica se o seed já foi executado
  const existingRoles = db.prepare('SELECT count(*) as count FROM roles').get();
  if (existingRoles.count > 0) {
    return false; // Já populado
  }

  // 1. Roles
  const insertRole = db.prepare('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)');
  insertRole.run('admin', 'Administrador', 'Acesso irrestrito a configurações, usuários, SLAs e auditoria');
  insertRole.run('technician', 'Técnico de TI', 'Visualização de fila, atendimento a chamados e notas internas');
  insertRole.run('employee', 'Colaborador', 'Abertura de chamados, visualização própria e avaliação de suporte');

  // 2. Departamentos
  const insertDept = db.prepare('INSERT INTO departments (id, name, code, description) VALUES (?, ?, ?, ?)');
  insertDept.run('dept-ti', 'Tecnologia da Informação', 'TI', 'Infraestrutura, Suporte, Sistemas e Redes');
  insertDept.run('dept-fin', 'Financeiro & Controladoria', 'FIN', 'Contas a pagar/receber, tesouraria e fiscal');
  insertDept.run('dept-rh', 'Recursos Humanos', 'RH', 'Gestão de pessoas, DP, recrutamento e treinamento');
  insertDept.run('dept-com', 'Comercial & Vendas', 'COM', 'Inside sales, executivos e atendimento ao cliente');
  insertDept.run('dept-log', 'Operações & Logística', 'LOG', 'Expedição, estoque e cadeia de suprimentos');
  insertDept.run('dept-dir', 'Diretoria Executiva', 'DIR', 'Alta governança e presidência');

  // 3. Categorias com SLAs padrão
  const insertCat = db.prepare('INSERT INTO categories (id, name, code, default_priority, default_sla_hours, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertCat.run('cat-hard', 'Falha de Hardware', 'HARDWARE', 'ALTA', 8, 'fa-microchip', '#ef4444');
  insertCat.run('cat-perf', 'Lentidão / Travamento', 'PERF', 'MEDIA', 4, 'fa-gauge-high', '#f97316');
  insertCat.run('cat-rede', 'Rede, VPN & Conectividade', 'REDE', 'ALTA', 2, 'fa-wifi', '#3b82f6');
  insertCat.run('cat-imp', 'Impressora & Periféricos', 'PERIF', 'BAIXA', 6, 'fa-print', '#14b8a6');
  insertCat.run('cat-pass', 'Acesso & Redefinição de Senha', 'ACESSO', 'CRITICA', 1, 'fa-key', '#a855f7');
  insertCat.run('cat-soft', 'Erro de Software & ERP', 'SOFTWARE', 'MEDIA', 4, 'fa-laptop-code', '#06b6d4');
  insertCat.run('cat-mail', 'E-mail & Microsoft 365', 'EMAIL', 'MEDIA', 3, 'fa-envelope-open-text', '#6366f1');
  insertCat.run('cat-sec', 'Segurança da Informação', 'SEC', 'CRITICA', 1, 'fa-shield-halved', '#dc2626');

  // 4. Usuários com senhas hash bcrypt
  const salt = bcrypt.genSaltSync(10);
  const hashAdmin = bcrypt.hashSync('admin123', salt);
  const hashTech = bcrypt.hashSync('tecnico123', salt);
  const hashUser = bcrypt.hashSync('user123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role_id, department_id, phone, avatar, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertUser.run('usr-admin', 'Administrador Master TI', 'admin@empresa.com', hashAdmin, 'admin', 'dept-ti', '(11) 98765-4321', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  insertUser.run('usr-tech1', 'Carlos Mendes (Técnico N2)', 'tecnico@empresa.com', hashTech, 'technician', 'dept-ti', '(11) 97111-2233', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
  insertUser.run('usr-tech2', 'Lucas Silva (Redes & Infra)', 'lucas.suporte@empresa.com', hashTech, 'technician', 'dept-ti', '(11) 97222-3344', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80');
  insertUser.run('usr-user1', 'Mariana Santos', 'usuario@empresa.com', hashUser, 'employee', 'dept-rh', '(11) 97333-4455', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80');
  insertUser.run('usr-user2', 'Roberto Costa', 'roberto.fin@empresa.com', hashUser, 'employee', 'dept-fin', '(11) 97444-5566', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80');

  // 5. Inventário de Ativos (Patrimônio)
  const insertAsset = db.prepare(`
    INSERT INTO assets (id, asset_tag, name, category, model, serial_number, user_id, department_id, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAsset.run('ast-01', 'NOTEBOOK-TI-042', 'Dell Latitude 5440 i7 16GB', 'Notebook', 'Dell Latitude 5440', 'BR-DEL-98421', 'usr-tech1', 'dept-ti', AssetStatus.EM_USO, 'Máquina técnica de bancada');
  insertAsset.run('ast-02', 'NOTEBOOK-RH-014', 'Lenovo ThinkPad E14 i5 16GB', 'Notebook', 'ThinkPad E14 Gen 4', 'PF-LEN-33214', 'usr-user1', 'dept-rh', AssetStatus.EM_USO, 'Equipamento corporativo da Mariana');
  insertAsset.run('ast-03', 'DESK-FIN-008', 'HP ProDesk 400 G7 i5 8GB', 'Desktop', 'HP ProDesk 400 G7', 'HP-DESK-44120', 'usr-user2', 'dept-fin', AssetStatus.EM_USO, 'Estação de trabalho do Roberto');
  insertAsset.run('ast-04', 'IMP-RH-01', 'HP LaserJet Pro MFP 4103dw', 'Impressora', 'MFP 4103dw', 'HP-PRN-88401', null, 'dept-rh', AssetStatus.EM_USO, 'Impressora de rede do RH');
  insertAsset.run('ast-05', 'ROUTER-CORE-01', 'Cisco Catalyst 9200 48P', 'Rede', 'Catalyst 9200-48P', 'CISCO-CAT-0992', null, 'dept-ti', AssetStatus.EM_USO, 'Switch Core do Datacenter');

  // 6. Base de Conhecimento (KB / FAQ)
  const insertKb = db.prepare(`
    INSERT INTO knowledge_base (id, title, content, category_id, tags, views_count, helpful_count, created_by, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertKb.run(
    'kb-01',
    'Como resolver falha ou fila travada na Impressora de Rede',
    'Caso sua impressora não responda:\n1. Acesse o Painel de Controle > Dispositivos e Impressoras.\n2. Dê duplo clique na impressora e cancele todos os documentos na fila.\n3. Abra o Prompt de Comando como Admin e execute:\n   net stop spooler\n   net start spooler\n4. Verifique se o cabo de rede está conectado ou se o display exibe erro de papel.',
    'cat-imp',
    'impressora, spooler, periféricos, travada, papel',
    42,
    18,
    'usr-admin'
  );

  insertKb.run(
    'kb-02',
    'Passo a passo para redefinir senha do e-mail corporativo / Outlook',
    'Para trocar sua senha:\n1. Acesse https://portal.office.com.\n2. Clique na sua foto de perfil no canto superior direito > Ver conta > Senha.\n3. A nova senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, números e símbolo especial.\n4. Caso esteja bloqueado, contate a TI solicitando reset de credenciais.',
    'cat-pass',
    'senha, outlook, email, office, redefinição, bloqueio, acesso',
    89,
    45,
    'usr-tech1'
  );

  insertKb.run(
    'kb-03',
    'Conexão com a VPN corporativa em Home Office',
    'Caso a VPN não conecte:\n1. Certifique-se de que sua conexão residencial com a Internet está estável.\n2. Abra o cliente FortiClient / Cisco AnyConnect.\n3. Verifique se o endereço do gateway é vpn.empresa.com.br.\n4. Confirme seu token MFA no aplicativo de autenticação do celular.\n5. Reinicie o roteador Wi-Fi caso persista.',
    'cat-rede',
    'vpn, home office, rede, wifi, internet, conexão',
    54,
    29,
    'usr-tech2'
  );

  insertKb.run(
    'kb-04',
    'Procedimento para liberar espaço e resolver lentidão no Windows',
    'Para otimizar sua estação de trabalho:\n1. Pressione Windows + R, digite %temp% e delete os arquivos temporários.\n2. Abra o Gerenciador de Tarefas e verifique se o uso de Disco ou Memória está em 100%.\n3. Reinicie o computador ao menos uma vez por semana para desfragmentação de memória cache.',
    'cat-perf',
    'lentidão, travamento, disco 100%, memória, computador lento',
    65,
    31,
    'usr-admin'
  );

  // 7. Chamados Iniciais de Demonstração
  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      id, code, title, description, status, priority, category_id, requester_id,
      assigned_technician_id, department_id, asset_id, first_response_due_at,
      resolution_due_at, first_responded_at, resolved_at, closed_at,
      resolution_summary, root_cause, time_spent_minutes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInteraction = db.prepare(`
    INSERT INTO ticket_interactions (id, ticket_id, user_id, interaction_type, content, is_internal, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCsat = db.prepare(`
    INSERT INTO csat_ratings (id, ticket_id, requester_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Ticket 1: Em atendimento (Rede / Wi-Fi)
  const dead1 = SlaCalculator.calculateDeadlines(Priority.ALTA, new Date(Date.now() - 3600000));
  insertTicket.run(
    'tck-001',
    'TICK-1001',
    'Oscilação constante na rede Wi-Fi do setor de RH',
    'A conexão sem fio cai a cada 10 minutos, impossibilitando a realização de entrevistas online e envio de folhas de pagamento.',
    TicketStatus.EM_ATENDIMENTO,
    Priority.ALTA,
    'cat-rede',
    'usr-user1',
    'usr-tech2',
    'dept-rh',
    'ast-02',
    dead1.responseDueAt,
    dead1.resolutionDueAt,
    new Date(Date.now() - 1800000).toISOString(),
    null,
    null,
    null,
    null,
    45,
    new Date(Date.now() - 3600000).toISOString()
  );

  insertInteraction.run('int-01', 'tck-001', 'usr-user1', InteractionType.PUBLIC_MESSAGE, 'Chamado aberto. O problema começou hoje pela manhã por volta das 09h.', 0, new Date(Date.now() - 3600000).toISOString());
  insertInteraction.run('int-02', 'tck-001', 'usr-tech2', InteractionType.STATUS_CHANGE, 'Status alterado para Em Atendimento por Lucas Silva.', 0, new Date(Date.now() - 1800000).toISOString());
  insertInteraction.run('int-03', 'tck-001', 'usr-tech2', InteractionType.INTERNAL_NOTE, 'Identifiquei que o Access Point AP-RH-02 está com interferência no canal 6. Vou alterar a frequência para o canal 11 no controlador de rede.', 1, new Date(Date.now() - 1500000).toISOString());
  insertInteraction.run('int-04', 'tck-001', 'usr-tech2', InteractionType.PUBLIC_MESSAGE, 'Olá Mariana! Já estou analisando as antenas do setor. Faremos um reboot na frequência em 5 minutos.', 0, new Date(Date.now() - 1200000).toISOString());

  // Ticket 2: Resolvido com CSAT (Senha / Acesso)
  const dead2 = SlaCalculator.calculateDeadlines(Priority.CRITICA, new Date(Date.now() - 86400000));
  insertTicket.run(
    'tck-002',
    'TICK-1002',
    'Conta de e-mail corporativo bloqueada após tentativas inválidas',
    'Preciso aprovar pagamentos urgentes de fornecedores mas o Outlook informa que a conta está bloqueada por excesso de tentativas incorretas.',
    TicketStatus.RESOLVIDO,
    Priority.CRITICA,
    'cat-pass',
    'usr-user2',
    'usr-tech1',
    'dept-fin',
    'ast-03',
    dead2.responseDueAt,
    dead2.resolutionDueAt,
    new Date(Date.now() - 82800000).toISOString(),
    new Date(Date.now() - 79200000).toISOString(),
    null,
    'Desbloqueio realizado no painel do Microsoft Entra ID e gerada senha temporária enviada por SMS verificado.',
    'Tentativas automáticas decorrentes de senha antiga salva em smartphone.',
    30,
    new Date(Date.now() - 86400000).toISOString()
  );

  insertInteraction.run('int-05', 'tck-002', 'usr-user2', InteractionType.PUBLIC_MESSAGE, 'Chamado de urgência financeira aberto.', 0, new Date(Date.now() - 86400000).toISOString());
  insertInteraction.run('int-06', 'tck-002', 'usr-tech1', InteractionType.PUBLIC_MESSAGE, 'Conta desbloqueada com sucesso! Senha provisória gerada.', 0, new Date(Date.now() - 79200000).toISOString());
  insertCsat.run('csat-01', 'tck-002', 'usr-user2', 5, 'Atendimento ultra rápido do Carlos! Salvou o prazo bancário de hoje.', new Date(Date.now() - 75000000).toISOString());

  // Ticket 3: Aberto aguardando triagem (Hardware)
  const dead3 = SlaCalculator.calculateDeadlines(Priority.MEDIA, new Date(Date.now() - 7200000));
  insertTicket.run(
    'tck-003',
    'TICK-1003',
    'Impressora do RH apresentando manchas nas cópias e atolamento',
    'A impressora MFP 4103dw está puxando duas folhas ao mesmo tempo e deixando listras pretas laterais nas folhas.',
    TicketStatus.ABERTO,
    Priority.MEDIA,
    'cat-imp',
    'usr-user1',
    null,
    'dept-rh',
    'ast-04',
    dead3.responseDueAt,
    dead3.resolutionDueAt,
    null,
    null,
    null,
    null,
    null,
    0,
    new Date(Date.now() - 7200000).toISOString()
  );

  // 8. Auditoria inicial
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud-01', 'usr-admin', 'SYSTEM_INIT', 'SYSTEM', 'SYS-01', JSON.stringify({ message: 'Sistema HelpDesk Pro inicializado com sucesso com governança de dados.' }), '127.0.0.1');

  return true;
}

module.exports = {
  runSeeders
};
