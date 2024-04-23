const UsuariosGetDTO = require("../DTO/usuarios.DTO.js");
const UsuarioMongoDAO = require("../dao/usuarioMongoDao.js");
const DAO = UsuarioMongoDAO;
class UsuariosService {
  constructor(DAO) {
    this.dao = DAO;
  }

  async getUsuarios() {
    return await this.dao.getDTO();
  }
  async getUsuariosDto(email) {
    let usuariosDto = await this.dao.getDTO();
    usuariosDto = usuariosDto.find((usuario) => usuario.email === email);
    return new UsuariosGetDTO(usuariosDto);
  }

  async getUsuarioById({ ...props }) {
    return await this.dao.getBy({ ...props });
  }
  async deleteUsuarioById(id) {
    return await this.dao.delete(id)
  }

  async createUsuario({ ...props }) {
    return await this.dao.create({ ...props });
  }

  async updateUsuarios(...props) {
    return await this.dao.update(...props);
  }
}

const usuariosService = new UsuariosService(new DAO());
module.exports = usuariosService;
