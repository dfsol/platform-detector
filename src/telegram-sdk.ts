/**
 * Telegram SDK loading utilities
 */

/**
 * Check if we should load Telegram SDK based on URL hints
 * Uses strict checks to avoid false positives in regular browsers
 */
export function shouldLoadTelegramSDK(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	// Check if SDK already loaded
	if ((window as any).Telegram?.WebApp) {
		return false; // No need to load again
	}

	// Check URL parameters for Telegram indicators (strict check)
	const urlParams = new URLSearchParams(window.location.search);
	const hasTelegramParams =
		urlParams.has('tgWebAppData') ||
		urlParams.has('tgWebAppVersion') ||
		urlParams.has('tgWebAppPlatform');

	if (hasTelegramParams) {
		return true;
	}

	// Check referrer - must be from t.me domain
	if (document.referrer && document.referrer.includes('t.me')) {
		return true;
	}

	// Check hash for Telegram params (strict check)
	const hash = window.location.hash;
	if (hash && (hash.includes('tgWebAppData=') || hash.includes('tgWebAppVersion='))) {
		return true;
	}

	// Check hostname for tg.* pattern
	if (window.location.hostname.startsWith('tg.')) {
		return true;
	}

	return false;
}

/**
 * Dynamically load Telegram Web App SDK
 * Returns a promise that resolves when SDK is loaded
 */
export async function loadTelegramSDK(): Promise<boolean> {
	if (typeof window === 'undefined') {
		return false;
	}

	// Check if SDK already loaded
	if ((window as any).Telegram?.WebApp) {
		return true;
	}

	// Only load if we detect Telegram environment
	if (!shouldLoadTelegramSDK()) {
		return false;
	}

	return new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = 'https://telegram.org/js/telegram-web-app.js';
		script.async = true;

		script.onload = () => {
			if ((window as any).Telegram?.WebApp) {
				console.log('[PlatformDetector] Telegram SDK loaded successfully');
				resolve(true);
			} else {
				console.warn('[PlatformDetector] Telegram SDK loaded but WebApp not found');
				resolve(false);
			}
		};

		script.onerror = () => {
			console.error('[PlatformDetector] Failed to load Telegram SDK');
			resolve(false);
		};

		document.head.appendChild(script);
	});
}

/**
 * Get Telegram WebApp instance if available
 */
export function getTelegramWebApp() {
	if (typeof window === 'undefined') {
		return null;
	}
	return (window as any).Telegram?.WebApp || null;
}
