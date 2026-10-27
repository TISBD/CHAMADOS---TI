const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const appConfig = require('../config/appConfig');
const userRepository = require('../repositories/userRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const { AuditAction } = require('../domain/enums');

class AuthService {
  async authenticate(email, password, ipAddress = null, userAgent = null) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    if (!user.is_active) {
      throw new Error('Esta conta de usuário está inativa. Contate o suporte de TI.');
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    // Gerar token JWT
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_id,
      department_id: user.department_id
    };

    const token = jwt.sign(payload, appConfig.jwt.secret, {
      expiresIn: appConfig.jwt.expiresIn
    });

    // Registrar log de auditoria do login
    auditLogRepository.log({
      user_id: user.id,
      action: AuditAction.LOGIN,
      entity_type: 'USER',
      entity_id: user.id,
      details: { email: user.email, role: user.role_id },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Retorna usuário sem hash
    const { password_hash, reset_token, reset_token_expires_at, ...safeUser } = user;
    return {
      token,
      user: safeUser
    };
  }

  async requestPasswordReset(email, ipAddress = null) {
    const user = userRepository.findByEmail(email);
    if (!user) {
      // Segurança: não revelar se o e-mail existe
      return { success: true, message: 'Se o e-mail existir em nossa base, um token seguro foi gerado.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + appConfig.jwt.resetTokenExpiresInHours * 3600 * 1000).toISOString();

    userRepository.setResetToken(user.id, token, expiresAt);

    auditLogRepository.log({
      user_id: user.id,
      action: AuditAction.PASSWORD_RESET,
      entity_type: 'USER',
      entity_id: user.id,
      details: { action: 'REQUEST_TOKEN', email: user.email },
      ip_address: ipAddress
    });

    return {
      success: true,
      message: 'Token de recuperação de senha gerado com sucesso.',
      token // Em ambiente corporativo interno sem servidor SMTP configurado, o token pode ser visualizado ou enviado
    };
  }

  async resetPasswordWithToken(token, newPassword, ipAddress = null) {
    if (!token || !newPassword || newPassword.length < 6) {
      throw new Error('Token válido e senha de no mínimo 6 caracteres são obrigatórios.');
    }

    const user = userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Token de recuperação inválido ou expirado.');
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    userRepository.updatePassword(user.id, newHash);

    auditLogRepository.log({
      user_id: user.id,
      action: AuditAction.PASSWORD_RESET,
      entity_type: 'USER',
      entity_id: user.id,
      details: { action: 'PASSWORD_RESET_COMPLETED' },
      ip_address: ipAddress
    });

    return { success: true, message: 'Senha redefinida com sucesso! Você já pode realizar o login.' };
  }

  async changePassword(userId, currentPassword, newPassword, ipAddress = null) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
    }

    const user = userRepository.findByIdWithHash(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('A senha atual fornecida está incorreta.');
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    userRepository.updatePassword(userId, newHash);

    auditLogRepository.log({
      user_id: userId,
      action: AuditAction.UPDATE,
      entity_type: 'USER',
      entity_id: userId,
      details: { action: 'PASSWORD_CHANGED' },
      ip_address: ipAddress
    });

    return { success: true, message: 'Senha alterada com sucesso.' };
  }
}

module.exports = new AuthService();
