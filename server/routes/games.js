const express = require('express');
const { getAllGames, joinGame, createGame } = require('../controllers/gameController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getAllGames);
router.post('/join/:id', authenticate, joinGame);
router.post('/create', authenticate, isAdmin, createGame);

module.exports = router;