# Frontend-Backend Integration Guide

This document outlines how the frontend client should interact with the Buraco backend API.

## Base URL

The backend server runs on `http://localhost:8000` by default.

## Game Flow

A typical game session follows these steps:

1.  **Player 1 Creates a Game**: Player 1's client sends a request to `POST /games` to create a new game room.
2.  **Share Game ID**: The backend responds with the initial `GameState`, which includes a unique `game_id`. This ID must be shared with Player 2.
3.  **Player 2 Joins the Game**: Player 2's client uses the `game_id` to join the game by sending a request to `POST /games/{game_id}/join`.
4.  **Establish WebSocket Connection**: Both players connect to the WebSocket at `ws://localhost:8000/ws/{game_id}` to receive real-time updates.
5.  **Start the Game**: Once both players have joined, one of the clients sends a request to `POST /games/{game_id}/start`. The backend deals the cards and sends the updated game state to all clients via the WebSocket.
6.  **Play the Game**: Players send game actions (draw, meld, discard) through the WebSocket and receive game state updates from the server.

---

## REST API Endpoints

### 1. Create Game

-   **Endpoint**: `POST /games`
-   **Description**: Creates a new game session.
-   **Response Body**: The initial `GameState` object.

    ```json
    {
      "game_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "players": [],
      "deck": { "cards": [/* 108 card objects */] },
      "discard_pile": [],
      "pots": [],
      "current_turn_player_index": 0,
      "game_started": false
    }
    ```

### 2. Get Game State

-   **Endpoint**: `GET /games/{game_id}`
-   **Description**: Retrieves the current state of a specific game.
-   **Response Body**: The `GameState` object.

### 3. Join Game

-   **Endpoint**: `POST /games/{game_id}/join`
-   **Description**: Adds a player to a game.
-   **Request Body**:

    ```json
    {
      "player_name": "string"
    }
    ```

-   **Response Body**: The `Player` object that was created.

    ```json
    {
      "name": "Player 2",
      "hand": [],
      "melds": [],
      "score": 0
    }
    ```

### 4. Start Game

-   **Endpoint**: `POST /games/{game_id}/start`
-   **Description**: Starts the game. This should only be called when two players have joined.
-   **Response Body**: The `GameState` object after cards have been dealt.

---

## WebSocket Communication

### Connecting

-   **Endpoint**: `ws://localhost:8000/ws/{game_id}`

Once connected, the client will receive real-time updates about the game state.

### Receiving Messages

The server will broadcast JSON-formatted messages to all clients in a game. The frontend should listen for these messages and update the UI accordingly. While the specific message types for game actions are yet to be finalized, you can expect messages for player connections and disconnections.

**Example Messages from Server:**

```json
{
  "type": "player_joined",
  "payload": {
    "player_name": "Player 2"
  }
}
```

```json
{
  "type": "game_started",
  "payload": { /* The full GameState object */ }
}
```

### Sending Messages

The client sends messages to the server to perform game actions. All messages from the client should be a JSON string with an `action` and a `payload`.

**Example Client Messages:**

-   **Draw a card from the deck:**

    ```json
    {
      "action": "DRAW_FROM_DECK"
    }
    ```

-   **Take the discard pile:**

    ```json
    {
      "action": "TAKE_DISCARD_PILE"
    }
    ```

-   **Discard a card:**

    ```json
    {
      "action": "DISCARD_CARD",
      "payload": {
        "card": { "rank": "ACE", "suit": "SPADES" }
      }
    }
    ```

-   **Create a new meld:**

    ```json
    {
      "action": "CREATE_MELD",
      "payload": {
        "cards": [
          { "rank": "KING", "suit": "HEARTS" },
          { "rank": "QUEEN", "suit": "HEARTS" },
          { "rank": "JACK", "suit": "HEARTS" }
        ]
      }
    }
    ```

---

## CORS Configuration

For security, the backend enforces a Cross-Origin Resource Sharing (CORS) policy. The API will only accept requests from whitelisted origins.

During development, the frontend client running on `http://localhost:5173` is permitted. If you are running the frontend on a different address, you may need to update the backend's CORS configuration in `backend/main.py`.

---

## Match Configuration

To provide a more flexible way of creating games, especially for testing and simulation with AI agents, a new endpoint is introduced to create a game with a specific configuration of human and bot players.

### Create Configured Game

-   **Endpoint**: `POST /games/create_configured`
-   **Description**: Creates a new game with a specified number of human and bot players (2 or 4 players in total).
-   **Request Body**:

    ```json
    {
      "human_players": 0,
      "bot_players": [
        {
          "name": "Bot1",
          "algorithm": "random"
        },
        {
          "name": "Bot2",
          "algorithm": "random"
        },
        {
          "name": "Bot3",
          "algorithm": "random"
        },
        {
          "name": "Bot4",
          "algorithm": "random"
        }
      ]
    }
    ```

-   **Response Body**: The initial `GameState` object.

### Bot Factory

To support different bot algorithms, a factory pattern is used on the backend. The `algorithm` field in the bot configuration determines which type of bot to create.

Currently, the only supported algorithm is `"random"`.

This design allows for easy extension with new bot algorithms in the future without changing the API. For example, to add a bot with a new "smart" algorithm, you would add a new entry to the bot factory on the backend and then create a game with a following configuration:

```json
{
  "human_players": 1,
  "bot_players": [
    {
      "name": "SmartBot1",
      "algorithm": "smart"
    }
  ]
}
```

