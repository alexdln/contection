import { createTopLayer } from "contection-top-layer";
import { useUpperLayerStatus, useUpperLayerReducer } from "contection-top-layer/src/upper-layers/hooks";
import React from "react";

import { render, screen, act } from "@src/setup/test-utils";

describe("useUpperLayerStatus", () => {
    it("should return upper layer status with data", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test Layer" },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(UpperLayer);
            return <span data-testid="content">{String(status.data?.content)}</span>;
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test Layer");
    });

    it("should return undefined when index is not provided", () => {
        const { TopLayerStore } = createTopLayer({});

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(TopLayerStore);
            return <span data-testid="data">{String(status.data)}</span>;
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("data")).toHaveTextContent("undefined");
    });

    it("should support enabled option", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test" },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(UpperLayer, {
                enabled: "always",
            });
            return <span data-testid="content">{String(status.data?.content)}</span>;
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test");
    });

    it("should support function-based enabled option", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test" },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(UpperLayer, {
                enabled: (store) => Boolean(store.data),
            });
            return <span data-testid="content">{String(status.data?.content)}</span>;
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test");
    });
});

describe("useUpperLayerReducer", () => {
    it("should return upper layer state and update function", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test Layer", count: 0 },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;

        const TestComponent = () => {
            const [, update] = useUpperLayerReducer(UpperLayer);

            return (
                <div>
                    <span data-testid="content">
                        <UpperLayer.Consumer>
                            {({ data }) => String((data as { content: string })?.content || "")}
                        </UpperLayer.Consumer>
                    </span>
                    <span data-testid="count">
                        <UpperLayer.Consumer>
                            {({ data }) => String((data as { count: number })?.count || 0)}
                        </UpperLayer.Consumer>
                    </span>
                    <button
                        data-testid="update-data"
                        onClick={() => update({ data: { content: "Updated", count: 1 } })}
                    >
                        Update
                    </button>
                </div>
            );
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test Layer");
        expect(screen.getByTestId("count")).toHaveTextContent("0");

        act(() => {
            screen.getByTestId("update-data").click();
        });

        expect(screen.getByTestId("content")).toHaveTextContent("Updated");
        expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    it("should support function-based data updates", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { count: 0 },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;

        const TestComponent = () => {
            const [, update] = useUpperLayerReducer(UpperLayer);

            return (
                <div>
                    <span data-testid="count">
                        <UpperLayer.Consumer>{({ data }) => String(data.count || 0)}</UpperLayer.Consumer>
                    </span>
                    <button
                        data-testid="increment"
                        onClick={() =>
                            update((prev) => ({
                                data: { count: prev.data.count + 1 },
                            }))
                        }
                    >
                        Increment
                    </button>
                </div>
            );
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("count")).toHaveTextContent("0");

        act(() => {
            screen.getByTestId("increment").click();
        });

        expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    it("should return empty state when index is not provided", () => {
        const { TopLayerStore } = createTopLayer({});

        const TestComponent = () => {
            const [upperLayer, update] = useUpperLayerReducer(TopLayerStore);
            return (
                <div>
                    <span data-testid="data">{String(upperLayer.data)}</span>
                    <button data-testid="update" onClick={() => update({ data: { content: "Test" } })}>
                        Update
                    </button>
                </div>
            );
        };

        render(
            <TopLayerStore.Provider>
                <TestComponent />
            </TopLayerStore.Provider>,
        );

        expect(screen.getByTestId("data")).toHaveTextContent("undefined");

        act(() => {
            screen.getByTestId("update").click();
        });

        // Update should not work when index is not provided
        expect(screen.getByTestId("data")).toHaveTextContent("undefined");
    });
});
