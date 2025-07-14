#!/bin/bash

# Script to temporarily move AI-related files during Raycast publishing

TEMP_DIR=".ai-files-temp"
FILES_TO_MOVE=("CLAUDE.md" ".claude" ".cursorrules" ".cursor" ".github/copilot-instructions.md")

# Function to move files to temp directory
move_files() {
    echo "📦 Preparing for Raycast publish..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR"
    
    # Move AI-related files
    for file in "${FILES_TO_MOVE[@]}"; do
        if [ -e "$file" ]; then
            echo "Moving $file to temporary location..."
            # Create parent directories in temp if needed
            parent_dir=$(dirname "$file")
            if [ "$parent_dir" != "." ]; then
                mkdir -p "$TEMP_DIR/$parent_dir"
            fi
            mv "$file" "$TEMP_DIR/$file" 2>/dev/null
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
                mv "$TEMP_DIR/$file" "$file" 2>/dev/null
            fi
        done
        
        # Clean up temp directory
        rm -rf "$TEMP_DIR"
        echo "✅ Files restored"
    fi
}

# Trap to ensure files are restored even if script is interrupted
trap restore_files EXIT

# Main execution
case "$1" in
    "pre")
        move_files
        ;;
    "post")
        restore_files
        ;;
    "publish")
        move_files
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