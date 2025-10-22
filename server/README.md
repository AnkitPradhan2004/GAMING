# AURA 999+ Betting Platform Backend

A complete Node.js backend for a real-time betting web application with Google OAuth, phone OTP authentication, wallet management, and live gaming features.

## Features

- **Authentication**: Google OAuth2 and Phone OTP login
- **User Management**: Profile management with wallet balance tracking
- **Wallet System**: Deposit and withdrawal functionality
- **Gaming Platform**: Real-time multiplayer betting games
- **Transaction Logs**: Complete audit trail for all financial operations
- **Admin Panel**: Platform management and statistics
- **Real-time Communication**: Socket.io for live gameplay
- **Security**: JWT authentication, rate limiting, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: Passport.js (Google OAuth), JWT, Twilio (OTP)
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. **Clone and navigate to the project**:
   ```bash
   cd "c:\\Masai Full Time\\Project\\Group Project\\GAMING\\server"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env` file and update with your credentials:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/aura999
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Twilio
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # App Settings
   CLIENT_URL=http://localhost:5173
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB** (make sure MongoDB is running on your system)

5. **Run the application**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Project Structure

```
server/
├── config/
│   ├── database.js      # MongoDB connection
│   ├── passport.js      # Passport configuration
│   └── socket.js        # Socket.io setup
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── betController.js
│   ├── gameController.js
│   ├── userController.js
│   └── walletController.js
├── middleware/
│   └── auth.js          # Authentication middleware
├── models/
│   ├── Game.js
│   ├── OTP.js
│   ├── Transaction.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── bets.js
│   ├── games.js
│   ├── users.js
│   └── wallet.js
├── utils/
│   ├── jwt.js           # JWT utilities
│   └── twilio.js        # SMS service
├── .env                 # Environment variables
├── server.js            # Main application file
└── package.json
```

## API Endpoints

### Authentication
- `GET /auth/google` - Google OAuth login
- `POST /auth/phone/send-otp` - Send OTP to phone
- `POST /auth/phone/verify-otp` - Verify OTP and login

### User Management
- `GET /users/me` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/transactions` - Get user transaction history

### Wallet Operations
- `POST /wallet/deposit` - Add money to wallet
- `POST /wallet/withdraw` - Withdraw money from wallet

### Gaming
- `GET /games` - List all active games
- `POST /games/join/:id` - Join a game
- `POST /games/create` - Create new game (admin)

### Betting
- `POST /bets/place` - Place a bet on active game
- `GET /bets/my-bets` - Get user's betting history

### Admin (Admin Only)
- `GET /admin/users` - Get all users
- `GET /admin/games` - Get all games
- `GET /admin/stats` - Get platform statistics
- `POST /admin/end-game` - End a game and declare winner

## Socket.io Events

### Client Events
- `join-game` - Join a game room
- `leave-game` - Leave a game room
- `game-action` - Send game action
- `start-game` - Start a game

### Server Events
- `game-joined` - Confirmation of joining game
- `player-joined` - New player joined notification
- `player-left` - Player left notification
- `game-update` - Real-time game state updates
- `game-started` - Game started notification

## Setup External Services

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`

### Twilio Setup
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number for SMS
4. Update environment variables

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Protected admin routes

## Database Models

### User
- Personal information (name, email, phone)
- Wallet balance and gaming statistics
- Authentication data (Google ID, phone verification)

### Game
- Game metadata and settings
- Player list with bet amounts
- Game status and winner tracking

### Transaction
- Complete financial audit trail
- Deposit, withdrawal, bet, win/loss records
- Game association for betting transactions

### OTP
- Temporary OTP storage for phone verification
- Auto-expiration after 5 minutes

## Development

```bash
# Install nodemon for development
npm install -g nodemon

# Run in development mode
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Set up MongoDB Atlas for cloud database
4. Configure proper CORS origins
5. Use HTTPS in production
6. Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.