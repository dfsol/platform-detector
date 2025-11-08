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
	ScreenInfo,
	BrowserFamily,
	DetectionConfidence
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
import { ClientHintsDetector } from './client-hints.js';
import { FeatureDetector } from './feature-detector.js';

/**
 * Detects the current platform and environment
 */
export class PlatformDetector {
	private options: PlatformDetectorOptions;
	private cache?: PlatformInfo;
	private cacheTimestamp?: number;

	constructor(options: PlatformDetectorOptions = {}) {
		this.options = {
			useClientHints: false,
			useFeatureDetection: true,
			cacheTTL: 5000, // 5 seconds default
			...options
		};
	}

	/**
	 * Detect platform information with priority-based detection
	 * Supports caching to improve performance
	 */
	detect(): PlatformInfo {
		// Check cache
		if (this.cache && this.cacheTimestamp) {
			const now = Date.now();
			const cacheTTL = this.options.cacheTTL || 5000;
			if (now - this.cacheTimestamp < cacheTTL) {
				return this.cache;
			}
		}

		// Perform detection
		const result = this.performDetection();

		// Update cache
		this.cache = result;
		this.cacheTimestamp = Date.now();

		return result;
	}

	/**
	 * Perform actual detection logic
	 */
	private performDetection(): PlatformInfo {
		if (typeof window === 'undefined') {
			return this.createServerSideInfo();
		}

		const userAgent = this.options.userAgent || navigator.userAgent;
		const hostname = this.options.hostname || window.location.hostname;

		// Basic detection
		const os = this.detectOS(userAgent);
		const device = this.detectDevice(userAgent, os);
		const domainMode = this.detectDomainMode(hostname);
		const environment = this.detectEnvironment();

		// Priority-based platform detection
		// 1. Check for native wrappers first (most specific)
		const isNativeCapacitor = this.detectNative();
		const capacitor = this.getCapacitorInfo();
		const isNative = isNativeCapacitor && capacitor?.isNativePlatform === true;

		// 2. Check for Telegram Mini App
		const isTelegram = this.detectTelegram();
		const telegram = this.getTelegramInfo();

		// 3. Check for PWA
		const isPWA = this.detectPWA();

		// Determine primary platform type based on priority
		let type: PlatformType = 'web';
		if (isNative) {
			type = 'native';
		} else if (isTelegram) {
			type = 'tma';
		} else if (isPWA) {
			type = 'pwa';
		}

		// Check if TMA warning should be shown
		const shouldShowTMAWarning = domainMode === 'tma' && !isTelegram;

		// Get screen info
		const screen = this.getScreenInfo();

		// Determine device type considering platform-specific info
		let finalDevice = device;
		let finalIsMobile = device === 'mobile' || device === 'tablet';
		let finalOS = os;

		// Adjust based on Telegram platform info
		if (isTelegram && telegram?.platform) {
			const tgPlatform = telegram.platform;

			// Mobile platforms
			if (tgPlatform === 'ios' || tgPlatform === 'android' || tgPlatform === 'android_x') {
				finalDevice = device === 'tablet' ? 'tablet' : 'mobile';
				finalIsMobile = true;
				// Correct OS if needed
				if (tgPlatform === 'ios' && os !== 'ios') finalOS = 'ios';
				if ((tgPlatform === 'android' || tgPlatform === 'android_x') && os !== 'android') finalOS = 'android';
			}
			// Desktop platforms
			else if (tgPlatform === 'macos' || tgPlatform === 'tdesktop') {
				finalDevice = 'desktop';
				finalIsMobile = false;
				if (tgPlatform === 'macos' && os !== 'macos') finalOS = 'macos';
			}
			// Web platforms - keep original detection
		}

		// Browser family detection
		const browserFamily = this.detectBrowserFamily(userAgent);

		// Calculate confidence
		const confidence = this.calculateConfidence(userAgent, {
			os: finalOS,
			device: finalDevice,
			browserFamily
		});

		const info: PlatformInfo = {
			type,
			os: finalOS,
			device: finalDevice,
			domainMode,
			environment,
			isPWA,
			isTelegram,
			isNative,
			isWeb: !isNative && !isTelegram,
			isMobile: finalIsMobile,
			isDesktop: !finalIsMobile,
			isIOS: finalOS === 'ios',
			isAndroid: finalOS === 'android',
			isMacOS: finalOS === 'macos',
			isWindows: finalOS === 'windows',
			isLinux: finalOS === 'linux',
			isChromeOS: finalOS === 'chromeos',
			userAgent,
			shouldShowTMAWarning,
			screen,
			browserFamily,
			confidence,
			capacitor,
			telegram
		};

		if (this.options.debug) {
			console.log('[PlatformDetector]', info);
		}

		return info;
	}

	/**
	 * Detect operating system from user agent with enhanced iPadOS detection
	 */
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

	/**
	 * Detect device type from user agent and OS with enhanced tablet detection
	 */
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
			// Android tablet detection - tablets typically don't have 'mobile' in UA
			if (!/mobile/.test(ua) && /android/.test(ua)) {
				return 'tablet';
			}
			// Additional check for specific tablet models
			if (/tablet|tab\d+/.test(ua)) {
				return 'tablet';
			}
			return 'mobile';
		}

		// Check screen width as additional hint for ambiguous cases
		if (width > 0 && width <= 768 && /mobi/.test(ua)) {
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
	 * Detect if running as PWA (installed) with comprehensive checks
	 * Updated for 2025 standards including window-controls-overlay
	 */
	private detectPWA(): boolean {
		if (typeof window === 'undefined') return false;

		// Check various display modes (including 2025 additions)
		const displayModes = [
			'standalone',
			'fullscreen',
			'minimal-ui',
			'window-controls-overlay' // Already included - Chrome 2025 desktop PWA
		];

		for (const mode of displayModes) {
			if (window.matchMedia(`(display-mode: ${mode})`).matches) {
				return true;
			}
		}

		// iOS Safari standalone mode (pre-iOS 15 compatibility)
		if ('standalone' in navigator && (navigator as any).standalone === true) {
			return true;
		}

		// NEW: Window Controls Overlay API check (2025)
		// For desktop PWAs with custom title bar
		if ((navigator as any).windowControlsOverlay?.visible) {
			return true;
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
	 * Check Telegram Mini App (TMA) availability and generate deep link
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

	/**
	 * Get browser type (Chrome, Safari, Firefox, Edge, etc.)
	 */
	getBrowserType(): string {
		if (typeof window === 'undefined') return 'unknown';

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

		// Samsung Internet
		if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';

		// UC Browser
		if (/ucbrowser/i.test(ua)) return 'UC Browser';

		return 'unknown';
	}

	/**
	 * Detect browser family (rendering engine)
	 */
	private detectBrowserFamily(userAgent: string): BrowserFamily {
		const ua = userAgent.toLowerCase();

		// Chromium-based (Chrome, Edge, Opera, Samsung Internet)
		if (
			(window as any).chrome !== undefined ||
			/chrome|crios|edg|opr|samsungbrowser/i.test(ua)
		) {
			return 'chromium';
		}

		// WebKit (Safari)
		if (/webkit/i.test(ua) && !/chrome|crios/i.test(ua)) {
			return 'webkit';
		}

		// Gecko (Firefox)
		if (/gecko/i.test(ua) && !/webkit/i.test(ua)) {
			return 'gecko';
		}

		return 'unknown';
	}

	/**
	 * Calculate detection confidence score
	 */
	private calculateConfidence(
		userAgent: string,
		detected: { os: OSType; device: DeviceType; browserFamily: BrowserFamily }
	): DetectionConfidence {
		let overall = 100;
		let osConfidence = 100;
		let deviceConfidence = 100;
		let browserConfidence = 100;

		// Reduce confidence for frozen/reduced user agents
		if (ClientHintsDetector.isFrozenUA(userAgent)) {
			overall -= 20;
			osConfidence -= 30;
			deviceConfidence -= 20;
		}

		// Reduce confidence if Client Hints not used but available
		if (ClientHintsDetector.isSupported() && !this.options.useClientHints) {
			overall -= 10;
			osConfidence -= 15;
		}

		// Reduce confidence for unknown values
		if (detected.os === 'unknown') {
			overall -= 25;
			osConfidence = 30;
		}

		if (detected.browserFamily === 'unknown') {
			overall -= 10;
			browserConfidence -= 20;
		}

		// Feature detection increases confidence
		if (this.options.useFeatureDetection) {
			overall += 5;
			deviceConfidence += 10;
		}

		// Ensure values are within 0-100 range
		return {
			overall: Math.max(0, Math.min(100, overall)),
			os: Math.max(0, Math.min(100, osConfidence)),
			device: Math.max(0, Math.min(100, deviceConfidence)),
			browser: Math.max(0, Math.min(100, browserConfidence))
		};
	}

	/**
	 * Get display mode for PWA
	 */
	getDisplayMode(): string {
		if (typeof window === 'undefined') return 'browser';

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

	/**
	 * Check if the app can be installed as PWA
	 */
	isPWAInstallable(): boolean {
		if (typeof window === 'undefined') return false;

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

	/**
	 * Monitor for platform changes
	 */
	watchForChanges(callback: (info: PlatformInfo) => void): () => void {
		if (typeof window === 'undefined') {
			return () => {};
		}

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
			displayModeQuery.removeEventListener('change', checkAndNotify);
			window.removeEventListener('online', checkAndNotify);
			window.removeEventListener('offline', checkAndNotify);
			if ((window as any).Telegram?.WebApp) {
				(window as any).Telegram.WebApp.offEvent('viewportChanged', checkAndNotify);
			}
		};
	}

	/**
	 * Async detection with Client Hints support
	 * Provides enhanced accuracy for OS version and device info on Chrome/Edge
	 */
	async detectAsync(): Promise<PlatformInfo> {
		// Get base detection
		const baseInfo = this.detect();

		// If Client Hints not supported or disabled, return base detection
		if (!ClientHintsDetector.isSupported() || this.options.useClientHints === false) {
			return baseInfo;
		}

		try {
			// Get Client Hints data
			const hints = await ClientHintsDetector.detect();
			if (!hints) {
				return baseInfo;
			}

			// Merge with base detection
			return {
				...baseInfo,
				// Override with Client Hints data if available
				os: hints.os || baseInfo.os,
				osVersion: hints.osVersion || baseInfo.osVersion,
				device: hints.device || baseInfo.device,
				architecture: hints.architecture || baseInfo.architecture,
				deviceModel: hints.model || baseInfo.deviceModel,
				// Update boolean flags based on new OS
				isIOS: (hints.os || baseInfo.os) === 'ios',
				isAndroid: (hints.os || baseInfo.os) === 'android',
				isMacOS: (hints.os || baseInfo.os) === 'macos',
				isWindows: (hints.os || baseInfo.os) === 'windows',
				isLinux: (hints.os || baseInfo.os) === 'linux',
				isChromeOS: (hints.os || baseInfo.os) === 'chromeos',
				// Update mobile/desktop flags
				isMobile: hints.device === 'mobile' || hints.device === 'tablet'
					? true
					: baseInfo.isMobile,
				isDesktop: hints.device === 'desktop'
					? true
					: baseInfo.isDesktop
			};
		} catch (error) {
			if (this.options.debug) {
				console.error('[PlatformDetector] Client Hints detection failed:', error);
			}
			return baseInfo;
		}
	}

	/**
	 * Clear detection cache
	 */
	clearCache(): void {
		this.cache = undefined;
		this.cacheTimestamp = undefined;
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
