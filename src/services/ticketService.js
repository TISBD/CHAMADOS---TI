const ticketRepository = require('../repositories/ticketRepository');
const interactionRepository = require('../repositories/interactionRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const notificationService = require('./notificationService');
const { SlaCalculator } = require('../domain/slaRules');
const { TicketStatus, Priority, InteractionType, AuditAction, Roles } = require('../domain/enums');

class TicketService {
  async createTicket(data, currentUser, ipAddress = null) {
    if (!data.title || !data.description || !data.category_id) {
      throw new Error('Título, descrição e categoria são obrigatórios.');
    }

    const nextCode = ticketRepository.getNextTicketCode();
    const priority = data.priority || Priority.MEDIA;
    const deadlines = SlaCalculator.calculateDeadlines(priority, new Date());

    const ticketId = `tck-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newTicket = ticketRepository.create({
      id: ticketId,
      code: nextCode,
      title: data.title.trim(),
      description: data.description.trim(),
      status: TicketStatus.ABERTO,
      priority,
      category_id: data.category_id,
      requester_id: currentUser.id,
      assigned_technician_id: data.assigned_technician_id || null,
      department_id: data.department_id || currentUser.department_id || null,
      asset_id: data.asset_id || null,
      first_response_due_at: deadlines.responseDueAt,
      resolution_due_at: deadlines.resolutionDueAt
    });

    // Registra a mensagem inicial de abertura na linha do tempo
    interactionRepository.create({
      id: `int-${Date.now()}-init`,
      ticket_id: ticketId,
      user_id: currentUser.id,
      interaction_type: InteractionType.PUBLIC_MESSAGE,
      content: data.description.trim(),
      is_internal: false
    });

    // Auditoria
    auditLogRepository.log({
      user_id: currentUser.id,
      action: AuditAction.CREATE,
      entity_type: 'TICKET',
      entity_id: ticketId,
      details: { code: nextCode, title: data.title, priority },
      ip_address: ipAddress
    });

    // Dispara webhook e notificações
    notificationService.dispatchCorporateWebhook('ticket_created', {
      ticketCode: nextCode,
      title: data.title,
      requester: currentUser.name,
      priority
    });

    return this.getTicketWithCompliance(ticketId, currentUser);
  }

  getTicketWithCompliance(ticketId, currentUser) {
    const ticket = ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Chamado não encontrado.');
    }

    // RBAC: Colaborador só visualiza seus próprios chamados
    if (currentUser.role === Roles.EMPLOYEE && ticket.requester_id !== currentUser.id) {
      throw new Error('Acesso negado. Você só tem permissão para visualizar seus próprios chamados.');
    }

    const slaCompliance = SlaCalculator.checkCompliance(ticket);
    const includeInternal = currentUser.role === Roles.ADMIN || currentUser.role === Roles.TECHNICIAN;
    const interactions = interactionRepository.listByTicketId(ticket.id, includeInternal);

    return {
      ...ticket,
      sla_compliance: slaCompliance,
      interactions
    };
  }

  listTickets(filters = {}, pagination = {}, currentUser) {
    // RBAC: Se for colaborador, força o filtro para seus chamados
    if (currentUser.role === Roles.EMPLOYEE) {
      filters.requester_id = currentUser.id;
    }

    const result = ticketRepository.list(filters, pagination);

    // Enriquece cada ticket com indicador de SLA
    result.items = result.items.map(t => ({
      ...t,
      sla_compliance: SlaCalculator.checkCompliance(t)
    }));

    return result;
  }

  async assignTechnician(ticketId, technicianId, currentUser, ipAddress = null) {
    // Apenas Técnicos ou Administradores podem atribuir chamados
    if (currentUser.role === Roles.EMPLOYEE) {
      throw new Error('Apenas técnicos ou administradores podem atribuir chamados.');
    }

    const ticket = ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Chamado não encontrado.');

    const targetTechId = technicianId || currentUser.id; // Se vazio, assume o próprio usuário ("Assumir")

    const updateData = {
      assigned_technician_id: targetTechId
    };

    // Se estiver Aberto, transiciona automaticamente para Em Triagem ou Em Atendimento
    if (ticket.status === TicketStatus.ABERTO) {
      updateData.status = TicketStatus.EM_ATENDIMENTO;
      if (!ticket.first_responded_at) {
        updateData.first_responded_at = new Date().toISOString();
      }
    }

    const updated = ticketRepository.update(ticketId, updateData);

    // Registra na timeline
    interactionRepository.create({
      id: `int-${Date.now()}-assign`,
      ticket_id: ticketId,
      user_id: currentUser.id,
      interaction_type: InteractionType.ASSIGNMENT_CHANGE,
      content: `Chamado atribuído ao técnico por ${currentUser.name}.`,
      is_internal: false
    });

    // Auditoria
    auditLogRepository.log({
      user_id: currentUser.id,
      action: AuditAction.ASSIGNMENT,
      entity_type: 'TICKET',
      entity_id: ticketId,
      details: { assigned_to: targetTechId, updated_by: currentUser.name },
      ip_address: ipAddress
    });

    // Notifica o solicitante
    notificationService.createNotification(
      ticket.requester_id,
      ticket.id,
      'Técnico Atribuído',
      `O chamado #${ticket.code} está em atendimento pelo suporte técnico.`,
      'INFO'
    );

    return this.getTicketWithCompliance(ticketId, currentUser);
  }

  async updateStatus(ticketId, newStatus, currentUser, extraData = {}, ipAddress = null) {
    const ticket = ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Chamado não encontrado.');

    // Validação de RBAC para alteração de status
    if (currentUser.role === Roles.EMPLOYEE) {
      // Solicitante só pode Fechar/Confirmar um chamado que já está Resolvido ou Cancelar se ainda Aberto
      const allowedForEmployee = [TicketStatus.FECHADO, TicketStatus.CANCELADO];
      if (!allowedForEmployee.includes(newStatus)) {
        throw new Error('Colaboradores só podem confirmar o encerramento ou cancelar chamados abertos.');
      }
      if (ticket.requester_id !== currentUser.id) {
        throw new Error('Você só pode alterar o status dos seus próprios chamados.');
      }
    }

    const updatePayload = { status: newStatus };

    // Se status for Resolvido
    if (newStatus === TicketStatus.RESOLVIDO) {
      if (!extraData.resolution_summary && !ticket.resolution_summary) {
        throw new Error('É obrigatório registrar o resumo da solução técnica aplicada.');
      }
      updatePayload.resolved_at = new Date().toISOString();
      updatePayload.resolution_summary = extraData.resolution_summary || ticket.resolution_summary;
      updatePayload.root_cause = extraData.root_cause || ticket.root_cause || null;
      if (extraData.time_spent_minutes) {
        updatePayload.time_spent_minutes = (ticket.time_spent_minutes || 0) + parseInt(extraData.time_spent_minutes, 10);
      }
    } else if (newStatus === TicketStatus.FECHADO) {
      updatePayload.closed_at = new Date().toISOString();
    }

    // Se primeiro atendimento
    if (
      !ticket.first_responded_at &&
      (newStatus === TicketStatus.EM_ATENDIMENTO || newStatus === TicketStatus.EM_TRIAGEM) &&
      currentUser.role !== Roles.EMPLOYEE
    ) {
      updatePayload.first_responded_at = new Date().toISOString();
    }

    const updated = ticketRepository.update(ticketId, updatePayload);

    // Registra evento na timeline
    interactionRepository.create({
      id: `int-${Date.now()}-status`,
      ticket_id: ticketId,
      user_id: currentUser.id,
      interaction_type: InteractionType.STATUS_CHANGE,
      content: `Status alterado de "${ticket.status}" para "${newStatus}" por ${currentUser.name}.${extraData.comment ? ` Motivo: ${extraData.comment}` : ''}`,
      is_internal: false
    });

    // Auditoria
    auditLogRepository.log({
      user_id: currentUser.id,
      action: AuditAction.STATUS_CHANGE,
      entity_type: 'TICKET',
      entity_id: ticketId,
      details: { from: ticket.status, to: newStatus, user: currentUser.name },
      ip_address: ipAddress
    });

    // Notificações
    const targetUserId = currentUser.id === ticket.requester_id ? ticket.assigned_technician_id : ticket.requester_id;
    if (targetUserId) {
      notificationService.createNotification(
        targetUserId,
        ticket.id,
        `Chamado ${newStatus}`,
        `O status do chamado #${ticket.code} foi alterado para ${newStatus}.`,
        'STATUS'
      );
    }

    notificationService.dispatchCorporateWebhook('ticket_status_changed', {
      ticketCode: ticket.code,
      from: ticket.status,
      to: newStatus,
      updatedBy: currentUser.name
    });

    return this.getTicketWithCompliance(ticketId, currentUser);
  }
}

module.exports = new TicketService();
