# Platform Detector Improvement Tasks

Based on comprehensive research of platform detection technologies in November 2025, here are prioritized tasks to improve detection accuracy and modernize the library.

## 🔴 High Priority Tasks (Implement First)

### 1. Add User-Agent Client Hints API Support
**Why:** Future-proofing for reduced user agents, better OS version detection
**Impact:** High - Improves accuracy for Chrome/Edge users (70%+ market share)

```typescript
// Implementation outline
class PlatformDetector {
    async detectWithClientHints(): Promise<PlatformInfo> {
        if (!navigator.userAgentData) {
            return this.detect();
        }

        const hints = await navigator.userAgentData.getHighEntropyValues([
            'platform', 'platformVersion', 'model', 'formFactor'
        ]);

        return this.mergeWithHints(this.detect(), hints);
    }
}
```

**Tasks:**
- [ ] Create ClientHintsDetector class
- [ ] Add async detection method
- [ ] Merge hints with traditional detection
- [ ] Update types for ClientHintsData
- [ ] Add documentation for async usage

### 2. Implement Feature-Based Detection
**Why:** More reliable than user agent parsing, can't be spoofed
**Impact:** High - Reduces false positives

```typescript
// Key features to detect
interface DeviceFeatures {
    touch: boolean;
    maxTouchPoints: number;
    pointer: 'fine' | 'coarse' | 'none';
    hover: 'hover' | 'none';
    orientation: boolean;
}
```

**Tasks:**
- [ ] Create FeatureDetector class
- [ ] Implement pointer/hover media queries
- [ ] Add touch capability detection
- [ ] Integrate with main detector
- [ ] Use features to validate UA detection

### 3. Update PWA Detection for 2025 Standards
**Why:** Chrome now reports 'window-controls-overlay' instead of 'standalone'
**Impact:** High - Broken PWA detection in latest Chrome

```typescript
private detectPWA(): boolean {
    // Must check window-controls-overlay
    const displayModes = [
        'standalone',
        'fullscreen',
        'minimal-ui',
        'window-controls-overlay' // NEW
    ];

    // Check Window Controls Overlay API
    if (navigator.windowControlsOverlay?.visible) {
        return true;
    }
}
```

**Tasks:**
- [ ] Add window-controls-overlay to display modes
- [ ] Check navigator.windowControlsOverlay API
- [ ] Test on Chrome 120+
- [ ] Update documentation

### 4. Create Comprehensive Test Suite
**Why:** Ensure detection accuracy across all platforms
**Impact:** High - Prevents regression, ensures quality

**Tasks:**
- [ ] Set up test framework (Jest/Vitest)
- [ ] Create user agent test database
- [ ] Add tests for each detection method
- [ ] Test edge cases (iPadOS, TMA, etc.)
- [ ] Add CI/CD integration

## 🟡 Medium Priority Tasks

### 5. Improve Android Tablet Detection
**Why:** Current method using "mobile" keyword is unreliable
**Impact:** Medium - Affects ~10% of Android users

**Tasks:**
- [ ] Use Client Hints formFactor when available
- [ ] Add known tablet model database
- [ ] Improve screen size heuristics
- [ ] Add tablet-specific user agent patterns

### 6. Add Performance Optimizations
**Why:** Utility functions create new detector instances each time
**Impact:** Medium - Performance improvement

**Tasks:**
- [ ] Implement singleton pattern for shared detector
- [ ] Add caching with TTL (5 seconds)
- [ ] Lazy load detection features
- [ ] Optimize regex patterns

### 7. Add Browser Family Detection
**Why:** Useful for checking Chromium-based browsers
**Impact:** Medium - Better compatibility checks

**Tasks:**
- [ ] Detect Chromium vs WebKit vs Gecko
- [ ] Add isChromeFamily() helper
- [ ] Identify Electron apps
- [ ] Document browser engine detection

## 🟢 Low Priority Tasks

### 8. Add Bot Detection
**Why:** Filter out bots from analytics
**Impact:** Low - Nice to have

**Tasks:**
- [ ] Create bot user agent patterns
- [ ] Add isBot() helper function
- [ ] Support AI bot detection
- [ ] Document bot patterns

### 9. Add Detection Confidence Score
**Why:** Transparency about detection reliability
**Impact:** Low - User confidence

**Tasks:**
- [ ] Calculate confidence based on methods used
- [ ] Reduce score for frozen UAs
- [ ] Add confidence to PlatformInfo
- [ ] Document confidence levels

### 10. Extend Device Database
**Why:** Better device model recognition
**Impact:** Low - Incremental improvement

**Tasks:**
- [ ] Add more device models
- [ ] Include foldable phones
- [ ] Add gaming consoles
- [ ] Support smart TVs

## Implementation Plan

### Phase 1 (Week 1-2)
1. Set up testing infrastructure
2. Implement Client Hints API
3. Add feature detection
4. Update PWA detection

### Phase 2 (Week 3)
5. Improve tablet detection
6. Add performance optimizations
7. Create test suite

### Phase 3 (Week 4)
8. Add browser family detection
9. Bot detection
10. Documentation updates

## Breaking Changes

### Minimal Breaking Changes
- New async methods alongside sync ones
- Additional properties in PlatformInfo
- New optional parameters

### Potential Breaking Changes
- None identified if implemented carefully

## Migration Guide

### For Client Hints (async detection)
```typescript
// Before
const platform = detectPlatform();

// After (with Client Hints)
const platform = await detectPlatformAsync();
// Or use sync with fallback
const platform = detectPlatform(); // Still works
```

### For Feature Detection
```typescript
// Automatically integrated
const platform = detectPlatform();
// Now includes feature-based validation
```

## Success Metrics

- [ ] Client Hints working on Chrome/Edge
- [ ] PWA detection fixed for Chrome 120+
- [ ] 95%+ test coverage
- [ ] No performance regression
- [ ] Documentation complete

## Resources Needed

- Testing devices/browsers
- BrowserStack or similar for testing
- Time: ~2-4 weeks for all tasks
- Review from team

## Notes

1. **Backward Compatibility:** All changes should maintain backward compatibility
2. **Progressive Enhancement:** New features should enhance, not replace existing detection
3. **Documentation:** Every new feature needs documentation and examples
4. **Testing:** Each feature needs comprehensive tests before merge

---

*Generated: November 2025*
*Based on: PLATFORM_DETECTION_RESEARCH.md*