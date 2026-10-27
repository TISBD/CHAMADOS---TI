const assetRepository = require('../repositories/assetRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const { AuditAction } = require('../domain/enums');

class AssetController {
  async list(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        department_id: req.query.department_id,
        category: req.query.category,
        search: req.query.search
      };
      const assets = assetRepository.list(filters);
      return res.json({ success: true, data: assets });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const asset = assetRepository.findById(req.params.id);
      if (!asset) return res.status(404).json({ success: false, error: 'Ativo de TI não encontrado.' });
      return res.json({ success: true, data: asset });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { asset_tag, name, category, model, serial_number, user_id, department_id, status, notes } = req.body;
      if (!asset_tag || !name || !category) {
        return res.status(400).json({ success: false, error: 'Tag de patrimônio, nome e categoria são obrigatórios.' });
      }

      const existing = assetRepository.findByTag(asset_tag);
      if (existing) {
        return res.status(400).json({ success: false, error: `A tag de patrimônio "${asset_tag}" já está em uso.` });
      }

      const assetId = `ast-${Date.now()}`;
      const newAsset = assetRepository.create({
        id: assetId,
        asset_tag,
        name,
        category,
        model,
        serial_number,
        user_id,
        department_id,
        status,
        notes
      });

      auditLogRepository.log({
        user_id: req.user.id,
        action: AuditAction.CREATE,
        entity_type: 'ASSET',
        entity_id: assetId,
        details: { asset_tag, name },
        ip_address: req.ip
      });

      return res.status(201).json({ success: true, data: newAsset });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = assetRepository.update(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      assetRepository.delete(req.params.id);
      return res.json({ success: true, message: 'Ativo removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AssetController();
