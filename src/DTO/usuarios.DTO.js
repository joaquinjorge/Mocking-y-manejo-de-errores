class UsuariosGetDTO {
  constructor(usuario) {
    this.nombre = usuario.first_name;
    this.apellido = usuario.last_name;
    this.edad = usuario.age;
    this.rol = usuario.role;
  }
}
module.exports = UsuariosGetDTO;
