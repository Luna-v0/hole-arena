# Quick Start: E2E Bot Game Test

This guide will help you run the end-to-end test for a complete bot game in under 5 minutes.

## Prerequisites

- Node.js (v18 or higher)
- Python 3.10+ with backend dependencies installed

## Step-by-Step

### 1. Install Dependencies (First Time Only)

```bash
# Install root dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Run the Test

Choose one of these options:

#### Option A: Default (Headless)
```bash
npm run test:e2e
```

#### Option B: Watch the Browser
```bash
npm run test:e2e:headed
```

#### Option C: Interactive UI Mode
```bash
npm run test:e2e:ui
```

#### Option D: Using the Helper Script
```bash
./run-e2e-tests.sh
```

### 3. View Results

After the test completes:

```bash
# Open the HTML report
npm run test:e2e:report
```

Screenshots are saved in `test-results/` directory.

## What the Test Does

1. ✅ Starts frontend (React + Vite) on port 5173
2. ✅ Starts backend (FastAPI) on port 8000
3. ✅ Opens browser and navigates to home page
4. ✅ Clicks "4 Bots (Random)" button
5. ✅ Waits for game to auto-start
6. ✅ Monitors game progress every second
7. ✅ Detects game completion
8. ✅ Validates game ended successfully
9. ✅ Captures final screenshot
10. ✅ Generates test report

## Expected Output

```
🎮 Starting 4-bot game test...
✓ Home page loaded
✓ Clicked "4 Bots (Random)" button
✓ Navigated to game page
⏳ Waiting for game to start...
✓ Game has started
⏳ Monitoring game progress...
⏳ Still playing... (iteration 10/500)
⏳ Still playing... (iteration 20/500)
...
✓ Game over detected at iteration 124
✓ Game completed successfully
📊 Game completed in 124 iterations (~124 seconds)
✓ Final screenshot saved
```

## Duration

- **Quick page load test**: ~10 seconds
- **2-bot game**: ~2-5 minutes
- **4-bot game**: ~5-10 minutes
- **Full test suite**: ~10-15 minutes

## Troubleshooting

### Backend fails to start

```bash
cd backend
pip install -r requirements.txt
# or
uv pip install -r requirements.txt
```

### Frontend fails to start

```bash
cd frontend
npm install
```

### Tests timeout

This is normal for the first run or if the game logic is slow. The test will:
- Wait up to 5 minutes for game completion
- Check game state every second
- Capture a screenshot if timeout occurs

### Port already in use

Stop any services running on ports 5173 or 8000:

```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

## Running Specific Tests

### Only the 4-bot game test:
```bash
npx playwright test -g "4-bot"
```

### Only the 2-bot game test:
```bash
npx playwright test -g "2-bot"
```

### Only the quick verification:
```bash
npx playwright test -g "page loads"
```

## Debugging

### See what's happening:
```bash
npm run test:e2e:headed
```

### Step through the test:
```bash
npm run test:e2e:debug
```

### Interactive mode:
```bash
npm run test:e2e:ui
```

## Next Steps

Once the test passes:

1. ✅ Your full stack is working correctly
2. ✅ Bot game logic is functioning
3. ✅ WebSocket communication is operational
4. ✅ Frontend-backend integration is solid

You can now:

- Add more test cases in `e2e/` directory
- Customize test behavior in `e2e/bot-game.spec.ts`
- Configure Playwright in `playwright.config.ts`
- Read full documentation in `E2E_TESTING.md`

## Help

- **Full documentation**: See [E2E_TESTING.md](./E2E_TESTING.md)
- **Test details**: See [e2e/README.md](./e2e/README.md)
- **Setup summary**: See [E2E_SETUP_SUMMARY.md](./E2E_SETUP_SUMMARY.md)

## Success!

If the test passes, you'll see:

```
✓ 1 passed (2m 34s)
```

And you can view the HTML report with screenshots showing the complete game!
