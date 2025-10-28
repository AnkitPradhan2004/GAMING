import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./ColorPrediction.css";

const COLORS = [
  { name: "Red", color: "#ff4444", multiplier: 2 },
  { name: "Blue", color: "#4444ff", multiplier: 2 },
  { name: "Green", color: "#44ff44", multiplier: 2 },
  { name: "Yellow", color: "#ffff44", multiplier: 3 },
  { name: "Purple", color: "#ff44ff", multiplier: 3 },
  { name: "Orange", color: "#ff8844", multiplier: 4 },
];

const ColorPrediction = ({
  socket: propSocket,
  entryFee,
  onGameEnd,
  roomCode = null,
  userId,
  onQueueCancelled,
}) => {
  const [socket, setSocket] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [roomId, setRoomId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponent, setOpponent] = useState("");
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedColor, setSelectedColor] = useState(null);
  const [betAmount, setBetAmount] = useState(entryFee);
  const [bets, setBets] = useState({});
  const [result, setResult] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Validate props
  const isValidProps = entryFee && typeof onGameEnd === "function";

  useEffect(() => {
    if (!propSocket || !isValidProps) return;

    console.log("ColorPrediction: Setting up event listeners for socket");

    const socket = propSocket;

    const handleRoomCreated = (data) => {
      setRoomId(data.roomCode);
      setGameStatus("waiting");
    };

    const handleGameStarted = (data) => {
      console.log("ColorPrediction: Game started event received:", data);
      if (!userId) {
        console.warn(
          "ColorPrediction: userId not available when game-started received"
        );
        return;
      }
      setRoomId(data.roomId);
      setPlayers(data.players);
      setGameStatus("playing");
      setCurrentRound(1);
      setTimeLeft(30);
    };

    const handleWaitingForPlayers = () => {
      console.log("ColorPrediction: Waiting for players");
      setGameStatus("waiting");
    };

    const handleQueueCancelled = () => {
      console.log("ColorPrediction: Queue cancelled");
      if (onQueueCancelled) {
        onQueueCancelled();
      }
    };

    const handlePlayersUpdate = (data) => {
      setPlayers(data.players);
    };

    const handleRoundStarted = (data) => {
      setCurrentRound(data.round);
      setTimeLeft(30);
      setSelectedColor(null);
      setResult(null);
      setBets({});
    };

    const handleTimerUpdate = (data) => {
      setTimeLeft(data.timeLeft);
    };

    const handleBetPlaced = (data) => {
      console.log("ColorPrediction: Received bet-placed event:", data);
      setBets((prev) => {
        const newBets = {
          ...prev,
          [data.playerId]: { color: data.color, amount: data.amount },
        };
        console.log("ColorPrediction: Updated bets:", newBets);
        return newBets;
      });
    };

    const handleRoundResult = (data) => {
      setResult(data);
      setGameHistory((prev) => [data, ...prev.slice(0, 9)]); // Keep last 10 results
    };

    const handleGameOver = (data) => {
      setGameStatus("finished");
      onGameEnd(data.winner === playerColor ? "You" : "Opponent");
    };

    const handleRoomJoinFailed = (data) => {
      setGameStatus("error");
      setErrorMessage(data.reason);
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("game-started", handleGameStarted);
    socket.on("waiting-for-players", handleWaitingForPlayers);
    socket.on("queue-cancelled", handleQueueCancelled);
    socket.on("players-update", handlePlayersUpdate);
    socket.on("round-started", handleRoundStarted);
    socket.on("timer-update", handleTimerUpdate);
    socket.on("bet-placed", handleBetPlaced);
    socket.on("round-result", handleRoundResult);
    socket.on("game-over", handleGameOver);
    socket.on("room-join-failed", handleRoomJoinFailed);

    // Join game if roomCode is provided
    if (roomCode) {
      socket.emit("join-color-room", { roomCode, entryFee });
    }
    // For quick matches, the GamePage already emitted join-color-queue

    return () => {
      // Clean up event listeners
      socket.off("room-created", handleRoomCreated);
      socket.off("game-started", handleGameStarted);
      socket.off("waiting-for-players", handleWaitingForPlayers);
      socket.off("queue-cancelled", handleQueueCancelled);
      socket.off("players-update", handlePlayersUpdate);
      socket.off("round-started", handleRoundStarted);
      socket.off("timer-update", handleTimerUpdate);
      socket.off("bet-placed", handleBetPlaced);
      socket.off("round-result", handleRoundResult);
      socket.off("game-over", handleGameOver);
      socket.off("room-join-failed", handleRoomJoinFailed);
    };
  }, [propSocket, entryFee, roomCode, isValidProps]);

  const placeBet = (colorName) => {
    if (!propSocket || gameStatus !== "playing" || timeLeft <= 0) return;

    console.log("ColorPrediction: Placing bet:", {
      colorName,
      amount: betAmount,
      roomId,
    });
    setSelectedColor(colorName);
    propSocket.emit("place-color-bet", {
      roomId,
      color: colorName,
      amount: betAmount,
    });
  };

  const getColorByName = (name) => {
    return COLORS.find((c) => c.name === name);
  };

  // Early return for invalid props
  if (!isValidProps) {
    return (
      <div className="color-prediction">Error: Invalid game configuration</div>
    );
  }

  if (gameStatus === "waiting") {
    return (
      <div className="color-prediction">
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h2>
            {roomCode ? "Waiting for More Players..." : "Finding Players..."}
          </h2>
          <p>Entry Fee: ₹{entryFee.toLocaleString()}</p>
          {roomCode && (
            <p>
              Room Code: <strong>{roomCode}</strong>
            </p>
          )}
          {Array.isArray(players) && players.length > 0 && (
            <p>Players in Room: {players.length}/2</p>
          )}
          <p>Waiting for 2 players to start...</p>
          {!roomCode && (
            <button
              className="cancel-queue-btn"
              onClick={() => propSocket.emit("cancel-queue", "color")}
            >
              Cancel Search
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameStatus === "error") {
    return (
      <div className="color-prediction">
        <div className="error-screen">
          <h2>Connection Error</h2>
          <p>
            {errorMessage ||
              "Unable to connect to game server. Please try again."}
          </p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      </div>
    );
  }

  // Don't render main game until we have all required data
  if (!roomId || !Array.isArray(players) || players.length === 0) {
    return (
      <div className="color-prediction">
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h2>Loading Game...</h2>
          <p>Please wait while we set up your game.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="color-prediction">
      <div className="game-info">
        <div className="round-info">
          <h3>Round {currentRound}</h3>
          <div className="timer">
            Time Left:{" "}
            <span className={timeLeft <= 10 ? "urgent" : ""}>{timeLeft}s</span>
          </div>
        </div>

        <div className="players-list">
          <h4>
            Players ({players.length}/2) - Room: {roomCode || roomId}
          </h4>
          {players.map((player) => (
            <div
              key={player.id}
              className={`player-item ${
                player.id === userId ? "current-player" : ""
              }`}
            >
              <div className="player-info">
                <span className="player-name">
                  {player.name} {player.id === userId ? "(You)" : ""}
                </span>
                <span className="player-balance">
                  ₹{player.balance?.toLocaleString() || "0"}
                </span>
              </div>
              {bets[player.id] && (
                <div className="player-bet-info">
                  <span
                    className="player-bet"
                    style={{
                      backgroundColor:
                        getColorByName(bets[player.id].color)?.color || "#333",
                    }}
                  >
                    {bets[player.id].color} (₹{bets[player.id].amount})
                  </span>
                  <span className="potential-win">
                    Potential: ₹
                    {(
                      bets[player.id].amount *
                      (getColorByName(bets[player.id].color)?.multiplier || 2)
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              {!bets[player.id] && gameStatus === "playing" && timeLeft > 0 && (
                <span className="betting-status">Placing bet...</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="game-area">
        <div className="color-wheel">
          {COLORS.map((color) => (
            <button
              key={color.name}
              className={`color-button ${
                selectedColor === color.name ? "selected" : ""
              } ${timeLeft <= 0 ? "disabled" : ""}`}
              style={{ backgroundColor: color.color }}
              onClick={() => placeBet(color.name)}
              disabled={timeLeft <= 0 || gameStatus !== "playing"}
            >
              <div className="color-name">{color.name}</div>
              <div className="multiplier">{color.multiplier}x</div>
            </button>
          ))}
        </div>

        {result && (
          <div className="result-display">
            <div
              className="winning-color"
              style={{
                backgroundColor: getColorByName(result.color)?.color || "#333",
              }}
            >
              <h2>{result.color} Wins!</h2>
              <p>
                Multiplier: {getColorByName(result.color)?.multiplier || 2}x
              </p>
            </div>
            <div className="winners-list">
              {result.winners &&
                result.winners.map((winner) => (
                  <div key={winner.playerId} className="winner-item">
                    {winner.name}: +₹{winner.winnings}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="bet-controls">
          <label>Bet Amount: ₹</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) =>
              setBetAmount(Math.max(10, parseInt(e.target.value) || 0))
            }
            min="10"
            max={entryFee}
            disabled={timeLeft <= 0}
          />
        </div>

        <div className="game-history">
          <h4>Recent Results</h4>
          <div className="history-list">
            {gameHistory.map((hist, index) => (
              <div
                key={index}
                className="history-item"
                style={{
                  backgroundColor: getColorByName(hist.color)?.color || "#333",
                }}
              >
                {hist.color}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPrediction;
