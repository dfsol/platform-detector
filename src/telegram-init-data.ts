import type {
    TelegramInitData,
    TelegramInitDataValidationErrorCode,
    TelegramInitDataValidationOptions,
    TelegramInitDataValidationResult,
    TelegramWebAppChat,
    TelegramWebAppUser,
} from "./types.js";

const DEFAULT_MAX_AGE_SECONDS = 600; // 10 minutes
const encoder = new TextEncoder();

/**
 * Verify Telegram Mini App initData payload according to Telegram specs.
 * Pure helper that can be plugged into a Hono handler or any server framework.
 */
export async function verifyTelegramInitData(
    initData: string | URLSearchParams | null | undefined,
    botToken: string | null | undefined,
    options: TelegramInitDataValidationOptions = {},
): Promise<TelegramInitDataValidationResult> {
    if (
        !initData ||
        (typeof initData === "string" && initData.trim().length === 0)
    ) {
        return invalidResult(
            "MISSING_INIT_DATA",
            "initData payload is required",
        );
    }

    if (!botToken) {
        return invalidResult(
            "MISSING_BOT_TOKEN",
            "Telegram bot token is required",
        );
    }

    const rawString =
        typeof initData === "string" ? initData.trim() : initData.toString();
    const params =
        initData instanceof URLSearchParams
            ? new URLSearchParams(initData.toString())
            : new URLSearchParams(
                  rawString.startsWith("?") ? rawString.slice(1) : rawString,
              );

    const hash = params.get("hash");
    if (!hash) {
        return invalidResult(
            "MISSING_HASH",
            "hash parameter is required in initData",
        );
    }

    const entries = Array.from(params.entries());
    const rawParams: Record<string, string> = {};
    for (const [key, value] of entries) {
        rawParams[key] = value;
    }

    const dataCheckString = entries
        .filter(([key]) => key !== "hash")
        .map(([key, value]) => `${key}=${value}`)
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
        .join("\n");

    try {
        const secretKey = await hmacSha256(
            encoder.encode("WebAppData"),
            encoder.encode(botToken),
        );
        const computedHash = await hmacSha256(
            secretKey,
            encoder.encode(dataCheckString),
        );
        const computedHex = bytesToHex(computedHash);

        if (!timingSafeEqual(computedHex, hash.toLowerCase())) {
            return invalidResult(
                "HASH_MISMATCH",
                "initData hash does not match Telegram signature",
            );
        }
    } catch (error) {
        return invalidResult(
            "CRYPTO_UNAVAILABLE",
            error instanceof Error
                ? error.message
                : "Web Crypto API is not available",
        );
    }

    const authDateRaw = params.get("auth_date");
    const authDate = authDateRaw ? Number(authDateRaw) : NaN;
    if (!Number.isFinite(authDate)) {
        return invalidResult(
            "INVALID_AUTH_DATE",
            "auth_date must be a valid UNIX timestamp",
        );
    }

    const now = options.currentTimestamp ?? Math.floor(Date.now() / 1000);
    const maxAge = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;

    if (maxAge > 0 && now - authDate > maxAge) {
        return invalidResult("EXPIRED", "initData is expired");
    }

    if (authDate - now > 60) {
        return invalidResult(
            "INVALID_AUTH_DATE",
            "auth_date is more than 60 seconds in the future",
        );
    }

    const user = parseJsonField<TelegramWebAppUser>(params.get("user"), "user");
    if (user instanceof Error) {
        return invalidResult("INVALID_JSON", user.message);
    }

    const receiver = parseJsonField<TelegramWebAppUser>(
        params.get("receiver"),
        "receiver",
    );
    if (receiver instanceof Error) {
        return invalidResult("INVALID_JSON", receiver.message);
    }

    const chat = parseJsonField<TelegramWebAppChat>(params.get("chat"), "chat");
    if (chat instanceof Error) {
        return invalidResult("INVALID_JSON", chat.message);
    }

    if (options.requireUser && !user) {
        return invalidResult(
            "INVALID_PAYLOAD",
            "user field is required but missing",
        );
    }

    const canSendAfterRaw = params.get("can_send_after");
    const canSendAfter = canSendAfterRaw ? Number(canSendAfterRaw) : undefined;

    const data: TelegramInitData = {
        query_id: params.get("query_id") || undefined,
        user: user || undefined,
        receiver: receiver || undefined,
        chat: chat || undefined,
        chat_type: params.get("chat_type") || undefined,
        chat_instance: params.get("chat_instance") || undefined,
        start_param: params.get("start_param") || undefined,
        can_send_after: Number.isFinite(canSendAfter)
            ? canSendAfter
            : undefined,
        auth_date: authDate,
        hash,
        dataCheckString,
        raw: rawString,
        rawParams,
    };

    return { ok: true, data };
}

function invalidResult(
    error: TelegramInitDataValidationErrorCode,
    message: string,
): TelegramInitDataValidationResult {
    return { ok: false, error, message };
}

function parseJsonField<T>(
    value: string | null,
    field: string,
): T | Error | undefined {
    if (!value) {
        return undefined;
    }
    try {
        return JSON.parse(value) as T;
    } catch {
        return new Error(`Invalid JSON in "${field}" field`);
    }
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hmacSha256(
    key: Uint8Array,
    data: Uint8Array,
): Promise<Uint8Array> {
    if (!globalThis.crypto?.subtle) {
        throw new Error(
            "Web Crypto API (crypto.subtle) is not available in this environment",
        );
    }

    const cryptoKey = await globalThis.crypto.subtle.importKey(
        "raw",
        toArrayBuffer(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const signature = await globalThis.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        toArrayBuffer(data),
    );
    return new Uint8Array(signature);
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(view.byteLength);
    new Uint8Array(buffer).set(view);
    return buffer;
}
