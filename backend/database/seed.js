// Seeds the database with a default admin account and sample data.
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(
      `INSERT INTO users (username, full_name, password, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
      ['admin', 'Store Administrator', hashedPassword]
    );

    const categories = ['Groceries', 'Beverages', 'Household', 'Electronics', 'Snacks'];
    for (const name of categories) {
      await pool.query(
        `INSERT INTO categories (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [name]
      );
    }

    console.log('✅ Seed complete.');
    console.log('   Default admin login -> username: admin | password: admin123');
    console.log('   ⚠️  Change this password immediately after first login.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
