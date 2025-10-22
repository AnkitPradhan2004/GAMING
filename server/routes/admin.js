const express = require('express');
const { getAllUsers, getAllGames, getPlatformStats, endGame } = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/games', authenticate, isAdmin, getAllGames);
router.get('/stats', authenticate, isAdmin, getPlatformStats);
router.post('/end-game', authenticate, isAdmin, endGame);

module.exports = router;