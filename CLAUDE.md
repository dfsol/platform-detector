# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

@dfsol/platform-detector is a TypeScript library for detecting runtime environments in web applications with priority-based detection for Web, PWA, Telegram Mini Apps (TMA), and Native apps (Capacitor/Cordova). The library handles complex edge cases like iPadOS 13+ detection and asynchronous Telegram init data loading.

## Build and Development Commands

```bash
# Build the project (TypeScript + Svelte components)
bun run build
# or
npm run build

# Development watch mode
bun run dev

# Prepare for publishing (runs build)
bun run prepare

# Test in browser
# Open test/index.html in different environments (browser, PWA, TMA, mobile)
```

## Architecture Overview

### Detection Priority System (src/detector.ts)
The library uses a strict priority order to prevent misidentification:
1. **Native Apps** (Capacitor/Cordova) - Highest priority, checked via `window.Capacitor` and `isNativePlatform()`
2. **Telegram Mini Apps** - Dual SDK support (native + @tma.js), handles async init
3. **Progressive Web Apps** - Display mode detection via CSS Media Queries
4. **Standard Web** - Default fallback

This order is critical because native apps contain web views that could trigger false PWA detection, and TMA might exhibit PWA-like characteristics.

### Key Detection Logic

#### iPadOS 13+ Edge Case (src/detector.ts:152-154)
iPadOS 13+ reports as "MacIntel" but has multi-touch support. The detector correctly identifies it:
```typescript
if (platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return 'ios'; // It's actually an iPad
}
```

#### Telegram Detection (src/detector.ts:283-334, src/tma-sdk.ts, src/telegram-sdk.ts)
- Supports both native Telegram SDK and @tma.js SDK
- Validates via multiple indicators: initData, platform, colorScheme, viewport
- Handles async initialization in native Telegram apps where initData loads later
- Platform-specific corrections override user agent detection when in TMA

#### PWA Detection (src/detector.ts:338-369)
Checks multiple display modes: standalone, fullscreen, minimal-ui, window-controls-overlay, and iOS-specific navigator.standalone.

### File Structure and Responsibilities

- `src/detector.ts` - Core PlatformDetector class with all detection logic
- `src/types.ts` - TypeScript interfaces and type definitions
- `src/index.ts` - Main exports and utility functions
- `src/telegram-sdk.ts` - Native Telegram WebApp SDK handling
- `src/tma-sdk.ts` - @tma.js SDK integration
- `src/svelte/` - Svelte components (TMARedirect)
- `test/examples.ts` - Comprehensive usage examples
- `docs/DETECTION_METHODS.md` - Detailed technical documentation

## Critical Implementation Details

### Platform-Specific Overrides
When Telegram is detected, the library trusts Telegram's platform API over user agent:
```typescript
// src/detector.ts:88-107
if (isTelegram && telegram?.platform) {
    // Override OS and device based on Telegram's platform info
    // This is more reliable than user agent parsing
}
```

### Browser Detection Order (src/detector.ts:567-598)
Must check in this specific order to prevent misidentification:
1. Edge (before Chrome)
2. Firefox
3. Opera (before Chrome)
4. Chrome (with exclusions)
5. Safari (with exclusions)
6. Specialized browsers

### Real-time Monitoring (src/detector.ts:646-678)
The `watchForChanges()` method monitors:
- Display mode changes (PWA installation/uninstallation)
- Online/offline status
- Telegram viewport changes
Returns cleanup function for proper resource management.

## Common Tasks and Patterns

### Adding New Platform Detection
1. Add new type to `src/types.ts` if needed
2. Implement detection method in `src/detector.ts` following existing patterns
3. Consider detection priority - where should it fit in the hierarchy?
4. Add platform-specific corrections if the platform provides its own APIs
5. Update utility functions in `src/index.ts` if needed
6. Add test cases to `test/examples.ts`

### Debugging Detection Issues
1. Use `createPlatformDetector({ debug: true })` for logging
2. Check detection priority - earlier checks override later ones
3. Verify platform-specific APIs are available before trusting them
4. Test in actual environment (not just user agent spoofing)

### Performance Optimization
Note: Utility functions create new detector instances each time. For performance-critical code:
```typescript
// Good - reuse detector
const detector = createPlatformDetector();
const info = detector.detect();

// Less efficient - creates multiple detectors
if (isMobileDevice()) { }  // New detector
if (isIOS()) { }           // Another new detector
```

## Testing Approach

The library uses example-based testing via `test/index.html` and `test/examples.ts`. Test in different environments:
- Regular browsers (Chrome, Safari, Firefox, Edge)
- PWA mode (install the test page)
- Telegram Mini App (access via Telegram bot)
- Mobile browsers
- Native app WebViews (if testing Capacitor)

## Publishing and Distribution

```bash
# Build before publishing
bun run build

# The package is published to GitHub Package Registry
# See package.json:publishConfig for registry settings
```

The package exports:
- Main module: `./dist/index.js`
- Svelte components: `./dist/svelte/`
- TypeScript definitions included

## Important Edge Cases to Remember

1. **iPadOS 13+**: Uses maxTouchPoints check, not user agent
2. **Telegram Native Apps**: initData may load asynchronously
3. **Android Tablets**: May lack "mobile" keyword in user agent
4. **PWA on iOS**: Uses navigator.standalone, not display-mode
5. **Capacitor Web Builds**: Check isNativePlatform() to avoid false positives
6. **TMA Domain Mismatch**: `tg.*` domains outside Telegram trigger warnings

## Module Compatibility

- ES modules only (no CommonJS)
- TypeScript target: ES2022
- Peer dependencies: Svelte 5+ (optional), @tma.js/sdk 2+ or 3+ (optional)
- Browser support: Chrome/Edge 90+, Firefox 88+, Safari 14+