import { useState, useEffect } from "react";
import "./ChessGame.css";

// Chess piece SVG components
const ChessPiece = ({ type, color }) => {
  const pieceColor = color === "white" ? "#ffffff" : "#333333";
  const strokeColor = color === "white" ? "#000000" : "#ffffff";

  const pieces = {
    king: (
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill={pieceColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M22.5 11.63V6M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
          <path d="M20 8h5" />
          <path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9" />
          <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
        </g>
      </svg>
    ),
    queen: (
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill={pieceColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <g fill={pieceColor} stroke="none">
            <circle cx="6" cy="12" r="2.75" />
            <circle cx="14" cy="9" r="2.75" />
            <circle cx="22.5" cy="8" r="2.75" />
            <circle cx="31" cy="9" r="2.75" />
            <circle cx="39" cy="12" r="2.75" />
          </g>
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" />
          <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
          <path
            d="M11 38.5a35 35 1 0 0 29 0"
            fill="none"
            stroke={strokeColor}
          />
          <path
            d="M11 29a35 35 1 0 1 29 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 25 0"
            fill="none"
            stroke={pieceColor}
          />
        </g>
      </svg>
    ),
    rook: (
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill={pieceColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" />
          <path d="M14 29.5v-13h17v13H14z" />
          <path d="M14 16.5L11 14h23l-3 2.5H14zM14 24.5L11 26.5h23l-3-2H14z" />
          <path d="M35 36.5v-7.5H10v7.5H35z" strokeLinecap="butt" />
          <path d="M37 42V33.5H8V42h29z" strokeLinecap="butt" />
        </g>
      </svg>
    ),
    bishop: (
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill={pieceColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <g fill={pieceColor} stroke={strokeColor} strokeLinecap="butt">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 0-15.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
          </g>
          <path
            d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"
            strokeLinejoin="miter"
          />
        </g>
      </svg>
    ),
    knight: (
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill={pieceColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
          <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.42 9.65-14 18-.66 1.2-.19 1.08-.82.78-.55-.41-.28-1.85-5.11-4.77z" />
          <path
            d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z"
            fill={strokeColor}
          />
          <path
            d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"
            fill={strokeColor}
            strokeWidth="1.49997"
          />
        </g>
      </svg>
    ),
    pawn: (
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <path
          d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          fill={pieceColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return pieces[type] || null;
};

function initializeBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: "pawn", color: "black" };
    board[6][i] = { type: "pawn", color: "white" };
  }

  // Place other pieces
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

const ChessGame = ({
  socket: propSocket,
  entryFee,
  onGameEnd,
  roomCode = null,
  userId,
  onQueueCancelled,
}) => {
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [roomId, setRoomId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponent, setOpponent] = useState("");
  const [timer, setTimer] = useState({ white: 600, black: 600 });
  const [inCheck, setInCheck] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validate props
  const isValidProps = entryFee && typeof onGameEnd === "function";

  useEffect(() => {
    if (!propSocket) return;

    const socket = propSocket;

    const handleGameStarted = (data) => {
      console.log("Chess game started:", data);
      if (!userId) {
        console.warn(
          "ChessGame: userId not available when game-started received"
        );
        return;
      }
      setRoomId(data.roomId);
      setPlayerColor(data.players.white.id === userId ? "white" : "black");
      setOpponent(
        data.players.white.id === userId
          ? data.players.black.name
          : data.players.white.name
      );
      setGameStatus("playing");
      setCurrentPlayer("white");
      setBoard(initializeBoard());
      setTimer({ white: 600, black: 600 });
      setInCheck(false);
      setGameOver(false);
    };

    const handleWaitingForOpponent = () => {
      console.log("Chess: Waiting for opponent");
      setGameStatus("waiting");
    };

    const handleMoveMade = (data) => {
      try {
        console.log("Received chess move:", data);
        setBoard(data.board);
        setCurrentPlayer(data.currentTurn);
        setInCheck(data.inCheck);
        // Only update timer if it's provided by server
        if (data.timer) {
          setTimer(data.timer);
        }
        // Clear selection and possible moves after opponent's move
        setSelectedSquare(null);
        setPossibleMoves([]);
      } catch (error) {
        console.error("Error handling move-made:", error);
        // Reset to safe state on error
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    };

    const handleGameOver = (data) => {
      console.log("Chess game ended:", data);
      setGameOver(true);
      setGameStatus("finished");
      onGameEnd(data.winner);
    };

    const handleRoomJoinFailed = (data) => {
      setGameStatus("error");
      setErrorMessage(data.reason);
    };

    const handleQueueCancelled = () => {
      console.log("Chess: Queue cancelled");
      if (onQueueCancelled) {
        onQueueCancelled();
      }
    };

    socket.on("game-started", handleGameStarted);
    socket.on("waiting-for-opponent", handleWaitingForOpponent);
    socket.on("queue-cancelled", handleQueueCancelled);
    socket.on("move-made", handleMoveMade);
    socket.on("game-over", handleGameOver);
    socket.on("room-join-failed", handleRoomJoinFailed);

    // Join game if roomCode is provided
    if (roomCode) {
      socket.emit("join-chess-room", { roomCode, entryFee });
    }
    // For quick matches, the GamePage already emitted join-chess-queue

    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("waiting-for-opponent", handleWaitingForOpponent);
      socket.off("queue-cancelled", handleQueueCancelled);
      socket.off("move-made", handleMoveMade);
      socket.off("game-over", handleGameOver);
      socket.off("room-join-failed", handleRoomJoinFailed);
    };
  }, []);
  useEffect(() => {
    let intervalId;

    if (gameStatus === "playing" && !gameOver) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = { ...prevTimer };
          newTimer[currentPlayer] = Math.max(0, newTimer[currentPlayer] - 1);

          // Check if time ran out
          if (newTimer[currentPlayer] === 0) {
            console.log(`${currentPlayer} ran out of time`);
            setGameOver(true);
            setGameStatus("finished");

            // Notify parent component
            onGameEnd(
              currentPlayer === "white" ? "Black Player" : "White Player"
            );

            return newTimer;
          }

          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameStatus, currentPlayer, gameOver, onGameEnd]);

  const isValidMove = (board, from, to, playerColor) => {
    const piece = board[from.row][from.col];
    if (!piece || piece.color !== playerColor) return false;

    // Can't capture own pieces
    if (board[to.row][to.col] && board[to.row][to.col].color === playerColor)
      return false;

    const dx = to.col - from.col;
    const dy = to.row - from.row;

    switch (piece.type) {
      case "pawn": {
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
          return (
            board[to.row][to.col] && board[to.row][to.col].color !== playerColor
          );
        }
        return false;
      }

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

      case "king": {
        // Normal king move
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
          return true;
        }
        // Castling (simplified - no check for pieces in between or king in check)
        if (
          dy === 0 &&
          Math.abs(dx) === 2 &&
          from.row === (playerColor === "white" ? 7 : 0)
        ) {
          const rookCol = dx > 0 ? 7 : 0;
          const rook = board[from.row][rookCol];
          if (rook && rook.type === "rook" && rook.color === playerColor) {
            // Check if path is clear for castling
            const step = dx > 0 ? 1 : -1;
            for (let col = from.col + step; col !== rookCol; col += step) {
              if (board[from.row][col]) return false;
            }
            return true;
          }
        }
        return false;
      }

      default:
        return false;
    }
  };

  const isPathClear = (board, from, to) => {
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
  };

  const getPossibleMoves = (row, col) => {
    try {
      const piece = board[row][col];
      if (!piece || piece.color !== playerColor) return [];

      const moves = [];
      // Simple move generation - in a real implementation, this would be more sophisticated
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (
            isValidMove(board, { row, col }, { row: r, col: c }, playerColor)
          ) {
            moves.push([r, c]);
          }
        }
      }
      return moves;
    } catch (error) {
      console.error("Error in getPossibleMoves:", error);
      return [];
    }
  };

  const handleSquareClick = (row, col) => {
    try {
      console.log("Square clicked:", {
        row,
        col,
        gameStatus,
        currentPlayer,
        playerColor,
        roomId,
        gameOver,
        socket: !!propSocket,
      });

      if (
        gameStatus !== "playing" ||
        currentPlayer !== playerColor ||
        !propSocket ||
        !roomId ||
        gameOver
      ) {
        console.log("Move blocked:", {
          gameStatus,
          currentPlayer,
          playerColor,
          hasSocket: !!propSocket,
          roomId,
          gameOver,
        });
        return;
      }

      if (selectedSquare) {
        const [fromRow, fromCol] = selectedSquare;
        const piece = board[fromRow][fromCol];

        console.log("Attempting move:", {
          from: { row: fromRow, col: fromCol },
          to: { row, col },
          piece,
          playerColor,
        });

        // Check if this is a valid move
        if (possibleMoves.some(([r, c]) => r === row && c === col)) {
          // Send move to server
          console.log("Sending move to server:", {
            roomId,
            from: { row: fromRow, col: fromCol },
            to: { row, col },
          });

          propSocket.emit("chess-move", {
            roomId,
            from: { row: fromRow, col: fromCol },
            to: { row, col },
          });
        } else {
          console.log("Move not in possible moves list");
        }

        // Clear selection
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        const piece = board[row][col];
        if (piece && piece.color === playerColor) {
          console.log("Selected piece:", piece);
          setSelectedSquare([row, col]);
          setPossibleMoves(getPossibleMoves(row, col));
        } else {
          console.log("No valid piece to select at:", { row, col });
        }
      }
    } catch (error) {
      console.error("Error in handleSquareClick:", error);
      // Reset state on error
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handleResign = () => {
    if (!propSocket || !roomId) return;

    console.log("Resigning from game:", roomId);
    propSocket.emit("chess-resign", { roomId });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPieceSymbol = (piece) => {
    if (!piece) return null;
    return <ChessPiece type={piece.type} color={piece.color} />;
  };

  // Early return for invalid props
  if (!isValidProps) {
    return <div className="chess-game">Error: Invalid game configuration</div>;
  }

  // Global error boundary for chess game
  try {
    if (gameStatus === "waiting") {
      return (
        <div className="chess-game">
          <div className="waiting-screen">
            <div className="spinner"></div>
            <h2>Finding Opponent...</h2>
            <p>Entry Fee: ₹{entryFee.toLocaleString()}</p>
            <p>Prize Pool: ₹{(entryFee * 2).toLocaleString()}</p>
            <p>Winner Gets: ₹{(entryFee * 2 * 0.8).toLocaleString()}</p>
            <button
              className="cancel-queue-btn"
              onClick={() => propSocket.emit("cancel-queue", "chess")}
            >
              Cancel Search
            </button>
          </div>
        </div>
      );
    }

    if (gameStatus === "error") {
      return (
        <div className="chess-game">
          <div className="error-screen">
            <h2>Connection Error</h2>
            <p>
              {errorMessage ||
                "Unable to connect to game server. Please try again."}
            </p>
            <div className="error-actions">
              <button onClick={() => window.location.reload()}>
                Refresh Page
              </button>
              <button
                onClick={() => {
                  setGameStatus("waiting");
                  setErrorMessage("");
                  // Try to reconnect socket
                  if (propSocket) {
                    propSocket.connect();
                  }
                }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="chess-game-container">
        <div className="chess-game">
          {/* Left Panel - Player Info */}
          <div className="left-panel">
            <div className="player-card opponent-card">
              <div className="player-avatar">
                <div className="avatar-circle">
                  <span>{opponent.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="player-info">
                <div className="player-name">{opponent}</div>
                <div className="player-rating">1200</div>
              </div>
              <div className="player-timer">
                {currentPlayer === "black"
                  ? formatTime(timer?.black || 600)
                  : formatTime(timer?.white || 600)}
              </div>
            </div>

            <div className="captured-pieces">
              <div className="captured-title">Captured Pieces</div>
              <div className="captured-list">
                {/* Will implement captured pieces logic later */}
              </div>
            </div>
          </div>

          {/* Center - Chess Board */}
          <div className="board-container">
            <div className="board-wrapper">
              {/* Rank labels (1-8) */}
              <div className="rank-labels">
                {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
                  <div key={rank} className="rank-label">
                    {rank}
                  </div>
                ))}
              </div>

              <div className="board-and-files">
                <div
                  className={`chess-board ${
                    playerColor === "black" ? "flipped" : ""
                  }`}
                >
                  {(playerColor === "black" ? [...board].reverse() : board).map(
                    (row, rowIndex) =>
                      (playerColor === "black" ? [...row].reverse() : row).map(
                        (piece, colIndex) => {
                          const actualRowIndex =
                            playerColor === "black" ? 7 - rowIndex : rowIndex;
                          const actualColIndex =
                            playerColor === "black" ? 7 - colIndex : colIndex;
                          const isKingInCheck =
                            inCheck &&
                            piece &&
                            piece.type === "king" &&
                            piece.color === currentPlayer;
                          const isSelected =
                            selectedSquare &&
                            selectedSquare[0] === actualRowIndex &&
                            selectedSquare[1] === actualColIndex;
                          const isPossibleMove = possibleMoves.some(
                            ([r, c]) =>
                              r === actualRowIndex && c === actualColIndex
                          );
                          return (
                            <div
                              key={`${actualRowIndex}-${actualColIndex}`}
                              className={`square ${
                                (actualRowIndex + actualColIndex) % 2 === 0
                                  ? "light"
                                  : "dark"
                              } ${isSelected ? "selected" : ""} ${
                                isKingInCheck ? "in-check" : ""
                              } ${isPossibleMove ? "possible-move" : ""}`}
                              onClick={() =>
                                handleSquareClick(
                                  actualRowIndex,
                                  actualColIndex
                                )
                              }
                            >
                              <span className={`piece ${piece?.color || ""}`}>
                                {getPieceSymbol(piece)}
                              </span>
                              {isPossibleMove && !piece && (
                                <div className="move-indicator"></div>
                              )}
                            </div>
                          );
                        }
                      )
                  )}
                </div>

                {/* File labels (a-h) */}
                <div className="file-labels">
                  {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
                    <div key={file} className="file-label">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="game-over-overlay">
                <div className="game-over-modal">
                  <h2>Game Over</h2>
                  <div className="game-result">
                    {winner === opponent ? (
                      <div className="loss-message">
                        <span className="result-icon">😞</span>
                        <h3>You Lost!</h3>
                        <p>{winner} wins by resignation</p>
                      </div>
                    ) : (
                      <div className="win-message">
                        <span className="result-icon">🎉</span>
                        <h3>You Win!</h3>
                        <p>Opponent resigned</p>
                      </div>
                    )}
                  </div>
                  <div className="prize-info">
                    <div className="prize-amount">
                      Winner gets ₹{(entryFee * 2 * 0.8).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="play-again-btn"
                    onClick={() => window.location.reload()}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Game Info */}
          <div className="right-panel">
            <div className="player-card player-card">
              <div className="player-avatar">
                <div className="avatar-circle">
                  <span>{playerColor === "white" ? "W" : "B"}</span>
                </div>
              </div>
              <div className="player-info">
                <div className="player-name">You ({playerColor})</div>
                <div className="player-rating">1200</div>
              </div>
              <div className="player-timer">
                {currentPlayer === playerColor
                  ? formatTime(timer?.[playerColor] || 600)
                  : formatTime(
                      timer?.[playerColor === "white" ? "black" : "white"] ||
                        600
                    )}
              </div>
            </div>

            <div className="game-status">
              <div className="status-indicator">
                <div
                  className={`turn-indicator ${
                    currentPlayer === playerColor
                      ? "your-turn"
                      : "opponent-turn"
                  }`}
                >
                  {currentPlayer === playerColor
                    ? "Your turn"
                    : "Opponent's turn"}
                </div>
                {inCheck && (
                  <div className="check-indicator">
                    {currentPlayer === playerColor
                      ? "You are in check!"
                      : "Opponent is in check!"}
                  </div>
                )}
              </div>
            </div>

            <div className="move-history">
              <div className="history-title">Move History</div>
              <div className="history-list">
                {/* Will implement move history later */}
                <div className="no-moves">No moves yet</div>
              </div>
            </div>

            <div className="game-controls">
              <button className="control-btn resign-btn" onClick={handleResign}>
                Resign
              </button>
              <button className="control-btn offer-draw-btn">Offer Draw</button>
            </div>

            <div className="prize-info">
              <div className="prize-title">Prize Pool</div>
              <div className="prize-amount">
                ₹{(entryFee * 2).toLocaleString()}
              </div>
              <div className="prize-subtitle">
                Winner takes ₹{(entryFee * 2 * 0.8).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Chess game render error:", error);
    return (
      <div className="chess-game">
        <div className="error-screen">
          <h2>Something went wrong</h2>
          <p>
            The Chess game encountered an error. Please try refreshing the page.
          </p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
          <details>
            <summary>Error Details</summary>
            <p>{error.message}</p>
          </details>
        </div>
      </div>
    );
  }
};

export default ChessGame;
