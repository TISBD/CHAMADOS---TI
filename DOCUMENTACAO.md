# 📘 Documentação Completa do Sistema HelpDesk Pro

> **Sistema Corporativo de Chamados de TI, Assistência Técnica e Inteligência Operacional**  
> Versão: `1.0.0` | Arquitetura: `Single Page Application (SPA) Vanilla` | Licença: `MIT`

---

## 📑 Índice
1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura Técnica e Arquivos](#2-arquitetura-técnica-e-arquivos)
3. [Módulos e Funcionalidades](#3-módulos-e-funcionalidades)
4. [Modelo de Dados (Schemas)](#4-modelo-de-dados-schemas)
5. [Banco de Dados Principal: Google Sheets (Passo a Passo)](#5-banco-de-dados-principal-google-sheets-passo-a-passo)
   - [5.1 Estrutura das Abas e Colunas](#51-estrutura-das-abas-e-colunas-na-planilha)
   - [5.2 Código do Google Apps Script (Backend REST API)](#52-código-do-google-apps-script-backend-rest-api)
   - [5.3 Como Publicar o Web App no Google](#53-como-publicar-o-web-app-no-google)
   - [5.4 Adaptador JavaScript Frontend para Consumir o Google Sheets](#54-adaptador-javascript-frontend-para-consumir-o-google-sheets)
6. [Banco de Dados de Contingência: Supabase (Plano B)](#6-banco-de-dados-de-contingência-supabase-plano-b)
7. [Guia de Deploy no GitHub (GitHub Pages)](#7-guia-de-deploy-no-github-github-pages)
8. [Roadmap de Melhorias Recomendadas](#8-roadmap-de-melhorias-recomendadas)
9. [Comandos e Operação Local](#9-comandos-e-operação-local)

---

## 1. Visão Geral do Sistema

O **HelpDesk Pro** é uma solução completa para gestão de chamados de TI, manutenção de equipamentos e suporte ao usuário interno de empresas. O sistema foi desenvolvido com foco em alta performance, estética moderna (Dark/Light mode corporativo, glassmorphism e tipografia Inter) e facilidade de manutenção.

### Principais Objetivos:
- **Centralizar solicitações** de suporte e manutenção de equipamentos em um painel unificado.
- **Rastrear soluções técnicas aplicadas**, gerando uma base de conhecimento para problemas recorrentes.
- **Oferecer inteligência de dados** com um dashboard mês a mês (Janeiro a Dezembro) para identificar tendências, sazonalidades e gargalos de infraestrutura.
- **Garantir facilidade de implantação** sem custos de servidores complexos, permitindo rodar estaticamente no **GitHub Pages** e usando **Google Sheets** como banco de dados em nuvem gratuito e acessível.

---

## 2. Arquitetura Técnica e Arquivos

O sistema é construído como uma aplicação frontend desacoplada (**Static Single Page Application**), sem dependência de frameworks pesados (React/Angular/Vue), o que permite carregamento instantâneo e facilidade total para deploy em servidores estáticos como GitHub Pages, Vercel ou Netlify.

### Estrutura de Arquivos do Projeto:

| Arquivo | Responsabilidade |
| :--- | :--- |
| `index.html` | Estrutura semântica HTML5, modais interativos (novo chamado, solução, usuários, setores) e componentes visuais. |
| `style.css` | Folha de estilo completa com design system corporativo, variáveis CSS (`--bg-primary`, `--accent-color`), temas Dark/Light, modais, cards e responsividade mobile/desktop. |
| `app.js` | Controlador principal (`AppController`), gerenciador de rotas de abas, aplicação de regras de perfis/permissões (Admin, Técnico, Usuário), filtros em tempo real e orquestração de modais. |
| `chart-dashboard.js` | Motor analítico (`DashboardManager`) baseado em **Chart.js**. Constrói os gráficos mês a mês (Barras, Linhas, Empilhado), Donut de categorias, Gráfico por Setores e a **Matriz Térmica** (heatmap table). |
| `mock-data.js` | Camada de abstração de dados (`HelpDeskStorage` / `window.db`), dados retroativos para demonstração e sincronização via `localStorage`. Esta camada é o ponto de encaixe para o Google Sheets. |
| `server.js` | Servidor HTTP em Node.js nativo (sem bibliotecas externas) para execução e testes no ambiente local. |
| `iniciar-sistema.bat` | Script batch para inicialização com duplo clique no Windows, configurado para auto-detectar o executável do Node.js e abrir o navegador automaticamente. |

---

## 3. Módulos e Funcionalidades

### 3.1 Painel de Chamados (Helpdesk & Assistência Técnica)
- **Abertura de Chamados**: Coleta título, descrição detalhada, setor solicitante, categoria de problema, nível de prioridade (*Baixa, Média, Alta, Crítica*) e identificação do patrimônio/ativo (`assetTag`).
- **Filtros e Busca Instantânea**: Filtros combinados por Status (*Aberto, Em Atendimento, Concluído, Cancelado*), Prioridade, Setor e campo de busca textual em tempo real.
- **Visualização de Detalhes**: Modal detalhado com histórico de status, dados do solicitante, patrimônio e timeline de interações/comentários.

### 3.2 Registro de Solução Técnica & Base de Conhecimento (KB)
- **Conclusão com Solução**: Ao resolver um chamado, o técnico ou administrador preenche:
  - Resumo técnico da solução aplicada.
  - Tempo gasto em horas.
  - Ações preventivas / recomendações para não repetição.
- **Base de Conhecimento**: Todos os chamados com soluções registradas alimentam automaticamente a aba de Base de Conhecimento, permitindo que a equipe pesquise rapidamente soluções já testadas.

### 3.3 Dashboard Analítico & Matriz Mês a Mês
- **Mapeamento Mês a Mês (Jan a Dez)**: Gráfico dinâmico com modos de visualização:
  - *Barras Agrupadas* (comparação direta mensal).
  - *Linhas & Tendência* (evolução contínua).
  - *Barras Empilhadas* (composição total por mês).
- **Matriz Térmica de Incidentes**: Tabela cruzada de **Categorias x Meses**, com cores proporcionais ao volume e totais anuais.
- **KPIs Executivos**:
  - Total de chamados abertos.
  - Taxa de resolução (%)
  - Tempo médio de atendimento (MTTR).
  - Incidentes críticos.
  - Categoria campeã de ocorrências.
- **Exportação de Relatórios**: Download direto em formato `.csv` compatível com Excel e Google Sheets.

### 3.4 Gestão Administrativa & Perfis
- **Controle de Acessos (RBAC)**:
  - `Admin`: Acesso completo (gerencia setores, tipos de problemas, usuários, fecha chamados e exporta relatórios).
  - `Técnico (tech)`: Atende chamados, registra soluções, comenta na timeline e consulta KB.
  - `Usuário (user)`: Abre chamados, visualiza apenas chamados do seu setor ou criados por ele e adiciona comentários.
- **Simulador de Perfis**: Seletor instantâneo no menu superior para alternar papéis em tempo de execução para testes de permissões.

---

## 4. Modelo de Dados (Schemas)

Abaixo estão os esquemas de dados utilizados pelo sistema. Estes mesmos campos devem ser mantidos ao integrar com o Google Sheets:

### 4.1 Entidade: Chamado (`Ticket`)
```json
{
  "id": "TICK-1001",
  "title": "Computador não liga após queda de energia",
  "description": "Fonte do gabinete cheirando a queimado após tempestade.",
  "sectorId": "sec-2",
  "sectorName": "Financeiro & Contábil",
  "problemTypeId": "prob-1",
  "problemTypeName": "Falha de Hardware",
  "priority": "alta", // "baixa" | "media" | "alta" | "critica"
  "status": "concluido", // "aberto" | "em_atendimento" | "concluido" | "cancelado"
  "userId": "usr-user-1",
  "userName": "Roberto Silva",
  "assignedTo": "usr-tech-2",
  "assignedName": "Lucas Ferreira",
  "assetTag": "PAT-4402",
  "createdAt": "2026-01-12T09:15:00Z",
  "updatedAt": "2026-01-12T16:30:00Z",
  "month": 0, // 0 = Jan, 11 = Dez
  "day": 12,
  "solution": {
    "appliedBy": "Lucas Ferreira",
    "date": "2026-01-12T16:30:00Z",
    "summary": "Substituição da fonte de alimentação de 500W queimada.",
    "timeSpentHours": 2.5,
    "preventiveNotes": "Instalado filtro de linha clampado."
  },
  "timeline": [
    {
      "date": "2026-01-12T09:15:00Z",
      "author": "Roberto Silva",
      "text": "Chamado aberto via portal"
    }
  ]
}
```

### 4.2 Entidade: Usuário (`User`)
```json
{
  "id": "usr-admin",
  "name": "Carlos Oliveira",
  "email": "admin@empresa.com",
  "role": "admin", // "admin" | "tech" | "user"
  "sectorId": "sec-1",
  "sectorName": "Tecnologia & TI",
  "avatar": "https://images.unsplash.com/...",
  "phone": "(11) 98765-4321",
  "jobTitle": "Gestor de TI & Infra"
}
```

### 4.3 Entidade: Setor (`Sector`)
```json
{
  "id": "sec-1",
  "name": "Tecnologia & TI",
  "code": "TI",
  "icon": "fa-server",
  "color": "#6366f1"
}
```

### 4.4 Entidade: Tipo de Problema (`ProblemType`)
```json
{
  "id": "prob-1",
  "name": "Falha de Hardware",
  "category": "Equipamento",
  "slaHours": 8,
  "icon": "fa-microchip",
  "color": "#ef4444"
}
```

---

## 5. Banco de Dados Principal: Google Sheets (Passo a Passo)

Conforme a preferência do projeto, o **Google Sheets** será o banco de dados oficial em produção.

### Vantagens desta Abordagem:
1. **Custo Zero Vitalício**: Sem taxas de instâncias cloud.
2. **Visualização Amigável**: Gestores podem abrir a planilha do Google Drive a qualquer momento para auditar dados, criar gráficos no Looker Studio ou exportar relatórios.
3. **Deploy 100% Estático**: O frontend roda no GitHub Pages e conversa com a planilha via HTTPS.

---

### 5.1 Estrutura das Abas e Colunas na Planilha

Crie uma nova planilha no Google Sheets chamada **`HelpDesk_Pro_DB`** com as 4 abas seguintes:

#### Aba 1: `Chamados` (Linha 1 = Cabeçalho)
| Coluna | Nome da Coluna | Descrição | Exemplo |
| :---: | :--- | :--- | :--- |
| **A** | `id` | Identificador único | `TICK-1001` |
| **B** | `title` | Título do problema | `Computador não liga` |
| **C** | `description` | Descrição do chamado | `Fonte queimada` |
| **D** | `sectorId` | Código do setor | `sec-1` |
| **E** | `sectorName` | Nome do setor | `Tecnologia & TI` |
| **F** | `problemTypeId` | Código da categoria | `prob-1` |
| **G** | `problemTypeName` | Nome da categoria | `Falha de Hardware` |
| **H** | `priority` | Prioridade | `alta` |
| **I** | `status` | Status | `aberto` |
| **J** | `userId` | ID do solicitante | `usr-user-1` |
| **K** | `userName` | Nome do solicitante | `Roberto Silva` |
| **L** | `assignedTo` | ID do técnico atribuído | `usr-tech-1` |
| **M** | `assignedName` | Nome do técnico | `Mariana Santos` |
| **N** | `assetTag` | Tag do patrimônio | `PAT-4402` |
| **O** | `createdAt` | Data ISO de abertura | `2026-01-12T09:15:00Z` |
| **P** | `updatedAt` | Data ISO de alteração | `2026-01-12T16:30:00Z` |
| **Q** | `solutionSummary` | Resumo da solução técnica | `Substituição da fonte...` |
| **R** | `solutionTimeSpent`| Horas gastas na solução | `2.5` |
| **S** | `solutionPreventive`| Recomendações preventivas | `Instalado filtro de linha` |
| **T** | `timelineJson` | Histórico em JSON serializado | `[{"date":"...","text":"..."}]` |

#### Aba 2: `Usuarios`
Colunas: `id` | `name` | `email` | `role` | `sectorId` | `sectorName` | `avatar` | `phone` | `jobTitle`

#### Aba 3: `Setores`
Colunas: `id` | `name` | `code` | `icon` | `color`

#### Aba 4: `TiposProblemas`
Colunas: `id` | `name` | `category` | `slaHours` | `icon` | `color`

---

### 5.2 Código do Google Apps Script (Backend REST API)

Dentro da planilha do Google Sheets:
1. Clique em **Extensões** > **Apps Script**.
2. Apague o código padrão e cole o script abaixo:

```javascript
/**
 * HelpDesk Pro - API REST para Google Sheets
 * Suporta GET (listar dados) e POST (criar/atualizar chamados e cadastros)
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

// Helper para converter aba em lista de Objetos JSON
function sheetToObjects(sheetName) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      // Tentar converter JSON strings (ex: timelineJson)
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[headers[j]] = val;
    }
    data.push(obj);
  }
  return data;
}

// Endpoint GET: Retorna dados para o frontend
function doGet(e) {
  const action = e.parameter.action || 'all';
  let responseData = {};
  
  try {
    if (action === 'all' || action === 'init') {
      responseData = {
        success: true,
        tickets: sheetToObjects('Chamados'),
        users: sheetToObjects('Usuarios'),
        sectors: sheetToObjects('Setores'),
        problemTypes: sheetToObjects('TiposProblemas')
      };
    } else if (action === 'tickets') {
      responseData = { success: true, tickets: sheetToObjects('Chamados') };
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

// Endpoint POST: Insere ou atualiza registros
function doPost(e) {
  let output = { success: false };
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    
    if (action === 'createTicket') {
      output = handleCreateTicket(payload.data);
    } else if (action === 'updateTicket') {
      output = handleUpdateTicket(payload.data);
    } else if (action === 'registerSolution') {
      output = handleRegisterSolution(payload.data);
    } else if (action === 'createSector') {
      output = appendRow('Setores', payload.data);
    } else if (action === 'createProblemType') {
      output = appendRow('TiposProblemas', payload.data);
    } else if (action === 'createUser') {
      output = appendRow('Usuarios', payload.data);
    }
  } catch (err) {
    output = { success: false, error: err.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// Função para inserir novo chamado
function handleCreateTicket(ticket) {
  const sheet = SS.getSheetByName('Chamados');
  const id = 'TICK-' + (Math.floor(1000 + Math.random() * 9000));
  const createdAt = new Date().toISOString();
  
  sheet.appendRow([
    id,
    ticket.title || '',
    ticket.description || '',
    ticket.sectorId || '',
    ticket.sectorName || '',
    ticket.problemTypeId || '',
    ticket.problemTypeName || '',
    ticket.priority || 'media',
    'aberto',
    ticket.userId || '',
    ticket.userName || '',
    ticket.assignedTo || '',
    ticket.assignedName || '',
    ticket.assetTag || '',
    createdAt,
    createdAt,
    '', // solutionSummary
    '', // solutionTimeSpent
    '', // solutionPreventive
    JSON.stringify([{ date: createdAt, author: ticket.userName, text: 'Chamado aberto via portal' }])
  ]);
  
  return { success: true, id: id };
}

// Função para registrar solução técnica
function handleRegisterSolution(data) {
  const sheet = SS.getSheetByName('Chamados');
  const values = sheet.getDataRange().getValues();
  const idCol = 0; // Coluna A (id)
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol] === data.ticketId) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, 9).setValue('concluido'); // Coluna I: status
      sheet.getRange(rowNum, 16).setValue(new Date().toISOString()); // Coluna P: updatedAt
      sheet.getRange(rowNum, 17).setValue(data.summary); // Coluna Q: solutionSummary
      sheet.getRange(rowNum, 18).setValue(data.timeSpentHours); // Coluna R: solutionTimeSpent
      sheet.getRange(rowNum, 19).setValue(data.preventiveNotes); // Coluna S: solutionPreventive
      
      // Atualizar timeline
      let timeline = [];
      try { timeline = JSON.parse(values[i][19] || '[]'); } catch (e) {}
      timeline.push({
        date: new Date().toISOString(),
        author: data.appliedBy,
        text: 'Solução técnica registrada. Chamado concluído.'
      });
      sheet.getRange(rowNum, 20).setValue(JSON.stringify(timeline));
      
      return { success: true };
    }
  }
  return { success: false, message: 'Chamado não encontrado' };
}

// Helper genérico para adicionar linha
function appendRow(sheetName, item) {
  const sheet = SS.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => item[header] !== undefined ? item[header] : '');
  sheet.appendRow(newRow);
  return { success: true, item: item };
}
```

---

### 5.3 Como Publicar o Web App no Google

1. No editor do Apps Script, clique no botão azul **Implantar (Deploy)** > **Nova implantação**.
2. Clique no ícone de engrenagem ⚙️ e selecione **Aplicativo da Web (Web app)**.
3. Configure:
   - **Descrição**: `HelpDesk Pro API Prod`
   - **Executar como**: **Eu (seu email)**
   - **Quem tem acesso**: **Qualquer pessoa (Anyone)** *(indispensável para o frontend conseguir acessar sem bloqueios)*
4. Clique em **Implantar**.
5. Autorize as permissões de acesso da sua conta Google quando solicitado.
6. **Copie o link gerado** (Exemplo: `https://script.google.com/macros/s/AKfycbx.../exec`).  
   Este link será sua URL de API.

---

### 5.4 Adaptador JavaScript Frontend para Consumir o Google Sheets

Para conectar o sistema à planilha, basta criar um arquivo `sheets-config.js` ou configurar a constante com a URL do seu Web App:

```javascript
// sheets-config.js
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/SUA_URL_AQUI/exec";

class SheetsAPIAdapter {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async fetchAllData() {
    const res = await fetch(`${this.apiUrl}?action=all`);
    const json = await res.json();
    return json;
  }

  async createTicket(ticketData) {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      mode: 'no-cors', // O Google Apps Script redireciona via HTTP 302
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createTicket', data: ticketData })
    });
    return res;
  }

  async registerSolution(ticketId, solutionData) {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'registerSolution',
        data: { ticketId, ...solutionData }
      })
    });
    return res;
  }
}

window.sheetsApi = new SheetsAPIAdapter(GOOGLE_SHEETS_API_URL);
```

> **Nota sobre o modo Offline/Híbrido**:  
> No arquivo `mock-data.js`, a classe `HelpDeskStorage` pode manter o cache no `localStorage` e sincronizar em segundo plano com a planilha do Google, garantindo que o sistema continue abrindo rápido mesmo em conexões lentas!

---

## 6. Banco de Dados de Contingência: Supabase (Plano B)

Caso a empresa cresça para centenas de milhares de chamados simultâneos e exija um banco relacional SQL com WebSockets em tempo real, o **Supabase** é o plano B preparado.

### Script SQL para Criação das Tabelas no Supabase:

```sql
-- 1. Tabela de Setores
CREATE TABLE sectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  icon TEXT DEFAULT 'fa-building',
  color TEXT DEFAULT '#6366f1'
);

-- 2. Tabela de Tipos de Problemas
CREATE TABLE problem_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sla_hours INT DEFAULT 8,
  icon TEXT DEFAULT 'fa-triangle-exclamation',
  color TEXT DEFAULT '#f97316'
);

-- 3. Tabela de Usuários
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'tech', 'user')) DEFAULT 'user',
  sector_id TEXT REFERENCES sectors(id),
  avatar TEXT,
  phone TEXT,
  job_title TEXT
);

-- 4. Tabela de Chamados
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sector_id TEXT REFERENCES sectors(id),
  problem_type_id TEXT REFERENCES problem_types(id),
  priority TEXT CHECK (priority IN ('baixa', 'media', 'alta', 'critica')) DEFAULT 'media',
  status TEXT CHECK (status IN ('aberto', 'em_atendimento', 'concluido', 'cancelado')) DEFAULT 'aberto',
  user_id TEXT REFERENCES users(id),
  assigned_to TEXT REFERENCES users(id),
  asset_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  solution_summary TEXT,
  solution_time_hours NUMERIC,
  solution_preventive TEXT,
  timeline JSONB DEFAULT '[]'::jsonb
);
```

Para conectar caso necessário:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = supabase.createClient('https://SEU_PROJETO.supabase.co', 'SUA_ANON_KEY');
</script>
```

---

## 7. Guia de Deploy no GitHub (GitHub Pages)

O HelpDesk Pro é 100% compatível com o **GitHub Pages**, pois é composto por arquivos estáticos que não exigem backend Node rodando em servidor pago.

### Passo 1: Inicializar o Repositório Git Localmente
Abra o PowerShell ou Terminal no diretório da pasta do sistema:

```bash
git init
git add .
git commit -m "feat: release inicial do HelpDesk Pro com suporte a Google Sheets"
```

### Passo 2: Criar Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Dê o nome ao repositório: `helpdesk-pro` (ou o nome de sua preferência).
3. Deixe-o como **Public** ou **Private**.
4. Não adicione README ou licença (já temos no projeto local).
5. Clique em **Create repository**.

### Passo 3: Conectar e Enviar os Arquivos
No seu terminal local, execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/helpdesk-pro.git
git branch -M main
git push -u origin main
```

### Passo 4: Ativar o GitHub Pages (Publicação Gratuita)
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção **Build and deployment**:
   - **Source**: Selecione `Deploy from a branch`.
   - **Branch**: Selecione `main` e a pasta `/(root)`.
4. Clique no botão **Save**.
5. Aguarde cerca de 1 a 2 minutos. Uma mensagem com o link público aparecerá no topo:
   > 🚀 **Your site is live at: `https://SEU_USUARIO.github.io/helpdesk-pro/`**

Pronto! Qualquer colaborador poderá acessar o HelpDesk Pro de qualquer dispositivo (computador, tablet ou celular).

---

## 8. Roadmap de Melhorias Recomendadas

Abaixo estão melhorias prontas para serem implementadas no seu fluxo de evolução:

1. **Upload de Fotos e Evidências para o Google Drive**:
   - Adicionar campo de anexo no formulário de abertura de chamado.
   - O Google Apps Script recebe o arquivo em base64 e salva diretamente em uma pasta do Google Drive da empresa, gravando o link na planilha.

2. **Notificações Automáticas no Gmail**:
   - No Apps Script, adicionar `GmailApp.sendEmail()` ao criar ou concluir chamados, disparando e-mail para o usuário informando o status e a solução aplicada.

3. **Geração de Ordem de Serviço (PDF)**:
   - Adicionar botão "Imprimir O.S." no modal de detalhes do chamado para geração de comprovante físico ou assinatura do solicitante.

4. **SLA com Contagem Regressiva Visual**:
   - Exibir badge com contador de tempo restante baseado no `slaHours` do tipo de problema (ex: 2 horas restantes, em atraso).

5. **Notificação no Telegram / WhatsApp**:
   - Webhook acionado via Apps Script para alertar os técnicos de plantão imediatamente quando um chamado com prioridade `Crítica` for aberto.

---

## 9. Comandos e Operação Local

- **Iniciar com 1 Clique (Windows)**: Duplo clique em [`iniciar-sistema.bat`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/iniciar-sistema.bat).
- **Iniciar via Terminal Node**:
  ```bash
  node server.js
  ```
- **Acesso Local**: [http://localhost:8080](http://localhost:8080)
- **Troca de Temas**: Botão de Sol/Lua no canto superior direito (armazena preferência no navegador).
- **Exportação de Dados**: Botão "Exportar Relatório CSV" dentro da aba do Dashboard Mês a Mês.

---

*Documentação elaborada para o time de TI e desenvolvimento. Dúvidas ou novas implementações podem ser integradas diretamente nas próximas versões.*
