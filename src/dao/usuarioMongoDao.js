const usuariosModelo = require("./models/usuarios.js");

class UsuarioMongoDAO {
  async get({ ...props }) {
    return await usuariosModelo.find({ ...props });
  }
  async getDTO() {
    return await usuariosModelo.find();
  }

  async getBy({ ...props }) {
    return await usuariosModelo.findOne({ ...props });
  }
  async delete(id) {
    return await usuariosModelo.findByIdAndDelete(id)
  }

  async create({ ...props }) {
    return await usuariosModelo.create({ ...props });
  }
  async update(...props) {
    return await usuariosModelo.updateOne(...props);
  }
}
module.exports = UsuarioMongoDAO;
