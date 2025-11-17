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
import React from "react";

import { render, screen, act } from "@src/setup/test-utils";

describe("viewport hooks", () => {
    beforeEach(() => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1024,
        });
        Object.defineProperty(window, "innerHeight", {
            writable: true,
            configurable: true,
            value: 768,
        });
    });

    describe("useViewport", () => {
        it("should return current viewport width", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const width = useViewport(Store, { keys: ["width"], mutation: (state) => state.width });
                return <div data-testid="width">{String(width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
        });
        it("should return width and height", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const store = useViewport(Store, { keys: ["width", "height"] });
                return (
                    <>
                        <div data-testid="width">{String(store.width)}</div>
                        <div data-testid="height">{String(store.height)}</div>
                        {/* @ts-expect-error - heightOptions is not available */}
                        <div data-testid="height-options">{String(store.heightOptions)}</div>
                    </>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
            expect(screen.getByTestId("height")).toHaveTextContent("768");
            expect(screen.getByTestId("height-options")).toHaveTextContent("undefined");
        });

        it("should update when viewport changes", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const store = useViewport(Store, { keys: ["width"] });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("width")).toHaveTextContent("800");
        });

        it("should not re-render when unsubscribed keys change", () => {
            let renderCount = 0;
            const Store = createViewportStore();
            const TestComponent = () => {
                renderCount++;
                const store = useViewport(Store, { keys: ["width"] });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerHeight", {
                    writable: true,
                    configurable: true,
                    value: 600,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(renderCount).toBe(1);
        });

        it("should access breakpoint options", () => {
            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });
            const TestComponent = () => {
                const store = useViewport(Store, { keys: ["widthCategories"] });
                const breakpoint = store.widthCategories.base;
                return (
                    <>
                        <div data-testid="current">{String(breakpoint.current)}</div>
                        <div data-testid="lower">
                            {breakpoint.lowerBreakpoints ? breakpoint.lowerBreakpoints.join(",") : "null"}
                        </div>
                    </>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("desktop");
            expect(screen.getByTestId("lower")).toHaveTextContent("mobile");
            expect(screen.getByTestId("lower")).toHaveTextContent("tablet");
        });

        it("should subscribe when enabled is always", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const store = useViewport(Store, { keys: ["width"], enabled: "always" });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
        });

        it("should subscribe when enabled is after-hydration", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const store = useViewport(Store, { keys: ["width"], enabled: "after-hydration" });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("width")).toHaveTextContent("800");
        });

        it("should not subscribe when enabled is never", () => {
            let renderCount = 0;
            const Store = createViewportStore();
            const TestComponent = () => {
                renderCount++;
                const store = useViewport(Store, { keys: ["width"], enabled: "never" });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(renderCount).toBe(1);
        });

        it("should subscribe when enabled function returns true", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const store = useViewport(Store, {
                    keys: ["width"],
                    enabled: (store) => Boolean(store.width) && store.width! > 0,
                });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
        });

        it("should not subscribe when enabled function returns false", () => {
            let renderCount = 0;
            const Store = createViewportStore();
            const TestComponent = () => {
                renderCount++;
                const store = useViewport(Store, {
                    keys: ["width"],
                    enabled: () => false,
                });
                return <div data-testid="width">{String(store.width)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(renderCount).toBe(1);
        });
    });

    describe("useViewportWidth", () => {
        it("should return current viewport width", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const width = useViewportWidth(Store);
                return <div data-testid="width">{width}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
        });

        it("should update when window width changes", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const width = useViewportWidth(Store);
                return <div data-testid="width">{width}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("width")).toHaveTextContent("800");
        });

        it("should not re-render when height changes", () => {
            let renderCount = 0;
            const Store = createViewportStore();
            const TestComponent = () => {
                renderCount++;
                const width = useViewportWidth(Store);
                return <div data-testid="width">{width}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerHeight", {
                    writable: true,
                    configurable: true,
                    value: 600,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(renderCount).toBe(1);
        });
    });

    describe("useViewportWidthCompare", () => {
        it("should return true when current breakpoint equals compareWith and mode includes 'equal'", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "tablet",
                    type: "base",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should return false when current breakpoint does not equal compareWith", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "desktop",
                    type: "base",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("false");
        });

        it("should return false when compareWith is in lowerBreakpoints and mode includes 'greater'", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "tablet",
                    type: "base",
                    mode: ["greater"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("false");
        });

        it("should return true when compareWith is in lowerBreakpoints and mode includes 'less'", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "desktop",
                    type: "base",
                    mode: ["less"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should return null when widthCategories is not available", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "mobile",
                    // @ts-expect-error - nonexistent type
                    type: "nonexistent",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("null");
        });

        it("should support multiple modes", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 375,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "tablet",
                    type: "base",
                    mode: ["equal", "greater"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("false");
        });

        it("should default to first type when type is omitted", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "tablet",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should default to ['equal'] mode when mode is omitted", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "tablet",
                    type: "base",
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should work with both type and mode omitted", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportWidthCompare(Store, {
                    compareWith: "tablet",
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });
    });

    describe("useViewportWidthBreakpoint", () => {
        it("should return current breakpoint for given type", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });

            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const breakpoint = useViewportWidthBreakpoint(Store, { type: "base" });
                return (
                    <div>
                        <span data-testid="current">{String(breakpoint?.current)}</span>
                        <span data-testid="lower">
                            {breakpoint?.lowerBreakpoints ? breakpoint.lowerBreakpoints.join(",") : "null"}
                        </span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("tablet");
        });

        it("should memoize result when breakpoint doesn't change", () => {
            let renderCount = 0;
            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                renderCount++;
                const breakpoint = useViewportWidthBreakpoint(Store, { type: "base" });
                return <div data-testid="current">{String(breakpoint?.current)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("desktop");
            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 1440,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("current")).toHaveTextContent("desktop");
            expect(renderCount).toBe(1);
        });

        it("should update when breakpoint changes", () => {
            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            const TestComponent = () => {
                const breakpoint = useViewportWidthBreakpoint(Store, { type: "base" });
                return <div data-testid="current">{String(breakpoint?.current)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("desktop");

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 500,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("current")).toHaveTextContent("mobile");
        });
    });

    describe("useViewportHeight", () => {
        it("should return current viewport height", () => {
            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const height = useViewportHeight(Store);
                return <div data-testid="height">{height}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("height")).toHaveTextContent("768");
        });

        it("should update when window height changes", () => {
            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const height = useViewportHeight(Store);
                return <div data-testid="height">{height}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("height")).toHaveTextContent("768");

            act(() => {
                Object.defineProperty(window, "innerHeight", {
                    writable: true,
                    configurable: true,
                    value: 600,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("height")).toHaveTextContent("600");
        });

        it("should not re-render when width changes", () => {
            let renderCount = 0;
            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                renderCount++;
                const height = useViewportHeight(Store);
                return <div data-testid="height">{height}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(renderCount).toBe(1);
        });
    });

    describe("useViewportHeightCompare", () => {
        it("should return true when current breakpoint equals compareWith and mode includes 'equal'", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportHeightCompare(Store, {
                    compareWith: "medium",
                    type: "base",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should return true when compareWith is in lowerBreakpoints and mode includes 'greater'", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 900,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportHeightCompare(Store, {
                    compareWith: "medium",
                    type: "base",
                    mode: ["greater"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should return true when compareWith is in lowerBreakpoints and mode includes 'greater'", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportHeightCompare(Store, {
                    compareWith: "small",
                    type: "base",
                    mode: ["greater"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should return null when heightOptions is not available", () => {
            const StoreWithHeight = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                    },
                },
            });

            const TestComponent2 = () => {
                const result = useViewportHeightCompare(StoreWithHeight, {
                    compareWith: "small",
                    // @ts-expect-error - nonexistent type
                    type: "nonexistent",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <StoreWithHeight.Provider>
                    <TestComponent2 />
                </StoreWithHeight.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("null");
        });

        it("should default to first type when type is omitted", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportHeightCompare(Store, {
                    compareWith: "medium",
                    mode: ["equal"],
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should default to ['equal'] mode when mode is omitted", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportHeightCompare(Store, {
                    compareWith: "medium",
                    type: "base",
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });

        it("should work with both type and mode omitted", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const result = useViewportHeightCompare(Store, {
                    compareWith: "medium",
                });
                return <div data-testid="result">{String(result)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("result")).toHaveTextContent("true");
        });
    });

    describe("useViewportHeightBreakpoint", () => {
        it("should return current breakpoint for given type", () => {
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const breakpoint = useViewportHeightBreakpoint(Store, { type: "base" });
                return (
                    <div>
                        <span data-testid="current">{String(breakpoint?.current)}</span>
                        <span data-testid="lower">
                            {breakpoint?.lowerBreakpoints ? breakpoint.lowerBreakpoints.join(",") : "null"}
                        </span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("medium");
            expect(screen.getByTestId("lower")).toHaveTextContent("small");
        });

        it("should memoize result when breakpoint doesn't change", () => {
            let renderCount = 0;
            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                renderCount++;
                const breakpoint = useViewportHeightBreakpoint(Store, { type: "base" });
                return <div data-testid="current">{String(breakpoint?.current)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(renderCount).toBe(1);

            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 800,
                });
                Object.defineProperty(window, "innerHeight", {
                    writable: true,
                    configurable: true,
                    value: 600,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(renderCount).toBe(1);
        });

        it("should update when breakpoint changes", () => {
            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            const TestComponent = () => {
                const breakpoint = useViewportHeightBreakpoint(Store, { type: "base" });
                return <div data-testid="current">{String(breakpoint?.current)}</div>;
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("medium");

            act(() => {
                Object.defineProperty(window, "innerHeight", {
                    writable: true,
                    configurable: true,
                    value: 900,
                });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByTestId("current")).toHaveTextContent("large");
        });
    });

    describe("useViewportStorage", () => {
        it("should return store, registerNode, listen, and unlisten functions", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const [store, registerNode, listen, unlisten] = useViewportStorage(Store);
                return (
                    <div>
                        <span data-testid="width">{String(store.width)}</span>
                        <span data-testid="has-register-node">{String(typeof registerNode === "function")}</span>
                        <span data-testid="has-listen">{String(typeof listen === "function")}</span>
                        <span data-testid="has-unlisten">{String(typeof unlisten === "function")}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
            expect(screen.getByTestId("has-register-node")).toHaveTextContent("true");
            expect(screen.getByTestId("has-listen")).toHaveTextContent("true");
            expect(screen.getByTestId("has-unlisten")).toHaveTextContent("true");
        });

        it("should update dimensions when registered node changes size", () => {
            const Store = createViewportStore();

            const TestComponent = () => {
                const [, registerNode] = useViewportStorage(Store);
                const width = useViewportWidth(Store);
                const height = useViewportHeight(Store);

                return (
                    <div
                        data-testid="container"
                        ref={(node) => {
                            jest.spyOn(node!, "clientHeight", "get").mockImplementation(() => 400);
                            jest.spyOn(node!, "clientWidth", "get").mockImplementation(() => 600);
                            return registerNode(node);
                        }}
                        style={{ width: 600, height: 400 }}
                    >
                        <span data-testid="width">{String(width)}</span>
                        <span data-testid="height">{String(height)}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("600");
            expect(screen.getByTestId("height")).toHaveTextContent("400");
        });

        it("should register Window node and use window dimensions", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 1400,
            });
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 1000,
            });

            const Store = createViewportStore({ node: null });
            const TestComponent = () => {
                const [store, registerNode] = useViewportStorage(Store);
                React.useMemo(() => {
                    registerNode(window);
                }, []);

                return (
                    <div>
                        <span data-testid="width">{String(store.width)}</span>
                        <span data-testid="height">{String(store.height)}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1400");
            expect(screen.getByTestId("height")).toHaveTextContent("1000");
        });

        it("should handle registering null node", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const [store, registerNode] = useViewportStorage(Store);
                React.useMemo(() => {
                    registerNode(null);
                }, []);

                return (
                    <div>
                        <span data-testid="width">{String(store.width)}</span>
                        <span data-testid="height">{String(store.height)}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("null");
            expect(screen.getByTestId("height")).toHaveTextContent("null");
        });

        it("should remove event listener from previous node when switching nodes", () => {
            const Store = createViewportStore({ node: null });
            const customElement1 = document.createElement("div");
            const customElement2 = document.createElement("div");

            const addEventListenerSpy1 = jest.spyOn(customElement1, "addEventListener");
            const removeEventListenerSpy1 = jest.spyOn(customElement1, "removeEventListener");
            const addEventListenerSpy2 = jest.spyOn(customElement2, "addEventListener");

            const TestComponent = () => {
                const [store, registerNode] = useViewportStorage(Store);
                const [currentNode, setCurrentNode] = React.useState(customElement1);

                React.useEffect(() => {
                    registerNode(currentNode);
                }, [registerNode, currentNode]);

                return (
                    <div>
                        <span data-testid="width">{String(store.width)}</span>
                        <button
                            data-testid="switch-node"
                            onClick={() => {
                                setCurrentNode(customElement2);
                            }}
                        >
                            Switch
                        </button>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(addEventListenerSpy1).toHaveBeenCalledWith("resize", expect.any(Function));

            act(() => {
                screen.getByTestId("switch-node").click();
            });

            expect(removeEventListenerSpy1).toHaveBeenCalledWith("resize", expect.any(Function));
            expect(addEventListenerSpy2).toHaveBeenCalledWith("resize", expect.any(Function));

            addEventListenerSpy1.mockRestore();
            removeEventListenerSpy1.mockRestore();
            addEventListenerSpy2.mockRestore();
        });
    });
});
