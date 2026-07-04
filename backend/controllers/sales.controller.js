const pool = require('../config/db');

function generateInvoiceNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `INV-${stamp}-${rand}`;
}

// POST /api/sales  -> checkout (cart -> invoice, decrements stock atomically)
async function createSale(req, res) {
  const { customer_id, items, discount = 0, tax = 0, payment_method = 'cash' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty. Add at least one item.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [rows] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      if (rows.length === 0) {
        throw { status: 404, message: `Product ID ${item.product_id} was not found.` };
      }
      const product = rows[0];

      if (product.quantity < item.quantity) {
        throw { status: 409, message: `Insufficient stock for "${product.name}". Available: ${product.quantity}.` };
      }

      const lineSubtotal = Number(product.price) * item.quantity;
      subtotal += lineSubtotal;

      validatedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: lineSubtotal,
      });
    }

    const total_price = Math.max(subtotal - Number(discount) + Number(tax), 0);
    const invoice_number = generateInvoiceNumber();

    const [saleResult] = await connection.query(
      `INSERT INTO sales (invoice_number, customer_id, employee_id, subtotal, discount, tax, total_price, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, customer_id || null, req.user.id, subtotal, discount, tax, total_price, payment_method]
    );

    const saleId = saleResult.insertId;

    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );

      await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.product_id]);

      await connection.query(
        `INSERT INTO inventory_movements (product_id, change_qty, reason, reference_id)
         VALUES (?, ?, 'sale', ?)`,
        [item.product_id, -item.quantity, saleId]
      );
    }

    if (customer_id) {
      await connection.query(
        'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?',
        [Math.floor(total_price / 10), customer_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      id: saleId,
      invoice_number,
      subtotal,
      discount,
      tax,
      total_price,
      message: 'Sale completed successfully.',
    });
  } catch (err) {
    await connection.rollback();
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Checkout failed.', error: err.error });
  } finally {
    connection.release();
  }
}

// GET /api/sales?search=&startDate=&endDate=&employee_id=&customer_id=
async function getSales(req, res) {
  try {
    const { search = '', startDate, endDate, employee_id, customer_id, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT s.*, u.full_name AS employee_name, c.name AS customer_name
      FROM sales s
      LEFT JOIN users u ON s.employee_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.invoice_number LIKE ?
    `;
    const params = [`%${search}%`];

    if (startDate) {
      query += ' AND s.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND s.created_at <= ?';
      params.push(endDate);
    }
    if (employee_id) {
      query += ' AND s.employee_id = ?';
      params.push(employee_id);
    }
    if (customer_id) {
      query += ' AND s.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

async function getSaleById(req, res) {
  try {
    const [saleRows] = await pool.query(
      `SELECT s.*, u.full_name AS employee_name, c.name AS customer_name, c.phone AS customer_phone
       FROM sales s
       LEFT JOIN users u ON s.employee_id = u.id
       LEFT JOIN customers c ON s.customer_id = c.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (saleRows.length === 0) return res.status(404).json({ message: 'Sale not found.' });

    const [items] = await pool.query(
      `SELECT si.*, p.name AS product_name, p.barcode
       FROM sale_items si JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [req.params.id]
    );

    res.json({ ...saleRows[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

module.exports = { createSale, getSales, getSaleById };
