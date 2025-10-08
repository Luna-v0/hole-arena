#!/bin/bash

# Script to run end-to-end tests for Buraco game
# This script provides a convenient way to run different test configurations

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Buraco E2E Test Runner ===${NC}\n"

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx not found. Please install Node.js${NC}"
    exit 1
fi

# Parse command line arguments
TEST_MODE=${1:-"default"}

case $TEST_MODE in
    "default")
        echo -e "${YELLOW}Running tests in default mode...${NC}"
        npm run test:e2e
        ;;
    "headed")
        echo -e "${YELLOW}Running tests in headed mode (visible browser)...${NC}"
        npm run test:e2e:headed
        ;;
    "ui")
        echo -e "${YELLOW}Running tests in UI mode (interactive)...${NC}"
        npm run test:e2e:ui
        ;;
    "debug")
        echo -e "${YELLOW}Running tests in debug mode...${NC}"
        npm run test:e2e:debug
        ;;
    "report")
        echo -e "${YELLOW}Showing test report...${NC}"
        npm run test:e2e:report
        ;;
    "4bot")
        echo -e "${YELLOW}Running 4-bot game test only...${NC}"
        npx playwright test -g "4-bot"
        ;;
    "2bot")
        echo -e "${YELLOW}Running 2-bot game test only...${NC}"
        npx playwright test -g "2-bot"
        ;;
    "quick")
        echo -e "${YELLOW}Running quick verification test...${NC}"
        npx playwright test -g "game page loads"
        ;;
    *)
        echo -e "${RED}Unknown test mode: $TEST_MODE${NC}"
        echo ""
        echo "Usage: $0 [mode]"
        echo ""
        echo "Available modes:"
        echo "  default  - Run all tests (default)"
        echo "  headed   - Run tests with visible browser"
        echo "  ui       - Run tests in interactive UI mode"
        echo "  debug    - Run tests in debug mode"
        echo "  report   - Show test report from last run"
        echo "  4bot     - Run only the 4-bot game test"
        echo "  2bot     - Run only the 2-bot game test"
        echo "  quick    - Run quick page load verification"
        echo ""
        exit 1
        ;;
esac

echo -e "\n${GREEN}Test execution completed!${NC}"
