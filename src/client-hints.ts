/**
 * Client Hints API integration for enhanced platform detection
 * Provides better accuracy for Chromium-based browsers (Chrome, Edge, Opera)
 *
 * Browser Support:
 * - Chrome/Edge 101+
 * - Opera
 * - Not supported: Safari, Firefox (as of 2025)
 */

import type { OSType, DeviceType } from './types.js';

/**
 * User-Agent Client Hints data structure
 */
export interface ClientHintsData {
	/** CPU architecture (e.g., "x86", "arm") */
	architecture?: string;
	/** CPU bitness (e.g., "64") */
	bitness?: string;
	/** Browser brands and versions */
	brands?: Array<{ brand: string; version: string }>;
	/** Device form factor (Mobile, Tablet, Desktop, XR) */
	formFactor?: string;
	/** Full browser version list */
	fullVersionList?: Array<{ brand: string; version: string }>;
	/** Device model name */
	model?: string;
	/** Platform name (e.g., "Windows", "macOS", "Android") */
	platform?: string;
	/** Platform version */
	platformVersion?: string;
	/** Full user agent version */
	uaFullVersion?: string;
	/** Windows on Windows 64-bit */
	wow64?: boolean;
	/** Mobile device indicator */
	mobile?: boolean;
}

/**
 * Enhanced platform information from Client Hints
 */
export interface ClientHintsResult {
	os?: OSType;
	osVersion?: string;
	device?: DeviceType;
	isMobile?: boolean;
	architecture?: string;
	model?: string;
	browserVersion?: string;
}

/**
 * Client Hints detector for modern browsers
 */
export class ClientHintsDetector {
	/**
	 * Check if Client Hints API is available
	 */
	static isSupported(): boolean {
		return (
			typeof navigator !== 'undefined' &&
			'userAgentData' in navigator &&
			typeof (navigator as any).userAgentData === 'object'
		);
	}

	/**
	 * Get basic client hints (low entropy)
	 */
	static getBasicHints(): Partial<ClientHintsData> | null {
		if (!this.isSupported()) {
			return null;
		}

		const uaData = (navigator as any).userAgentData;
		return {
			brands: uaData.brands || [],
			mobile: uaData.mobile || false,
			platform: uaData.platform || undefined
		};
	}

	/**
	 * Get high entropy client hints (requires user permission in some browsers)
	 */
	static async getHighEntropyHints(): Promise<ClientHintsData | null> {
		if (!this.isSupported()) {
			return null;
		}

		try {
			const uaData = (navigator as any).userAgentData;
			const hints = await uaData.getHighEntropyValues([
				'architecture',
				'bitness',
				'brands',
				'formFactor',
				'fullVersionList',
				'model',
				'platform',
				'platformVersion',
				'uaFullVersion',
				'wow64'
			]);

			// Include mobile from basic hints
			return {
				...hints,
				mobile: uaData.mobile || false
			};
		} catch (error) {
			if ((navigator as any).userAgentData?.platform) {
				// Fallback to basic hints if high entropy fails
				return this.getBasicHints();
			}
			return null;
		}
	}

	/**
	 * Detect OS from Client Hints
	 */
	static detectOS(hints: ClientHintsData): { os?: OSType; version?: string } {
		if (!hints.platform) {
			return {};
		}

		const platform = hints.platform.toLowerCase();
		const version = hints.platformVersion || '';

		// Windows detection
		if (platform === 'windows') {
			const majorVersion = parseFloat(version);
			let osVersion: string | undefined;

			// Windows 11 detection (version 13.0.0+)
			if (majorVersion >= 13) {
				osVersion = '11';
			} else if (majorVersion >= 10) {
				osVersion = '10';
			} else if (majorVersion >= 6.3) {
				osVersion = '8.1';
			} else if (majorVersion >= 6.2) {
				osVersion = '8';
			} else if (majorVersion >= 6.1) {
				osVersion = '7';
			}

			return { os: 'windows', version: osVersion };
		}

		// macOS detection
		if (platform === 'macos') {
			const majorVersion = parseInt(version.split('.')[0] || '0', 10);
			return {
				os: 'macos',
				version: majorVersion >= 10 ? majorVersion.toString() : undefined
			};
		}

		// Android detection
		if (platform === 'android') {
			const majorVersion = parseInt(version.split('.')[0] || '0', 10);
			return {
				os: 'android',
				version: majorVersion > 0 ? majorVersion.toString() : undefined
			};
		}

		// iOS detection (though iOS doesn't support Client Hints as of 2025)
		if (platform === 'ios') {
			return { os: 'ios', version: version || undefined };
		}

		// Linux detection
		if (platform === 'linux') {
			return { os: 'linux' };
		}

		// ChromeOS detection
		if (platform === 'chromeos' || platform === 'chrome os') {
			return { os: 'chromeos' };
		}

		return {};
	}

	/**
	 * Detect device type from Client Hints
	 */
	static detectDevice(hints: ClientHintsData): DeviceType | undefined {
		// Use formFactor if available (new in recent Client Hints spec)
		if (hints.formFactor) {
			const formFactor = hints.formFactor.toLowerCase();
			switch (formFactor) {
				case 'mobile':
					return 'mobile';
				case 'tablet':
					return 'tablet';
				case 'desktop':
					return 'desktop';
				case 'xr':
					// XR devices (AR/VR) - treat as specialized device
					return 'desktop'; // or create new type
				default:
					break;
			}
		}

		// Fallback to mobile property
		if (hints.mobile === true) {
			// Check if it's a tablet based on model name
			if (hints.model && this.isTabletModel(hints.model)) {
				return 'tablet';
			}
			return 'mobile';
		} else if (hints.mobile === false) {
			return 'desktop';
		}

		return undefined;
	}

	/**
	 * Check if model name indicates a tablet
	 */
	private static isTabletModel(model: string): boolean {
		const tabletPatterns = [
			/ipad/i,
			/tablet/i,
			/tab\s?\d+/i,
			/galaxy tab/i,
			/nexus (7|9|10)/i,
			/pixel (c|slate)/i,
			/surface/i
		];

		return tabletPatterns.some(pattern => pattern.test(model));
	}

	/**
	 * Get browser version from Client Hints
	 */
	static getBrowserVersion(hints: ClientHintsData): string | undefined {
		if (hints.fullVersionList && hints.fullVersionList.length > 0) {
			// Find the main browser brand (not Chromium)
			const mainBrowser = hints.fullVersionList.find(
				brand =>
					!brand.brand.toLowerCase().includes('chromium') &&
					!brand.brand.toLowerCase().includes('not')
			);
			return mainBrowser?.version;
		}

		return hints.uaFullVersion;
	}

	/**
	 * Detect complete platform information from Client Hints
	 */
	static async detect(): Promise<ClientHintsResult | null> {
		if (!this.isSupported()) {
			return null;
		}

		try {
			const hints = await this.getHighEntropyHints();
			if (!hints) {
				return null;
			}

			const osInfo = this.detectOS(hints);
			const device = this.detectDevice(hints);
			const browserVersion = this.getBrowserVersion(hints);

			return {
				os: osInfo.os,
				osVersion: osInfo.version,
				device,
				isMobile: hints.mobile,
				architecture: hints.architecture,
				model: hints.model,
				browserVersion
			};
		} catch (error) {
			console.error('Client Hints detection failed:', error);
			return null;
		}
	}

	/**
	 * Check if user agent is frozen (reduced)
	 * Frozen UAs indicate Client Hints should be preferred
	 */
	static isFrozenUA(userAgent: string): boolean {
		// Chrome's frozen user agent patterns
		const frozenPatterns = [
			// Desktop: Version frozen at Chrome 110
			/Chrome\/110\.0\.0\.0/,
			// Android: Version frozen at Chrome 110
			/Android.*Chrome\/110\.0\.0\.0/,
			// Generic frozen pattern
			/\bChrome\/1[0-9]{2}\.0\.0\.0\b/
		];

		return frozenPatterns.some(pattern => pattern.test(userAgent));
	}
}
