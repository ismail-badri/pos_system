const pool = require('../config/db');

async function getCustomers(req, res) {
  try {
    const { search = '' } = req.query;
    const [rows] = await pool.query(
      `SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY created_at DESC`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

async function getCustomerById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found.' });

    const [purchases] = await pool.query(
      `SELECT s.*, COUNT(si.id) AS item_count
       FROM sales s LEFT JOIN sale_items si ON si.sale_id = s.id
       WHERE s.customer_id = ? GROUP BY s.id ORDER BY s.created_at DESC`,
      [req.params.id]
    );

    const [[{ total_spent }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) AS total_spent FROM sales WHERE customer_id = ?`,
      [req.params.id]
    );

    res.json({ ...rows[0], total_spent, purchases });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

async function createCustomer(req, res) {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Customer name is required.' });

    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone || null, email || null, address || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Customer created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create customer.', error: err.message });
  }
}

async function updateCustomer(req, res) {
  try {
    const { name, phone, email, address } = req.body;
    await pool.query(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, phone, email, address, req.params.id]
    );
    res.json({ message: 'Customer updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update customer.', error: err.message });
  }
}

async function deleteCustomer(req, res) {
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete customer.', error: err.message });
  }
}

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
