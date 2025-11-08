# Platform Detection Methods and Approaches

## Overview

The `@dfsol/platform-detector` package implements a comprehensive, priority-based approach to detect runtime environments in web applications. This document describes all detection methods, algorithms, and edge cases handled by the library.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Detection Priority System](#detection-priority-system)
3. [Platform Detection Methods](#platform-detection-methods)
4. [Operating System Detection](#operating-system-detection)
5. [Device Type Detection](#device-type-detection)
6. [Browser Detection](#browser-detection)
7. [Special Cases and Edge Detection](#special-cases-and-edge-detection)
8. [Session Persistence](#session-persistence)
9. [Real-time Monitoring](#real-time-monitoring)
10. [Server-Side Rendering Support](#server-side-rendering-support)

## Architecture Overview

The detection system is built on several key principles:

1. **Priority-based detection**: More specific environments are detected before general ones
2. **Multiple indicator validation**: Uses multiple signals to increase detection accuracy
3. **Edge case handling**: Specific logic for problematic scenarios (iPadOS, Telegram native apps, etc.)
4. **Performance optimization**: Caching and session storage for expensive operations
5. **Real-time updates**: Monitor and react to platform changes

### Core Detection Flow

```typescript
detect(): PlatformInfo {
    // 1. Check for server-side rendering
    if (typeof window === 'undefined') {
        return this.createServerSideInfo();
    }

    // 2. Priority-based platform detection
    // Order: Native → TMA → PWA → Web

    // 3. Gather environment context
    // OS, device, browser, domain, etc.

    // 4. Apply platform-specific corrections
    // Trust platform-specific APIs over User Agent

    // 5. Return comprehensive platform info
}
```

## Detection Priority System

The detector follows a strict priority order to ensure accurate platform identification:

```
1. Native Apps (Highest Priority)
   └── Capacitor/Cordova detection

2. Telegram Mini Apps (TMA)
   └── Both native SDK and @tma.js SDK

3. Progressive Web Apps (PWA)
   └── Display modes and iOS standalone

4. Standard Web (Lowest Priority)
   └── Default when no other markers present
```

### Why This Order Matters

- **Native apps** may contain web views that could trigger false positives for other platforms
- **TMA** runs inside Telegram which might have PWA-like characteristics
- **PWA** must be detected before standard web to identify installed apps
- **Web** is the fallback for all standard browser access

## Platform Detection Methods

### 1. Native App Detection (Capacitor/Cordova)

```typescript
private detectNative(): boolean {
    // Check for Capacitor
    if ('Capacitor' in window) {
        return true;
    }

    // Check for Cordova
    if ('cordova' in window || 'phonegap' in window) {
        return true;
    }

    // Check for Capacitor's DOM marker
    if (document.documentElement.classList.contains('capacitor')) {
        return true;
    }

    return false;
}
```

**Additional Validation:**
- Must verify `Capacitor.isNativePlatform() === true`
- Platform identification via `Capacitor.getPlatform()`
- Plugin availability checks

### 2. Telegram Mini App (TMA) Detection

TMA detection uses multiple SDK sources for maximum compatibility:

```typescript
private detectTelegram(): boolean {
    // Priority 1: Check @tma.js SDK
    if (isTelegramViaTmaJs()) {
        return true;
    }

    // Priority 2: Use provided Telegram object
    if (this.options.telegramWebApp) {
        return this.validateTelegramWebApp(this.options.telegramWebApp);
    }

    // Priority 3: Check for native Telegram WebApp
    const webApp = getTelegramWebApp();
    if (!webApp) return false;

    return this.validateTelegramWebApp(webApp);
}
```

**Validation Criteria:**
1. WebApp object must exist with version
2. Check for actual init data or platform info
3. Verify color scheme availability
4. Handle native apps where initData loads asynchronously

**Supported Telegram Platforms:**
- `ios` - Native iOS Telegram app
- `android` - Native Android Telegram app
- `android_x` - Android Telegram X app
- `macos` - Native macOS Telegram app
- `tdesktop` - Telegram Desktop (Windows/Linux/Mac)
- `weba` - Telegram Web A version
- `webk` - Telegram Web K version
- `web` - Generic web version

### 3. Progressive Web App (PWA) Detection

```typescript
private detectPWA(): boolean {
    // Check various display modes
    const displayModes = ['standalone', 'fullscreen', 'minimal-ui'];
    for (const mode of displayModes) {
        if (window.matchMedia(`(display-mode: ${mode})`).matches) {
            return true;
        }
    }

    // iOS Safari standalone mode
    if ('standalone' in navigator && navigator.standalone === true) {
        return true;
    }

    // Desktop PWA with window controls
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) {
        return true;
    }

    return false;
}
```

**Display Modes Detected:**
- `standalone` - Most common PWA mode
- `fullscreen` - Full screen without any browser UI
- `minimal-ui` - Minimal browser chrome
- `window-controls-overlay` - Desktop PWA with custom title bar
- `standalone-ios` - iOS specific via navigator.standalone

## Operating System Detection

### Enhanced OS Detection with iPadOS Support

```typescript
private detectOS(userAgent: string): OSType {
    const ua = userAgent.toLowerCase();
    const platform = typeof window !== 'undefined' ? window.navigator.platform : '';

    // iOS detection (including iPadOS 13+)
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';

    // iPadOS 13+ detection (reports as Mac but has touch support)
    if (platform === 'MacIntel' && typeof window !== 'undefined' && navigator.maxTouchPoints > 1) {
        return 'ios';
    }

    // Android detection
    if (/android/.test(ua)) return 'android';

    // Desktop OS detection
    if (/cros/.test(ua)) return 'chromeos';
    if (/mac os x|macintosh/.test(ua)) return 'macos';
    if (/windows|win32|win64/.test(ua)) return 'windows';
    if (/linux|x11/.test(ua) && !/android/.test(ua)) return 'linux';

    return 'unknown';
}
```

### Key Detection Points:

1. **iPadOS 13+ Challenge**:
   - Problem: iPadOS 13+ reports as macOS in User Agent
   - Solution: Check for `MacIntel` platform with `maxTouchPoints > 1`

2. **Priority Order**:
   - Mobile OS checked first (iOS, Android)
   - Desktop OS checked second
   - ChromeOS before generic desktop OS

## Device Type Detection

```typescript
private detectDevice(userAgent: string, os: OSType): DeviceType {
    const ua = userAgent.toLowerCase();
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;

    // iOS device detection
    if (os === 'ios') {
        // iPad detection (including iPadOS 13+)
        if (/ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return 'tablet';
        }
        return 'mobile';
    }

    // Android device detection
    if (os === 'android') {
        // Android tablets typically don't have 'mobile' in UA
        if (!/mobile/.test(ua) && /android/.test(ua)) {
            return 'tablet';
        }
        // Additional check for specific tablet models
        if (/tablet|tab\d+/.test(ua)) {
            return 'tablet';
        }
        return 'mobile';
    }

    // Screen width as additional hint
    if (width > 0 && width <= 768 && /mobi/.test(ua)) {
        return 'mobile';
    }

    // Desktop OS = desktop device
    return 'desktop';
}
```

### Device Detection Strategy:

1. **OS-based primary detection**: Mobile OS indicates mobile/tablet device
2. **User Agent patterns**: Specific keywords for tablets
3. **Screen width fallback**: For ambiguous cases
4. **Platform-specific trust**: TMA platform info overrides UA detection

## Browser Detection

```typescript
getBrowserType(): string {
    const ua = navigator.userAgent.toLowerCase();

    // Check Edge first (includes "Edg/")
    if (/edg/i.test(ua)) return 'Edge';

    // Firefox (includes fxios for iOS)
    if (/firefox|fxios/i.test(ua)) return 'Firefox';

    // Opera
    if (/opr|opera/i.test(ua)) return 'Opera';

    // Chrome (exclude Opera, Chromium, Edge)
    if (/chrome|crios/i.test(ua) && !/opr|opera|chromium|edg/i.test(ua)) {
        return 'Chrome';
    }

    // Safari (exclude Chrome and other browsers)
    if (/safari/i.test(ua) && !/chromium|edg|chrome|crios|firefox/i.test(ua)) {
        return 'Safari';
    }

    // Additional browsers
    if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
    if (/ucbrowser/i.test(ua)) return 'UC Browser';

    return 'unknown';
}
```

### Browser Detection Order:
1. Edge (must be first as it includes Chrome UA)
2. Firefox
3. Opera (before Chrome as it includes Chrome UA)
4. Chrome (with exclusions)
5. Safari (with exclusions)
6. Specialized browsers

## Special Cases and Edge Detection

### 1. Domain Mode Detection

```typescript
private detectDomainMode(hostname: string): DomainMode {
    if (hostname.startsWith('app.')) return 'app';
    if (hostname.startsWith('tg.')) return 'tma';
    return 'unknown';
}
```

**Purpose**: Detect if app is accessed via Telegram-specific domain

### 2. TMA Mismatch Warning

```typescript
const shouldShowTMAWarning = domainMode === 'tma' && !isTelegram;
```

**Triggers when**: User accesses `tg.*` domain outside of Telegram environment

### 3. Environment Detection

```typescript
private detectEnvironment(): EnvironmentType {
    const hostname = this.options.hostname || window.location.hostname;

    // Development indicators
    if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.includes('dev.') ||
        hostname.includes('staging.') ||
        hostname.includes('.local')
    ) {
        return 'development';
    }

    // Production indicators
    if (
        hostname.includes('.com') ||
        hostname.includes('.org') ||
        hostname.includes('.net') ||
        hostname.includes('.io') ||
        hostname.includes('.app') ||
        hostname.includes('.cc')
    ) {
        return 'production';
    }

    return 'unknown';
}
```

### 4. Platform-Specific Corrections

When TMA is detected, platform info from Telegram overrides User Agent:

```typescript
if (isTelegram && telegram?.platform) {
    const tgPlatform = telegram.platform;

    // Mobile platforms
    if (tgPlatform === 'ios' || tgPlatform === 'android' || tgPlatform === 'android_x') {
        finalDevice = device === 'tablet' ? 'tablet' : 'mobile';
        finalIsMobile = true;
        // Correct OS if needed
        if (tgPlatform === 'ios' && os !== 'ios') finalOS = 'ios';
        if ((tgPlatform === 'android' || tgPlatform === 'android_x') && os !== 'android') {
            finalOS = 'android';
        }
    }
    // Desktop platforms
    else if (tgPlatform === 'macos' || tgPlatform === 'tdesktop') {
        finalDevice = 'desktop';
        finalIsMobile = false;
        if (tgPlatform === 'macos' && os !== 'macos') finalOS = 'macos';
    }
}
```

## Session Persistence

Currently implemented for maintaining state across navigation:

```typescript
// Example from previous TWA detection (now removed)
// Can be applied to other detection needs:
sessionStorage.setItem('platform_cache', JSON.stringify(platformInfo));
```

**Use Cases:**
- Cache expensive detection operations
- Maintain consistency across page navigation
- Store user preferences

## Real-time Monitoring

### Platform Change Detection

```typescript
watchForChanges(callback: (info: PlatformInfo) => void): () => void {
    const checkAndNotify = () => {
        const newInfo = this.detect();
        callback(newInfo);
    };

    // Watch for display mode changes (PWA installation/uninstallation)
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    displayModeQuery.addEventListener('change', checkAndNotify);

    // Watch for online/offline changes
    window.addEventListener('online', checkAndNotify);
    window.addEventListener('offline', checkAndNotify);

    // Watch for Telegram viewport changes if available
    if ((window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.onEvent('viewportChanged', checkAndNotify);
    }

    // Return cleanup function
    return () => {
        // Remove all listeners
    };
}
```

### Monitored Events:
- Display mode changes (PWA installation)
- Online/offline status
- Telegram viewport changes
- Window resize (optional)

## Server-Side Rendering Support

```typescript
private createServerSideInfo(): PlatformInfo {
    return {
        type: 'web',
        os: 'unknown',
        device: 'desktop',
        domainMode: 'unknown',
        environment: this.options.environment || 'unknown',
        isPWA: false,
        isTelegram: false,
        isNative: false,
        isWeb: true,
        isMobile: false,
        isDesktop: true,
        // ... all boolean flags set to safe defaults
        userAgent: '',
        shouldShowTMAWarning: false,
        screen: { width: 0, height: 0, pixelRatio: 1 }
    };
}
```

**SSR Strategy:**
- Return safe defaults when `window` is undefined
- Allow environment override via options
- Provide consistent API surface

## Additional Detection Utilities

### 1. PWA Installation Check

```typescript
isPWAInstallable(): boolean {
    // Check if already installed
    if (this.detectPWA()) return false;

    // Check for manifest
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;

    // Check for service worker support
    const hasServiceWorker = 'serviceWorker' in navigator;

    // Check for HTTPS or localhost
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

    return hasManifest && hasServiceWorker && isSecure;
}
```

### 2. Display Mode Detection

```typescript
getDisplayMode(): string {
    const modes = ['fullscreen', 'standalone', 'minimal-ui', 'window-controls-overlay'];

    for (const mode of modes) {
        if (window.matchMedia(`(display-mode: ${mode})`).matches) {
            return mode;
        }
    }

    // iOS specific
    if ('standalone' in navigator && (navigator as any).standalone) {
        return 'standalone-ios';
    }

    return 'browser';
}
```

### 3. Deep Linking for TMA

```typescript
checkTMAAvailability(botUsername: string): TMAAvailability {
    if (this.detectTelegram()) {
        return { isAvailable: true };
    }

    // Generate Telegram bot URL for deep linking
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const encodedUrl = encodeURIComponent(currentUrl);
    const botUrl = `https://t.me/${botUsername}?start=${encodedUrl}`;

    return {
        isAvailable: false,
        reason: 'Not running in Telegram Mini App environment',
        botUrl
    };
}
```

## Best Practices and Recommendations

### 1. Performance Optimization

- **Cache detection results**: Store in memory or session storage
- **Lazy detection**: Only detect what's needed
- **Batch operations**: Combine multiple detections

### 2. Accuracy Improvements

- **Multiple signals**: Never rely on single indicator
- **Platform APIs first**: Trust platform-specific APIs over User Agent
- **Validation layers**: Verify detection with multiple methods

### 3. Edge Case Handling

- **iPadOS 13+**: Always check touch points for Mac platform
- **TMA native apps**: Handle async initData loading
- **PWA on iOS**: Use navigator.standalone check
- **Browser spoofing**: Validate with feature detection

### 4. Testing Recommendations

Test on real devices when possible:
- iOS Safari, Chrome
- Android Chrome, Samsung Internet
- Telegram iOS/Android/Desktop
- PWA on various platforms
- Capacitor apps on iOS/Android

### 5. Future Considerations

- **User Agent reduction**: Prepare for reduced UA information
- **Client Hints API**: Consider migration when widely supported
- **Feature detection**: Increase reliance on capability detection
- **Privacy regulations**: Respect user privacy choices

## Conclusion

The platform detection system provides comprehensive, accurate detection across all major web platforms. By following a priority-based approach and handling numerous edge cases, it ensures reliable platform identification for optimal user experience adaptation.