const { getDatabase } = require('../database/connection');
const appConfig = require('../config/appConfig');
const http = require('http');
const https = require('https');

class NotificationService {
  constructor() {
    this.db = getDatabase();
  }

  createNotification(userId, ticketId, title, message, type = 'INFO') {
    if (!userId) return;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO notifications (id, user_id, ticket_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        ticketId || null,
        title,
        message,
        type
      );
    } catch (err) {
      console.error('[NotificationService] Falha ao registrar notificação:', err.message);
    }
  }

  listUserNotifications(userId) {
    const stmt = this.db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `);
    return stmt.all(userId);
  }

  markAllAsRead(userId) {
    this.db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  }

  /**
   * Dispara webhook corporativo assíncrono para Slack, Teams ou Discord
   */
  async dispatchCorporateWebhook(event, payload) {
    if (!appConfig.webhook.url) return;

    const data = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      service: 'HelpDesk Pro',
      data: payload
    });

    try {
      const url = new URL(appConfig.webhook.url);
      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          },
          timeout: 4000
        },
        (res) => {
          res.resume(); // Consome resposta
        }
      );

      req.on('error', (err) => {
        console.warn('[Webhook] Falha ao enviar evento:', err.message);
      });

      req.write(data);
      req.end();
    } catch (e) {
      console.warn('[Webhook] URL inválida configurada.');
    }
  }
}

module.exports = new NotificationService();
