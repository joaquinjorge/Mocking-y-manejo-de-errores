const productosModelo = require("./models/products.js");

class ProductsMongoDAO {
  async get(...props) {
    return await productosModelo.paginate(...props);
  }
  async getp() {
    return await productosModelo.find();
  }

  async getBy({ ...props }) {
    return await productosModelo.findOne({ ...props });
  }

  async create(product) {
    return await productosModelo.create(product);
  }
  async update(...props) {
    return await productosModelo.updateOne(...props);
  }
  async delete(id) {
    return await productosModelo.updateOne(
      { deleted: false, _id: id },
      { $set: { deleted: true } }
    );
  }
}
module.exports = ProductsMongoDAO;
