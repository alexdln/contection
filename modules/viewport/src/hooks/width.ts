import { useStore } from "contection";
import { useMemo } from "react";

import {
    type CompareMode,
    type CategoryCompare,
    type StoreInstance,
    type ViewportCategories,
    type ViewportEnabled,
} from "../core/types";
import { compareBreakpoint } from "../core/utils";

export const useViewportWidth = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    { enabled }: { enabled?: ViewportEnabled<WidthCategories, HeightCategories> } = {},
) => {
    return useStore(ViewportStore, {
        keys: ["width"],
        mutation: (state) => state.width,
        enabled,
    });
};
export const useViewportWidthCompare = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
    Type extends keyof WidthCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    {
        compareWith,
        type,
        mode = ["equal"],
        enabled,
    }: {
        compareWith: keyof WidthCategories[Type];
        type?: Type;
        mode?: CompareMode[];
        enabled?: ViewportEnabled<WidthCategories, HeightCategories>;
    },
) => {
    const currentType = useMemo(() => {
        return type || (Object.keys(ViewportStore._initial.widthCategories)[0] as Type);
    }, [type]);

    const result = useStore(ViewportStore, {
        keys: ["widthCategories"],
        mutation: ({ widthCategories }) => {
            if (!currentType || !widthCategories) return null;

            return compareBreakpoint(widthCategories[currentType], compareWith, mode);
        },
        enabled,
    });
    return result;
};

export const useViewportWidthBreakpoint = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
    Type extends keyof WidthCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    { type, enabled }: { type?: Type; enabled?: ViewportEnabled<WidthCategories, HeightCategories> } = {},
) => {
    const currentType = useMemo(() => {
        return type || (Object.keys(ViewportStore._initial.widthCategories)[0] as Type);
    }, [type]);

    return useStore(ViewportStore, {
        keys: ["widthCategories"],
        mutation: ({ widthCategories }, prevStore, prevMutatedStore) => {
            if (!currentType || !widthCategories) return { current: null, lowerBreakpoints: null };

            if (widthCategories[currentType].current === prevMutatedStore?.current) {
                return prevMutatedStore;
            }
            return widthCategories[currentType];
        },
        enabled,
    }) as CategoryCompare<WidthCategories, Type>;
};
