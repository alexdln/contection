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
                const store = useViewport(Store, { keys: ["widthOptions"] });
                const breakpoint = store.widthOptions.base;
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

        it("should return null when widthOptions is not available", () => {
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
        it("should return store, listen, and unlisten functions", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const [store, listen, unlisten] = useViewportStorage(Store);
                return (
                    <div>
                        <span data-testid="width">{String(store.width)}</span>
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
            expect(screen.getByTestId("has-listen")).toHaveTextContent("true");
            expect(screen.getByTestId("has-unlisten")).toHaveTextContent("true");
        });
    });
});
