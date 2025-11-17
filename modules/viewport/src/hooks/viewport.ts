import { useStore, useStoreReducer } from "contection";
import { useMemo } from "react";

import { type StoreInstance, type ViewportCategories } from "../core/types";

export const useViewport = useStore;

export const useViewportStorage = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context">,
) => {
    const [store, setStore, subscribe, unsubscribe] = useStoreReducer(ViewportStore);

    return useMemo(() => {
        const setNode = (node: HTMLElement | Window | null) => {
            setStore({ node });

            return () => {
                setStore({ node: null });
            };
        };
        return [store, setNode, subscribe, unsubscribe] as const;
    }, []);
};
