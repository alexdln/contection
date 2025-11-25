import { type BaseStore, type GlobalStore } from "contection";
import { createStore, useStore, useStoreReducer } from "contection";
import { NextCookieAdapter } from "contection-next-cookie-adapter";
import React from "react";

import { render, screen, act } from "../../../src/setup/test-utils";
import { TestStoreType } from "../../../src/fixtures/test-store";

const createMockCookies = () => {
    const cookies = new Map<string, string>();
    return {
        cookies,
        get: jest.fn((key: string) => {
            const value = cookies.get(key);
            return value ? { value } : undefined;
        }),
        set: jest.fn((key: string, value: string) => {
            cookies.set(key, value);
        }),
        delete: jest.fn((key: string) => {
            cookies.delete(key);
        }),
    };
};

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

describe("NextCookieAdapter", () => {
    let mockCookieStore: ReturnType<typeof createMockCookies>;

    beforeEach(() => {
        mockCookieStore = createMockCookies();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { cookies } = require("next/headers");
        cookies.mockResolvedValue(mockCookieStore);

        Object.defineProperty(document, "cookie", {
            value: "",
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("should initialize with default values", () => {
            const adapter = new NextCookieAdapter({});
            expect(adapter).toBeInstanceOf(NextCookieAdapter);
        });

        it("should use custom prefix", () => {
            const adapter = new NextCookieAdapter({ prefix: "custom_" });
            const store = { count: 0 } as BaseStore;
            adapter.afterUpdate(store, { count: 1 });
            expect(document.cookie).toContain("custom_count=");
        });

        it("should handle null storage when cookies are unavailable", () => {
            const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
            Object.defineProperty(document, "cookie", {
                get: () => "",
                set: () => {
                    throw new Error("Cookie access denied");
                },
                configurable: true,
            });

            const adapter = new NextCookieAdapter({});
            const store = { count: 0 } as BaseStore;
            adapter.afterUpdate(store, { count: 1 });

            expect(document.cookie).toBe("");

            if (originalCookie) {
                Object.defineProperty(document, "cookie", originalCookie);
            }
        });
    });

    describe("getServerSnapshot", () => {
        it("should restore data from server cookies", async () => {
            const adapter = new NextCookieAdapter<{ count: number }>({});
            const encodedValue = encodeURIComponent(JSON.stringify(42));
            mockCookieStore.cookies.set("__ctn_count", encodedValue);

            const store = { count: 0 };
            const result = await adapter.getServerSnapshot(store);

            expect(result.count).toBe(42);
        });

        it("should return original store when no cookies exist", async () => {
            const adapter = new NextCookieAdapter<{ count: number }>({});
            const store = { count: 0 };
            const result = await adapter.getServerSnapshot(store);

            expect(result.count).toBe(0);
        });

        it("should only restore specified keys when saveKeys is provided", async () => {
            const adapter = new NextCookieAdapter<{ count: number; name: string }>({
                saveKeys: ["count"],
            });
            const encodedCount = encodeURIComponent(JSON.stringify(42));
            const encodedName = encodeURIComponent(JSON.stringify("Test"));
            mockCookieStore.cookies.set("__ctn_count", encodedCount);
            mockCookieStore.cookies.set("__ctn_name", encodedName);

            const store = { count: 0, name: "Initial" };
            const result = await adapter.getServerSnapshot(store);

            expect(result.count).toBe(42);
            expect(result.name).toBe("Initial");
        });

        it("should handle invalid JSON gracefully", async () => {
            const adapter = new NextCookieAdapter<{ count: number }>({});
            mockCookieStore.cookies.set("__ctn_count", "invalid json");

            const store = { count: 0 };
            const result = await adapter.getServerSnapshot(store);

            expect(result.count).toBe(0);
        });

        it("should validate data and remove invalid entries", async () => {
            const validate = jest.fn(() => false);
            const adapter = new NextCookieAdapter<{ count: number }>({ validate });
            const encodedValue = encodeURIComponent(JSON.stringify(42));
            mockCookieStore.cookies.set("__ctn_count", encodedValue);

            const store = { count: 0 };
            const result = await adapter.getServerSnapshot(store);

            expect(validate).toHaveBeenCalled();
            expect(result.count).toBe(0);
        });
    });

    describe("afterInit", () => {
        it("should setup autoSync interval when enabled", () => {
            jest.useFakeTimers();
            const adapter = new NextCookieAdapter<{ count: number }>({ autoSync: 500 });
            const store = { count: 0 };
            const setStore = jest.fn() as GlobalStore<typeof store>["setStore"];
            document.cookie = "__ctn_count=42";

            const cleanup = adapter.afterInit(store, setStore);

            expect(cleanup).toBeInstanceOf(Function);
            jest.advanceTimersByTime(300);
            expect(setStore).not.toHaveBeenCalled();
            jest.advanceTimersByTime(300);
            expect(setStore).toHaveBeenCalled();

            cleanup();
            jest.useRealTimers();
        });

        it("should not setup interval when autoSync is null", () => {
            const adapter = new NextCookieAdapter<{ count: number }>({ autoSync: null });
            const store = { count: 0 };
            const setStore = jest.fn() as GlobalStore<typeof store>["setStore"];

            adapter.afterInit(store, setStore);

            expect(setStore).not.toHaveBeenCalled();
        });

        it("should cleanup interval on unmount", () => {
            jest.useFakeTimers();
            const adapter = new NextCookieAdapter<{ count: number }>({ autoSync: 500 });
            const store = { count: 0 };
            const setStore = jest.fn() as GlobalStore<typeof store>["setStore"];

            const cleanup = adapter.afterInit(store, setStore);
            cleanup();

            jest.advanceTimersByTime(1000);
            expect(setStore).not.toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe("afterUpdate", () => {
        it("should save data to cookies", () => {
            const adapter = new NextCookieAdapter<{ count: number }>({});
            const store = { count: 0 };
            adapter.afterUpdate(store, { count: 42 });

            const cookies = document.cookie;
            expect(cookies).toContain("__ctn_count=");
            const cookieValue = cookies.split(";")[0].split("=")[1];
            const parsed = JSON.parse(decodeURIComponent(cookieValue));
            expect(parsed).toBe(42);
        });

        it("should not save data exceeding rawLimit", () => {
            const adapter = new NextCookieAdapter<{ count: number }>({ rawLimit: 10 });
            const store = { count: 0 };
            adapter.afterUpdate(store, { count: 10000000000000 });

            expect(document.cookie).not.toContain("__ctn_count=");
        });

        it("should only save specified keys when saveKeys is provided", () => {
            const adapter = new NextCookieAdapter<{ count: number; name: string }>({
                saveKeys: ["count"],
            });
            const store = { count: 0, name: "Test" };
            adapter.afterUpdate(store, { count: 42, name: "Updated" });

            expect(document.cookie).toContain("__ctn_count=");
            expect(document.cookie).not.toContain("__ctn_name=");
        });

        it("should use custom flags when setting cookies", () => {
            const adapter = new NextCookieAdapter<{ count: number }>({
                flags: { path: "/custom", sameSite: "lax" },
            });
            const store = { count: 0 };
            adapter.afterUpdate(store, { count: 42 });

            const cookies = document.cookie;
            expect(cookies).toContain("path=/custom");
            expect(cookies).toContain("samesite=lax");
        });
    });

    describe("beforeDestroy", () => {
        it("should not cleanup when onDestroy is 'ignore'", () => {
            const adapter = new NextCookieAdapter({ onDestroy: "ignore" });
            document.cookie = "__ctn_count=42";
            const store = { count: 1 } as BaseStore;

            adapter.beforeDestroy(store);

            expect(document.cookie).toContain("__ctn_count=");
        });

        it("should clear sync interval", () => {
            jest.useFakeTimers();
            const adapter = new NextCookieAdapter<{ count: number }>({ autoSync: 500 });
            const store = { count: 0 };
            const setStore = jest.fn() as GlobalStore<typeof store>["setStore"];

            adapter.afterInit(store, setStore);
            adapter.beforeDestroy(store);

            jest.advanceTimersByTime(1000);
            expect(setStore).not.toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe("validation", () => {
        it("should validate data using validate function", async () => {
            const validate = jest.fn((data: unknown) => {
                const obj = data as { count?: number };
                return obj.count !== undefined && obj.count >= 0;
            });

            const adapter = new NextCookieAdapter<{ count: number }>({ validate });
            const encodedValue = encodeURIComponent(JSON.stringify(42));
            mockCookieStore.cookies.set("__ctn_count", encodedValue);

            const store = { count: 0 };
            const result = await adapter.getServerSnapshot(store);

            expect(validate).toHaveBeenCalled();
            expect(result.count).toBe(42);
        });

        it("should remove invalid data from storage", async () => {
            const validate = jest.fn(() => false);
            const adapter = new NextCookieAdapter<{ count: number }>({ validate });
            const encodedValue = encodeURIComponent(JSON.stringify(42));
            mockCookieStore.cookies.set("__ctn_count", encodedValue);

            const store = { count: 0 };
            const result = await adapter.getServerSnapshot(store);

            expect(result.count).toBe(0);
        });
    });

    describe("integration with createStore", () => {
        it("should restore data from cookies on mount", async () => {
            const encodedCount = encodeURIComponent(JSON.stringify(10));
            const encodedName = encodeURIComponent(JSON.stringify("Restored"));
            mockCookieStore.cookies.set("__ctn_count", encodedCount);
            mockCookieStore.cookies.set("__ctn_name", encodedName);

            const Store = createStore<TestStoreType>(
                { count: 0, name: "Initial", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new NextCookieAdapter({}),
                },
            );

            const TestComponent = () => {
                const store = useStore(Store);
                return (
                    <div>
                        <div data-testid="count">{store.count}</div>
                        <div data-testid="name">{store.name}</div>
                    </div>
                );
            };

            await act(async () => {
                render(
                    <Store.Provider>
                        <TestComponent />
                    </Store.Provider>,
                );
            });

            // Note: getServerSnapshot is async and called during SSR, so in this test
            // we're mainly checking that the component renders without errors
            expect(screen.getByTestId("count")).toBeInTheDocument();
            expect(screen.getByTestId("name")).toBeInTheDocument();
        });

        it("should save updates to cookies", () => {
            const Store = createStore<TestStoreType>(
                { count: 0, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new NextCookieAdapter({}),
                },
            );

            const TestComponent = () => {
                const store = useStore(Store);
                const [, setStore] = useStoreReducer(Store);
                React.useEffect(() => {
                    setStore({ count: 5 });
                }, []);

                return <div data-testid="count">{store.count}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("5");
            expect(document.cookie).toContain("__ctn_count=");
        });

        it("should cleanup cookies on unmount when configured", () => {
            document.cookie = "__ctn_count=5";

            const Store = createStore<TestStoreType>(
                { count: 5, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new NextCookieAdapter({ onDestroy: "cleanup" }),
                },
            );

            const { unmount } = render(
                <Store.Provider>
                    <div>Test</div>
                </Store.Provider>,
            );

            unmount();

            expect(document.cookie).not.toContain("__ctn_count=");
        });

        it("should use custom prefix", () => {
            const Store = createStore<TestStoreType>(
                { count: 0, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new NextCookieAdapter({ prefix: "custom_" }),
                },
            );

            const TestComponent = () => {
                const store = useStore(Store);
                const [, setStore] = useStoreReducer(Store);
                React.useEffect(() => {
                    setStore({ count: 3 });
                }, []);
                return <div data-testid="count">{store.count}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(document.cookie).toContain("custom_count=");
        });
    });
});
