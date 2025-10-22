const express = require('express');
const { deposit, withdraw } = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/deposit', authenticate, deposit);
router.post('/withdraw', authenticate, withdraw);

module.exports = router;