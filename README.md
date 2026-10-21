# 🎧 HelpDesk Pro - Sistema Corporativo de Chamados de TI & Assistência Técnica

Sistema interno para empresas com fluxo completo de abertura de chamados, suporte técnico de TI, controle administrativo e dashboard analítico de inteligência operacional com **mapeamento mês a mês dos tipos de problemas**.

---

## 🚀 Como Iniciar o Sistema

### Opção 1: Execução com 1 Clique (Windows)
Dê um duplo clique no arquivo [`iniciar-sistema.bat`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/iniciar-sistema.bat).  
O servidor local iniciará e abrirá automaticamente no seu navegador em: **`http://localhost:8080`**.

### Opção 2: Via Terminal / Prompt de Comando
No diretório do projeto:
```bash
node server.js
```
Acesse em seu navegador preferido: `http://localhost:8080` ou abra diretamente o arquivo [`index.html`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/index.html).

---

## 🌟 Funcionalidades Implementadas

### 1. 📋 Abertura e Registro de Chamados (Helpdesk & Assistência Técnica)
- Registro de chamados com título, descrição detalhada, setor solicitante, tipo de problema, nível de prioridade (Baixa, Média, Alta, Crítica) e patrimônio/ativo (tag do equipamento).
- Filtros em tempo real por **Status** (*Aberto, Em Atendimento, Concluído, Cancelado*), **Prioridade**, **Setor** e busca textual instantânea.
- Visualização detalhada de cada chamado com timeline de interações e comentários.

### 2. 🛠️ Registro e Gestão de Solução Aplicada
- Campo dedicado para documentar a **Solução Técnica Aplicada** executada pelo técnico ou administrador.
- Registro de **Tempo Gasto** (em horas) e **Ações Preventivas / Recomendações**.
- Ao registrar a solução, o chamado é concluído automaticamente e indexado na **Base de Conhecimento (KB)** interna para reaproveitamento em futuros incidentes.

### 3. 🛡️ Gestão e Controle Administrativo (Admin) & Segurança
- **Ambiente Limpo e Seguro**: A base de usuários inicia configurada exclusivamente com o **Administrador TI**, permitindo cadastrar os usuários e colaboradores reais da empresa com total segurança.
- **Cadastro de Usuários**: Gerenciamento de colaboradores, cargos, e-mails, setores e níveis de acesso (*Admin*, *Técnico de Suporte*, *Usuário Comum*).
- **Proteção Anti-Exclusão**: O sistema impede a exclusão acidental do administrador master.
- **Sanitização XSS**: Todos os dados renderizados passam por escape de caracteres HTML.
- **Proteção de Servidor**: Proteção contra Path Traversal e cabeçalhos `X-Content-Type-Options: nosniff` no `server.js`.
- **Proteção no Google Sheets**: Sanitização de células contra Formula Injection (`=`, `+`, `-`, `@`).

### 4. 📊 Dashboard Analítico Mês a Mês (Aba Exclusiva)
- **Mapeamento Mês a Mês dos Tipos de Problemas**: Gráfico dinâmico com todas as categorias distribuídas pelos 12 meses do ano (Janeiro a Dezembro).
- **Modos de Visualização**:
  - *Barras Agrupadas* (comparação direta mês a mês)
  - *Linhas & Tendência* (sazonalidade e evolução)
  - *Empilhado* (volume total mensal por categoria)
- **Matriz / Tabela Térmica de Cruzamento**: Tabela consolidada com **Tipos de Problemas x Meses (Jan..Dez)**, totais anuais, percentuais relativos e formatação por intensidade de ocorrência.
- **Indicadores Chave (KPIs)**: Total de chamados, Taxa de resolução, MTTR (tempo médio de solução), volume de incidentes críticos e problema campeão de recorrência.
- **Exportação de Relatórios**: Exportação instantânea em formato CSV para auditorias e relatórios de TI.

---

## 📚 Documentação Completa & Arquitetura
Consulte o arquivo [`DOCUMENTACAO.md`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/DOCUMENTACAO.md) para:
- **Google Sheets como Banco de Dados Principal**: Passo a passo com o código [`google-apps-script.js`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/google-apps-script.js) pronto para implantação.
- **Deploy no GitHub & GitHub Pages**: Guia passo a passo para publicação online 100% gratuita.
- **Modelo de Dados (Schemas)**: Estrutura completa de tabelas e entidades.

---

## 📁 Estrutura do Projeto

- [`DOCUMENTACAO.md`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/DOCUMENTACAO.md): Manual técnico completo, modelo de dados, Google Sheets e deploy.
- [`google-apps-script.js`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/google-apps-script.js): Código pronto para copiar no Google Apps Script (Web App REST API).
- [`.gitignore`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/.gitignore): Arquivos ignorados pelo Git para publicação limpa no repositório.
- [`index.html`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/index.html): Estrutura semântica da aplicação e modais interativos.
- [`style.css`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/style.css): Sistema visual moderno com tema escuro (Dark Mode corporativo), tema claro, glassmorphism e responsividade.
- [`app.js`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/app.js): Controlador da aplicação, navegação por abas, controle de perfis/permissões e modais.
- [`chart-dashboard.js`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/chart-dashboard.js): Módulo de inteligência de dados com Chart.js e matriz mês a mês.
- [`mock-data.js`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/mock-data.js): Base de dados retroativa com chamados, soluções aplicadas e persistência via `localStorage`.
- [`server.js`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/server.js): Servidor HTTP estático nativo em Node.js (sem dependências externas).
- [`iniciar-sistema.bat`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/iniciar-sistema.bat): Atalho de inicialização rápida no Windows.
