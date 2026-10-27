const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.authenticate(email, password, ip, userAgent);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = userRepository.findById(req.user.id);
      return res.json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const result = await authService.requestPasswordReset(email, ip);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const result = await authService.resetPasswordWithToken(token, newPassword, ip);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword, ip);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
