const mongoose = require("mongoose");

const usuariosEsquema = new mongoose.Schema(
  {
    nombre: String,
    email: {
      type: String,
      unique: true,
    },
    apellido: String,
    password: String,
  },
  { strict: false }
);

const usuariosModelo = mongoose.model("usuarios", usuariosEsquema);
module.exports = usuariosModelo;
