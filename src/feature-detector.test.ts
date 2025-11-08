import './test-utils/setup-browser-env.test.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeatureDetector } from './feature-detector.js';
import type { DeviceFeatures } from './feature-detector.js';

describe('FeatureDetector', () => {
	describe('detect', () => {
		it('should detect device features', () => {
			const features = FeatureDetector.detect();

			expect(features).toBeDefined();
			expect(typeof features.touch).toBe('boolean');
			expect(typeof features.maxTouchPoints).toBe('number');
			expect(['fine', 'coarse', 'none']).toContain(features.pointer);
			expect(['hover', 'none']).toContain(features.hover);
			expect(features.screen).toBeDefined();
			expect(features.screen.width).toBeGreaterThan(0);
			expect(features.screen.height).toBeGreaterThan(0);
		});

		it('should detect screen information', () => {
			const features = FeatureDetector.detect();

			expect(features.screen.width).toBe(screen.width);
			expect(features.screen.height).toBe(screen.height);
			expect(features.screen.pixelRatio).toBe(window.devicePixelRatio || 1);
		});

		it('should detect hardware concurrency if available', () => {
			const features = FeatureDetector.detect();

			if (navigator.hardwareConcurrency) {
				expect(features.hardwareConcurrency).toBe(
					navigator.hardwareConcurrency
				);
			}
		});
	});

	describe('inferDeviceType', () => {
		it('should infer desktop from fine pointer and hover', () => {
			const features: DeviceFeatures = {
				touch: false,
				maxTouchPoints: 0,
				pointer: 'fine',
				hover: 'hover',
				anyPointer: 'fine',
				anyHover: 'hover',
				orientation: false,
				screen: {
					width: 1920,
					height: 1080,
					availWidth: 1920,
					availHeight: 1080,
					pixelRatio: 1
				}
			};

			const device = FeatureDetector.inferDeviceType(features);
			expect(device).toBe('desktop');
		});

		it('should infer mobile from coarse pointer and no hover', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 5,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'coarse',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 390,
					height: 844,
					availWidth: 390,
					availHeight: 844,
					pixelRatio: 3
				}
			};

			const device = FeatureDetector.inferDeviceType(features);
			expect(device).toBe('mobile');
		});

		it('should infer tablet from touch and larger screen', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 10,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'fine',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 820,
					height: 1180,
					availWidth: 820,
					availHeight: 1180,
					pixelRatio: 2
				}
			};

			const device = FeatureDetector.inferDeviceType(features);
			expect(device).toBe('tablet');
		});

		it('should infer device for hybrid devices with touch', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 10,
				pointer: 'fine',
				hover: 'hover',
				anyPointer: 'fine',
				anyHover: 'hover',
				orientation: false,
				screen: {
					width: 1920,
					height: 1080,
					availWidth: 1920,
					availHeight: 1080,
					pixelRatio: 1.5
				}
			};

			const device = FeatureDetector.inferDeviceType(features);
			// Hybrid devices (Surface-like) with large screen should be desktop or tablet
			expect(['desktop', 'tablet']).toContain(device);
		});
	});

	describe('isLikelyPhone', () => {
		it('should identify phone features', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 5,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'coarse',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 390,
					height: 844,
					availWidth: 390,
					availHeight: 844,
					pixelRatio: 3
				}
			};

			expect(FeatureDetector.isLikelyPhone(features)).toBe(true);
		});

		it('should not identify tablet as phone', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 10,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'fine',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 820,
					height: 1180,
					availWidth: 820,
					availHeight: 1180,
					pixelRatio: 2
				}
			};

			expect(FeatureDetector.isLikelyPhone(features)).toBe(false);
		});
	});

	describe('isLikelyTablet', () => {
		it('should identify tablet features', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 10,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'fine',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 820,
					height: 1180,
					availWidth: 820,
					availHeight: 1180,
					pixelRatio: 2
				}
			};

			expect(FeatureDetector.isLikelyTablet(features)).toBe(true);
		});

		it('should not identify phone as tablet', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 5,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'coarse',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 390,
					height: 844,
					availWidth: 390,
					availHeight: 844,
					pixelRatio: 3
				}
			};

			expect(FeatureDetector.isLikelyTablet(features)).toBe(false);
		});
	});

	describe('isLikelyDesktop', () => {
		it('should identify desktop features', () => {
			const features: DeviceFeatures = {
				touch: false,
				maxTouchPoints: 0,
				pointer: 'fine',
				hover: 'hover',
				anyPointer: 'fine',
				anyHover: 'hover',
				orientation: false,
				screen: {
					width: 1920,
					height: 1080,
					availWidth: 1920,
					availHeight: 1080,
					pixelRatio: 1
				}
			};

			expect(FeatureDetector.isLikelyDesktop(features)).toBe(true);
		});

		it('should not identify mobile as desktop', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 5,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'coarse',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 390,
					height: 844,
					availWidth: 390,
					availHeight: 844,
					pixelRatio: 3
				}
			};

			expect(FeatureDetector.isLikelyDesktop(features)).toBe(false);
		});
	});

	describe('validateDeviceType', () => {
		it('should validate correct mobile detection', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 5,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'coarse',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 390,
					height: 844,
					availWidth: 390,
					availHeight: 844,
					pixelRatio: 3
				}
			};

			const validation = FeatureDetector.validateDeviceType('mobile', features);
			expect(validation.valid).toBe(true);
			expect(validation.confidence).toBe(100);
		});

		it('should identify mismatch between detected and actual', () => {
			const features: DeviceFeatures = {
				touch: false,
				maxTouchPoints: 0,
				pointer: 'fine',
				hover: 'hover',
				anyPointer: 'fine',
				anyHover: 'hover',
				orientation: false,
				screen: {
					width: 1920,
					height: 1080,
					availWidth: 1920,
					availHeight: 1080,
					pixelRatio: 1
				}
			};

			const validation = FeatureDetector.validateDeviceType('mobile', features);
			expect(validation.valid).toBe(false);
			expect(validation.confidence).toBeLessThan(100);
			expect(validation.reason).toBeDefined();
		});

		it('should allow compatible mobile/tablet mismatch', () => {
			const features: DeviceFeatures = {
				touch: true,
				maxTouchPoints: 10,
				pointer: 'coarse',
				hover: 'none',
				anyPointer: 'fine',
				anyHover: 'none',
				orientation: true,
				screen: {
					width: 820,
					height: 1180,
					availWidth: 820,
					availHeight: 1180,
					pixelRatio: 2
				}
			};

			const validation = FeatureDetector.validateDeviceType('mobile', features);
			expect(validation.valid).toBe(true);
			expect(validation.confidence).toBeLessThan(100);
		});
	});

	describe('detectWithInference', () => {
		it('should provide features and inference', () => {
			const result = FeatureDetector.detectWithInference();

			expect(result.features).toBeDefined();
			expect(result.inferredDevice).toBeDefined();
			expect(['mobile', 'tablet', 'desktop']).toContain(result.inferredDevice);
			expect(result.confidence).toBeGreaterThan(0);
			expect(result.confidence).toBeLessThanOrEqual(100);
		});
	});
});
