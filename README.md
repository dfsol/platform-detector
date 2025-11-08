# @dfsol/platform-detector

🔍 Universal platform detector for web, PWA, Telegram Mini Apps, and native mobile applications with comprehensive environment detection.

## Features

### Core Detection
- 🌐 **Web Platform Detection**: Desktop and mobile browsers with browser type identification
- 📱 **PWA Detection**: Identifies installed Progressive Web Apps (including 2025 window-controls-overlay)
- 🤖 **Telegram Mini App (TMA)**: Dual SDK support (native + @tma.js) with platform differentiation
- 📲 **Native App Detection**: Recognizes Capacitor/Cordova native applications
- 🖥️ **OS Detection**: Windows, macOS, Linux, ChromeOS, iOS, Android (including iPadOS 13+)
- 📱 **Device Detection**: Mobile, tablet, desktop with enhanced accuracy

### 🆕 New in v0.4.0
- ⚡ **Client Hints API**: Enhanced accuracy with User-Agent Client Hints (Windows 11, macOS 11+ detection)
- 🎯 **Feature Detection**: Capability-based detection that cannot be spoofed
- 📊 **Confidence Scoring**: Know how reliable your detection results are (0-100)
- 🎨 **Browser Family**: Detect rendering engine (Chromium, WebKit, Gecko)
- 🚀 **Performance**: Built-in caching for 10-100x faster repeated detections
- 🔄 **Async Detection**: Optional async mode with Client Hints for better accuracy

### Additional Features
- 🌍 **Domain Mode**: Distinguishes between `app.*` and `tg.*` domains
- ⚠️ **TMA Mismatch Warning**: Automatic detection when TMA domain is accessed outside Telegram
- 🎨 **Svelte Component**: Ready-to-use TMA redirect component
- 🔄 **Real-time Monitoring**: Watch for platform changes (PWA installation, display mode changes)
- 🔐 **Telegram initData Validation**: Pure server helper to verify Telegram WebApp requests (Hono/Edge ready)

## Installation

```bash
# Using npm
npm install @dfsol/platform-detector

# Using bun
bun add @dfsol/platform-detector

# Using yarn
yarn add @dfsol/platform-detector
```

## Quick Start

### Basic Detection (Sync)

```typescript
import { detectPlatform } from '@dfsol/platform-detector';

const platform = detectPlatform();

console.log('Platform:', platform.type); // 'web' | 'pwa' | 'tma' | 'native'
console.log('OS:', platform.os); // 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'chromeos'
console.log('Device:', platform.device); // 'mobile' | 'tablet' | 'desktop'
console.log('Browser Family:', platform.browserFamily); // 'chromium' | 'webkit' | 'gecko'

// 🆕 NEW: Confidence scores
console.log('Detection confidence:', platform.confidence?.overall); // 0-100

if (platform.shouldShowTMAWarning) {
  // Show redirect to Telegram
}
```

### Enhanced Detection (Async + Client Hints)

```typescript
import { detectPlatformAsync } from '@dfsol/platform-detector';

// For better accuracy on Chrome/Edge (requires async)
const platform = await detectPlatformAsync({ useClientHints: true });

console.log('OS:', platform.os); // 'windows'
console.log('OS Version:', platform.osVersion); // '11' (on Windows 11)
console.log('Architecture:', platform.architecture); // 'x86' or 'arm'
console.log('Device Model:', platform.deviceModel); // Device model if available
```

## API Reference

### Main Detection Function

```typescript
import { detectPlatform } from '@dfsol/platform-detector';

const platform = detectPlatform(options?: PlatformDetectorOptions);
```

Returns a `PlatformInfo` object with comprehensive environment information.

### Platform Info Object

```typescript
interface PlatformInfo {
  // Primary platform type
  type: 'web' | 'pwa' | 'tma' | 'native';

  // Operating system
  os: 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'chromeos' | 'unknown';

  // Device form factor
  device: 'mobile' | 'tablet' | 'desktop';

  // Domain mode
  domainMode: 'app' | 'tma' | 'unknown';

  // Environment type
  environment: 'development' | 'production' | 'unknown';

  // Boolean checks
  isPWA: boolean;
  isTelegram: boolean;
  isNative: boolean;
  isWeb: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isChromeOS: boolean;

  // Additional info
  userAgent: string;
  shouldShowTMAWarning: boolean;
  screen: ScreenInfo;
  capacitor?: CapacitorInfo;
  telegram?: TelegramInfo;

  // 🆕 NEW in v0.4.0
  browserFamily?: 'chromium' | 'webkit' | 'gecko' | 'unknown';
  osVersion?: string; // e.g., '11' for Windows 11, '13' for Android 13
  architecture?: 'x86' | 'arm'; // CPU architecture (from Client Hints)
  deviceModel?: string; // e.g., 'iPhone 15 Pro', 'SM-X906C' (from Client Hints)
  confidence?: DetectionConfidence; // Reliability scores (0-100)
}

interface DetectionConfidence {
  overall: number;  // Overall confidence (0-100)
  os: number;       // OS detection confidence
  device: number;   // Device type confidence
  browser: number;  // Browser detection confidence
}
```

### Utility Functions

Quick detection functions for common use cases:

```typescript
import {
  isMobileDevice,
  isIOS,
  isAndroid,
  isPWA,
  isTelegramMiniApp,
  isNativeApp,
  getBrowserType,
  getPlatformType,
  getDisplayMode,
  canInstallPWA
} from '@dfsol/platform-detector';

// Quick checks
if (isMobileDevice()) {
  // Mobile-specific code
}

if (isPWA()) {
  // PWA-specific features
}

// Browser detection
const browser = getBrowserType(); // 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | etc.

// Display mode for PWA
const displayMode = getDisplayMode(); // 'standalone' | 'fullscreen' | 'browser' | etc.

// Check if PWA can be installed
if (canInstallPWA()) {
  // Show install prompt
}
```

### Platform Detector Class

For advanced use cases:

```typescript
import { createPlatformDetector } from '@dfsol/platform-detector';

const detector = createPlatformDetector({
  debug: true, // Enable debug logging
  userAgent: customUA, // Custom user agent (for testing)
  hostname: customHost, // Custom hostname (for testing)
  cacheTTL: 5000, // 🆕 Cache results for 5 seconds (default: 5000ms)
  useClientHints: true, // 🆕 Enable Client Hints for async detection
});

// Synchronous detection (uses cache if available)
const platform = detector.detect();

// 🆕 Async detection with Client Hints (Chrome/Edge only)
const platformWithHints = await detector.detectAsync();

// Get browser type
const browser = detector.getBrowserType();

// Check PWA installability
const canInstall = detector.isPWAInstallable();

// 🆕 Clear cache manually
detector.clearCache();

// Monitor for changes
const cleanup = detector.watchForChanges((newInfo) => {
  console.log('Platform changed:', newInfo.type);
});

// Clean up when done
cleanup();
```

## Platform-Specific Detection

### Telegram Mini Apps

```typescript
const platform = detectPlatform();

if (platform.isTelegram && platform.telegram) {
  console.log('TMA Platform:', platform.telegram.platform);
  // 'ios' | 'android' | 'android_x' | 'macos' | 'tdesktop' | 'weba' | 'webk' | 'web'

  // Check if native or web client
  const isNativeClient = ['ios', 'android', 'android_x', 'macos', 'tdesktop']
    .includes(platform.telegram.platform);

  // Access user info
  if (platform.telegram.user) {
    console.log('User:', platform.telegram.user.first_name);
  }
}
```

### Progressive Web Apps

```typescript
const platform = detectPlatform();

if (platform.isPWA) {
  console.log('Running as PWA');

  // iOS-specific PWA
  if (platform.isIOS && platform.isPWA) {
    console.log('iOS PWA (Add to Home Screen)');
  }

  // Get display mode
  const displayMode = getDisplayMode();
  console.log('Display Mode:', displayMode);
}
```

### Native Apps (Capacitor)

```typescript
const platform = detectPlatform();

if (platform.isNative && platform.capacitor) {
  console.log('Native Platform:', platform.capacitor.platform);
  console.log('Is Native:', platform.capacitor.isNativePlatform);

  // Check plugin availability
  const hasCamera = platform.capacitor.isPluginAvailable('Camera');
}
```

## Advanced Features

### Client Hints API (v0.4.0)

Use Client Hints for enhanced accuracy on Chromium browsers:

```typescript
import { ClientHintsDetector } from '@dfsol/platform-detector';

// Check if Client Hints are supported (Chrome/Edge 101+)
if (ClientHintsDetector.isSupported()) {
  // Get basic hints (synchronous)
  const basicHints = ClientHintsDetector.getBasicHints();
  console.log('Platform:', basicHints?.platform); // 'Windows', 'macOS', etc.
  console.log('Mobile:', basicHints?.mobile);

  // Get high-entropy hints (async, requires user permission)
  const hints = await ClientHintsDetector.getHighEntropyHints();
  console.log('OS Version:', hints?.platformVersion); // '13.0.0' for Windows 11
  console.log('Architecture:', hints?.architecture); // 'x86' or 'arm'
  console.log('Device Model:', hints?.model); // 'iPad Pro', 'SM-X906C', etc.

  // Detect OS with version
  const osInfo = ClientHintsDetector.detectOS(hints);
  console.log(osInfo); // { os: 'windows', version: '11' }

  // Detect device type
  const device = ClientHintsDetector.detectDevice(hints);
  console.log(device); // 'mobile' | 'tablet' | 'desktop'
}

// Check if User-Agent is frozen (Chrome 110+)
if (ClientHintsDetector.isFrozenUA(navigator.userAgent)) {
  console.log('User-Agent is frozen, use Client Hints for accuracy');
}
```

### Feature Detection (v0.4.0)

Use capability-based detection that cannot be spoofed:

```typescript
import { FeatureDetector } from '@dfsol/platform-detector';

// Detect device features
const features = FeatureDetector.detect();
console.log('Touch support:', features.touch);
console.log('Pointer type:', features.pointer); // 'fine' | 'coarse' | 'none'
console.log('Hover capability:', features.hover); // 'hover' | 'none'
console.log('Max touch points:', features.maxTouchPoints);
console.log('Hardware concurrency:', features.hardwareConcurrency);

// Infer device type from features
const deviceType = FeatureDetector.inferDeviceType(features);
console.log('Inferred device:', deviceType); // 'mobile' | 'tablet' | 'desktop'

// Validate device type detection
const validation = FeatureDetector.validateDeviceType('mobile', features);
console.log('Valid:', validation.valid);
console.log('Confidence:', validation.confidence); // 0-100
console.log('Reason:', validation.reason);

// Detect with inference (convenience method)
const result = FeatureDetector.detectWithInference();
console.log('Features:', result.features);
console.log('Inferred device:', result.inferredDevice);
console.log('Confidence:', result.confidence);
console.log('Warnings:', result.warnings);
```

### Confidence Scoring (v0.4.0)

Understand the reliability of detection results:

```typescript
const platform = detectPlatform();

if (platform.confidence) {
  console.log('Overall confidence:', platform.confidence.overall); // 0-100
  console.log('OS confidence:', platform.confidence.os);
  console.log('Device confidence:', platform.confidence.device);
  console.log('Browser confidence:', platform.confidence.browser);

  // Make decisions based on confidence
  if (platform.confidence.overall < 70) {
    console.warn('Low confidence detection, results may be unreliable');
  }

  if (platform.confidence.os < 80 && ClientHintsDetector.isSupported()) {
    // Use Client Hints for better accuracy
    const betterPlatform = await detectPlatformAsync({ useClientHints: true });
    console.log('Improved confidence:', betterPlatform.confidence?.overall);
  }
}
```

### Performance Optimization (v0.4.0)

Built-in caching for faster repeated detections:

```typescript
import { createPlatformDetector } from '@dfsol/platform-detector';

// Default: cache for 5 seconds
const detector = createPlatformDetector();

const platform1 = detector.detect(); // First detection (slow)
const platform2 = detector.detect(); // Uses cache (10-100x faster)
const platform3 = detector.detect(); // Still cached

// Custom cache TTL
const fastDetector = createPlatformDetector({ cacheTTL: 1000 }); // 1 second
const slowDetector = createPlatformDetector({ cacheTTL: 60000 }); // 1 minute

// Disable caching
const noCacheDetector = createPlatformDetector({ cacheTTL: 0 });

// Clear cache manually
detector.clearCache();
const freshResult = detector.detect(); // Fresh detection

// Performance tip: reuse detector instance
// ✅ Good - single detector, cached results
const myDetector = createPlatformDetector();
function checkPlatform() {
  return myDetector.detect(); // Fast after first call
}

// ❌ Bad - new detector every time, no caching benefit
function checkPlatformSlow() {
  return createPlatformDetector().detect(); // Always slow
}
```

### Real-time Platform Monitoring

Watch for platform changes in real-time:

```typescript
import { watchPlatformChanges } from '@dfsol/platform-detector';

const cleanup = watchPlatformChanges((newInfo) => {
  if (newInfo.isPWA) {
    console.log('App was installed as PWA');
  }
});

// Stop monitoring when done
cleanup();
```

### Environment-Based UI Adaptation

```typescript
const platform = detectPlatform();

// Adjust UI based on platform
switch (platform.type) {
  case 'tma':
    // Telegram Mini App UI
    setupTelegramTheme();
    break;
  case 'pwa':
    // PWA UI (no install prompts needed)
    hideInstallButton();
    break;
  case 'native':
    // Native app UI
    enableNativeFeatures();
    break;
  default:
    // Web browser UI
    showInstallPrompt();
}

// Device-specific adjustments
if (platform.device === 'mobile') {
  enableTouchOptimizations();
} else if (platform.device === 'tablet') {
  enableSplitView();
} else {
  enableDesktopFeatures();
}
```

### TMA Domain Mismatch Handling

```typescript
const platform = detectPlatform();

if (platform.shouldShowTMAWarning) {
  // User accessed TMA domain outside Telegram
  const detector = createPlatformDetector();
  const availability = detector.checkTMAAvailability('your_bot_username');

  if (availability.botUrl) {
    // Redirect to Telegram
    window.location.href = availability.botUrl;
  }
}
```

## Server Utilities

### Telegram initData Validation (Hono Example)

`verifyTelegramInitData` validates the signed payload that Telegram Mini Apps send through `initData` (query string or `Telegram-Init-Data` header). The helper is pure, so it plugs directly into any Hono/edge handler:

```typescript
import { Hono } from 'hono';
import { verifyTelegramInitData } from '@dfsol/platform-detector';

const app = new Hono();

app.post('/secure-endpoint', async (c) => {
  const initData = c.req.header('telegram-init-data') ?? c.req.query('initData');
  const result = await verifyTelegramInitData(initData, c.env.BOT_TOKEN, {
    maxAgeSeconds: 300, // optional, defaults to 10 minutes
    requireUser: true
  });

  if (!result.ok || !result.data) {
    return c.json({ error: result.message ?? 'unauthorized' }, 401);
  }

  // Use parsed payload in your business logic
  const user = result.data.user;
  return c.json({ ok: true, user });
});
```

The validator relies on the Web Crypto API (`crypto.subtle`) that is available in modern edge runtimes (Cloudflare Workers, Deno, Bun, Node 18+). Provide a polyfill if you need to support older environments.

#### Reusable Middleware

Wrap the validator once and reuse it as Hono middleware:

```typescript
import type { Context, Next } from 'hono';
import { verifyTelegramInitData } from '@dfsol/platform-detector';

export const withTelegramAuth =
  (options?: { maxAgeSeconds?: number; requireUser?: boolean }) =>
  async (c: Context, next: Next) => {
    const initData =
      c.req.header('telegram-init-data') ??
      c.req.query('initData') ??
      (await c.req.parseBody()).initData;

    const result = await verifyTelegramInitData(
      typeof initData === 'string' ? initData : undefined,
      c.env.BOT_TOKEN,
      options
    );

    if (!result.ok || !result.data) {
      return c.json({ error: result.message ?? 'unauthorized' }, 401);
    }

    c.set('telegram', result.data); // expose parsed initData downstream
    await next();
  };
```

Apply it to any protected routes:

```typescript
app.use('/secure/*', withTelegramAuth({ requireUser: true }));

app.get('/secure/profile', (c) => {
  const telegram = c.get('telegram');
  return c.json({ ok: true, user: telegram.user });
});
```

## Svelte Component

For Svelte applications:

```svelte
<script>
  import { TMARedirect } from '@dfsol/platform-detector/svelte';
  import { detectPlatform } from '@dfsol/platform-detector';

  const platform = detectPlatform();
</script>

{#if platform.shouldShowTMAWarning}
  <TMARedirect botUsername="your_bot_username" />
{/if}
```

## Testing

The package includes comprehensive test files:

```html
<!-- test/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Platform Detector Test</title>
</head>
<body>
  <script type="module">
    import { detectPlatform } from '../dist/index.js';

    const platform = detectPlatform();
    console.log('Detected:', platform);
  </script>
</body>
</html>
```

Open `test/index.html` in different environments to test detection:
- Regular browser
- PWA (after installation)
- Telegram Mini App
- Mobile browsers
- Native app WebView

## Documentation

- [Detection Methods and Approaches](docs/DETECTION_METHODS.md) - Comprehensive guide to all detection methods, algorithms, and edge cases

## Examples

See `test/examples.ts` for comprehensive usage examples covering all detection scenarios.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+
- Samsung Internet 14+
- Telegram WebApp (all platforms)

## TypeScript Support

Full TypeScript support with comprehensive type definitions included.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

### v0.4.0

**Major Features:**
- ⚡ **Client Hints API Integration**: Enhanced accuracy with User-Agent Client Hints for Chromium browsers (Chrome/Edge 101+)
  - Windows 11/10 distinction
  - macOS version detection (11+)
  - CPU architecture detection (x86/arm)
  - Device model information
- 🎯 **Feature-Based Detection**: Capability detection using pointer, hover, and touch APIs that cannot be spoofed
  - Hardware feature detection (touch, pointer, hover, orientation)
  - Device type inference from capabilities
  - Cross-validation with User-Agent detection
- 📊 **Confidence Scoring**: Reliability measurement (0-100) for all detection results
  - Per-category confidence (OS, device, browser)
  - Overall confidence score
  - Frozen UA detection with reduced confidence
- 🎨 **Browser Family Detection**: Rendering engine identification (Chromium, WebKit, Gecko)
- 🚀 **Performance Optimization**: Built-in result caching with configurable TTL (default: 5 seconds)
  - 10-100x speedup for repeated detections
  - Manual cache clearing support
- 🔄 **Async Detection Mode**: Optional async detection with Client Hints for enhanced accuracy
- 🪟 **2025 PWA Standards**: Support for window-controls-overlay display mode

**Testing & Quality:**
- ✅ Comprehensive test suite with Vitest (71 tests)
- ✅ 100% test coverage for new features
- ✅ Unit tests for detector, client-hints, and feature-detector modules

**Breaking Changes:**
- None - all changes are backward compatible. New fields are optional.

**Migration Guide:**
```typescript
// v0.3.x - still works
const platform = detectPlatform();

// v0.4.0 - use new features
const platform = await detectPlatformAsync({ useClientHints: true });
console.log(platform.osVersion); // NEW
console.log(platform.browserFamily); // NEW
console.log(platform.confidence); // NEW
```

### v0.3.0
- Enhanced iPadOS 13+ detection
- Better PWA detection across all display modes
- Priority-based platform detection
- Browser type detection
- Real-time platform monitoring
- Utility functions for common use cases
- Comprehensive test examples
- Focused on core platforms: Web, PWA, TMA (Telegram Mini Apps), and Native

### v0.2.0
- Initial public release
- Basic platform detection
- Telegram Mini App support
- PWA detection
- Capacitor support

---

Made with ❤️ by DFSOL
