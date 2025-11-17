/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ViewportCategories } from "contection-viewport/src/core/types";
import { formatCategories, calculateCurrentCategories } from "contection-viewport/src/core/lib";

describe("formatOptions", () => {
    it("should format breakpoints correctly", () => {
        const breakpoints: ViewportCategories = {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: 1024,
            },
        };

        const { formattedCategories, currentCategories } = formatCategories(breakpoints);

        expect(formattedCategories).toHaveLength(1);
        expect(formattedCategories[0][0]).toBe("base");
        expect(formattedCategories[0][1]).toEqual([
            ["mobile", 0],
            ["tablet", 600],
            ["desktop", 1024],
        ]);

        expect(currentCategories).toHaveProperty("base");
        expect(currentCategories.base).toEqual({
            lowerBreakpoints: null,
            current: null,
        });
    });

    it("should sort breakpoints by size", () => {
        const breakpoints: ViewportCategories = {
            base: {
                desktop: 1024,
                mobile: 0,
                tablet: 600,
            },
        };

        const { formattedCategories } = formatCategories(breakpoints);

        expect(formattedCategories[0][1]).toEqual([
            ["mobile", 0],
            ["tablet", 600],
            ["desktop", 1024],
        ]);
    });

    it("should handle multiple breakpoint groups", () => {
        const breakpoints: ViewportCategories = {
            base: {
                mobile: 0,
                tablet: 600,
            },
            custom: {
                small: 0,
                large: 1000,
            },
        };

        const { formattedCategories, currentCategories } = formatCategories(breakpoints);

        expect(formattedCategories).toHaveLength(2);
        expect(currentCategories).toHaveProperty("base");
        expect(currentCategories).toHaveProperty("custom");
    });

    it("should handle breakpoints with null values", () => {
        const breakpoints: ViewportCategories = {
            base: {
                mobile: 0,
                tablet: 600,
                desktop: null as any,
            },
        };

        const { formattedCategories } = formatCategories(breakpoints);

        expect(formattedCategories[0][1]).toEqual([
            ["mobile", 0],
            ["desktop", null],
            ["tablet", 600],
        ]);
    });
});

describe("calculateCurrentCategories", () => {
    it("should calculate current breakpoint for mobile viewport", () => {
        const formattedCategories = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentCategories(500, formattedCategories);

        expect(result.base.current).toBe("mobile");
        expect(result.base.lowerBreakpoints).toEqual([]);
    });

    it("should calculate current breakpoint for tablet viewport", () => {
        const formattedCategories = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentCategories(800, formattedCategories);

        expect(result.base.current).toBe("tablet");
        expect(result.base.lowerBreakpoints).toEqual(["mobile"]);
    });

    it("should calculate current breakpoint for desktop viewport", () => {
        const formattedCategories = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentCategories(1200, formattedCategories);

        expect(result.base.current).toBe("desktop");
        expect(result.base.lowerBreakpoints).toEqual(["mobile", "tablet"]);
    });

    it("should handle viewport exactly at breakpoint", () => {
        const formattedCategories = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentCategories(600, formattedCategories);

        expect(result.base.current).toBe("tablet");
    });

    it("should handle multiple breakpoint groups", () => {
        const formattedCategories = [
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

        const result = calculateCurrentCategories(800, formattedCategories);

        expect(result.base.current).toBe("tablet");
        expect(result.custom.current).toBe("medium");
    });

    it("should not handle viewport smaller than all breakpoints", () => {
        const formattedCategories = [
            [
                "base",
                [
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentCategories(0, formattedCategories);

        expect(result.base.current).toBeNull();
    });

    it("should handle viewport larger than all breakpoints", () => {
        const formattedCategories = [
            [
                "base",
                [
                    ["mobile", 0],
                    ["tablet", 600],
                    ["desktop", 1024],
                ],
            ],
        ] as any;

        const result = calculateCurrentCategories(2000, formattedCategories);

        expect(result.base.current).toBe("desktop");
        expect(result.base.lowerBreakpoints).toEqual(["mobile", "tablet"]);
    });

    it("should handle breakpoints with only one value", () => {
        const formattedCategories = [["base", [["mobile", 0]]]] as any;

        const result = calculateCurrentCategories(500, formattedCategories);

        expect(result.base.current).toBe("mobile");
    });
});
