const transactions = [
  { id: 1, amount: 120, type: "credit" },
  { id: 2, amount: 50, type: "debit" },
  { id: 3, amount: 200, type: "credit" },
  { id: 4, amount: 90, type: "debit" },
  { id: 5, amount: 300, type: "credit" },
  { id: 6, amount: 40, type: "debit" },
];

function processTransactions(transactions, targetBalance) {
  const result = {
    balance: 0,
    processedCount: 0,
    reachedTarget: false,
  };

  let i = 0;

  while (i < transactions.length && result.balance < targetBalance) {
    const tr = transactions[i];

    switch (tr.type) {
      case "credit":
        result.balance += tr.amount;
        break;

      case "debit":
        result.balance -= tr.amount;
        break;
    }

    result.processedCount++;
    i++;
  }

  result.reachedTarget = result.balance >= targetBalance;

  return result;
}

console.log(processTransactions(transactions, 100));

// Start with:

// balance = 0

// Process transactions in order using a while loop.

// Rules:

// "credit" → add amount
// "debit" → subtract amount
// stop processing as soon as balance >= targetBalance
// return:
// {
//   balance: 270,
//   processedCount: 5,
//   reachedTarget: true
// }

// Example:

// processTransactions(transactions, 250);

// Processing:

// +120 = 120
// -50  = 70
// +200 = 270  ← target reached, stop here

// Expected:

// {
//   balance: 270,
//   processedCount: 3,
//   reachedTarget: true
// }

// If the target is never reached, process the whole array and return:

// {
//   balance: finalBalance,
//   processedCount: transactions.length,
//   reachedTarget: false
// }
