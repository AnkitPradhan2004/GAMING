import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./ChessGame.css";

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
}) => {
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [roomId, setRoomId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponent, setOpponent] = useState("");
  const [timer, setTimer] = useState({ white: 600, black: 600 });
  const [inCheck, setInCheck] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Validate props
  const isValidProps = entryFee && typeof onGameEnd === "function";

  useEffect(() => {
    if (!propSocket) return;

    const socket = propSocket;

    const handleGameStarted = (data) => {
      console.log("Chess game started:", data);
      setRoomId(data.roomId);
      setPlayerColor(
        data.players.white.id === socket.userId ? "white" : "black"
      );
      setOpponent(
        data.players.white.id === socket.userId
          ? data.players.black.name
          : data.players.white.name
      );
      setGameStatus("playing");
      setCurrentPlayer("white");
      setBoard(initializeBoard());
      setTimer({ white: 600, black: 600 });
      setInCheck(false);
      setGameOver(false);
      setWinner(null);
    };

    const handleMoveMade = (data) => {
      console.log("Received chess move:", data);
      setBoard(data.board);
      setCurrentPlayer(data.currentTurn);
      setInCheck(data.inCheck);
      setTimer(data.timer);
    };

    const handleGameOver = (data) => {
      console.log("Chess game ended:", data);
      setGameOver(true);
      setWinner(data.winner);
      setGameStatus("finished");
      onGameEnd(data.winner);
    };

    const handleRoomJoinFailed = (data) => {
      setGameStatus("error");
      setErrorMessage(data.reason);
    };

    socket.on("game-started", handleGameStarted);
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
      socket.off("move-made", handleMoveMade);
      socket.off("game-over", handleGameOver);
      socket.off("room-join-failed", handleRoomJoinFailed);
    };
  }, [propSocket, entryFee, onGameEnd, roomCode]);

  const handleSquareClick = (row, col) => {
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

      if (piece && piece.color === playerColor) {
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
        console.log("Invalid piece selection:", { piece, playerColor });
      }
      setSelectedSquare(null);
    } else {
      const piece = board[row][col];
      if (piece && piece.color === playerColor) {
        console.log("Selected piece:", piece);
        setSelectedSquare([row, col]);
      } else {
        console.log("No valid piece to select at:", { row, col });
      }
    }
  };

  const handleResign = () => {
    const winner = currentPlayer === "white" ? "Black Player" : "White Player";
    setGameStatus("resigned");
    onGameEnd(winner);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPieceSymbol = (piece) => {
    if (!piece) return "";

    const symbols = {
      king: piece.color === "white" ? "♔" : "♚",
      queen: piece.color === "white" ? "♕" : "♛",
      rook: piece.color === "white" ? "♖" : "♜",
      bishop: piece.color === "white" ? "♗" : "♝",
      knight: piece.color === "white" ? "♘" : "♞",
      pawn: piece.color === "white" ? "♙" : "♟",
    };

    return symbols[piece.type] || "";
  };

  // Early return for invalid props
  if (!isValidProps) {
    return <div className="chess-game">Error: Invalid game configuration</div>;
  }

  if (gameStatus === "waiting") {
    return (
      <div className="chess-game">
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h2>Finding Opponent...</h2>
          <p>Entry Fee: ₹{entryFee.toLocaleString()}</p>
          <p>Prize Pool: ₹{(entryFee * 2).toLocaleString()}</p>
          <p>Winner Gets: ₹{(entryFee * 2 * 0.8).toLocaleString()}</p>
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
    <div className="chess-game">
      <div className="game-info">
        <div className="prize-pool">
          <h3>Prize Pool: ₹{(entryFee * 2).toLocaleString()}</h3>
          <p>Winner Gets: ₹{(entryFee * 2 * 0.8).toLocaleString()}</p>
          <p>
            You are: <span className={playerColor}>{playerColor}</span>
          </p>
          <p>Opponent: {opponent}</p>
          {inCheck && (
            <p className="check-warning">
              ⚠️ {currentPlayer === playerColor ? "You are" : "Opponent is"} in
              check!
            </p>
          )}
          {gameOver && (
            <p
              className={`game-result ${
                winner === playerColor ? "win" : "lose"
              }`}
            >
              {winner === playerColor ? "🎉 You Won!" : "😞 You Lost!"}
            </p>
          )}
        </div>

        <div className="timers">
          <div className={`timer ${currentPlayer === "black" ? "active" : ""}`}>
            Black: {formatTime(timer.black)}
          </div>
          <div className={`timer ${currentPlayer === "white" ? "active" : ""}`}>
            White: {formatTime(timer.white)}
          </div>
        </div>
      </div>

      <div className="chess-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isKingInCheck =
              inCheck &&
              piece &&
              piece.type === "king" &&
              piece.color === currentPlayer;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`square ${
                  (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
                } ${
                  selectedSquare &&
                  selectedSquare[0] === rowIndex &&
                  selectedSquare[1] === colIndex
                    ? "selected"
                    : ""
                } ${isKingInCheck ? "in-check" : ""}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                <span className="piece">{getPieceSymbol(piece)}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="game-controls">
        <div className="current-turn">
          Current Turn: <span className={currentPlayer}>{currentPlayer}</span>
        </div>
        <button className="resign-btn" onClick={handleResign}>
          Resign
        </button>
      </div>
    </div>
  );
};

export default ChessGame;
