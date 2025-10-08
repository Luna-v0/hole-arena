# Debug Guide - Auto-Start Issues

## Overview

This guide explains the debugging additions and refactored logic to fix the duplicate game start requests.

## Changes Made

### 1. Frontend: `useGame.ts`

**Added comprehensive debug logging:**
- `[useGame] startGame called` - When function is invoked
- `[useGame] ⚠️ Game already started` - Duplicate call detected
- `[useGame] ⚠️ Start in progress` - Concurrent call detected
- `[useGame] ✓ Starting game` - Actually making API call
- `[useGame] ✓ Game started successfully` - Success
- `[useGame] ❌ Start failed` - Error with status code

**Refactored logic:**
- Added `startInProgressRef` to track concurrent requests
- Added `startedGamesRef` to track completed starts (persists across renders)
- Both checks prevent duplicate API calls to backend

### 2. Frontend: `Game.tsx`

**Added comprehensive debug logging:**
- `[Game] useEffect triggered` - Shows when effect runs and current state
- `[Game] Auto-start check` - Shows evaluation of conditions
- `[Game] ✓ Conditions met, attempting auto-start` - When triggering start

**Refactored logic:**
- Uses `hasAttemptedAutoStartRef` to ensure auto-start only happens ONCE
- Early exits:
  - If already attempted (prevents re-triggering)
  - If game already started (marks as attempted)
  - If not enough players or not all bots
- Only depends on `game_started` and `players.length` (not entire gameState)

### 3. Backend: `main.py`

**Added comprehensive debug logging:**
- `[START ENDPOINT] Request to start game` - When endpoint is hit
- Shows current game state (started, players, game_over)
- `[START ENDPOINT] ✓ Game started successfully` - Success
- `[START ENDPOINT] ❌ Failed to start game` - Failure with reason

## How to Debug

### Look for these patterns in console:

**Normal flow:**
```
[Game] useEffect triggered
[Game] Auto-start check: hasEnoughPlayers=true, allAreBots=true
[Game] ✓ Conditions met, attempting auto-start
[useGame] startGame called for gameId: xxx
[useGame] ✓ Starting game xxx
[useGame] Start response status: 200
[useGame] ✓ Game started successfully
```

**Backend logs:**
```
============================================================
[START ENDPOINT] Request to start game: xxx
[START ENDPOINT] Current game state:
  - game_started: False
  - players: 4
  - game_over: False
[START ENDPOINT] ✓ Game started successfully
  - Players: ['Bot 1', 'Bot 2', 'Bot 3', 'Bot 4']
[START ENDPOINT] ✓ Complete - game state broadcasted
============================================================
```

**Duplicate call detected (should not reach backend):**
```
[Game] Already attempted auto-start, returning
[useGame] ⚠️ Game xxx already started, ignoring duplicate call
```

**Wrong timing (game already started):**
```
[Game] Game already started, marking as attempted
```

## Protection Layers

1. **Game.tsx**: `hasAttemptedAutoStartRef` - Only attempt once per component instance
2. **useGame.ts**: `startedGamesRef` - Only make API call once per gameId
3. **useGame.ts**: `startInProgressRef` - Prevent concurrent requests
4. **Backend**: `game.game_started` check - Server-side validation

## Testing

Run a bot-only game and check console. You should see:
- ONE auto-start attempt in Game.tsx
- ONE API call in useGame.ts
- ONE backend endpoint hit
- NO 400 errors during gameplay
