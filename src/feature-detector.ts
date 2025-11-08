/**
 * Feature-based detection module
 * Uses browser APIs and feature detection to validate and enhance user agent parsing
 * More reliable than user agent strings as features cannot be spoofed easily
 */

import type { DeviceType, OSType } from './types.js';

/**
 * Device features detected from browser APIs
 */
export interface DeviceFeatures {
	/** Touch support */
	touch: boolean;
	/** Maximum simultaneous touch points */
	maxTouchPoints: number;
	/** Primary pointer precision */
	pointer: 'fine' | 'coarse' | 'none';
	/** Hover capability */
	hover: 'hover' | 'none';
	/** Any pointer precision (for hybrid devices) */
	anyPointer: 'fine' | 'coarse' | 'none';
	/** Any hover capability */
	anyHover: 'hover' | 'none';
	/** Orientation support */
	orientation: boolean;
	/** Device memory in GB (if available) */
	deviceMemory?: number;
	/** CPU cores */
	hardwareConcurrency?: number;
	/** Network connection info */
	connection?: {
		effectiveType?: string;
		downlink?: number;
		rtt?: number;
		saveData?: boolean;
	};
	/** Screen information */
	screen: {
		width: number;
		height: number;
		availWidth: number;
		availHeight: number;
		pixelRatio: number;
		orientation?: string;
	};
}

/**
 * Feature detection result with inferred device characteristics
 */
export interface FeatureDetectionResult {
	features: DeviceFeatures;
	inferredDevice?: DeviceType;
	inferredOS?: OSType;
	confidence: number; // 0-100
}

/**
 * Feature detector for device capability detection
 */
export class FeatureDetector {
	/**
	 * Detect all available device features
	 */
	static detect(): DeviceFeatures {
		if (typeof window === 'undefined') {
			return this.createServerSideFeatures();
		}

		return {
			touch: this.detectTouchSupport(),
			maxTouchPoints: navigator.maxTouchPoints || 0,
			pointer: this.getPointerCapability(),
			hover: this.getHoverCapability(),
			anyPointer: this.getAnyPointerCapability(),
			anyHover: this.getAnyHoverCapability(),
			orientation: this.detectOrientationSupport(),
			deviceMemory: this.getDeviceMemory(),
			hardwareConcurrency: navigator.hardwareConcurrency,
			connection: this.getConnectionInfo(),
			screen: this.getScreenInfo()
		};
	}

	/**
	 * Detect complete features and infer device type
	 */
	static detectWithInference(): FeatureDetectionResult {
		const features = this.detect();
		const inferredDevice = this.inferDeviceType(features);
		const inferredOS = this.inferOS(features);
		const confidence = this.calculateConfidence(features);

		return {
			features,
			inferredDevice,
			inferredOS,
			confidence
		};
	}

	/**
	 * Detect touch support
	 */
	private static detectTouchSupport(): boolean {
		return (
			'ontouchstart' in window ||
			navigator.maxTouchPoints > 0 ||
			(window as any).DocumentTouch !== undefined
		);
	}

	/**
	 * Get pointer capability (CSS media query)
	 */
	private static getPointerCapability(): 'fine' | 'coarse' | 'none' {
		if (window.matchMedia('(pointer: fine)').matches) {
			return 'fine';
		}
		if (window.matchMedia('(pointer: coarse)').matches) {
			return 'coarse';
		}
		return 'none';
	}

	/**
	 * Get hover capability (CSS media query)
	 */
	private static getHoverCapability(): 'hover' | 'none' {
		if (window.matchMedia('(hover: hover)').matches) {
			return 'hover';
		}
		return 'none';
	}

	/**
	 * Get any-pointer capability (for hybrid devices)
	 */
	private static getAnyPointerCapability(): 'fine' | 'coarse' | 'none' {
		if (window.matchMedia('(any-pointer: fine)').matches) {
			return 'fine';
		}
		if (window.matchMedia('(any-pointer: coarse)').matches) {
			return 'coarse';
		}
		return 'none';
	}

	/**
	 * Get any-hover capability
	 */
	private static getAnyHoverCapability(): 'hover' | 'none' {
		if (window.matchMedia('(any-hover: hover)').matches) {
			return 'hover';
		}
		return 'none';
	}

	/**
	 * Detect orientation support
	 */
	private static detectOrientationSupport(): boolean {
		return 'orientation' in window || 'onorientationchange' in window;
	}

	/**
	 * Get device memory (if available)
	 */
	private static getDeviceMemory(): number | undefined {
		return (navigator as any).deviceMemory;
	}

	/**
	 * Get network connection information
	 */
	private static getConnectionInfo() {
		const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

		if (!connection) {
			return undefined;
		}

		return {
			effectiveType: connection.effectiveType,
			downlink: connection.downlink,
			rtt: connection.rtt,
			saveData: connection.saveData
		};
	}

	/**
	 * Get screen information
	 */
	private static getScreenInfo() {
		return {
			width: screen.width,
			height: screen.height,
			availWidth: screen.availWidth,
			availHeight: screen.availHeight,
			pixelRatio: window.devicePixelRatio || 1,
			orientation: (screen as any).orientation?.type
		};
	}

	/**
	 * Infer device type from features
	 */
	static inferDeviceType(features: DeviceFeatures): DeviceType {
		// Desktop: fine pointer + hover + no/minimal touch
		if (
			features.pointer === 'fine' &&
			features.hover === 'hover' &&
			features.maxTouchPoints <= 1
		) {
			return 'desktop';
		}

		// Mobile phone: coarse pointer + no hover + touch
		if (
			features.pointer === 'coarse' &&
			features.hover === 'none' &&
			features.touch
		) {
			// Distinguish phone from tablet by screen size
			const screenSize = Math.min(features.screen.width, features.screen.height);
			if (screenSize < 768) {
				return 'mobile';
			}
			// Tablet size but phone-like features
			return 'tablet';
		}

		// Tablet: touch with larger screen
		if (features.touch && features.maxTouchPoints > 1) {
			const screenSize = Math.min(features.screen.width, features.screen.height);

			// Tablets typically 7+ inches (≥768px)
			if (screenSize >= 768) {
				return 'tablet';
			}
			return 'mobile';
		}

		// Hybrid devices (e.g., Surface): fine pointer + touch
		if (features.anyPointer === 'fine' && features.touch) {
			// Check screen size for classification
			const screenSize = Math.min(features.screen.width, features.screen.height);
			if (screenSize >= 1024) {
				return 'desktop'; // Likely a touch-enabled laptop
			}
			return 'tablet';
		}

		// Default to desktop for unknown configurations
		return 'desktop';
	}

	/**
	 * Infer OS from features
	 */
	private static inferOS(features: DeviceFeatures): OSType | undefined {
		// iOS: specific touch characteristics
		if (
			features.maxTouchPoints === 5 &&
			features.touch &&
			features.pointer === 'coarse'
		) {
			return 'ios';
		}

		// iPad: MacIntel platform + touch (handled elsewhere)
		if (navigator.platform === 'MacIntel' && features.maxTouchPoints > 1) {
			return 'ios';
		}

		// Android: touch + orientation on mobile
		if (
			features.touch &&
			features.orientation &&
			features.pointer === 'coarse'
		) {
			return 'android';
		}

		// Cannot reliably infer OS from features alone
		return undefined;
	}

	/**
	 * Calculate detection confidence based on available features
	 */
	private static calculateConfidence(features: DeviceFeatures): number {
		let confidence = 100;

		// Reduce confidence if key features are missing
		if (features.pointer === 'none') confidence -= 20;
		if (features.hover === 'none' && !features.touch) confidence -= 15;
		if (!features.maxTouchPoints && features.touch) confidence -= 10;
		if (!features.hardwareConcurrency) confidence -= 5;
		if (!features.deviceMemory) confidence -= 5;

		return Math.max(0, Math.min(100, confidence));
	}

	/**
	 * Validate device type against features
	 */
	static validateDeviceType(
		detectedDevice: DeviceType,
		features: DeviceFeatures
	): { valid: boolean; confidence: number; reason?: string } {
		const inferredDevice = this.inferDeviceType(features);

		// Perfect match
		if (detectedDevice === inferredDevice) {
			return { valid: true, confidence: 100 };
		}

		// Compatible matches
		if (detectedDevice === 'mobile' && inferredDevice === 'tablet') {
			// Small tablets might be detected as mobile
			return { valid: true, confidence: 75, reason: 'Small tablet detected as mobile' };
		}

		if (detectedDevice === 'tablet' && inferredDevice === 'mobile') {
			// Large phones might be detected as tablets
			return { valid: true, confidence: 75, reason: 'Large phone detected as tablet' };
		}

		if (detectedDevice === 'desktop' && inferredDevice === 'tablet' && features.touch) {
			// Touch-enabled desktops
			return { valid: true, confidence: 70, reason: 'Touch-enabled desktop' };
		}

		// Mismatch
		return {
			valid: false,
			confidence: 30,
			reason: `Detected as ${detectedDevice} but features suggest ${inferredDevice}`
		};
	}

	/**
	 * Check if device is likely a tablet based on features
	 */
	static isLikelyTablet(features: DeviceFeatures): boolean {
		const screenSize = Math.min(features.screen.width, features.screen.height);
		return (
			features.touch &&
			features.maxTouchPoints > 1 &&
			screenSize >= 768 &&
			screenSize <= 1366
		);
	}

	/**
	 * Check if device is likely a phone based on features
	 */
	static isLikelyPhone(features: DeviceFeatures): boolean {
		const screenSize = Math.min(features.screen.width, features.screen.height);
		return (
			features.touch &&
			features.pointer === 'coarse' &&
			features.hover === 'none' &&
			screenSize < 768
		);
	}

	/**
	 * Check if device is likely a desktop based on features
	 */
	static isLikelyDesktop(features: DeviceFeatures): boolean {
		return (
			features.pointer === 'fine' &&
			features.hover === 'hover' &&
			features.maxTouchPoints <= 1
		);
	}

	/**
	 * Create default features for server-side rendering
	 */
	private static createServerSideFeatures(): DeviceFeatures {
		return {
			touch: false,
			maxTouchPoints: 0,
			pointer: 'none',
			hover: 'none',
			anyPointer: 'none',
			anyHover: 'none',
			orientation: false,
			screen: {
				width: 0,
				height: 0,
				availWidth: 0,
				availHeight: 0,
				pixelRatio: 1
			}
		};
	}
}
