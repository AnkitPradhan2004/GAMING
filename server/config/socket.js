const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const Game = require("../models/Game");

const chessRooms = new Map();
const waitingPlayers = new Map();
const colorRooms = new Map();
const colorWaitingPlayers = new Map();
const onlineUsers = new Map(); // Track online users

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log(`Socket auth: Token present: ${!!token}`);
      if (!token) {
        socket.userId = `guest_${Date.now()}`;
        socket.user = { name: "Guest Player" };
        console.log(
          `Socket auth: No token, assigned guest ID: ${socket.userId}`
        );
        return next();
      }

      const decoded = verifyToken(token);
      console.log(
        `Socket auth: Token decoded successfully for userId: ${decoded.userId}`
      );
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.log(
          `Socket auth: User not found for userId: ${decoded.userId}`
        );
        socket.userId = `guest_${Date.now()}`;
        socket.user = { name: "Guest Player" };
        return next();
      }

      socket.userId = user._id.toString();
      socket.user = user;
      console.log(
        `Socket auth: Authenticated user: ${user.name} (ID: ${socket.userId})`
      );
      next();
    } catch (err) {
      console.log(`Socket auth: Token verification failed: ${err.message}`);
      socket.userId = `guest_${Date.now()}`;
      socket.user = { name: "Guest Player" };
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Track online user
    onlineUsers.set(socket.userId, {
      id: socket.userId,
      name: socket.user.name,
      currentGame: null,
      socket: socket,
    });

    // Broadcast online users update
    io.emit("online-users-update", {
      users: Array.from(onlineUsers.values()).map((user) => ({
        id: user.id,
        name: user.name,
        currentGame: user.currentGame,
      })),
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.name} disconnected`);
      onlineUsers.delete(socket.userId);

      // Remove from waiting queues
      waitingPlayers.delete(socket.userId);
      colorWaitingPlayers.delete(socket.userId);

      // Broadcast updated online users
      io.emit("online-users-update", {
        users: Array.from(onlineUsers.values()).map((user) => ({
          id: user.id,
          name: user.name,
          currentGame: user.currentGame,
        })),
      });
    });

    // Join chess queue
    socket.on("join-chess-queue", (entryFee) => {
      console.log(
        `Server: User ${socket.user.name} (ID: ${socket.userId}) joined chess queue with entry fee ${entryFee}`
      );
      console.log(
        `Server: User authenticated: ${
          !!socket.user && socket.user.name !== "Guest Player"
        }`
      );

      // Check if user is already in queue
      if (waitingPlayers.has(socket.userId)) {
        console.log(`Server: User ${socket.user.name} already in chess queue`);
        socket.emit("already-in-queue", { gameType: "chess" });
        return;
      }

      // Update user's current game
      const user = onlineUsers.get(socket.userId);
      if (user) {
        user.currentGame = "chess";
        io.emit("online-users-update", {
          users: Array.from(onlineUsers.values()).map((user) => ({
            id: user.id,
            name: user.name,
            currentGame: user.currentGame,
          })),
        });
      }

      waitingPlayers.set(socket.userId, {
        socket,
        entryFee,
        user: socket.user,
      });

      console.log(`Server: Current waiting players: ${waitingPlayers.size}`);
      console.log(
        `Server: Waiting players details:`,
        Array.from(waitingPlayers.entries()).map(([id, data]) => ({
          id,
          name: data.user.name,
          entryFee: data.entryFee,
        }))
      );

      // Find matching player
      for (let [playerId, playerData] of waitingPlayers) {
        if (playerId !== socket.userId && playerData.entryFee === entryFee) {
          console.log(
            `Server: Found match between ${socket.user.name} (ID: ${socket.userId}) and ${playerData.user.name} (ID: ${playerId}) with entry fee ${entryFee}`
          );

          // Create room
          const roomId = `chess_${Date.now()}`;
          const room = {
            id: roomId,
            players: {
              white: { id: socket.userId, socket, user: socket.user },
              black: {
                id: playerId,
                socket: playerData.socket,
                user: playerData.user,
              },
            },
            entryFee,
            board: initChessBoard(),
            currentTurn: "white",
            gameStatus: "active",
          };

          chessRooms.set(roomId, room);
          waitingPlayers.delete(socket.userId);
          waitingPlayers.delete(playerId);

          // Join both players to room
          socket.join(roomId);
          playerData.socket.join(roomId);

          console.log(
            `Server: Created chess room ${roomId} for ${socket.user.name} vs ${playerData.user.name}`
          );

          // Notify both players
          io.to(roomId).emit("game-started", {
            roomId,
            players: {
              white: { id: socket.userId, name: socket.user.name },
              black: { id: playerId, name: playerData.user.name },
            },
            entryFee,
            board: room.board,
            currentTurn: "white",
          });

          // Send individual player info
          socket.emit("player-assigned", {
            color: "white",
            opponent: playerData.user.name,
          });
          playerData.socket.emit("player-assigned", {
            color: "black",
            opponent: socket.user.name,
          });
          return;
        }
      }

      console.log(
        `Server: No match found for ${socket.user.name}, sending waiting-for-opponent`
      );
      socket.emit("waiting-for-opponent");
    });

    // Create chess room with custom code
    socket.on("create-chess-room", (data) => {
      const { roomCode, entryFee } = data;

      if (chessRooms.has(roomCode)) {
        socket.emit("room-creation-failed", {
          reason: "Room code already exists",
        });
        return;
      }

      const room = {
        id: roomCode,
        players: {
          white: { id: socket.userId, socket, user: socket.user },
        },
        entryFee,
        board: initChessBoard(),
        currentTurn: "white",
        gameStatus: "waiting",
        createdAt: Date.now(),
      };

      chessRooms.set(roomCode, room);
      socket.join(roomCode);

      socket.emit("room-created", {
        roomCode,
        entryFee,
        message: "Room created successfully. Waiting for opponent to join.",
      });

      socket.emit("player-assigned", {
        color: "white",
        opponent: null, // No opponent yet
      });
    });

    // Join room by code
    socket.on("join-chess-room", (data) => {
      const { roomCode, entryFee } = data;
      const room = chessRooms.get(roomCode);

      if (!room) {
        socket.emit("room-join-failed", { reason: "Room not found" });
        return;
      }

      if (room.entryFee !== entryFee) {
        socket.emit("room-join-failed", {
          reason: "Entry fee doesn't match room requirements",
        });
        return;
      }

      if (Object.keys(room.players).length >= 2) {
        socket.emit("room-join-failed", { reason: "Room is full" });
        return;
      }

      // Add second player
      room.players.black = { id: socket.userId, socket, user: socket.user };
      room.gameStatus = "active";
      socket.join(roomCode);

      // Notify both players that game can start
      io.to(roomCode).emit("game-started", {
        roomId: roomCode,
        players: {
          white: {
            id: room.players.white.id,
            name: room.players.white.user.name,
          },
          black: {
            id: room.players.black.id,
            name: room.players.black.user.name,
          },
        },
        entryFee: room.entryFee,
        board: room.board,
        currentTurn: "white",
      });

      // Send individual player assignments
      room.players.white.socket.emit("player-assigned", {
        color: "white",
        opponent: room.players.black.user.name,
      });
      room.players.black.socket.emit("player-assigned", {
        color: "black",
        opponent: room.players.white.user.name,
      });
    });

    // Chess move
    socket.on("chess-move", (data) => {
      const room = chessRooms.get(data.roomId);
      if (room) {
        const playerColor =
          room.players.white.id === socket.userId ? "white" : "black";

        if (room.currentTurn === playerColor) {
          // Validate and make move
          if (isValidMove(room.board, data.from, data.to, playerColor)) {
            room.board = makeMove(room.board, data.from, data.to);
            room.currentTurn = room.currentTurn === "white" ? "black" : "white";

            // Check for checkmate
            const opponentColor = playerColor === "white" ? "black" : "white";
            if (isCheckmate(room.board, opponentColor)) {
              // Game over - checkmate
              io.to(data.roomId).emit("game-over", {
                winner: playerColor,
                reason: "checkmate",
                board: room.board,
              });

              // Clear current game for players
              const whiteUser = onlineUsers.get(room.players.white.id);
              const blackUser = onlineUsers.get(room.players.black.id);
              if (whiteUser) whiteUser.currentGame = null;
              if (blackUser) blackUser.currentGame = null;

              io.emit("online-users-update", {
                users: Array.from(onlineUsers.values()).map((user) => ({
                  id: user.id,
                  name: user.name,
                  currentGame: user.currentGame,
                })),
              });

              chessRooms.delete(data.roomId);
              return;
            }

            // Check for check
            const inCheck = isKingInCheck(room.board, opponentColor);

            io.to(data.roomId).emit("move-made", {
              from: data.from,
              to: data.to,
              board: room.board,
              currentTurn: room.currentTurn,
              inCheck: inCheck,
            });
          }
        }
      }
    });

    // Color Prediction Game Events
    socket.on("join-color-queue", (entryFee) => {
      console.log(
        `Server: User ${socket.user.name} (ID: ${socket.userId}) joined color queue with entry fee ${entryFee}`
      );
      console.log(
        `Server: User authenticated: ${
          !!socket.user && socket.user.name !== "Guest Player"
        }`
      );

      // Check if user is already in queue
      if (colorWaitingPlayers.has(socket.userId)) {
        console.log(`Server: User ${socket.user.name} already in color queue`);
        socket.emit("already-in-queue", { gameType: "color" });
        return;
      }

      // Update user's current game
      const user = onlineUsers.get(socket.userId);
      if (user) {
        user.currentGame = "color";
        io.emit("online-users-update", {
          users: Array.from(onlineUsers.values()).map((user) => ({
            id: user.id,
            name: user.name,
            currentGame: user.currentGame,
          })),
        });
      }

      colorWaitingPlayers.set(socket.userId, {
        id: socket.userId,
        socket,
        entryFee,
        user: socket.user,
      });

      console.log(
        `Server: Current color waiting players: ${colorWaitingPlayers.size}`
      );
      console.log(
        `Server: Color waiting players details:`,
        Array.from(colorWaitingPlayers.entries()).map(([id, data]) => ({
          id,
          name: data.user.name,
          entryFee: data.entryFee,
        }))
      );

      // Find matching players with same entry fee
      const matchingPlayers = Array.from(colorWaitingPlayers.values()).filter(
        (player) => player.entryFee === entryFee
      );

      console.log(
        `Server: Found ${matchingPlayers.length} players with entry fee ${entryFee}`
      );

      if (matchingPlayers.length >= 2) {
        const roomId = `color_${Date.now()}`;
        const players = matchingPlayers.slice(0, 2); // Exactly 2 players for quick match

        console.log(
          `Server: Creating color room ${roomId} for players: ${players
            .map((p) => `${p.user.name} (ID: ${p.id})`)
            .join(", ")}`
        );

        const room = {
          id: roomId,
          players: players.map((p) => ({
            id: p.id,
            socket: p.socket,
            user: p.user,
            balance: 1000, // Starting balance
            betAmount: p.entryFee,
          })),
          entryFee: players[0].entryFee,
          currentRound: 0,
          gameStatus: "active",
          roundTimeLeft: 30,
          bets: {},
          gameHistory: [],
        };

        colorRooms.set(roomId, room);

        // Remove matched players from waiting list
        players.forEach((p) => colorWaitingPlayers.delete(p.userId));

        // Join all players to room
        players.forEach((p) => {
          p.socket.join(roomId);
          console.log(`Server: Player ${p.user.name} joined room ${roomId}`);
        });

        // Notify all players that game started
        io.to(roomId).emit("game-started", {
          roomId,
          players: players.map((p) => ({
            id: p.id,
            name: p.user.name,
            balance: p.balance,
          })),
          entryFee: room.entryFee,
        });

        // Start the game
        startColorRound(roomId);
      } else {
        console.log(
          `Server: Not enough players for ${socket.user.name}, sending waiting-for-players`
        );
        socket.emit("waiting-for-players");
      }
    });

    socket.on("create-color-room", (data) => {
      const { roomCode, entryFee } = data;

      if (colorRooms.has(roomCode)) {
        socket.emit("room-creation-failed", {
          reason: "Room code already exists",
        });
        return;
      }

      const room = {
        id: roomCode,
        players: [
          {
            id: socket.userId,
            socket,
            user: socket.user,
            balance: 1000,
            betAmount: entryFee,
          },
        ],
        entryFee,
        currentRound: 0,
        gameStatus: "waiting",
        roundTimeLeft: 30,
        bets: {},
        gameHistory: [],
        createdAt: Date.now(),
      };

      colorRooms.set(roomCode, room);
      socket.join(roomCode);

      socket.emit("room-created", {
        roomCode,
        entryFee,
        message: "Room created successfully. Waiting for players to join.",
      });

      socket.emit("players-update", {
        players: room.players.map((p) => ({
          id: p.id,
          name: p.user.name,
          balance: p.balance,
        })),
      });
    });

    socket.on("join-color-room", (data) => {
      const { roomCode, entryFee } = data;
      const room = colorRooms.get(roomCode);

      if (!room) {
        socket.emit("room-join-failed", { reason: "Room not found" });
        return;
      }

      if (room.entryFee !== entryFee) {
        socket.emit("room-join-failed", {
          reason: "Entry fee doesn't match room requirements",
        });
        return;
      }

      if (room.players.length >= 2) {
        socket.emit("room-join-failed", {
          reason: "Room is full (max 2 players)",
        });
        return;
      }

      if (room.players.some((p) => p.id === socket.userId)) {
        socket.emit("room-join-failed", { reason: "Already in this room" });
        return;
      }

      // Add player to room
      room.players.push({
        id: socket.userId,
        socket,
        user: socket.user,
        balance: 1000,
        betAmount: entryFee,
      });

      socket.join(roomCode);

      // Notify all players of the update
      const playersInfo = room.players.map((p) => ({
        id: p.id,
        name: p.user.name,
        balance: p.balance,
      }));

      io.to(roomCode).emit("players-update", { players: playersInfo });

      // If we have at least 2 players, start the game
      if (room.players.length >= 2 && room.gameStatus === "waiting") {
        room.gameStatus = "active";

        // Notify all players that game started
        io.to(roomCode).emit("game-started", {
          roomId: roomCode,
          players: room.players.map((p) => ({
            id: p.id,
            name: p.user.name,
            balance: p.balance,
          })),
          entryFee: room.entryFee,
        });

        startColorRound(roomCode);
      }
    });

    socket.on("place-color-bet", (data) => {
      console.log(
        `Server: Received place-color-bet from ${
          socket.user?.name || "unknown"
        }:`,
        data
      );

      const room = colorRooms.get(data.roomId);
      console.log(`Server: Room ${data.roomId} found:`, !!room);

      if (!room) {
        console.log(`Server: Room ${data.roomId} not found`);
        return;
      }

      if (room.gameStatus !== "active") {
        console.log(
          `Server: Room ${data.roomId} not active, status: ${room.gameStatus}`
        );
        return;
      }

      const player = room.players.find((p) => p.id === socket.userId);
      console.log(`Server: Player ${socket.userId} found in room:`, !!player);

      if (!player) {
        console.log(
          `Server: Player ${socket.userId} not found in room ${data.roomId}`
        );
        return;
      }

      if (player.balance < data.amount) {
        console.log(
          `Server: Player ${
            socket.user?.name || "unknown"
          } has insufficient balance: ${player.balance} < ${data.amount}`
        );
        return;
      }

      room.bets[socket.userId] = {
        color: data.color,
        amount: data.amount,
      };

      console.log(
        `Server: Player ${socket.user?.name || "unknown"} placed bet:`,
        {
          playerId: socket.userId,
          color: data.color,
          amount: data.amount,
          roomId: data.roomId,
        }
      );

      // Notify all players of the bet
      io.to(data.roomId).emit("bet-placed", {
        playerId: socket.userId,
        color: data.color,
        amount: data.amount,
      });

      console.log(`Server: Emitted bet-placed to room ${data.roomId}`);
    });

    // Invite user to game
    socket.on("invite-user", (data) => {
      const { targetUserId, gameType, roomCode } = data;
      const targetUser = onlineUsers.get(targetUserId);

      if (targetUser && targetUser.socket) {
        targetUser.socket.emit("game-invite", {
          from: socket.user.name,
          fromId: socket.userId,
          gameType,
          roomCode,
          message: `${socket.user.name} invited you to play ${
            gameType === "chess" ? "Chess" : "Color Prediction"
          }!`,
        });
      }
    });
  });

  function initChessBoard() {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: "pawn", color: "black" };
      board[6][i] = { type: "pawn", color: "white" };
    }

    // Other pieces
    const pieces = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: pieces[i], color: "black" };
      board[7][i] = { type: pieces[i], color: "white" };
    }

    return board;
  }

  function isValidMove(board, from, to, color) {
    const piece = board[from.row][from.col];
    if (!piece || piece.color !== color) return false;

    // Can't capture own pieces
    if (board[to.row][to.col] && board[to.row][to.col].color === color)
      return false;

    const dx = to.col - from.col;
    const dy = to.row - from.row;

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1;
        const startRow = piece.color === "white" ? 6 : 1;

        if (dx === 0) {
          // Forward move
          if (dy === direction && !board[to.row][to.col]) return true;
          // Double move from starting position
          if (
            from.row === startRow &&
            dy === 2 * direction &&
            !board[to.row][to.col] &&
            !board[from.row + direction][from.col]
          )
            return true;
        } else if (Math.abs(dx) === 1 && dy === direction) {
          // Diagonal capture
          return board[to.row][to.col] && board[to.row][to.col].color !== color;
        }
        return false;

      case "rook":
        if (dx === 0 || dy === 0) {
          return isPathClear(board, from, to);
        }
        return false;

      case "knight":
        return (
          (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
          (Math.abs(dx) === 1 && Math.abs(dy) === 2)
        );

      case "bishop":
        if (Math.abs(dx) === Math.abs(dy)) {
          return isPathClear(board, from, to);
        }
        return false;

      case "queen":
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
          return isPathClear(board, from, to);
        }
        return false;

      case "king":
        // Normal king move
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
          return true;
        }
        // Castling (simplified - no check for pieces in between or king in check)
        if (
          dy === 0 &&
          Math.abs(dx) === 2 &&
          from.row === (color === "white" ? 7 : 0)
        ) {
          const rookCol = dx > 0 ? 7 : 0;
          const rook = board[from.row][rookCol];
          if (rook && rook.type === "rook" && rook.color === color) {
            // Check if path is clear for castling
            const step = dx > 0 ? 1 : -1;
            for (let col = from.col + step; col !== rookCol; col += step) {
              if (board[from.row][col]) return false;
            }
            return true;
          }
        }
        return false;

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

    return (
      !board[to.row][to.col] ||
      board[to.row][to.col].color !== board[from.row][from.col].color
    );
  }

  function makeMove(board, from, to) {
    const newBoard = board.map((row) => [...row]);
    newBoard[to.row][to.col] = newBoard[from.row][from.col];
    newBoard[from.row][from.col] = null;
    return newBoard;
  }

  function isKingInCheck(board, kingColor) {
    // Find king position
    let kingPos = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === "king" && piece.color === kingColor) {
          kingPos = { row, col };
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false;

    const opponentColor = kingColor === "white" ? "black" : "white";

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === opponentColor) {
          if (isValidMove(board, { row, col }, kingPos, opponentColor)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  function isCheckmate(board, kingColor) {
    // First check if king is in check
    if (!isKingInCheck(board, kingColor)) {
      return false;
    }

    // Check if king has any legal moves
    const kingPos = findKing(board, kingColor);
    if (!kingPos) return true; // No king means checkmate

    // Check all possible moves for the king
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        if (dRow === 0 && dCol === 0) continue;

        const newRow = kingPos.row + dRow;
        const newCol = kingPos.col + dCol;

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (
            isValidMove(board, kingPos, { row: newRow, col: newCol }, kingColor)
          ) {
            // Try the move and see if king is still in check
            const testBoard = makeMove(board, kingPos, {
              row: newRow,
              col: newCol,
            });
            if (!isKingInCheck(testBoard, kingColor)) {
              return false; // King can escape
            }
          }
        }
      }
    }

    // Check if any piece can block the check or capture the attacking piece
    // This is a simplified check - in a full implementation, we'd check all possible moves
    // For now, if king is in check and has no moves, it's checkmate
    return true;
  }

  function findKing(board, kingColor) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === "king" && piece.color === kingColor) {
          return { row, col };
        }
      }
    }
    return null;
  }

  function startColorRound(roomId) {
    const room = colorRooms.get(roomId);
    if (!room) return;

    room.currentRound++;
    room.roundTimeLeft = 30;
    room.bets = {};

    // Notify all players that round started
    io.to(roomId).emit("round-started", {
      round: room.currentRound,
      timeLeft: room.roundTimeLeft,
    });

    // Start countdown timer
    const timer = setInterval(() => {
      room.roundTimeLeft--;

      if (room.roundTimeLeft <= 0) {
        clearInterval(timer);
        endColorRound(roomId);
      } else {
        io.to(roomId).emit("timer-update", { timeLeft: room.roundTimeLeft });
      }
    }, 1000);
  }

  function endColorRound(roomId) {
    const room = colorRooms.get(roomId);
    if (!room) return;

    // Select random winning color
    const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
    const winningColor = colors[Math.floor(Math.random() * colors.length)];

    // Calculate winners and update balances
    const winners = [];
    let totalPot = 0;

    room.players.forEach((player) => {
      const bet = room.bets[player.id];
      if (bet && bet.color === winningColor) {
        const winnings = bet.amount * getColorMultiplier(bet.color);
        player.balance += winnings;
        winners.push({
          playerId: player.id,
          name: player.user.name,
          winnings: winnings,
        });
        totalPot += winnings;
      }
    });

    // Add to game history
    room.gameHistory.unshift({
      round: room.currentRound,
      color: winningColor,
      winners: winners.length,
      totalPot,
    });

    // Notify all players of result
    io.to(roomId).emit("round-result", {
      color: winningColor,
      winners,
      round: room.currentRound,
    });

    // Start next round after delay
    setTimeout(() => {
      if (room.players.length >= 2) {
        startColorRound(roomId);
      } else {
        // End game if not enough players
        io.to(roomId).emit("game-over", { reason: "not enough players" });

        // Clear current game for remaining players
        room.players.forEach((player) => {
          const user = onlineUsers.get(player.id);
          if (user) user.currentGame = null;
        });

        io.emit("online-users-update", {
          users: Array.from(onlineUsers.values()).map((user) => ({
            id: user.id,
            name: user.name,
            currentGame: user.currentGame,
          })),
        });

        colorRooms.delete(roomId);
      }
    }, 5000);
  }

  function getColorMultiplier(color) {
    const multipliers = {
      Red: 2,
      Blue: 2,
      Green: 2,
      Yellow: 3,
      Purple: 3,
      Orange: 4,
    };
    return multipliers[color] || 2;
  }

  return io;
};

module.exports = initializeSocket;

//Code get changed