import { useState, useEffect } from 'react'
import ChessGame from '../components/ChessGame'
import './GamePage.css'

const GamePage = () => {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [waitingForPlayer, setWaitingForPlayer] = useState(false)
  const [showRoomCode, setShowRoomCode] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [userBalance] = useState(25000) // Mock balance

  const entryFees = [100, 500, 1000, 10000, 20000, 50000]

  const handleEntrySelect = (fee) => {
    if (userBalance < fee) {
      alert('Insufficient balance!')
      return
    }
    setSelectedEntry(fee)
    setGameStarted(true)
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      alert('Please enter room code')
      return
    }
    setGameStarted(true)
  }

  const handleGameEnd = (winner) => {
    const totalPot = selectedEntry * 2
    const winAmount = totalPot * 0.8 // 80% to winner, 20% to admin
    
    alert(`Game Over! ${winner} wins ₹${winAmount}`)
    setGameStarted(false)
    setSelectedEntry(null)
  }

  if (gameStarted) {
    return <ChessGame entryFee={selectedEntry} onGameEnd={handleGameEnd} />
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Chess Battle Arena</h1>
        <div className="balance">Balance: ₹{userBalance.toLocaleString()}</div>
      </div>

      {waitingForPlayer ? (
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h2>Finding Opponent...</h2>
          <p>Entry Fee: ₹{selectedEntry}</p>
          <p>Prize Pool: ₹{selectedEntry * 2}</p>
          <p>Winner Gets: ₹{selectedEntry * 2 * 0.8}</p>
        </div>
      ) : (
        <div className="entry-selection">
          <h2>Select Entry Fee</h2>
          <div className="entry-grid">
            {entryFees.map(fee => (
              <button
                key={fee}
                className={`entry-btn ${userBalance < fee ? 'disabled' : ''}`}
                onClick={() => handleEntrySelect(fee)}
                disabled={userBalance < fee}
              >
                <div className="fee">₹{fee.toLocaleString()}</div>
                <div className="prize">Win ₹{(fee * 2 * 0.8).toLocaleString()}</div>
              </button>
            ))}
          </div>
          
          <div className="room-options">
            <button 
              className="room-toggle-btn"
              onClick={() => setShowRoomCode(!showRoomCode)}
            >
              {showRoomCode ? 'Quick Match' : 'Join Room'}
            </button>
            
            {showRoomCode && (
              <div className="room-code-section">
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="room-input"
                />
                <button onClick={handleJoinRoom} className="join-room-btn">
                  Join Room
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GamePage