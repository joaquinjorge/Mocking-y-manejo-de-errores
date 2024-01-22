const mongoose = require("mongoose");

const usuariosEsquema = new mongoose.Schema(
  {
    nombre: String,
    apellido: String,
    edad: Number,
    email: {
      type: String,
      unique: true,
    },
    rol: { type: String, default: "usuario" },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
    apellido: String,
    password: String,
  },
  { strict: false }
);
usuariosEsquema.pre("findById", function () {
  this.populate({
    path: "cart",
  }).lean();
});
usuariosEsquema.pre("find", function () {
  this.populate({
    path: "cart",
  }).lean();
});
usuariosEsquema.pre("findOne", function () {
  this.populate({
    path: "cart",
  }).lean();
});
const usuariosModelo = mongoose.model("usuarios", usuariosEsquema);
module.exports = usuariosModelo;
