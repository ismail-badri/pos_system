const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getSummary } = require('../controllers/dashboard.controller');

router.get('/summary', authenticate, getSummary);

module.exports = router;
