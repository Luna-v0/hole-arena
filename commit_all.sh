#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <commit_message>"
  exit 1
fi

COMMIT_MESSAGE="$1"

# Commit changes in the submodule
echo "Committing changes in submodule 'backend'..."
cd backend
git add .
git commit -m "$COMMIT_MESSAGE (submodule)"
cd ..

# Commit changes in the main repository
echo "Committing changes in main repository..."
git add .
git commit -m "$COMMIT_MESSAGE"

echo "Done."
