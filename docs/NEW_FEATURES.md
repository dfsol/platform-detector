# New Features Guide (v0.4.0)

## Table of Contents
1. [Client Hints API](#client-hints-api)
2. [Feature-Based Detection](#feature-based-detection)
3. [Detection Confidence Scores](#detection-confidence-scores)
4. [Browser Family Detection](#browser-family-detection)
5. [Performance Optimizations](#performance-optimizations)
6. [Enhanced PWA Detection](#enhanced-pwa-detection)

---

## Client Hints API

### Overview
User-Agent Client Hints API provides more accurate platform detection for Chromium-based browsers (Chrome, Edge, Opera) without relying solely on user agent strings.

### Browser Support
- ✅ Chrome/Edge 101+
- ✅ Opera
- ❌ Safari (not supported)
- ❌ Firefox (not supported)

### Key Benefits
- **Accurate OS versions**: Detect Windows 11 vs 10, macOS version
- **Device model**: Get actual device model name
- **Architecture**: Detect CPU architecture (x86, ARM, etc.)
- **Future-proof**: Works with reduced/frozen user agents

### Basic Usage

```typescript
import { detectPlatformAsync } from '@dfsol/platform-detector';

// Async detection with Client Hints
const platform = await detectPlatformAsync({ useClientHints: true });

console.log(platform.os);           // 'windows'
console.log(platform.osVersion);    // '11' (on Windows 11)
console.log(platform.architecture); // 'x86'
console.log(platform.deviceModel);  // Device model if available
```

### Using Detector Instance

```typescript
import { createPlatformDetector } from '@dfsol/platform-detector';

const detector = createPlatformDetector({
    useClientHints: true,
    debug: true
});

// Async method
const platform = await detector.detectAsync();
console.log('Enhanced detection:', platform);

// Sync method (no Client Hints)
const basicPlatform = detector.detect();
console.log('Basic detection:', basicPlatform);
```

### Advanced: Direct Client Hints Access

```typescript
import { ClientHintsDetector } from '@dfsol/platform-detector';

// Check if supported
if (ClientHintsDetector.isSupported()) {
    // Get high entropy hints
    const hints = await ClientHintsDetector.getHighEntropyHints();
    console.log('Platform:', hints?.platform);
    console.log('Platform version:', hints?.platformVersion);
    console.log('Model:', hints?.model);
    console.log('Architecture:', hints?.architecture);

    // Detect from hints
    const osInfo = ClientHintsDetector.detectOS(hints);
    console.log('OS:', osInfo);
}
```

### Detecting Windows 11

```typescript
const platform = await detectPlatformAsync({ useClientHints: true });

if (platform.isWindows && platform.osVersion === '11') {
    console.log('Running on Windows 11');
    // Enable Windows 11 specific features
}
```

### Detecting macOS Version

```typescript
const platform = await detectPlatformAsync({ useClientHints: true });

if (platform.isMacOS && platform.osVersion) {
    const version = parseInt(platform.osVersion);
    if (version >= 11) {
        console.log('Running on macOS 11 or later');
    }
}
```

---

## Feature-Based Detection

### Overview
Feature-based detection uses browser capabilities rather than user agent strings, providing more reliable device type detection.

### Key Benefits
- **Cannot be spoofed**: Based on actual browser capabilities
- **Validates UA detection**: Cross-check user agent results
- **Touch detection**: Accurate touch vs mouse detection
- **Hybrid devices**: Handles devices with both touch and mouse

### Basic Usage

```typescript
import { FeatureDetector } from '@dfsol/platform-detector';

// Detect all features
const features = FeatureDetector.detect();
console.log(features);
```

### Feature Properties

```typescript
interface DeviceFeatures {
    touch: boolean;              // Touch support
    maxTouchPoints: number;      // Max simultaneous touch points
    pointer: 'fine' | 'coarse' | 'none';  // Primary pointer precision
    hover: 'hover' | 'none';     // Hover capability
    anyPointer: 'fine' | 'coarse' | 'none';  // Any pointer (hybrid devices)
    anyHover: 'hover' | 'none';  // Any hover capability
    orientation: boolean;        // Orientation change support
    deviceMemory?: number;       // Device RAM in GB
    hardwareConcurrency?: number; // CPU cores
    connection?: {
        effectiveType?: string;  // Network type (4g, 3g, etc.)
        downlink?: number;       // Mbps
        rtt?: number;            // Round trip time
    };
    screen: {
        width: number;
        height: number;
        pixelRatio: number;
        orientation?: string;
    };
}
```

### Device Type Inference

```typescript
const result = FeatureDetector.detectWithInference();

console.log('Features:', result.features);
console.log('Inferred device:', result.inferredDevice);  // 'mobile' | 'tablet' | 'desktop'
console.log('Confidence:', result.confidence);           // 0-100

// Desktop: fine pointer + hover + no touch
// Mobile: coarse pointer + no hover + touch
// Tablet: touch + larger screen
```

### Detecting Touch Devices

```typescript
const features = FeatureDetector.detect();

if (features.touch) {
    if (FeatureDetector.isLikelyPhone(features)) {
        console.log('Phone detected');
        // Enable mobile-specific UI
    } else if (FeatureDetector.isLikelyTablet(features)) {
        console.log('Tablet detected');
        // Enable tablet-specific UI
    }
}
```

### Detecting Hybrid Devices

```typescript
const features = FeatureDetector.detect();

if (features.anyPointer === 'fine' && features.touch) {
    console.log('Hybrid device (e.g., Surface)');
    // Enable both touch and mouse interactions
}
```

### Validating UA Detection

```typescript
import { detectPlatform, FeatureDetector } from '@dfsol/platform-detector';

const platform = detectPlatform({ useFeatureDetection: true });
const features = FeatureDetector.detect();

const validation = FeatureDetector.validateDeviceType(
    platform.device,
    features
);

console.log('Valid:', validation.valid);
console.log('Confidence:', validation.confidence);
if (validation.reason) {
    console.log('Reason:', validation.reason);
}
```

---

## Detection Confidence Scores

### Overview
Confidence scores indicate how reliable the detection results are, helping you decide when to trust the results or request user confirmation.

### Score Ranges
- **90-100**: Very confident (multiple confirmation signals)
- **70-89**: Confident (strong indicators)
- **50-69**: Moderate confidence (some uncertainty)
- **Below 50**: Low confidence (significant uncertainty)

### Usage

```typescript
const platform = detectPlatform();

console.log('Overall confidence:', platform.confidence?.overall);
console.log('OS confidence:', platform.confidence?.os);
console.log('Device confidence:', platform.confidence?.device);
console.log('Browser confidence:', platform.confidence?.browser);

if (platform.confidence && platform.confidence.overall < 70) {
    console.warn('Detection confidence is low, results may be inaccurate');
    // Maybe ask user to confirm
}
```

### Factors Affecting Confidence

```typescript
// Factors that reduce confidence:
// - Frozen/reduced user agent strings (-20 overall, -30 OS)
// - Client Hints available but not used (-10 overall, -15 OS)
// - Unknown OS detected (-25 overall, OS confidence = 30)
// - Unknown browser family (-10 overall, -20 browser)

// Factors that increase confidence:
// - Feature detection enabled (+5 overall, +10 device)
// - Client Hints used (implicit improvement)
```

---

## Browser Family Detection

### Overview
Detect the browser's rendering engine (Chromium, WebKit, Gecko) for compatibility checks.

### Usage

```typescript
const platform = detectPlatform();

console.log('Browser family:', platform.browserFamily);
// 'chromium' | 'webkit' | 'gecko' | 'unknown'

switch (platform.browserFamily) {
    case 'chromium':
        // Chrome, Edge, Opera, Samsung Internet
        console.log('Chromium-based browser');
        break;
    case 'webkit':
        // Safari
        console.log('WebKit browser');
        break;
    case 'gecko':
        // Firefox
        console.log('Gecko browser');
        break;
}
```

### Use Cases

#### Feature Detection

```typescript
if (platform.browserFamily === 'chromium') {
    // Use Chromium-specific APIs
    const hints = await ClientHintsDetector.getHighEntropyHints();
}
```

#### Polyfill Loading

```typescript
if (platform.browserFamily === 'webkit') {
    // Load WebKit-specific polyfills
    await import('./polyfills/webkit');
}
```

#### Browser-Specific Workarounds

```typescript
if (platform.browserFamily === 'gecko') {
    // Apply Firefox-specific CSS
    document.body.classList.add('firefox');
}
```

---

## Performance Optimizations

### Caching

Detection results are cached to avoid redundant processing.

```typescript
const detector = createPlatformDetector({
    cacheTTL: 10000  // Cache for 10 seconds
});

const result1 = detector.detect();  // Fresh detection
const result2 = detector.detect();  // Cached (same reference)
console.log(result1 === result2);   // true

// Clear cache manually
detector.clearCache();
const result3 = detector.detect();  // Fresh detection
```

### Reusing Detector Instances

```typescript
// ❌ Bad: Creates new detector each time
function checkMobile() {
    const detector = createPlatformDetector();
    return detector.detect().isMobile;
}

// ✅ Good: Reuse detector instance
const detector = createPlatformDetector();

function checkMobile() {
    return detector.detect().isMobile;
}
```

### Singleton Pattern

```typescript
// Create a singleton detector
let sharedDetector: PlatformDetector | null = null;

export function getSharedDetector(): PlatformDetector {
    if (!sharedDetector) {
        sharedDetector = createPlatformDetector({
            useFeatureDetection: true,
            cacheTTL: 5000
        });
    }
    return sharedDetector;
}

// Usage
const platform = getSharedDetector().detect();
```

---

## Enhanced PWA Detection

### Window Controls Overlay Support (2025)

Chrome now uses `window-controls-overlay` display mode for desktop PWAs with custom title bars.

```typescript
const platform = detectPlatform();

if (platform.isPWA) {
    const displayMode = detector.getDisplayMode();

    switch (displayMode) {
        case 'standalone':
            console.log('Standard PWA');
            break;
        case 'window-controls-overlay':
            console.log('Desktop PWA with custom title bar');

            // Access Window Controls Overlay API
            if (navigator.windowControlsOverlay?.visible) {
                const rect = navigator.windowControlsOverlay.getTitlebarAreaRect();
                console.log('Title bar width:', rect.width);
            }
            break;
    }
}
```

### Display Mode Detection

```typescript
import { getDisplayMode } from '@dfsol/platform-detector';

const mode = getDisplayMode();
// 'standalone' | 'fullscreen' | 'minimal-ui' | 'window-controls-overlay' | 'browser' | 'standalone-ios'
```

---

## Complete Example

```typescript
import {
    detectPlatform,
    detectPlatformAsync,
    FeatureDetector,
    ClientHintsDetector,
    createPlatformDetector
} from '@dfsol/platform-detector';

async function detectEnvironment() {
    // Basic detection
    const basic = detectPlatform();
    console.log('Basic:', basic);

    // Enhanced async detection with Client Hints
    if (ClientHintsDetector.isSupported()) {
        const enhanced = await detectPlatformAsync({ useClientHints: true });
        console.log('Enhanced:', enhanced);
        console.log('Windows version:', enhanced.osVersion);
    }

    // Feature detection
    const features = FeatureDetector.detectWithInference();
    console.log('Features:', features.features);
    console.log('Inferred device:', features.inferredDevice);

    // Confidence check
    if (basic.confidence && basic.confidence.overall < 70) {
        console.warn('Low confidence detection');
    }

    // Browser family check
    if (basic.browserFamily === 'chromium') {
        console.log('Chromium-based features available');
    }

    // Reusable detector
    const detector = createPlatformDetector({
        useFeatureDetection: true,
        cacheTTL: 10000,
        debug: true
    });

    const platform = detector.detect();
    console.log('Cached detection:', platform);
}

detectEnvironment();
```

---

## Migration from v0.3.0

### No Breaking Changes
All existing code continues to work without modifications.

### Recommended Updates

```typescript
// Before
const platform = detectPlatform();

// After (for better accuracy on Chrome/Edge)
const platform = await detectPlatformAsync({ useClientHints: true });

// Or enable for detector instance
const detector = createPlatformDetector({
    useClientHints: true,
    useFeatureDetection: true
});
```

### New Optional Fields
```typescript
interface PlatformInfo {
    // ... existing fields

    // New optional fields (safe to access)
    osVersion?: string;
    browserFamily?: BrowserFamily;
    architecture?: string;
    deviceModel?: string;
    confidence?: DetectionConfidence;
}
```

---

## Browser Compatibility

| Feature | Chrome | Edge | Safari | Firefox | Opera |
|---------|--------|------|--------|---------|-------|
| Client Hints | 101+ | 101+ | ❌ | ❌ | ✅ |
| Feature Detection | ✅ | ✅ | ✅ | ✅ | ✅ |
| Window Controls Overlay | 104+ | 104+ | ❌ | ❌ | 90+ |
| Confidence Scores | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browser Family | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Best Practices

1. **Use Async Detection on Chrome/Edge**
   ```typescript
   if (ClientHintsDetector.isSupported()) {
       const platform = await detectPlatformAsync({ useClientHints: true });
   }
   ```

2. **Check Confidence Scores**
   ```typescript
   if (platform.confidence.overall < 70) {
       // Handle uncertainty
   }
   ```

3. **Reuse Detector Instances**
   ```typescript
   const detector = createPlatformDetector();
   // Reuse throughout app lifecycle
   ```

4. **Enable Feature Detection**
   ```typescript
   const detector = createPlatformDetector({ useFeatureDetection: true });
   ```

5. **Handle Browser Differences**
   ```typescript
   switch (platform.browserFamily) {
       case 'chromium':
           // Chromium-specific code
           break;
       case 'webkit':
           // Safari-specific code
           break;
   }
   ```
