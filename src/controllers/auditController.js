const auditLogRepository = require('../repositories/auditLogRepository');

class AuditController {
  async list(req, res, next) {
    try {
      const filters = {
        action: req.query.action,
        entity_type: req.query.entity_type,
        entity_id: req.query.entity_id,
        user_id: req.query.user_id
      };
      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = auditLogRepository.list(filters, pagination);
      return res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
