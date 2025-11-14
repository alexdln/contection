/**
 * Type tests for contection-viewport
 * These tests verify TypeScript type safety and inference for viewport functionality.
 * Run with: pnpm test:types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import {
    createViewportStore,
    useViewport,
    useViewportWidth,
    useViewportWidthCompare,
    useViewportWidthBreakpoint,
    useViewportHeight,
    useViewportHeightCompare,
    useViewportHeightBreakpoint,
    useViewportStorage,
} from "contection-viewport";

// Test 1: createViewportStore with no options (default breakpoints)
function testCreateViewportStoreDefault() {
    const Store = createViewportStore();
    const width: number | null = Store._initial.width;
    const height: number | null = Store._initial.height;
    const mounted: boolean = Store._initial.mounted;

    const defaultBreakpoint = Store._initial.widthOptions.default;
    const current: "mobile" | "tablet" | "desktop" | null = defaultBreakpoint.current;
    const lowerBreakpoints: ("mobile" | "tablet" | "desktop")[] | null = defaultBreakpoint.lowerBreakpoints;
}

// Test 2: createViewportStore with custom width breakpoints
function testCreateViewportStoreWithWidth() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
            custom: {
                small: 0,
                medium: 500,
                large: 1000,
            },
        },
    });

    const baseBreakpoint = Store._initial.widthOptions.base;
    const baseCurrent: "mobile" | "tablet" | "desktop" | null = baseBreakpoint.current;
    const baseLower: ("mobile" | "tablet" | "desktop")[] | null = baseBreakpoint.lowerBreakpoints;

    const customBreakpoint = Store._initial.widthOptions.custom;
    const customCurrent: "small" | "medium" | "large" | null = customBreakpoint.current;
    const customLower: ("small" | "medium" | "large")[] | null = customBreakpoint.lowerBreakpoints;

    // @ts-expect-error - default should not exist when custom width is provided
    const defaultOpt = Store._initial.widthOptions.default;
}

// Test 3: createViewportStore with height breakpoints
function testCreateViewportStoreWithHeight() {
    const Store = createViewportStore({
        height: {
            base: {
                small: 0,
                medium: 400,
                large: 800,
            },
        },
    });

    const defaultBreakpoint = Store._initial.widthOptions.default;

    const heightBase = Store._initial.heightOptions.base;
    const heightCurrent: "small" | "medium" | "large" | null = heightBase.current;
    const heightLower: ("small" | "medium" | "large")[] | null = heightBase.lowerBreakpoints;
}

// Test 4: createViewportStore with both width and height
function testCreateViewportStoreWithBoth() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
            },
        },
        height: {
            base: {
                small: 0,
                medium: 400,
            },
        },
    });

    const widthBase = Store._initial.widthOptions.base;
    const heightBase = Store._initial.heightOptions.base;

    const widthCurrent: "mobile" | "tablet" | null = widthBase.current;
    const heightCurrent: "small" | "medium" | null = heightBase.current;
}

// Test 5: createViewportStore with throttle
function testCreateViewportStoreWithThrottle() {
    const Store = createViewportStore({
        throttleMs: 100,
    });

    const width: number | null = Store._initial.width;
}

// Test 6: useViewportWidth
function testUseViewportWidth() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
        },
    });

    function Component() {
        const width = useViewportWidth(Store);
        const widthType: number | null = width;
        // @ts-expect-error - should not be string
        const invalid: string = width;
    }
}

// Test 7: useViewportWidthCompare
function testUseViewportWidthCompare() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
        },
    });

    function Component() {
        const result1 = useViewportWidthCompare(Store, { compareWith: "mobile", type: "base", mode: ["equal"] });
        if (result1 !== null) {
            const isTrue: boolean = result1;
        }

        const result2 = useViewportWidthCompare(Store, {
            compareWith: "tablet",
            type: "base",
            mode: ["greater", "less"],
        });
        if (result2 !== null) {
            const isTrue: boolean = result2;
        }

        // @ts-expect-error - should not accept invalid breakpoint name
        const invalid1 = useViewportWidthCompare(Store, { compareWith: "invalid", type: "base", mode: ["equal"] });

        // @ts-expect-error - should not accept invalid type
        const invalid2 = useViewportWidthCompare(Store, { compareWith: "mobile", type: "invalid", mode: ["equal"] });

        const result3 = useViewportWidthCompare(Store, { compareWith: "mobile", mode: ["equal"] });
        if (result3 !== null) {
            const isTrue: boolean = result3;
        }

        const result4 = useViewportWidthCompare(Store, { compareWith: "tablet", type: "base" });
        if (result4 !== null) {
            const isTrue: boolean = result4;
        }

        const result5 = useViewportWidthCompare(Store, { compareWith: "desktop" });
        if (result5 !== null) {
            const isTrue: boolean = result5;
        }
    }
}

// Test 8: useViewportWidthBreakpoint
function testUseViewportWidthBreakpoint() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
            custom: {
                small: 0,
                large: 1000,
            },
        },
    });

    function Component() {
        const baseBreakpoint = useViewportWidthBreakpoint(Store, { type: "base" });
        const baseCurrent: "mobile" | "tablet" | "desktop" | null = baseBreakpoint.current;
        const baseLower: ("mobile" | "tablet" | "desktop")[] | null = baseBreakpoint.lowerBreakpoints;

        const customBreakpoint = useViewportWidthBreakpoint(Store, { type: "custom" });
        const customCurrent: "small" | "large" | null = customBreakpoint.current;
        const customLower: ("small" | "large")[] | null = customBreakpoint.lowerBreakpoints;

        // @ts-expect-error - should not accept invalid type
        const invalid = useViewportWidthBreakpoint(Store, { type: "invalid" });
    }
}

// Test 9: useViewportHeight
function testUseViewportHeight() {
    const Store = createViewportStore({
        height: {
            base: {
                small: 0,
                medium: 400,
                large: 800,
            },
        },
    });

    function Component() {
        const height = useViewportHeight(Store);
        const heightType: number | null = height;
        // @ts-expect-error - should not be string
        const invalid: string = height;
    }
}

// Test 10: useViewportHeightCompare
function testUseViewportHeightCompare() {
    const Store = createViewportStore({
        height: {
            base: {
                small: 0,
                medium: 400,
                large: 800,
            },
        },
    });

    function Component() {
        const result1 = useViewportHeightCompare(Store, { compareWith: "small", type: "base", mode: ["equal"] });
        const result1Value = result1;

        const result2 = useViewportHeightCompare(Store, {
            compareWith: "medium",
            type: "base",
            mode: ["greater", "less"],
        });
        const result2Value = result2;

        // @ts-expect-error - should not accept invalid breakpoint name
        const invalid1 = useViewportHeightCompare(Store, { compareWith: "invalid", type: "base", mode: ["equal"] });

        // @ts-expect-error - should not accept invalid type
        const invalid2 = useViewportHeightCompare(Store, { compareWith: "small", type: "invalid", mode: ["equal"] });

        const result3 = useViewportHeightCompare(Store, { compareWith: "small", mode: ["equal"] });
        if (result3 !== null) {
            const isTrue: boolean = result3;
        }

        const result4 = useViewportHeightCompare(Store, { compareWith: "medium", type: "base" });
        if (result4 !== null) {
            const isTrue: boolean = result4;
        }

        const result5 = useViewportHeightCompare(Store, { compareWith: "large" });
        if (result5 !== null) {
            const isTrue: boolean = result5;
        }
    }
}

// Test 11: useViewportHeightBreakpoint
function testUseViewportHeightBreakpoint() {
    const Store = createViewportStore({
        height: {
            base: {
                small: 0,
                medium: 400,
                large: 800,
            },
            custom: {
                tiny: 0,
                huge: 1000,
            },
        },
    });

    function Component() {
        const baseBreakpoint = useViewportHeightBreakpoint(Store, { type: "base" });
        const baseCurrent: "small" | "medium" | "large" | null = baseBreakpoint.current;
        const baseLower: ("small" | "medium" | "large")[] | null = baseBreakpoint.lowerBreakpoints;

        const customBreakpoint = useViewportHeightBreakpoint(Store, { type: "custom" });
        const customCurrent: "tiny" | "huge" | null = customBreakpoint.current;
        const customLower: ("tiny" | "huge")[] | null = customBreakpoint.lowerBreakpoints;

        // @ts-expect-error - should not accept invalid type
        const invalid = useViewportHeightBreakpoint(Store, { type: "invalid" });
    }
}

// Test 12: useViewportStorage
function testUseViewportStorage() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
            },
        },
        height: {
            base: {
                small: 0,
                medium: 400,
            },
        },
    });

    function Component() {
        const [store, registerNode, listen, unlisten] = useViewportStorage(Store);

        const width: number | null = store.width;
        const height: number | null = store.height;
        const mounted: boolean = store.mounted;
        const widthBase = store.widthOptions.base;
        const heightBase = store.heightOptions.base;

        const unsubscribe1 = listen("width", (value: number | null) => {});
        const unsubscribe2 = listen("height", (value: number | null) => {});
        const unsubscribe3 = listen("mounted", (value: boolean) => {});

        const cleanup = registerNode(document.body);
        cleanup();

        // @ts-expect-error - should not accept anything other than HTMLElement or Window
        registerNode(document);
        // @ts-expect-error - should not accept invalid key
        const invalid1 = listen("invalid", () => {});

        unlisten("width", () => {});
        unlisten("height", () => {});
        unlisten("mounted", () => {});

        // @ts-expect-error - should not accept invalid key
        unlisten("invalid", () => {});
    }
}

// Test 13: useViewport
function testUseViewport() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
        },
        height: {
            base: {
                small: 0,
                medium: 400,
            },
        },
    });

    function Component() {
        const store = useViewport(Store);
        const width: number | null = store.width;
        const height: number | null = store.height;
        const mounted: boolean = store.mounted;
        const widthBase = store.widthOptions.base;
        const heightBase = store.heightOptions.base;

        const partial = useViewport(Store, { keys: ["width", "mounted"] });
        const partialWidth: number | null = partial.width;
        const partialMounted: boolean = partial.mounted;
        // @ts-expect-error - should not have unselected keys
        const partialHeight = partial.height;
    }
}

// Test 14: Store Provider and Consumer
function testStoreProviderConsumer() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
            },
        },
    });

    <Store.Provider>
        <div>Test</div>
    </Store.Provider>;

    <Store.Consumer>
        {(data) => {
            const width: number | null = data.width;
            const height: number | null = data.height;
            const mounted: boolean = data.mounted;
            const baseBreakpoint = data.widthOptions.base;
            return <div>{width}</div>;
        }}
    </Store.Consumer>;

    // Consumer with keys
    <Store.Consumer options={{ keys: ["width", "mounted"] }}>
        {(data) => {
            const width: number | null = data.width;
            const mounted: boolean = data.mounted;
            // @ts-expect-error - should not have unselected keys
            const height = data.height;
            return <div>{width}</div>;
        }}
    </Store.Consumer>;
}

// Test 15: Type inference with const breakpoints
function testTypeInferenceWithConst() {
    const breakpoints = {
        base: {
            mobile: 0,
            tablet: 600,
            desktop: 1024,
        },
    } as const;

    const Store = createViewportStore({
        width: breakpoints,
    });

    const baseCurrent: "mobile" | "tablet" | "desktop" | null = Store._initial.widthOptions.base.current;
}

// Test 16: Multiple breakpoint groups
function testMultipleBreakpointGroups() {
    const Store = createViewportStore({
        width: {
            responsive: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
            },
            semantic: {
                mobile: 0,
                tablet: 768,
                desktop: 1024,
            },
        },
        height: {
            vertical: {
                short: 0,
                medium: 600,
                tall: 900,
            },
        },
    });

    const responsive = Store._initial.widthOptions.responsive;
    const semantic = Store._initial.widthOptions.semantic;
    const vertical = Store._initial.heightOptions.vertical;

    const responsiveCurrent: "xs" | "sm" | "md" | "lg" | "xl" | null = responsive.current;
    const semanticCurrent: "mobile" | "tablet" | "desktop" | null = semantic.current;
    const verticalCurrent: "short" | "medium" | "tall" | null = vertical.current;
}

// Test 17: Store instance structure
function testStoreInstanceStructure() {
    const Store = createViewportStore();

    const initial = Store._initial;
    const width: number | null = initial.width;
    const context = Store._context;
    const Provider = Store.Provider;
    const Consumer = Store.Consumer;
}

// Test 18: Edge case - single breakpoint
function testSingleBreakpoint() {
    const Store = createViewportStore({
        width: {
            single: {
                only: 0,
            },
        },
    });

    const single = Store._initial.widthOptions.single;
    const current: "only" | null = single.current;
    const lower: "only"[] | null = single.lowerBreakpoints;
}

// Test 19: enabled option
function testEnabledOption() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
        },
    });

    function Component() {
        const store1 = useViewport(Store, { enabled: "always" });
        const store2 = useViewport(Store, { enabled: "never" });
        const store3String = useViewport(Store, {
            enabled: "after-hydration",
            mutation: (store) => String(store.width),
        });
        const store4 = useViewport(Store, { enabled: (store) => store.mounted });
        const width1: number | null = store1.width;
        const width2: number | null = store2.width;
        const width3: string = store3String;
        const width4: number | null = store4.width;

        const width5 = useViewportWidth(Store, { enabled: "always" });
        const width6 = useViewportWidth(Store, { enabled: (store) => store.mounted });
        const widthType5: number | null = width5;
        const widthType6: number | null = width6;
    }
}

export {};
