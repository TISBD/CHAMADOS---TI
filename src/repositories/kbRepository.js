const { getDatabase } = require('../database/connection');

class KnowledgeBaseRepository {
  constructor() {
    this.db = getDatabase();
  }

  list(filters = {}) {
    let sql = `
      SELECT kb.*, c.name as category_name, u.name as author_name
      FROM knowledge_base kb
      LEFT JOIN categories c ON kb.category_id = c.id
      LEFT JOIN users u ON kb.created_by = u.id
      WHERE kb.is_published = 1
    `;
    const params = [];

    if (filters.category_id) {
      sql += ' AND kb.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.search) {
      sql += ' AND (LOWER(kb.title) LIKE ? OR LOWER(kb.content) LIKE ? OR LOWER(kb.tags) LIKE ?)';
      const s = `%${filters.search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY kb.helpful_count DESC, kb.views_count DESC';
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  suggestArticles(query) {
    if (!query || query.trim().length < 3) return [];

    const words = query.trim().toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return [];

    let sql = `
      SELECT kb.id, kb.title, kb.content, kb.tags, kb.views_count, kb.helpful_count, c.name as category_name
      FROM knowledge_base kb
      LEFT JOIN categories c ON kb.category_id = c.id
      WHERE kb.is_published = 1 AND (
    `;
    const clauses = [];
    const params = [];

    for (const w of words.slice(0, 5)) {
      clauses.push('(LOWER(kb.title) LIKE ? OR LOWER(kb.tags) LIKE ?)');
      params.push(`%${w}%`, `%${w}%`);
    }

    sql += clauses.join(' OR ') + ') ORDER BY kb.helpful_count DESC LIMIT 5';
    return this.db.prepare(sql).all(...params);
  }

  findById(id) {
    const stmt = this.db.prepare(`
      SELECT kb.*, c.name as category_name, u.name as author_name
      FROM knowledge_base kb
      LEFT JOIN categories c ON kb.category_id = c.id
      LEFT JOIN users u ON kb.created_by = u.id
      WHERE kb.id = ?
    `);
    return stmt.get(id);
  }

  incrementView(id) {
    this.db.prepare('UPDATE knowledge_base SET views_count = views_count + 1 WHERE id = ?').run(id);
  }

  incrementHelpful(id) {
    this.db.prepare('UPDATE knowledge_base SET helpful_count = helpful_count + 1 WHERE id = ?').run(id);
  }

  create(article) {
    const stmt = this.db.prepare(`
      INSERT INTO knowledge_base (id, title, content, category_id, tags, created_by, is_published)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    stmt.run(
      article.id,
      article.title,
      article.content,
      article.category_id || null,
      article.tags || '',
      article.created_by || null
    );
    return this.findById(article.id);
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE knowledge_base
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          category_id = COALESCE(?, category_id),
          tags = COALESCE(?, tags),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      data.title || null,
      data.content || null,
      data.category_id || null,
      data.tags || null,
      id
    );
    return this.findById(id);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(id);
  }
}

module.exports = new KnowledgeBaseRepository();
