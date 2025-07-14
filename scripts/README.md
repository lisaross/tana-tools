# Publishing Scripts

## publish-helper.sh

This script helps exclude AI-related files (CLAUDE.md, .claude, etc.) from Raycast publishing.

### Usage

```bash
# Temporarily move AI files, publish, then restore
npm run safe-publish

# Or use the script directly:
./scripts/publish-helper.sh publish

# Manual operations:
./scripts/publish-helper.sh pre    # Move files before manual operations
./scripts/publish-helper.sh post   # Restore files after
```

### How it works

1. Before publishing, the script moves AI-related files to a system temporary directory
2. Runs `ray publish`
3. Automatically restores the files after publishing (even if interrupted)

### Files excluded

- CLAUDE.md
- .claude/
- .cursorrules
- .cursor/
- .github/copilot-instructions.md

This ensures these files are never included in the Raycast submission.