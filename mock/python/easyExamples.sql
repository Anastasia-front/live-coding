-- customers
-- ---------
-- id
-- name

-- orders
-- ------
-- id
-- customer_id
-- amount
-- status

-- Write a SQL query that returns:

-- customer_name | total_spent

-- for completed orders only, grouped by customer, sorted from the highest total spent to the lowest.

SELECT
    c.name,
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.id, c.name
ORDER BY total_spent DESC;

-- Write a query that returns all customers who have never made any order.
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;

-- Write SQL that returns customers who have more than 3 completed orders.

-- Sort from the largest number of completed orders to the smallest.
SELECT
    c.name,
    COUNT(o.id) AS completed_orders
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.id, c.name
HAVING COUNT(o.id) > 3
ORDER BY completed_orders DESC;


-- Write a query that returns:

-- product_name | total_revenue

-- where:

-- total_revenue = quantity * price

-- Sum revenue for each product and return only products whose total revenue is greater than 10000.

-- Sort highest revenue first.

-- products
-- --------
-- id
-- name

-- order_items
-- -----------
-- id
-- product_id
-- quantity
-- price
SELECT
    p.name,
    SUM(o.price * o.quantity) AS total_revenue
FROM products p
JOIN order_items o ON p.id = o.product_id
GROUP BY p.id, p.name
HAVING SUM(o.price * o.quantity) > 10000
ORDER BY total_revenue DESC;

-- customers
-- ---------
-- id
-- name

-- orders
-- ------
-- id
-- customer_id
-- amount
-- created_at

-- Write a query that returns the 3 customers who spent the most money, with:

-- name | total_spent

-- Requirements: sum all their orders, highest spender first, return only 3 customers.
SELECT c.id, c.name, SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 3;

-- customers
-- ---------
-- id
-- name

-- orders
-- ------
-- id
-- customer_id
-- amount
-- status

-- Write a query that returns every customer and the number of their completed orders, including customers who have zero completed orders.

-- Expected columns:

-- name | completed_orders

-- Important: customers with no matching completed orders must still appear with 0.
SELECT
    c.name,
    COUNT(o.id) AS completed_orders
FROM customers c
LEFT JOIN orders o
    ON c.id = o.customer_id
    AND o.status = 'completed'
GROUP BY c.id, c.name;

-- customers
-- ---------
-- id
-- name

-- orders
-- ------
-- id
-- customer_id
-- amount
-- status

-- Return customers whose total amount of completed orders is greater than 5000.

-- Expected:

-- name | total_spent

-- Sort highest total first.
SELECT
    c.name,
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.id, c.name
HAVING SUM(o.amount) > 5000
ORDER BY total_spent DESC;

-- users
-- -----
-- id
-- name

-- orders
-- ------
-- id
-- user_id
-- amount
-- status

-- Return each user who has at least 2 completed orders, together with:

-- name | completed_orders | total_spent

-- Requirements:

-- only "completed" orders count;
-- completed_orders = number of completed orders;
-- total_spent = sum of their amounts;
-- only users with 2 or more completed orders;
-- highest total_spent first.
SELECT
    u.name,
    COUNT(o.id) AS completed_orders,
    SUM(o.amount) AS total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name
HAVING COUNT(o.id) >= 2
ORDER BY total_spent DESC;