/**
 * @dfsol/platform-detector - Usage Examples
 *
 * This file demonstrates all the detection capabilities of the platform detector
 */

import {
	detectPlatform,
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

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
	// Browser environment
	(window as any).platformDetectorExamples = {
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
		runAllExamples
	};

	console.log('Platform Detector examples loaded. Run platformDetectorExamples.runAllExamples() in console.');
}