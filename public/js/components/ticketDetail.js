/**
 * Componente do Modal Detalhado de Chamado
 */

class TicketDetailComponent {
  constructor() {
    this.currentTicket = null;
  }

  async openModal(ticketId) {
    const modal = document.getElementById('ticketDetailModal');
    if (!modal) return;

    modal.classList.add('active');
    const body = document.getElementById('ticketDetailBody');
    body.innerHTML = `
      <div style="text-align:center; padding:50px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--primary); margin-bottom:12px; display:block;"></i>
        Carregando detalhes do chamado...
      </div>
    `;

    try {
      const res = await window.api.get(`/tickets/${ticketId}`);
      this.currentTicket = res.data;
      this.render();
    } catch (err) {
      body.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--danger);">
          <i class="fa-solid fa-circle-exclamation" style="font-size:1.8rem; margin-bottom:10px; display:block;"></i>
          ${window.appState.escapeHtml(err.message)}
        </div>
      `;
    }
  }

  closeModal() {
    const modal = document.getElementById('ticketDetailModal');
    if (modal) modal.classList.remove('active');
    this.currentTicket = null;
  }

  render() {
    const t = this.currentTicket;
    const body = document.getElementById('ticketDetailBody');
    const isTech = window.appState.isTechnician();
    const isOwner = t.requester_id === window.appState.getUser()?.id;
    const isResolved = ['RESOLVIDO', 'FECHADO'].includes(t.status);

    const sla = t.sla_compliance || {};
    const slaBadge = `<span class="badge-sla sla-${sla.status}">${sla.label || 'SLA'}</span>`;

    // Botões de Ação de acordo com o papel RBAC
    let actionButtons = '';
    if (isTech) {
      if (!t.assigned_technician_id || t.assigned_technician_id !== window.appState.getUser()?.id) {
        actionButtons += `
          <button class="btn-secondary" onclick="window.ticketDetailComponent.assignToMe('${t.id}')">
            <i class="fa-solid fa-hand-holding-hand"></i> Assumir Chamado
          </button>
        `;
      }
      if (t.status !== 'RESOLVIDO' && t.status !== 'FECHADO') {
        actionButtons += `
          <button class="btn-primary" onclick="window.ticketDetailComponent.openResolveModal('${t.id}')">
            <i class="fa-solid fa-circle-check"></i> Resolver Chamado
          </button>
        `;
      }
    }

    if (isOwner && t.status === 'RESOLVIDO') {
      actionButtons += `
        <button class="btn-primary" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);" onclick="window.ticketDetailComponent.openCsatModal('${t.id}')">
          <i class="fa-solid fa-star"></i> Avaliar Atendimento (CSAT)
        </button>
      `;
    }

    // Formulário de resposta
    const internalCheckbox = isTech ? `
      <label style="display:inline-flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer; color:var(--warning);">
        <input type="checkbox" id="replyIsInternal">
        <i class="fa-solid fa-lock"></i> Nota Interna (Visível apenas para Técnicos e Admins)
      </label>
    ` : '';

    // Timeline
    const timelineHtml = (t.interactions || []).map(int => {
      const isInternal = Boolean(int.is_internal);
      const bubbleClass = isInternal ? 'is-internal' : (int.interaction_type === 'STATUS_CHANGE' || int.interaction_type === 'ASSIGNMENT_CHANGE' ? 'is-system' : '');
      const badge = isInternal ? '<span class="internal-badge"><i class="fa-solid fa-lock"></i> NOTA INTERNA TI</span>' : '';
      const avatar = int.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

      return `
        <div class="timeline-item">
          <img src="${avatar}" class="timeline-avatar" alt="${window.appState.escapeHtml(int.user_name)}">
          <div class="timeline-bubble ${bubbleClass}">
            <div class="timeline-meta">
              <span class="timeline-author">${window.appState.escapeHtml(int.user_name)} ${badge}</span>
              <span class="timeline-time">${window.appState.formatDate(int.created_at)}</span>
            </div>
            <div class="timeline-content">${window.appState.escapeHtml(int.content)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Anexos
    const attachmentsHtml = (t.attachments && t.attachments.length > 0) ? `
      <div style="margin-top:16px; padding:12px; background:var(--bg-secondary); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <h5 style="font-size:0.8rem; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px;">
          <i class="fa-solid fa-paperclip"></i> Anexos do Chamado (${t.attachments.length})
        </h5>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          ${t.attachments.map(att => `
            <a href="${att.file_path}" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-surface); padding:6px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); color:var(--text-main); text-decoration:none; font-size:0.82rem;">
              <i class="fa-regular fa-file"></i> ${window.appState.escapeHtml(att.file_name)}
            </a>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Solução aplicada (se resolvido)
    const solutionBox = t.resolution_summary ? `
      <div style="margin-top:16px; padding:16px; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.3); border-radius:var(--radius-md);">
        <h5 style="font-size:0.85rem; font-weight:700; color:var(--success); margin-bottom:6px;">
          <i class="fa-solid fa-check-circle"></i> Solução Técnica Aplicada
        </h5>
        <p style="font-size:0.9rem; color:var(--text-main);">${window.appState.escapeHtml(t.resolution_summary)}</p>
        ${t.root_cause ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;"><strong>Causa Raiz:</strong> ${window.appState.escapeHtml(t.root_cause)}</p>` : ''}
        ${t.time_spent_minutes ? `<p style="font-size:0.8rem; color:var(--text-dim); margin-top:2px;">Tempo registrado: ${t.time_spent_minutes} minutos</p>` : ''}
      </div>
    ` : '';

    body.innerHTML = `
      <!-- Cabeçalho do Ticket -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <span style="font-family:monospace; font-weight:700; color:var(--primary); font-size:1.1rem;">#${window.appState.escapeHtml(t.code)}</span>
          <h2 style="font-size:1.35rem; font-weight:700; margin-top:4px;">${window.appState.escapeHtml(t.title)}</h2>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="badge-status status-${t.status}">${t.status}</span>
          <span class="badge-priority prio-${t.priority}">${t.priority}</span>
        </div>
      </div>

      <!-- Metadados -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; padding:14px; background:var(--bg-secondary); border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.82rem; margin-bottom:18px;">
        <div>
          <span style="color:var(--text-dim); display:block;">Solicitante</span>
          <strong style="color:var(--text-main);">${window.appState.escapeHtml(t.requester_name || '-')}</strong>
          <div style="color:var(--text-muted); font-size:0.75rem;">${window.appState.escapeHtml(t.department_name || '-')}</div>
        </div>
        <div>
          <span style="color:var(--text-dim); display:block;">Técnico Responsável</span>
          <strong style="color:var(--text-main);">${window.appState.escapeHtml(t.technician_name || 'Não atribuído')}</strong>
        </div>
        <div>
          <span style="color:var(--text-dim); display:block;">Conformidade SLA</span>
          ${slaBadge}
        </div>
        <div>
          <span style="color:var(--text-dim); display:block;">Patrimônio / Ativo</span>
          <strong style="color:var(--text-main);">${t.asset_tag ? `<i class="fa-solid fa-laptop"></i> ${t.asset_tag}` : 'Nenhum'}</strong>
        </div>
      </div>

      <!-- Barra de Ações Rápidas -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div style="display:flex; gap:10px;">
          ${actionButtons}
        </div>
        ${isTech ? `
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.8rem; color:var(--text-dim);">Alterar Status:</label>
            <select class="select-filter" style="padding:4px 8px; font-size:0.8rem;" onchange="window.ticketDetailComponent.changeStatus('${t.id}', this.value)">
              <option value="ABERTO" ${t.status === 'ABERTO' ? 'selected' : ''}>Aberto</option>
              <option value="EM_TRIAGEM" ${t.status === 'EM_TRIAGEM' ? 'selected' : ''}>Em Triagem</option>
              <option value="EM_ATENDIMENTO" ${t.status === 'EM_ATENDIMENTO' ? 'selected' : ''}>Em Atendimento</option>
              <option value="PENDENTE_USUARIO" ${t.status === 'PENDENTE_USUARIO' ? 'selected' : ''}>Pendente Usuário</option>
              <option value="RESOLVIDO" ${t.status === 'RESOLVIDO' ? 'selected' : ''}>Resolvido</option>
              <option value="FECHADO" ${t.status === 'FECHADO' ? 'selected' : ''}>Fechado</option>
              <option value="CANCELADO" ${t.status === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
        ` : ''}
      </div>

      ${solutionBox}
      ${attachmentsHtml}

      <!-- Linha do Tempo -->
      <div style="margin-top:24px;">
        <h4 style="font-size:0.95rem; font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:14px;">
          <i class="fa-solid fa-comments"></i> Linha do Tempo & Comunicação
        </h4>
        <div class="timeline-list">
          ${timelineHtml}
        </div>
      </div>

      <!-- Caixa de Envio de Mensagem -->
      <div style="margin-top:20px; background:var(--bg-secondary); padding:16px; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <div style="margin-bottom:10px;">
          <textarea id="replyMessageInput" class="form-textarea" rows="3" placeholder="Digite sua resposta ou atualização sobre o chamado..."></textarea>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            ${internalCheckbox}
          </div>
          <button class="btn-primary" onclick="window.ticketDetailComponent.sendReply('${t.id}')">
            <i class="fa-regular fa-paper-plane"></i> Enviar Resposta
          </button>
        </div>
      </div>
    `;
  }

  async sendReply(ticketId) {
    const input = document.getElementById('replyMessageInput');
    const chkInternal = document.getElementById('replyIsInternal');
    if (!input || !input.value.trim()) {
      window.app.showToast('Digite uma mensagem antes de enviar.', 'danger');
      return;
    }

    try {
      await window.api.post(`/tickets/${ticketId}/interactions`, {
        content: input.value.trim(),
        is_internal: chkInternal ? chkInternal.checked : false
      });
      input.value = '';
      window.app.showToast('Mensagem enviada com sucesso!', 'success');
      this.openModal(ticketId); // Recarrega
      window.ticketsComponent.loadTickets();
    } catch (err) {
      window.app.showToast(err.message, 'danger');
    }
  }

  async assignToMe(ticketId) {
    try {
      await window.api.post(`/tickets/${ticketId}/assign`, { technician_id: window.appState.getUser()?.id });
      window.app.showToast('Chamado atribuído a você!', 'success');
      this.openModal(ticketId);
      window.ticketsComponent.loadTickets();
    } catch (err) {
      window.app.showToast(err.message, 'danger');
    }
  }

  async changeStatus(ticketId, newStatus) {
    if (newStatus === 'RESOLVIDO') {
      this.openResolveModal(ticketId);
      return;
    }
    try {
      await window.api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      window.app.showToast(`Status alterado para ${newStatus}`, 'success');
      this.openModal(ticketId);
      window.ticketsComponent.loadTickets();
    } catch (err) {
      window.app.showToast(err.message, 'danger');
    }
  }

  openResolveModal(ticketId) {
    const modal = document.getElementById('resolveModal');
    if (modal) {
      modal.setAttribute('data-ticket-id', ticketId);
      modal.classList.add('active');
    }
  }

  openCsatModal(ticketId) {
    const modal = document.getElementById('csatModal');
    if (modal) {
      modal.setAttribute('data-ticket-id', ticketId);
      modal.classList.add('active');
    }
  }
}

window.ticketDetailComponent = new TicketDetailComponent();
