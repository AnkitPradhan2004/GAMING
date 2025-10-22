const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bankAccountNumber } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bankAccountNumber },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('gameId', 'title gameId')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

module.exports = { getCurrentUser, updateProfile, getUserTransactions };