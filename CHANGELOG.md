# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2025-11-08

### Added

#### 🚀 Client Hints API Support
- **User-Agent Client Hints API** integration for enhanced accuracy on Chrome/Edge
- `detectPlatformAsync()` function for async detection with Client Hints
- `ClientHintsDetector` class for accessing Client Hints functionality
- OS version detection (Windows 11, macOS 11+, etc.)
- Device model and architecture detection via Client Hints
- Automatic fallback to traditional detection when Client Hints unavailable

#### 🎯 Feature-Based Detection
- `FeatureDetector` class for capability-based device detection
- Pointer precision detection (fine vs coarse)
- Hover capability detection
- Touch support and maxTouchPoints analysis
- Screen information and device memory detection
- Feature-based device type inference (more reliable than UA alone)

#### 📊 Detection Confidence Scoring
- Confidence scores for overall, OS, device, and browser detection
- Automatic confidence reduction for frozen/reduced user agents
- Visibility into detection reliability

#### 🎨 Browser Family Detection
- Detect browser rendering engine (Chromium, WebKit, Gecko)
- `browserFamily` field in PlatformInfo
- Useful for browser compatibility checks

#### ⚡ Performance Optimizations
- Result caching with configurable TTL (default 5 seconds)
- `clearCache()` method for manual cache invalidation
- Reduced redundant detector instantiation

#### 🔍 Enhanced PWA Detection
- Support for `window-controls-overlay` display mode (Chrome 2025)
- Window Controls Overlay API detection
- Better desktop PWA identification

### Changed
- `PlatformInfo` interface extended with new optional fields:
  - `osVersion?: string` - Operating system version
  - `browserFamily?: BrowserFamily` - Browser rendering engine
  - `architecture?: string` - CPU architecture
  - `deviceModel?: string` - Device model name
  - `confidence?: DetectionConfidence` - Detection confidence scores

- `PlatformDetectorOptions` interface extended:
  - `useClientHints?: boolean` - Enable Client Hints (default: false)
  - `useFeatureDetection?: boolean` - Enable feature detection (default: true)
  - `cacheTTL?: number` - Cache time-to-live in milliseconds (default: 5000)

### Migration Guide

#### Using Client Hints (Async Detection)
```typescript
// Before
const platform = detectPlatform();

// After (with Client Hints for better accuracy)
const platform = await detectPlatformAsync({ useClientHints: true });
console.log('Windows version:', platform.osVersion); // "11" on Windows 11

// Or using detector instance
const detector = createPlatformDetector({ useClientHints: true });
const platform = await detector.detectAsync();
```

#### Feature Detection
```typescript
import { FeatureDetector } from '@dfsol/platform-detector';

// Detect device features
const features = FeatureDetector.detect();
console.log('Touch support:', features.touch);
console.log('Pointer type:', features.pointer); // 'fine' or 'coarse'

// Get inferred device type from features
const result = FeatureDetector.detectWithInference();
console.log('Inferred device:', result.inferredDevice);
console.log('Confidence:', result.confidence);
```

#### Browser Family
```typescript
const platform = detectPlatform();
if (platform.browserFamily === 'chromium') {
    // Use Chromium-specific features
}
```

#### Performance Optimization
```typescript
// Reuse detector instance
const detector = createPlatformDetector({ cacheTTL: 10000 });
const platform1 = detector.detect(); // Fresh detection
const platform2 = detector.detect(); // Cached (within 10s)

// Clear cache manually
detector.clearCache();
const platform3 = detector.detect(); // Fresh detection
```

### Browser Support
- Client Hints API: Chrome/Edge 101+, Opera (Safari/Firefox not supported)
- Feature Detection: All modern browsers
- Window Controls Overlay: Chrome 104+

### Notes
- Client Hints requires HTTPS or localhost
- Some Client Hints data requires user permission
- Feature detection cannot be spoofed, providing more reliable results
- Confidence scores help identify when detection may be uncertain

---

## [0.3.0] - Previous Release
- Enhanced iPadOS 13+ detection
- Better PWA detection across all display modes
- Priority-based platform detection
- Browser type detection
- Real-time platform monitoring
- Utility functions for common use cases
- Comprehensive test examples
- Focused on core platforms: Web, PWA, TMA, Native

## [0.2.0] - Initial Public Release
- Basic platform detection
- Telegram Mini App support
- PWA detection
- Capacitor support
