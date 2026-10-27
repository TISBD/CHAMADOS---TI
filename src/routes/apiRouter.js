const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole, requireAnyRole } = require('../middlewares/rbacMiddleware');
const { loginRateLimiter } = require('../middlewares/rateLimitMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { Roles } = require('../domain/enums');

// Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const ticketController = require('../controllers/ticketController');
const departmentController = require('../controllers/departmentController');
const categoryController = require('../controllers/categoryController');
const assetController = require('../controllers/assetController');
const dashboardController = require('../controllers/dashboardController');
const kbController = require('../controllers/kbController');
const csatController = require('../controllers/csatController');
const auditController = require('../controllers/auditController');
const notificationService = require('../services/notificationService');

const router = express.Router();

// --- 1. ROTAS PÚBLICAS / AUTENTICAÇÃO ---
router.post('/auth/login', loginRateLimiter, authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// --- ROTAS PROTEGIDAS (Exigem Token JWT) ---
router.use(authMiddleware);

// Perfil do Usuário Logado
router.get('/auth/me', authController.getMe);
router.post('/auth/change-password', authController.changePassword);

// Notificações do Usuário
router.get('/notifications', (req, res) => {
  const list = notificationService.listUserNotifications(req.user.id);
  res.json({ success: true, data: list });
});
router.post('/notifications/read-all', (req, res) => {
  notificationService.markAllAsRead(req.user.id);
  res.json({ success: true, message: 'Notificações marcadas como lidas.' });
});

// --- 2. GESTÃO DE CHAMADOS (TICKETS) ---
router.get('/tickets', ticketController.list);
router.get('/tickets/:id', ticketController.getById);
router.post('/tickets', upload.single('attachment'), ticketController.create);
router.patch('/tickets/:id/status', ticketController.updateStatus);
router.post('/tickets/:id/assign', requireAnyRole([Roles.ADMIN, Roles.TECHNICIAN]), ticketController.assign);
router.post('/tickets/:id/interactions', upload.single('attachment'), ticketController.addInteraction);
router.post('/tickets/:id/attachments', upload.single('attachment'), ticketController.uploadAttachment);

// --- 3. DASHBOARD & MÉTRICAS ---
router.get('/dashboard/metrics', requireAnyRole([Roles.ADMIN, Roles.TECHNICIAN]), dashboardController.getMetrics);
router.get('/dashboard/monthly-matrix', requireAnyRole([Roles.ADMIN, Roles.TECHNICIAN]), dashboardController.getMonthlyMatrix);

// --- 4. BASE DE CONHECIMENTO & FAQ ---
router.get('/kb', kbController.list);
router.get('/kb/suggest', kbController.suggest);
router.get('/kb/:id', kbController.getById);
router.post('/kb/:id/helpful', kbController.markHelpful);
router.post('/kb', requireAnyRole([Roles.ADMIN, Roles.TECHNICIAN]), kbController.create);
router.put('/kb/:id', requireAnyRole([Roles.ADMIN, Roles.TECHNICIAN]), kbController.update);
router.delete('/kb/:id', requireRole(Roles.ADMIN), kbController.delete);

// --- 5. AVALIAÇÃO CSAT ---
router.post('/csat', csatController.submitRating);
router.get('/csat/summary', csatController.getOverall);

// --- 6. ATIVOS DE TI (PATRIMÔNIO) ---
router.get('/assets', assetController.list);
router.get('/assets/:id', assetController.getById);
router.post('/assets', requireRole(Roles.ADMIN), assetController.create);
router.put('/assets/:id', requireRole(Roles.ADMIN), assetController.update);
router.delete('/assets/:id', requireRole(Roles.ADMIN), assetController.delete);

// --- 7. DEPARTAMENTOS & CATEGORIAS ---
router.get('/departments', departmentController.list);
router.get('/departments/:id', departmentController.getById);
router.post('/departments', requireRole(Roles.ADMIN), departmentController.create);
router.put('/departments/:id', requireRole(Roles.ADMIN), departmentController.update);
router.delete('/departments/:id', requireRole(Roles.ADMIN), departmentController.delete);

router.get('/categories', categoryController.list);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', requireRole(Roles.ADMIN), categoryController.create);
router.put('/categories/:id', requireRole(Roles.ADMIN), categoryController.update);
router.delete('/categories/:id', requireRole(Roles.ADMIN), categoryController.delete);

// --- 8. GESTÃO DE USUÁRIOS (ADMIN) ---
router.get('/users/technicians', userController.listTechnicians);
router.get('/users', requireRole(Roles.ADMIN), userController.list);
router.get('/users/:id', requireRole(Roles.ADMIN), userController.getById);
router.post('/users', requireRole(Roles.ADMIN), userController.create);
router.put('/users/:id', requireRole(Roles.ADMIN), userController.update);
router.delete('/users/:id', requireRole(Roles.ADMIN), userController.delete);

// --- 9. LOGS DE AUDITORIA (ADMIN) ---
router.get('/audit', requireRole(Roles.ADMIN), auditController.list);

module.exports = router;
