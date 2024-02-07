const mongoose = require("mongoose");

const ticketEsquema = new mongoose.Schema({
  code: { type: String, unique: true },
  purchase_datetime: { type: Date, default: Date.now() },
  age: Number,
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
});

const ticketModelo = mongoose.model("ticket", ticketEsquema);
module.exports = ticketModelo;
