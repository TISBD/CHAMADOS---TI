const { getDatabase } = require('../database/connection');

class CsatRepository {
  constructor() {
    this.db = getDatabase();
  }

  findByTicketId(ticketId) {
    const stmt = this.db.prepare(`
      SELECT cs.*, u.name as requester_name
      FROM csat_ratings cs
      LEFT JOIN users u ON cs.requester_id = u.id
      WHERE cs.ticket_id = ?
    `);
    return stmt.get(ticketId);
  }

  create(csat) {
    const stmt = this.db.prepare(`
      INSERT INTO csat_ratings (id, ticket_id, requester_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      csat.id,
      csat.ticket_id,
      csat.requester_id,
      csat.rating,
      csat.comment || null
    );
    return this.findByTicketId(csat.ticket_id);
  }

  getOverallScore() {
    const row = this.db.prepare(`
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_ratings
      FROM csat_ratings
    `).get();

    const total = row.total_ratings || 0;
    const avg = row.average_rating ? Number(row.average_rating.toFixed(2)) : 5.0;
    const positivePercent = total > 0 ? Math.round((row.positive_ratings / total) * 100) : 100;

    return {
      total,
      average: avg,
      satisfactionPercentage: positivePercent
    };
  }
}

module.exports = new CsatRepository();
