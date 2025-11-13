/**
 * Type tests for Contection Viewport
 * These tests verify TypeScript type safety and inference for viewport functionality.
 * Run with: pnpm test:types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import {
    createViewportStore,
    useViewportWidth,
    useViewportWidthComparer,
    useViewportWidthBreakpoint,
    useViewportHeight,
    useViewportHeightComparer,
    useViewportHeightBreakpoint,
    useViewportStorage,
} from "contection-viewport";

// Test 1: createViewportStore with no options (default breakpoints)
function testCreateViewportStoreDefault() {
    const Store = createViewportStore();

    // Should have default width breakpoints
    const width: number | null = Store._initial.width;
    const height: number | null = Store._initial.height;
    const mounted: boolean = Store._initial.mounted;

    // Should have default widthOptions
    const defaultBreakpoint = Store._initial.widthOptions.default;
    const current: "mobile" | "tablet" | "desktop" | null = defaultBreakpoint.current;
    const lowerBreakpoints: ("mobile" | "tablet" | "desktop")[] | null = defaultBreakpoint.lowerBreakpoints;

    // Should not have heightOptions when not provided
    // Note: heightOptions is typed as 'never' when height is undefined, so accessing it would cause a type error
    // This is tested implicitly by TypeScript's type system
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

    // Should have correct width options
    const baseBreakpoint = Store._initial.widthOptions.base;
    const baseCurrent: "mobile" | "tablet" | "desktop" | null = baseBreakpoint.current;
    const baseLower: ("mobile" | "tablet" | "desktop")[] | null = baseBreakpoint.lowerBreakpoints;

    const customBreakpoint = Store._initial.widthOptions.custom;
    const customCurrent: "small" | "medium" | "large" | null = customBreakpoint.current;
    const customLower: ("small" | "medium" | "large")[] | null = customBreakpoint.lowerBreakpoints;

    // Should not have default when custom width is provided
    // @ts-expect-error - default should not exist when custom width is provided
    const defaultOpt = Store._initial.widthOptions.default;

    // Should not have heightOptions
    // Note: heightOptions is typed as 'never' when height is undefined
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

    // Should have default widthOptions
    const defaultBreakpoint = Store._initial.widthOptions.default;

    // Should have heightOptions
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

    // Should have both width and height options
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

    // Should work with throttle option
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
        // Should return number | null
        const widthType: number | null = width;
        // @ts-expect-error - should not be string
        const invalid: string = width;
    }
}

// Test 7: useViewportWidthComparer
function testUseViewportWidthComparer() {
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
        // Should accept valid breakpoint name
        const result1 = useViewportWidthComparer(Store, "mobile", "base", ["equal"]);
        // Result should be boolean | null
        if (result1 !== null) {
            const isTrue: boolean = result1;
        }

        const result2 = useViewportWidthComparer(Store, "tablet", "base", ["greater", "less"]);
        // Result should be boolean | null
        if (result2 !== null) {
            const isTrue: boolean = result2;
        }

        // @ts-expect-error - should not accept invalid breakpoint name
        const invalid1 = useViewportWidthComparer(Store, "invalid", "base", ["equal"]);

        // @ts-expect-error - should not accept invalid type
        const invalid2 = useViewportWidthComparer(Store, "mobile", "invalid", ["equal"]);
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
        // Should return correct option type for base
        const baseBreakpoint = useViewportWidthBreakpoint(Store, "base");
        const baseCurrent: "mobile" | "tablet" | "desktop" | null = baseBreakpoint.current;
        const baseLower: ("mobile" | "tablet" | "desktop")[] | null = baseBreakpoint.lowerBreakpoints;

        // Should return correct option type for custom
        const customBreakpoint = useViewportWidthBreakpoint(Store, "custom");
        const customCurrent: "small" | "large" | null = customBreakpoint.current;
        const customLower: ("small" | "large")[] | null = customBreakpoint.lowerBreakpoints;

        // @ts-expect-error - should not accept invalid type
        const invalid = useViewportWidthBreakpoint(Store, "invalid");
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
        // Should return number | null
        const heightType: number | null = height;
        // @ts-expect-error - should not be string
        const invalid: string = height;
    }

    // Note: useViewportHeight requires height options, so it won't work with stores without height
    // This is tested implicitly by TypeScript's type system
}

// Test 10: useViewportHeightComparer
function testUseViewportHeightComparer() {
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
        // Should accept valid breakpoint name
        const result1 = useViewportHeightComparer(Store, "small", "base", ["equal"]);
        // Result type is inferred from the hook implementation
        const result1Value = result1;

        const result2 = useViewportHeightComparer(Store, "medium", "base", ["greater", "less"]);
        // Result type is inferred from the hook implementation
        const result2Value = result2;

        // @ts-expect-error - should not accept invalid breakpoint name
        const invalid1 = useViewportHeightComparer(Store, "invalid", "base", ["equal"]);

        // @ts-expect-error - should not accept invalid type
        const invalid2 = useViewportHeightComparer(Store, "small", "invalid", ["equal"]);
    }

    // Note: useViewportHeightComparer requires height options
    // TypeScript will enforce this constraint
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
        // Should return correct option type for base
        const baseBreakpoint = useViewportHeightBreakpoint(Store, "base");
        const baseCurrent: "small" | "medium" | "large" | null = baseBreakpoint.current;
        const baseLower: ("small" | "medium" | "large")[] | null = baseBreakpoint.lowerBreakpoints;

        // Should return correct option type for custom
        const customBreakpoint = useViewportHeightBreakpoint(Store, "custom");
        const customCurrent: "tiny" | "huge" | null = customBreakpoint.current;
        const customLower: ("tiny" | "huge")[] | null = customBreakpoint.lowerBreakpoints;

        // @ts-expect-error - should not accept invalid type
        const invalid = useViewportHeightBreakpoint(Store, "invalid");
    }

    // Note: useViewportHeightBreakpoint requires height options
    // TypeScript will enforce this constraint
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
        const [store, listen, unlisten] = useViewportStorage(Store);

        // Store should have correct type
        const width: number | null = store.width;
        const height: number | null = store.height;
        const mounted: boolean = store.mounted;
        const widthBase = store.widthOptions.base;
        const heightBase = store.heightOptions.base;

        // Listen should accept valid keys
        const unsubscribe1 = listen("width", (value: number | null) => {});
        const unsubscribe2 = listen("height", (value: number | null) => {});
        const unsubscribe3 = listen("mounted", (value: boolean) => {});

        // @ts-expect-error - should not accept invalid key
        const invalid1 = listen("invalid", () => {});

        // Unlisten should accept valid keys
        unlisten("width", () => {});
        unlisten("height", () => {});
        unlisten("mounted", () => {});

        // @ts-expect-error - should not accept invalid key
        unlisten("invalid", () => {});
    }
}

// Test 13: Store Provider and Consumer
function testStoreProviderConsumer() {
    const Store = createViewportStore({
        width: {
            base: {
                mobile: 0,
                tablet: 600,
            },
        },
    });

    // Provider should work
    <Store.Provider>
        <div>Test</div>
    </Store.Provider>;

    // Consumer should work with correct types
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

// Test 14: Type inference with const breakpoints
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

    // Types should be inferred correctly
    const baseCurrent: "mobile" | "tablet" | "desktop" | null = Store._initial.widthOptions.base.current;
}

// Test 15: Multiple breakpoint groups
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

    // Should have all breakpoint groups
    const responsive = Store._initial.widthOptions.responsive;
    const semantic = Store._initial.widthOptions.semantic;
    const vertical = Store._initial.heightOptions.vertical;

    // Types should be correct for each group
    const responsiveCurrent: "xs" | "sm" | "md" | "lg" | "xl" | null = responsive.current;
    const semanticCurrent: "mobile" | "tablet" | "desktop" | null = semantic.current;
    const verticalCurrent: "short" | "medium" | "tall" | null = vertical.current;
}

// Test 16: Store instance structure
function testStoreInstanceStructure() {
    const Store = createViewportStore();

    // Should have _initial
    const initial = Store._initial;
    const width: number | null = initial.width;

    // Should have _context
    const context = Store._context;

    // Should be callable as Provider
    const Provider = Store.Provider;

    // Should have Consumer
    const Consumer = Store.Consumer;
}

// Test 17: Edge case - single breakpoint
function testSingleBreakpoint() {
    const Store = createViewportStore({
        width: {
            single: {
                only: 0,
            },
        },
    });

    // Should handle single breakpoint
    const single = Store._initial.widthOptions.single;
    const current: "only" | null = single.current;
    const lower: "only"[] | null = single.lowerBreakpoints;
}

// All tests should compile without errors if types are correct
export {};
