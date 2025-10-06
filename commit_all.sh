#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <commit_message>"
  exit 1
fi

COMMIT_MESSAGE="$1"

# Commit and push changes in the submodule
echo "Committing changes in submodule 'backend'..."
cd backend
git add .
git commit -m "$COMMIT_MESSAGE (submodule)"
git push origin main # Assuming 'main' is the branch for the submodule
cd ..

# Commit and push changes in the main repository
echo "Committing changes in main repository..."
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main # Assuming 'master' is the branch for the main repository

echo "Done."
