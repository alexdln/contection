/**
 * Type tests for contection-top-layer
 * These tests verify TypeScript type safety and inference for top-layer functionality.
 * Run with: pnpm test:types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { type Dialog, type UpperLayer } from "contection-top-layer/src/types";
import { createTopLayer, createDialog, createUpperLayer } from "contection-top-layer";
import { useTopLayer, useTopLayerImperative } from "contection-top-layer/src/hooks";
import { useDialogStatus, useDialogReducer } from "contection-top-layer/src/dialogs/hooks";
import { useUpperLayerStatus, useUpperLayerReducer } from "contection-top-layer/src/upper-layers/hooks";

// Test 1: createTopLayer basic structure
function testCreateTopLayer() {
    const TopLayer = createTopLayer();
    const initial = TopLayer._initial;
    const context = TopLayer._context;
    const Provider = TopLayer.Provider;
    const $$typeof = TopLayer.$$typeof;
    const displayName = TopLayer.displayName;

    <TopLayer.Provider>
        <div>Test</div>
    </TopLayer.Provider>;

    <TopLayer>
        <div>Test</div>
    </TopLayer>;
}

// Test 2: createDialog with typed data
function testCreateDialog() {
    const TopLayer = createTopLayer();

    const Dialog1 = createDialog({
        instance: TopLayer,
        data: { title: "Test", count: 0 },
        isolated: false,
    });

    const dialogIndex: string = Dialog1._index;
    const dialogInitial: { title: string; count: number } = Dialog1._initial;
    const dialogInstance = Dialog1._instance;
    const dialogContext = Dialog1._context;
    const dialogSymbol = Dialog1.$$typeof;

    <Dialog1>
        <div>Dialog Content</div>
    </Dialog1>;

    <Dialog1.Dialog>
        <div>Dialog Content</div>
    </Dialog1.Dialog>;

    <Dialog1.Consumer>
        {({ open, data }) => {
            const isOpen: boolean = open;
            const title: string = data.title;
            const count: number = data.count;
            // @ts-expect-error - should not have other property
            const other = data.other;
            return <div>{title}</div>;
        }}
    </Dialog1.Consumer>;
}

// Test 3: createDialog with custom checkIsActive
function testCreateDialogWithCheckIsActive() {
    const TopLayer = createTopLayer();

    const Dialog = createDialog({
        instance: TopLayer,
        data: { visible: false },
        isolated: true,
        checkIsActive: (store) => store.open && store.data.visible,
    });

    const checkIsActive: (store: {
        data: { visible: boolean };
        isolated: boolean;
        open: boolean;
        node: HTMLDialogElement | null;
    }) => boolean = TopLayer._initial[Dialog._index].checkIsActive;
    checkIsActive({ data: { visible: true }, isolated: true, open: true, node: null });
}

// Test 4: createUpperLayer with typed data
function testCreateUpperLayer() {
    const TopLayer = createTopLayer();

    const UpperLayer1 = createUpperLayer({
        instance: TopLayer,
        data: { content: "Test", active: true },
        isolated: false,
    });

    const upperLayerIndex: string = UpperLayer1._index;
    const upperLayerInitial: { content: string; active: boolean } = UpperLayer1._initial;
    const upperLayerInstance = UpperLayer1._instance;
    const upperLayerContext = UpperLayer1._context;
    const upperLayerSymbol = UpperLayer1.$$typeof;

    <UpperLayer1.UpperLayer index={UpperLayer1._index}>
        <div>Upper Layer Content</div>
    </UpperLayer1.UpperLayer>;

    <UpperLayer1.Consumer>
        {({ data }) => {
            const content: string = data?.content || "";
            const active: boolean = data?.active || false;
            return <div>{content}</div>;
        }}
    </UpperLayer1.Consumer>;
}

// Test 5: createUpperLayer with optional data
function testCreateUpperLayerWithOptionalData() {
    const TopLayer = createTopLayer();

    const UpperLayer = createUpperLayer({
        instance: TopLayer,
        data: undefined,
        isolated: true,
    });

    const data: undefined = UpperLayer._initial;
}

// Test 6: useTopLayer
function testUseTopLayer() {
    const TopLayer = createTopLayer();
    createDialog({
        instance: TopLayer,
        data: { title: "Test" },
        isolated: false,
    });
    createUpperLayer({
        instance: TopLayer,
        data: { content: "Test" },
        isolated: false,
    });

    function Component() {
        const store = useTopLayer(TopLayer);
        const dialogs: Dialog[] = store.dialogs;
        const upperLayers: UpperLayer[] = store.upperLayers;
        const hasActiveIsolatedLayers: boolean = store.hasActiveIsolatedLayers;
        const hasActiveLayers: boolean = store.hasActiveLayers;

        const partial = useTopLayer(TopLayer, { keys: ["dialogs", "hasActiveLayers"] });
        const partialDialogs: Dialog[] = partial.dialogs;
        const partialHasActive: boolean = partial.hasActiveLayers;
        // @ts-expect-error - should not have unselected keys
        const partialUpperLayers = partial.upperLayers;
    }
}

// Test 7: useTopLayerImperative
function testUseTopLayerImperative() {
    const TopLayer = createTopLayer();
    createDialog({
        instance: TopLayer,
        data: { title: "Test" },
        isolated: false,
    });

    function Component() {
        const store = useTopLayerImperative(TopLayer);
        const dialogs: Dialog[] = store.dialogs;
        const upperLayers: UpperLayer[] = store.upperLayers;
        const hasActiveIsolatedLayers: boolean = store.hasActiveIsolatedLayers;
        const hasActiveLayers: boolean = store.hasActiveLayers;
        // @ts-expect-error - should not have other property
        const other = store.other;
    }
}

// Test 8: useDialogStatus
function testUseDialogStatus() {
    const TopLayer = createTopLayer();
    const Dialog = createDialog({
        instance: TopLayer,
        data: { title: "Test", count: 0 },
        isolated: false,
    });

    function Component() {
        const [status] = useDialogStatus(Dialog);
        const open: boolean = status.open;
        const title: string = status.data.title;
        const count: number = status.data.count;

        const [statusWithEnabled] = useDialogStatus(Dialog, { enabled: "always" });
        const open2: boolean = statusWithEnabled.open;

        const [statusWithFunction] = useDialogStatus(Dialog, {
            enabled: (store) => store.open,
        });
        const open3: boolean = statusWithFunction.open;
    }
}

// Test 9: useDialogReducer
function testUseDialogReducer() {
    const TopLayer = createTopLayer();
    const Dialog = createDialog({
        instance: TopLayer,
        data: { title: "Test", count: 0 },
        isolated: false,
    });

    function Component() {
        const [dialog, update] = useDialogReducer(Dialog);
        const open: boolean = dialog.open;
        const title: string = dialog.data.title;
        const count: number = dialog.data.count;

        update({ open: true, data: { title: "Updated", count: 1 } });
        update((prev) => ({ open: false, data: { ...prev.data, count: prev.data.count + 1 } }));

        // @ts-expect-error - should require both open and data
        update({ open: true });
        // @ts-expect-error - should require both open and data
        update({ data: { title: "Test" } });
    }
}

// Test 10: useUpperLayerStatus
function testUseUpperLayerStatus() {
    const TopLayer = createTopLayer();
    const UpperLayer = createUpperLayer({
        instance: TopLayer,
        data: { content: "Test", active: true },
        isolated: false,
    });

    function Component() {
        const [status] = useUpperLayerStatus(UpperLayer);
        const content: string | undefined = status.data?.content;
        const active: boolean | undefined = status.data?.active;

        const [statusWithEnabled] = useUpperLayerStatus(UpperLayer, { enabled: "always" });
        const content2: string | undefined = statusWithEnabled.data?.content;

        const [statusWithFunction] = useUpperLayerStatus(UpperLayer, {
            enabled: (store) => Boolean(store.data),
        });
        const content3: string | undefined = statusWithFunction.data?.content;
    }
}

// Test 11: useUpperLayerReducer
function testUseUpperLayerReducer() {
    const TopLayer = createTopLayer();
    const UpperLayer = createUpperLayer({
        instance: TopLayer,
        data: { content: "Test", count: 0 },
        isolated: false,
    });

    function Component() {
        const [upperLayer, update] = useUpperLayerReducer(UpperLayer);
        const content: string | undefined = upperLayer.data?.content;
        const count: number | undefined = upperLayer.data?.count;

        update({ data: { content: "Updated", count: 1 } });
        update((prev) => ({ data: { ...prev.data, count: (prev.data?.count || 0) + 1 } }));

        // @ts-expect-error - should require data property
        update({});
    }
}

// Test 12: Type inference with const data
function testTypeInferenceWithConst() {
    const TopLayer = createTopLayer();

    const dialogData = {
        title: "Test",
        count: 0,
    } as const;

    const Dialog = createDialog({
        instance: TopLayer,
        data: dialogData,
        isolated: false,
    });

    const title: "Test" = Dialog._initial.title;
    const count: 0 = Dialog._initial.count;
}

// Test 13: Multiple dialogs and upper layers
function testMultipleLayers() {
    const TopLayer = createTopLayer();

    const Dialog1 = createDialog({
        instance: TopLayer,
        data: { title: "Dialog 1" },
        isolated: false,
    });

    const Dialog2 = createDialog({
        instance: TopLayer,
        data: { title: "Dialog 2" },
        isolated: true,
    });

    const UpperLayer1 = createUpperLayer({
        instance: TopLayer,
        data: { content: "Layer 1" },
        isolated: false,
    });

    const store = useTopLayer(TopLayer);
    const dialogsCount: number = store.dialogs.length;
    const upperLayersCount: number = store.upperLayers.length;
}

// Test 14: Store instance structure
function testStoreInstanceStructure() {
    const TopLayer = createTopLayer();
    const Dialog = createDialog({
        instance: TopLayer,
        data: { test: "value" },
        isolated: false,
    });

    const dialogStore = TopLayer._initial[Dialog._index];
    if (dialogStore.type === "dialog") {
        const open: boolean = dialogStore.open;
        const data: unknown = dialogStore.data;
        const isolated: boolean = dialogStore.isolated;
        const node: HTMLDialogElement | null = dialogStore.node;
    }
}

// Test 15: NonFunction type constraint
function testNonFunctionConstraint() {
    const TopLayer = createTopLayer();

    const Dialog = createDialog({
        instance: TopLayer,
        data: { value: 42 },
        isolated: false,
    });

    const [dialog, update] = useDialogReducer(Dialog);
    update((prev) => ({ open: prev.open, data: { value: prev.data.value + 1 } }));

    const UpperLayer = createUpperLayer({
        instance: TopLayer,
        data: { value: 42 },
        isolated: false,
    });

    const [upperLayer, updateUpper] = useUpperLayerReducer(UpperLayer);
    updateUpper((prev) => ({ data: { value: (prev.data?.value || 0) + 1 } }));
    // @ts-expect-error - should not have other property
    updateUpper((prev) => ({ data: { other: "something" } }));
}

export {};
