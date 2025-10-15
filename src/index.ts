/**
 * @dfsol/platform-detector
 * Universal platform detector for web, PWA, Telegram Mini Apps, and native mobile applications
 */

export { PlatformDetector, createPlatformDetector, detectPlatform } from './detector.js';

export type {
	PlatformInfo,
	PlatformType,
	OSType,
	DeviceType,
	DomainMode,
	PlatformDetectorOptions,
	TMAAvailability
} from './types.js';
