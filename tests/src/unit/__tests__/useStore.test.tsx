import { useStore, useStoreReducer } from "contection";
import React from "react";

import { createTestStore, type TestStoreType } from "../../fixtures/test-store";
import { render, screen, act } from "../../setup/test-utils";

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
                return <span data-testid="count">{store.count}</span>;
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

        it("should pass prevStore and prevMutatedStore to mutation", () => {
            let renderCount = 0;
            const TestComponent = () => {
                // Explicitly set ResultType generic to ensure prevMutatedStore is correctly typed
                const result = useStore<TestStoreType, TestStoreType["user"] & { generatedContent: string }, ["user"]>(
                    TestStore,
                    {
                        keys: ["user"],
                        mutation: (newStore, prevStore, prevMutatedStore) => {
                            if (prevMutatedStore?.id === newStore.user.id) return prevMutatedStore;

                            return {
                                id: newStore.user.id,
                                email: newStore.user.email,
                                generatedContent: `Generated content for ${newStore.user.id}`,
                            };
                        },
                    },
                );
                renderCount++;
                return <div data-testid="result">{result.generatedContent}</div>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="inc" onClick={() => update((prev) => ({ count: prev.count + 1 }))}>
                            Inc
                        </button>
                        <button
                            data-testid="update-orig-user"
                            onClick={() => update({ user: { id: 1, email: "test@test.com" } })}
                        >
                            Update User
                        </button>
                        <button
                            data-testid="update-other-user"
                            onClick={() => update({ user: { id: 2, email: "test2@test.com" } })}
                        >
                            Update Other User
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

            // Initial render: prevStore and prevMutatedStore should be undefined
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("Generated content for 1");

            // First increment
            act(() => screen.getByTestId("inc").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("Generated content for 1");

            act(() => screen.getByTestId("update-orig-user").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("Generated content for 1");

            act(() => screen.getByTestId("update-other-user").click());
            expect(renderCount).toBe(2);
            expect(screen.getByTestId("result")).toHaveTextContent("Generated content for 2");
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

    describe("enabled option", () => {
        it("should not re-render when enabled is never", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore, { enabled: "never" });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");
        });

        it("should use initial data on first renders when enabled is never", () => {
            const TestStoreWithLifecycle = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: (store, dispatch) => {
                        dispatch({ count: 10 });
                    },
                },
            });
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStoreWithLifecycle, { enabled: "never" });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStoreWithLifecycle);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
            };

            render(
                <TestStoreWithLifecycle.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStoreWithLifecycle.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");
        });

        it("should use updated data on first renders when enabled is always and store is updated before mount", () => {
            const TestStoreWithLifecycle = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: (store, dispatch) => {
                        dispatch({ count: 10 });
                    },
                },
            });
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStoreWithLifecycle, { enabled: "always" });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStoreWithLifecycle);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
            };

            render(
                <TestStoreWithLifecycle.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStoreWithLifecycle.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("10");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(2);
            expect(screen.getByTestId("count")).toHaveTextContent("1");
        });

        it("should use initial data on first render and update after hydration when enabled is after-hydration", () => {
            const TestStoreWithLifecycle = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: (store, dispatch) => {
                        dispatch({ count: 10 });
                    },
                },
            });
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStoreWithLifecycle, { enabled: "after-hydration" });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStoreWithLifecycle);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
            };

            render(
                <TestStoreWithLifecycle.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStoreWithLifecycle.Provider>,
            );

            expect(renderCount).toBe(2);
            expect(screen.getByTestId("count")).toHaveTextContent("10");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(3);
            expect(screen.getByTestId("count")).toHaveTextContent("1");
        });

        it("should use initial data for mutation on first render and disabled state", () => {
            const TestStoreWithLifecycle = createTestStore(undefined, {
                lifecycleHooks: {
                    storeWillMount: (store, dispatch) => {
                        dispatch({ count: 10 });
                    },
                },
            });
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStoreWithLifecycle, {
                    keys: ["count"],
                    mutation: (store) => store.count + 2,
                    enabled: "never",
                });
                return <span data-testid="result">{store}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStoreWithLifecycle);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
            };

            render(
                <TestStoreWithLifecycle.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStoreWithLifecycle.Provider>,
            );

            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("2");
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("2");
        });

        it("should not re-render when enabled is never with keys option", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const data = useStore(TestStore, { keys: ["count", "name"], enabled: "never" });
                return (
                    <div>
                        <span data-testid="count">{data.count}</span>
                        <span data-testid="name">{data.name}</span>
                    </div>
                );
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-count" onClick={() => update({ count: 5 })}>
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
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            expect(screen.getByTestId("name")).toHaveTextContent("Test");

            act(() => screen.getByTestId("update-count").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");

            act(() => screen.getByTestId("update-name").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("name")).toHaveTextContent("Test");
        });

        it("should not re-render when enabled is never with mutation", () => {
            let renderCount = 0;
            let mutationCallCount = 0;
            const TestComponent = () => {
                renderCount++;
                const result = useStore(TestStore, {
                    keys: ["count"],
                    mutation: (store) => {
                        mutationCallCount++;
                        return store.count * 2;
                    },
                    enabled: "never",
                });
                return <span data-testid="result">{result}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-count" onClick={() => update({ count: 10 })}>
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

            const initialMutationCalls = mutationCallCount;
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("0");

            act(() => screen.getByTestId("update-count").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("result")).toHaveTextContent("0");
            expect(mutationCallCount).toBe(initialMutationCalls);

            act(() => screen.getByTestId("update-name").click());
            expect(renderCount).toBe(1);
            expect(mutationCallCount).toBe(initialMutationCalls);
        });

        it("should re-render when enabled is after-hydration", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore, { enabled: "after-hydration" });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
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
            expect(screen.getByTestId("count")).toHaveTextContent("1");
        });

        it("should re-render when enabled is undefined", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore);
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
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
            expect(screen.getByTestId("count")).toHaveTextContent("1");
        });

        it("should not re-render when enabled function returns false", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore, { enabled: () => false });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
            };

            render(
                <TestStore.Provider>
                    <TestComponent />
                    <UpdateComponent />
                </TestStore.Provider>,
            );

            expect(renderCount).toBe(1);
            act(() => screen.getByText("Update").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");
        });

        it("should re-render when enabled function returns true", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore, { enabled: () => true });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return <button onClick={() => update({ count: 1 })}>Update</button>;
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
            expect(screen.getByTestId("count")).toHaveTextContent("1");
        });

        it("should evaluate enabled function with current store state", () => {
            let renderCount = 0;
            const TestComponent = () => {
                renderCount++;
                const store = useStore(TestStore, {
                    keys: ["count"],
                    enabled: (store) => store.count > 10,
                });
                return <span data-testid="count">{store.count}</span>;
            };

            const UpdateComponent = () => {
                const [, update] = useStoreReducer(TestStore);
                return (
                    <>
                        <button data-testid="update-to-zero" onClick={() => update({ count: 0 })}>
                            Update to 0
                        </button>
                        <button data-testid="update-to-ten" onClick={() => update({ count: 10 })}>
                            Update to 10
                        </button>
                        <button data-testid="update-to-twenty" onClick={() => update({ count: 20 })}>
                            Update to 20
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
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByTestId("update-to-zero").click());
            expect(renderCount).toBe(1);
            act(() => screen.getByTestId("update-to-ten").click());
            expect(renderCount).toBe(1);
            expect(screen.getByTestId("count")).toHaveTextContent("0");
            act(() => screen.getByTestId("update-to-twenty").click());
            expect(renderCount).toBe(2);
            expect(screen.getByTestId("count")).toHaveTextContent("20");
        });
    });
});
