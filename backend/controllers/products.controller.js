const pool = require('../config/db');

// GET /api/products?search=&category=&page=&limit=
async function getProducts(req, res) {
  try {
    const { search = '', category = '', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.name LIKE ? OR p.barcode LIKE ?)
    `;
    const params = [`%${search}%`, `%${search}%`];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM products WHERE name LIKE ? OR barcode LIKE ?',
      [`%${search}%`, `%${search}%`]
    );

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.', error: err.message });
  }
}

// GET /api/products/barcode/:barcode  -> used by the POS scanner
async function getByBarcode(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.barcode = ?`,
      [req.params.barcode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No product found for this barcode.' });
    }

    if (rows[0].quantity <= 0) {
      return res.status(409).json({ message: 'This product is out of stock.', product: rows[0] });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const { barcode, name, description, category_id, price, cost_price, quantity, low_stock_threshold, image } = req.body;

    if (!barcode || !name || price === undefined) {
      return res.status(400).json({ message: 'Barcode, name, and price are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (barcode, name, description, category_id, price, cost_price, quantity, low_stock_threshold, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [barcode, name, description || null, category_id || null, price, cost_price || 0, quantity || 0, low_stock_threshold || 5, image || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Product created successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A product with this barcode already exists.' });
    }
    res.status(500).json({ message: 'Failed to create product.', error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const fields = ['barcode', 'name', 'description', 'category_id', 'price', 'cost_price', 'quantity', 'low_stock_threshold', 'image'];
    const updates = [];
    const values = [];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product.', error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.', error: err.message });
  }
}

async function getLowStock(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE quantity <= low_stock_threshold ORDER BY quantity ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

async function getCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}

module.exports = {
  getProducts,
  getByBarcode,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock,
  getCategories,
};
