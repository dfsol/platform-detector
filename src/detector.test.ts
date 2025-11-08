import './test-utils/setup-browser-env.test.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformDetector, createPlatformDetector, detectPlatform } from './detector.js';

describe('PlatformDetector', () => {
	describe('OS Detection', () => {
		it('should detect iOS from iPhone user agent', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
			});
			const result = detector.detect();
			expect(result.os).toBe('ios');
			expect(result.isIOS).toBe(true);
			expect(result.device).toBe('mobile');
		});

		it('should detect iPad (iPadOS 13+) with MacIntel trick', () => {
			const originalPlatform = navigator.platform;
			const originalMaxTouchPoints = navigator.maxTouchPoints;

			Object.defineProperty(navigator, 'platform', {
				value: 'MacIntel',
				configurable: true
			});
			Object.defineProperty(navigator, 'maxTouchPoints', {
				value: 5,
				configurable: true
			});

			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
			});
			const result = detector.detect();

			expect(result.os).toBe('ios');
			expect(result.device).toBe('tablet');

			// Restore
			Object.defineProperty(navigator, 'platform', {
				value: originalPlatform,
				configurable: true
			});
			Object.defineProperty(navigator, 'maxTouchPoints', {
				value: originalMaxTouchPoints,
				configurable: true
			});
		});

		it('should detect Android', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36'
			});
			const result = detector.detect();
			expect(result.os).toBe('android');
			expect(result.isAndroid).toBe(true);
		});

		it('should detect Windows', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			});
			const result = detector.detect();
			expect(result.os).toBe('windows');
			expect(result.isWindows).toBe(true);
		});

		it('should detect macOS', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			});
			const result = detector.detect();
			expect(result.os).toBe('macos');
			expect(result.isMacOS).toBe(true);
		});

		it('should detect Linux', () => {
			const detector = new PlatformDetector({
				userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
			});
			const result = detector.detect();
			expect(result.os).toBe('linux');
			expect(result.isLinux).toBe(true);
		});

		it('should detect ChromeOS', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36'
			});
			const result = detector.detect();
			expect(result.os).toBe('chromeos');
			expect(result.isChromeOS).toBe(true);
		});
	});

	describe('Device Detection', () => {
		it('should detect mobile phone', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
			});
			const result = detector.detect();
			expect(result.device).toBe('mobile');
			expect(result.isMobile).toBe(true);
			expect(result.isDesktop).toBe(false);
		});

		it('should detect Android tablet', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
			});
			const result = detector.detect();
			expect(result.device).toBe('tablet');
			expect(result.isMobile).toBe(true);
		});

		it('should detect desktop', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			});
			const result = detector.detect();
			expect(result.device).toBe('desktop');
			expect(result.isDesktop).toBe(true);
			expect(result.isMobile).toBe(false);
		});
	});

	describe('Browser Detection', () => {
		it('should detect browser type from current user agent', () => {
			const detector = new PlatformDetector();
			const browser = detector.getBrowserType();
			// Browser type depends on actual navigator.userAgent in test environment
			expect(typeof browser).toBe('string');
			expect(browser.length).toBeGreaterThan(0);
		});
	});

	describe('Browser Family Detection', () => {
		it('should detect Chromium family', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
			});
			const result = detector.detect();
			expect(result.browserFamily).toBe('chromium');
		});

		it('should detect WebKit family', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
			});
			const result = detector.detect();
			expect(result.browserFamily).toBe('webkit');
		});

		it('should detect Gecko family', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
			});
			const result = detector.detect();
			expect(result.browserFamily).toBe('gecko');
		});
	});

	describe('Platform Type Detection', () => {
		it('should detect web as default', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			});
			const result = detector.detect();
			expect(result.type).toBe('web');
			expect(result.isWeb).toBe(true);
			expect(result.isPWA).toBe(false);
			expect(result.isTelegram).toBe(false);
			expect(result.isNative).toBe(false);
		});
	});

	describe('Confidence Scoring', () => {
		it('should provide confidence scores', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			});
			const result = detector.detect();

			expect(result.confidence).toBeDefined();
			expect(result.confidence?.overall).toBeGreaterThan(0);
			expect(result.confidence?.overall).toBeLessThanOrEqual(100);
			expect(result.confidence?.os).toBeGreaterThan(0);
			expect(result.confidence?.device).toBeGreaterThan(0);
			expect(result.confidence?.browser).toBeGreaterThan(0);
		});

		it('should reduce confidence for frozen user agent', () => {
			const detector = new PlatformDetector({
				userAgent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
			});
			const result = detector.detect();

			// Frozen UA should have lower confidence
			expect(result.confidence?.overall).toBeLessThan(100);
		});
	});

	describe('Caching', () => {
		it('should cache detection results', () => {
			const detector = new PlatformDetector({
				cacheTTL: 5000,
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
			});

			const result1 = detector.detect();
			const result2 = detector.detect();

			expect(result1).toBe(result2); // Same reference = cached
		});

		it('should clear cache on demand', () => {
			const detector = new PlatformDetector({
				cacheTTL: 5000,
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
			});

			const result1 = detector.detect();
			detector.clearCache();
			const result2 = detector.detect();

			expect(result1).not.toBe(result2); // Different reference = not cached
		});

		it('should expire cache after TTL', async () => {
			const detector = new PlatformDetector({
				cacheTTL: 50, // 50ms
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
			});

			const result1 = detector.detect();
			await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
			const result2 = detector.detect();

			expect(result1).not.toBe(result2); // Cache expired
		});
	});

	describe('Convenience Functions', () => {
		it('createPlatformDetector should create instance', () => {
			const detector = createPlatformDetector();
			expect(detector).toBeInstanceOf(PlatformDetector);
		});

		it('detectPlatform should return result', () => {
			const result = detectPlatform({
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
			});
			expect(result.os).toBe('ios');
		});
	});

	describe('Domain Mode Detection', () => {
		it('should detect app domain', () => {
			const detector = new PlatformDetector({
				hostname: 'app.example.com'
			});
			const result = detector.detect();
			expect(result.domainMode).toBe('app');
		});

		it('should detect tma domain', () => {
			const detector = new PlatformDetector({
				hostname: 'tg.example.com'
			});
			const result = detector.detect();
			expect(result.domainMode).toBe('tma');
		});

		it('should detect unknown domain', () => {
			const detector = new PlatformDetector({
				hostname: 'example.com'
			});
			const result = detector.detect();
			expect(result.domainMode).toBe('unknown');
		});
	});

	describe('Environment Detection', () => {
		it('should detect development on localhost', () => {
			const detector = new PlatformDetector({
				hostname: 'localhost'
			});
			const result = detector.detect();
			expect(result.environment).toBe('development');
		});

		it('should detect development on 127.0.0.1', () => {
			const detector = new PlatformDetector({
				hostname: '127.0.0.1'
			});
			const result = detector.detect();
			expect(result.environment).toBe('development');
		});

		it('should detect production on .com domain', () => {
			const detector = new PlatformDetector({
				hostname: 'example.com'
			});
			const result = detector.detect();
			expect(result.environment).toBe('production');
		});
	});

	describe('Screen Info', () => {
		it('should include screen information', () => {
			const result = detectPlatform();
			expect(result.screen).toBeDefined();
			expect(result.screen.width).toBeGreaterThan(0);
			expect(result.screen.height).toBeGreaterThan(0);
			expect(result.screen.pixelRatio).toBeGreaterThan(0);
		});
	});
});
