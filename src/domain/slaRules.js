const { Priority } = require('./enums');

/**
 * Matriz de SLA (Horas úteis ou corridas padrão)
 * Resposta: Tempo limite para primeiro atendimento
 * Resolução: Tempo limite para encerramento com sucesso
 */
const SLA_CONFIG = {
  [Priority.CRITICA]: {
    firstResponseHours: 1,
    resolutionHours: 4,
    label: 'Crítica (Até 1h resp / 4h resol)'
  },
  [Priority.ALTA]: {
    firstResponseHours: 2,
    resolutionHours: 8,
    label: 'Alta (Até 2h resp / 8h resol)'
  },
  [Priority.MEDIA]: {
    firstResponseHours: 4,
    resolutionHours: 24,
    label: 'Média (Até 4h resp / 24h resol)'
  },
  [Priority.BAIXA]: {
    firstResponseHours: 8,
    resolutionHours: 48,
    label: 'Baixa (Até 8h resp / 48h resol)'
  }
};

class SlaCalculator {
  /**
   * Calcula os prazos de vencimento do SLA a partir da data de abertura
   */
  static calculateDeadlines(priority = Priority.MEDIA, openedAt = new Date()) {
    const p = SLA_CONFIG[priority] || SLA_CONFIG[Priority.MEDIA];
    const baseTime = openedAt instanceof Date ? openedAt.getTime() : new Date(openedAt).getTime();

    const responseDueAt = new Date(baseTime + p.firstResponseHours * 3600 * 1000).toISOString();
    const resolutionDueAt = new Date(baseTime + p.resolutionHours * 3600 * 1000).toISOString();

    return {
      responseDueAt,
      resolutionDueAt,
      firstResponseHours: p.firstResponseHours,
      resolutionHours: p.resolutionHours
    };
  }

  /**
   * Analisa a conformidade do SLA de um chamado
   */
  static checkCompliance(ticket) {
    const now = Date.now();
    const resolutionDue = new Date(ticket.resolution_due_at).getTime();
    const isResolved = ['RESOLVIDO', 'FECHADO'].includes(ticket.status);

    if (isResolved) {
      const resolvedAt = ticket.resolved_at ? new Date(ticket.resolved_at).getTime() : now;
      const breached = resolvedAt > resolutionDue;
      return {
        status: breached ? 'BREACHED' : 'COMPLIED',
        label: breached ? 'SLA Violado (Estourado)' : 'SLA Cumprido',
        badgeClass: breached ? 'badge-danger' : 'badge-success',
        percentageElapsed: 100,
        remainingMinutes: 0
      };
    }

    const openedAt = new Date(ticket.created_at).getTime();
    const totalDuration = resolutionDue - openedAt;
    const elapsed = now - openedAt;
    const remaining = resolutionDue - now;
    const percentage = totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 100;

    if (remaining < 0) {
      return {
        status: 'BREACHED',
        label: 'SLA Estourado',
        badgeClass: 'badge-danger',
        percentageElapsed: 100,
        remainingMinutes: Math.round(remaining / 60000)
      };
    }

    if (percentage >= 75) {
      return {
        status: 'WARNING',
        label: `Alerta SLA (${Math.round(remaining / 60000)} min restantes)`,
        badgeClass: 'badge-warning',
        percentageElapsed: percentage,
        remainingMinutes: Math.round(remaining / 60000)
      };
    }

    return {
      status: 'OK',
      label: `No Prazo (${Math.round(remaining / 3600000)}h restantes)`,
      badgeClass: 'badge-primary',
      percentageElapsed: percentage,
      remainingMinutes: Math.round(remaining / 60000)
    };
  }
}

module.exports = {
  SLA_CONFIG,
  SlaCalculator
};
