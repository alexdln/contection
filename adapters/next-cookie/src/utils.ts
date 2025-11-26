import { type CookieFlags } from "./types";

export const isCookieAvailable = () => {
    if (typeof window === "undefined") return true;

    try {
        document.cookie = "___ctn_test=1";
        const enabled = document.cookie.includes("___ctn_test=");
        document.cookie = "___ctn_test=1; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        return enabled;
    } catch {
        //
    }
    return false;
};

export const getCookieFlags = (flags: CookieFlags = {}) => {
    const parts = [];
    const {
        path = "/",
        domain,
        expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        maxAge = 1000 * 60 * 60 * 24 * 30, // 30 days
        secure = true,
        sameSite = "strict",
    } = flags;

    if (path) parts.push(`path=${path}`);
    if (domain) parts.push(`domain=${domain}`);
    if (expires) parts.push(`expires=${expires.toUTCString()}`);
    if (maxAge !== undefined) parts.push(`max-age=${maxAge}`);
    if (secure) parts.push("secure");
    if (sameSite) parts.push(`samesite=${sameSite}`);

    return parts.join("; ");
};

export const cookieStorage = {
    getItem: (key: string) => {
        const cookieValue = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${key}=`));

        if (!cookieValue) return null;

        const [, ...valueParts] = cookieValue.split("=");
        const value = valueParts.join("=");
        return { value };
    },
    getItemServer: async (key: string) => {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        try {
            const cookieValue = cookieStore.get(key);

            if (!cookieValue) return null;

            return { value: cookieValue.value };
        } catch {
            return null;
        }
    },
    setItem: (key: string, value?: unknown, flags: CookieFlags = {}) => {
        const serialized = encodeURIComponent(JSON.stringify(value));
        const parts = [`${key}=${serialized}`];
        const flagsRaw = getCookieFlags(flags);
        if (flagsRaw) parts.push(flagsRaw);

        document.cookie = parts.join("; ");
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeItemServer: async (_key: string) => {
        return null;
    },
    removeItem: (key: string, flags: CookieFlags = {}) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { expires, maxAge, ...restFlags } = flags;
        const flagsRaw = getCookieFlags(restFlags);
        const parts = [`${key}=`, "expires=Thu, 01 Jan 1970 00:00:00 GMT"];
        if (flagsRaw) parts.push(flagsRaw);

        document.cookie = parts.join("; ");
    },
};
