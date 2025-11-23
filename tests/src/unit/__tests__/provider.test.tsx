import { useStoreReducer, useStore } from "contection";
import * as Utils from "contection/src/utils";
import React from "react";

import { render, screen, act } from "../../setup/test-utils";
import { createTestStore } from "../../fixtures/test-store";

describe("GlobalStoreProvider", () => {
    describe("basic rendering", () => {
        it("should render children", () => {
            const Store = createTestStore();
            const TestComponent = () => <div>Child Content</div>;

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByText("Child Content")).toBeInTheDocument();
        });
    });

    describe("default data initialization", () => {
        it("should initialize with defaultData from createStore", () => {
            const Store = createTestStore({ count: 10 });
            const TestComponent = () => {
                const [storeData] = useStoreReducer(Store);
                return <div data-testid="count">{storeData.count}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("10");
        });

        it("should initialize with value prop", () => {
            const Store = createTestStore();
            const TestComponent = () => {
                const [storeData] = useStoreReducer(Store);
                return <div data-testid="count">{storeData.count}</div>;
            };

            render(
                <Store.Provider
                    value={{
                        count: 20,
                        name: "Test",
                        user: { id: 1, email: "test@example.com" },
                        theme: "light",
                        items: [],
                    }}
                >
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("20");
        });

        it("should prioritize value prop over defaultData", () => {
            const Store = createTestStore({ count: 10 });
            const TestComponent = () => {
                const [storeData] = useStoreReducer(Store);
                return <div data-testid="count">{storeData.count}</div>;
            };

            render(
                <Store.Provider
                    value={{
                        count: 30,
                        name: "Test",
                        user: { id: 1, email: "test@example.com" },
                        theme: "light",
                        items: [],
                    }}
                >
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("30");
        });
    });

    describe("store update propagation", () => {
        it("should propagate updates to consumers", () => {
            const Store = createTestStore();
            const TestComponent = () => {
                const count = useStore(Store, { keys: ["count"] });
                return <div data-testid="count">{count.count}</div>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(Store);
                return <button onClick={() => update({ count: 5 })}>Update</button>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Update").click());
            expect(screen.getByTestId("count")).toHaveTextContent("5");
        });

        it("should propagate updates to multiple consumers", () => {
            const Store = createTestStore();
            const Consumer1 = () => {
                const count = useStore(Store, { keys: ["count"] });
                return <div data-testid="count1">{count.count}</div>;
            };
            const Consumer2 = () => {
                const count = useStore(Store, { keys: ["count"] });
                return <div data-testid="count2">{count.count}</div>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(Store);
                return <button onClick={() => update({ count: 7 })}>Update</button>;
            };

            render(
                <Store.Provider>
                    <Consumer1 />
                    <Consumer2 />
                    <UpdateComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count1")).toHaveTextContent("0");
            expect(screen.getByTestId("count2")).toHaveTextContent("0");
            act(() => screen.getByText("Update").click());
            expect(screen.getByTestId("count1")).toHaveTextContent("7");
            expect(screen.getByTestId("count2")).toHaveTextContent("7");
        });
    });

    describe("lifecycle hooks", () => {
        it("should call storeWillMount on client side", () => {
            const storeWillMount = jest.fn();
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            // storeWillMount is called during render (client-side only)
            // In jsdom environment, window is defined, so it should be called
            expect(storeWillMount).toHaveBeenCalled();
        });

        it("should NOT call storeWillMount on server side", () => {
            // Mock server environment
            const checkIsServerSpy = jest.spyOn(Utils, "checkIsServer").mockReturnValue(true);

            const storeWillMount = jest.fn(() => {});
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: storeWillMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(storeWillMount).not.toHaveBeenCalled();

            checkIsServerSpy.mockRestore();
        });

        it("should call storeDidMount after mount", () => {
            const storeDidMount = jest.fn();
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeDidMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            // storeDidMount is called in useEffect, so it should be called after mount
            expect(storeDidMount).toHaveBeenCalled();
        });

        it("should call storeWillUnmount on unmount", () => {
            const storeWillUnmount = jest.fn();
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillUnmount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(storeWillUnmount).not.toHaveBeenCalled();
            unmount();
            expect(storeWillUnmount).toHaveBeenCalled();
        });

        it("should call storeWillUnmountAsync on unmount", () => {
            const storeWillUnmountAsync = jest.fn();
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillUnmountAsync,
                },
            });

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(storeWillUnmountAsync).not.toHaveBeenCalled();
            unmount();
            expect(storeWillUnmountAsync).toHaveBeenCalled();
        });

        it("should call lifecycle hooks in correct order", () => {
            const callOrder: string[] = [];
            const storeWillMount = jest.fn(() => {
                callOrder.push("storeWillMount");
            });
            const storeDidMount = jest.fn(() => {
                callOrder.push("storeDidMount");
            });
            const storeWillUnmount = jest.fn(() => {
                callOrder.push("storeWillUnmount");
            });
            const storeWillUnmountAsync = jest.fn(() => {
                callOrder.push("storeWillUnmountAsync");
            });

            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount,
                    storeDidMount,
                    storeWillUnmount,
                    storeWillUnmountAsync,
                },
            });

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            // Mount phase
            expect(callOrder).toContain("storeWillMount");
            expect(callOrder).toContain("storeDidMount");
            expect(callOrder.indexOf("storeWillMount")).toBeLessThan(callOrder.indexOf("storeDidMount"));

            unmount();

            // Unmount phase
            expect(callOrder).toContain("storeWillUnmount");
            expect(callOrder).toContain("storeWillUnmountAsync");
            expect(callOrder.indexOf("storeWillUnmount")).toBeLessThan(callOrder.indexOf("storeWillUnmountAsync"));
        });

        it("should handle cleanup functions from lifecycle hooks", () => {
            const cleanup = jest.fn();
            const storeDidMount = jest.fn(() => cleanup);
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeDidMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(cleanup).not.toHaveBeenCalled();
            unmount();
            expect(cleanup).toHaveBeenCalled();
        });

        it("should correctly handle storeWillMount cleanup in React Strict Mode", () => {
            const cleanup = jest.fn();
            const storeWillMount = jest.fn(() => cleanup);
            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
                { reactStrictMode: true },
            );

            expect(storeWillMount).toHaveBeenCalledTimes(2);
            expect(cleanup).toHaveBeenCalledTimes(1);
            unmount();
            expect(cleanup).toHaveBeenCalledTimes(2);
        });
    });

    describe("proxy behavior", () => {
        it("should return correct values", () => {
            const Store = createTestStore({ count: 5 });
            const TestComponent = () => {
                const [storeData] = useStoreReducer(Store);
                return (
                    <div>
                        <span data-testid="count">{storeData.count}</span>
                        <span data-testid="name">{storeData.name}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("5");
            expect(screen.getByTestId("name")).toHaveTextContent("Test");
        });

        it("should throw error for non-string keys in proxy", () => {
            const Store = createTestStore();
            const TestComponent = () => {
                const [storeData] = useStoreReducer(Store);
                // @ts-expect-error - testing runtime error
                const value = storeData[Symbol("test")];
                return <div>{String(value)}</div>;
            };

            expect(() => {
                render(
                    <Store.Provider>
                        <TestComponent />
                    </Store.Provider>,
                );
            }).toThrow();
        });
    });

    describe("multiple provider scopes", () => {
        it("should create isolated store scopes", () => {
            const Store = createTestStore();
            const Consumer = ({ id }: { id: string }) => {
                const count = useStore(Store, { keys: ["count"] });
                return <div data-testid={id}>{count.count}</div>;
            };

            const UpdateComponent1 = () => {
                const [, update] = useStoreReducer(Store);
                return (
                    <button data-testid="update1" onClick={() => update({ count: 10 })}>
                        Update 1
                    </button>
                );
            };

            const UpdateComponent2 = () => {
                const [, update] = useStoreReducer(Store);
                return (
                    <button data-testid="update2" onClick={() => update({ count: 20 })}>
                        Update 2
                    </button>
                );
            };

            render(
                <>
                    <Store.Provider
                        value={{
                            count: 1,
                            name: "Test",
                            user: { id: 1, email: "test@example.com" },
                            theme: "light",
                            items: [],
                        }}
                    >
                        <Consumer id="consumer1" />
                        <UpdateComponent1 />
                    </Store.Provider>
                    <Store.Provider
                        value={{
                            count: 2,
                            name: "Test",
                            user: { id: 1, email: "test@example.com" },
                            theme: "light",
                            items: [],
                        }}
                    >
                        <Consumer id="consumer2" />
                        <UpdateComponent2 />
                    </Store.Provider>
                </>,
            );

            expect(screen.getByTestId("consumer1")).toHaveTextContent("1");
            expect(screen.getByTestId("consumer2")).toHaveTextContent("2");

            act(() => screen.getByTestId("update1").click());
            expect(screen.getByTestId("consumer1")).toHaveTextContent("10");
            expect(screen.getByTestId("consumer2")).toHaveTextContent("2"); // Should remain unchanged

            act(() => screen.getByTestId("update2").click());
            expect(screen.getByTestId("consumer1")).toHaveTextContent("10"); // Should remain unchanged
            expect(screen.getByTestId("consumer2")).toHaveTextContent("20");
        });
    });

    describe("Provider options prop", () => {
        it("should accept options prop and call lifecycle hooks", () => {
            const storeWillMount = jest.fn();
            const storeDidMount = jest.fn();
            const storeWillUnmount = jest.fn();
            const storeWillUnmountAsync = jest.fn();

            const Store = createTestStore();

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider
                    options={{
                        lifecycleHooks: {
                            storeWillMount,
                            storeDidMount,
                            storeWillUnmount,
                            storeWillUnmountAsync,
                        },
                    }}
                >
                    <TestComponent />
                </Store.Provider>,
            );

            expect(storeWillMount).toHaveBeenCalled();
            expect(storeDidMount).toHaveBeenCalled();
            expect(storeWillUnmount).not.toHaveBeenCalled();
            expect(storeWillUnmountAsync).not.toHaveBeenCalled();

            unmount();

            expect(storeWillUnmount).toHaveBeenCalled();
            expect(storeWillUnmountAsync).toHaveBeenCalled();
        });

        it("should not merge Provider options with createStore options", () => {
            const providerWillMount = jest.fn();
            const createStoreDidMount = jest.fn();

            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeDidMount: createStoreDidMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            render(
                <Store.Provider
                    options={{
                        lifecycleHooks: {
                            storeWillMount: providerWillMount,
                        },
                    }}
                >
                    <TestComponent />
                </Store.Provider>,
            );

            expect(providerWillMount).toHaveBeenCalled();
            expect(createStoreDidMount).not.toHaveBeenCalled();
        });

        it("should merge partial Provider options with createStore options", () => {
            const createStoreWillMount = jest.fn();
            const createStoreDidMount = jest.fn();
            const providerWillUnmount = jest.fn();

            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: createStoreWillMount,
                    storeDidMount: createStoreDidMount,
                },
            });

            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider
                    options={{
                        lifecycleHooks: {
                            storeWillUnmount: providerWillUnmount,
                        },
                    }}
                >
                    <TestComponent />
                </Store.Provider>,
            );

            expect(createStoreWillMount).not.toHaveBeenCalled();
            expect(createStoreDidMount).not.toHaveBeenCalled();

            unmount();

            expect(providerWillUnmount).toHaveBeenCalled();
        });

        it("should work with multiple Provider instances having different options", () => {
            const hook1 = jest.fn();
            const hook2 = jest.fn();

            const Store = createTestStore();

            const Consumer = ({ id }: { id: string }) => {
                const count = useStore(Store, { keys: ["count"] });
                return <div data-testid={id}>{count.count}</div>;
            };

            render(
                <>
                    <Store.Provider
                        options={{
                            lifecycleHooks: {
                                storeDidMount: hook1,
                            },
                        }}
                    >
                        <Consumer id="consumer1" />
                    </Store.Provider>
                    <Store.Provider
                        options={{
                            lifecycleHooks: {
                                storeDidMount: hook2,
                            },
                        }}
                    >
                        <Consumer id="consumer2" />
                    </Store.Provider>
                </>,
            );

            expect(hook1).toHaveBeenCalledTimes(1);
            expect(hook2).toHaveBeenCalledTimes(1);
        });

        it("should clear store options when provider options pass empty lifecycleHooks", () => {
            const createStoreWillMount = jest.fn();
            const createStoreDidMount = jest.fn();

            const Store = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: createStoreWillMount,
                    storeDidMount: createStoreDidMount,
                },
            });
            const TestComponent = () => <div>Test</div>;

            render(
                <Store.Provider options={{ lifecycleHooks: {} }}>
                    <TestComponent />
                </Store.Provider>,
            );
            expect(createStoreWillMount).not.toHaveBeenCalled();
            expect(createStoreDidMount).not.toHaveBeenCalled();
        });
    });

    describe("validate option", () => {
        it("should throw error when initial data validation fails", () => {
            const validate = jest.fn(() => false);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => <div>Test</div>;

            expect(() => {
                render(
                    <Store.Provider>
                        <TestComponent />
                    </Store.Provider>,
                );
            }).toThrow("Invalid initial store data");

            expect(validate).toHaveBeenCalled();
        });

        it("should allow provider to render when initial data validation passes", () => {
            const validate = jest.fn(() => true);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => <div>Test</div>;

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByText("Test")).toBeInTheDocument();
            expect(validate).toHaveBeenCalled();
        });

        it("should throw error when initial data validation returns null", () => {
            const validate = jest.fn(() => null);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => <div>Test</div>;

            expect(() => {
                render(
                    <Store.Provider>
                        <TestComponent />
                    </Store.Provider>,
                );
            }).toThrow("Invalid initial store data");
        });

        it("should throw error when initial data validation returns undefined", () => {
            const validate = jest.fn(() => undefined);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => <div>Test</div>;

            expect(() => {
                render(
                    <Store.Provider>
                        <TestComponent />
                    </Store.Provider>,
                );
            }).toThrow("Invalid initial store data");
        });

        it("should allow update when validation passes", () => {
            const validate = jest.fn(() => true);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => {
                const store = useStore(Store);
                const [, update] = useStoreReducer(Store);
                return (
                    <div>
                        <div data-testid="count">{store.count}</div>
                        <button onClick={() => update({ count: 5 })}>Update</button>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            // Validate is called once for initial data
            expect(validate).toHaveBeenCalledTimes(1);
            act(() => screen.getByText("Update").click());
            expect(screen.getByTestId("count")).toHaveTextContent("5");
            // Validate is called again for the update
            expect(validate).toHaveBeenCalledTimes(2);
            expect(validate).toHaveBeenCalledWith(expect.objectContaining({ count: 5 }));
        });

        it("should prevent update when validation fails", () => {
            const validate = jest.fn((data) => data.count !== 5);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => {
                const store = useStore(Store);
                const [, update] = useStoreReducer(Store);
                return (
                    <div>
                        <div data-testid="count">{store.count}</div>
                        <button onClick={() => update({ count: 5 })}>Update Invalid</button>
                        <button onClick={() => update({ count: 10 })}>Update Valid</button>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Update Invalid").click());
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Update Valid").click());
            expect(screen.getByTestId("count")).toHaveTextContent("10");
        });

        it("should prevent update when validation returns undefined", () => {
            const validate = jest.fn(() => undefined);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => {
                const store = useStore(Store);
                const [, update] = useStoreReducer(Store);
                return (
                    <div>
                        <div data-testid="count">{store.count}</div>
                        <button onClick={() => update({ count: 5 })}>Update</button>
                    </div>
                );
            };

            expect(() =>
                render(
                    <Store.Provider>
                        <TestComponent />
                    </Store.Provider>,
                ),
            ).toThrow("Invalid initial store data");
        });

        it("should validate function-based updates", () => {
            const validate = jest.fn(() => true);
            const Store = createTestStore(undefined, { validate });
            const TestComponent = () => {
                const store = useStore(Store);
                const [, update] = useStoreReducer(Store);
                return (
                    <div>
                        <div data-testid="count">{store.count}</div>
                        <button onClick={() => update((prev) => ({ count: prev.count + 1 }))}>Increment</button>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Increment").click());
            expect(screen.getByTestId("count")).toHaveTextContent("1");
            expect(validate).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
        });

        it("should use validate from Provider options when provided", () => {
            const createStoreValidate = jest.fn(() => true);
            const providerValidate = jest.fn(() => false);
            const Store = createTestStore(undefined, { validate: createStoreValidate });
            const TestComponent = () => {
                const store = useStore(Store);
                const [, update] = useStoreReducer(Store);
                return (
                    <div>
                        <div data-testid="count">{store.count}</div>
                        <button onClick={() => update({ count: 5 })}>Update</button>
                    </div>
                );
            };

            expect(() =>
                render(
                    <Store.Provider options={{ validate: providerValidate }}>
                        <TestComponent />
                    </Store.Provider>,
                ),
            ).toThrow("Invalid initial store data");

            expect(providerValidate).toHaveBeenCalled();
            expect(createStoreValidate).not.toHaveBeenCalled();
        });
    });
});
