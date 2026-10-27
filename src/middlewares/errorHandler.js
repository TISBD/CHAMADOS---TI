/**
 * Middleware central de tratamento de erros
 */

function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  // Erros do multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'O arquivo enviado excede o limite máximo permitido de 5 MB.'
    });
  }

  const statusCode = err.statusCode || (err.message && err.message.includes('não encontrado') ? 404 : 400);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Ocorreu um erro interno no servidor.'
  });
}

module.exports = errorHandler;
