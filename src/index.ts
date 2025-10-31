/**
 * @dfsol/platform-detector
 * Universal platform detector for web, PWA, TWA, Telegram Mini Apps, and native mobile applications
 */

export { PlatformDetector, createPlatformDetector, detectPlatform } from './detector.js';

export {
	loadTelegramSDK,
	shouldLoadTelegramSDK,
	getTelegramWebApp
} from './telegram-sdk.js';

export {
	isTmaJsSdkAvailable,
	isTelegramViaTmaJs,
	getTmaJsSdk,
	getTelegramPlatformFromTmaJs,
	getTelegramInitDataFromTmaJs,
	getViewportFromTmaJs,
	getThemeParamsFromTmaJs,
	initializeTmaJs
} from './tma-sdk.js';

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
	ScreenInfo
} from './types.js';

export type { TmaJsSdkInstance } from './tma-sdk.js';
