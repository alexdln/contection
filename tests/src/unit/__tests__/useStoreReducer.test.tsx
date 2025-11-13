import { useStoreReducer } from "contection";
import React, { useEffect } from "react";

import { render, screen, act } from "../../setup/test-utils";
import { createTestStore } from "../../fixtures/test-store";

describe("useStoreReducer", () => {
    let TestStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        TestStore = createTestStore();
    });

    describe("return value structure", () => {
        it("should return tuple with store, update, listen, and unlisten", () => {
            const TestComponent = () => {
                const [store, update, listen, unlisten] = useStoreReducer(TestStore);
                expect(store).toBeDefined();
                expect(typeof update).toBe("function");
                expect(typeof listen).toBe("function");
                expect(typeof unlisten).toBe("function");
                return <div>Test</div>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        it("should return initial store data", () => {
            const TestComponent = () => {
                const [store] = useStoreReducer(TestStore);
                return <div data-testid="count">{store.count}</div>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
        });
    });

    describe("update function", () => {
        it("should update store with partial object", () => {
            const TestComponent = () => {
                const [store, update] = useStoreReducer(TestStore);
                return (
                    <div>
                        <span data-testid="count">{store.count}</span>
                        <button onClick={() => update({ count: store.count + 1 })}>Increment</button>
                    </div>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <TestStore.Consumer>
                        {(data) => <div data-testid="rerendered-count">{data.count}</div>}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Increment").click());
            // useStoreReducer doesn't trigger re-render
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("rerendered-count")).toHaveTextContent("1");
        });

        it("should update store with function", () => {
            const TestComponent = () => {
                const [store, update] = useStoreReducer(TestStore);
                return (
                    <div>
                        <span data-testid="count">{store.count}</span>
                        <button onClick={() => update((prev) => ({ count: prev.count + 1 }))}>Increment</button>
                    </div>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <TestStore.Consumer>
                        {(data) => <div data-testid="rerendered-count">{data.count}</div>}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Increment").click());
            expect(screen.getByTestId("count")).toHaveTextContent("0"); // useStoreReducer doesn't trigger re-render
            expect(screen.getByTestId("rerendered-count")).toHaveTextContent("1");
        });

        it("should update multiple keys at once", () => {
            const TestComponent = () => {
                const [store, update] = useStoreReducer(TestStore);
                return (
                    <div>
                        <span data-testid="count">{store.count}</span>
                        <span data-testid="name">{store.name}</span>
                        <button onClick={() => update({ count: 5, name: "Updated" })}>Update</button>
                    </div>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <TestStore.Consumer>
                        {(data) => (
                            <>
                                <div data-testid="rerendered-name">{data.name}</div>
                                <div data-testid="rerendered-count">{data.count}</div>
                            </>
                        )}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            act(() => screen.getByText("Update").click());
            expect(screen.getByTestId("name")).toHaveTextContent("Test"); // useStoreReducer doesn't trigger re-render
            expect(screen.getByTestId("count")).toHaveTextContent("0"); // useStoreReducer doesn't trigger re-render
            expect(screen.getByTestId("rerendered-name")).toHaveTextContent("Updated");
            expect(screen.getByTestId("rerendered-count")).toHaveTextContent("5");
        });
    });

    describe("listen function", () => {
        it("should call listener when key changes", (done) => {
            const TestComponent = () => {
                const [, update, listen] = useStoreReducer(TestStore);

                useEffect(() => {
                    const unlisten = listen("count", (value) => {
                        expect(value).toBe(1);
                        unlisten();
                        done();
                    });

                    update({ count: 1 });
                }, []);

                return null;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        it("should return unlisten function", (done) => {
            const listener = jest.fn();
            const TestComponent = () => {
                const [, update, listen] = useStoreReducer(TestStore);

                useEffect(() => {
                    const unlisten = listen("count", listener);
                    expect(typeof unlisten).toBe("function");

                    update({ count: 1 });
                    unlisten();
                    update({ count: 2 }); // Should not trigger listener

                    expect(listener).toHaveBeenCalledTimes(1);
                    done();
                }, []);

                return null;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        it("should support multiple listeners for same key", (done) => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            const TestComponent = () => {
                const [, update, listen] = useStoreReducer(TestStore);

                useEffect(() => {
                    const unlisten1 = listen("count", listener1);
                    const unlisten2 = listen("count", listener2);

                    update({ count: 1 });

                    expect(listener1).toHaveBeenCalledWith(1);
                    expect(listener2).toHaveBeenCalledWith(1);
                    unlisten1();
                    unlisten2();
                    done();
                }, []);

                return null;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        it("should not call listener when value doesn't change", (done) => {
            const listener = jest.fn();
            const TestComponent = () => {
                const [store, update, listen] = useStoreReducer(TestStore);

                useEffect(() => {
                    listen("count", listener);

                    // Update to same value
                    update({ count: store.count });

                    expect(listener).not.toHaveBeenCalled();
                    done();
                }, []);

                return null;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        describe("enabled option", () => {
            it("should not call listener when enabled is never", (done) => {
                const listener = jest.fn();
                const TestComponent = () => {
                    const [, update, listen] = useStoreReducer(TestStore);

                    useEffect(() => {
                        listen("count", listener, { enabled: "never" });
                        update({ count: 1 });
                        expect(listener).not.toHaveBeenCalled();
                        done();
                    }, []);

                    return null;
                };

                render(
                    <TestStore.Provider>
                        <TestComponent />
                    </TestStore.Provider>,
                );
            });

            it("should call listener when enabled is always", (done) => {
                const listener = jest.fn();
                const TestComponent = () => {
                    const [, update, listen] = useStoreReducer(TestStore);

                    useEffect(() => {
                        const unlisten = listen("count", listener, { enabled: "always" });
                        update({ count: 1 });
                        expect(listener).toHaveBeenCalledWith(1);
                        expect(listener).toHaveBeenCalledTimes(1);
                        unlisten();
                        done();
                    }, []);

                    return null;
                };

                render(
                    <TestStore.Provider>
                        <TestComponent />
                    </TestStore.Provider>,
                );
            });

            it("should not call listener when enabled function returns false", (done) => {
                const listener = jest.fn();
                const TestComponent = () => {
                    const [, update, listen] = useStoreReducer(TestStore);

                    useEffect(() => {
                        listen("count", listener, { enabled: () => false });
                        update({ count: 1 });
                        expect(listener).not.toHaveBeenCalled();
                        done();
                    }, []);

                    return null;
                };

                render(
                    <TestStore.Provider>
                        <TestComponent />
                    </TestStore.Provider>,
                );
            });

            it("should call listener when enabled function returns true", (done) => {
                const listener = jest.fn();
                const TestComponent = () => {
                    const [, update, listen] = useStoreReducer(TestStore);

                    useEffect(() => {
                        const unlisten = listen("count", listener, { enabled: () => true });
                        update({ count: 1 });
                        expect(listener).toHaveBeenCalledWith(1);
                        expect(listener).toHaveBeenCalledTimes(1);
                        unlisten();
                        done();
                    }, []);

                    return null;
                };

                render(
                    <TestStore.Provider>
                        <TestComponent />
                    </TestStore.Provider>,
                );
            });

            it("should evaluate enabled function with current store state", (done) => {
                const listener = jest.fn();
                const TestComponent = () => {
                    const [, update, listen] = useStoreReducer(TestStore);

                    useEffect(() => {
                        listen("count", listener, {
                            enabled: (store) => store.count > 0,
                        });
                        update({ count: -1 });
                        update({ count: 1 });
                        update({ count: 2 });

                        expect(listener).toHaveBeenCalledTimes(2);
                        expect(listener).toHaveBeenNthCalledWith(1, 1);
                        expect(listener).toHaveBeenNthCalledWith(2, 2);
                        done();
                    }, []);

                    return null;
                };

                render(
                    <TestStore.Provider>
                        <TestComponent />
                    </TestStore.Provider>,
                );
            });

            it("should dynamically evaluate enabled function on each update", (done) => {
                const listener = jest.fn();
                const TestComponent = () => {
                    const [, update, listen] = useStoreReducer(TestStore);

                    useEffect(() => {
                        listen("count", listener, {
                            enabled: (store) => store.user.id === 2,
                        });
                        update({ count: 1 });
                        update({ count: 2, user: { id: 2, email: "john@example.com" } });

                        expect(listener).toHaveBeenCalledTimes(1);
                        expect(listener).toHaveBeenCalledWith(2);
                        done();
                    }, []);

                    return null;
                };

                render(
                    <TestStore.Provider>
                        <TestComponent />
                    </TestStore.Provider>,
                );
            });
        });
    });

    describe("unlisten function", () => {
        it("should remove listener via useStoreReducer unlisten function", (done) => {
            const listener = jest.fn();
            const TestComponent = () => {
                const [, update, listen, unlisten] = useStoreReducer(TestStore);

                useEffect(() => {
                    listen("count", listener);
                    update({ count: 1 });

                    expect(listener).toHaveBeenCalledTimes(1);
                    unlisten("count", listener);
                    update({ count: 2 });

                    expect(listener).toHaveBeenCalledTimes(1);
                    done();
                }, []);

                return null;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        it("should not error when unlistening non-existent listener", (done) => {
            const listener = jest.fn();
            const TestComponent = () => {
                const [, , , unlisten] = useStoreReducer(TestStore);

                useEffect(() => {
                    expect(() => unlisten("count", listener)).not.toThrow();
                    done();
                }, []);
                return null;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });
    });
});
