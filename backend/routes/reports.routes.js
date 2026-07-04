const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/reports.controller');

router.use(authenticate, roleCheck('admin'));

router.get('/sales', ctrl.getSalesReport);
router.get('/profit', ctrl.getProfitReport);
router.get('/low-stock', ctrl.getLowStockReport);
router.get('/customers', ctrl.getCustomerReport);

module.exports = router;
