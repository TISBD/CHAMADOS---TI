const { getDatabase } = require('../database/connection');

class AuditLogRepository {
  constructor() {
    this.db = getDatabase();
  }

  log(data) {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      data.id || `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      data.user_id || null,
      data.action,
      data.entity_type,
      data.entity_id || null,
      typeof data.details === 'object' ? JSON.stringify(data.details) : data.details,
      data.ip_address || null,
      data.user_agent || null
    );
  }

  list(filters = {}, pagination = { page: 1, limit: 20 }) {
    let whereSql = ' WHERE 1=1';
    const params = [];

    if (filters.action) {
      whereSql += ' AND a.action = ?';
      params.push(filters.action);
    }
    if (filters.entity_type) {
      whereSql += ' AND a.entity_type = ?';
      params.push(filters.entity_type);
    }
    if (filters.entity_id) {
      whereSql += ' AND a.entity_id = ?';
      params.push(filters.entity_id);
    }
    if (filters.user_id) {
      whereSql += ' AND a.user_id = ?';
      params.push(filters.user_id);
    }

    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM audit_logs a ${whereSql}`);
    const totalCount = countStmt.get(...params).total;

    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const selectSql = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereSql}
      ORDER BY a.created_at DESC
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
}

module.exports = new AuditLogRepository();
