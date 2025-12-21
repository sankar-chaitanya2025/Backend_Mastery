const mongoose = require("mongoose");

/*
 * This schema represents a SINGLE payment transaction.
 * If idempotency works correctly, this document is created ONLY ONCE.
 */

const PaymentSchema = new mongoose.Schema({
  fromAccount: {
    type: String,
    required: true,
  },

  toAccount: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
    min: 1,
  },

  status: {
    type: String,
    required: true,
    index: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
