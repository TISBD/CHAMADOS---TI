const csatRepository = require('../repositories/csatRepository');
const ticketRepository = require('../repositories/ticketRepository');

class CsatController {
  async submitRating(req, res, next) {
    try {
      const { ticket_id, rating, comment } = req.body;
      if (!ticket_id || !rating) {
        return res.status(400).json({ success: false, error: 'Identificador do chamado e nota (1-5) são obrigatórios.' });
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ success: false, error: 'A nota deve estar entre 1 e 5 estrelas.' });
      }

      const ticket = ticketRepository.findById(ticket_id);
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Chamado não encontrado.' });
      }

      // Apenas o solicitante pode avaliar
      if (ticket.requester_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Apenas o solicitante original pode avaliar este atendimento.' });
      }

      const existing = csatRepository.findByTicketId(ticket_id);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Este chamado já foi avaliado anteriormente.' });
      }

      const id = `csat-${Date.now()}`;
      const newRating = csatRepository.create({
        id,
        ticket_id,
        requester_id: req.user.id,
        rating: numRating,
        comment: comment ? comment.trim() : null
      });

      return res.status(201).json({
        success: true,
        data: newRating,
        message: 'Avaliação registrada com sucesso! Muito obrigado pela sua opinião.'
      });
    } catch (err) {
      next(err);
    }
  }

  async getOverall(req, res, next) {
    try {
      const summary = csatRepository.getOverallScore();
      return res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CsatController();
