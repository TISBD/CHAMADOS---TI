const departmentRepository = require('../repositories/departmentRepository');

class DepartmentController {
  async list(req, res, next) {
    try {
      const list = departmentRepository.list();
      return res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const dept = departmentRepository.findById(req.params.id);
      if (!dept) return res.status(404).json({ success: false, error: 'Departamento não encontrado.' });
      return res.json({ success: true, data: dept });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, code, description } = req.body;
      if (!name || !code) {
        return res.status(400).json({ success: false, error: 'Nome e código são obrigatórios.' });
      }
      const deptId = `dept-${Date.now()}`;
      const newDept = departmentRepository.create({ id: deptId, name, code, description });
      return res.status(201).json({ success: true, data: newDept });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = departmentRepository.update(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      departmentRepository.delete(req.params.id);
      return res.json({ success: true, message: 'Departamento removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DepartmentController();
