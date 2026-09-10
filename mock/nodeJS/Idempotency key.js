// CREATE TABLE idempotency_keys (
//   key TEXT PRIMARY KEY,
//   user_id INT NOT NULL,
//   status TEXT NOT NULL DEFAULT 'processing', -- 'processing' | 'completed' | 'failed'
//   response JSONB,
//   created_at TIMESTAMP DEFAULT NOW()
// );

async function createPayment(userId, amount, idempotencyKey) {
  if (!idempotencyKey) throw new BadRequestError("idempotencyKey is required");
  if (amount <= 0) throw new BadRequestError("amount must be positive");

  // Step 1: try to atomically claim this key — this INSERT either succeeds (first time)
  // or fails on the primary key (a retry, or a concurrent duplicate request)
  let claimed;
  try {
    const insertResult = await db.query(
      `INSERT INTO idempotency_keys (key, user_id, status) VALUES ($1, $2, 'processing') RETURNING *`,
      [idempotencyKey, userId],
    );
    claimed = insertResult.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      // key already exists — this is a retry, not a new request
      const existing = await db.query(
        `SELECT * FROM idempotency_keys WHERE key = $1`,
        [idempotencyKey],
      );
      const record = existing.rows[0];

      if (record.status === "completed") {
        return record.response; // safe: return the original result, no re-charge
      }
      if (record.status === "processing") {
        throw new ConflictError(
          "Request with this idempotency key is still being processed",
        );
      }
      if (record.status === "failed") {
        throw new ConflictError(
          "A previous attempt with this idempotency key failed — use a new key to retry",
        );
      }
    }
    throw err;
  }

  // Step 2: we successfully claimed the key — actually perform the payment
  try {
    const providerResponse = await paymentProvider.charge(userId, amount);
    if (!providerResponse.success) {
      throw new Error("Payment provider declined the charge");
    }

    const result = {
      paymentId: providerResponse.id,
      amount,
      status: "charged",
    };

    await db.query(
      `UPDATE idempotency_keys SET status = 'completed', response = $1 WHERE key = $2`,
      [JSON.stringify(result), idempotencyKey],
    );

    return result;
  } catch (err) {
    await db.query(
      `UPDATE idempotency_keys SET status = 'failed' WHERE key = $1`,
      [idempotencyKey],
    );
    throw err;
  }
}
