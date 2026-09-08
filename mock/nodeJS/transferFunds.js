async function transferFunds(fromAccountId, toAccountId, amount) {
  if (amount <= 0)
    throw new BadRequestError("Amount must be a positive number");
  if (fromAccountId === toAccountId) {
    throw new BadRequestError("Cannot transfer to the same account");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const debitResult = await client.query(
      `UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance`,
      [amount, fromAccountId],
    );
    if (debitResult.rowCount === 0) {
      throw new ConflictError("Insufficient balance or account not found");
    }

    const creditResult = await client.query(
      `UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING balance`,
      [amount, toAccountId],
    );
    if (creditResult.rowCount === 0) {
      throw new NotFoundError("Destination account not found");
    }

    await client.query("COMMIT");

    return {
      fromAccountBalance: debitResult.rows[0].balance,
      toAccountBalance: creditResult.rows[0].balance,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
