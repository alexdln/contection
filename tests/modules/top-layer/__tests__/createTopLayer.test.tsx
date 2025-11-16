import { createTopLayer } from "contection-top-layer";
import React from "react";

import { render, screen } from "@src/setup/test-utils";

describe("createTopLayer", () => {
    it("should create a top layer store with required properties", () => {
        const { TopLayerStore } = createTopLayer({});
        expect(TopLayerStore).toHaveProperty("Provider");
        expect(TopLayerStore).toHaveProperty("_initial");
        expect(TopLayerStore).toHaveProperty("_context");
        expect(TopLayerStore).toHaveProperty("$$typeof");
        expect(TopLayerStore).toHaveProperty("displayName");
    });

    it("should initialize with empty store", () => {
        const { TopLayerStore } = createTopLayer({});
        expect(Object.keys(TopLayerStore._initial)).toHaveLength(0);
    });

    it("should allow Provider to be used as component", () => {
        const { TopLayerStore } = createTopLayer({});
        const TestComponent = () => (
            <TopLayerStore.Provider>
                <div>Test</div>
            </TopLayerStore.Provider>
        );
        render(<TestComponent />);
        expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should allow store to be called as component (same as Provider)", () => {
        const { TopLayerStore } = createTopLayer({});
        const TestComponent = () => (
            <TopLayerStore>
                <div>Test</div>
            </TopLayerStore>
        );
        render(<TestComponent />);
        expect(screen.getByText("Test")).toBeInTheDocument();
    });
});

describe("createDialog", () => {
    it("should create a dialog with required properties", () => {
        const { Dialogs } = createTopLayer({
            dialogs: {
                MyDialog: {
                    data: { title: "Test Dialog" },
                    isolated: false,
                },
            },
        });

        const Dialog = Dialogs.MyDialog;
        expect(Dialog).toHaveProperty("Dialog");
        expect(Dialog).toHaveProperty("_instance");
        expect(Dialog).toHaveProperty("_context");
        expect(Dialog).toHaveProperty("_initial");
        expect(Dialog).toHaveProperty("_id");
        expect(Dialog).toHaveProperty("$$typeof");
        expect(Dialog.$$typeof).toBe(Symbol.for("contection.dialog"));
    });

    it("should register dialog in store", () => {
        const { TopLayerStore, Dialogs } = createTopLayer({
            dialogs: {
                MyDialog: {
                    data: { title: "Test" },
                    isolated: false,
                },
            },
        });

        const Dialog = Dialogs.MyDialog;
        const dialogStore = TopLayerStore._initial[Dialog._id];
        expect(dialogStore).toBeDefined();
        expect(dialogStore.type).toBe("dialog");
        if (dialogStore.type === "dialog") {
            expect(dialogStore.data).toEqual({ title: "Test" });
            expect(dialogStore.open).toBe(false);
            expect(dialogStore.isolated).toBe(false);
        }
    });

    it("should use custom checkIsActive function", () => {
        const checkIsActive = jest.fn((store) => store.open);
        const { TopLayerStore, Dialogs } = createTopLayer({
            dialogs: {
                MyDialog: {
                    data: { title: "Test" },
                    isolated: false,
                    checkIsActive,
                },
            },
        });

        const Dialog = Dialogs.MyDialog;
        const dialogStore = TopLayerStore._initial[Dialog._id];
        expect(dialogStore.checkIsActive).toBe(checkIsActive);
    });

    it("should render dialog component", () => {
        const { TopLayerStore, Dialogs } = createTopLayer({
            dialogs: {
                MyDialog: {
                    data: { title: "Test Dialog" },
                    isolated: false,
                },
            },
        });

        const Dialog = Dialogs.MyDialog;
        const TestComponent = () => (
            <TopLayerStore.Provider>
                <Dialog>
                    <div>Dialog Content</div>
                </Dialog>
            </TopLayerStore.Provider>
        );

        render(<TestComponent />);
        expect(screen.getByText("Dialog Content")).toBeInTheDocument();
    });
});

describe("createUpperLayer", () => {
    it("should create an upper layer with required properties", () => {
        const { UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test Layer" },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;
        expect(UpperLayer).toHaveProperty("UpperLayer");
        expect(UpperLayer).toHaveProperty("_instance");
        expect(UpperLayer).toHaveProperty("_context");
        expect(UpperLayer).toHaveProperty("_initial");
        expect(UpperLayer).toHaveProperty("_id");
        expect(UpperLayer).toHaveProperty("$$typeof");
        expect(UpperLayer.$$typeof).toBe(Symbol.for("contection.upperLayer"));
    });

    it("should register upper layer in store", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test" },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;
        expect(TopLayerStore._initial[UpperLayer._id]).toBeDefined();
        expect(TopLayerStore._initial[UpperLayer._id].type).toBe("upperLayer");
        expect(TopLayerStore._initial[UpperLayer._id].data).toEqual({ content: "Test" });
        expect(TopLayerStore._initial[UpperLayer._id].isolated).toBe(false);
    });

    it("should use custom checkIsActive function", () => {
        const checkIsActive = jest.fn((store) => Boolean(store.data));
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test" },
                    isolated: false,
                    checkIsActive,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;
        const upperLayerStore = TopLayerStore._initial[UpperLayer._id];
        expect(upperLayerStore.checkIsActive).toBe(checkIsActive);
    });

    it("should render upper layer component", () => {
        const { TopLayerStore, UpperLayers } = createTopLayer({
            upperLayers: {
                MyUpperLayer: {
                    data: { content: "Test Layer" },
                    isolated: false,
                },
            },
        });

        const UpperLayer = UpperLayers.MyUpperLayer;
        const TestComponent = () => (
            <TopLayerStore.Provider>
                <UpperLayer.UpperLayer>
                    <div>Upper Layer Content</div>
                </UpperLayer.UpperLayer>
            </TopLayerStore.Provider>
        );

        render(<TestComponent />);
        expect(screen.getByText("Upper Layer Content")).toBeInTheDocument();
    });
});
