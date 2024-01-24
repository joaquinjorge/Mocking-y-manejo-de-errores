const mongoose = require("mongoose");

const usuariosEsquema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    age: Number,
    email: {
      type: String,
      unique: true,
    },
    role: { type: String, default: "usuario" },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },

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
