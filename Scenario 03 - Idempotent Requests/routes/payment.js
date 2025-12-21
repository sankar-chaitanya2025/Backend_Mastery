const express = require("express");
const crypto = require("crypto");
const IdempotencyKey = require("../models/IdempotencyKey");
const Payment = require("../models/Payment");
const router = express.Router();

router.post("/pay", async (req, res) => {
  const idempotencyKey = req.headers["idempotency-key"];
  if (!idempotencyKey) {
    return res.status(400).json({
      error: "Idempotency-Key is missing.",
    });
  }

  function hashRequest(body) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex");
  }

  const requestHash = hashRequest(req.body);
  const existingKey = await IdempotencyKey.findOne({
    key: idempotencyKey,
  });

  if (existingKey) {
    if (existingKey.requestHash !== requestHash) {
      return res.status(400).json({
        error: "Same key, but different data. Illegal!",
      });
    }

    if (existingKey.status === "completed") {
      return res.status(200).json(existingKey.response);
    }

    if (existingKey.status === "processing") {
      return res.status(202).json({
        message: "Transcation is still being processed",
      });
    }
  }

  // If there is no IdempotencyKey in records, we create findOne
  await IdempotencyKey.create({
    key: idempotencyKey,
    requestHash: requestHash,
    status: "processing",
  });

  const { fromAccount, toAccount, amount } = req.body;

  const payment = await Payment.create({
    fromAccount,
    toAccount,
    amount,
    status: "success",
    idempotencyKey: idempotencyKey,
  });

  const response = {
    success: true,
    paymentId: payment._id,
  };

  await IdempotencyKey.updateOne(
    { key: idempotencyKey },
    {
      status: "completed",
      response: response,
    },
  );

  return res.status(200).json(response);
});
module.exports = router;
