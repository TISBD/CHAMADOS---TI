const appConfig = require('../config/appConfig');

const requestCounts = new Map();

function cleanUpOldEntries() {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}
setInterval(cleanUpOldEntries, 60000); // Limpeza periódica

function createRateLimiter(maxRequests, windowMs, message) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: message || 'Muitas requisições originadas deste endereço IP. Aguarde alguns minutos.'
      });
    }

    next();
  };
}

const loginRateLimiter = createRateLimiter(
  appConfig.rateLimit.loginMaxAttempts,
  appConfig.rateLimit.loginWindowMs,
  'Excesso de tentativas de login. Por segurança, tente novamente em 10 minutos.'
);

const apiRateLimiter = createRateLimiter(
  appConfig.rateLimit.maxRequestsPerIp,
  appConfig.rateLimit.windowMs,
  'Limite de requisições por minuto atingido. Tente novamente em breve.'
);

module.exports = {
  loginRateLimiter,
  apiRateLimiter
};
