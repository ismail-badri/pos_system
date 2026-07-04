const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/customers.controller');

router.use(authenticate);

router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomerById);
router.post('/', ctrl.createCustomer);
router.put('/:id', ctrl.updateCustomer);
router.delete('/:id', roleCheck('admin'), ctrl.deleteCustomer);

module.exports = router;
