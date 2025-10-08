# End-to-End Testing Setup

This document describes the end-to-end (e2e) testing infrastructure for the Buraco card game project using Playwright.

## Overview

The e2e testing setup validates the complete application stack:

- **Frontend**: React application with PixiJS rendering
- **Backend**: FastAPI server with WebSocket support
- **Game Logic**: Complete bot games from start to finish
- **Integration**: Frontend-backend communication via REST API and WebSockets

## Architecture

```
┌─────────────────────────────────────────┐
│         Playwright Test Runner          │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Frontend   │◄───┤   Backend    │
│   (Vite)     │───►│   (FastAPI)  │
│  Port 5173   │    │  Port 8000   │
└──────────────┘    └──────────────┘
        │                   │
        ▼                   ▼
   React + PixiJS    Game Logic + Bots
```

## Project Structure

```
hole_arena/
├── e2e/                          # E2E test files
│   ├── bot-game.spec.ts          # Bot game tests
│   └── README.md                 # Test documentation
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Root package with test scripts
├── run-e2e-tests.sh              # Convenient test runner script
├── test-results/                 # Test output (screenshots, traces)
├── frontend/                     # Frontend application
│   └── package.json              # Frontend dependencies
└── backend/                      # Backend application
    └── main.py                   # FastAPI application
```

## Installation

### 1. Install Dependencies

```bash
# Install frontend dependencies (includes Playwright)
cd frontend
npm install

# Install root dependencies (for e2e tests)
cd ..
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers for testing.

## Running Tests

### Quick Start

```bash
# Run all e2e tests
npm run test:e2e
```

### Test Modes

The project provides several test modes through npm scripts and the helper script:

#### Using npm scripts:

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed

# Run tests in debug mode (step-by-step)
npm run test:e2e:debug

# Show test report from last run
npm run test:e2e:report
```

#### Using the helper script:

```bash
# Default mode
./run-e2e-tests.sh

# Headed mode (see browser)
./run-e2e-tests.sh headed

# UI mode (interactive)
./run-e2e-tests.sh ui

# Debug mode
./run-e2e-tests.sh debug

# Run only 4-bot game test
./run-e2e-tests.sh 4bot

# Run only 2-bot game test
./run-e2e-tests.sh 2bot

# Quick page load verification
./run-e2e-tests.sh quick

# Show test report
./run-e2e-tests.sh report
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/bot-game.spec.ts

# Run tests matching a pattern
npx playwright test -g "4-bot"

# Run with specific browser
npx playwright test --project=chromium
```

## Test Cases

### 1. Complete 4-Bot Game (`bot-game.spec.ts`)

Tests a full game with 4 bot players:

- Creates a game with 4 random bots
- Waits for game to auto-start
- Monitors game progress
- Waits for game completion (up to 5 minutes)
- Validates game ended successfully
- Captures screenshots

**Expected duration**: ~5-10 minutes

### 2. Complete 2-Bot Game

Tests a full game with 2 bot players:

- Creates a 1v1 bot game
- Validates game flow
- Waits for completion

**Expected duration**: ~2-5 minutes

### 3. Game Page Load Verification

Quick test to verify the game page loads correctly:

- Creates a bot game
- Validates page structure
- Checks for game elements

**Expected duration**: ~10 seconds

## Configuration

### Playwright Configuration (`playwright.config.ts`)

Key settings:

```typescript
{
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:5173',
    },
    {
      command: 'cd backend && uvicorn main:app --reload',
      url: 'http://localhost:8000',
    },
  ],
}
```

**Features**:
- Auto-starts frontend and backend servers
- Captures traces on retry
- Screenshots on failure
- Configurable timeouts

## Test Output

### Screenshots

Screenshots are saved in `test-results/` directory:

- `bot-game-timeout.png` - Captured if test times out
- `bot-game-final.png` - Captured on successful completion
- `2bot-game-final.png` - Captured for 2-bot game

### Test Reports

HTML reports are generated automatically:

```bash
# View the report
npm run test:e2e:report
```

The report includes:
- Test results
- Screenshots
- Traces (for failed tests)
- Performance metrics

### Traces

Traces are captured on first retry and can be viewed:

```bash
npx playwright show-trace trace.zip
```

Traces provide:
- Step-by-step execution
- Network requests
- Console logs
- Screenshots at each step
- DOM snapshots

## Debugging

### 1. Headed Mode

See the browser while tests run:

```bash
npm run test:e2e:headed
```

### 2. Debug Mode

Step through tests with Playwright Inspector:

```bash
npm run test:e2e:debug
```

### 3. UI Mode

Interactive test runner:

```bash
npm run test:e2e:ui
```

Features:
- Watch mode
- Time travel debugging
- Pick locators
- View traces

### 4. Console Logs

Tests output detailed console logs:

```
🎮 Starting 4-bot game test...
✓ Home page loaded
✓ Clicked "4 Bots (Random)" button
✓ Navigated to game page
⏳ Waiting for game to start...
✓ Game has started
⏳ Monitoring game progress...
⏳ Still playing... (iteration 10/500)
✓ Game over detected at iteration 124
✓ Game completed successfully
📊 Game completed in 124 iterations (~124 seconds)
```

### 5. Common Issues

#### Backend not starting

```bash
cd backend
uv pip install -r requirements.txt
```

#### Frontend not starting

```bash
cd frontend
npm install
```

#### Port conflicts

Stop services using ports 5173 or 8000, or modify `playwright.config.ts`.

#### Tests timing out

- Check backend logs for errors
- Verify bot logic is working
- Run in headed mode to observe
- Increase timeout in test file

#### Browser installation issues

```bash
npx playwright install --with-deps
```

## Continuous Integration

### GitHub Actions

The tests can be integrated into CI/CD pipelines:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install
          cd ../backend && pip install -r requirements.txt
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Writing Tests

1. **Use descriptive test names**:
   ```typescript
   test('should play a complete 4-bot game until the end', async ({ page }) => {
   ```

2. **Set appropriate timeouts**:
   ```typescript
   test.setTimeout(300000); // 5 minutes for long-running tests
   ```

3. **Add console logging**:
   ```typescript
   console.log('✓ Game has started');
   ```

4. **Capture screenshots on important states**:
   ```typescript
   await page.screenshot({ path: 'test-results/final.png' });
   ```

5. **Use reliable selectors**:
   ```typescript
   // Prefer data-testid
   page.locator('[data-testid="game-board"]')

   // Or text content
   page.locator('button', { hasText: '4 Bots' })
   ```

### Test Organization

1. Group related tests in `describe` blocks
2. Use `beforeEach` for common setup
3. Clean up test data in `afterEach`
4. Keep tests independent and isolated

## Performance

### Test Execution Time

| Test | Expected Duration |
|------|------------------|
| Quick verification | ~10 seconds |
| 2-bot game | ~2-5 minutes |
| 4-bot game | ~5-10 minutes |
| Full suite | ~10-15 minutes |

### Optimization Tips

1. **Run tests in parallel** (configure workers in `playwright.config.ts`)
2. **Use test sharding** for CI environments
3. **Skip unnecessary waits** with proper selectors
4. **Reuse server instances** with `reuseExistingServer: true`

## Extending the Tests

### Adding New Test Suites

1. Create a new file in `e2e/` directory:
   ```bash
   touch e2e/my-feature.spec.ts
   ```

2. Import test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```

3. Write tests following existing patterns
4. Add documentation to `e2e/README.md`

### Testing Human vs Bot Games

```typescript
test('should allow human player to join bot game', async ({ page }) => {
  await page.goto('/');

  // Create custom game
  await page.click('button:has-text("Custom")');

  // Configure game
  await page.selectOption('[name="humanPlayers"]', '1');
  // Add bots...

  // Join as human
  await page.click('button:has-text("Start Game")');
  // ...
});
```

### Testing Multiplayer

For testing multiple human players, use multiple browser contexts:

```typescript
test('should support multiple players', async ({ browser }) => {
  const player1 = await browser.newContext();
  const player2 = await browser.newContext();

  const page1 = await player1.newPage();
  const page2 = await player2.newPage();

  // Both players join the same game...
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Support

For issues or questions:

1. Check the [Playwright Documentation](https://playwright.dev)
2. Review test output and screenshots in `test-results/`
3. Run tests in debug mode for detailed inspection
4. Check backend logs for API errors
5. Consult `e2e/README.md` for detailed test documentation
