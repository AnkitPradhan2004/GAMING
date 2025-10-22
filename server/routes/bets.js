const express = require('express');
const { placeBet, getUserBets } = require('../controllers/betController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/place', authenticate, placeBet);
router.get('/my-bets', authenticate, getUserBets);

module.exports = router;