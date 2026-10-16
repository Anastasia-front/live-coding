"use strict";
const orders = [
    { id: 1, customer: "Anna", amount: 120, status: "completed" },
    { id: 2, customer: "John", amount: 80, status: "cancelled" },
    { id: 3, customer: "Anna", amount: 50, status: "completed" },
    { id: 4, customer: "Mike", amount: 200, status: "completed" },
    { id: 5, customer: "John", amount: 150, status: "completed" },
    { id: 6, customer: "Mike", amount: 40, status: "cancelled" },
    { id: 7, customer: "Anna", amount: 100, status: "completed" },
];
// Ignore all orders whose status !== "completed".
// Group the remaining orders by customer.
// For each customer calculate:
// totalAmount
// orderCount
// Return an array, sorted by totalAmount from highest to lowest.
function getCustomerSummary(orders) {
    const filteredOrders = orders.reduce((acc, { customer, amount, status }) => {
        if (status !== "completed")
            return acc;
        if (!acc[customer]) {
            acc[customer] = { totalAmount: 0, orderCount: 0 };
        }
        acc[customer] = {
            totalAmount: amount + acc[customer].totalAmount,
            orderCount: acc[customer].orderCount + 1,
        };
        return acc;
    }, {});
    const result = Array.from(Object.entries(filteredOrders)
        .map(([customer, summary]) => ({
        customer,
        totalAmount: summary.totalAmount,
        orderCount: summary.orderCount,
    }))
        .sort((a, b) => b.totalAmount - a.totalAmount));
    console.log(result);
    return result;
}
getCustomerSummary(orders);
// [
//   { customer: "Anna", totalAmount: 270, orderCount: 3 },
//   { customer: "Mike", totalAmount: 200, orderCount: 1 },
//   { customer: "John", totalAmount: 150, orderCount: 1 }
// ]
