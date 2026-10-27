const kbRepository = require('../repositories/kbRepository');

class KbController {
  async list(req, res, next) {
    try {
      const filters = {
        category_id: req.query.category_id,
        search: req.query.search
      };
      const articles = kbRepository.list(filters);
      return res.json({ success: true, data: articles });
    } catch (err) {
      next(err);
    }
  }

  async suggest(req, res, next) {
    try {
      const { q } = req.query;
      const suggestions = kbRepository.suggestArticles(q);
      return res.json({ success: true, data: suggestions });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const article = kbRepository.findById(req.params.id);
      if (!article) return res.status(404).json({ success: false, error: 'Artigo não encontrado.' });
      kbRepository.incrementView(req.params.id);
      return res.json({ success: true, data: article });
    } catch (err) {
      next(err);
    }
  }

  async markHelpful(req, res, next) {
    try {
      kbRepository.incrementHelpful(req.params.id);
      return res.json({ success: true, message: 'Obrigado pelo seu feedback!' });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { title, content, category_id, tags } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, error: 'Título e conteúdo são obrigatórios.' });
      }

      const id = `kb-${Date.now()}`;
      const article = kbRepository.create({
        id,
        title,
        content,
        category_id,
        tags,
        created_by: req.user.id
      });

      return res.status(201).json({ success: true, data: article });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = kbRepository.update(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      kbRepository.delete(req.params.id);
      return res.json({ success: true, message: 'Artigo removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new KbController();
