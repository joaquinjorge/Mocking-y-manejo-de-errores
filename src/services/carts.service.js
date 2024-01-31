const CartsMongoDAO = require("../dao/cartsMongoDao");

class CartsService {
  constructor(dao) {
    this.dao = new dao();
  }

  async getCarts(...props) {
    return await this.dao.get(...props);
  }
  async getCart({ ...props }) {
    return await this.dao.getp({ ...props });
  }

  async getCartById({ ...props }) {
    return await this.dao.getBy({ ...props });
  }

  async createCart({ ...props }) {
    return await this.dao.create({ ...props });
  }

  async updateCart(...props) {
    return await this.dao.update(...props);
  }
}

const cartsService = new CartsService(CartsMongoDAO);
module.exports = cartsService;
