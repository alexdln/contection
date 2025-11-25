import { isCookieAvailable, getCookieFlags, cookieStorage } from "contection-next-cookie-adapter/src/utils";

describe("isCookieAvailable", () => {
    beforeEach(() => {
        Object.defineProperty(document, "cookie", {
            value: "",
            writable: true,
            configurable: true,
        });
    });

    it("should return true when cookies are available", () => {
        const result = isCookieAvailable();
        expect(result).toBe(true);
    });

    it("should return false when document.cookie is not writable", () => {
        const originalCookie = document.cookie;
        Object.defineProperty(document, "cookie", {
            get: () => "",
            set: () => {
                throw new Error("Cookie access denied");
            },
            configurable: true,
        });

        const result = isCookieAvailable();
        expect(result).toBe(false);

        if (originalCookie) {
            Object.defineProperty(document, "cookie", originalCookie);
        }
    });
});

describe("getCookieFlags", () => {
    it("should return default flags", () => {
        const flags = getCookieFlags();
        expect(flags).toContain("path=/");
        expect(flags).toContain("secure");
        expect(flags).toContain("samesite=strict");
        expect(flags).toMatch(/expires=/);
        expect(flags).toMatch(/max-age=/);
    });

    it("should include custom path", () => {
        const flags = getCookieFlags({ path: "/custom" });
        expect(flags).toContain("path=/custom");
    });

    it("should include custom domain", () => {
        const flags = getCookieFlags({ domain: "example.com" });
        expect(flags).toContain("domain=example.com");
    });

    it("should include custom sameSite", () => {
        const flags = getCookieFlags({ sameSite: "lax" });
        expect(flags).toContain("samesite=lax");
    });

    it("should not include secure when set to false", () => {
        const flags = getCookieFlags({ secure: false });
        expect(flags).not.toContain("secure");
    });

    it("should include custom expires", () => {
        const date = new Date("2025-12-31");
        const flags = getCookieFlags({ expires: date });
        expect(flags).toContain(`expires=${date.toUTCString()}`);
    });

    it("should include custom maxAge", () => {
        const flags = getCookieFlags({ maxAge: 3600 });
        expect(flags).toContain("max-age=3600");
    });
});

describe("cookieStorage", () => {
    beforeEach(() => {
        Object.defineProperty(document, "cookie", {
            value: "",
            writable: true,
            configurable: true,
        });
    });

    describe("getItem", () => {
        it("should return null when cookie does not exist", () => {
            const result = cookieStorage.getItem("nonexistent");
            expect(result).toBeNull();
        });

        it("should return cookie value when it exists", () => {
            document.cookie = "test_key=test_value";
            const result = cookieStorage.getItem("test_key");
            expect(result).toEqual({ value: "test_value" });
        });

        it("should handle encoded values", () => {
            const encodedValue = encodeURIComponent(JSON.stringify({ count: 42 }));
            document.cookie = `test_key=${encodedValue}`;
            const result = cookieStorage.getItem("test_key");
            expect(result).toEqual({ value: encodedValue });
        });

        it("should handle values with equals signs", () => {
            document.cookie = "test_key=value=with=equals";
            const result = cookieStorage.getItem("test_key");
            expect(result).toEqual({ value: "value=with=equals" });
        });
    });

    describe("setItem", () => {
        it("should set a cookie with default flags", () => {
            cookieStorage.setItem("test_key", { count: 42 });
            const cookies = document.cookie;
            expect(cookies).toContain("test_key=");
            expect(cookies).toContain("secure");
            expect(cookies).toContain("samesite=strict");
        });

        it("should serialize value as JSON", () => {
            cookieStorage.setItem("test_key", { count: 42, name: "test" });
            const cookieValue = document.cookie.split(";")[0];
            const value = cookieValue.split("=")[1];
            const parsed = JSON.parse(decodeURIComponent(value));
            expect(parsed).toEqual({ count: 42, name: "test" });
        });

        it("should use custom flags", () => {
            cookieStorage.setItem("test_key", "value", { path: "/custom", sameSite: "lax" });
            const cookies = document.cookie;
            expect(cookies).toContain("test_key=%22value%22");
        });
    });

    describe("removeItem", () => {
        it("should remove a cookie", () => {
            document.cookie = "test_key=value";
            cookieStorage.removeItem("test_key");
            const result = cookieStorage.getItem("test_key");
            expect(result?.value).toBe("");
        });

        it("should use custom flags when removing", () => {
            document.cookie = "test_key=value; path=/custom";
            cookieStorage.removeItem("test_key", { path: "/custom" });
            const result = cookieStorage.getItem("test_key");
            expect(result?.value).toBe("");
        });
    });
});
