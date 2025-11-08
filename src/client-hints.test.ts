import './test-utils/setup-browser-env.test.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClientHintsDetector } from './client-hints.js';

describe('ClientHintsDetector', () => {
	describe('isSupported', () => {
		it('should return false when userAgentData is not available', () => {
			const original = (navigator as any).userAgentData;
			delete (navigator as any).userAgentData;

			expect(ClientHintsDetector.isSupported()).toBe(false);

			if (original) {
				(navigator as any).userAgentData = original;
			}
		});

		it('should return true when userAgentData is available', () => {
			const original = (navigator as any).userAgentData;
			(navigator as any).userAgentData = { brands: [] };

			expect(ClientHintsDetector.isSupported()).toBe(true);

			if (original) {
				(navigator as any).userAgentData = original;
			} else {
				delete (navigator as any).userAgentData;
			}
		});
	});

	describe('getBasicHints', () => {
		it('should return null when not supported', () => {
			const original = (navigator as any).userAgentData;
			delete (navigator as any).userAgentData;

			const hints = ClientHintsDetector.getBasicHints();
			expect(hints).toBeNull();

			if (original) {
				(navigator as any).userAgentData = original;
			}
		});

		it('should return basic hints when available', () => {
			const original = (navigator as any).userAgentData;
			(navigator as any).userAgentData = {
				brands: [{ brand: 'Chrome', version: '110' }],
				mobile: false,
				platform: 'Windows'
			};

			const hints = ClientHintsDetector.getBasicHints();
			expect(hints).toEqual({
				brands: [{ brand: 'Chrome', version: '110' }],
				mobile: false,
				platform: 'Windows'
			});

			if (original) {
				(navigator as any).userAgentData = original;
			} else {
				delete (navigator as any).userAgentData;
			}
		});
	});

	describe('detectOS', () => {
		it('should detect Windows 11', () => {
			const hints = {
				platform: 'Windows',
				platformVersion: '13.0.0'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBe('windows');
			expect(result.version).toBe('11');
		});

		it('should detect Windows 10', () => {
			const hints = {
				platform: 'Windows',
				platformVersion: '10.0.0'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBe('windows');
			expect(result.version).toBe('10');
		});

		it('should detect macOS with version', () => {
			const hints = {
				platform: 'macOS',
				platformVersion: '12.0.0'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBe('macos');
			expect(result.version).toBe('12');
		});

		it('should detect Android', () => {
			const hints = {
				platform: 'Android',
				platformVersion: '13.0.0'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBe('android');
			expect(result.version).toBe('13');
		});

		it('should detect Linux', () => {
			const hints = {
				platform: 'Linux'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBe('linux');
		});

		it('should detect ChromeOS', () => {
			const hints = {
				platform: 'ChromeOS'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBe('chromeos');
		});

		it('should return empty for unknown platform', () => {
			const hints = {
				platform: 'Unknown'
			};

			const result = ClientHintsDetector.detectOS(hints);
			expect(result.os).toBeUndefined();
		});
	});

	describe('detectDevice', () => {
		it('should detect mobile from formFactor', () => {
			const hints = {
				formFactor: 'Mobile'
			};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBe('mobile');
		});

		it('should detect tablet from formFactor', () => {
			const hints = {
				formFactor: 'Tablet'
			};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBe('tablet');
		});

		it('should detect desktop from formFactor', () => {
			const hints = {
				formFactor: 'Desktop'
			};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBe('desktop');
		});

		it('should detect mobile from mobile flag', () => {
			const hints = {
				mobile: true
			};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBe('mobile');
		});

		it('should detect desktop from mobile flag false', () => {
			const hints = {
				mobile: false
			};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBe('desktop');
		});

		it('should detect tablet from model name', () => {
			const hints = {
				mobile: true,
				model: 'iPad Pro'
			};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBe('tablet');
		});

		it('should return undefined for unknown', () => {
			const hints = {};

			const result = ClientHintsDetector.detectDevice(hints);
			expect(result).toBeUndefined();
		});
	});

	describe('getBrowserVersion', () => {
		it('should get version from fullVersionList', () => {
			const hints = {
				fullVersionList: [
					{ brand: 'Not A;Brand', version: '99.0.0.0' },
					{ brand: 'Chromium', version: '110.0.5481.100' },
					{ brand: 'Google Chrome', version: '110.0.5481.100' }
				]
			};

			const version = ClientHintsDetector.getBrowserVersion(hints);
			expect(version).toBe('110.0.5481.100');
		});

		it('should get version from uaFullVersion as fallback', () => {
			const hints = {
				uaFullVersion: '110.0.5481.100'
			};

			const version = ClientHintsDetector.getBrowserVersion(hints);
			expect(version).toBe('110.0.5481.100');
		});

		it('should return undefined when no version available', () => {
			const hints = {};

			const version = ClientHintsDetector.getBrowserVersion(hints);
			expect(version).toBeUndefined();
		});
	});

	describe('isFrozenUA', () => {
		it('should detect frozen Chrome UA', () => {
			const ua =
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
			expect(ClientHintsDetector.isFrozenUA(ua)).toBe(true);
		});

		it('should detect frozen Android Chrome UA', () => {
			const ua =
				'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36';
			expect(ClientHintsDetector.isFrozenUA(ua)).toBe(true);
		});

		it('should not detect non-frozen UA', () => {
			const ua =
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36';
			expect(ClientHintsDetector.isFrozenUA(ua)).toBe(false);
		});

		it('should not detect Safari UA as frozen', () => {
			const ua =
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';
			expect(ClientHintsDetector.isFrozenUA(ua)).toBe(false);
		});
	});
});
