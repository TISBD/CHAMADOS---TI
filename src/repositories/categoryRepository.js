const { getDatabase } = require('../database/connection');

class CategoryRepository {
  constructor() {
    this.db = getDatabase();
  }

  list() {
    const stmt = this.db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM tickets t WHERE t.category_id = c.id) as ticket_count
      FROM categories c
      ORDER BY c.name ASC
    `);
    return stmt.all();
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE id = ?');
    return stmt.get(id);
  }

  create(cat) {
    const stmt = this.db.prepare(`
      INSERT INTO categories (id, name, code, default_priority, default_sla_hours, icon, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      cat.id,
      cat.name,
      cat.code.toUpperCase(),
      cat.default_priority || 'MEDIA',
      cat.default_sla_hours || 24,
      cat.icon || 'fa-folder',
      cat.color || '#3b82f6'
    );
    return this.findById(cat.id);
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE categories
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          default_priority = COALESCE(?, default_priority),
          default_sla_hours = COALESCE(?, default_sla_hours),
          icon = COALESCE(?, icon),
          color = COALESCE(?, color)
      WHERE id = ?
    `);
    stmt.run(
      data.name !== undefined ? data.name : null,
      data.code !== undefined ? data.code.toUpperCase() : null,
      data.default_priority !== undefined ? data.default_priority : null,
      data.default_sla_hours !== undefined ? data.default_sla_hours : null,
      data.icon !== undefined ? data.icon : null,
      data.color !== undefined ? data.color : null,
      id
    );
    return this.findById(id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = new CategoryRepository();
