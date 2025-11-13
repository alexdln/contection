/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ViewportBreakpoints } from "contection-viewport/src/types";
import { formatOptions, calculateCurrentBreakpoint } from "contection-viewport/src/utils";

describe("formatOptions", () => {
    it("should format breakpoints correctly", () => {
        const breakpoints: ViewportBreakpoints = {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
        };

        const { formattedOptions, currentOptions } = formatOptions(breakpoints);

        expect(formattedOptions).toHaveLength(1);
        expect(formattedOptions[0][0]).toBe("base");
        expect(formattedOptions[0][1]).toEqual([
            ["mobile", 0],
            ["tablet", 600],
            ["desktop", 1024],
        ]);

        expect(currentOptions).toHaveProperty("base");
        expect(currentOptions.base).toEqual({
            lowerBreakpoints: null,
            current: null,
        });
    });

    it("should sort breakpoints by size", () => {
        const breakpoints: ViewportBreakpoints = {
            base: {
                desktop: 1024,
                mobile: 0,
                tablet: 600,
            },
        };

        const { formattedOptions } = formatOptions(breakpoints);

        expect(formattedOptions[0][1]).toEqual([
            ["mobile", 0],
            ["tablet", 600],
            ["desktop", 1024],
        ]);
    });

    it("should handle multiple breakpoint groups", () => {
        const breakpoints: ViewportBreakpoints = {
            base: {
                mobile: 0,
                tablet: 600,
            },
            custom: {
                small: 0,
                large: 1000,
            },
        };

        const { formattedOptions, currentOptions } = formatOptions(breakpoints);

        expect(formattedOptions).toHaveLength(2);
        expect(currentOptions).toHaveProperty("base");
        expect(currentOptions).toHaveProperty("custom");
    });

    it("should handle breakpoints with null values", () => {
        const breakpoints: ViewportBreakpoints = {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: null as any,
            },
        };

        const { formattedOptions } = formatOptions(breakpoints);

        expect(formattedOptions[0][1]).toEqual([
            ["mobile", 0],
            ["desktop", null],
            ["tablet", 600],
        ]);
    });
});

describe("calculateCurrentBreakpoint", () => {
    it("should calculate current breakpoint for mobile viewport", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(500, formattedOptions);

        expect(result.base.current).toBe("mobile");
        expect(result.base.lowerBreakpoints).toEqual([]);
    });

    it("should calculate current breakpoint for tablet viewport", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(800, formattedOptions);

        expect(result.base.current).toBe("tablet");
        expect(result.base.lowerBreakpoints).toEqual(["mobile"]);
    });

    it("should calculate current breakpoint for desktop viewport", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(1200, formattedOptions);

        expect(result.base.current).toBe("desktop");
        expect(result.base.lowerBreakpoints).toEqual(["mobile", "tablet"]);
    });

    it("should handle viewport exactly at breakpoint", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(600, formattedOptions);

        expect(result.base.current).toBe("tablet");
    });

    it("should handle multiple breakpoint groups", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
            [
                "custom",
                [
                    ["small", 0],
                    ["medium", 500],
                    ["large", 1000],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(800, formattedOptions);

        expect(result.base.current).toBe("tablet");
        expect(result.custom.current).toBe("medium");
    });

    it("should not handle viewport smaller than all breakpoints", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(0, formattedOptions);

        expect(result.base.current).toBeUndefined();
    });

    it("should handle viewport larger than all breakpoints", () => {
        const formattedOptions = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentBreakpoint(2000, formattedOptions);

        expect(result.base.current).toBe("desktop");
        expect(result.base.lowerBreakpoints).toEqual(["mobile", "tablet"]);
    });

    it("should handle breakpoints with only one value", () => {
        const formattedOptions = [["base", [["mobile", 0]]]] as any;

        const result = calculateCurrentBreakpoint(500, formattedOptions);

        expect(result.base.current).toBe("mobile");
    });
});
