import {
    type CompareMode,
    type CategoryCompare,
    type StoreInstance,
    type ViewportCategories,
    type ViewportEnabled,
} from "../core/types";

export type UseViewportParam = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    options?: { enabled?: ViewportEnabled<WidthCategories, HeightCategories> },
) => number | null;

export type UseViewportParamCompare = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
    Type extends keyof WidthCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    {
        compareWith,
        type,
        mode,
        enabled,
    }: {
        compareWith: keyof WidthCategories[Type];
        type?: Type;
        mode?: CompareMode[];
        enabled?: ViewportEnabled<WidthCategories, HeightCategories>;
    },
) => boolean | null;

export type UseViewportParamBreakpoint = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
    Type extends keyof WidthCategories,
>(
    ViewportStore: Pick<StoreInstance<WidthCategories, HeightCategories>, "_context" | "_initial">,
    { type, enabled }: { type?: Type; enabled?: ViewportEnabled<WidthCategories, HeightCategories> },
) => CategoryCompare<WidthCategories, Type>;
