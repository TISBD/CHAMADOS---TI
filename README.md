# 🎧 HelpDesk Pro - Enterprise Service Desk & Gestão de TI

Sistema corporativo de Helpdesk e Service Desk de TI projetado sob os princípios de **Clean Architecture**, alta disponibilidade, governança de dados e **controle estrito de SLA**.

---

## 🚀 Como Executar o Sistema

### 1. Pré-requisitos
* **Node.js**: Versão 20 LTS ou superior (já instalada em seu ambiente local: Node v24).
* **Navegador**: Qualquer navegador moderno (Edge, Chrome, Firefox, Safari).

### 2. Inicialização Rápida (1 Clique no Windows)
Dê um duplo clique no arquivo [`iniciar-sistema.bat`](file:///c:/Users/Sb%20Despachos/Desktop/sistema%20ti/iniciar-sistema.bat).  
O servidor local iniciará automaticamente na porta **`8080`** e abrirá a aplicação no seu navegador padrão em:  
👉 **`http://localhost:8080`**

### 3. Inicialização via Terminal / Prompt de Comando
```bash
# 1. Instalar dependências (já instaladas)
npm install

# 2. Inicializar o servidor com migrações e seeders automáticos
npm start
```

---

## 👤 Credenciais de Demonstração Pré-configuradas (RBAC)

O sistema conta com botões de **acesso rápido em 1 clique** na tela de login, além das credenciais manuais abaixo:

| Papel (Role) | E-mail de Acesso | Senha Padrão | Nível de Permissão |
| :--- | :--- | :--- | :--- |
| **Administrador Master** | `admin@empresa.com` | `admin123` | Acesso total: Usuários, Departamentos, Categorias, Ativos, Auditoria e Relatórios |
| **Técnico de Suporte (N2)** | `tecnico@empresa.com` | `tecnico123` | Fila geral, atribuição de chamados, notas internas da TI e registro de solução |
| **Colaborador / Solicitante** | `usuario@empresa.com` | `user123` | Abertura de chamados, acompanhamento próprio e avaliação de satisfação (CSAT) |

---

## 🏗️ Arquitetura do Sistema & Stack Tecnológica

* **Backend**: Node.js com Express e SQLite nativo (`node:sqlite DatabaseSync`) com WAL Mode ativado para máxima concorrência e zero problemas de compilação.
* **Segurança**: Autenticação stateless via **JWT**, senhas criptografadas com **bcrypt**, sanitização de inputs contra **XSS**, rate-limiting em memória e upload seguro via **Multer** (validação estrita de tamanho e MIME types).
* **Frontend**: Single Page Application (SPA) modular em **Vanilla JavaScript** e **CSS moderno**, paleta HSL com Dark/Light Mode, glassmorphism e gráficos dinâmicos via **Chart.js**.
* **Banco de Dados Relacional**: Tabelas normalizadas com integridade referencial (`FOREIGN KEY ON DELETE/UPDATE`), índices compostos de alta performance e suporte a transações.

---

## 🌟 Funcionalidades e Módulos Entregues

1. **Autenticação & RBAC (Role-Based Access Control)**:
   - Login seguro, tokens JWT com tempo de expiração e logout.
   - Recuperação e redefinição de senha com tokens criptográficos seguros.
   - Restrição estrita de rotas e visibilidade de abas por perfil.

2. **Central de Chamados & Ciclo de Vida**:
   - Abertura completa com prioridade, departamento solicitante, ativo de patrimônio e anexo validado (até 5MB).
   - Ciclo de vida completo: `ABERTO` ➔ `EM_TRIAGEM` ➔ `EM_ATENDIMENTO` ➔ `PENDENTE_USUARIO` ➔ `RESOLVIDO` ➔ `FECHADO` (ou `CANCELADO`).
   - Linha do tempo interativa com **mensagens públicas** e **notas técnicas internas** (privadas para a equipe de TI).

3. **Motor de SLA em Tempo Real**:
   - Cálculo automático de prazos limites de 1ª resposta (MTTA) e resolução (MTTR) por prioridade (*Crítica: 1h/4h, Alta: 2h/8h, Média: 4h/24h, Baixa: 8h/48h*).
   - Indicadores visuais de conformidade (*No Prazo*, *Alerta >75% decorrido*, *SLA Violado*).

4. **Dashboard & Inteligência de Dados**:
   - Indicadores em tempo real: Total, Abertos, Em Atendimento, Resolvidos, MTTR, MTTA, % de Conformidade SLA e Nota CSAT.
   - Gráficos interativos por categoria, departamento e prioridade.
   - **Matriz Cruzada Mês a Mês**: Mapeamento dos 12 meses do ano com distribuição sazonal de incidentes.

5. **Módulos Extras Inclusos**:
   - **Base de Conhecimento (KB / FAQ)** com deflexão inteligente de chamados (sugere artigos de autoajuda em tempo real enquanto o usuário digita o título).
   - **Inventário de Ativos de TI (Patrimônio)** integrado diretamente à abertura de chamados.
   - **Avaliação de Atendimento (CSAT)** com escala de 1 a 5 estrelas e comentários qualitativos.
   - **Logs de Auditoria Imutáveis** para rastreabilidade de todas as ações de usuários.
   - **Suporte a Webhooks Corporativos** para disparo assíncrono para Slack, Microsoft Teams ou Discord.
