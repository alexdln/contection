import { useStoreReducer } from "contection";
import React from "react";

import { render, screen, act } from "../../setup/test-utils";
import { createTestStore } from "../../fixtures/test-store";

describe("GlobalStoreConsumer", () => {
    let TestStore: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        TestStore = createTestStore();
    });

    describe("render props pattern", () => {
        it("should render children with store data", () => {
            render(
                <TestStore.Provider>
                    <TestStore.Consumer>{(store) => <div data-testid="count">{store.count}</div>}</TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
        });

        it("should re-render when store changes", async () => {
            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ count: 5 })}>Update</button>;
            };

            render(
                <TestStore.Provider>
                    <TestStore.Consumer>{(store) => <div data-testid="count">{store.count}</div>}</TestStore.Consumer>
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Update").click());
            expect(screen.getByTestId("count")).toHaveTextContent("5");
        });
    });

    describe("options - keys only", () => {
        it("should return subset of store with keys", () => {
            render(
                <TestStore.Provider>
                    <TestStore.Consumer options={{ keys: ["count", "name"] }}>
                        {(data) => (
                            <div>
                                <span data-testid="count">{data.count}</span>
                                <span data-testid="name">{data.name}</span>
                                {/* @ts-expect-error - should not have theme */}
                                <span data-testid="theme">{data.theme}</span>
                            </div>
                        )}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("name")).toHaveTextContent("Test");
            expect(screen.queryByTestId("theme")).toHaveTextContent("");
        });

        it("should re-render only when specified keys change", () => {
            let renderCount = 0;
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
                    <TestStore.Consumer options={{ keys: ["count"] }}>
                        {(data) => {
                            renderCount++;
                            return (
                                <div>
                                    <span data-testid="count">{data.count}</span>
                                    <span data-testid="render-count">{renderCount}</span>
                                </div>
                            );
                        }}
                    </TestStore.Consumer>
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            const initialRenderCount = parseInt(screen.getByTestId("render-count").textContent || "0");

            // Update listened key
            act(() => screen.getByTestId("update-count").click());
            expect(parseInt(screen.getByTestId("render-count").textContent || "0")).toBeGreaterThan(initialRenderCount);

            // Update non-listened key
            const beforeNameUpdate = parseInt(screen.getByTestId("render-count").textContent || "0");
            act(() => screen.getByTestId("update-name").click());
            expect(parseInt(screen.getByTestId("render-count").textContent || "0")).toBe(beforeNameUpdate);
        });
    });

    describe("options - mutation only", () => {
        it("should return mutation result", () => {
            render(
                <TestStore.Provider>
                    <TestStore.Consumer
                        options={{
                            mutation: (store) => store.count + 23,
                        }}
                    >
                        {(result) => <div data-testid="result">{result}</div>}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("23");
        });

        it("should re-render only when mutation result changes", () => {
            let renderCount = 0;
            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update((prev) => ({ count: prev.count + 1 }))}>Update</button>;
            };

            render(
                <TestStore.Provider>
                    <TestStore.Consumer
                        options={{
                            mutation: (store) => (store.count === 2 ? "two" : "not two"),
                        }}
                    >
                        {(result) => {
                            renderCount++;
                            return <div data-testid="result">{result}</div>;
                        }}
                    </TestStore.Consumer>
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("not two");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("not two");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(2);
            expect(screen.getByTestId("result")).toHaveTextContent("two");
        });
    });

    describe("options - keys + mutation", () => {
        it("should return mutation result of selected keys", () => {
            render(
                <TestStore.Provider>
                    <TestStore.Consumer
                        options={{
                            keys: ["count"],
                            mutation: (store) => store.count + 23,
                        }}
                    >
                        {(result) => <div data-testid="result">{result}</div>}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("23");
        });

        it("should re-render only when selected keys change", () => {
            let renderCount = 0;
            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-count" onClick={() => update({ count: 2 })}>
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
                    <TestStore.Consumer
                        options={{
                            keys: ["count"],
                            mutation: (store) => store.count * 2,
                        }}
                    >
                        {(doubled) => {
                            renderCount++;
                            return (
                                <div>
                                    <span data-testid="doubled">{doubled}</span>
                                    <span data-testid="render-count">{renderCount}</span>
                                </div>
                            );
                        }}
                    </TestStore.Consumer>
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("doubled")).toHaveTextContent("0");
            act(() => screen.getByTestId("update-name").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("doubled")).toHaveTextContent("0");
            act(() => screen.getByTestId("update-count").click());
            expect(renderCount).toBe(2);
            expect(screen.getByTestId("doubled")).toHaveTextContent("4");
        });
    });

    describe("options - no options", () => {
        it("should return full store", () => {
            render(
                <TestStore.Provider>
                    <TestStore.Consumer>
                        {(store) => (
                            <div>
                                <span data-testid="count">{store.count}</span>
                                <span data-testid="name">{store.name}</span>
                                <span data-testid="theme">{store.theme}</span>
                            </div>
                        )}
                    </TestStore.Consumer>
                </TestStore.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("name")).toHaveTextContent("Test");
            expect(screen.getByTestId("theme")).toHaveTextContent("light");
        });

        it("should re-render when any key changes", () => {
            let renderCount = 0;
            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-count" onClick={() => update({ count: 1 })}>
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
                    <TestStore.Consumer>
                        {(store) => {
                            renderCount++;
                            return (
                                <div>
                                    <span data-testid="count">{store.count}</span>
                                    <span data-testid="render-count">{renderCount}</span>
                                </div>
                            );
                        }}
                    </TestStore.Consumer>
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");

            act(() => screen.getByTestId("update-count").click());
            expect(renderCount).toBe(2);

            act(() => screen.getByTestId("update-name").click());
            expect(renderCount).toBe(3);
        });
    });
});
