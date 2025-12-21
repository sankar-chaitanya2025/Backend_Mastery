const mongoose = require("mongoose");

/*
 * This schema represents ONE unique client request.
 * The uniqueness is enforced using 'key'.
 *
 * Lifecycle :
 * 1. Client sends request with Idempotency-key
 * 2. We insert a document with status = "processing"
 * 3. Business logic runs
 * 4. We store the final response and mark status = "completed"
 * 5. Any retry with same key reuses this record
 */

const IdempotencyKeySchema = new mongoose.Schema({
  /*
   * Unique idempotency key sent by client.
   * Example : UUID or Stripe-style random string.
   *
   * 'unique': true guarantees :
   * -> two requests with same key cannot create two records
   */
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  /*
   * Hash of the request body.
   * Used to detect :
   * SAME Key + DIFFERENT payload = INVALID request
   */
  requestHash: {
    type: String,
    required: true,
  },

  /**
   * Stores the final API response.
   * On retry, we directly return this instead of reprocessing.
   */

  response: {
    type: Object,
    default: null,
  },

  /**
   * Status of request execution.
   *
   * processing → request is currently being handled
   * completed  → request finished successfully
   */

  status: {
    type: String,
    enum: ["processing", "completed"],
    required: true,
  },
});

module.exports = mongoose.model("IdempotencyKey", IdempotencyKeySchema);
