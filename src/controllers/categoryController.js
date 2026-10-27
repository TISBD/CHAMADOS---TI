const categoryRepository = require('../repositories/categoryRepository');

class CategoryController {
  async list(req, res, next) {
    try {
      const list = categoryRepository.list();
      return res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const cat = categoryRepository.findById(req.params.id);
      if (!cat) return res.status(404).json({ success: false, error: 'Categoria não encontrada.' });
      return res.json({ success: true, data: cat });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, code, default_priority, default_sla_hours, icon, color } = req.body;
      if (!name || !code) {
        return res.status(400).json({ success: false, error: 'Nome e código são obrigatórios.' });
      }
      const catId = `cat-${Date.now()}`;
      const newCat = categoryRepository.create({
        id: catId,
        name,
        code,
        default_priority,
        default_sla_hours,
        icon,
        color
      });
      return res.status(201).json({ success: true, data: newCat });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = categoryRepository.update(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      categoryRepository.delete(req.params.id);
      return res.json({ success: true, message: 'Categoria removida com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
