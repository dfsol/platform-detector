/**
 * Platform types that can be detected
 */
export type PlatformType = 'web' | 'pwa' | 'tma' | 'native';

/**
 * Operating system types
 */
export type OSType = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';

/**
 * Device form factor
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Domain mode for application
 */
export type DomainMode = 'app' | 'tma' | 'unknown';

/**
 * Complete platform information
 */
export interface PlatformInfo {
	/** Primary platform type */
	type: PlatformType;

	/** Operating system */
	os: OSType;

	/** Device form factor */
	device: DeviceType;

	/** Domain mode (app.* or tg.*) */
	domainMode: DomainMode;

	/** Is running as PWA (installed) */
	isPWA: boolean;

	/** Is running in Telegram Mini App */
	isTelegram: boolean;

	/** Is running as native mobile app (Capacitor/Cordova) */
	isNative: boolean;

	/** Is running in standard web browser */
	isWeb: boolean;

	/** Is mobile OS (iOS or Android) */
	isMobile: boolean;

	/** Is desktop OS (macOS, Windows, Linux) */
	isDesktop: boolean;

	/** Is iOS (web, PWA, or native) */
	isIOS: boolean;

	/** Is Android (web, PWA, or native) */
	isAndroid: boolean;

	/** Is macOS (web or PWA) */
	isMacOS: boolean;

	/** Is Windows (web or PWA) */
	isWindows: boolean;

	/** Is Linux (web or PWA) */
	isLinux: boolean;

	/** Browser user agent string */
	userAgent: string;

	/** Should show TMA mismatch warning */
	shouldShowTMAWarning: boolean;
}

/**
 * Configuration options for platform detection
 */
export interface PlatformDetectorOptions {
	/** Custom user agent string (for testing) */
	userAgent?: string;

	/** Custom hostname (for testing) */
	hostname?: string;

	/** Enable debug logging */
	debug?: boolean;

	/** Telegram web app object (for TMA detection) */
	telegramWebApp?: any;
}

/**
 * Result of TMA availability check
 */
export interface TMAAvailability {
	/** Is TMA available */
	isAvailable: boolean;

	/** Reason if not available */
	reason?: string;

	/** Telegram bot URL for deep linking */
	botUrl?: string;
}
