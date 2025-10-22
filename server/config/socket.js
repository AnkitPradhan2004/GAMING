const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Game = require('../models/Game');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Join game room
    socket.on('join-game', async (gameId) => {
      try {
        const game = await Game.findById(gameId).populate('players.userId', 'name');
        if (game) {
          socket.join(gameId);
          socket.emit('game-joined', game);
          socket.to(gameId).emit('player-joined', {
            userId: socket.userId,
            name: socket.user.name
          });
        }
      } catch (error) {
        socket.emit('error', 'Failed to join game');
      }
    });

    // Leave game room
    socket.on('leave-game', (gameId) => {
      socket.leave(gameId);
      socket.to(gameId).emit('player-left', {
        userId: socket.userId,
        name: socket.user.name
      });
    });

    // Game events
    socket.on('game-action', (data) => {
      socket.to(data.gameId).emit('game-update', {
        action: data.action,
        userId: socket.userId,
        data: data.payload
      });
    });

    // Start game
    socket.on('start-game', async (gameId) => {
      try {
        const game = await Game.findByIdAndUpdate(
          gameId,
          { status: 'active', startTime: new Date() },
          { new: true }
        );
        
        if (game) {
          io.to(gameId).emit('game-started', game);
        }
      } catch (error) {
        socket.emit('error', 'Failed to start game');
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
    });
  });

  return io;
};

module.exports = initializeSocket;