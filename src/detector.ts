import type {
	PlatformInfo,
	PlatformType,
	OSType,
	DeviceType,
	DomainMode,
	PlatformDetectorOptions,
	TMAAvailability
} from './types.js';

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
		const isNative = this.detectNative();
		const isTelegram = this.detectTelegram();
		const isPWA = this.detectPWA();

		// Determine primary platform type
		let type: PlatformType = 'web';
		if (isNative) type = 'native';
		else if (isTelegram) type = 'tma';
		else if (isPWA) type = 'pwa';

		// Check if TMA warning should be shown
		const shouldShowTMAWarning = domainMode === 'tma' && !isTelegram;

		const info: PlatformInfo = {
			type,
			os,
			device,
			domainMode,
			isPWA,
			isTelegram,
			isNative,
			isWeb: !isNative && !isTelegram,
			isMobile: device === 'mobile' || device === 'tablet',
			isDesktop: device === 'desktop',
			isIOS: os === 'ios',
			isAndroid: os === 'android',
			isMacOS: os === 'macos',
			isWindows: os === 'windows',
			isLinux: os === 'linux',
			userAgent,
			shouldShowTMAWarning
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
	 * Detect if running in Telegram Mini App
	 */
	private detectTelegram(): boolean {
		if (typeof window === 'undefined') return false;

		// Use provided Telegram object if available
		if (this.options.telegramWebApp) {
			return true;
		}

		// Check for Telegram WebApp
		if ('Telegram' in window && (window as any).Telegram?.WebApp) {
			return true;
		}

		// Check for tgWebAppData in URL
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('tgWebAppData')) {
			return true;
		}

		// Check for Telegram user agent
		const userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.includes('telegram')) {
			return true;
		}

		return false;
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

		// iOS Safari standalone mode
		if ('standalone' in navigator && (navigator as any).standalone) {
			return true;
		}

		// Android Chrome PWA
		if (document.referrer.includes('android-app://')) {
			return true;
		}

		return false;
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
			userAgent: '',
			shouldShowTMAWarning: false
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
