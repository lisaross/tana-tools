# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tana Tools is a Raycast extension that converts web pages, YouTube videos, and text content into Tana Paste format. It's designed for users of Tana (a knowledge management tool) to quickly capture and format content from various sources.

## Commands

```bash
# Development with hot reload
ray develop

# Build the extension
ray build -e dist

# Run linting
ray lint

# Publish to Raycast store (excludes AI files)
npm run safe-publish

# Or direct publish without exclusions
npm run ray-publish
```

## Architecture

### Core Components

1. **Commands** (`/src/Commands/`): Each Raycast command is a separate TSX file
   - No-view commands: Execute immediately without UI
   - View commands: Show Raycast UI for user interaction

2. **Tana Formatter** (`/src/utils/tana-formatter/`): Core formatting logic
   - `content-detection.ts`: Identifies content types (YouTube, Limitless, web pages)
   - `content-processing.ts`: Processes different content types into Tana format
   - `field-formatting.ts`: Handles field formatting with user preferences
   - `transcript-chunking.ts`: Splits long content into 7000-character chunks
   - `youtube-transcript-cleaner.ts`: Cleans YouTube transcript formatting

3. **Page Content Extractor** (`/src/utils/page-content-extractor.ts`): Handles web page extraction using Raycast Browser Extension

### Data Flow

1. User triggers command → 
2. Content is detected/extracted → 
3. Processed through appropriate formatter → 
4. Converted to Tana Paste format → 
5. Copied to clipboard → 
6. Tana app opens (if configured)

## Key Technical Constraints

1. **Toast Notifications**: When using Raycast Toast API, put user-visible messages in the `title` field (not `message` which only shows in console)

2. **Chunk Size**: Long content is split into 7000-character chunks to respect Tana's paste limits

3. **Browser Extension**: Web-based commands require Raycast Browser Extension to be installed

4. **YouTube Transcripts**: Users must click "Show transcript" on YouTube before using the YouTube to Tana command

5. **User Preferences**: The extension reads user preferences for custom tags and field names - always use the preference values, not hardcoded strings

## Code Standards

- TypeScript strict mode enabled
- ESLint with Raycast configuration
- React JSX for UI components
- ES2020 target with ESM modules
- Always run `ray lint` before committing changes

## When Building Features

1. Check user preferences for field names and tags - don't hardcode them
2. Use the existing utility functions in `/src/utils/tana-formatter/`
3. Handle errors gracefully with user-friendly Toast notifications
4. For new commands, decide between no-view (immediate execution) and view (with UI) modes
5. Test with various content types: YouTube videos, web pages, Limitless transcripts, and plain text

## Raycast Extension Development Guidelines

### TypeScript Requirements
- Use TypeScript exclusively (no JavaScript files)
- Strict mode is enabled - maintain type safety
- Import types from `@raycast/api`
- Avoid `any` types - use proper type definitions
- Use React types for components

### Raycast API Best Practices
- Import all components from `@raycast/api`
- Use built-in components: List, Detail, Form, Grid, etc.
- Implement proper error handling with `showToast()`
- Use `LocalStorage` API for persistence
- Implement loading states with `isLoading` prop
- Add keyboard shortcuts using `ActionPanel` and `Action` components
- Use `useNavigation()` for navigation between views

### Code Style & Structure
- Use async/await over promises
- Destructure imports from `@raycast/api`
- Keep commands focused - single responsibility principle
- Add JSDoc comments for complex functions
- Organize related utilities in separate files
- Use early returns to reduce nesting

### Performance Guidelines
- Commands should load in < 1 second
- Minimize API calls - implement caching where appropriate
- Use pagination for lists with many items
- Debounce search inputs (use `useCachedPromise` or `useFetch`)
- Lazy load heavy operations
- Implement proper loading and empty states

### User Experience Standards
- Provide clear, actionable error messages
- Include helpful empty states with guidance
- Maintain consistent navigation patterns
- Show loading indicators for async operations
- Design keyboard-first interactions
- Include relevant actions in `ActionPanel`
- Use appropriate icons for actions and list items

### Error Handling Pattern
```typescript
try {
  // Your code here
} catch (error) {
  console.error("Error details:", error);
  await showToast({
    style: Toast.Style.Failure,
    title: "User-friendly error title",
    message: error instanceof Error ? error.message : "Unknown error"
  });
}
```

### Git Workflow
- Branch naming: `feature/`, `fix/`, `chore/`
- Commit messages: Use conventional commits (feat:, fix:, docs:, etc.)
- Always update CHANGELOG.md for user-facing changes
- Run `ray lint` before committing
- Test all commands manually before pushing

### Security Considerations
- Never commit API keys or secrets
- Use Raycast preferences for user secrets
- Validate all user inputs
- Sanitize data from external sources
- Use HTTPS for all external requests

### Testing Checklist
- [ ] All commands load without errors
- [ ] Error scenarios show appropriate toasts
- [ ] Loading states display correctly
- [ ] Empty states are helpful
- [ ] Keyboard shortcuts work as expected
- [ ] Preferences are respected
- [ ] No console errors in development
- [ ] Extension works on clean Raycast install

### Documentation Requirements
- Update README.md with any new features
- Document all preferences in README
- Include screenshots for significant UI changes
- Add troubleshooting tips for common issues
- Keep CHANGELOG.md up to date

### Publishing Preparation
- Use the provided `npm run safe-publish` script (powered by `scripts/publish-helper.sh`) instead of invoking `ray publish` directly. This temporarily removes AI-related files such as `CLAUDE.md` before packing the extension.
- Ensure all assets are optimized (icons should be 512x512 PNG)
- Review package.json manifest for accuracy
- Test on a clean Raycast installation
- Verify all commands have appropriate titles and descriptions
- Check that categories are appropriate
- Ensure author information is complete