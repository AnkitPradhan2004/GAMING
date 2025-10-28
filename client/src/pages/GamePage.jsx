import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChessGame from "../components/ChessGame";
import ColorPrediction from "../components/ColorPrediction";
import ErrorBoundary from "../components/ErrorBoundary";
import io from "socket.io-client";
import "./GamePage.css";

const GamePage = () => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [userBalance, setUserBalance] = useState(1000);
  const [userId, setUserId] = useState(null);
  const [gameMode, setGameMode] = useState("quick"); // "quick" or "room"
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [selectedGame, setSelectedGame] = useState("chess"); // "chess" or "color"
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [gameInvites, setGameInvites] = useState([]);

  const entryFees = [100, 500, 1000, 10000, 20000, 50000];

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("http://localhost:3000/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserBalance(userData.walletBalance || 1000);
            setUserId(userData._id);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    let newSocket;
    setIsConnecting(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("token");

      // Connect with authentication
      newSocket = io("http://localhost:3000", {
        auth: {
          token: token,
        },
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setIsConnecting(false);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnecting(true);
      });

      newSocket.on("room-created", (data) => {
        setCreatedRoomCode(data.roomCode);
        setWaitingForOpponent(true);
        // Alert removed - room code shown in UI instead
      });

      newSocket.on("waiting-for-opponent", () => {
        console.log("Client: Received waiting-for-opponent");
        setWaitingForPlayer(true);
      });

      newSocket.on("waiting-for-players", () => {
        console.log("Client: Received waiting-for-players");
        setWaitingForPlayer(true);
      });

      newSocket.on("already-in-queue", (data) => {
        console.log("Client: Received already-in-queue", data);
        alert(
          `You are already in the ${data.gameType} queue. Please wait for a match or cancel your current search.`
        );
      });

      newSocket.on("queue-cancelled", (data) => {
        console.log("Client: Received queue-cancelled", data);
        setWaitingForPlayer(false);
        setWaitingForOpponent(false);
      });

      // Removed game-started listener - game components handle this now

      newSocket.on("online-users-update", (data) => {
        setOnlineUsers(data.users);
      });

      newSocket.on("game-invite", (data) => {
        setGameInvites((prev) => [...prev, data]);
        // Show notification
        if (Notification.permission === "granted") {
          new Notification(`Game Invite from ${data.from}`, {
            body: data.message,
            icon: "/vite.svg",
          });
        }
      });

      newSocket.on("room-creation-failed", (data) => {
        alert(`Failed to create room: ${data.reason}`);
      });

      newSocket.on("room-join-failed", (data) => {
        alert(`Failed to join room: ${data.reason}`);
        setGameStarted(false); // Reset game started state on join failure
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnecting(false);
        alert(
          "Failed to connect to game server. Please check your connection."
        );
      });
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      setIsConnecting(false);
      alert("Failed to initialize game connection. Please refresh the page.");
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleEntrySelect = (fee) => {
    if (userBalance < fee) {
      alert("Insufficient balance!");
      return;
    }
    setSelectedEntry(fee);
    // Don't automatically start the game here - let user choose game mode first
  };

  const handleStartQuickMatch = () => {
    if (!selectedEntry) {
      alert("Please select an entry fee first!");
      return;
    }
    if (!socket || !socket.connected) {
      alert(
        "Connection not established. Please wait for connection and try again."
      );
      return;
    }

    // Set game started and render game component immediately
    setGameStarted(true);

    if (selectedGame === "chess") {
      console.log(
        `Client: Emitting join-chess-queue with entry fee ${selectedEntry}`
      );
      socket.emit("join-chess-queue", selectedEntry);
    } else {
      console.log(
        `Client: Emitting join-color-queue with entry fee ${selectedEntry}`
      );
      socket.emit("join-color-queue", selectedEntry);
    }
  };

  const handleCreateRoom = () => {
    if (!selectedEntry) {
      alert("Please select an entry fee first!");
      return;
    }
    if (!socket || !socket.connected) {
      alert(
        "Connection not established. Please wait for connection and try again."
      );
      return;
    }

    const generatedCode =
      selectedGame === "chess"
        ? `CHESS${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        : `COLOR${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    socket.emit(
      selectedGame === "chess" ? "create-chess-room" : "create-color-room",
      {
        roomCode: generatedCode,
        entryFee: selectedEntry,
      }
    );
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      alert("Please enter room code");
      return;
    }
    if (!selectedEntry) {
      alert("Please select an entry fee first!");
      return;
    }
    if (!socket || !socket.connected) {
      alert(
        "Connection not established. Please wait for connection and try again."
      );
      return;
    }

    socket.emit(
      selectedGame === "chess" ? "join-chess-room" : "join-color-room",
      {
        roomCode,
        entryFee: selectedEntry,
      }
    );

    setGameStarted(true);
  };

  const handleQueueCancelled = () => {
    console.log("GamePage: Queue cancelled");
    setWaitingForPlayer(false);
    setWaitingForOpponent(false);
    setGameStarted(false);
    setSelectedEntry(null);
  };

  const handleGameEnd = (winner) => {
    const totalPot = selectedEntry * 2;
    const winAmount = totalPot * 0.8; // 80% to winner, 20% to admin

    alert(`Game Over! ${winner} wins ₹${winAmount}`);
    setGameStarted(false);
    setSelectedEntry(null);
  };

  const handleInviteUser = (targetUserId) => {
    if (!socket || !socket.connected) {
      alert("Connection not established. Please try again.");
      return;
    }

    socket.emit("invite-user", {
      targetUserId,
      gameType: selectedGame,
      roomCode: createdRoomCode,
    });

    alert("Invite sent!");
  };

  const handleAcceptInvite = (invite) => {
    setSelectedGame(invite.gameType);
    setRoomCode(invite.roomCode);
    setGameInvites((prev) =>
      prev.filter((inv) => inv.fromId !== invite.fromId)
    );

    // Join the room
    if (socket && socket.connected) {
      socket.emit(`join-${invite.gameType}-room`, {
        roomCode: invite.roomCode,
        entryFee: selectedEntry || 100, // Default entry fee if not selected
      });
      setGameStarted(true);
    }
  };

  const handleDeclineInvite = (invite) => {
    setGameInvites((prev) =>
      prev.filter((inv) => inv.fromId !== invite.fromId)
    );
  };

  if (gameStarted) {
    // Ensure userId is available before rendering game components
    if (!userId) {
      return (
        <div className="game-page">
          <div className="waiting-screen">
            <div className="spinner"></div>
            <h2>Loading Game...</h2>
            <p>Please wait while we set up your game.</p>
          </div>
        </div>
      );
    }

    return (
      <ErrorBoundary gameType={selectedGame}>
        {selectedGame === "chess" ? (
          <ChessGame
            socket={socket}
            entryFee={selectedEntry}
            onGameEnd={handleGameEnd}
            roomCode={gameMode === "room" ? roomCode : createdRoomCode}
            userId={userId}
            onQueueCancelled={handleQueueCancelled}
          />
        ) : (
          <ColorPrediction
            socket={socket}
            entryFee={selectedEntry}
            onGameEnd={handleGameEnd}
            roomCode={gameMode === "room" ? roomCode : createdRoomCode}
            userId={userId}
            onQueueCancelled={handleQueueCancelled}
          />
        )}
      </ErrorBoundary>
    );
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>
          {selectedGame === "chess"
            ? "Chess Battle Arena"
            : "Color Prediction Arena"}
        </h1>
        <div className="balance">Balance: ₹{userBalance.toLocaleString()}</div>
        {isConnecting && (
          <div className="connection-status">
            <span className="connecting">Connecting to server...</span>
          </div>
        )}
      </div>

      {!gameStarted && (
        <div className="game-selector">
          <h2>Choose Your Game</h2>
          <div className="game-options">
            <div className="game-option-container">
              <button
                className={`game-option ${
                  selectedGame === "chess" ? "active" : ""
                }`}
                onClick={() => setSelectedGame("chess")}
              >
                <div className="game-icon">♟️</div>
                <div className="game-title">Chess</div>
                <div className="game-desc">Strategic board game</div>
                <div className="online-count">
                  {onlineUsers.filter((u) => u.currentGame === "chess").length}{" "}
                  online
                </div>
              </button>
              {selectedGame === "chess" &&
                onlineUsers.filter((u) => u.currentGame === "chess").length >
                  0 && (
                  <div className="online-users-list">
                    <h4>Online Players:</h4>
                    {onlineUsers
                      .filter((u) => u.currentGame === "chess")
                      .map((user) => (
                        <div key={user.id} className="online-user">
                          <span>{user.name}</span>
                          <button
                            className="invite-btn"
                            onClick={() => handleInviteUser(user.id)}
                            disabled={!createdRoomCode}
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                  </div>
                )}
            </div>

            <div className="game-option-container">
              <button
                className={`game-option ${
                  selectedGame === "color" ? "active" : ""
                }`}
                onClick={() => setSelectedGame("color")}
              >
                <div className="game-icon">🎨</div>
                <div className="game-title">Color Prediction</div>
                <div className="game-desc">Predict winning colors</div>
                <div className="online-count">
                  {onlineUsers.filter((u) => u.currentGame === "color").length}{" "}
                  online
                </div>
              </button>
              {selectedGame === "color" &&
                onlineUsers.filter((u) => u.currentGame === "color").length >
                  0 && (
                  <div className="online-users-list">
                    <h4>Online Players:</h4>
                    {onlineUsers
                      .filter((u) => u.currentGame === "color")
                      .map((user) => (
                        <div key={user.id} className="online-user">
                          <span>{user.name}</span>
                          <button
                            className="invite-btn"
                            onClick={() => handleInviteUser(user.id)}
                            disabled={!createdRoomCode}
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                  </div>
                )}
            </div>
          </div>

          {gameInvites.length > 0 && (
            <div className="game-invites">
              <h3>Game Invites</h3>
              {gameInvites.map((invite, index) => (
                <div key={index} className="invite-item">
                  <p>
                    <strong>{invite.from}</strong> invited you to play{" "}
                    {invite.gameType === "chess" ? "Chess" : "Color Prediction"}
                  </p>
                  <div className="invite-actions">
                    <button
                      className="accept-invite-btn"
                      onClick={() => handleAcceptInvite(invite)}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-invite-btn"
                      onClick={() => handleDeclineInvite(invite)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {waitingForPlayer ? (
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h2>Finding Opponent...</h2>
          <p>Entry Fee: ₹{selectedEntry}</p>
          <p>Prize Pool: ₹{selectedEntry * 2}</p>
          <p>Winner Gets: ₹{selectedEntry * 2 * 0.8}</p>
          <button className="cancel-queue-btn" onClick={handleCancelQueue}>
            Cancel Search
          </button>
        </div>
      ) : waitingForOpponent ? (
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h2>Waiting for Opponent...</h2>
          <p>
            Room Code: <strong>{createdRoomCode}</strong>
          </p>
          <p>Share this code with your opponent to start playing!</p>
          <p>Entry Fee: ₹{selectedEntry}</p>
          <p>Prize Pool: ₹{selectedEntry * 2}</p>
          <p>Winner Gets: ₹{selectedEntry * 2 * 0.8}</p>
        </div>
      ) : (
        <div className="entry-selection">
          <h2>Select Entry Fee</h2>
          <div className="entry-grid">
            {entryFees.map((fee) => (
              <button
                key={fee}
                className={`entry-btn ${userBalance < fee ? "disabled" : ""}`}
                onClick={() => handleEntrySelect(fee)}
                disabled={userBalance < fee}
              >
                <div className="fee">₹{fee.toLocaleString()}</div>
                <div className="prize">
                  Win ₹{(fee * 2 * 0.8).toLocaleString()}
                </div>
              </button>
            ))}
          </div>

          <div className="room-options">
            {selectedEntry && (
              <>
                <div className="game-mode-selector">
                  <button
                    className={`mode-btn ${
                      gameMode === "quick" ? "active" : ""
                    }`}
                    onClick={() => setGameMode("quick")}
                  >
                    Quick Match
                  </button>
                  <button
                    className={`mode-btn ${
                      gameMode === "room" ? "active" : ""
                    }`}
                    onClick={() => setGameMode("room")}
                  >
                    Private Room
                  </button>
                </div>

                {gameMode === "room" && (
                  <div className="room-controls">
                    <button
                      onClick={handleCreateRoom}
                      className="create-room-btn"
                      disabled={isConnecting || !socket?.connected}
                    >
                      {isConnecting ? "Connecting..." : "Create Room"}
                    </button>
                    <div className="room-join-section">
                      <input
                        type="text"
                        placeholder="Enter Room Code"
                        value={roomCode}
                        onChange={(e) =>
                          setRoomCode(e.target.value.toUpperCase())
                        }
                        className="room-input"
                        disabled={isConnecting}
                      />
                      <button
                        onClick={handleJoinRoom}
                        className="join-room-btn"
                        disabled={isConnecting || !socket?.connected}
                      >
                        {isConnecting ? "Connecting..." : "Join Room"}
                      </button>
                    </div>
                    {createdRoomCode && (
                      <div className="created-room-info">
                        <p>
                          Room Code: <strong>{createdRoomCode}</strong>
                        </p>
                        <p>Share this code with your opponent!</p>
                      </div>
                    )}
                  </div>
                )}

                {gameMode === "quick" && (
                  <button
                    className="quick-match-btn"
                    onClick={handleStartQuickMatch}
                    disabled={
                      !selectedEntry || isConnecting || !socket?.connected
                    }
                  >
                    {isConnecting ? "Connecting..." : "Start Quick Match"}
                  </button>
                )}
              </>
            )}

            {!selectedEntry && (
              <div className="select-fee-prompt">
                <p>Please select an entry fee above to continue</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
