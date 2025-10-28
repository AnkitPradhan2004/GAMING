# AURA 999+ Betting Platform - Complete Setup Guide

A complete full-stack betting web application with real-time chess gaming, authentication, wallet management, and customer support.

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud)

### 1. Backend Setup

```bash
# Navigate to server directory
cd "c:\\Masai Full Time\\Project\\Group Project\\GAMING\\server"

# Install dependencies
npm install

# Start MongoDB (if local)
mongod

# Create admin user
npm run create-admin

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to client directory
cd "c:\\Masai Full Time\\Project\\Group Project\\GAMING\\client"

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Required Environment Variables

### Server (.env file)

```env
# REQUIRED - Update these values
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aura999
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d

# App Settings
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 📋 Setup Checklist

### ✅ Required Services Setup

#### 1. MongoDB Setup

- [ ] **Local MongoDB**: Install and start `mongod` service
- [ ] **OR MongoDB Atlas**: Create cluster at https://cloud.mongodb.com/
- [ ] Update `MONGODB_URI` in .env file

#### 2. Twilio SMS Setup

- [ ] Sign up at [Twilio](https://www.twilio.com/)
- [ ] Verify your phone number
- [ ] Get Account SID and Auth Token from dashboard
- [ ] Purchase a phone number for SMS
- [ ] Update Twilio credentials in .env file

#### 3. JWT Secret

- [ ] Generate strong JWT secret (minimum 32 characters)
- [ ] Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 🎯 Application Features

#### Authentication System

- **Phone OTP Login**: SMS-based verification
- **JWT Tokens**: Secure session management
- **User Profiles**: Name, phone, wallet balance tracking

#### Chess Gaming Platform

- **Real-time Multiplayer**: Socket.io powered
- **Entry Fee System**: ₹100 to ₹50,000 betting options
- **Winner Takes 80%**: 20% platform commission
- **Room Codes**: Private game invitations
- **Proper Chess Rules**: Valid move validation

#### Wallet System

- **Deposits**: Add money to wallet
- **Withdrawals**: Cash out winnings
- **Transaction History**: Complete audit trail
- **Balance Validation**: Prevent insufficient fund bets

#### Customer Support

- **Live Chat Widget**: Real-time support
- **Quick Issues**: Pre-defined problem categories
- **Contact Fallback**: Phone number for complex issues
- **Auto-responses**: Context-aware replies

### 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000 (shows available endpoints)
- **Health Check**: http://localhost:3000/health

### 🎮 How to Play

1. **Register/Login**: Create account with email and password
2. **Add Funds**: Deposit money to wallet (mock system)
3. **Start Playing**: Click "Start Playing" button
4. **Select Entry Fee**: Choose from ₹100 to ₹50,000
5. **Wait for Opponent**: System matches players automatically
6. **Play Chess**: Real-time multiplayer chess game
7. **Win Prize**: Winner gets 80% of total pot

### 🔍 Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**

   - Ensure MongoDB is running: `mongod`
   - Check connection string in .env

2. **SMS OTP Not Sending**

   - Verify Twilio credentials
   - Check phone number format (+country code)
   - Ensure Twilio account has credits

3. **Socket.io Connection Issues**

   - Check if both frontend and backend are running
   - Verify CORS settings

4. **JWT Token Errors**
   - Ensure JWT_SECRET is set and long enough
   - Check token expiration settings

### 📱 Mobile Responsive

- All pages work on mobile devices
- Touch-friendly chess interface
- Responsive navigation and forms

### 🔒 Security Features

- Rate limiting (100 requests/15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- JWT-based authentication
- Password hashing with bcrypt

### 🎨 Design Theme

- **Colors**: Black (#000), Yellow (#FFD700), White (#FFF)
- **3D Effects**: Hover animations and depth
- **Modern UI**: Glass morphism and gradients
- **Consistent Branding**: Across all pages

## 📁 Project Structure

```
GAMING/
├── server/                 # Backend (Node.js + Express)
│   ├── config/
│   │   ├── database.js     # MongoDB connection
│   │   ├── passport.js     # Authentication config
│   │   └── socket.js       # Real-time chess logic
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & validation
│   ├── utils/             # JWT services
│   ├── scripts/           # Admin user creation
│   ├── .env              # Environment variables
│   └── server.js         # Main server file
│
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── ChessGame.jsx      # Real-time chess
│   │   │   └── CustomerChat.jsx   # Support chat
│   │   ├── pages/         # Main pages
│   │   │   ├── GamePage.jsx       # Game selection
│   │   │   ├── LoginPage.jsx      # Authentication
│   │   │   └── SignupPage.jsx     # Registration
│   │   ├── assets/        # Images and static files
│   │   └── App.jsx        # Main app component
│   └── package.json
```

## API Endpoints

### Authentication

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
- Authentication data (phone verification)

### Game

- Game metadata and settings
- Player list with bet amounts
- Game status and winner tracking

### Transaction

- Complete financial audit trail
- Deposit, withdrawal, bet, win/loss records
- Game association for betting transactions

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
