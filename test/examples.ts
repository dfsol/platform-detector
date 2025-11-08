/**
 * @dfsol/platform-detector - Usage Examples
 *
 * This file demonstrates all the detection capabilities of the platform detector
 */

import {
	detectPlatform,
	detectPlatformAsync,
	createPlatformDetector,
	isMobileDevice,
	isIOS,
	isAndroid,
	isPWA,
	isTelegramMiniApp,
	isNativeApp,
	getBrowserType,
	getPlatformType,
	getDisplayMode,
	canInstallPWA,
	watchPlatformChanges,
	ClientHintsDetector,
	FeatureDetector,
	type PlatformInfo
} from '../src/index.js';

/**
 * Example 1: Basic Platform Detection
 */
function basicDetection() {
	const platform = detectPlatform();

	console.log('Platform Detection Results:');
	console.log('===========================');
	console.log('Platform Type:', platform.type); // 'web' | 'pwa' | 'tma' | 'native'
	console.log('Operating System:', platform.os); // 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'chromeos'
	console.log('Device Type:', platform.device); // 'mobile' | 'tablet' | 'desktop'
	console.log('Environment:', platform.environment); // 'development' | 'production' | 'unknown'

	// Boolean checks
	console.log('\nBoolean Checks:');
	console.log('Is PWA:', platform.isPWA);
	console.log('Is Telegram:', platform.isTelegram);
	console.log('Is Native:', platform.isNative);
	console.log('Is Mobile:', platform.isMobile);
	console.log('Is iOS:', platform.isIOS);
	console.log('Is Android:', platform.isAndroid);
}

/**
 * Example 2: Quick Utility Functions
 */
function quickChecks() {
	console.log('\nQuick Detection Functions:');
	console.log('===========================');
	console.log('Is Mobile Device:', isMobileDevice());
	console.log('Is iOS:', isIOS());
	console.log('Is Android:', isAndroid());
	console.log('Is PWA:', isPWA());
	console.log('Is Telegram Mini App:', isTelegramMiniApp());
	console.log('Is Native App:', isNativeApp());
	console.log('Browser Type:', getBrowserType());
	console.log('Platform Type:', getPlatformType());
	console.log('Display Mode:', getDisplayMode());
	console.log('Can Install PWA:', canInstallPWA());
}

/**
 * Example 3: Telegram Mini App Detection
 */
function telegramDetection() {
	const platform = detectPlatform();

	if (platform.isTelegram) {
		console.log('\nTelegram Mini App Detected:');
		console.log('===========================');

		if (platform.telegram) {
			console.log('Platform:', platform.telegram.platform);
			console.log('Version:', platform.telegram.version);
			console.log('SDK Source:', platform.telegram.sdkSource);
			console.log('Color Scheme:', platform.telegram.colorScheme);
			console.log('Is Expanded:', platform.telegram.isExpanded);

			// Check if native or web client
			const tgPlatform = platform.telegram.platform;
			const isNativeClient = ['ios', 'android', 'android_x', 'macos', 'tdesktop'].includes(tgPlatform);
			const isWebClient = ['weba', 'webk', 'web'].includes(tgPlatform);

			console.log('Is Native Client:', isNativeClient);
			console.log('Is Web Client:', isWebClient);

			// User info if available
			if (platform.telegram.user) {
				console.log('\nUser Info:');
				console.log('User ID:', platform.telegram.user.id);
				console.log('First Name:', platform.telegram.user.first_name);
				console.log('Username:', platform.telegram.user.username);
				console.log('Is Premium:', platform.telegram.user.is_premium);
			}
		}
	}
}

/**
 * Example 4: PWA Detection
 */
function pwaDetection() {
	const detector = createPlatformDetector();
	const platform = detector.detect();

	console.log('\nPWA Detection:');
	console.log('==============');

	if (platform.isPWA) {
		console.log('Running as Progressive Web App');
		console.log('Display Mode:', detector.getDisplayMode());

		// Check if it's iOS PWA
		if (platform.isIOS && platform.isPWA) {
			console.log('iOS PWA detected (Add to Home Screen)');
		}
	} else {
		console.log('Running in regular browser');

		// Check if can be installed
		if (detector.isPWAInstallable()) {
			console.log('This app can be installed as a PWA');
		}
	}
}

/**
 * Example 5: Native App Detection (Capacitor)
 */
function nativeAppDetection() {
	const platform = detectPlatform();

	if (platform.isNative) {
		console.log('\nNative App Detected:');
		console.log('====================');

		if (platform.capacitor) {
			console.log('Capacitor Platform:', platform.capacitor.platform);
			console.log('Is Native Platform:', platform.capacitor.isNativePlatform);

			// Check plugin availability
			const hasCamera = platform.capacitor.isPluginAvailable('Camera');
			const hasGeolocation = platform.capacitor.isPluginAvailable('Geolocation');

			console.log('Camera Plugin Available:', hasCamera);
			console.log('Geolocation Plugin Available:', hasGeolocation);
		}
	}
}

/**
 * Example 6: Responsive UI Based on Platform
 */
function responsiveUIExample() {
	const platform = detectPlatform();

	// Adjust UI based on platform
	if (platform.type === 'tma') {
		console.log('Telegram Mini App UI adjustments:');
		console.log('- Use Telegram theme colors');
		console.log('- Adjust viewport for Telegram container');
		console.log('- Enable Telegram-specific features');
	} else if (platform.isPWA) {
		console.log('PWA UI adjustments:');
		console.log('- Hide install prompts');
		console.log('- Use full-screen layout');
		console.log('- Enable offline features');
	} else if (platform.isNative) {
		console.log('Native App UI adjustments:');
		console.log('- Use native navigation patterns');
		console.log('- Enable device-specific features');
		console.log('- Adjust safe areas for notches');
	} else {
		console.log('Web Browser UI adjustments:');
		console.log('- Show install PWA prompt');
		console.log('- Use responsive web layout');
		console.log('- Show browser-specific features');
	}

	// Device-specific adjustments
	if (platform.device === 'mobile') {
		console.log('\nMobile-specific adjustments:');
		console.log('- Touch-optimized controls');
		console.log('- Larger tap targets');
		console.log('- Vertical layout priority');
	} else if (platform.device === 'tablet') {
		console.log('\nTablet-specific adjustments:');
		console.log('- Split-view layouts');
		console.log('- Mixed orientation support');
	} else {
		console.log('\nDesktop-specific adjustments:');
		console.log('- Hover states enabled');
		console.log('- Keyboard shortcuts');
		console.log('- Multi-window support');
	}
}

/**
 * Example 7: Domain Mode Detection
 */
function domainModeExample() {
	const platform = detectPlatform();

	console.log('\nDomain Mode Detection:');
	console.log('=====================');
	console.log('Domain Mode:', platform.domainMode);

	// Check for TMA mismatch
	if (platform.shouldShowTMAWarning) {
		console.log('\n⚠️  WARNING: TMA domain detected but not running in Telegram');
		console.log('User should be redirected to Telegram to access this app');

		// Example redirect logic
		const detector = createPlatformDetector();
		const botUsername = 'your_bot_username';
		const availability = detector.checkTMAAvailability(botUsername);

		if (availability.botUrl) {
			console.log('Redirect URL:', availability.botUrl);
			// window.location.href = availability.botUrl;
		}
	}
}

/**
 * Example 8: Monitoring Platform Changes
 */
function monitorChangesExample() {
	console.log('\nMonitoring Platform Changes:');
	console.log('============================');

	// Set up monitoring
	const cleanup = watchPlatformChanges((newInfo: PlatformInfo) => {
		console.log('Platform changed!');
		console.log('New platform type:', newInfo.type);
		console.log('Display mode:', newInfo.isPWA ? 'PWA' : 'Browser');

		// React to changes
		if (newInfo.isPWA && !newInfo.isPWA) {
			console.log('App was installed as PWA');
		} else if (!newInfo.isPWA && newInfo.isPWA) {
			console.log('App was uninstalled from PWA');
		}
	});

	// Clean up when done
	// cleanup();

	console.log('Platform monitoring active (PWA installation, display mode changes, etc.)');
}

/**
 * Example 9: Debug Information
 */
function debugExample() {
	const detector = createPlatformDetector({ debug: true });
	const platform = detector.detect();

	console.log('\nDebug Information:');
	console.log('==================');
	console.log('User Agent:', platform.userAgent);
	console.log('Screen Info:', platform.screen);
	console.log('Browser Type:', detector.getBrowserType());
	console.log('Display Mode:', detector.getDisplayMode());

	// Full platform info (will be logged to console if debug: true)
	console.log('\nFull Platform Info:', JSON.stringify(platform, null, 2));
}

/**
 * Example 10: Comprehensive Environment Check
 */
function comprehensiveCheck() {
	const platform = detectPlatform();

	console.log('\nComprehensive Environment Analysis:');
	console.log('===================================');

	// Determine the exact environment
	let environment = 'Unknown';
	let description = '';

	if (platform.type === 'native') {
		if (platform.isIOS) {
			environment = 'Native iOS App (Capacitor)';
			description = 'Running as a native iOS application built with Capacitor';
		} else if (platform.isAndroid) {
			environment = 'Native Android App (Capacitor)';
			description = 'Running as a native Android application built with Capacitor';
		}
	} else if (platform.type === 'tma') {
		const tgPlatform = platform.telegram?.platform;
		if (tgPlatform === 'ios') {
			environment = 'Telegram Mini App (iOS)';
			description = 'Running inside Telegram iOS native app';
		} else if (tgPlatform === 'android' || tgPlatform === 'android_x') {
			environment = 'Telegram Mini App (Android)';
			description = 'Running inside Telegram Android native app';
		} else if (tgPlatform === 'tdesktop') {
			environment = 'Telegram Mini App (Desktop)';
			description = 'Running inside Telegram Desktop application';
		} else if (tgPlatform === 'weba' || tgPlatform === 'webk') {
			environment = 'Telegram Mini App (Web)';
			description = 'Running inside Telegram Web client';
		}
	} else if (platform.type === 'pwa') {
		if (platform.isIOS) {
			environment = 'PWA (iOS)';
			description = 'Installed as PWA on iOS device (Add to Home Screen)';
		} else if (platform.isAndroid) {
			environment = 'PWA (Android)';
			description = 'Installed as PWA on Android device';
		} else if (platform.isWindows) {
			environment = 'PWA (Windows)';
			description = 'Installed as PWA on Windows';
		} else if (platform.isMacOS) {
			environment = 'PWA (macOS)';
			description = 'Installed as PWA on macOS';
		}
	} else {
		// Regular web browser
		const browser = getBrowserType();
		if (platform.isMobile) {
			environment = `Mobile Web (${browser})`;
			description = `Running in ${browser} browser on ${platform.os} mobile device`;
		} else {
			environment = `Desktop Web (${browser})`;
			description = `Running in ${browser} browser on ${platform.os} desktop`;
		}
	}

	console.log('Environment:', environment);
	console.log('Description:', description);
	console.log('Development Mode:', platform.environment === 'development');
}

/**
 * Example 11: Client Hints API (v0.4.0)
 */
async function clientHintsExample() {
	console.log('\n🆕 Client Hints API Detection:');
	console.log('==============================');

	// Check if Client Hints are supported
	if (ClientHintsDetector.isSupported()) {
		console.log('✅ Client Hints API is supported');

		// Get basic hints (synchronous)
		const basicHints = ClientHintsDetector.getBasicHints();
		if (basicHints) {
			console.log('\nBasic Hints (sync):');
			console.log('Platform:', basicHints.platform);
			console.log('Mobile:', basicHints.mobile);
			console.log('Brands:', basicHints.brands);
		}

		// Get high-entropy hints (async)
		try {
			const hints = await ClientHintsDetector.getHighEntropyHints();
			if (hints) {
				console.log('\nHigh-Entropy Hints (async):');
				console.log('Platform Version:', hints.platformVersion);
				console.log('Architecture:', hints.architecture);
				console.log('Device Model:', hints.model);
				console.log('Bitness:', hints.bitness);
				console.log('WoW64:', hints.wow64);
				console.log('Form Factor:', hints.formFactor);

				// Detect OS with version
				const osInfo = ClientHintsDetector.detectOS(hints);
				console.log('\nOS Detection from Hints:');
				console.log('OS:', osInfo.os);
				console.log('Version:', osInfo.version);

				// Detect device type
				const device = ClientHintsDetector.detectDevice(hints);
				console.log('Device Type:', device);

				// Get browser version
				const browserVersion = ClientHintsDetector.getBrowserVersion(hints);
				console.log('Browser Version:', browserVersion);
			}
		} catch (error) {
			console.log('High-entropy hints not available:', error);
		}
	} else {
		console.log('❌ Client Hints API not supported (Safari/Firefox or older Chrome)');
	}

	// Check if User-Agent is frozen
	const isFrozen = ClientHintsDetector.isFrozenUA(navigator.userAgent);
	console.log('\nUser-Agent Status:');
	console.log('Is Frozen:', isFrozen ? 'Yes (Chrome 110+) - Use Client Hints for accuracy' : 'No');
}

/**
 * Example 12: Feature Detection (v0.4.0)
 */
function featureDetectionExample() {
	console.log('\n🆕 Feature-Based Detection:');
	console.log('===========================');

	// Detect device features
	const features = FeatureDetector.detect();
	console.log('\nHardware Features:');
	console.log('Touch Support:', features.touch);
	console.log('Pointer Type:', features.pointer);
	console.log('Hover Capability:', features.hover);
	console.log('Max Touch Points:', features.maxTouchPoints);
	console.log('Any Pointer:', features.anyPointer);
	console.log('Any Hover:', features.anyHover);
	console.log('Orientation Support:', features.orientation);
	console.log('Hardware Concurrency:', features.hardwareConcurrency);

	console.log('\nScreen Info:');
	console.log('Width x Height:', `${features.screen.width}x${features.screen.height}`);
	console.log('Available:', `${features.screen.availWidth}x${features.screen.availHeight}`);
	console.log('Pixel Ratio:', features.screen.pixelRatio);

	// Infer device type from features
	const inferredDevice = FeatureDetector.inferDeviceType(features);
	console.log('\nInferred Device Type:', inferredDevice);

	// Check specific device types
	console.log('\nDevice Type Checks:');
	console.log('Is Likely Phone:', FeatureDetector.isLikelyPhone(features));
	console.log('Is Likely Tablet:', FeatureDetector.isLikelyTablet(features));
	console.log('Is Likely Desktop:', FeatureDetector.isLikelyDesktop(features));

	// Validate against User-Agent detection
	const platform = detectPlatform();
	const validation = FeatureDetector.validateDeviceType(platform.device, features);
	console.log('\nValidation vs User-Agent:');
	console.log('Detected Device (UA):', platform.device);
	console.log('Valid:', validation.valid);
	console.log('Confidence:', validation.confidence + '%');
	if (validation.reason) {
		console.log('Reason:', validation.reason);
	}
	if (validation.warnings && validation.warnings.length > 0) {
		console.log('Warnings:', validation.warnings);
	}

	// Comprehensive detection
	const result = FeatureDetector.detectWithInference();
	console.log('\nComprehensive Feature Detection:');
	console.log('Inferred Device:', result.inferredDevice);
	console.log('Confidence:', result.confidence + '%');
	if (result.warnings && result.warnings.length > 0) {
		console.log('Warnings:', result.warnings.join(', '));
	}
}

/**
 * Example 13: Confidence Scoring (v0.4.0)
 */
async function confidenceScoringExample() {
	console.log('\n🆕 Confidence Scoring:');
	console.log('=====================');

	// Synchronous detection
	const platform = detectPlatform();

	if (platform.confidence) {
		console.log('\nDetection Confidence:');
		console.log('Overall:', platform.confidence.overall + '%');
		console.log('OS Detection:', platform.confidence.os + '%');
		console.log('Device Detection:', platform.confidence.device + '%');
		console.log('Browser Detection:', platform.confidence.browser + '%');

		// Make decisions based on confidence
		if (platform.confidence.overall < 70) {
			console.log('\n⚠️  Low confidence detection - results may be unreliable');

			if (ClientHintsDetector.isSupported()) {
				console.log('💡 Tip: Use async detection with Client Hints for better accuracy');

				// Try to improve with Client Hints
				const betterPlatform = await detectPlatformAsync({ useClientHints: true });
				if (betterPlatform.confidence) {
					console.log('\nImproved Confidence (with Client Hints):');
					console.log('Overall:', betterPlatform.confidence.overall + '%');
					console.log('Improvement:', `+${betterPlatform.confidence.overall - platform.confidence.overall}%`);
				}
			}
		} else {
			console.log('\n✅ High confidence detection - results are reliable');
		}

		// Per-category analysis
		if (platform.confidence.os < 80) {
			console.log('\n⚠️  OS detection has lower confidence');
			if (ClientHintsDetector.isFrozenUA(navigator.userAgent)) {
				console.log('Reason: Frozen User-Agent detected (Chrome 110+)');
				console.log('Solution: Use Client Hints API for accurate OS version');
			}
		}

		if (platform.confidence.device < 80) {
			console.log('\n⚠️  Device detection has lower confidence');
			console.log('Tip: Use Feature Detection for validation');

			const features = FeatureDetector.detect();
			const validation = FeatureDetector.validateDeviceType(platform.device, features);
			console.log('Feature-based validation:', validation.valid ? '✅ Confirmed' : '❌ Mismatch detected');
		}
	}
}

/**
 * Example 14: Browser Family Detection (v0.4.0)
 */
function browserFamilyExample() {
	console.log('\n🆕 Browser Family Detection:');
	console.log('============================');

	const platform = detectPlatform();

	console.log('Browser Family:', platform.browserFamily);
	console.log('Browser Type:', getBrowserType());

	// Explain browser family
	switch (platform.browserFamily) {
		case 'chromium':
			console.log('\n📘 Chromium-based Browser');
			console.log('Description: Uses Blink rendering engine');
			console.log('Examples: Chrome, Edge, Opera, Brave, Vivaldi');
			console.log('Features: Supports Client Hints API, modern web standards');
			break;
		case 'webkit':
			console.log('\n📗 WebKit-based Browser');
			console.log('Description: Uses WebKit rendering engine');
			console.log('Examples: Safari (macOS/iOS)');
			console.log('Features: Strong privacy features, iOS-specific APIs');
			break;
		case 'gecko':
			console.log('\n📙 Gecko-based Browser');
			console.log('Description: Uses Gecko rendering engine');
			console.log('Examples: Firefox');
			console.log('Features: Strong privacy features, unique web APIs');
			break;
		default:
			console.log('\n❓ Unknown browser family');
	}

	// Browser-specific features
	console.log('\nBrowser Capabilities:');
	console.log('Client Hints Support:', ClientHintsDetector.isSupported() ? '✅' : '❌');
	console.log('Service Worker:', 'serviceWorker' in navigator ? '✅' : '❌');
	console.log('WebRTC:', 'RTCPeerConnection' in window ? '✅' : '❌');
	console.log('Web Share API:', 'share' in navigator ? '✅' : '❌');
}

/**
 * Example 15: Performance Optimization with Caching (v0.4.0)
 */
function performanceOptimizationExample() {
	console.log('\n🆕 Performance Optimization:');
	console.log('============================');

	// Default caching (5 seconds)
	const detector = createPlatformDetector({ cacheTTL: 5000 });

	console.log('Testing cache performance...\n');

	// First detection (slow)
	const start1 = performance.now();
	const result1 = detector.detect();
	const time1 = performance.now() - start1;
	console.log(`First detection: ${time1.toFixed(2)}ms (cold start)`);

	// Second detection (fast - cached)
	const start2 = performance.now();
	const result2 = detector.detect();
	const time2 = performance.now() - start2;
	console.log(`Second detection: ${time2.toFixed(2)}ms (cached)`);

	// Third detection (still cached)
	const start3 = performance.now();
	const result3 = detector.detect();
	const time3 = performance.now() - start3;
	console.log(`Third detection: ${time3.toFixed(2)}ms (cached)`);

	// Performance improvement
	const speedup = Math.round(time1 / time2);
	console.log(`\n⚡ Cache speedup: ${speedup}x faster`);

	// Verify same results
	console.log('Results identical:', result1 === result2 && result2 === result3 ? '✅' : '❌');

	// Clear cache manually
	console.log('\nClearing cache...');
	detector.clearCache();

	const start4 = performance.now();
	const result4 = detector.detect();
	const time4 = performance.now() - start4;
	console.log(`After cache clear: ${time4.toFixed(2)}ms (cold start again)`);

	// Custom cache TTL examples
	console.log('\nCache TTL Options:');
	console.log('- cacheTTL: 0 (no cache)');
	console.log('- cacheTTL: 1000 (1 second)');
	console.log('- cacheTTL: 5000 (5 seconds, default)');
	console.log('- cacheTTL: 60000 (1 minute)');

	// Best practices
	console.log('\n💡 Best Practices:');
	console.log('✅ Reuse detector instance for caching benefits');
	console.log('✅ Use shorter TTL for dynamic environments');
	console.log('✅ Use longer TTL for static environments');
	console.log('❌ Avoid creating new detector on every call');
}

/**
 * Example 16: Async Detection with Client Hints (v0.4.0)
 */
async function asyncDetectionExample() {
	console.log('\n🆕 Async Detection with Client Hints:');
	console.log('=====================================');

	// Synchronous detection (baseline)
	console.log('\n1️⃣ Synchronous Detection:');
	const syncPlatform = detectPlatform();
	console.log('OS:', syncPlatform.os);
	console.log('OS Version:', syncPlatform.osVersion || 'Not available');
	console.log('Architecture:', syncPlatform.architecture || 'Not available');
	console.log('Device Model:', syncPlatform.deviceModel || 'Not available');

	// Async detection with Client Hints (enhanced)
	console.log('\n2️⃣ Async Detection (with Client Hints):');
	if (ClientHintsDetector.isSupported()) {
		const asyncPlatform = await detectPlatformAsync({ useClientHints: true });
		console.log('OS:', asyncPlatform.os);
		console.log('OS Version:', asyncPlatform.osVersion || 'Not available');
		console.log('Architecture:', asyncPlatform.architecture || 'Not available');
		console.log('Device Model:', asyncPlatform.deviceModel || 'Not available');

		// Compare results
		console.log('\n📊 Comparison:');
		console.log('Additional OS Version:', asyncPlatform.osVersion && !syncPlatform.osVersion ? '✅' : '❌');
		console.log('Additional Architecture:', asyncPlatform.architecture && !syncPlatform.architecture ? '✅' : '❌');
		console.log('Additional Device Model:', asyncPlatform.deviceModel && !syncPlatform.deviceModel ? '✅' : '❌');

		// Confidence comparison
		if (asyncPlatform.confidence && syncPlatform.confidence) {
			console.log('\nConfidence Improvement:');
			console.log('Sync Overall:', syncPlatform.confidence.overall + '%');
			console.log('Async Overall:', asyncPlatform.confidence.overall + '%');
			console.log('Improvement:', `+${asyncPlatform.confidence.overall - syncPlatform.confidence.overall}%`);
		}
	} else {
		console.log('⚠️  Client Hints not supported - async detection provides same results as sync');
		const asyncPlatform = await detectPlatformAsync();
		console.log('OS:', asyncPlatform.os);
		console.log('Fallback to sync detection used');
	}

	console.log('\n💡 When to Use Async Detection:');
	console.log('✅ When accuracy is critical (OS version, architecture)');
	console.log('✅ On Chrome/Edge browsers (Client Hints supported)');
	console.log('✅ When you need detailed device information');
	console.log('❌ When speed is critical (use sync with caching)');
	console.log('❌ On Safari/Firefox (no Client Hints support)');
}

/**
 * Example 17: Enhanced v0.4.0 Features - Complete Example
 */
async function enhancedFeaturesExample() {
	console.log('\n🆕 Complete v0.4.0 Features Demo:');
	console.log('=================================');

	// Create detector with all options
	const detector = createPlatformDetector({
		debug: false,
		cacheTTL: 5000,
		useClientHints: true
	});

	// Detect with all features
	const platform = await detector.detectAsync();

	console.log('\n📱 Platform Detection:');
	console.log('Type:', platform.type);
	console.log('OS:', platform.os);
	console.log('OS Version:', platform.osVersion || 'N/A');
	console.log('Device:', platform.device);
	console.log('Device Model:', platform.deviceModel || 'N/A');
	console.log('Browser Family:', platform.browserFamily);
	console.log('Architecture:', platform.architecture || 'N/A');

	console.log('\n📊 Confidence Scores:');
	if (platform.confidence) {
		console.log('Overall:', platform.confidence.overall + '%');
		console.log('OS:', platform.confidence.os + '%');
		console.log('Device:', platform.confidence.device + '%');
		console.log('Browser:', platform.confidence.browser + '%');
	}

	console.log('\n🎯 Feature Detection:');
	const features = FeatureDetector.detectWithInference();
	console.log('Inferred Device:', features.inferredDevice);
	console.log('Confidence:', features.confidence + '%');
	console.log('Touch Support:', features.features.touch);
	console.log('Pointer Type:', features.features.pointer);

	console.log('\n💡 Client Hints:');
	if (ClientHintsDetector.isSupported()) {
		const hints = await ClientHintsDetector.getHighEntropyHints();
		if (hints) {
			console.log('Platform:', hints.platform);
			console.log('Platform Version:', hints.platformVersion);
			console.log('Form Factor:', hints.formFactor || 'N/A');
			console.log('UA Frozen:', ClientHintsDetector.isFrozenUA(navigator.userAgent) ? 'Yes' : 'No');
		}
	} else {
		console.log('Not supported on this browser');
	}

	console.log('\n🚀 Performance:');
	const start = performance.now();
	detector.detect(); // Should be cached
	const cached = performance.now() - start;
	console.log('Cached detection time:', cached.toFixed(2) + 'ms');

	console.log('\n✅ All v0.4.0 Features Demonstrated!');
}

/**
 * Run all examples
 */
export function runAllExamples() {
	console.log('Platform Detector - Comprehensive Examples\n');
	console.log('===========================================\n');

	basicDetection();
	quickChecks();
	telegramDetection();
	pwaDetection();
	nativeAppDetection();
	responsiveUIExample();
	domainModeExample();
	monitorChangesExample();
	debugExample();
	comprehensiveCheck();
}

/**
 * Run all v0.4.0 examples (async)
 */
export async function runV040Examples() {
	console.log('\n🆕 Platform Detector v0.4.0 - New Features Examples\n');
	console.log('===================================================\n');

	await clientHintsExample();
	featureDetectionExample();
	await confidenceScoringExample();
	browserFamilyExample();
	performanceOptimizationExample();
	await asyncDetectionExample();
	await enhancedFeaturesExample();
}

/**
 * Run ALL examples (including v0.4.0)
 */
export async function runAllExamplesIncludingV040() {
	runAllExamples();
	await runV040Examples();
}

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
	// Browser environment
	(window as any).platformDetectorExamples = {
		// Original examples
		basicDetection,
		quickChecks,
		telegramDetection,
		pwaDetection,
		nativeAppDetection,
		responsiveUIExample,
		domainModeExample,
		monitorChangesExample,
		debugExample,
		comprehensiveCheck,
		runAllExamples,
		// v0.4.0 examples
		clientHintsExample,
		featureDetectionExample,
		confidenceScoringExample,
		browserFamilyExample,
		performanceOptimizationExample,
		asyncDetectionExample,
		enhancedFeaturesExample,
		runV040Examples,
		runAllExamplesIncludingV040
	};

	console.log('Platform Detector examples loaded.');
	console.log('Run platformDetectorExamples.runAllExamples() for original examples');
	console.log('Run platformDetectorExamples.runV040Examples() for v0.4.0 features');
	console.log('Run platformDetectorExamples.runAllExamplesIncludingV040() for all examples');
}