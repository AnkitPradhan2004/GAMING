# AURA 999+ Betting Platform API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication Routes

#### Register User

```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login User

```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### User Routes

#### Get Current User

```
GET /users/me
Authorization: Bearer <token>
```

#### Update Profile

```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "bankAccountNumber": "1234567890"
}
```

#### Get User Transactions

```
GET /users/transactions
Authorization: Bearer <token>
```

### Wallet Routes

#### Deposit Money

```
POST /wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100
}
```

#### Withdraw Money

```
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50
}
```

### Game Routes

#### Get All Games

```
GET /games
Authorization: Bearer <token>
```

#### Join Game

```
POST /games/join/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "betAmount": 10
}
```

#### Create Game (Admin Only)

```
POST /games/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Game Title",
  "minBetAmount": 5,
  "maxPlayers": 10
}
```

### Bet Routes

#### Place Bet

```
POST /bets/place
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "game_id_here",
  "betAmount": 20
}
```

#### Get User Bets

```
GET /bets/my-bets
Authorization: Bearer <token>
```

### Admin Routes (Admin Only)

#### Get All Users

```
GET /admin/users
Authorization: Bearer <token>
```

#### Get All Games

```
GET /admin/games
Authorization: Bearer <token>
```

#### Get Platform Statistics

```
GET /admin/stats
Authorization: Bearer <token>
```

#### End Game

```
POST /admin/end-game
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "game_id_here",
  "winnerId": "winner_user_id" (optional)
}
```

## Socket.io Events

### Client to Server Events

#### Join Game Room

```javascript
socket.emit("join-game", gameId);
```

#### Leave Game Room

```javascript
socket.emit("leave-game", gameId);
```

#### Game Action

```javascript
socket.emit("game-action", {
  gameId: "game_id",
  action: "action_type",
  payload: {
    /* action data */
  },
});
```

#### Start Game

```javascript
socket.emit("start-game", gameId);
```

### Server to Client Events

#### Game Joined

```javascript
socket.on("game-joined", (game) => {
  // Handle game joined
});
```

#### Player Joined

```javascript
socket.on("player-joined", (player) => {
  // Handle new player joined
});
```

#### Player Left

```javascript
socket.on("player-left", (player) => {
  // Handle player left
});
```

#### Game Update

```javascript
socket.on("game-update", (update) => {
  // Handle game state update
});
```

#### Game Started

```javascript
socket.on("game-started", (game) => {
  // Handle game started
});
```

#### Error

```javascript
socket.on("error", (message) => {
  // Handle error
});
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
