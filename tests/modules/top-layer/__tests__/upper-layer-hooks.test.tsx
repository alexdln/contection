import { createTopLayer, createUpperLayer } from "contection-top-layer";
import { useUpperLayerStatus, useUpperLayerReducer } from "contection-top-layer/src/upper-layers/hooks";
import React from "react";

import { render, screen, act } from "@src/setup/test-utils";

describe("useUpperLayerStatus", () => {
    it("should return upper layer status with data", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test Layer" },
            isolated: false,
        });

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(UpperLayer);
            return <span data-testid="content">{String(status.data?.content)}</span>;
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test Layer");
    });

    it("should return undefined when index is not provided", () => {
        const TopLayer = createTopLayer();

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(TopLayer);
            return <span data-testid="data">{String(status.data)}</span>;
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("data")).toHaveTextContent("undefined");
    });

    it("should support enabled option", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test" },
            isolated: false,
        });

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(UpperLayer, {
                enabled: "always",
            });
            return <span data-testid="content">{String(status.data?.content)}</span>;
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test");
    });

    it("should support function-based enabled option", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test" },
            isolated: false,
        });

        const TestComponent = () => {
            const [status] = useUpperLayerStatus(UpperLayer, {
                enabled: (store) => Boolean(store.data),
            });
            return <span data-testid="content">{String(status.data?.content)}</span>;
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("content")).toHaveTextContent("Test");
    });
});

describe("useUpperLayerReducer", () => {
    it("should return upper layer state and update function", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test Layer", count: 0 },
            isolated: false,
        });

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
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
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
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { count: 0 },
            isolated: false,
        });

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
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("count")).toHaveTextContent("0");

        act(() => {
            screen.getByTestId("increment").click();
        });

        expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    it("should return empty state when index is not provided", () => {
        const TopLayer = createTopLayer();

        const TestComponent = () => {
            const [upperLayer, update] = useUpperLayerReducer(TopLayer);
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
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("data")).toHaveTextContent("undefined");

        act(() => {
            screen.getByTestId("update").click();
        });

        // Update should not work when index is not provided
        expect(screen.getByTestId("data")).toHaveTextContent("undefined");
    });
});
