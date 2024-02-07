const TicketMongoDAO = require("../dao/ticketMongoDao.js");

class TicketService {
  constructor(dao) {
    this.dao = new dao();
  }

  async getTickets({ ...props }) {
    return await this.dao.get({ ...props });
  }

  async getTicketById({ ...props }) {
    return await this.dao.getBy({ ...props });
  }

  async createTicket({ ...props }) {
    return await this.dao.create({ ...props });
  }

  async updateTicket(...props) {
    return await this.dao.update(...props);
  }
}

const ticketsService = new TicketService(TicketMongoDAO);
module.exports = ticketsService;
