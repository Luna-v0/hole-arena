## Frontend Game Logic Implementation

This document outlines the plan for implementing the frontend logic for the Buraco card game using React and PixiJS.

### Core Components

- **`Game`:** The main component that will render the game board and manage the game state.
- **`Player`:** A component to display a player's hand, melds, and score.
- **`Card`:** A component to represent a card, with dragging and dropping functionality.
- **`Meld`:** A component to display a meld of cards.
- **`Deck`:** A component to represent the deck and discard pile.

### Game Flow

The game flow will be managed by the `Game` component, which will communicate with the backend via WebSockets. The following events will be handled:

- **`player_joined`:** A new player has joined the game.
- **`game_started`:** The game has started.
- **`card_drawn`:** A player has drawn a card.
- **`card_melded`:** A player has melded cards.
- **`card_discarded`:** A player has discarded a card.
- **`pot_taken`:** A player has taken the pot.
- **`round_ended`:** The round has ended.
- **`game_ended`:** The game has ended.

### PixiJS Integration

PixiJS will be used to render the game board and the cards. This will allow for smooth animations and a more interactive user experience. The following features will be implemented using PixiJS:

- **Card rendering:** Cards will be rendered as sprites.
- **Drag and drop:** Players will be able to drag and drop cards to meld them or discard them.
- **Animations:** Animations will be used to show cards being drawn, melded, and discarded.

### State Management

The game state will be managed using React's built-in state management features (e.g., `useState`, `useReducer`). For more complex state management, a library like Redux or Zustand may be used.
