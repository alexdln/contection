import { createTopLayer, createDialog, createUpperLayer } from "contection-top-layer";
import React from "react";

import { render, screen } from "@src/setup/test-utils";

describe("createTopLayer", () => {
    it("should create a top layer store with required properties", () => {
        const TopLayer = createTopLayer();
        expect(TopLayer).toHaveProperty("Provider");
        expect(TopLayer).toHaveProperty("_initial");
        expect(TopLayer).toHaveProperty("_context");
        expect(TopLayer).toHaveProperty("$$typeof");
        expect(TopLayer).toHaveProperty("displayName");
    });

    it("should initialize with empty store", () => {
        const TopLayer = createTopLayer();
        expect(Object.keys(TopLayer._initial)).toHaveLength(0);
    });

    it("should allow Provider to be used as component", () => {
        const TopLayer = createTopLayer();
        const TestComponent = () => (
            <TopLayer.Provider>
                <div>Test</div>
            </TopLayer.Provider>
        );
        render(<TestComponent />);
        expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should allow store to be called as component (same as Provider)", () => {
        const TopLayer = createTopLayer();
        const TestComponent = () => (
            <TopLayer>
                <div>Test</div>
            </TopLayer>
        );
        render(<TestComponent />);
        expect(screen.getByText("Test")).toBeInTheDocument();
    });
});

describe("createDialog", () => {
    it("should create a dialog with required properties", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test Dialog" },
            isolated: false,
        });

        expect(Dialog).toHaveProperty("Dialog");
        expect(Dialog).toHaveProperty("_instance");
        expect(Dialog).toHaveProperty("_context");
        expect(Dialog).toHaveProperty("_initial");
        expect(Dialog).toHaveProperty("_index");
        expect(Dialog).toHaveProperty("$$typeof");
        expect(Dialog.$$typeof).toBe(Symbol.for("contection.dialog"));
    });

    it("should register dialog in store", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test" },
            isolated: false,
        });

        const dialogStore = TopLayer._initial[Dialog._index];
        expect(dialogStore).toBeDefined();
        expect(dialogStore.type).toBe("dialog");
        if (dialogStore.type === "dialog") {
            expect(dialogStore.data).toEqual({ title: "Test" });
            expect(dialogStore.open).toBe(false);
            expect(dialogStore.isolated).toBe(false);
        }
    });

    it("should use custom checkIsActive function", () => {
        const TopLayer = createTopLayer();
        const checkIsActive = jest.fn((store) => store.open);
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test" },
            isolated: false,
            checkIsActive,
        });

        const dialogStore = TopLayer._initial[Dialog._index];
        expect(dialogStore.checkIsActive).toBe(checkIsActive);
    });

    it("should render dialog component", () => {
        const TopLayer = createTopLayer();
        const Dialog = createDialog({
            instance: TopLayer,
            data: { title: "Test Dialog" },
            isolated: false,
        });

        const TestComponent = () => (
            <TopLayer.Provider>
                <Dialog>
                    <div>Dialog Content</div>
                </Dialog>
            </TopLayer.Provider>
        );

        render(<TestComponent />);
        expect(screen.getByText("Dialog Content")).toBeInTheDocument();
    });
});

describe("createUpperLayer", () => {
    it("should create an upper layer with required properties", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test Layer" },
            isolated: false,
        });

        expect(UpperLayer).toHaveProperty("UpperLayer");
        expect(UpperLayer).toHaveProperty("_instance");
        expect(UpperLayer).toHaveProperty("_context");
        expect(UpperLayer).toHaveProperty("_initial");
        expect(UpperLayer).toHaveProperty("_index");
        expect(UpperLayer).toHaveProperty("$$typeof");
        expect(UpperLayer.$$typeof).toBe(Symbol.for("contection.upperLayer"));
    });

    it("should register upper layer in store", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test" },
            isolated: false,
        });

        expect(TopLayer._initial[UpperLayer._index]).toBeDefined();
        expect(TopLayer._initial[UpperLayer._index].type).toBe("upperLayer");
        expect(TopLayer._initial[UpperLayer._index].data).toEqual({ content: "Test" });
        expect(TopLayer._initial[UpperLayer._index].isolated).toBe(false);
    });

    it("should use custom checkIsActive function", () => {
        const TopLayer = createTopLayer();
        const checkIsActive = jest.fn((store) => Boolean(store.data));
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test" },
            isolated: false,
            checkIsActive,
        });

        const upperLayerStore = TopLayer._initial[UpperLayer._index];
        expect(upperLayerStore.checkIsActive).toBe(checkIsActive);
    });

    it("should render upper layer component", () => {
        const TopLayer = createTopLayer();
        const UpperLayer = createUpperLayer({
            instance: TopLayer,
            data: { content: "Test Layer" },
            isolated: false,
        });

        const TestComponent = () => (
            <TopLayer.Provider>
                <UpperLayer.UpperLayer>
                    <div>Upper Layer Content</div>
                </UpperLayer.UpperLayer>
            </TopLayer.Provider>
        );

        render(<TestComponent />);
        expect(screen.getByText("Upper Layer Content")).toBeInTheDocument();
    });
});
