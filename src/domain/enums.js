/**
 * Enums e constantes de domínio para o Service Desk corporativo
 */

const Roles = Object.freeze({
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  EMPLOYEE: 'employee'
});

const TicketStatus = Object.freeze({
  ABERTO: 'ABERTO',
  EM_TRIAGEM: 'EM_TRIAGEM',
  EM_ATENDIMENTO: 'EM_ATENDIMENTO',
  PENDENTE_USUARIO: 'PENDENTE_USUARIO',
  RESOLVIDO: 'RESOLVIDO',
  FECHADO: 'FECHADO',
  CANCELADO: 'CANCELADO'
});

const Priority = Object.freeze({
  BAIXA: 'BAIXA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA'
});

const InteractionType = Object.freeze({
  PUBLIC_MESSAGE: 'PUBLIC_MESSAGE',
  INTERNAL_NOTE: 'INTERNAL_NOTE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  ASSIGNMENT_CHANGE: 'ASSIGNMENT_CHANGE',
  SYSTEM_LOG: 'SYSTEM_LOG'
});

const AuditAction = Object.freeze({
  LOGIN: 'LOGIN',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  ASSIGNMENT: 'ASSIGNMENT',
  DELETE: 'DELETE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  RESOLUTION: 'RESOLUTION'
});

const AssetStatus = Object.freeze({
  EM_USO: 'EM_USO',
  DISPONIVEL: 'DISPONIVEL',
  MANUTENCAO: 'MANUTENCAO',
  DESATIVADO: 'DESATIVADO'
});

module.exports = {
  Roles,
  TicketStatus,
  Priority,
  InteractionType,
  AuditAction,
  AssetStatus
};
