import { createStore } from "contection";
import React from "react";

import { type ViewportStore, type ViewportCategories } from "./core/types";
import { defaultViewportCategories, defaultGetNode } from "./core/constants";
import { calculateNewData, formatCategories } from "./core/lib";
import { throttle } from "./core/utils";

export function createViewportStore<
    WidthCategories extends ViewportCategories = typeof defaultViewportCategories,
    HeightCategories extends ViewportCategories = Record<string, never>,
>(configuration?: {
    width?: WidthCategories;
    height?: HeightCategories;
    throttleMs?: number;
    node?: (() => HTMLElement | Window | null) | null;
}) {
    const {
        width: widthCategories = defaultViewportCategories,
        height: heightCategories = {},
        throttleMs,
        node: getNode = defaultGetNode,
    } = configuration ?? {};

    const { formattedCategories: formattedWidthCategories, currentCategories: currentWidthCategories } =
        formatCategories(widthCategories);
    const { formattedCategories: formattedHeightCategories, currentCategories: currentHeightCategories } =
        formatCategories(heightCategories);

    const Store = createStore<ViewportStore<WidthCategories, HeightCategories>>(
        {
            width: null,
            height: null,
            widthCategories: currentWidthCategories,
            heightCategories: currentHeightCategories,
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
                                widthCategories: currentWidthCategories,
                                heightCategories: currentHeightCategories,
                                node: undefined,
                            });
                        }

                        const dispatchedData = calculateNewData(
                            node,
                            store,
                            formattedWidthCategories,
                            formattedHeightCategories,
                        );
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
