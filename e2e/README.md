# End-to-End Tests

This directory contains end-to-end tests for the Buraco game using Playwright.

## Overview

The e2e tests validate the entire application stack, from the frontend React application to the backend FastAPI server, including:

- Game creation and configuration
- Bot player functionality
- WebSocket real-time communication
- Complete game flow from start to finish

## Test Structure

### `bot-game.spec.ts`

Tests complete bot games from creation to completion:

- **4-bot game**: Tests a full game with 4 bot players
- **2-bot game**: Tests a full game with 2 bot players
- **Game page load**: Verifies the game page loads correctly

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js** installed (v18 or higher)
2. **Python** environment set up for the backend
3. **Dependencies installed**:
   ```bash
   # Install frontend dependencies
   cd frontend && npm install

   # Install backend dependencies (using uv or pip)
   cd backend
   uv pip install -r requirements.txt
   ```

4. **Playwright browsers installed**:
   ```bash
   npx playwright install
   ```

## Running Tests

### From the root directory:

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### Run specific test files:

```bash
npx playwright test bot-game.spec.ts
```

### Run specific test cases:

```bash
npx playwright test -g "4-bot game"
```

## Configuration

The Playwright configuration is located at `../playwright.config.ts` in the root directory.

Key configuration details:

- **Frontend URL**: `http://localhost:5173`
- **Backend URL**: `http://localhost:8000`
- **Timeout**: 5 minutes for bot game tests
- **Auto-start servers**: Both frontend and backend are automatically started when running tests

## Test Behavior

### Bot Game Tests

The bot game tests:

1. Navigate to the home page
2. Click the appropriate preset button (e.g., "4 Bots (Random)")
3. Wait for the game to load and auto-start
4. Monitor the game state periodically
5. Wait for game completion (detected by "game over" indicators)
6. Validate that the game completed successfully
7. Capture screenshots for debugging

**Expected duration**:
- 2-bot game: ~2-5 minutes
- 4-bot game: ~5-10 minutes (can vary significantly based on game complexity)

### Test Timeouts

- Individual test timeout: 5 minutes (300000ms)
- Maximum iterations: 500 checks at 1-second intervals
- If a game doesn't complete within this time, the test will fail and capture a screenshot

## Debugging

### View test traces:

```bash
npx playwright show-trace trace.zip
```

### Screenshots

Failed tests automatically capture screenshots in:
- `test-results/bot-game-timeout.png` (if timeout occurs)
- `test-results/bot-game-final.png` (successful completion)

### Headed mode

To watch the tests run in a browser:

```bash
npm run test:e2e:headed
```

### Debug mode

To step through tests:

```bash
npm run test:e2e:debug
```

## Continuous Integration

The tests are configured to run in CI environments with:

- Retry on failure (2 retries)
- No parallel execution for stability
- Required server startup
- HTML report generation

## Troubleshooting

### Backend not starting

Ensure the backend dependencies are installed:

```bash
cd backend
uv pip install -r requirements.txt
```

### Frontend not starting

Ensure frontend dependencies are installed:

```bash
cd frontend
npm install
```

### Port conflicts

If ports 5173 or 8000 are in use:
1. Stop other services using these ports
2. Or modify the `playwright.config.ts` to use different ports

### Tests timing out

If tests consistently timeout:
1. Check backend logs for errors
2. Verify bot logic is functioning correctly
3. Increase timeout in test files or config
4. Run in headed mode to observe the game

### Missing browser binaries

If you see browser-related errors:

```bash
npx playwright install
```

## Adding New Tests

To add new e2e tests:

1. Create a new `.spec.ts` file in this directory
2. Import test utilities: `import { test, expect } from '@playwright/test';`
3. Write test cases following the existing patterns
4. Use descriptive test names and add console logging for debugging
5. Set appropriate timeouts for long-running tests

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
