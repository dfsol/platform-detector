# @dfsol/platform-detector

🔍 Universal platform detector for web, PWA, Telegram Mini Apps, and native mobile applications with comprehensive environment detection.

## Features

- 🌐 **Web Platform Detection**: Desktop and mobile browsers with browser type identification
- 📱 **PWA Detection**: Identifies installed Progressive Web Apps across all platforms
- 🤖 **Telegram Mini App (TMA)**: Detects Telegram Mini App environment with platform differentiation
- 📲 **Native App Detection**: Recognizes Capacitor/Cordova native applications
- 🖥️ **OS Detection**: Windows, macOS, Linux, ChromeOS, iOS, Android (including iPadOS 13+)
- 📱 **Device Detection**: Mobile, tablet, desktop with enhanced accuracy
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

```typescript
import { detectPlatform } from '@dfsol/platform-detector';

const platform = detectPlatform();

console.log('Platform:', platform.type); // 'web' | 'pwa' | 'tma' | 'native'
console.log('OS:', platform.os); // 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'chromeos'
console.log('Device:', platform.device); // 'mobile' | 'tablet' | 'desktop'

if (platform.shouldShowTMAWarning) {
  // Show redirect to Telegram
}
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
});

// Get platform info
const platform = detector.detect();

// Get browser type
const browser = detector.getBrowserType();

// Check PWA installability
const canInstall = detector.isPWAInstallable();

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
