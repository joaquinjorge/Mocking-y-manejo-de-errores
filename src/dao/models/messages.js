const mongoose = require("mongoose");

const messageColeccion = "messages";
const messageEsquema = new mongoose.Schema({
  id: String,
  user: String,

  message: { type: [String], default: [] },
});
messageEsquema.pre("find", function () {
  this.lean();
});

const messagesModelo = mongoose.model(messageColeccion, messageEsquema);
module.exports = messagesModelo;
