/**
 * @tma.js SDK integration utilities
 * Supports @tma.js/sdk package
 */

/**
 * Interface for @tma.js SDK
 */
export interface TmaJsSdkInstance {
	initData?: {
		raw: () => string | undefined;
		parsed: any;
	};
	miniApp?: {
		ready: () => void;
		headerColor?: string;
		backgroundColor?: string;
		platform?: string;
	};
	viewport?: {
		height: number;
		stableHeight: number;
		isExpanded: boolean;
	};
	themeParams?: {
		backgroundColor?: string;
		textColor?: string;
		hintColor?: string;
		linkColor?: string;
		buttonColor?: string;
		buttonTextColor?: string;
	};
	version?: string;
}

/**
 * Check if @tma.js SDK is available
 */
export function isTmaJsSdkAvailable(): boolean {
	if (typeof window === 'undefined') return false;

	// Check for @tma.js/sdk
	const hasTmaJsSDK = '__tma__sdk__' in window || 'tmaSDK' in window;

	// Check if SDK functions are available
	const hasSDKMethods =
		typeof (window as any).initMiniApp === 'function' ||
		typeof (window as any).retrieveLaunchParams === 'function';

	return hasTmaJsSDK || hasSDKMethods;
}

/**
 * Try to get @tma.js SDK instance
 * Returns null if SDK is not available
 */
export function getTmaJsSdk(): TmaJsSdkInstance | null {
	if (typeof window === 'undefined') return null;

	// Try @tma.js/sdk
	let sdk = (window as any).__tma__sdk__ || (window as any).tmaSDK;
	if (sdk) return sdk;

	// Try to construct from available functions
	if (typeof (window as any).retrieveLaunchParams === 'function') {
		try {
			const launchParams = (window as any).retrieveLaunchParams();
			return {
				initData: launchParams?.initData,
				miniApp: launchParams?.miniApp,
				viewport: launchParams?.viewport,
				themeParams: launchParams?.themeParams,
				version: launchParams?.version
			};
		} catch (e) {
			console.warn('[PlatformDetector] Failed to retrieve launch params:', e);
		}
	}

	return null;
}

/**
 * Check if running in Telegram Mini App via @tma.js SDK
 * Flexible detection for both web and native Telegram apps
 */
export function isTelegramViaTmaJs(): boolean {
	if (!isTmaJsSdkAvailable()) return false;

	const sdk = getTmaJsSdk();
	if (!sdk) return false;

	// Check if we have init data (strongest indicator of real Telegram environment)
	if (sdk.initData) {
		const rawData = typeof sdk.initData.raw === 'function'
			? sdk.initData.raw()
			: sdk.initData;

		if (rawData && typeof rawData === 'string' && rawData.length > 0) {
			return true;
		}
	}

	// Check if we have platform info (valid for native apps where initData may load async)
	if (sdk.miniApp?.platform && sdk.miniApp.platform !== 'unknown') {
		return true;
	}

	// Check if we have viewport info (another strong indicator)
	if (sdk.viewport && (sdk.viewport.height > 0 || sdk.viewport.stableHeight > 0)) {
		return true;
	}

	// Check if we have theme params (available in native apps)
	if (sdk.themeParams && Object.keys(sdk.themeParams).length > 0) {
		return true;
	}

	return false;
}

/**
 * Get Telegram platform from @tma.js SDK
 */
export function getTelegramPlatformFromTmaJs(): string | null {
	const sdk = getTmaJsSdk();
	if (!sdk) return null;

	return sdk.miniApp?.platform || null;
}

/**
 * Get init data from @tma.js SDK
 */
export function getTelegramInitDataFromTmaJs(): string | null {
	const sdk = getTmaJsSdk();
	if (!sdk || !sdk.initData) return null;

	if (typeof sdk.initData.raw === 'function') {
		return sdk.initData.raw() || null;
	}

	return sdk.initData as any;
}

/**
 * Get viewport info from @tma.js SDK
 */
export function getViewportFromTmaJs(): { height: number; stableHeight: number; isExpanded: boolean } | null {
	const sdk = getTmaJsSdk();
	if (!sdk || !sdk.viewport) return null;

	return {
		height: sdk.viewport.height || 0,
		stableHeight: sdk.viewport.stableHeight || 0,
		isExpanded: sdk.viewport.isExpanded || false
	};
}

/**
 * Get theme params from @tma.js SDK
 */
export function getThemeParamsFromTmaJs(): Record<string, string> | null {
	const sdk = getTmaJsSdk();
	if (!sdk || !sdk.themeParams) return null;

	return {
		backgroundColor: sdk.themeParams.backgroundColor || '',
		textColor: sdk.themeParams.textColor || '',
		hintColor: sdk.themeParams.hintColor || '',
		linkColor: sdk.themeParams.linkColor || '',
		buttonColor: sdk.themeParams.buttonColor || '',
		buttonTextColor: sdk.themeParams.buttonTextColor || ''
	};
}

/**
 * Initialize @tma.js SDK if available
 * This should be called early in the app lifecycle
 */
export function initializeTmaJs(): boolean {
	if (typeof window === 'undefined') return false;

	try {
		// Try to initialize mini app
		if (typeof (window as any).initMiniApp === 'function') {
			(window as any).initMiniApp();
			return true;
		}

		// Try to call ready on mini app
		const sdk = getTmaJsSdk();
		if (sdk?.miniApp && typeof sdk.miniApp.ready === 'function') {
			sdk.miniApp.ready();
			return true;
		}
	} catch (e) {
		console.warn('[PlatformDetector] Failed to initialize @tma.js SDK:', e);
	}

	return false;
}
