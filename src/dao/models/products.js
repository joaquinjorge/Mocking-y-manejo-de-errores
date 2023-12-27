const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const productosColeccion = "products";
const productosEsquema = new mongoose.Schema(
  {
    title: String,
    description: String,

    status: Boolean,
    code: {
      type: String,
      unique: true,
      required: true,
    },
    category: String,
    price: Number,
    stock: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: true,
  }
);
productosEsquema.pre("findById", function () {
  this.lean();
});
productosEsquema.pre("findOne", function () {
  this.lean();
});
productosEsquema.pre("find", function () {
  this.where({
    deleted: false,
  }).lean();
});
productosEsquema.plugin(paginate);
const productosModelo = mongoose.model(productosColeccion, productosEsquema);
module.exports = productosModelo;
