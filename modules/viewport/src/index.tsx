/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "contection";
import React from "react";

import { type DetectViewportType, type ViewportStoreType, type ViewportBreakpoints } from "./types";
import { defaultViewportWidthBreakpoint } from "./constants";
import { calculateCurrentBreakpoint, defaultGetNode, formatOptions, throttle } from "./utils";

export function createViewportStore<
    BreakpointWidthOptions extends ViewportBreakpoints | undefined = undefined,
    BreakpointHeightOptions extends ViewportBreakpoints | undefined = undefined,
>(settings?: {
    width?: BreakpointWidthOptions;
    height?: BreakpointHeightOptions;
    throttleMs?: number;
    node?: (() => HTMLElement | Window | null) | null;
}) {
    const { width, height, throttleMs, node: getNode = defaultGetNode } = settings ?? {};
    const { formattedOptions: formattedWidthOptions, currentOptions: widthOptions } = formatOptions(
        width ?? { default: defaultViewportWidthBreakpoint },
    );
    const { formattedOptions: formattedHeightOptions, currentOptions: heightOptions } = height
        ? formatOptions(height)
        : { formattedOptions: undefined, currentOptions: undefined };

    const Store = createStore<
        ViewportStoreType<
            DetectViewportType<BreakpointWidthOptions, { default: typeof defaultViewportWidthBreakpoint }>,
            DetectViewportType<BreakpointHeightOptions, undefined>
        >
    >(
        {
            width: null,
            height: null,
            widthOptions,
            heightOptions,
            mounted: false,
            node: undefined,
        },
        {
            lifecycleHooks: {
                storeWillMount: (store, dispatch, listen) => {
                    let node: HTMLElement | Window | null = null;
                    if (store.node) {
                        node = store.node;
                    } else if (typeof getNode === "function") {
                        node = getNode();
                    }

                    const onSizeChange = () => {
                        if (!node) {
                            return dispatch({
                                width: null,
                                height: null,
                                widthOptions,
                                heightOptions,
                                mounted: false,
                                node: undefined,
                            });
                        }

                        const nodeWidth = node instanceof Window ? node.innerWidth : node.clientWidth;
                        const nodeHeight = node instanceof Window ? node.innerHeight : node.clientHeight;
                        const dispatchedData: any = {};
                        if (store.width !== nodeWidth) {
                            dispatchedData.width = nodeWidth;
                            const newWidthOptions = calculateCurrentBreakpoint(nodeWidth, formattedWidthOptions);
                            let widthOptionsChanged = false;
                            Object.entries(store.widthOptions).forEach(([key, value]) => {
                                if (newWidthOptions[key].current === value.current) newWidthOptions[key] = value;
                                else widthOptionsChanged = true;
                            });
                            if (widthOptionsChanged) dispatchedData.widthOptions = newWidthOptions;
                        }
                        if (store.height !== nodeHeight) {
                            dispatchedData.height = nodeHeight;
                            if (formattedHeightOptions && store.heightOptions) {
                                const newHeightOptions = calculateCurrentBreakpoint(nodeHeight, formattedHeightOptions);
                                let heightOptionsChanged = false;
                                Object.entries(store.heightOptions).forEach(([key, value]) => {
                                    if (newHeightOptions[key].current === value.current) newHeightOptions[key] = value;
                                    else heightOptionsChanged = true;
                                });
                                if (heightOptionsChanged) dispatchedData.heightOptions = newHeightOptions;
                            }
                        }
                        dispatch(dispatchedData);
                    };
                    const onSizeChangeThrottled = throttleMs ? throttle(onSizeChange, throttleMs) : onSizeChange;

                    node?.addEventListener("resize", onSizeChangeThrottled);
                    onSizeChangeThrottled();

                    const unlisten = listen("node", (newNode) => {
                        node?.removeEventListener("resize", onSizeChangeThrottled);
                        node = newNode || null;
                        node?.addEventListener("resize", onSizeChangeThrottled);
                        onSizeChangeThrottled();
                    });

                    return () => {
                        unlisten();
                        node?.removeEventListener("resize", onSizeChangeThrottled);
                    };
                },
                storeDidMount: (_data, dispatch) => {
                    dispatch({ mounted: true });

                    return () => {
                        dispatch({ mounted: false });
                    };
                },
            },
        },
    );

    const { $$typeof, Consumer, _context, _initial } = Store;

    const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <Store.Provider>{children}</Store.Provider>
    );

    return Object.assign(Provider, { $$typeof, Provider, Consumer, _context, _initial });
}

export * from "./hooks";
