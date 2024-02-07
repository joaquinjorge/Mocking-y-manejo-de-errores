const ticketModelo = require("./models/ticket.js");

class TicketMongoDAO {
  async get({ ...props }) {
    return await ticketModelo.find({ ...props });
  }

  async getBy({ ...props }) {
    return await ticketModelo.findOne({ ...props });
  }

  async create({ ...props }) {
    return await ticketModelo.create({ ...props });
  }
  async update(...props) {
    return await ticketModelo.updateOne(...props);
  }
}
module.exports = TicketMongoDAO;
