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

export const useViewportHeight = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    { enabled }: { enabled?: ViewportEnabled<WidthCategories, HeightCategories> } = {},
) => {
    return useStore(ViewportStore, {
        keys: ["height"],
        mutation: (state) => state.height,
        enabled,
    });
};

export const useViewportHeightCompare = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
    Type extends keyof HeightCategories = keyof HeightCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    {
        compareWith,
        type,
        mode = ["equal"],
        enabled,
    }: {
        compareWith: keyof HeightCategories[Type];
        type?: Type;
        mode?: CompareMode[];
        enabled?: ViewportEnabled<WidthCategories, HeightCategories>;
    },
) => {
    const currentType = useMemo(() => {
        return type || (Object.keys(ViewportStore._initial.heightCategories)[0] as Type);
    }, [type]);

    const result = useStore(ViewportStore, {
        keys: ["heightCategories"],
        mutation: ({ heightCategories }) => {
            if (!currentType || !heightCategories) return null;

            return compareBreakpoint(heightCategories[currentType as string], compareWith as string, mode);
        },
        enabled,
    });
    return result;
};

export const useViewportHeightBreakpoint = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
    Type extends keyof HeightCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    { type, enabled }: { type?: Type; enabled?: ViewportEnabled<WidthCategories, HeightCategories> } = {},
) => {
    const currentType = useMemo(() => {
        return type || (Object.keys(ViewportStore._initial.heightCategories)[0] as Type);
    }, [type]);

    return useStore(ViewportStore, {
        keys: ["heightCategories"],
        mutation: ({ heightCategories }, prevStore, prevMutatedStore) => {
            if (!currentType || !heightCategories) return { current: null, lowerBreakpoints: null };

            const heightCategory = heightCategories[currentType as string];

            if (heightCategory?.current === prevMutatedStore?.current) return prevMutatedStore;

            return heightCategory as CategoryCompare<HeightCategories, Type>;
        },
        enabled,
    }) as CategoryCompare<HeightCategories, Type>;
};
