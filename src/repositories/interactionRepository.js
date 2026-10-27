const { getDatabase } = require('../database/connection');

class InteractionRepository {
  constructor() {
    this.db = getDatabase();
  }

  listByTicketId(ticketId, includeInternal = true) {
    let sql = `
      SELECT ti.*, u.name as user_name, u.avatar as user_avatar, u.role_id as user_role
      FROM ticket_interactions ti
      LEFT JOIN users u ON ti.user_id = u.id
      WHERE ti.ticket_id = ?
    `;

    if (!includeInternal) {
      sql += ' AND ti.is_internal = 0';
    }

    sql += ' ORDER BY ti.created_at ASC';
    const stmt = this.db.prepare(sql);
    return stmt.all(ticketId);
  }

  create(interaction) {
    const stmt = this.db.prepare(`
      INSERT INTO ticket_interactions (id, ticket_id, user_id, interaction_type, content, is_internal, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      interaction.id,
      interaction.ticket_id,
      interaction.user_id,
      interaction.interaction_type || 'PUBLIC_MESSAGE',
      interaction.content,
      interaction.is_internal ? 1 : 0
    );

    const getStmt = this.db.prepare(`
      SELECT ti.*, u.name as user_name, u.avatar as user_avatar, u.role_id as user_role
      FROM ticket_interactions ti
      LEFT JOIN users u ON ti.user_id = u.id
      WHERE ti.id = ?
    `);
    return getStmt.get(interaction.id);
  }
}

module.exports = new InteractionRepository();
