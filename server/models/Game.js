const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  minBetAmount: { type: Number, required: true, min: 1 },
  maxPlayers: { type: Number, default: 10 },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    betAmount: { type: Number, required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'ended'], 
    default: 'waiting' 
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date },
  endTime: { type: Date },
  totalPot: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);