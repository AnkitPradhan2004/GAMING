import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './ChessGame.css'

const ChessGame = ({ entryFee, onGameEnd }) => {
  const [socket, setSocket] = useState(null)
  const [board, setBoard] = useState(initializeBoard())
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [gameStatus, setGameStatus] = useState('waiting')
  const [roomId, setRoomId] = useState(null)
  const [playerColor, setPlayerColor] = useState(null)
  const [opponent, setOpponent] = useState('')
  const [timer, setTimer] = useState({ white: 600, black: 600 })

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)
    
    // Join chess queue
    newSocket.emit('join-chess-queue', entryFee)
    
    // Socket event listeners
    newSocket.on('waiting-for-opponent', () => {
      setGameStatus('waiting')
    })
    
    newSocket.on('game-started', (data) => {
      setRoomId(data.roomId)
      setBoard(data.board)
      setCurrentPlayer(data.currentTurn)
      setGameStatus('playing')
      
      // Determine player color
      const myColor = Object.keys(data.players).find(color => 
        data.players[color] === 'Guest Player' || data.players[color].includes('Guest')
      ) || 'white'
      setPlayerColor(myColor)
      setOpponent(data.players[myColor === 'white' ? 'black' : 'white'])
    })
    
    newSocket.on('move-made', (data) => {
      setBoard(data.board)
      setCurrentPlayer(data.currentTurn)
    })
    
    return () => {
      newSocket.disconnect()
    }
  }, [entryFee])

  useEffect(() => {
    if (gameStatus === 'playing') {
      const interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          [currentPlayer]: prev[currentPlayer] - 1
        }))
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [currentPlayer, gameStatus])

  useEffect(() => {
    if (timer.white <= 0) {
      setGameStatus('black-wins')
      onGameEnd('Black Player')
    } else if (timer.black <= 0) {
      setGameStatus('white-wins')
      onGameEnd('White Player')
    }
  }, [timer])

  function initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null))
    
    // Place pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'pawn', color: 'black' }
      board[6][i] = { type: 'pawn', color: 'white' }
    }
    
    // Place other pieces
    const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: pieces[i], color: 'black' }
      board[7][i] = { type: pieces[i], color: 'white' }
    }
    
    return board
  }

  const handleSquareClick = (row, col) => {
    if (gameStatus !== 'playing' || currentPlayer !== playerColor) return

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare
      const piece = board[fromRow][fromCol]
      
      if (piece && piece.color === playerColor) {
        // Send move to server
        socket.emit('chess-move', {
          roomId,
          from: { row: fromRow, col: fromCol },
          to: { row, col }
        })
      }
      setSelectedSquare(null)
    } else {
      const piece = board[row][col]
      if (piece && piece.color === playerColor) {
        setSelectedSquare([row, col])
      }
    }
  }

  const handleResign = () => {
    const winner = currentPlayer === 'white' ? 'Black Player' : 'White Player'
    setGameStatus('resigned')
    onGameEnd(winner)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPieceSymbol = (piece) => {
    if (!piece) return ''
    
    const symbols = {
      king: piece.color === 'white' ? '♔' : '♚',
      queen: piece.color === 'white' ? '♕' : '♛',
      rook: piece.color === 'white' ? '♖' : '♜',
      bishop: piece.color === 'white' ? '♗' : '♝',
      knight: piece.color === 'white' ? '♘' : '♞',
      pawn: piece.color === 'white' ? '♙' : '♟'
    }
    
    return symbols[piece.type] || ''
  }

  if (gameStatus === 'waiting') {
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
    )
  }

  return (
    <div className="chess-game">
      <div className="game-info">
        <div className="prize-pool">
          <h3>Prize Pool: ₹{(entryFee * 2).toLocaleString()}</h3>
          <p>Winner Gets: ₹{(entryFee * 2 * 0.8).toLocaleString()}</p>
          <p>You are: <span className={playerColor}>{playerColor}</span></p>
          <p>Opponent: {opponent}</p>
        </div>
        
        <div className="timers">
          <div className={`timer ${currentPlayer === 'black' ? 'active' : ''}`}>
            Black: {formatTime(timer.black)}
          </div>
          <div className={`timer ${currentPlayer === 'white' ? 'active' : ''}`}>
            White: {formatTime(timer.white)}
          </div>
        </div>
      </div>

      <div className="chess-board">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${
                (rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'
              } ${
                selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              <span className="piece">{getPieceSymbol(piece)}</span>
            </div>
          ))
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
  )
}

export default ChessGame