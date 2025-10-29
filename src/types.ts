/**
 * Platform types that can be detected
 */
export type PlatformType = 'web' | 'pwa' | 'tma' | 'native' | 'twa';

/**
 * Operating system types
 */
export type OSType = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'chromeos' | 'unknown';

/**
 * Device form factor
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Domain mode for application
 */
export type DomainMode = 'app' | 'tma' | 'unknown';

/**
 * Telegram-specific platform identifiers
 */
export type TelegramPlatform =
	| 'ios'
	| 'android'
	| 'android_x'
	| 'macos'
	| 'tdesktop'
	| 'weba'
	| 'webk'
	| 'web'
	| 'unknown';

/**
 * Detailed Capacitor information from native API
 */
export interface CapacitorInfo {
	/** Is running on native platform */
	isNativePlatform: boolean;

	/** Native platform name */
	platform: 'ios' | 'android' | 'web' | 'unknown';

	/** Check if plugin is available */
	isPluginAvailable: (plugin: string) => boolean;

	/** Capacitor native version */
	nativeVersion?: string;
}

/**
 * SDK source type
 */
export type TelegramSDKSource = 'native' | 'tma.js' | 'unknown';

/**
 * Detailed Telegram information from WebApp SDK
 */
export interface TelegramInfo {
	/** Telegram platform identifier */
	platform: TelegramPlatform;

	/** Telegram WebApp SDK version */
	version: string;

	/** SDK source (native Telegram SDK or @tma.js) */
	sdkSource: TelegramSDKSource;

	/** Current color scheme */
	colorScheme: 'light' | 'dark';

	/** Current viewport height */
	viewportHeight: number;

	/** Stable viewport height (without keyboard) */
	viewportStableHeight: number;

	/** Is Mini App expanded */
	isExpanded: boolean;

	/** Is closing confirmation enabled */
	isClosingConfirmationEnabled: boolean;

	/** Header color */
	headerColor: string;

	/** Background color */
	backgroundColor: string;

	/** Safe area inset top */
	safeAreaInsetTop: number;

	/** Safe area inset bottom */
	safeAreaInsetBottom: number;

	/** Content safe area inset top */
	contentSafeAreaInsetTop: number;

	/** Content safe area inset bottom */
	contentSafeAreaInsetBottom: number;

	/** Init data string */
	initData?: string;

	/** User info from init data */
	user?: {
		id: number;
		first_name: string;
		last_name?: string;
		username?: string;
		language_code?: string;
		is_premium?: boolean;
	};

	/** Theme parameters (from @tma.js SDK) */
	themeParams?: {
		backgroundColor?: string;
		textColor?: string;
		hintColor?: string;
		linkColor?: string;
		buttonColor?: string;
		buttonTextColor?: string;
	};
}

/**
 * Screen information
 */
export interface ScreenInfo {
	/** Screen width in pixels */
	width: number;

	/** Screen height in pixels */
	height: number;

	/** Device pixel ratio */
	pixelRatio: number;
}

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

	/** Is running as TWA (Trusted Web Activity on Android) */
	isTWA: boolean;

	/** Is running in Telegram Mini App */
	isTelegram: boolean;

	/** Is running as native mobile app (Capacitor/Cordova) */
	isNative: boolean;

	/** Is running in standard web browser */
	isWeb: boolean;

	/** Is mobile OS (iOS or Android) */
	isMobile: boolean;

	/** Is desktop OS (macOS, Windows, Linux, ChromeOS) */
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

	/** Is ChromeOS (web or PWA) */
	isChromeOS: boolean;

	/** Browser user agent string */
	userAgent: string;

	/** Should show TMA mismatch warning */
	shouldShowTMAWarning: boolean;

	/** Screen information */
	screen: ScreenInfo;

	/** Detailed Capacitor information (if available) */
	capacitor?: CapacitorInfo;

	/** Detailed Telegram information (if available) */
	telegram?: TelegramInfo;
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
