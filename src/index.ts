/**
 * @dfsol/platform-detector
 * Universal platform detector for web, PWA, Telegram Mini Apps, and native mobile applications
 */

// Main exports
export {
    PlatformDetector,
    createPlatformDetector,
    detectPlatform,
} from "./detector.js";

// Client Hints and Feature Detection exports
export { ClientHintsDetector } from "./client-hints.js";
export { FeatureDetector } from "./feature-detector.js";
export type { ClientHintsData, ClientHintsResult } from "./client-hints.js";
export type { DeviceFeatures, FeatureDetectionResult } from "./feature-detector.js";

// Internal imports for utility functions
import { createPlatformDetector } from "./detector.js";
import type {
    PlatformInfo,
    PlatformType,
    PlatformDetectorOptions as PlatformDetectorOptionsType,
} from "./types.js";

export {
    loadTelegramSDK,
    shouldLoadTelegramSDK,
    getTelegramWebApp,
} from "./telegram-sdk.js";

export { verifyTelegramInitData } from "./telegram-init-data.js";

export {
    isTmaJsSdkAvailable,
    isTelegramViaTmaJs,
    getTmaJsSdk,
    getTelegramPlatformFromTmaJs,
    getTelegramInitDataFromTmaJs,
    getViewportFromTmaJs,
    getThemeParamsFromTmaJs,
    initializeTmaJs,
} from "./tma-sdk.js";

export type {
    PlatformInfo,
    PlatformType,
    OSType,
    DeviceType,
    DomainMode,
    EnvironmentType,
    PlatformDetectorOptions,
    TMAAvailability,
    CapacitorInfo,
    TelegramInfo,
    TelegramPlatform,
    TelegramSDKSource,
    ScreenInfo,
    TelegramInitData,
    TelegramInitDataValidationOptions,
    TelegramInitDataValidationResult,
    TelegramInitDataValidationErrorCode,
    TelegramWebAppUser,
    TelegramWebAppChat,
    BrowserFamily,
    DetectionConfidence,
} from "./types.js";

export type { TmaJsSdkInstance } from "./tma-sdk.js";

/**
 * Quick utility functions for common detection needs
 */

/**
 * Check if running on mobile device (iOS or Android)
 */
export function isMobileDevice(): boolean {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.isMobile;
}

/**
 * Check if running on iOS (any context)
 */
export function isIOS(): boolean {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.isIOS;
}

/**
 * Check if running on Android (any context)
 */
export function isAndroid(): boolean {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.isAndroid;
}

/**
 * Check if running as PWA
 */
export function isPWA(): boolean {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.isPWA;
}

/**
 * Check if running in Telegram Mini App
 */
export function isTelegramMiniApp(): boolean {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.isTelegram;
}

/**
 * Check if running as native app (Capacitor/Cordova)
 */
export function isNativeApp(): boolean {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.isNative;
}

/**
 * Get current browser type
 */
export function getBrowserType(): string {
    const detector = createPlatformDetector();
    return detector.getBrowserType();
}

/**
 * Get current platform type
 */
export function getPlatformType(): PlatformType {
    const detector = createPlatformDetector();
    const info = detector.detect();
    return info.type;
}

/**
 * Get display mode (for PWA)
 */
export function getDisplayMode(): string {
    const detector = createPlatformDetector();
    return detector.getDisplayMode();
}

/**
 * Check if app can be installed as PWA
 */
export function canInstallPWA(): boolean {
    const detector = createPlatformDetector();
    return detector.isPWAInstallable();
}

/**
 * Monitor platform changes
 */
export function watchPlatformChanges(
    callback: (info: PlatformInfo) => void,
): () => void {
    const detector = createPlatformDetector();
    return detector.watchForChanges(callback);
}

/**
 * Async platform detection with Client Hints support
 * Provides enhanced accuracy for OS version and device info on Chrome/Edge
 *
 * @param options - Detection options
 * @returns Promise resolving to platform information
 *
 * @example
 * ```typescript
 * const platform = await detectPlatformAsync({ useClientHints: true });
 * console.log('OS:', platform.os, platform.osVersion);
 * console.log('Device:', platform.device);
 * ```
 */
export async function detectPlatformAsync(
    options?: PlatformDetectorOptionsType,
): Promise<PlatformInfo> {
    const detector = createPlatformDetector(options);
    return detector.detectAsync();
}
