const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const getAllGames = async (req, res) => {
  try {
    const games = await Game.find()
      .populate('players.userId', 'name email')
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get games' });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ status: 'active' });
    
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalBets = await Transaction.aggregate([
      { $match: { type: 'bet' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const platformProfit = (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0);

    res.json({
      totalUsers,
      totalGames,
      activeGames,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalBets: totalBets[0]?.total || 0,
      platformProfit
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get platform stats' });
  }
};

const endGame = async (req, res) => {
  try {
    const { gameId, winnerId } = req.body;
    
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.status = 'ended';
    game.winner = winnerId;
    game.endTime = new Date();
    await game.save();

    if (winnerId) {
      const winAmount = game.totalPot * 0.9; // 10% platform fee
      
      await User.findByIdAndUpdate(winnerId, {
        $inc: { walletBalance: winAmount, totalWins: 1 }
      });

      await Transaction.create({
        userId: winnerId,
        type: 'win',
        amount: winAmount,
        gameId: game._id,
        description: `Won ${game.title}`
      });

      // Update losses for other players
      const losers = game.players.filter(p => p.userId.toString() !== winnerId.toString());
      for (const loser of losers) {
        await User.findByIdAndUpdate(loser.userId, { $inc: { totalLosses: 1 } });
        await Transaction.create({
          userId: loser.userId,
          type: 'loss',
          amount: loser.betAmount,
          gameId: game._id,
          description: `Lost ${game.title}`
        });
      }
    }

    res.json({ message: 'Game ended successfully', game });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end game' });
  }
};

module.exports = { getAllUsers, getAllGames, getPlatformStats, endGame };