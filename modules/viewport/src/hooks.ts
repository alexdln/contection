import { useStore, useStoreReducer } from "contection";
import { useMemo } from "react";

import { type Option, type StoreInstance, type ViewportBreakpoints, type ViewportEnabled } from "./types";

export const useViewport = useStore;

export const useViewportWidth = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints | undefined,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
    { enabled }: { enabled?: ViewportEnabled<ViewportWidthOptions, ViewportHeightOptions> } = {},
) => {
    return useStore(ViewportStore, {
        keys: ["width"],
        mutation: (state) => state.width,
        enabled,
    });
};
export const useViewportWidthCompare = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints | undefined,
    Type extends keyof ViewportWidthOptions,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
    {
        compareWith,
        type,
        mode = ["equal"],
        enabled,
    }: {
        compareWith: keyof ViewportWidthOptions[Type];
        type?: Type;
        mode?: ("equal" | "greater" | "less")[];
        enabled?: ViewportEnabled<ViewportWidthOptions, ViewportHeightOptions>;
    },
) => {
    const result = useStore(ViewportStore, {
        keys: ["widthOptions"],
        mutation: ({ widthOptions }) => {
            const currentType = type ?? (Object.keys(widthOptions)[0] as Type);
            if (!widthOptions[currentType]?.current || !widthOptions[currentType].lowerBreakpoints) return null;

            const isCurrentBreakpoint = widthOptions[currentType].current === compareWith;
            const isLowerBreakpoint = widthOptions[currentType].lowerBreakpoints.includes(compareWith);
            if (mode.includes("equal") && isCurrentBreakpoint) {
                return true;
            }
            if (mode.includes("greater") && !isCurrentBreakpoint && isLowerBreakpoint) {
                return true;
            }
            if (mode.includes("less") && !isCurrentBreakpoint && !isLowerBreakpoint) {
                return true;
            }
            return false;
        },
        enabled,
    });
    return result;
};

export const useViewportWidthBreakpoint = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints | undefined,
    Type extends keyof ViewportWidthOptions,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
    { type, enabled }: { type?: Type; enabled?: ViewportEnabled<ViewportWidthOptions, ViewportHeightOptions> } = {},
) => {
    return useStore(ViewportStore, {
        keys: ["widthOptions"],
        mutation: (store, prevStore, prevMutatedStore) => {
            const currentType = type ?? (Object.keys(store.widthOptions)[0] as Type);
            if (store?.widthOptions[currentType].current === prevMutatedStore?.current) {
                return prevMutatedStore;
            }
            return store.widthOptions[currentType];
        },
        enabled,
    }) as Option<ViewportWidthOptions, Type>;
};

export const useViewportHeight = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints | undefined,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
    { enabled }: { enabled?: ViewportEnabled<ViewportWidthOptions, ViewportHeightOptions> } = {},
) => {
    return useStore(ViewportStore, {
        keys: ["height"],
        mutation: (state) => state.height,
        enabled,
    });
};

export const useViewportHeightCompare = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints,
    Type extends keyof ViewportHeightOptions = keyof ViewportHeightOptions,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
    {
        compareWith,
        type,
        mode = ["equal"],
        enabled,
    }: {
        compareWith: keyof ViewportHeightOptions[Type];
        type?: Type;
        mode?: ("equal" | "greater" | "less")[];
        enabled?: ViewportEnabled<ViewportWidthOptions, ViewportHeightOptions>;
    },
) => {
    const result = useStore(ViewportStore, {
        keys: ["heightOptions"],
        mutation: ({ heightOptions }) => {
            const currentType = type ?? (Object.keys(heightOptions)[0] as Type);
            const heightOption = (heightOptions as Record<Type, Option<ViewportHeightOptions, Type>>)?.[currentType];
            if (!heightOption?.current || !heightOption.lowerBreakpoints) return null;

            const isCurrentBreakpoint = heightOption.current === compareWith;
            const isLowerBreakpoint = heightOption.lowerBreakpoints.includes(compareWith);
            if (mode.includes("equal") && isCurrentBreakpoint) {
                return true;
            }
            if (mode.includes("greater") && !isCurrentBreakpoint && isLowerBreakpoint) {
                return true;
            }
            if (mode.includes("less") && !isCurrentBreakpoint && !isLowerBreakpoint) {
                return true;
            }
            return false;
        },
        enabled,
    });
    return result;
};

export const useViewportHeightBreakpoint = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints,
    Type extends keyof ViewportHeightOptions,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
    { type, enabled }: { type?: Type; enabled?: ViewportEnabled<ViewportWidthOptions, ViewportHeightOptions> } = {},
) => {
    return useStore(ViewportStore, {
        keys: ["heightOptions"],
        mutation: (store, prevStore, prevMutatedStore) => {
            const currentType = type ?? (Object.keys(store.heightOptions)[0] as Type);
            const heightOption = (store.heightOptions as Record<Type, Option<ViewportHeightOptions, Type>>)?.[
                currentType
            ];
            if (heightOption?.current === prevMutatedStore?.current) {
                return prevMutatedStore;
            }
            return heightOption;
        },
        enabled,
    }) as Option<Exclude<ViewportHeightOptions, undefined>, Type>;
};

export const useViewportStorage = <
    ViewportWidthOptions extends ViewportBreakpoints,
    ViewportHeightOptions extends ViewportBreakpoints | undefined,
>(
    ViewportStore: Pick<StoreInstance<ViewportWidthOptions, ViewportHeightOptions>, "_context">,
) => {
    const [store, , listen, unlisten] = useStoreReducer(ViewportStore);

    return useMemo(() => {
        return [store, listen, unlisten] as const;
    }, []);
};
