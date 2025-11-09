import { useStore, useStoreReducer } from "contection";
import React from "react";

import { render, screen, act } from "../../setup/test-utils";
import { createTestStore } from "../../fixtures/test-store";

describe("useStore", () => {
    let TestStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        TestStore = createTestStore();
    });

    describe("full store subscription", () => {
        it("should return entire store when no options provided", () => {
            const TestComponent = () => {
                const store = useStore(TestStore);
                return (
                    <div>
                        <span data-testid="count">{store.count}</span>
                        <span data-testid="name">{store.name}</span>
                        <span data-testid="theme">{store.theme}</span>
                    </div>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("name")).toHaveTextContent("Test");
            expect(screen.getByTestId("theme")).toHaveTextContent("light");
        });

        it("should re-render when any key changes", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore);
                return (
                    <div>
                        <span data-testid="count">{store.count}</span>
                        <span data-testid="render-count">{renderCount}</span>
                    </div>
                );
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ theme: "dark" })}>Update</button>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(2);
        });
    });

    describe("selective subscription with keys", () => {
        it("should return only specified keys", () => {
            const TestComponent = () => {
                const data = useStore(TestStore, { keys: ["count", "name"] });
                return (
                    <div>
                        <span data-testid="count">{data.count}</span>
                        <span data-testid="name">{data.name}</span>
                        {/* @ts-expect-error - theme is not in the keys */}
                        <span data-testid="theme">{data.theme}</span>
                    </div>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("name")).toHaveTextContent("Test");
            expect(screen.getByTestId("theme")).toHaveTextContent("");
        });

        it("should re-render only when subscribed keys change", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const data = useStore(TestStore, { keys: ["count"] });
                return (
                    <div>
                        <span data-testid="count">{data.count}</span>
                    </div>
                );
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-count" onClick={() => update({ count: 1 })}>
                            Update Count
                        </button>
                        <button data-testid="update-name" onClick={() => update({ name: "New Name" })}>
                            Update Name
                        </button>
                    </>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            act(() => screen.getByTestId("update-count").click());
            expect(renderCount).toBe(2);

            act(() => screen.getByTestId("update-name").click());
            expect(renderCount).toBe(2);
        });

        it("should support multiple keys subscription", () => {
            const TestComponent = () => {
                const data = useStore(TestStore, { keys: ["count", "theme"] });
                return (
                    <div>
                        <span data-testid="count">{data.count}</span>
                        <span data-testid="theme">{data.theme}</span>
                    </div>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("theme")).toHaveTextContent("light");
        });
    });

    describe("mutation function", () => {
        it("should compute derived value", () => {
            const TestComponent = () => {
                const mutatedCount = useStore(TestStore, {
                    keys: ["count"],
                    mutation: (store) => store.count + 23,
                });
                return <span data-testid="result">{mutatedCount}</span>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("23");
        });

        it("should re-render only when mutation result changes", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const mutatedCount = useStore(TestStore, {
                    keys: ["count"],
                    mutation: (store) => store.count + 23,
                });
                return (
                    <div>
                        <span data-testid="result">{mutatedCount}</span>
                    </div>
                );
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button
                            data-testid="update-count"
                            onClick={() => update((prev) => ({ count: prev.count + 1 }))}
                        >
                            Update Count
                        </button>
                        <button data-testid="update-name" onClick={() => update({ name: "New" })}>
                            Update Name
                        </button>
                    </>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("23");
            act(() => screen.getByTestId("update-count").click());
            expect(renderCount).toBe(2);
            expect(screen.getByTestId("result")).toHaveTextContent("24");
            act(() => screen.getByTestId("update-name").click());
            expect(renderCount).toBe(2);
        });

        it("should memoize mutation result when store values don't change", () => {
            let mutationCallCount = 0;
            const TestComponent = () => {
                const result = useStore(TestStore, {
                    keys: ["count"],
                    mutation: (store) => {
                        mutationCallCount++;
                        return store.count * 2;
                    },
                });
                return <div data-testid="result">{result}</div>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-count-same" onClick={() => update({ count: 0 })}>
                            Update Same
                        </button>
                        <button data-testid="update-name" onClick={() => update({ name: "New" })}>
                            Update Name
                        </button>
                    </>
                );
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            const initialCallCount = mutationCallCount;

            act(() => screen.getByTestId("update-count-same").click());
            act(() => screen.getByTestId("update-name").click());

            expect(mutationCallCount).toBe(initialCallCount);
        });
    });

    describe("edge cases", () => {
        it("should handle empty keys array", () => {
            const TestComponent = () => {
                const data = useStore(TestStore, { keys: [] });
                return <div>{JSON.stringify(data)}</div>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );
        });

        it("should handle mutation returning undefined", () => {
            const TestComponent = () => {
                const result = useStore(TestStore, {
                    keys: ["count"],
                    mutation: () => undefined,
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("undefined");
        });

        it("should handle mutation returning null", () => {
            const TestComponent = () => {
                const result = useStore(TestStore, {
                    keys: ["count"],
                    mutation: () => null,
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("null");
        });
    });
});
