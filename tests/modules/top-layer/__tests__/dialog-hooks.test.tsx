import { createTopLayer, createDialog } from "contection-top-layer";
import { useDialogStatus, useDialogReducer } from "contection-top-layer/src/dialogs/hooks";
import React from "react";

import { render, screen, act } from "@src/setup/test-utils";

describe("useDialogStatus", () => {
    it("should return dialog status with data and open state", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test Dialog" },
            isolated: false,
        });

        const TestComponent = () => {
            const [status] = useDialogStatus(Dialog);
            return (
                <div>
                    <span data-testid="open">{String(status.open)}</span>
                    <span data-testid="title">{String(status.data?.title)}</span>
                </div>
            );
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("open")).toHaveTextContent("false");
        expect(screen.getByTestId("title")).toHaveTextContent("Test Dialog");
    });

    it("should return undefined when index is not provided", () => {
        const TopLayer = createTopLayer();

        const TestComponent = () => {
            const [status] = useDialogStatus(TopLayer);
            return (
                <div>
                    <span data-testid="open">{String(status.open)}</span>
                    <span data-testid="data">{String(status.data)}</span>
                </div>
            );
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("open")).toHaveTextContent("false");
        expect(screen.getByTestId("data")).toHaveTextContent("undefined");
    });

    it("should support enabled option", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test" },
            isolated: false,
        });

        const TestComponent = () => {
            const [status] = useDialogStatus(Dialog, { enabled: "always" });
            return <span data-testid="title">{String(status.data?.title)}</span>;
        };

        render(
            <TopLayer.Provider>
                <TestComponent />
            </TopLayer.Provider>,
        );

        expect(screen.getByTestId("title")).toHaveTextContent("Test");
    });
});

describe("useDialogReducer", () => {
    it("should return dialog state and update function", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test Dialog", count: 0 },
            isolated: false,
        });

        const TestComponent = () => {
            const [dialog, update] = useDialogReducer(Dialog);

            return (
                <div>
                    <span data-testid="open">
                        <Dialog.Consumer>{({ open }) => String(open)}</Dialog.Consumer>
                    </span>
                    <span data-testid="title">
                        <Dialog.Consumer>
                            {({ data }) => String((data as { title: string })?.title || "")}
                        </Dialog.Consumer>
                    </span>
                    <button data-testid="open-dialog" onClick={() => update({ open: true, data: dialog.data })}>
                        Open
                    </button>
                    <button
                        data-testid="update-data"
                        onClick={() => update({ open: dialog.open, data: { title: "Updated", count: 1 } })}
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

        expect(screen.getByTestId("open")).toHaveTextContent("false");
        expect(screen.getByTestId("title")).toHaveTextContent("Test Dialog");

        act(() => {
            screen.getByTestId("open-dialog").click();
        });

        expect(screen.getByTestId("open")).toHaveTextContent("true");

        act(() => {
            screen.getByTestId("update-data").click();
        });

        expect(screen.getByTestId("title")).toHaveTextContent("Updated");
    });

    it("should support function-based data updates", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { count: 0 },
            isolated: false,
        });

        const TestComponent = () => {
            const [dialog, update] = useDialogReducer(Dialog);

            return (
                <div>
                    <span data-testid="count">
                        <Dialog.Consumer>{({ data }) => String(data.count || 0)}</Dialog.Consumer>
                    </span>
                    <button
                        data-testid="increment"
                        onClick={() =>
                            update((prev) => ({
                                open: dialog.open,
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
            const [dialog, update] = useDialogReducer(TopLayer);
            return (
                <div>
                    <span data-testid="open">{String(dialog.open)}</span>
                    <span data-testid="data">{String(dialog.data)}</span>
                    <button data-testid="update" onClick={() => update({ open: true, data: {} })}>
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

        expect(screen.getByTestId("open")).toHaveTextContent("false");
        expect(screen.getByTestId("data")).toHaveTextContent("undefined");

        act(() => {
            screen.getByTestId("update").click();
        });

        // Update should not work when index is not provided
        expect(screen.getByTestId("open")).toHaveTextContent("false");
    });
});
