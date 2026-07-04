const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/products.controller');

router.use(authenticate);

router.get('/', ctrl.getProducts);
router.get('/low-stock', ctrl.getLowStock);
router.get('/categories', ctrl.getCategories);
router.get('/barcode/:barcode', ctrl.getByBarcode);
router.get('/:id', ctrl.getProductById);

// Admin-only write operations
router.post('/', roleCheck('admin'), ctrl.createProduct);
router.put('/:id', roleCheck('admin'), ctrl.updateProduct);
router.delete('/:id', roleCheck('admin'), ctrl.deleteProduct);

module.exports = router;
