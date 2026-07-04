const pool = require('../config/db');

// GET /api/reports/sales?period=daily|weekly|monthly|annual
async function getSalesReport(req, res) {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    let groupFormat;
    switch (period) {
      case 'weekly':
        groupFormat = '%x-W%v';
        break;
      case 'monthly':
        groupFormat = '%Y-%m';
        break;
      case 'annual':
        groupFormat = '%Y';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    let query = `
      SELECT DATE_FORMAT(created_at, '${groupFormat}') AS period,
             COUNT(*) AS order_count,
             COALESCE(SUM(total_price), 0) AS revenue
      FROM sales
      WHERE status = 'completed'
    `;
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY period ORDER BY period ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate sales report.', error: err.message });
  }
}

// GET /api/reports/profit
async function getProfitReport(req, res) {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT p.id, p.name,
             SUM(si.quantity) AS units_sold,
             SUM(si.subtotal) AS revenue,
             SUM(si.quantity * p.cost_price) AS cost,
             SUM(si.subtotal - (si.quantity * p.cost_price)) AS profit
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
    `;
    const params = [];

    if (startDate) {
      query += ' AND s.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND s.created_at <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY p.id ORDER BY profit DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate profit report.', error: err.message });
  }
}

// GET /api/reports/low-stock
async function getLowStockReport(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.quantity <= p.low_stock_threshold
       ORDER BY p.quantity ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

// GET /api/reports/customers
async function getCustomerReport(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.phone, COUNT(s.id) AS total_orders, COALESCE(SUM(s.total_price), 0) AS total_spent
       FROM customers c
       LEFT JOIN sales s ON s.customer_id = c.id AND s.status = 'completed'
       GROUP BY c.id ORDER BY total_spent DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

module.exports = { getSalesReport, getProfitReport, getLowStockReport, getCustomerReport };
