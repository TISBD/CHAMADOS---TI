const { getDatabase } = require('../database/connection');

class DepartmentRepository {
  constructor() {
    this.db = getDatabase();
  }

  list() {
    const stmt = this.db.prepare(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id) as user_count,
        (SELECT COUNT(*) FROM tickets t WHERE t.department_id = d.id) as ticket_count
      FROM departments d
      ORDER BY d.name ASC
    `);
    return stmt.all();
  }

  findById(id) {
    const stmt = this.db.prepare('SELECT * FROM departments WHERE id = ?');
    return stmt.get(id);
  }

  create(dept) {
    const stmt = this.db.prepare(`
      INSERT INTO departments (id, name, code, description)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(dept.id, dept.name, dept.code.toUpperCase(), dept.description || null);
    return this.findById(dept.id);
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE departments
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          description = COALESCE(?, description)
      WHERE id = ?
    `);
    stmt.run(
      data.name !== undefined ? data.name : null,
      data.code !== undefined ? data.code.toUpperCase() : null,
      data.description !== undefined ? data.description : null,
      id
    );
    return this.findById(id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM departments WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = new DepartmentRepository();
