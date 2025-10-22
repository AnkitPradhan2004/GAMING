const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Game = require('../models/Game');

const chessRooms = new Map();
const waitingPlayers = new Map();

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
      if (!token) {
        socket.userId = `guest_${Date.now()}`;
        socket.user = { name: 'Guest Player' };
        return next();
      }
      
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      socket.userId = `guest_${Date.now()}`;
      socket.user = { name: 'Guest Player' };
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Join chess queue
    socket.on('join-chess-queue', (entryFee) => {
      waitingPlayers.set(socket.userId, { socket, entryFee, user: socket.user });
      
      // Find matching player
      for (let [playerId, playerData] of waitingPlayers) {
        if (playerId !== socket.userId && playerData.entryFee === entryFee) {
          // Create room
          const roomId = `chess_${Date.now()}`;
          const room = {
            id: roomId,
            players: {
              white: { id: socket.userId, socket, user: socket.user },
              black: { id: playerId, socket: playerData.socket, user: playerData.user }
            },
            entryFee,
            board: initChessBoard(),
            currentTurn: 'white',
            gameStatus: 'active'
          };
          
          chessRooms.set(roomId, room);
          waitingPlayers.delete(socket.userId);
          waitingPlayers.delete(playerId);
          
          // Join both players to room
          socket.join(roomId);
          playerData.socket.join(roomId);
          
          // Notify both players
          io.to(roomId).emit('game-started', {
            roomId,
            players: {
              white: socket.user.name,
              black: playerData.user.name
            },
            entryFee,
            board: room.board,
            currentTurn: 'white'
          });
          return;
        }
      }
      
      socket.emit('waiting-for-opponent');
    });

    // Join room by code
    socket.on('join-room', (roomCode) => {
      const room = chessRooms.get(roomCode);
      if (room && Object.keys(room.players).length < 2) {
        const color = room.players.white ? 'black' : 'white';
        room.players[color] = { id: socket.userId, socket, user: socket.user };
        socket.join(roomCode);
        
        if (Object.keys(room.players).length === 2) {
          io.to(roomCode).emit('game-started', {
            roomId: roomCode,
            players: {
              white: room.players.white.user.name,
              black: room.players.black.user.name
            },
            entryFee: room.entryFee,
            board: room.board,
            currentTurn: 'white'
          });
        }
      } else {
        socket.emit('room-not-found');
      }
    });

    // Chess move
    socket.on('chess-move', (data) => {
      const room = chessRooms.get(data.roomId);
      if (room) {
        const playerColor = room.players.white.id === socket.userId ? 'white' : 'black';
        
        if (room.currentTurn === playerColor) {
          // Validate and make move
          if (isValidMove(room.board, data.from, data.to, playerColor)) {
            room.board = makeMove(room.board, data.from, data.to);
            room.currentTurn = room.currentTurn === 'white' ? 'black' : 'white';
            
            io.to(data.roomId).emit('move-made', {
              from: data.from,
              to: data.to,
              board: room.board,
              currentTurn: room.currentTurn
            });
          }
        }
      }
    });

    socket.on('disconnect', () => {
      waitingPlayers.delete(socket.userId);
      console.log(`User ${socket.user.name} disconnected`);
    });
  });

  function initChessBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'pawn', color: 'black' };
      board[6][i] = { type: 'pawn', color: 'white' };
    }
    
    // Other pieces
    const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: pieces[i], color: 'black' };
      board[7][i] = { type: pieces[i], color: 'white' };
    }
    
    return board;
  }

  function isValidMove(board, from, to, color) {
    const piece = board[from.row][from.col];
    if (!piece || piece.color !== color) return false;
    
    const dx = to.col - from.col;
    const dy = to.row - from.row;
    
    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (dx === 0) {
          if (dy === direction && !board[to.row][to.col]) return true;
          if (from.row === startRow && dy === 2 * direction && !board[to.row][to.col]) return true;
        } else if (Math.abs(dx) === 1 && dy === direction) {
          return board[to.row][to.col] && board[to.row][to.col].color !== color;
        }
        return false;
      
      case 'rook':
        return (dx === 0 || dy === 0) && isPathClear(board, from, to);
      
      case 'knight':
        return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
      
      case 'bishop':
        return Math.abs(dx) === Math.abs(dy) && isPathClear(board, from, to);
      
      case 'queen':
        return ((dx === 0 || dy === 0) || (Math.abs(dx) === Math.abs(dy))) && isPathClear(board, from, to);
      
      case 'king':
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      
      default:
        return false;
    }
  }

  function isPathClear(board, from, to) {
    const dx = Math.sign(to.col - from.col);
    const dy = Math.sign(to.row - from.row);
    
    let x = from.col + dx;
    let y = from.row + dy;
    
    while (x !== to.col || y !== to.row) {
      if (board[y][x]) return false;
      x += dx;
      y += dy;
    }
    
    return !board[to.row][to.col] || board[to.row][to.col].color !== board[from.row][from.col].color;
  }

  function makeMove(board, from, to) {
    const newBoard = board.map(row => [...row]);
    newBoard[to.row][to.col] = newBoard[from.row][from.col];
    newBoard[from.row][from.col] = null;
    return newBoard;
  }

  return io;
};

module.exports = initializeSocket;