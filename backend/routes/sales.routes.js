const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const ctrl = require('../controllers/sales.controller');

router.use(authenticate);

router.post('/', ctrl.createSale);
router.get('/', ctrl.getSales);
router.get('/:id', ctrl.getSaleById);

module.exports = router;
