const { getDatabase } = require('../database/connection');

class TicketRepository {
  constructor() {
    this.db = getDatabase();
  }

  getNextTicketCode() {
    const row = this.db.prepare(`
      SELECT code FROM tickets 
      WHERE code LIKE 'TICK-%' 
      ORDER BY id DESC LIMIT 1
    `).get();

    if (!row || !row.code) {
      return 'TICK-1001';
    }

    const num = parseInt(row.code.replace('TICK-', ''), 10);
    const nextNum = isNaN(num) ? 1001 : num + 1;
    return `TICK-${nextNum}`;
  }

  list(filters = {}, pagination = { page: 1, limit: 10 }) {
    let whereSql = ' WHERE 1=1';
    const params = [];

    // RBAC: Se for colaborador simples, filtra somente seus chamados
    if (filters.requester_id) {
      whereSql += ' AND t.requester_id = ?';
      params.push(filters.requester_id);
    }

    if (filters.assigned_technician_id) {
      whereSql += ' AND t.assigned_technician_id = ?';
      params.push(filters.assigned_technician_id);
    }

    if (filters.status && filters.status !== 'all') {
      whereSql += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      whereSql += ' AND t.priority = ?';
      params.push(filters.priority);
    }

    if (filters.category_id && filters.category_id !== 'all') {
      whereSql += ' AND t.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.department_id && filters.department_id !== 'all') {
      whereSql += ' AND t.department_id = ?';
      params.push(filters.department_id);
    }

    if (filters.search) {
      whereSql += ' AND (LOWER(t.title) LIKE ? OR LOWER(t.description) LIKE ? OR LOWER(t.code) LIKE ?)';
      const s = `%${filters.search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    // Contagem total para paginação
    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM tickets t ${whereSql}`);
    const totalCount = countStmt.get(...params).total;

    // Consulta paginada
    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 10));
    const offset = (page - 1) * limit;

    let orderSql = ' ORDER BY t.created_at DESC';
    if (filters.orderBy === 'priority') {
      orderSql = ` ORDER BY 
        CASE t.priority 
          WHEN 'CRITICA' THEN 1 
          WHEN 'ALTA' THEN 2 
          WHEN 'MEDIA' THEN 3 
          ELSE 4 
        END ASC, t.created_at DESC`;
    } else if (filters.orderBy === 'sla') {
      orderSql = ' ORDER BY t.resolution_due_at ASC';
    }

    const selectSql = `
      SELECT t.*,
        u_req.name as requester_name, u_req.email as requester_email, u_req.avatar as requester_avatar,
        u_tech.name as technician_name, u_tech.email as technician_email, u_tech.avatar as technician_avatar,
        c.name as category_name, c.icon as category_icon, c.color as category_color,
        d.name as department_name, d.code as department_code,
        a.asset_tag, a.name as asset_name,
        cs.rating as csat_rating,
        (SELECT COUNT(*) FROM ticket_interactions ti WHERE ti.ticket_id = t.id) as interactions_count,
        (SELECT COUNT(*) FROM attachments att WHERE att.ticket_id = t.id) as attachments_count
      FROM tickets t
      LEFT JOIN users u_req ON t.requester_id = u_req.id
      LEFT JOIN users u_tech ON t.assigned_technician_id = u_tech.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN csat_ratings cs ON cs.ticket_id = t.id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const items = this.db.prepare(selectSql).all(...params, limit, offset);

    return {
      items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    };
  }

  findById(id) {
    const stmt = this.db.prepare(`
      SELECT t.*,
        u_req.name as requester_name, u_req.email as requester_email, u_req.phone as requester_phone, u_req.avatar as requester_avatar,
        u_tech.name as technician_name, u_tech.email as technician_email, u_tech.avatar as technician_avatar,
        c.name as category_name, c.icon as category_icon, c.color as category_color,
        d.name as department_name, d.code as department_code,
        a.asset_tag, a.name as asset_name, a.model as asset_model,
        cs.rating as csat_rating, cs.comment as csat_comment, cs.created_at as csat_date
      FROM tickets t
      LEFT JOIN users u_req ON t.requester_id = u_req.id
      LEFT JOIN users u_tech ON t.assigned_technician_id = u_tech.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN csat_ratings cs ON cs.ticket_id = t.id
      WHERE t.id = ? OR UPPER(t.code) = UPPER(?)
    `);
    return stmt.get(id, id);
  }

  create(ticket) {
    const stmt = this.db.prepare(`
      INSERT INTO tickets (
        id, code, title, description, status, priority, category_id, requester_id,
        assigned_technician_id, department_id, asset_id, first_response_due_at,
        resolution_due_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      ticket.id,
      ticket.code,
      ticket.title,
      ticket.description,
      ticket.status || 'ABERTO',
      ticket.priority || 'MEDIA',
      ticket.category_id,
      ticket.requester_id,
      ticket.assigned_technician_id || null,
      ticket.department_id || null,
      ticket.asset_id || null,
      ticket.first_response_due_at,
      ticket.resolution_due_at
    );

    return this.findById(ticket.id);
  }

  update(id, data) {
    const current = this.findById(id);
    if (!current) return null;

    const stmt = this.db.prepare(`
      UPDATE tickets
      SET status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          assigned_technician_id = COALESCE(?, assigned_technician_id),
          first_responded_at = COALESCE(?, first_responded_at),
          resolved_at = COALESCE(?, resolved_at),
          closed_at = COALESCE(?, closed_at),
          resolution_summary = COALESCE(?, resolution_summary),
          root_cause = COALESCE(?, root_cause),
          time_spent_minutes = COALESCE(?, time_spent_minutes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      data.status !== undefined ? data.status : null,
      data.priority !== undefined ? data.priority : null,
      data.assigned_technician_id !== undefined ? data.assigned_technician_id : null,
      data.first_responded_at !== undefined ? data.first_responded_at : null,
      data.resolved_at !== undefined ? data.resolved_at : null,
      data.closed_at !== undefined ? data.closed_at : null,
      data.resolution_summary !== undefined ? data.resolution_summary : null,
      data.root_cause !== undefined ? data.root_cause : null,
      data.time_spent_minutes !== undefined ? data.time_spent_minutes : null,
      id
    );

    return this.findById(id);
  }

  getMetricsSummary() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
    const open = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('ABERTO', 'EM_TRIAGEM')").get().count;
    const inProgress = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('EM_ATENDIMENTO', 'PENDENTE_USUARIO')").get().count;
    const resolved = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('RESOLVIDO', 'FECHADO')").get().count;
    const critical = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'CRITICA' AND status NOT IN ('RESOLVIDO', 'FECHADO', 'CANCELADO')").get().count;

    return { total, open, inProgress, resolved, critical };
  }
}

module.exports = new TicketRepository();
