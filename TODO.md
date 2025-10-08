# TODO List

## ✅ Completed

### 1. ✅ Fix React Key Warning - Meld ID is undefined
- **Issue**: Keys showed `player-id-undefined` because frontend used `meld.id` but backend sent `meld_id`
- **Fix**: Updated frontend TypeScript types to use `meld_id` instead of `id`
- **Files Changed**:
  - `frontend/src/types/index.ts` - Changed Meld type
  - `frontend/src/components/Game.tsx` - Updated to use `meld.meld_id`
  - `frontend/src/components/Meld.tsx` - Updated to use `meld.meld_id`

### 2. ✅ Fix Duplicate Game Start Requests
- **Issue**: Game start was being called multiple times causing 400 errors
- **Fix**: Added ref guard in `useGame` hook to prevent duplicate calls
- **Files Changed**:
  - `frontend/src/hooks/useGame.ts:45-62` - Added `startGameRef`
  - `frontend/src/components/Game.tsx:24-33` - Simplified useEffect dependencies

### 3. ✅ Create 4-Bot Game Integration Test
- **Task**: Created pytest tests for bot games via REST API
- **Location**: `backend/tests/test_api_bot_game.py`
- **Tests**:
  - `test_create_and_play_4bot_game` - Creates 4-bot game
  - `test_create_2bot_game` - Creates 2-bot game
  - `test_invalid_bot_count` - Validates error handling
- **Status**: All tests passing ✅

### 4. ✅ Fix Backend Endpoint Type Mismatch
- **Issue**: `/games/create_and_start_bot_game` had type mismatch between request model and game creation
- **Fix**: Updated endpoint to properly convert int to list of BotPlayer configs
- **File**: `backend/main.py:71-98`

### 5. ✅ Fix Game Rules Misalignment with INSTRUCTIONS.md
- **Issue 1**: Code allowed "sets" (same rank, different suits) but rules only specify "sequences" (same suit, sequential order)
- **Fix 1**: Removed set validation logic, only allow sequences
- **File**: `backend/buraco/game.py:386-402`

- **Issue 2**: Pots were taken during draw phase when hand was empty, but rules say they should be taken after discarding last card
- **Fix 2**: Moved pot-taking logic from `draw_card_from_deck` to `discard_card`
- **Files**: `backend/buraco/game.py:264-291`, `backend/buraco/game.py:313-346`

- **Issue 3**: Existing tests didn't pass mock ws_manager to GameManager
- **Fix 3**: Updated test setup to use Mock ws_manager
- **File**: `backend/tests/test_game.py`

**All tests passing** ✅

## ✅ Completed (Latest)

### 6. ✅ Fix RandomBot to Only Generate Sequences
- **Issue**: RandomBot was trying to create sets (same rank, different suits) which are now invalid
- **Root Cause**: Bot had its own `_is_valid_meld` that allowed sets, but game rules were updated to only allow sequences
- **Fix**:
  - Removed set-creation logic from `_meld_phase`
  - Updated to only search for sequences (same suit, consecutive ranks)
  - Removed set validation from `_is_valid_meld`
- **Files**: `backend/buraco/bots/random_bot.py`

### 7. ✅ Add Comprehensive Debug Logging
- **Frontend**: Added detailed logging in `useGame.ts` and `Game.tsx` to trace auto-start calls
- **Backend**: Added detailed logging in `main.py` start endpoint
- **Created**: `DEBUG_GUIDE.md` with explanation of all logging
- **Files**:
  - `frontend/src/hooks/useGame.ts`
  - `frontend/src/components/Game.tsx`
  - `backend/main.py`
  - `DEBUG_GUIDE.md`

## 🔧 Technical Debt

### 8. Graceful Handling of Invalid Actions
- **Priority**: High
- **Issue**: Game can break if a bot or player attempts an invalid action
- **Current Behavior**: Raises ValueError which stops the game
- **Desired Behavior**:
  - Log the invalid action attempt
  - Continue the game without executing the action
  - Return error to client via WebSocket
  - For bots: Skip the invalid action and continue turn
- **Files to Update**:
  - `backend/buraco/game.py` - Add try/catch around action validation
  - `backend/main.py` - WebSocket handler should catch and handle errors gracefully
  - `backend/buraco/bots/random_bot.py` - Ensure bot generates valid actions

### 9. Review Game Ending Logic
- Ensure game doesn't end prematurely
- ✅ Pot mechanics now follow rules correctly
- Validate Buraco (7-card meld) detection

### 7. Improve Error Handling
- Better WebSocket error messages
- Frontend should display backend validation errors to user

### 8. Enable Full Bot Game Completion
- Currently bot turns only auto-play via WebSocket
- Consider adding a background task or polling mechanism for pure bot games
- Would allow REST API to fully complete bot-only games
