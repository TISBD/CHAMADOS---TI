const { getDatabase } = require('../database/connection');

class AssetRepository {
  constructor() {
    this.db = getDatabase();
  }

  list(filters = {}) {
    let sql = `
      SELECT a.*, u.name as user_name, d.name as department_name,
        (SELECT COUNT(*) FROM tickets t WHERE t.asset_id = a.id) as ticket_count
      FROM assets a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }
    if (filters.department_id) {
      sql += ' AND a.department_id = ?';
      params.push(filters.department_id);
    }
    if (filters.category) {
      sql += ' AND a.category = ?';
      params.push(filters.category);
    }
    if (filters.search) {
      sql += ' AND (LOWER(a.asset_tag) LIKE ? OR LOWER(a.name) LIKE ? OR LOWER(a.model) LIKE ?)';
      const s = `%${filters.search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY a.asset_tag ASC';
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  findById(id) {
    const stmt = this.db.prepare(`
      SELECT a.*, u.name as user_name, d.name as department_name
      FROM assets a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.id = ?
    `);
    return stmt.get(id);
  }

  findByTag(tag) {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE UPPER(asset_tag) = UPPER(?)');
    return stmt.get(tag);
  }

  create(asset) {
    const stmt = this.db.prepare(`
      INSERT INTO assets (id, asset_tag, name, category, model, serial_number, user_id, department_id, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      asset.id,
      asset.asset_tag.toUpperCase(),
      asset.name,
      asset.category,
      asset.model || null,
      asset.serial_number || null,
      asset.user_id || null,
      asset.department_id || null,
      asset.status || 'EM_USO',
      asset.notes || null
    );
    return this.findById(asset.id);
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE assets
      SET asset_tag = COALESCE(?, asset_tag),
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          model = COALESCE(?, model),
          serial_number = COALESCE(?, serial_number),
          user_id = COALESCE(?, user_id),
          department_id = COALESCE(?, department_id),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      data.asset_tag ? data.asset_tag.toUpperCase() : null,
      data.name || null,
      data.category || null,
      data.model || null,
      data.serial_number || null,
      data.user_id || null,
      data.department_id || null,
      data.status || null,
      data.notes || null,
      id
    );
    return this.findById(id);
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM assets WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = new AssetRepository();
