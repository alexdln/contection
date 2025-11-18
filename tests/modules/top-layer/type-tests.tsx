/**
 * Type tests for contection-top-layer
 * These tests verify TypeScript type safety and inference for top-layer functionality.
 * Run with: pnpm test:types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { type Dialog, type UpperLayer } from "contection-top-layer/src/types";
import { createTopLayer } from "contection-top-layer";
import { useTopLayerStore, useTopLayerImperative } from "contection-top-layer/src/hooks";
import { useDialogStore, useDialogReducer } from "contection-top-layer/src/dialogs/hooks";
import { useUpperLayerStore, useUpperLayerReducer } from "contection-top-layer/src/upper-layers/hooks";

// Test 1: createTopLayer basic structure
function testCreateTopLayer() {
    const { TopLayerStore } = createTopLayer({});
    const initial = TopLayerStore._initial;
    const context = TopLayerStore._context;
    const Provider = TopLayerStore.Provider;
    const $$typeof = TopLayerStore.$$typeof;
    const displayName = TopLayerStore.displayName;

    <TopLayerStore.Provider>
        <div>Test</div>
    </TopLayerStore.Provider>;

    <TopLayerStore>
        <div>Test</div>
    </TopLayerStore>;
}

// Test 2: createDialog with typed data
function testCreateDialog() {
    const { TopLayerStore, Dialogs } = createTopLayer({
        dialogs: {
            Dialog1: {
                data: { title: "Test", count: 0 },
                isolated: false,
            },
        },
    });

    const Dialog1 = Dialogs.Dialog1;
    const dialogId: string = Dialog1._id;
    const dialogInitial: { title: string; count: number } = Dialog1._initial;
    const dialogInstance = Dialog1._instance;
    const dialogContext = Dialog1._context;
    const dialogSymbol = Dialog1.$$typeof;

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
    const { TopLayerStore, Dialogs } = createTopLayer({
        dialogs: {
            Dialog: {
                data: { visible: false },
                isolated: true,
                checkIsActive: (store: {
                    data: { visible: boolean };
                    isolated: boolean;
                    open: boolean;
                    node: HTMLDialogElement | null;
                }) => store.open && store.data.visible,
            },
        },
    });

    const Dialog = Dialogs.Dialog;
    const checkIsActive: (store: {
        data: { visible: boolean };
        isolated: boolean;
        open: boolean;
        node: HTMLDialogElement | null;
    }) => boolean = TopLayerStore._initial[Dialog._id].checkIsActive;
    checkIsActive({ data: { visible: true }, isolated: true, open: true, node: null });
}

// Test 4: createUpperLayer with typed data
function testCreateUpperLayer() {
    const { TopLayerStore, UpperLayers } = createTopLayer({
        upperLayers: {
            UpperLayer1: {
                data: { content: "Test", active: true },
                isolated: false,
            },
        },
    });

    const UpperLayer1 = UpperLayers.UpperLayer1;
    const upperLayerId: string = UpperLayer1._id;
    const upperLayerInitial: { content: string; active: boolean } = UpperLayer1._initial;
    const upperLayerInstance = UpperLayer1._instance;
    const upperLayerContext = UpperLayer1._context;
    const upperLayerSymbol = UpperLayer1.$$typeof;

    <UpperLayer1.UpperLayer>
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
    const { UpperLayers } = createTopLayer({
        upperLayers: {
            UpperLayer: {
                data: undefined,
                isolated: true,
            },
        },
    });

    const UpperLayer = UpperLayers.UpperLayer;
    const data: undefined = UpperLayer._initial;
}

// Test 6: useTopLayerStore
function testUseTopLayer() {
    const { TopLayerStore } = createTopLayer({
        dialogs: {
            MyDialog: {
                data: { title: "Test" },
                isolated: false,
            },
        },
        upperLayers: {
            MyUpperLayer: {
                data: { content: "Test" },
                isolated: false,
            },
        },
    });

    function Component() {
        const store = useTopLayerStore(TopLayerStore);
        const dialogs: Dialog[] = store.dialogs;
        const upperLayers: UpperLayer[] = store.upperLayers;
        const hasActiveIsolatedLayers: boolean = store.hasActiveIsolatedLayers;
        const hasActiveLayers: boolean = store.hasActiveLayers;

        const partial = useTopLayerStore(TopLayerStore, { keys: ["dialogs", "hasActiveLayers"] });
        const partialDialogs: Dialog[] = partial.dialogs;
        const partialHasActive: boolean = partial.hasActiveLayers;
        // @ts-expect-error - should not have unselected keys
        const partialUpperLayers = partial.upperLayers;
    }
}

// Test 7: useTopLayerImperative
function testUseTopLayerImperative() {
    const { TopLayerStore } = createTopLayer({
        dialogs: {
            MyDialog: {
                data: { title: "Test" },
                isolated: false,
            },
        },
    });

    function Component() {
        const store = useTopLayerImperative(TopLayerStore);
        const dialogs: Dialog[] = store.dialogs;
        const upperLayers: UpperLayer[] = store.upperLayers;
        const hasActiveIsolatedLayers: boolean = store.hasActiveIsolatedLayers;
        const hasActiveLayers: boolean = store.hasActiveLayers;
        // @ts-expect-error - should not have other property
        const other = store.other;
    }
}

// Test 8: useDialogStore
function testUseDialogStatus() {
    const { Dialogs } = createTopLayer({
        dialogs: {
            Dialog: {
                data: { title: "Test", count: 0 },
                isolated: false,
            },
        },
    });

    const Dialog = Dialogs.Dialog;

    function Component() {
        const store = useDialogStore(Dialog);
        const open: boolean = store.open;
        const title: string = store.data.title;
        const count: number = store.data.count;

        const storeWithEnabled = useDialogStore(Dialog, { enabled: "always" });
        const open2: boolean = storeWithEnabled.open;

        const storeWithFunction = useDialogStore(Dialog, {
            enabled: (store) => store.open,
        });
        const open3: boolean = storeWithFunction.open;
    }
}

// Test 9: useDialogReducer
function testUseDialogReducer() {
    const { Dialogs } = createTopLayer({
        dialogs: {
            Dialog: {
                data: { title: "Test", count: 0 },
                isolated: false,
            },
        },
    });

    const Dialog = Dialogs.Dialog;

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

// Test 10: useUpperLayerStore
function testUseUpperLayerStatus() {
    const { UpperLayers } = createTopLayer({
        upperLayers: {
            UpperLayer: {
                data: { content: "Test", active: true },
                isolated: false,
            },
        },
    });

    const UpperLayer = UpperLayers.UpperLayer;

    function Component() {
        const store = useUpperLayerStore(UpperLayer);
        const content: string | undefined = store.data?.content;
        const active: boolean | undefined = store.data?.active;

        const storeWithEnabled = useUpperLayerStore(UpperLayer, { enabled: "always" });
        const content2: string | undefined = storeWithEnabled.data?.content;

        const storeWithFunction = useUpperLayerStore(UpperLayer, {
            enabled: (store) => Boolean(store.data),
        });
        const content3: string | undefined = storeWithFunction.data?.content;
    }
}

// Test 11: useUpperLayerReducer
function testUseUpperLayerReducer() {
    const { UpperLayers } = createTopLayer({
        upperLayers: {
            UpperLayer: {
                data: { content: "Test", count: 0 },
                isolated: false,
            },
        },
    });

    const UpperLayer = UpperLayers.UpperLayer;

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
    const dialogData = {
        title: "Test",
        count: 0,
    } as const;

    const { Dialogs } = createTopLayer({
        dialogs: {
            Dialog: {
                data: dialogData,
                isolated: false,
            },
        },
    });

    const Dialog = Dialogs.Dialog;
    const title: "Test" = Dialog._initial.title;
    const count: 0 = Dialog._initial.count;
}

// Test 13: Multiple dialogs and upper layers
function testMultipleLayers() {
    const { TopLayerStore, Dialogs, UpperLayers } = createTopLayer({
        dialogs: {
            Dialog1: {
                data: { title: "Dialog 1" },
                isolated: false,
            },
            Dialog2: {
                data: { title: "Dialog 2" },
                isolated: true,
            },
        },
        upperLayers: {
            UpperLayer1: {
                data: { content: "Layer 1" },
                isolated: false,
            },
        },
    });

    const Dialog1 = Dialogs.Dialog1;
    const Dialog2 = Dialogs.Dialog2;
    const UpperLayer1 = UpperLayers.UpperLayer1;

    const store = useTopLayerStore(TopLayerStore);
    const dialogsCount: number = store.dialogs.length;
    const upperLayersCount: number = store.upperLayers.length;
}

// Test 14: Store instance structure
function testStoreInstanceStructure() {
    const { TopLayerStore, Dialogs } = createTopLayer({
        dialogs: {
            Dialog: {
                data: { test: "value" },
                isolated: false,
            },
        },
    });

    const Dialog = Dialogs.Dialog;
    const dialogStore = TopLayerStore._initial[Dialog._id];
    if (dialogStore.type === "dialog") {
        const open: boolean = dialogStore.open;
        const data: unknown = dialogStore.data;
        const isolated: boolean = dialogStore.isolated;
        const node: HTMLDialogElement | null = dialogStore.node;
    }
}

// Test 15: NonFunction type constraint
function testNonFunctionConstraint() {
    const { Dialogs, UpperLayers } = createTopLayer({
        dialogs: {
            Dialog: {
                data: { value: 42 },
                isolated: false,
            },
        },
        upperLayers: {
            UpperLayer: {
                data: { value: 42 },
                isolated: false,
            },
        },
    });

    const Dialog = Dialogs.Dialog;
    const [dialog, update] = useDialogReducer(Dialog);
    update((prev) => ({ open: prev.open, data: { value: prev.data.value + 1 } }));

    const UpperLayer = UpperLayers.UpperLayer;
    const [upperLayer, updateUpper] = useUpperLayerReducer(UpperLayer);
    updateUpper((prev) => ({ data: { value: (prev.data?.value || 0) + 1 } }));
    // @ts-expect-error - should not have other property
    updateUpper((prev) => ({ data: { other: "something" } }));
}

export {};
