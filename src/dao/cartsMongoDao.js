const cartsModelo = require("./models/carts.js");

class CartsMongoDAO {
  async get(...props) {
    return await cartsModelo.paginate(...props);
  }
  async getp({ ...props }) {
    return await cartsModelo
      .find({ ...props })
      .populate("products.product")
      .lean();
  }

  async getBy({ ...props }) {
    return await cartsModelo.findOne({ ...props });
  }

  async create({ ...props }) {
    return await cartsModelo.create({ ...props });
  }
  async update(...props) {
    return await cartsModelo.updateOne(...props);
  }
}
module.exports = CartsMongoDAO;
