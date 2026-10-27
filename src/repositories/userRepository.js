const { getDatabase } = require('../database/connection');

class UserRepository {
  constructor() {
    this.db = getDatabase();
  }

  findByEmail(email) {
    const stmt = this.db.prepare(`
      SELECT u.*, r.name as role_name, d.name as department_name, d.code as department_code
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE LOWER(u.email) = LOWER(?)
    `);
    return stmt.get(email);
  }

  findById(id) {
    const stmt = this.db.prepare(`
      SELECT u.id, u.name, u.email, u.role_id, u.department_id, u.phone, u.avatar, u.is_active,
             u.created_at, u.updated_at, r.name as role_name, d.name as department_name, d.code as department_code
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `);
    return stmt.get(id);
  }

  findByIdWithHash(id) {
    const stmt = this.db.prepare(`
      SELECT u.*, r.name as role_name, d.name as department_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `);
    return stmt.get(id);
  }

  findByResetToken(token) {
    const stmt = this.db.prepare(`
      SELECT * FROM users
      WHERE reset_token = ? AND reset_token_expires_at > CURRENT_TIMESTAMP
    `);
    return stmt.get(token);
  }

  list(filters = {}) {
    let sql = `
      SELECT u.id, u.name, u.email, u.role_id, u.department_id, u.phone, u.avatar, u.is_active,
             u.created_at, r.name as role_name, d.name as department_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.role_id) {
      sql += ' AND u.role_id = ?';
      params.push(filters.role_id);
    }
    if (filters.department_id) {
      sql += ' AND u.department_id = ?';
      params.push(filters.department_id);
    }
    if (filters.search) {
      sql += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)';
      params.push(`%${filters.search.toLowerCase()}%`, `%${filters.search.toLowerCase()}%`);
    }

    sql += ' ORDER BY u.name ASC';
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  listTechnicians() {
    const stmt = this.db.prepare(`
      SELECT u.id, u.name, u.email, u.role_id, u.avatar
      FROM users u
      WHERE (u.role_id = 'technician' OR u.role_id = 'admin') AND u.is_active = 1
      ORDER BY u.name ASC
    `);
    return stmt.all();
  }

  create(user) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role_id, department_id, phone, avatar, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    stmt.run(
      user.id,
      user.name,
      user.email.toLowerCase(),
      user.password_hash,
      user.role_id,
      user.department_id || null,
      user.phone || null,
      user.avatar || null
    );
    return this.findById(user.id);
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          department_id = COALESCE(?, department_id),
          role_id = COALESCE(?, role_id),
          phone = COALESCE(?, phone),
          avatar = COALESCE(?, avatar),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      data.name !== undefined ? data.name : null,
      data.department_id !== undefined ? data.department_id : null,
      data.role_id !== undefined ? data.role_id : null,
      data.phone !== undefined ? data.phone : null,
      data.avatar !== undefined ? data.avatar : null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
      id
    );
    return this.findById(id);
  }

  updatePassword(id, passwordHash) {
    const stmt = this.db.prepare(`
      UPDATE users
      SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(passwordHash, id);
  }

  setResetToken(id, token, expiresAt) {
    const stmt = this.db.prepare(`
      UPDATE users
      SET reset_token = ?, reset_token_expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(token, expiresAt, id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = new UserRepository();
