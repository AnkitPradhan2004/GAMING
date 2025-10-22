const Game = require('../models/Game');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const placeBet = async (req, res) => {
  try {
    const { gameId, betAmount } = req.body;
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    if (req.user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: -betAmount } });

    await Transaction.create({
      userId: req.user._id,
      type: 'bet',
      amount: betAmount,
      gameId: game._id,
      description: `Additional bet on ${game.title}`
    });

    res.json({ message: 'Bet placed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bet' });
  }
};

const getUserBets = async (req, res) => {
  try {
    const bets = await Transaction.find({
      userId: req.user._id,
      type: 'bet'
    }).populate('gameId', 'title gameId status').sort({ createdAt: -1 });
    
    res.json(bets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bets' });
  }
};

module.exports = { placeBet, getUserBets };