-- products
-- --------
-- id
-- name
-- category

-- order_items
-- -----------
-- id
-- product_id
-- quantity
-- price

-- Return the highest-revenue product in each category.

-- Expected columns:

-- category | product_name | total_revenue

WITH product_revenue AS (
    SELECT
        p.category,
        p.name,
        SUM(o.quantity * o.price) AS total_revenue
    FROM products p
    JOIN order_items o ON p.id = o.product_id
    GROUP BY p.id, p.category, p.name
),
ranked AS (
    SELECT
        category,
        name,
        total_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY category
            ORDER BY total_revenue DESC
        ) AS rn
    FROM product_revenue
)

SELECT
    category,
    name AS product_name,
    total_revenue
FROM ranked
WHERE rn = 1;



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

-- Return users whose completed-order total is greater than their cancelled-order total.

-- Expected:

-- name | completed_total | cancelled_total
SELECT
    u.name,
    SUM(CASE
        WHEN o.status = 'completed' THEN o.amount
        ELSE 0
    END) AS completed_total,
    SUM(CASE
        WHEN o.status = 'cancelled' THEN o.amount
        ELSE 0
    END) AS cancelled_total
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING
    SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END)
    >
    SUM(CASE WHEN o.status = 'cancelled' THEN o.amount ELSE 0 END);


-- customers
-- ---------
-- id
-- name
-- country

-- orders
-- ------
-- id
-- customer_id
-- amount
-- status
-- created_at

-- Find the top 2 customers by completed-order revenue in each country for the year 2026.

-- Return:

-- country | customer_name | total_revenue | country_rank

-- Requirements:

-- only orders with status = 'completed';
-- only orders from 2026-01-01 through before 2027-01-01;
-- calculate total revenue per customer;
-- rank customers inside their own country;
-- return only rank 1 and 2;
-- highest revenue gets rank 1;
-- if two customers have the same revenue, they should receive the same rank;
-- sort by country, then rank.

-- Example:

-- France  | Alice   | 15000 | 1
-- France  | Bob     | 12000 | 2
-- Germany | Hans    | 19000 | 1
-- Germany | Anna    | 17000 | 2

    WITH customer_revenue AS (
    SELECT
        c.country,
        c.id,
        c.name,
        SUM(o.amount) AS total_revenue
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    WHERE o.status = 'completed'
      AND o.created_at >= '2026-01-01'
      AND o.created_at < '2027-01-01'
    GROUP BY c.country, c.id, c.name
),
ranked AS (
    SELECT
        country,
        name,
        total_revenue,
        DENSE_RANK() OVER (
            PARTITION BY country
            ORDER BY total_revenue DESC
        ) AS country_rank
    FROM customer_revenue
)

SELECT
    country,
    name AS customer_name,
    total_revenue,
    country_rank
FROM ranked
WHERE country_rank <= 2
ORDER BY country, country_rank;

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
-- created_at

-- Find customers whose 2026 completed-order revenue increased by at least 20% compared with 2025.

-- Return:

-- name | revenue_2025 | revenue_2026 | growth_percent

-- Requirements:

-- completed orders only;
-- calculate revenue separately for 2025 and 2026;
-- customer must have revenue in both years;
-- growth must be at least 20%;
-- highest growth first.

WITH yearly_revenue AS (
    SELECT
        c.id,
        c.name,
        SUM(
            CASE
                WHEN o.created_at >= '2025-01-01'
                AND o.created_at < '2026-01-01'
                THEN o.amount
                ELSE 0
            END
        ) AS revenue_2025,

        SUM(
            CASE
                WHEN o.created_at >= '2026-01-01'
                AND o.created_at < '2027-01-01'
                THEN o.amount
                ELSE 0
            END
        ) AS revenue_2026

    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.id, c.name
)

SELECT
    name,
    revenue_2025,
    revenue_2026,
    (revenue_2026 - revenue_2025) * 100.0 / revenue_2025 AS growth_percent
FROM yearly_revenue
WHERE revenue_2025 > 0
  AND revenue_2026 > 0
  AND (revenue_2026 - revenue_2025) * 100.0 / revenue_2025 >= 20
ORDER BY growth_percent DESC;