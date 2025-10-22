const User = require('../models/User');
const Transaction = require('../models/Transaction');

const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      description: 'Wallet deposit'
    });

    res.json({ message: 'Deposit successful', walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Deposit failed' });
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (req.user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -amount } },
      { new: true }
    );

    await Transaction.create({
      userId: req.user._id,
      type: 'withdrawal',
      amount,
      description: 'Wallet withdrawal'
    });

    res.json({ message: 'Withdrawal successful', walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
};

module.exports = { deposit, withdraw };