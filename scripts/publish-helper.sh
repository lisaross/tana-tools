#!/usr/bin/env bash

# Script to temporarily move AI-related files during Raycast publishing

# Defensive shell options
set -euo pipefail

# Use system temp directory
TEMP_DIR=$(mktemp -d -t raycast-publish-XXXXXX)
FILES_TO_MOVE=("CLAUDE.md" ".claude" ".cursorrules" ".cursor" ".github/copilot-instructions.md")

# Function to move files to temp directory
move_files() {
    echo "📦 Preparing for Raycast publish..."
    echo "📁 Using temp directory: $TEMP_DIR"
    
    # Move AI-related files
    for file in "${FILES_TO_MOVE[@]}"; do
        if [ -e "$file" ]; then
            echo "Moving $file to temporary location..."
            # Create parent directories in temp if needed
            parent_dir=$(dirname "$file")
            if [ "$parent_dir" != "." ]; then
                mkdir -p "$TEMP_DIR/$parent_dir"
            fi
            mv "$file" "$TEMP_DIR/$file"
        fi
    done
    
    echo "✅ Files temporarily moved"
}

# Function to restore files
restore_files() {
    echo "🔄 Restoring files..."
    
    if [ -d "$TEMP_DIR" ]; then
        # Restore all files
        for file in "${FILES_TO_MOVE[@]}"; do
            if [ -e "$TEMP_DIR/$file" ]; then
                echo "Restoring $file..."
                mv "$TEMP_DIR/$file" "$file"
            fi
        done
        
        # Clean up temp directory
        rm -rf "$TEMP_DIR"
        echo "✅ Files restored"
    fi
}

# Variable to track if we should restore files
SHOULD_RESTORE=0

# Function to handle cleanup
cleanup() {
    if [ $SHOULD_RESTORE -eq 1 ]; then
        restore_files
    fi
}

# Trap to ensure files are restored even if script is interrupted
trap cleanup EXIT

# Main execution
case "$1" in
    "pre")
        move_files
        SHOULD_RESTORE=1
        ;;
    "post")
        SHOULD_RESTORE=1
        restore_files
        ;;
    "publish")
        move_files
        SHOULD_RESTORE=1
        echo "🚀 Running ray publish..."
        ray publish
        # Files will be restored by trap on exit
        ;;
    *)
        echo "Usage: $0 {pre|post|publish}"
        echo "  pre     - Move AI files to temp location"
        echo "  post    - Restore AI files from temp location"
        echo "  publish - Move files, run ray publish, then restore"
        exit 1
        ;;
esac