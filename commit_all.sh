#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <commit_message>"
  exit 1
fi

COMMIT_MESSAGE="$1"

# Commit and push changes in the submodule
if [ -d "backend" ]; then
  echo "Committing changes in submodule 'backend'..."
  rm -f /mnt/hdd1/Repos/hole_arena/.git/modules/backend/index.lock
  cd backend
  git add .
  git commit -m "$COMMIT_MESSAGE"
  git push origin main # Assuming 'main' is the branch for the submodule
  cd ..
else
  echo "Backend directory not found. Skipping submodule commit."
fi

# Update the submodule reference in the main repository
echo "Updating submodule reference..."
git submodule update --remote

# Commit and push changes in the main repository
echo "Committing changes in main repository..."
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main # Assuming 'main' is the branch for the main repository

echo "Done."
