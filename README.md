# Hole Arena

Hole (or 'Buraco' in Portuguese) is a popular card game in Brazil, typically played with four players in two teams.

## Project Structure

- **`backend/`**: FastAPI server with game logic and bot AI
- **`frontend/`**: React + PixiJS web application
- **`e2e/`**: End-to-end tests using Playwright

## Getting Started

### Running the Application

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
uvicorn main:app --reload
```

### Running Tests

**End-to-End Tests:**
```bash
# Install dependencies
npm install
npx playwright install

# Run all e2e tests
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui
```

**Backend Tests:**
```bash
cd backend
pytest
```

## Documentation

- **[E2E_TESTING.md](./E2E_TESTING.md)**: Comprehensive e2e testing guide
- **[E2E_SETUP_SUMMARY.md](./E2E_SETUP_SUMMARY.md)**: Quick e2e setup reference
- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**: Game rules
- **[GEMINI.md](./GEMINI.md)**: Project implementation guidance

