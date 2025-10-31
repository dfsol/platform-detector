import type {
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
import { getTelegramWebApp } from './telegram-sdk.js';
import {
	isTmaJsSdkAvailable,
	isTelegramViaTmaJs,
	getTelegramPlatformFromTmaJs,
	getTelegramInitDataFromTmaJs,
	getViewportFromTmaJs,
	getThemeParamsFromTmaJs,
	getTmaJsSdk
} from './tma-sdk.js';

/**
 * Detects the current platform and environment
 */
export class PlatformDetector {
	private options: PlatformDetectorOptions;

	constructor(options: PlatformDetectorOptions = {}) {
		this.options = options;
	}

	/**
	 * Detect platform information
	 */
	detect(): PlatformInfo {
		if (typeof window === 'undefined') {
			return this.createServerSideInfo();
		}

		const userAgent = this.options.userAgent || navigator.userAgent;
		const hostname = this.options.hostname || window.location.hostname;

		const os = this.detectOS(userAgent);
		const device = this.detectDevice(userAgent, os);
		const domainMode = this.detectDomainMode(hostname);
		const environment = this.detectEnvironment();
		const isNativeCapacitor = this.detectNative();
		const isTelegram = this.detectTelegram();
		const isPWA = this.detectPWA();
		const isTWA = this.detectTWA();

		// Get detailed info from native APIs
		const capacitor = this.getCapacitorInfo();
		const telegram = this.getTelegramInfo();

		// Determine if truly native (Capacitor on native platform)
		const isNative = isNativeCapacitor && capacitor?.isNativePlatform === true;

		// Determine primary platform type
		let type: PlatformType = 'web';
		if (isNative) type = 'native';
		else if (isTelegram) type = 'tma';
		else if (isTWA) type = 'twa';
		else if (isPWA) type = 'pwa';

		// Check if TMA warning should be shown
		const shouldShowTMAWarning = domainMode === 'tma' && !isTelegram;

		// Get screen info
		const screen = this.getScreenInfo();

		// Determine device type considering Telegram platform
		let finalDevice = device;
		let finalIsMobile = device === 'mobile' || device === 'tablet';

		if (isTelegram && telegram?.platform) {
			// For TMA, trust Telegram's platform info
			const tgPlatform = telegram.platform;
			if (tgPlatform === 'ios' || tgPlatform === 'android' || tgPlatform === 'android_x') {
				finalDevice = 'mobile';
				finalIsMobile = true;
			} else if (tgPlatform === 'macos' || tgPlatform === 'tdesktop') {
				finalDevice = 'desktop';
				finalIsMobile = false;
			}
			// weba, webk, web - keep device detection from user agent
		}

		const info: PlatformInfo = {
			type,
			os,
			device: finalDevice,
			domainMode,
			environment,
			isPWA,
			isTWA,
			isTelegram,
			isNative,
			isWeb: !isNative,
			isMobile: finalIsMobile,
			isDesktop: !finalIsMobile,
			isIOS: os === 'ios',
			isAndroid: os === 'android',
			isMacOS: os === 'macos',
			isWindows: os === 'windows',
			isLinux: os === 'linux',
			isChromeOS: os === 'chromeos',
			userAgent,
			shouldShowTMAWarning,
			screen,
			capacitor,
			telegram
		};

		if (this.options.debug) {
			console.log('[PlatformDetector]', info);
		}

		return info;
	}

	/**
	 * Detect operating system from user agent
	 */
	private detectOS(userAgent: string): OSType {
		const ua = userAgent.toLowerCase();

		// Mobile OS detection (highest priority)
		if (/iphone|ipad|ipod/.test(ua)) return 'ios';
		if (/android/.test(ua)) return 'android';

		// Desktop OS detection
		if (/cros/.test(ua)) return 'chromeos';
		if (/mac os x|macintosh/.test(ua)) return 'macos';
		if (/windows|win32|win64/.test(ua)) return 'windows';
		if (/linux|x11/.test(ua) && !/android/.test(ua)) return 'linux';

		return 'unknown';
	}

	/**
	 * Detect device type from user agent and OS
	 */
	private detectDevice(userAgent: string, os: OSType): DeviceType {
		const ua = userAgent.toLowerCase();

		// Mobile OS = mobile device
		if (os === 'ios' || os === 'android') {
			// Check for tablet
			if (/ipad/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
				return 'tablet';
			}
			return 'mobile';
		}

		// Desktop OS = desktop device
		return 'desktop';
	}

	/**
	 * Detect domain mode (app.* vs tg.*)
	 */
	private detectDomainMode(hostname: string): DomainMode {
		if (hostname.startsWith('app.')) return 'app';
		if (hostname.startsWith('tg.')) return 'tma';
		return 'unknown';
	}

	/**
	 * Detect environment (development vs production)
	 */
	private detectEnvironment(): EnvironmentType {
		// Use override if provided
		if (this.options.environment) {
			return this.options.environment;
		}

		if (typeof window === 'undefined') return 'unknown';

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

	/**
	 * Detect if running as native mobile app (Capacitor/Cordova)
	 */
	private detectNative(): boolean {
		if (typeof window === 'undefined') return false;

		// Check for Capacitor
		if ('Capacitor' in window) {
			return true;
		}

		// Check for Cordova
		if ('cordova' in window || 'phonegap' in window) {
			return true;
		}

		// Check for Capacitor's native flag
		if (document.documentElement.classList.contains('capacitor')) {
			return true;
		}

		return false;
	}

	/**
	 * Detect if running in Telegram Mini App with strict checks
	 * Supports both native Telegram SDK and @tma.js SDK
	 */
	private detectTelegram(): boolean {
		if (typeof window === 'undefined') return false;

		// Priority 1: Check @tma.js SDK (more reliable)
		if (isTelegramViaTmaJs()) {
			return true;
		}

		// Priority 2: Use provided Telegram object if available
		if (this.options.telegramWebApp) {
			return this.validateTelegramWebApp(this.options.telegramWebApp);
		}

		// Priority 3: Check for native Telegram WebApp
		const webApp = getTelegramWebApp();
		if (!webApp) return false;

		return this.validateTelegramWebApp(webApp);
	}

	/**
	 * Validate Telegram WebApp with flexible checks for native app compatibility
	 */
	private validateTelegramWebApp(webApp: any): boolean {
		// WebApp must exist and have a version
		if (!webApp || !webApp.version) {
			return false;
		}

		// Check if we have actual Telegram init data
		const hasInitData = !!(
			webApp.initData ||
			(webApp.initDataUnsafe && Object.keys(webApp.initDataUnsafe).length > 0)
		);

		// Check for platform
		const hasPlatform = !!webApp.platform && webApp.platform !== 'unknown';

		// Check for colorScheme
		const hasColorScheme = !!webApp.colorScheme;

		// Native Telegram apps might not have initData immediately on launch
		// Platform + colorScheme + version is sufficient for native app detection
		// If initData is present, require all three indicators for highest confidence
		if (hasInitData) {
			return hasPlatform && hasColorScheme;
		}

		// Without initData, we need strong platform indicators
		// This handles native Telegram app launches where initData loads asynchronously
		return hasPlatform && hasColorScheme;
	}

	/**
	 * Detect if running as PWA (installed)
	 */
	private detectPWA(): boolean {
		if (typeof window === 'undefined') return false;

		// Check display mode
		if (window.matchMedia('(display-mode: standalone)').matches) {
			return true;
		}

		// Check minimal-ui mode
		if (window.matchMedia('(display-mode: minimal-ui)').matches) {
			return true;
		}

		// iOS Safari standalone mode
		if ('standalone' in navigator && (navigator as any).standalone) {
			return true;
		}

		return false;
	}

	/**
	 * Detect if running as TWA (Trusted Web Activity on Android)
	 */
	private detectTWA(): boolean {
		if (typeof window === 'undefined') return false;

		// TWA is identified by Android app referrer
		if (document.referrer.includes('android-app://')) {
			return true;
		}

		// Check for TWA-specific display mode with Android UA
		const userAgent = navigator.userAgent.toLowerCase();
		if (
			userAgent.includes('android') &&
			window.matchMedia('(display-mode: standalone)').matches
		) {
			// Could be TWA or PWA, check for TWA-specific indicators
			// TWA doesn't have Service Worker registered in some cases
			if (!navigator.serviceWorker) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get detailed Capacitor information from native API
	 */
	private getCapacitorInfo(): CapacitorInfo | undefined {
		if (typeof window === 'undefined' || !('Capacitor' in window)) {
			return undefined;
		}

		const Capacitor = (window as any).Capacitor;
		const isNativePlatform = Capacitor.isNativePlatform
			? Capacitor.isNativePlatform()
			: false;
		const platformName = Capacitor.getPlatform ? Capacitor.getPlatform() : 'unknown';

		let platform: 'ios' | 'android' | 'web' | 'unknown' = 'unknown';
		if (platformName === 'ios') platform = 'ios';
		else if (platformName === 'android') platform = 'android';
		else if (platformName === 'web') platform = 'web';

		return {
			isNativePlatform,
			platform,
			isPluginAvailable: (plugin: string) => {
				return Capacitor.isPluginAvailable ? Capacitor.isPluginAvailable(plugin) : false;
			},
			nativeVersion: Capacitor.nativeVersion
		};
	}

	/**
	 * Get detailed Telegram information from WebApp SDK
	 * Supports both native Telegram SDK and @tma.js SDK
	 */
	private getTelegramInfo(): TelegramInfo | undefined {
		let sdkSource: TelegramSDKSource = 'unknown';

		// Priority 1: Try @tma.js SDK
		if (isTmaJsSdkAvailable()) {
			const info = this.getTelegramInfoFromTmaJs();
			if (info) return info;
		}

		// Priority 2: Try native Telegram WebApp
		const webApp = this.options.telegramWebApp || getTelegramWebApp();
		if (!webApp) {
			return undefined;
		}

		sdkSource = 'native';

		return {
			platform: (webApp.platform || 'unknown') as TelegramPlatform,
			version: webApp.version || '0.0',
			sdkSource,
			colorScheme: webApp.colorScheme || 'dark',
			viewportHeight: webApp.viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 0),
			viewportStableHeight: webApp.viewportStableHeight || (typeof window !== 'undefined' ? window.innerHeight : 0),
			isExpanded: webApp.isExpanded || false,
			isClosingConfirmationEnabled: webApp.isClosingConfirmationEnabled || false,
			headerColor: webApp.headerColor || '#000000',
			backgroundColor: webApp.backgroundColor || '#ffffff',
			safeAreaInsetTop: webApp.safeAreaInset?.top || 0,
			safeAreaInsetBottom: webApp.safeAreaInset?.bottom || 0,
			contentSafeAreaInsetTop: webApp.contentSafeAreaInset?.top || 0,
			contentSafeAreaInsetBottom: webApp.contentSafeAreaInset?.bottom || 0,
			initData: webApp.initData,
			user: webApp.initDataUnsafe?.user
		};
	}

	/**
	 * Get Telegram information from @tma.js SDK
	 */
	private getTelegramInfoFromTmaJs(): TelegramInfo | undefined {
		const sdk = getTmaJsSdk();
		if (!sdk) return undefined;

		const viewport = getViewportFromTmaJs();
		const themeParams = getThemeParamsFromTmaJs();
		const platform = getTelegramPlatformFromTmaJs();
		const initData = getTelegramInitDataFromTmaJs();

		const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

		return {
			platform: (platform || 'unknown') as TelegramPlatform,
			version: sdk.version || '0.0',
			sdkSource: 'tma.js',
			colorScheme: themeParams?.backgroundColor?.includes('#') ? 'dark' : 'light', // Simple heuristic
			viewportHeight: viewport?.height || windowHeight,
			viewportStableHeight: viewport?.stableHeight || windowHeight,
			isExpanded: viewport?.isExpanded || false,
			isClosingConfirmationEnabled: false, // Not available in @tma.js
			headerColor: sdk.miniApp?.headerColor || themeParams?.backgroundColor || '#000000',
			backgroundColor: sdk.miniApp?.backgroundColor || themeParams?.backgroundColor || '#ffffff',
			safeAreaInsetTop: 0, // Not directly available in @tma.js
			safeAreaInsetBottom: 0,
			contentSafeAreaInsetTop: 0,
			contentSafeAreaInsetBottom: 0,
			initData: initData || undefined,
			user: sdk.initData?.parsed?.user,
			themeParams: themeParams || undefined
		};
	}

	/**
	 * Get screen information
	 */
	private getScreenInfo(): ScreenInfo {
		if (typeof window === 'undefined') {
			return { width: 0, height: 0, pixelRatio: 1 };
		}

		return {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelRatio: window.devicePixelRatio || 1
		};
	}

	/**
	 * Create server-side platform info (SSR)
	 */
	private createServerSideInfo(): PlatformInfo {
		return {
			type: 'web',
			os: 'unknown',
			device: 'desktop',
			domainMode: 'unknown',
			environment: this.options.environment || 'unknown',
			isPWA: false,
			isTWA: false,
			isTelegram: false,
			isNative: false,
			isWeb: true,
			isMobile: false,
			isDesktop: true,
			isIOS: false,
			isAndroid: false,
			isMacOS: false,
			isWindows: false,
			isLinux: false,
			isChromeOS: false,
			userAgent: '',
			shouldShowTMAWarning: false,
			screen: { width: 0, height: 0, pixelRatio: 1 }
		};
	}

	/**
	 * Check TMA availability and generate deep link
	 */
	checkTMAAvailability(botUsername: string): TMAAvailability {
		if (this.detectTelegram()) {
			return {
				isAvailable: true
			};
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

	/**
	 * Attempt to open URL in Telegram
	 */
	openInTelegram(botUsername: string): boolean {
		if (typeof window === 'undefined') return false;

		const availability = this.checkTMAAvailability(botUsername);

		if (availability.isAvailable) {
			// Already in Telegram
			return true;
		}

		if (availability.botUrl) {
			// Try to open in Telegram
			window.location.href = availability.botUrl;
			return true;
		}

		return false;
	}
}

/**
 * Create a platform detector instance
 */
export function createPlatformDetector(options?: PlatformDetectorOptions): PlatformDetector {
	return new PlatformDetector(options);
}

/**
 * Quick platform detection (convenience function)
 */
export function detectPlatform(options?: PlatformDetectorOptions): PlatformInfo {
	const detector = new PlatformDetector(options);
	return detector.detect();
}
