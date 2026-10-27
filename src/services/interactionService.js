const interactionRepository = require('../repositories/interactionRepository');
const ticketRepository = require('../repositories/ticketRepository');
const notificationService = require('./notificationService');
const auditLogRepository = require('../repositories/auditLogRepository');
const { InteractionType, Roles, AuditAction } = require('../domain/enums');

class InteractionService {
  async addInteraction(ticketId, data, currentUser, ipAddress = null) {
    if (!data.content || !data.content.trim()) {
      throw new Error('O conteúdo da mensagem ou nota não pode estar vazio.');
    }

    const ticket = ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Chamado não encontrado.');

    // RBAC: Se for colaborador, não pode ver nem criar nota interna
    let isInternal = Boolean(data.is_internal);
    if (currentUser.role === Roles.EMPLOYEE) {
      isInternal = false;
      if (ticket.requester_id !== currentUser.id) {
        throw new Error('Você só pode interagir em chamados abertos por você.');
      }
    }

    // Se o técnico estiver respondendo pela primeira vez, registra o primeiro atendimento
    if (
      !ticket.first_responded_at &&
      (currentUser.role === Roles.TECHNICIAN || currentUser.role === Roles.ADMIN)
    ) {
      ticketRepository.update(ticketId, {
        first_responded_at: new Date().toISOString()
      });
    }

    const interactionId = `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const interaction = interactionRepository.create({
      id: interactionId,
      ticket_id: ticketId,
      user_id: currentUser.id,
      interaction_type: isInternal ? InteractionType.INTERNAL_NOTE : InteractionType.PUBLIC_MESSAGE,
      content: data.content.trim(),
      is_internal: isInternal
    });

    // Se a mensagem for pública, notifica a outra parte
    if (!isInternal) {
      const recipientId = currentUser.id === ticket.requester_id ? ticket.assigned_technician_id : ticket.requester_id;
      if (recipientId) {
        notificationService.createNotification(
          recipientId,
          ticket.id,
          'Nova Resposta no Chamado',
          `${currentUser.name} enviou uma nova mensagem no chamado #${ticket.code}.`,
          'MESSAGE'
        );
      }
    }

    // Auditoria
    auditLogRepository.log({
      user_id: currentUser.id,
      action: isInternal ? 'ADD_INTERNAL_NOTE' : 'ADD_COMMENT',
      entity_type: 'TICKET',
      entity_id: ticketId,
      details: { interactionId, is_internal: isInternal },
      ip_address: ipAddress
    });

    return interaction;
  }
}

module.exports = new InteractionService();
