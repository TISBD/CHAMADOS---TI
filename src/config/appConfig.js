const path = require('path');

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8080,
  jwt: {
    secret: process.env.JWT_SECRET || 'helpdesk-pro-enterprise-secure-jwt-secret-key-2026',
    expiresIn: '24h',
    resetTokenExpiresInHours: 2
  },
  database: {
    filePath: path.join(__dirname, '..', '..', 'data', 'helpdesk.sqlite')
  },
  uploads: {
    directory: path.join(__dirname, '..', '..', 'uploads'),
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed'
    ]
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequestsPerIp: 500,
    loginMaxAttempts: 10,
    loginWindowMs: 10 * 60 * 1000
  },
  webhook: {
    url: process.env.WEBHOOK_NOTIFICATION_URL || null // URL para Discord/Slack/Teams se configurado
  }
};

module.exports = appConfig;
