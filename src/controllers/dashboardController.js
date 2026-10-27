const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getMetrics(req, res, next) {
    try {
      const data = dashboardService.getExecutiveMetrics();
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getMonthlyMatrix(req, res, next) {
    try {
      const year = parseInt(req.query.year, 10) || new Date().getFullYear();
      const data = dashboardService.getMonthByMonthMatrix(year);
      return res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
