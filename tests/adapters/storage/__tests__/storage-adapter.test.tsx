import { createStore, useStore, useStoreReducer } from "contection";
import { StorageAdapter } from "contection-storage-adapter";
import { type BaseStore, type GlobalStore } from "contection";
import React from "react";

import { render, screen } from "../../../src/setup/test-utils";
import { TestStoreType } from "../../../src/fixtures/test-store";

const createMockStorage = () => {
    const storage = new Map<string, string>();
    return {
        getItem: jest.fn((key: string) => storage.get(key) || null),
        setItem: jest.fn((key: string, value: string) => {
            storage.set(key, value);
        }),
        removeItem: jest.fn((key: string) => {
            storage.delete(key);
        }),
        clear: jest.fn(() => storage.clear()),
        get length() {
            return storage.size;
        },
        key: jest.fn((index: number) => {
            const keys = Array.from(storage.keys());
            return keys[index] || null;
        }),
    };
};

describe("StorageAdapter", () => {
    let mockLocalStorage: ReturnType<typeof createMockStorage>;
    let mockSessionStorage: ReturnType<typeof createMockStorage>;

    beforeEach(() => {
        mockLocalStorage = createMockStorage();
        mockSessionStorage = createMockStorage();

        Object.defineProperty(window, "localStorage", {
            value: mockLocalStorage,
            writable: true,
            configurable: true,
        });

        Object.defineProperty(window, "sessionStorage", {
            value: mockSessionStorage,
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("should initialize with default values", () => {
            const adapter = new StorageAdapter({});
            expect(adapter).toBeInstanceOf(StorageAdapter);
        });

        it("should use localStorage by default", () => {
            const adapter = new StorageAdapter({});
            const store = { count: 0 } as BaseStore;
            adapter.afterUpdate(store, { count: 1 });
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("__ctn_count", "1");
        });

        it("should use sessionStorage when specified", () => {
            const adapter = new StorageAdapter({ storage: "sessionStorage" });
            const store = { count: 0 } as BaseStore;
            adapter.afterUpdate(store, { count: 1 });
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith("__ctn_count", "1");
        });

        it("should handle null storage option", () => {
            const adapter = new StorageAdapter({ storage: null });
            const store = { count: 0 } as BaseStore;
            adapter.afterUpdate(store, { count: 1 });
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe("beforeInit", () => {
        it("should restore data from storage when enabled is 'always'", () => {
            const adapter = new StorageAdapter<{ count: number }>({ enabled: "always" });
            mockLocalStorage.setItem("__ctn_count", "42");

            const store = { count: 0 };
            const result = adapter.beforeInit(store);

            expect(result.count).toBe(42);
        });

        it("should not restore data when enabled is 'never'", () => {
            const adapter = new StorageAdapter<{ count: number }>({ enabled: "never" });
            mockLocalStorage.setItem("__ctn_count", "42");

            const store = { count: 0 };
            const result = adapter.beforeInit(store);

            expect(result.count).toBe(0);
        });

        it("should handle invalid JSON gracefully", () => {
            const adapter = new StorageAdapter<{ count: number }>({ enabled: "always" });
            mockLocalStorage.setItem("__ctn_count", "invalid json");

            const store = { count: 0 };
            const result = adapter.beforeInit(store);

            expect(result.count).toBe(0);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("__ctn_count");
        });
    });

    describe("afterInit", () => {
        it("should restore data when enabled is 'after-hydration'", () => {
            const adapter = new StorageAdapter<{ count: number }>({ enabled: "after-hydration" });
            mockLocalStorage.setItem("__ctn_count", "42");

            const store = { count: 0 };
            const setStore = jest.fn() as GlobalStore<typeof store>["setStore"];

            adapter.afterInit(store, setStore);

            expect(setStore).toHaveBeenCalledWith({ count: 42 });
        });
    });

    describe("afterUpdate", () => {
        it("should save data to storage", () => {
            const adapter = new StorageAdapter<{ count: number }>({});
            const store = { count: 0 };
            adapter.afterUpdate(store, { count: 10000000000000 });
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("__ctn_count", "10000000000000");
        });

        it("should not save data exceeding rawLimit", () => {
            const adapter = new StorageAdapter<{ count: number }>({ rawLimit: 10 });
            const store = { count: 0 };
            adapter.afterUpdate(store, { count: 10000000000000 });
            expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith("__ctn_count", "10000000000000");
        });
    });

    describe("beforeDestroy", () => {
        it("should cleanup storage when onDestroy is 'cleanup'", () => {
            const adapter = new StorageAdapter({ onDestroy: "cleanup" });
            mockLocalStorage.setItem("__ctn_count", "1");
            const store = { count: 1 } as BaseStore;

            adapter.beforeDestroy(store);

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("__ctn_count");
        });

        it("should not cleanup when onDestroy is 'ignore'", () => {
            const adapter = new StorageAdapter({ onDestroy: "ignore" });
            mockLocalStorage.setItem("__ctn_count", "1");
            const store = { count: 1 } as BaseStore;

            adapter.beforeDestroy(store);

            expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith("__ctn_count");
        });
    });

    describe("schema validation", () => {
        it("should validate data using schema", () => {
            const schema = {
                validate: jest.fn((data: unknown) => {
                    const obj = data as { count?: number };
                    return obj.count !== undefined && obj.count >= 0;
                }),
            };

            const adapter = new StorageAdapter<{ count: number }>({ enabled: "always", schema });
            mockLocalStorage.setItem("__ctn_count", "42");

            const store = { count: 0 };
            const result = adapter.beforeInit(store);

            expect(schema.validate).toHaveBeenCalled();
            expect(result.count).toBe(42);
        });

        it("should remove invalid data from storage", () => {
            const schema = { validate: jest.fn(() => false) };
            const adapter = new StorageAdapter<{ count: number }>({ enabled: "always", schema });
            mockLocalStorage.setItem("__ctn_count", "42");

            const store = { count: 0 };
            const result = adapter.beforeInit(store);

            expect(result.count).toBe(0);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("__ctn_count");
        });
    });

    describe("integration with createStore", () => {
        it("should restore data from localStorage on mount", () => {
            mockLocalStorage.setItem("__ctn_count", "10");
            mockLocalStorage.setItem("__ctn_name", JSON.stringify("Restored"));

            const Store = createStore<TestStoreType>(
                { count: 0, name: "Initial", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new StorageAdapter({ enabled: "always" }),
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

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("10");
            expect(screen.getByTestId("name")).toHaveTextContent("Restored");
        });

        it("should save updates to localStorage", () => {
            const Store = createStore<TestStoreType>(
                { count: 0, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new StorageAdapter({}),
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
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("__ctn_count", "5");
        });

        it("should cleanup storage on unmount when configured", () => {
            mockLocalStorage.setItem("__ctn_count", "5");

            const Store = createStore<TestStoreType>(
                { count: 5, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new StorageAdapter({ onDestroy: "cleanup" }),
                },
            );

            const { unmount } = render(
                <Store.Provider>
                    <div>Test</div>
                </Store.Provider>,
            );

            unmount();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("__ctn_count");
        });

        it("should use custom prefix", () => {
            const Store = createStore<TestStoreType>(
                { count: 0, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new StorageAdapter({ prefix: "custom_" }),
                },
            );

            const TestComponent = () => {
                const [store, setStore] = useStoreReducer(Store);
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

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith("custom_count", "3");
        });

        it("should work with sessionStorage", () => {
            const Store = createStore<TestStoreType>(
                { count: 0, name: "Test", user: { id: 1, email: "test@example.com" }, theme: "light", items: [] },
                {
                    adapter: new StorageAdapter({ storage: "sessionStorage" }),
                },
            );

            const TestComponent = () => {
                const [store, setStore] = useStoreReducer(Store);
                React.useEffect(() => {
                    setStore({ count: 7 });
                }, []);
                return <div data-testid="count">{store.count}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(mockSessionStorage.setItem).toHaveBeenCalledWith("__ctn_count", "7");
        });
    });
});
