/**
 * Platform types that can be detected
 */
export type PlatformType = "web" | "pwa" | "tma" | "native";

/**
 * Operating system types
 */
export type OSType =
    | "ios"
    | "android"
    | "macos"
    | "windows"
    | "linux"
    | "chromeos"
    | "unknown";

/**
 * Device form factor
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Domain mode for application
 */
export type DomainMode = "app" | "tma" | "unknown";

/**
 * Environment type
 */
export type EnvironmentType = "development" | "production" | "unknown";

/**
 * Telegram-specific platform identifiers
 */
export type TelegramPlatform =
    | "ios"
    | "android"
    | "android_x"
    | "macos"
    | "tdesktop"
    | "weba"
    | "webk"
    | "web"
    | "unknown";

/**
 * Telegram user object extracted from initData
 */
export interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
    allows_write_to_pm?: boolean;
}

/**
 * Telegram chat descriptor extracted from initData
 */
export interface TelegramWebAppChat {
    id: number;
    type: "sender" | "private" | "group" | "supergroup" | "channel";
    title?: string;
    username?: string;
    photo_url?: string;
}

/**
 * Parsed Telegram initData payload
 */
export interface TelegramInitData {
    query_id?: string;
    user?: TelegramWebAppUser;
    receiver?: TelegramWebAppUser;
    chat?: TelegramWebAppChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
    /** Raw, decoded key/value pairs (except hash) */
    dataCheckString: string;
    /** Original initData string */
    raw: string;
    /** All parameters decoded from initData */
    rawParams: Record<string, string>;
}

/**
 * Validation error codes for Telegram initData
 */
export type TelegramInitDataValidationErrorCode =
    | "MISSING_INIT_DATA"
    | "MISSING_BOT_TOKEN"
    | "MISSING_HASH"
    | "HASH_MISMATCH"
    | "INVALID_AUTH_DATE"
    | "EXPIRED"
    | "INVALID_JSON"
    | "CRYPTO_UNAVAILABLE"
    | "INVALID_PAYLOAD";

/**
 * Options for Telegram initData validation
 */
export interface TelegramInitDataValidationOptions {
    /** Maximum allowed age for auth_date in seconds (default 600s / 10 minutes). Set to 0 to skip */
    maxAgeSeconds?: number;
    /** Override current timestamp in seconds (for testing) */
    currentTimestamp?: number;
    /** Require presence of user object */
    requireUser?: boolean;
}

/**
 * Result of Telegram initData validation
 */
export interface TelegramInitDataValidationResult {
    ok: boolean;
    data?: TelegramInitData;
    error?: TelegramInitDataValidationErrorCode;
    message?: string;
}

/**
 * Detailed Capacitor information from native API
 */
export interface CapacitorInfo {
    /** Is running on native platform */
    isNativePlatform: boolean;

    /** Native platform name */
    platform: "ios" | "android" | "web" | "unknown";

    /** Check if plugin is available */
    isPluginAvailable: (plugin: string) => boolean;

    /** Capacitor native version */
    nativeVersion?: string;
}

/**
 * SDK source type
 */
export type TelegramSDKSource = "native" | "tma.js" | "unknown";

/**
 * Detailed Telegram information from WebApp SDK
 */
export interface TelegramInfo {
    /** Telegram platform identifier */
    platform: TelegramPlatform;

    /** Telegram WebApp SDK version */
    version: string;

    /** SDK source (native Telegram SDK or @tma.js) */
    sdkSource: TelegramSDKSource;

    /** Current color scheme */
    colorScheme: "light" | "dark";

    /** Current viewport height */
    viewportHeight: number;

    /** Stable viewport height (without keyboard) */
    viewportStableHeight: number;

    /** Is Mini App expanded */
    isExpanded: boolean;

    /** Is closing confirmation enabled */
    isClosingConfirmationEnabled: boolean;

    /** Header color */
    headerColor: string;

    /** Background color */
    backgroundColor: string;

    /** Safe area inset top */
    safeAreaInsetTop: number;

    /** Safe area inset bottom */
    safeAreaInsetBottom: number;

    /** Content safe area inset top */
    contentSafeAreaInsetTop: number;

    /** Content safe area inset bottom */
    contentSafeAreaInsetBottom: number;

    /** Init data string */
    initData?: string;

    /** User info from init data */
    user?: TelegramWebAppUser;

    /** Theme parameters (from @tma.js SDK) */
    themeParams?: {
        backgroundColor?: string;
        textColor?: string;
        hintColor?: string;
        linkColor?: string;
        buttonColor?: string;
        buttonTextColor?: string;
    };
}

/**
 * Screen information
 */
export interface ScreenInfo {
    /** Screen width in pixels */
    width: number;

    /** Screen height in pixels */
    height: number;

    /** Device pixel ratio */
    pixelRatio: number;
}

/**
 * Detection confidence score
 */
export interface DetectionConfidence {
    /** Overall confidence (0-100) */
    overall: number;
    /** OS detection confidence */
    os: number;
    /** Device detection confidence */
    device: number;
    /** Browser detection confidence */
    browser: number;
}

/**
 * Browser family types
 */
export type BrowserFamily = "chromium" | "webkit" | "gecko" | "unknown";

/**
 * Complete platform information
 */
export interface PlatformInfo {
    /** Primary platform type */
    type: PlatformType;

    /** Operating system */
    os: OSType;

    /** Operating system version (if detectable) */
    osVersion?: string;

    /** Device form factor */
    device: DeviceType;

    /** Domain mode (app.* or tg.*) */
    domainMode: DomainMode;

    /** Environment type (development or production) */
    environment: EnvironmentType;

    /** Is running as PWA (installed) */
    isPWA: boolean;

    /** Is running in Telegram Mini App */
    isTelegram: boolean;

    /** Is running as native mobile app (Capacitor/Cordova) */
    isNative: boolean;

    /** Is running in standard web browser */
    isWeb: boolean;

    /** Is mobile OS (iOS or Android) */
    isMobile: boolean;

    /** Is desktop OS (macOS, Windows, Linux, ChromeOS) */
    isDesktop: boolean;

    /** Is iOS (web, PWA, or native) */
    isIOS: boolean;

    /** Is Android (web, PWA, or native) */
    isAndroid: boolean;

    /** Is macOS (web or PWA) */
    isMacOS: boolean;

    /** Is Windows (web or PWA) */
    isWindows: boolean;

    /** Is Linux (web or PWA) */
    isLinux: boolean;

    /** Is ChromeOS (web or PWA) */
    isChromeOS: boolean;

    /** Browser user agent string */
    userAgent: string;

    /** Should show TMA mismatch warning */
    shouldShowTMAWarning: boolean;

    /** Screen information */
    screen: ScreenInfo;

    /** Browser family (Chromium, WebKit, Gecko) */
    browserFamily?: BrowserFamily;

    /** CPU architecture (if detectable) */
    architecture?: string;

    /** Device model name (if detectable) */
    deviceModel?: string;

    /** Detection confidence scores */
    confidence?: DetectionConfidence;

    /** Detailed Capacitor information (if available) */
    capacitor?: CapacitorInfo;

    /** Detailed Telegram information (if available) */
    telegram?: TelegramInfo;
}

/**
 * Configuration options for platform detection
 */
export interface PlatformDetectorOptions {
    /** Custom user agent string (for testing) */
    userAgent?: string;

    /** Custom hostname (for testing) */
    hostname?: string;

    /** Enable debug logging */
    debug?: boolean;

    /** Telegram web app object (for TMA detection) */
    telegramWebApp?: any;

    /** Environment override (for testing) */
    environment?: EnvironmentType;

    /** Enable Client Hints API (async detection) */
    useClientHints?: boolean;

    /** Enable feature-based detection */
    useFeatureDetection?: boolean;

    /** Cache detection results (milliseconds, default: 5000) */
    cacheTTL?: number;
}

/**
 * Result of Telegram Mini App (TMA) availability check
 */
export interface TMAAvailability {
    /** Is Telegram Mini App available */
    isAvailable: boolean;

    /** Reason if not available */
    reason?: string;

    /** Telegram bot URL for deep linking */
    botUrl?: string;
}
