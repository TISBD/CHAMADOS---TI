const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const { AuditAction } = require('../domain/enums');

class UserController {
  async list(req, res, next) {
    try {
      const filters = {
        role_id: req.query.role_id,
        department_id: req.query.department_id,
        search: req.query.search
      };
      const users = userRepository.list(filters);
      return res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  async listTechnicians(req, res, next) {
    try {
      const technicians = userRepository.listTechnicians();
      return res.json({ success: true, data: technicians });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = userRepository.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name, email, password, role_id, department_id, phone, avatar } = req.body;
      if (!name || !email || !password || !role_id) {
        return res.status(400).json({ success: false, error: 'Nome, e-mail, senha e perfil são obrigatórios.' });
      }

      const existing = userRepository.findByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Este endereço de e-mail já está cadastrado.' });
      }

      const password_hash = bcrypt.hashSync(password, 10);
      const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newUser = userRepository.create({
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        role_id,
        department_id: department_id || null,
        phone: phone || null,
        avatar: avatar || null
      });

      auditLogRepository.log({
        user_id: req.user.id,
        action: AuditAction.CREATE,
        entity_type: 'USER',
        entity_id: userId,
        details: { name, email, role_id },
        ip_address: req.ip
      });

      return res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, role_id, department_id, phone, avatar, is_active, password } = req.body;

      const user = userRepository.findById(id);
      if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });

      // Impedir desativar o admin principal master
      if (id === 'usr-admin' && (is_active === false || is_active === 0)) {
        return res.status(400).json({ success: false, error: 'O Administrador Master não pode ser desativado.' });
      }

      const updated = userRepository.update(id, {
        name,
        role_id,
        department_id,
        phone,
        avatar,
        is_active
      });

      if (password && password.trim().length >= 6) {
        const hash = bcrypt.hashSync(password.trim(), 10);
        userRepository.updatePassword(id, hash);
      }

      auditLogRepository.log({
        user_id: req.user.id,
        action: AuditAction.UPDATE,
        entity_type: 'USER',
        entity_id: id,
        details: { updatedFields: req.body },
        ip_address: req.ip
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (id === 'usr-admin' || id === req.user.id) {
        return res.status(400).json({ success: false, error: 'Não é permitido excluir sua própria conta ou o Administrador Master.' });
      }

      userRepository.delete(id);

      auditLogRepository.log({
        user_id: req.user.id,
        action: AuditAction.DELETE,
        entity_type: 'USER',
        entity_id: id,
        ip_address: req.ip
      });

      return res.json({ success: true, message: 'Usuário removido com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
