const Game = require('../models/Game');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getAllGames = async (req, res) => {
  try {
    const games = await Game.find({ status: { $in: ['waiting', 'active'] } })
      .populate('players.userId', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get games' });
  }
};

const joinGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { betAmount } = req.body;
    
    const game = await Game.findById(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game is not accepting players' });
    }

    if (betAmount < game.minBetAmount) {
      return res.status(400).json({ error: 'Bet amount below minimum' });
    }

    if (req.user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const alreadyJoined = game.players.some(p => p.userId.toString() === req.user._id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this game' });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -betAmount } });

    game.players.push({ userId: req.user._id, betAmount });
    game.totalPot += betAmount;
    await game.save();

    await Transaction.create({
      userId: req.user._id,
      type: 'bet',
      amount: betAmount,
      gameId: game._id,
      description: `Bet placed on ${game.title}`
    });

    res.json({ message: 'Successfully joined game', game });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join game' });
  }
};

const createGame = async (req, res) => {
  try {
    const { title, minBetAmount, maxPlayers } = req.body;
    
    const gameId = `GAME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const game = await Game.create({
      gameId,
      title,
      minBetAmount,
      maxPlayers: maxPlayers || 10
    });

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
};

module.exports = { getAllGames, joinGame, createGame };