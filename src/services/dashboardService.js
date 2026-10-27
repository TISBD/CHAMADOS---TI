const { getDatabase } = require('../database/connection');
const csatRepository = require('../repositories/csatRepository');

class DashboardService {
  constructor() {
    this.db = getDatabase();
  }

  getExecutiveMetrics() {
    // 1. Contadores gerais
    const total = this.db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
    const open = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('ABERTO', 'EM_TRIAGEM')").get().count;
    const inProgress = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('EM_ATENDIMENTO', 'PENDENTE_USUARIO')").get().count;
    const resolved = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('RESOLVIDO', 'FECHADO')").get().count;
    const critical = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'CRITICA' AND status NOT IN ('RESOLVIDO', 'FECHADO', 'CANCELADO')").get().count;

    // 2. MTTR (Mean Time to Resolution) em minutos
    const mttrRow = this.db.prepare(`
      SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24 * 60) as avg_minutes
      FROM tickets
      WHERE resolved_at IS NOT NULL
    `).get();
    const mttrMinutes = Math.round(mttrRow.avg_minutes || 0);

    // 3. MTTA (Mean Time to Acknowledge / 1ª Resposta) em minutos
    const mttaRow = this.db.prepare(`
      SELECT AVG((julianday(first_responded_at) - julianday(created_at)) * 24 * 60) as avg_minutes
      FROM tickets
      WHERE first_responded_at IS NOT NULL
    `).get();
    const mttaMinutes = Math.round(mttaRow.avg_minutes || 0);

    // 4. Conformidade de SLA (% de chamados resolvidos dentro do resolution_due_at)
    const slaRow = this.db.prepare(`
      SELECT 
        COUNT(*) as total_resolved,
        SUM(CASE WHEN resolved_at <= resolution_due_at THEN 1 ELSE 0 END) as within_sla
      FROM tickets
      WHERE resolved_at IS NOT NULL
    `).get();

    const slaCompliance = slaRow.total_resolved > 0
      ? Math.round((slaRow.within_sla / slaRow.total_resolved) * 100)
      : 100;

    // 5. CSAT
    const csat = csatRepository.getOverallScore();

    // 6. Chamados por Categoria
    const categories = this.db.prepare(`
      SELECT c.name, c.color, c.icon, COUNT(t.id) as count
      FROM categories c
      LEFT JOIN tickets t ON t.category_id = c.id
      GROUP BY c.id
      ORDER BY count DESC
    `).all();

    // 7. Chamados por Departamento
    const departments = this.db.prepare(`
      SELECT d.name, d.code, COUNT(t.id) as count
      FROM departments d
      LEFT JOIN tickets t ON t.department_id = d.id
      GROUP BY d.id
      ORDER BY count DESC
    `).all();

    // 8. Chamados por Prioridade
    const priorities = this.db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      GROUP BY priority
      ORDER BY 
        CASE priority 
          WHEN 'CRITICA' THEN 1 
          WHEN 'ALTA' THEN 2 
          WHEN 'MEDIA' THEN 3 
          ELSE 4 
        END
    `).all();

    // 9. Mapeamento Mês a Mês (12 meses do ano corrente) por categoria
    const currentYear = new Date().getFullYear();
    const monthlyMatrix = this.getMonthByMonthMatrix(currentYear);

    return {
      kpis: {
        total,
        open,
        inProgress,
        resolved,
        critical,
        mttr: {
          minutes: mttrMinutes,
          hours: Number((mttrMinutes / 60).toFixed(1)),
          formatted: mttrMinutes < 60 ? `${mttrMinutes}m` : `${Math.floor(mttrMinutes / 60)}h ${mttrMinutes % 60}m`
        },
        mtta: {
          minutes: mttaMinutes,
          hours: Number((mttaMinutes / 60).toFixed(1)),
          formatted: mttaMinutes < 60 ? `${mttaMinutes}m` : `${Math.floor(mttaMinutes / 60)}h ${mttaMinutes % 60}m`
        },
        slaCompliance: {
          percentage: slaCompliance,
          isHealthy: slaCompliance >= 85
        },
        csat
      },
      charts: {
        categories,
        departments,
        priorities,
        monthlyMatrix
      }
    };
  }

  getMonthByMonthMatrix(year) {
    const categories = this.db.prepare('SELECT id, name, color FROM categories ORDER BY name ASC').all();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const rows = categories.map(cat => {
      const counts = [];
      let totalAnnual = 0;

      for (let m = 1; m <= 12; m++) {
        const monthStr = m < 10 ? `0${m}` : `${m}`;
        const count = this.db.prepare(`
          SELECT COUNT(*) as count FROM tickets
          WHERE category_id = ?
            AND strftime('%Y-%m', created_at) = ?
        `).get(cat.id, `${year}-${monthStr}`).count;

        counts.push(count);
        totalAnnual += count;
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        monthlyCounts: counts,
        total: totalAnnual
      };
    });

    const monthlyTotals = [];
    for (let m = 0; m < 12; m++) {
      let sum = 0;
      for (const row of rows) {
        sum += row.monthlyCounts[m];
      }
      monthlyTotals.push(sum);
    }

    return {
      year,
      monthLabels: monthNames,
      categoryRows: rows,
      monthlyTotals
    };
  }
}

module.exports = new DashboardService();
