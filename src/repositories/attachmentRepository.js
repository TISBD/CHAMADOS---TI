const { getDatabase } = require('../database/connection');

class AttachmentRepository {
  constructor() {
    this.db = getDatabase();
  }

  listByTicketId(ticketId) {
    const stmt = this.db.prepare(`
      SELECT a.*, u.name as user_name
      FROM attachments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.ticket_id = ?
      ORDER BY a.created_at ASC
    `);
    return stmt.all(ticketId);
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM attachments WHERE id = ?');
    return stmt.get(id);
  }

  create(att) {
    const stmt = this.db.prepare(`
      INSERT INTO attachments (id, ticket_id, interaction_id, user_id, file_name, stored_name, file_path, file_size, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      att.id,
      att.ticket_id,
      att.interaction_id || null,
      att.user_id,
      att.file_name,
      att.stored_name,
      att.file_path,
      att.file_size,
      att.mime_type
    );

    return this.findById(att.id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM attachments WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = new AttachmentRepository();
