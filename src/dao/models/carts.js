const mongoose = require("mongoose");

const cartColeccion = "carts";
const cartEsquema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: Number,
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
});
cartEsquema.pre("findById", function () {
  this.populate({
    path: "products.product",
  }).lean();
});
cartEsquema.pre("find", function () {
  this.populate({
    path: "products.product",
  }).lean();
});
cartEsquema.pre("findOne", function () {
  this.populate({
    path: "products.product",
  }).lean();
});
const cartsModelo = mongoose.model(cartColeccion, cartEsquema);
module.exports = cartsModelo;
