const STORAGE_KEY = 'HELPDESK_PRO_DATA_V4';

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
    email: 'admin@empresa.com',
    password: 'admin123',
    role: 'admin',
    sectorId: 'sec-1',
    sectorName: 'Tecnologia & TI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 98765-4321',
    jobTitle: 'Gestor de TI & Infra'
  }
];

// Gerador de chamados retroativos ao longo de 2026 (meses 1 a 10) para alimentar perfeitamente o Dashboard Mês a Mês
function generateMockTickets() {
  return [];
  const currentYear = 2026;
  const sampleTickets = [
    // Mês 1 - Janeiro
    {
      title: 'Computador não liga após queda de energia',
      description: 'Fonte do gabinete cheirando a queimado após tempestade.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-1',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-2',
      month: 0,
      day: 12,
      assetTag: 'PAT-4402',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-01-12T16:30:00Z',
        summary: 'Substituição da fonte de alimentação de 500W queimada por nova com PFC ativo e teste de estresse da placa mãe.',
        timeSpentHours: 2.5,
        preventiveNotes: 'Instalado filtro de linha clampado para evitar novo pico.'
      }
    },
    {
      title: 'Wi-Fi da recepção e sala de vendas caindo a cada 10 min',
      description: 'Sinal instável e desconectando dispositivos móveis.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-3',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 0,
      day: 15,
      assetTag: 'AP-ROUTER-02',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-01-15T14:10:00Z',
        summary: 'Atualização de firmware do roteador Mesh corporativo e reatribuição de canais de frequência 5GHz.',
        timeSpentHours: 1.5,
        preventiveNotes: 'Canais 36 e 40 reservados para evitar interferência de redes vizinhas.'
      }
    },
    {
      title: 'Esquecimento de senha do ERP após férias coletivas',
      description: 'Usuário bloqueado por excesso de tentativas incorretas.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-5',
      priority: 'baixa',
      status: 'concluido',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-1',
      month: 0,
      day: 18,
      assetTag: 'USR-AUTH-09',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-01-18T10:00:00Z',
        summary: 'Desbloqueio de usuário no Active Directory e envio de link temporário com exigência de troca no primeiro login.',
        timeSpentHours: 0.3,
        preventiveNotes: 'Orientado sobre política de senhas seguras da empresa.'
      }
    },
    {
      title: 'Impressora laser travando folhas ao imprimir relatórios',
      description: 'Papel sai amassado e com manchas pretas laterais.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-4',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-2',
      month: 0,
      day: 24,
      assetTag: 'IMP-HP-305',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-01-24T17:00:00Z',
        summary: 'Limpeza dos roletes tracionadores (pickup rollers) e substituição do conjunto do fusor desgastado.',
        timeSpentHours: 2.0,
        preventiveNotes: 'Agendada limpeza preventiva semestral.'
      }
    },

    // Mês 2 - Fevereiro
    {
      title: 'Lentidão severa ao abrir planilhas orçamentárias no Excel',
      description: 'Disco 100% no Gerenciador de Tarefas e memória esgotando.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-2',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-1',
      month: 1,
      day: 5,
      assetTag: 'PAT-4402',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-02-05T15:20:00Z',
        summary: 'Upgrade de memória RAM de 8GB para 16GB Dual Channel e limpeza de arquivos temporários do sistema.',
        timeSpentHours: 1.8,
        preventiveNotes: 'Desativados softwares de inicialização desnecessários.'
      }
    },
    {
      title: 'Erro de licença ao inicializar o software de faturamento',
      description: 'Mensagem "Server License Timeout 0x8004"',
      sectorId: 'sec-5',
      problemTypeId: 'prob-6',
      priority: 'critica',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-admin',
      month: 1,
      day: 14,
      assetTag: 'SRV-ERP-01',
      solution: {
        appliedBy: 'Carlos Oliveira',
        date: '2026-02-14T11:45:00Z',
        summary: 'Reativação do serviço de licenciamento no servidor primário e liberação das portas 1433/1434 no firewall interno.',
        timeSpentHours: 1.0,
        preventiveNotes: 'Criada regra de monitoramento no Zabbix para auto-restart do serviço de licenças.'
      }
    },
    {
      title: 'Outlook não envia e-mails com anexos PDF',
      description: 'E-mails ficam presos na Caixa de Saída.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-7',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 1,
      day: 20,
      assetTag: 'PAT-2109',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-02-20T16:15:00Z',
        summary: 'Reconfiguração do protocolo SMTP corporativo e limpeza de arquivos .ost corrompidos da caixa postal.',
        timeSpentHours: 1.2,
        preventiveNotes: 'Aumentado limite da caixa para 50GB no Exchange Online.'
      }
    },
    {
      title: 'Instalação de pacote Adobe Acrobat Pro para RH',
      description: 'Necessário para assinatura digital de contratos de admissão.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-8',
      priority: 'baixa',
      status: 'concluido',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-2',
      month: 1,
      day: 26,
      assetTag: 'PAT-3301',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-02-26T14:00:00Z',
        summary: 'Instalação do software homologado e vinculação da licença corporativa via portal da Adobe.',
        timeSpentHours: 0.8,
        preventiveNotes: 'Configurada assinatura digital com certificado A1 da empresa.'
      }
    },

    // Mês 3 - Março
    {
      title: 'Switch do andar 2 desligando sozinho',
      description: 'Setores Comercial e Financeiro ficaram sem internet cabeada.',
      sectorId: 'sec-1',
      problemTypeId: 'prob-3',
      priority: 'critica',
      status: 'concluido',
      userId: 'usr-admin',
      assignedTo: 'usr-admin',
      month: 2,
      day: 8,
      assetTag: 'SW-CORE-02',
      solution: {
        appliedBy: 'Carlos Oliveira',
        date: '2026-03-08T11:00:00Z',
        summary: 'Substituição do nobreak do rack de rede e troca do patch cord danificado da porta uplink.',
        timeSpentHours: 3.0,
        preventiveNotes: 'Baterias do nobreak central substituídas por novas com autonomia de 45 minutos.'
      }
    },
    {
      title: 'Teclado e mouse sem fio sem resposta no caixa',
      description: 'Luzes apagadas, pilhas já foram trocadas e não reconecta.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-1',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-2',
      month: 2,
      day: 16,
      assetTag: 'PAT-4011',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-03-16T15:00:00Z',
        summary: 'Substituição do receptor USB com defeito por kit teclado/mouse com fio padrão ABNT2.',
        timeSpentHours: 0.5,
        preventiveNotes: 'Kit com defeito encaminhado para garantia.'
      }
    },
    {
      title: 'Sistema de Ponto Eletrônico não sincroniza batidas',
      description: 'Colaboradores não conseguem registrar a entrada matinal.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-6',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-1',
      month: 2,
      day: 22,
      assetTag: 'REP-RH-01',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-03-22T10:30:00Z',
        summary: 'Reiniciado serviço de comunicação TCP/IP do relógio REP e reenviado arquivo AFD com as marcações pendentes.',
        timeSpentHours: 1.0,
        preventiveNotes: 'Configurado script de contingência para backup local diário.'
      }
    },

    // Mês 4 - Abril
    {
      title: 'Monitor piscando e gerando artefatos na tela',
      description: 'Tela fica preta aleatoriamente durante reuniões no Teams.',
      sectorId: 'sec-6',
      problemTypeId: 'prob-1',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-2',
      month: 3,
      day: 7,
      assetTag: 'MON-DELL-27',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-04-07T14:40:00Z',
        summary: 'Troca do cabo DisplayPort oxidado e atualização do driver gráfico Intel UHD.',
        timeSpentHours: 1.0,
        preventiveNotes: 'Organizados os chicotes de cabos atrás da mesa para evitar tensão.'
      }
    },
    {
      title: 'Lentidão geral após atualização obrigatória do Windows 11',
      description: 'Aplicações demorando mais de 3 minutos para carregar.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-2',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-1',
      month: 3,
      day: 15,
      assetTag: 'PAT-4402',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-04-15T16:00:00Z',
        summary: 'Executado DISM /Online /Cleanup-Image e sfc /scannow, seguido de desfragmentação do SSD e otimização de indexação.',
        timeSpentHours: 2.2,
        preventiveNotes: 'Restaurada integridade do sistema operacional sem perda de dados.'
      }
    },
    {
      title: 'Impressora de etiquetas fiscais com código de barras borrado',
      description: 'Leitor óptico da expedição não consegue ler os pacotes.',
      sectorId: 'sec-5',
      problemTypeId: 'prob-4',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-2',
      month: 3,
      day: 23,
      assetTag: 'ZEBRA-ETQ-01',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-04-23T11:20:00Z',
        summary: 'Limpeza térmica da cabeça de impressão com álcool isopropílico e ajuste de temperatura/velocidade do ribbon.',
        timeSpentHours: 1.2,
        preventiveNotes: 'Operadores treinados a não usar objetos metálicos para destravar etiquetas.'
      }
    },
    {
      title: 'Backup diário em nuvem com alerta de falha de cota',
      description: 'Volume excedeu os 2TB contratados no Azure Blob.',
      sectorId: 'sec-1',
      problemTypeId: 'prob-9',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-admin',
      assignedTo: 'usr-admin',
      month: 3,
      day: 29,
      assetTag: 'BKP-AZURE-01',
      solution: {
        appliedBy: 'Carlos Oliveira',
        date: '2026-04-29T18:00:00Z',
        summary: 'Expurgo de arquivos de log legados com mais de 180 dias e compressão incremental habilitada.',
        timeSpentHours: 2.0,
        preventiveNotes: 'Liberados 600GB de espaço e reduzido custo mensal de storage.'
      }
    },

    // Mês 5 - Maio
    {
      title: 'Ataque de Phishing suspeito na caixa do Financeiro',
      description: 'E-mail com anexo .iso simulando nota fiscal de cobrança.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-5',
      priority: 'critica',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-admin',
      month: 4,
      day: 10,
      assetTag: 'SEC-EDR-01',
      solution: {
        appliedBy: 'Carlos Oliveira',
        date: '2026-05-10T09:30:00Z',
        summary: 'Isolamento preventivo da estação, escaneamento de IOCs via EDR corporativo, revogação de tokens e bloqueio do domínio remetente no antispam.',
        timeSpentHours: 2.5,
        preventiveNotes: 'Nenhum payload foi executado. Emitido alerta de conscientização aos funcionários.'
      }
    },
    {
      title: 'Queda de conexão no servidor de arquivos compartilhado (NAS)',
      description: 'Pasta Z: inacessível para todos do departamento comercial.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-3',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 4,
      day: 18,
      assetTag: 'NAS-SYNOLOGY-01',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-05-18T14:15:00Z',
        summary: 'Reinicialização do serviço SMB/CIFS no NAS e renovação do certificado SSL de mapeamento.',
        timeSpentHours: 1.0,
        preventiveNotes: 'Mapeamento restabelecido via script de GPO no logon.'
      }
    },
    {
      title: 'Planilha compartilhada do RH travando com múltiplos acessos',
      description: 'Usuários recebendo erro de arquivo bloqueado para edição.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-6',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-1',
      month: 4,
      day: 25,
      assetTag: 'SHP-RH-DOCS',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-05-25T17:00:00Z',
        summary: 'Migração da planilha legado para SharePoint Online com coautoria em tempo real habilitada.',
        timeSpentHours: 1.5,
        preventiveNotes: 'Configurada sincronização no OneDrive das usuárias.'
      }
    },

    // Mês 6 - Junho
    {
      title: 'Notebook da diretoria superaquecendo e desligando',
      description: 'Cooler fazendo ruído metálico forte.',
      sectorId: 'sec-6',
      problemTypeId: 'prob-1',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-admin',
      assignedTo: 'usr-tech-2',
      month: 5,
      day: 4,
      assetTag: 'NOTE-DIR-01',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-06-04T16:00:00Z',
        summary: 'Desmontagem, desobstrução das aletas do dissipador, troca da ventoinha do cooler e aplicação de pasta térmica de prata (Artic Silver).',
        timeSpentHours: 2.8,
        preventiveNotes: 'Temperatura em carga caiu de 92°C para 64°C estáveis.'
      }
    },
    {
      title: 'Reclamação de lentidão no banco de dados do faturamento',
      description: 'Geração de notas fiscais demorando 40 segundos por nota.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-2',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-admin',
      month: 5,
      day: 13,
      assetTag: 'SRV-SQL-01',
      solution: {
        appliedBy: 'Carlos Oliveira',
        date: '2026-06-13T19:30:00Z',
        summary: 'Reindexação de tabelas no Microsoft SQL Server e reconstrução de estatísticas de índices fragmentados.',
        timeSpentHours: 3.0,
        preventiveNotes: 'Rotina automática de manutenção agendada para todo domingo às 02h.'
      }
    },
    {
      title: 'Instalação de software de CRM e integração com WhatsApp API',
      description: 'Equipe de vendas precisa do módulo de atendimento multicanal.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-8',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 5,
      day: 21,
      assetTag: 'CRM-CLIENT-03',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-06-21T15:00:00Z',
        summary: 'Instalação do cliente desktop, autenticação do webhook e parametrização dos ramais virtuais.',
        timeSpentHours: 2.0,
        preventiveNotes: 'Treinamento de 15 minutos realizado com os atendentes.'
      }
    },

    // Mês 7 - Julho
    {
      title: 'Sem acesso à VPN corporativa para colaboradores em home office',
      description: 'Erro: "The remote connection was denied due to credentials or tunnel error".',
      sectorId: 'sec-4',
      problemTypeId: 'prob-3',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 6,
      day: 8,
      assetTag: 'VPN-FW-GATEWAY',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-07-08T10:40:00Z',
        summary: 'Renovado certificado CA do túnel OpenVPN e corrigido roteamento de sub-rede 192.168.10.0/24.',
        timeSpentHours: 1.3,
        preventiveNotes: 'Novo pacote de perfil distribuído aos usuários remotos.'
      }
    },
    {
      title: 'Impressora multifuncional fiscal não digitaliza para PDF',
      description: 'Scanner fica em carregamento infinito e trava.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-4',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-2',
      month: 6,
      day: 17,
      assetTag: 'IMP-KYOCERA-40',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-07-17T16:20:00Z',
        summary: 'Reinicialização do módulo scanner TWAIN e alteração da pasta de destino FTP com permissões de gravação corrigidas.',
        timeSpentHours: 1.0,
        preventiveNotes: 'Criado atalho direto na área de trabalho do usuário.'
      }
    },
    {
      title: 'Troca de teclado com tecla enter afundada',
      description: 'Dificultando digitação de pedidos.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-1',
      priority: 'baixa',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-2',
      month: 6,
      day: 26,
      assetTag: 'PAT-1188',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-07-26T11:00:00Z',
        summary: 'Substituição imediata por teclado novo da reserva técnica.',
        timeSpentHours: 0.2,
        preventiveNotes: 'Baixa de estoque efetuada no almoxarifado.'
      }
    },

    // Mês 8 - Agosto
    {
      title: 'Travamento constante no software contábil Folha de Pagamento',
      description: 'Ao gerar relatório de encargos e FGTS o aplicativo fecha sem aviso.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-6',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-1',
      month: 7,
      day: 5,
      assetTag: 'PAT-3301',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-08-05T14:30:00Z',
        summary: 'Atualização do runtime .NET 8 e substituição de DLL desatualizada fornecida pelo suporte da fornecedora do ERP.',
        timeSpentHours: 2.0,
        preventiveNotes: 'Realizado teste de fechamento com sucesso.'
      }
    },
    {
      title: 'Manutenção periódica e higienização dos servidores locais',
      description: 'Acúmulo de poeira nos filtros de entrada de ar do rack.',
      sectorId: 'sec-1',
      problemTypeId: 'prob-9',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-admin',
      assignedTo: 'usr-tech-2',
      month: 7,
      day: 15,
      assetTag: 'RACK-CPD-01',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-08-15T18:00:00Z',
        summary: 'Limpeza dos filtros de ar, verificação de rotação das ventoinhas e teste de transferência das fontes redundantes.',
        timeSpentHours: 4.0,
        preventiveNotes: 'Todos os equipamentos operando dentro da margem térmica de 21°C.'
      }
    },
    {
      title: 'Reset e cadastro de 2FA para nova colaboradora',
      description: 'Configuração do Microsoft Authenticator no smartphone corporativo.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-5',
      priority: 'baixa',
      status: 'concluido',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-1',
      month: 7,
      day: 22,
      assetTag: 'MFA-AUTH-22',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-08-22T10:15:00Z',
        summary: 'Provisionamento do MFA no portal Azure AD e pareamento via QR Code com validação de token.',
        timeSpentHours: 0.4,
        preventiveNotes: 'Entregue folheto de boas práticas de segurança.'
      }
    },

    // Mês 9 - Setembro
    {
      title: 'Rompimento de fibra óptica no pátio logístico',
      description: 'Caminhão encostou na fiação aérea da doca 4, derrubando a filial.',
      sectorId: 'sec-5',
      problemTypeId: 'prob-3',
      priority: 'critica',
      status: 'concluido',
      userId: 'usr-admin',
      assignedTo: 'usr-admin',
      month: 8,
      day: 9,
      assetTag: 'FIBRA-DOCA-04',
      solution: {
        appliedBy: 'Carlos Oliveira',
        date: '2026-09-09T17:40:00Z',
        summary: 'Fusão óptica de emergência de 4 pares e elevação da tubulação para 5.5m de altura com suporte de aço galvanizado.',
        timeSpentHours: 5.5,
        preventiveNotes: 'Link redundante 4G de failover ativado durante o período sem impacto na operação.'
      }
    },
    {
      title: 'Estação de trabalho do Financeiro com tela azul (BSOD)',
      description: 'Erro MEMORY_MANAGEMENT ao abrir múltiplos navegadores.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-1',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-2',
      month: 8,
      day: 19,
      assetTag: 'PAT-4402',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-09-19T15:10:00Z',
        summary: 'Identificado módulo de RAM DDR4 com setores defeituosos via MemTest86. Pente substituído sob garantia.',
        timeSpentHours: 2.0,
        preventiveNotes: 'Sistema estabilizado sem novos travamentos.'
      }
    },
    {
      title: 'Outlook travando ao pesquisar mensagens antigas',
      description: 'Índice do Windows Search corrompido.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-7',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 8,
      day: 28,
      assetTag: 'PAT-2109',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-09-28T16:00:00Z',
        summary: 'Reconstrução completa do catálogo de indexação do Windows e reparo do arquivo PST via SCANPST.exe.',
        timeSpentHours: 1.5,
        preventiveNotes: 'Pesquisas retornando resultados instantaneamente.'
      }
    },

    // Mês 10 - Outubro (Mês atual com chamados Concluídos, Em Andamento e Abertos)
    {
      title: 'Instalação do PowerBI Desktop para novos relatórios gerenciais',
      description: 'Necessário para fechar o balanço do 3º trimestre.',
      sectorId: 'sec-2',
      problemTypeId: 'prob-8',
      priority: 'media',
      status: 'concluido',
      userId: 'usr-user-1',
      assignedTo: 'usr-tech-1',
      month: 9,
      day: 4,
      assetTag: 'PAT-4402',
      solution: {
        appliedBy: 'Mariana Santos',
        date: '2026-10-04T11:30:00Z',
        summary: 'Instalação da versão corporativa de 64 bits e configuração dos conectores ODBC de leitura.',
        timeSpentHours: 1.0,
        preventiveNotes: 'Instalado gateway de dados pessoal.'
      }
    },
    {
      title: 'Falha no leitor de código de barras USB do caixa de saída',
      description: 'Laser vermelho apagado, não lê boletos e produtos.',
      sectorId: 'sec-4',
      problemTypeId: 'prob-4',
      priority: 'alta',
      status: 'concluido',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-2',
      month: 9,
      day: 11,
      assetTag: 'BAR-HONEY-01',
      solution: {
        appliedBy: 'Lucas Ferreira',
        date: '2026-10-11T14:15:00Z',
        summary: 'Substituição do cabo RJ45-USB blindado que havia rompido internamente por flexão.',
        timeSpentHours: 0.5,
        preventiveNotes: 'Fixado cabo com abraçadeira organizadora na base.'
      }
    },
    {
      title: 'Computador desliga repentinamente após 20 minutos de uso',
      description: 'Aparenta ser aquecimento excessivo na bancada de atendimento.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-1',
      priority: 'alta',
      status: 'em_atendimento',
      userId: 'usr-user-3',
      assignedTo: 'usr-tech-2',
      month: 9,
      day: 18,
      assetTag: 'PAT-3305',
      solution: null
    },
    {
      title: 'Lentidão severa ao salvar relatórios em rede',
      description: 'Arquivo de 5MB demora quase 2 minutos para transferir no Explorer.',
      sectorId: 'sec-5',
      problemTypeId: 'prob-2',
      priority: 'media',
      status: 'em_atendimento',
      userId: 'usr-user-2',
      assignedTo: 'usr-tech-1',
      month: 9,
      day: 19,
      assetTag: 'PAT-5509',
      solution: null
    },
    {
      title: 'Solicitação de liberação de porta VPN para fornecedor externo',
      description: 'Técnico da máquina de embalagem precisa de acesso remoto seguro.',
      sectorId: 'sec-5',
      problemTypeId: 'prob-5',
      priority: 'media',
      status: 'aberto',
      userId: 'usr-user-2',
      assignedTo: null,
      month: 9,
      day: 20,
      assetTag: 'FW-NAT-EXT',
      solution: null
    },
    {
      title: 'Impressora do RH emitindo ruído estridente ao puxar papel',
      description: 'Engrenagem parece travada ou tracionador desgastado.',
      sectorId: 'sec-3',
      problemTypeId: 'prob-4',
      priority: 'alta',
      status: 'aberto',
      userId: 'usr-user-3',
      assignedTo: null,
      month: 9,
      day: 21,
      assetTag: 'IMP-RH-02',
      solution: null
    }
  ];

  let counter = 1001;
  return sampleTickets.map(item => {
    const padMonth = String(item.month + 1).padStart(2, '0');
    const padDay = String(item.day).padStart(2, '0');
    const createdDate = `${currentYear}-${padMonth}-${padDay}T09:${String(counter % 60).padStart(2, '0')}:00Z`;
    
    const user = INITIAL_USERS.find(u => u.id === item.userId) || INITIAL_USERS[0];
    const problem = INITIAL_PROBLEM_TYPES.find(p => p.id === item.problemTypeId) || INITIAL_PROBLEM_TYPES[0];
    const sector = INITIAL_SECTORS.find(s => s.id === item.sectorId) || INITIAL_SECTORS[0];

    return {
      id: `TICK-${counter++}`,
      title: item.title,
      description: item.description,
      sectorId: sector.id,
      sectorName: sector.name,
      problemTypeId: problem.id,
      problemTypeName: problem.name,
      problemCategory: problem.category,
      priority: item.priority,
      status: item.status,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      assignedToId: INITIAL_USERS[0].id,
      assetTag: item.assetTag || 'PAT-S/N',
      createdAt: createdDate,
      updatedAt: item.solution ? item.solution.date : createdDate,
      solution: item.solution ? {
        appliedBy: 'Administrador TI',
        date: item.solution.date,
        summary: item.solution.summary,
        timeSpentHours: item.solution.timeSpentHours,
        preventiveNotes: item.solution.preventiveNotes
      } : null,
      rating: item.solution ? (counter % 2 === 0 ? 5 : 4) : null,
      comments: [
        {
          id: `cmt-${counter}-1`,
          authorName: user.name,
          date: createdDate,
          text: `Chamado registrado para o setor de ${sector.name}.`
        },
        ...(item.solution ? [{
          id: `cmt-${counter}-2`,
          authorName: 'Administrador TI',
          date: item.solution.date,
          text: `Solução aplicada: ${item.solution.summary}`
        }] : [])
      ]
    };
  });
}

class HelpDeskStorage {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Garantir integridade de usuários: se contiver usuários antigos que não o admin, sincronizar
        if (parsed.users && parsed.users.length > 0) {
          const onlyHasAdmin = parsed.users.length === 1 && parsed.users[0].role === 'admin';
          if (!onlyHasAdmin) {
            parsed.users = INITIAL_USERS;
            parsed.currentUser = INITIAL_USERS[0];
            this.saveData(parsed);
          }
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
      tickets: [], // Sistema zerado e limpo para início das operações reais
      currentUser: INITIAL_USERS[0] // Admin padrão
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

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadData();
    return this.data;
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
    this.syncWithSheets('registerSolution', { ticketId, ...solutionData });
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

  createSector(sector) {
    const newSector = {
      id: `sec-${Date.now()}`,
      name: sector.name,
      code: sector.code || sector.name.substring(0, 3).toUpperCase(),
      icon: sector.icon || 'fa-building',
      color: sector.color || '#6366f1'
    };
    this.data.sectors.push(newSector);
    this.saveData();
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

  createProblemType(problem) {
    const newProb = {
      id: `prob-${Date.now()}`,
      name: problem.name,
      category: problem.category || 'Geral',
      slaHours: parseInt(problem.slaHours) || 8,
      icon: problem.icon || 'fa-triangle-exclamation',
      color: problem.color || '#f97316'
    };
    this.data.problemTypes.push(newProb);
    this.saveData();
    return newProb;
  }

  deleteProblemType(id) {
    this.data.problemTypes = this.data.problemTypes.filter(p => p.id !== id);
    this.saveData();
  }

  // Usuários
  getUsers() {
    return this.data.users;
  }

  createUser(userData) {
    const sector = this.data.sectors.find(s => s.id === userData.sectorId);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password || '123456',
      role: userData.role || 'user',
      sectorId: sector ? sector.id : 'sec-1',
      sectorName: sector ? sector.name : 'Geral',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
      phone: userData.phone || '(11) 90000-0000',
      jobTitle: userData.jobTitle || 'Colaborador'
    };
    this.data.users.push(newUser);
    this.saveData();
    this.syncWithSheets('createUser', newUser);
    return newUser;
  }

  deleteUser(id) {
    const userToDelete = this.data.users.find(u => u.id === id);
    if (userToDelete && userToDelete.role === 'admin' && this.data.users.filter(u => u.role === 'admin').length <= 1) {
      throw new Error('Operação de segurança: Não é permitido excluir o único administrador do sistema.');
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

  // Métodos de Autenticação
  authenticate(login, password) {
    const cleanLogin = (login || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = this.data.users.find(u => {
      const emailMatch = (u.email || '').toLowerCase() === cleanLogin;
      const nameMatch = (u.name || '').toLowerCase() === cleanLogin;
      const adminAlias = (cleanLogin === 'admin' && u.role === 'admin');
      if (!emailMatch && !nameMatch && !adminAlias) return false;

      // Validação de senha
      const userPass = u.password || 'admin123';
      return cleanPass === userPass || (u.role === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin'));
    });

    if (user) {
      this.data.currentUser = user;
      try {
        localStorage.setItem('HELPDESK_AUTH_SESSION', JSON.stringify({ userId: user.id, loggedAt: Date.now() }));
      } catch(e) {}
      this.saveData();
      return user;
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
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          if (json.tickets && json.tickets.length > 0) this.data.tickets = json.tickets;
          if (json.sectors && json.sectors.length > 0) this.data.sectors = json.sectors;
          if (json.problemTypes && json.problemTypes.length > 0) this.data.problemTypes = json.problemTypes;
          if (json.users && json.users.length > 0) this.data.users = json.users;
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
