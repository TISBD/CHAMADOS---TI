const ticketService = require('../services/ticketService');
const interactionService = require('../services/interactionService');
const attachmentRepository = require('../repositories/attachmentRepository');
const path = require('path');

class TicketController {
  async list(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        category_id: req.query.category_id,
        department_id: req.query.department_id,
        assigned_technician_id: req.query.assigned_technician_id,
        search: req.query.search,
        orderBy: req.query.orderBy
      };
      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = ticketService.listTickets(filters, pagination, req.user);
      return res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const ticket = ticketService.getTicketWithCompliance(req.params.id, req.user);
      const attachments = attachmentRepository.listByTicketId(ticket.id);
      return res.json({
        success: true,
        data: {
          ...ticket,
          attachments
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const newTicket = await ticketService.createTicket(req.body, req.user, req.ip);

      // Se houver arquivo enviado no upload
      if (req.file) {
        attachmentRepository.create({
          id: `att-${Date.now()}`,
          ticket_id: newTicket.id,
          user_id: req.user.id,
          file_name: req.file.originalname,
          stored_name: req.file.filename,
          file_path: `/uploads/${req.file.filename}`,
          file_size: req.file.size,
          mime_type: req.file.mimetype
        });
      }

      return res.status(201).json({
        success: true,
        data: newTicket
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, resolution_summary, root_cause, time_spent_minutes, comment } = req.body;
      const updated = await ticketService.updateStatus(
        req.params.id,
        status,
        req.user,
        { resolution_summary, root_cause, time_spent_minutes, comment },
        req.ip
      );
      return res.json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async assign(req, res, next) {
    try {
      const { technician_id } = req.body;
      const updated = await ticketService.assignTechnician(
        req.params.id,
        technician_id,
        req.user,
        req.ip
      );
      return res.json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async addInteraction(req, res, next) {
    try {
      const interaction = await interactionService.addInteraction(
        req.params.id,
        req.body,
        req.user,
        req.ip
      );

      // Se houver anexo vinculado à interação
      if (req.file) {
        attachmentRepository.create({
          id: `att-${Date.now()}`,
          ticket_id: req.params.id,
          interaction_id: interaction.id,
          user_id: req.user.id,
          file_name: req.file.originalname,
          stored_name: req.file.filename,
          file_path: `/uploads/${req.file.filename}`,
          file_size: req.file.size,
          mime_type: req.file.mimetype
        });
      }

      return res.status(201).json({
        success: true,
        data: interaction
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
      }

      const attachment = attachmentRepository.create({
        id: `att-${Date.now()}`,
        ticket_id: req.params.id,
        user_id: req.user.id,
        file_name: req.file.originalname,
        stored_name: req.file.filename,
        file_path: `/uploads/${req.file.filename}`,
        file_size: req.file.size,
        mime_type: req.file.mimetype
      });

      return res.status(201).json({
        success: true,
        data: attachment
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketController();
