/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "contection";
import React from "react";

import { type DetectViewportType, type ViewportStoreType, type ViewportBreakpoints } from "./types";
import { defaultViewportWidthBreakpoint } from "./constants";
import { calculateCurrentBreakpoint, formatOptions, throttle } from "./utils";

export function createViewportStore<
    BreakpointWidthOptions extends ViewportBreakpoints | undefined = undefined,
    BreakpointHeightOptions extends ViewportBreakpoints | undefined = undefined,
>(settings?: { width?: BreakpointWidthOptions; height?: BreakpointHeightOptions; throttleMs?: number }) {
    const { width, height, throttleMs } = settings ?? {};
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
        },
        {
            lifecycleHooks: {
                storeWillMount: (store, dispatch) => {
                    const onSizeChange = () => {
                        const nodeWidth = window.innerWidth;
                        const nodeHeight = window.innerHeight;
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
                    window.addEventListener("resize", onSizeChangeThrottled);
                    onSizeChangeThrottled();

                    return () => {
                        window.removeEventListener("resize", onSizeChangeThrottled);
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
