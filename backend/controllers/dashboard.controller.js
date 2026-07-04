const pool = require('../config/db');

async function getSummary(req, res) {
  try {
    const [[todaySales]] = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) AS revenue, COUNT(*) AS orders
       FROM sales WHERE DATE(created_at) = CURDATE() AND status = 'completed'`
    );

    const [[totalRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) AS revenue FROM sales WHERE status = 'completed'`
    );

    const [[productCount]] = await pool.query('SELECT COUNT(*) AS total FROM products');

    const [[orderCount]] = await pool.query(`SELECT COUNT(*) AS total FROM sales WHERE status = 'completed'`);

    const [lowStock] = await pool.query(
      'SELECT id, name, quantity, low_stock_threshold FROM products WHERE quantity <= low_stock_threshold ORDER BY quantity ASC LIMIT 10'
    );

    const [bestSellers] = await pool.query(
      `SELECT p.id, p.name, SUM(si.quantity) AS units_sold, SUM(si.subtotal) AS revenue
       FROM sale_items si JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.status = 'completed'
       GROUP BY p.id ORDER BY units_sold DESC LIMIT 5`
    );

    const [recentSales] = await pool.query(
      `SELECT s.id, s.invoice_number, s.total_price, s.created_at, c.name AS customer_name, u.full_name AS employee_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN users u ON s.employee_id = u.id
       ORDER BY s.created_at DESC LIMIT 8`
    );

    const [monthlySales] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total_price) AS revenue
       FROM sales WHERE status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    res.json({
      todayRevenue: todaySales.revenue,
      todayOrders: todaySales.orders,
      totalRevenue: totalRevenue.revenue,
      totalProducts: productCount.total,
      totalOrders: orderCount.total,
      lowStock,
      bestSellers,
      recentSales,
      monthlySales,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard summary.', error: err.message });
  }
}

module.exports = { getSummary };
