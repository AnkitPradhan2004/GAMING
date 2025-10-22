const express = require('express');
const { getCurrentUser, updateProfile, getUserTransactions } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.get('/transactions', authenticate, getUserTransactions);

module.exports = router;