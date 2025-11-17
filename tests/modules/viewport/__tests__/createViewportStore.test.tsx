import { createViewportStore } from "contection-viewport";
import { useStore } from "contection";
import React from "react";

import { render, screen, act } from "@src/setup/test-utils";

describe("createViewportStore", () => {
    describe("basic store creation", () => {
        it("should have all required properties", () => {
            const Store = createViewportStore();
            expect(Store).toHaveProperty("_initial");
            expect(Store).toHaveProperty("_context");
            expect(Store).toHaveProperty("Provider");
            expect(Store).toHaveProperty("Consumer");
            expect(Store).toHaveProperty("$$typeof");
        });

        it("should create a store with default breakpoints when no options provided", () => {
            const Store = createViewportStore();
            expect(Store._initial.width).toBeNull();
            expect(Store._initial.height).toBeNull();
            expect(Store._initial.widthCategories).toBeDefined();
            expect(Store._initial.widthCategories.default).toBeDefined();
        });

        it("should create a store with custom width breakpoints", () => {
            const Store = createViewportStore({
                width: {
                    base: {
                        mobile: 0,
                        tablet: 600,
                        desktop: 1024,
                    },
                },
            });

            expect(Store._initial.widthCategories).toBeDefined();
            expect(Store._initial.widthCategories.base).toBeDefined();
            expect(Store._initial.heightCategories).toMatchObject({});
        });

        it("should create a store with custom height breakpoints", () => {
            const Store = createViewportStore({
                height: {
                    base: {
                        small: 0,
                        medium: 400,
                        large: 800,
                    },
                },
            });

            expect(Store._initial.widthCategories).toBeDefined();
            expect(Store._initial.widthCategories.default).toBeDefined();
            expect(Store._initial.heightCategories).toBeDefined();
            expect(Store._initial.heightCategories.base).toBeDefined();
        });

        it("should create a store with both width and height breakpoints", () => {
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

            expect(Store._initial.widthCategories).toBeDefined();
            expect(Store._initial.widthCategories.base).toBeDefined();
            // @ts-expect-error - default is not defined
            expect(Store._initial.widthCategories.default).not.toBeDefined();
            expect(Store._initial.heightCategories).toBeDefined();
            expect(Store._initial.heightCategories.base).toBeDefined();
            // @ts-expect-error - default is not defined
            expect(Store._initial.heightCategories.default).not.toBeDefined();
        });

        it("should allow Provider to be called as component", () => {
            const Store = createViewportStore();
            const TestComponent = () => (
                <Store.Provider>
                    <div>Test</div>
                </Store.Provider>
            );
            expect(TestComponent).toBeDefined();
        });

        it("should allow store to be called as component (same as Provider)", () => {
            const Store = createViewportStore();
            const TestComponent = () => (
                <Store>
                    <div>Test</div>
                </Store>
            );
            expect(TestComponent).toBeDefined();
        });
    });

    describe("viewport dimensions initialization", () => {
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

        it("should initialize with current window dimensions", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width", "height"] });
                return (
                    <div>
                        <span data-testid="width">{viewport.width}</span>
                        <span data-testid="height">{viewport.height}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
            expect(screen.getByTestId("height")).toHaveTextContent("768");
        });

        it("should update dimensions on window resize", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width", "height"] });
                return (
                    <div>
                        <span data-testid="width">{viewport.width}</span>
                        <span data-testid="height">{viewport.height}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
            expect(screen.getByTestId("height")).toHaveTextContent("768");

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

            expect(screen.getByTestId("width")).toHaveTextContent("800");
            expect(screen.getByTestId("height")).toHaveTextContent("600");
        });
    });

    describe("breakpoint calculation", () => {
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

        it("should calculate correct breakpoints for default width breakpoints", () => {
            const Store = createViewportStore();
            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["widthCategories"] });
                return (
                    <div>
                        <span data-testid="current">{viewport.widthCategories?.default?.current || "null"}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("desktop");
        });

        it("should calculate correct breakpoints for custom width breakpoints", () => {
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
                const viewport = useStore(Store, { keys: ["widthCategories"] });
                return (
                    <div>
                        <span data-testid="current">{viewport.widthCategories?.base?.current || "null"}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("desktop");
        });

        it("should calculate correct breakpoints for height breakpoints", () => {
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
                const viewport = useStore(Store, { keys: ["heightCategories"] });
                return (
                    <div>
                        <span data-testid="current">{viewport.heightCategories?.base?.current || "null"}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("current")).toHaveTextContent("medium");
        });
    });

    describe("event listener cleanup", () => {
        beforeEach(() => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });
        });

        it("should remove resize event listener on unmount", () => {
            const addEventListenerSpy = jest.spyOn(window, "addEventListener");
            const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

            const Store = createViewportStore();
            const TestComponent = () => <div>Test</div>;

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
            act(() => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: 768,
                });
                window.dispatchEvent(new Event("resize"));
            });

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });

    describe("multiple breakpoint groups", () => {
        beforeEach(() => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 800,
            });
        });

        it("should handle multiple width breakpoint groups", () => {
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

            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["widthCategories"] });

                return (
                    <div>
                        <span data-testid="base-current">{viewport.widthCategories?.base?.current || "null"}</span>
                        <span data-testid="custom-current">{viewport.widthCategories?.custom?.current || "null"}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("base-current")).toHaveTextContent("tablet");
            expect(screen.getByTestId("custom-current")).toHaveTextContent("medium");
        });
    });

    describe("Consumer component", () => {
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

        it("should work with Consumer render props pattern", () => {
            const Store = createViewportStore();
            const TestComponent = () => (
                <Store.Consumer>
                    {(viewport) => (
                        <div>
                            <span data-testid="width">{viewport.width}</span>
                            <span data-testid="height">{viewport.height}</span>
                        </div>
                    )}
                </Store.Consumer>
            );

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1024");
            expect(screen.getByTestId("height")).toHaveTextContent("768");
        });
    });

    describe("node option", () => {
        it("should use custom HTMLElement node when provided", () => {
            const customElement = document.createElement("div");
            Object.defineProperty(customElement, "clientWidth", {
                writable: true,
                configurable: true,
                value: 500,
            });
            Object.defineProperty(customElement, "clientHeight", {
                writable: true,
                configurable: true,
                value: 300,
            });

            const Store = createViewportStore({
                node: () => customElement,
            });

            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width", "height"] });
                return (
                    <div>
                        <span data-testid="width">{viewport.width}</span>
                        <span data-testid="height">{viewport.height}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("500");
            expect(screen.getByTestId("height")).toHaveTextContent("300");
        });

        it("should use Window node when node function returns window", () => {
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 1200,
            });
            Object.defineProperty(window, "innerHeight", {
                writable: true,
                configurable: true,
                value: 900,
            });

            const Store = createViewportStore({
                node: () => window,
            });

            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width", "height"] });
                return (
                    <div>
                        <span data-testid="width">{viewport.width}</span>
                        <span data-testid="height">{viewport.height}</span>
                    </div>
                );
            };

            render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("width")).toHaveTextContent("1200");
            expect(screen.getByTestId("height")).toHaveTextContent("900");
        });

        it("should handle node function returning null", () => {
            const Store = createViewportStore({
                node: () => null,
            });

            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width", "height"] });
                return (
                    <div>
                        <span data-testid="width">{String(viewport.width)}</span>
                        <span data-testid="height">{String(viewport.height)}</span>
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

        it("should handle node option set to null", () => {
            const Store = createViewportStore({
                node: null,
            });

            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width", "height"] });
                return (
                    <div>
                        <span data-testid="width">{String(viewport.width)}</span>
                        <span data-testid="height">{String(viewport.height)}</span>
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

        it("should add event listener to custom node on mount", () => {
            const customElement = document.createElement("div");
            Object.defineProperty(customElement, "clientWidth", {
                writable: true,
                configurable: true,
                value: 500,
            });

            const addEventListenerSpy = jest.spyOn(customElement, "addEventListener");
            const removeEventListenerSpy = jest.spyOn(customElement, "removeEventListener");

            const Store = createViewportStore({
                node: () => customElement,
            });

            const TestComponent = () => {
                const viewport = useStore(Store, { keys: ["width"] });
                return <span data-testid="width">{viewport.width}</span>;
            };

            const { unmount } = render(
                <Store.Provider>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });
});
