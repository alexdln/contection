import { type CategoryCompare, type ViewportStore, type ViewportCategories } from "./types";

export const formatCategories = <Categories extends ViewportCategories>(categories: Categories) => {
    const formattedCategories = Object.entries(categories).map(([category, breakpoints]) => {
        return [
            category,
            Object.entries(breakpoints)
                .map(([breakpoint, size]) => {
                    return [breakpoint, size] as [keyof Categories[string], number];
                })
                .sort((a, b) => ((a[1] as number | null) || 0) - ((b[1] as number | null) || 0)),
        ] as const;
    });

    const currentCategories = Object.fromEntries(
        formattedCategories.map(([category]) => [category, { lowerBreakpoints: null, current: null }]),
    ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    return {
        formattedCategories,
        currentCategories,
    };
};

export const calculateCurrentCategories = <Categories extends ViewportCategories>(
    currentSize: number,
    formattedCategories: ReturnType<typeof formatCategories<Categories>>["formattedCategories"],
) => {
    const currentCategories = Object.fromEntries(
        formattedCategories.map(([category]) => [category, { lowerBreakpoints: null, current: null }]) as [
            string,
            { lowerBreakpoints: (keyof Categories[string])[] | null; current: keyof Categories[string] | null },
        ][],
    );
    for (const [category, categories] of formattedCategories) {
        const passedBreakpoints: (keyof Categories[string])[] = [];
        for (const [breakpoint, size] of categories) {
            if (currentSize < size) break;
            passedBreakpoints.push(breakpoint);
        }

        const currentBreakpoint = passedBreakpoints.pop();
        if (currentBreakpoint) {
            currentCategories[category] = {
                lowerBreakpoints: passedBreakpoints,
                current: currentBreakpoint,
            };
        }
    }

    return currentCategories as {
        [Category in keyof Categories]: {
            lowerBreakpoints: (keyof Categories[Category])[] | null;
            current: keyof Categories[Category] | null;
        };
    };
};

const calculateNewCategories = <Categories extends ViewportCategories>(
    nodeSize: number,
    formattedCategories: ReturnType<typeof formatCategories>["formattedCategories"],
    storeCategories: { [Category in keyof Categories]: CategoryCompare<Categories, Category> },
) => {
    const newCategories = calculateCurrentCategories<Categories>(nodeSize, formattedCategories);
    let categoriesChanged = false;
    Object.entries(storeCategories).forEach(([key, value]) => {
        if (newCategories[key].current === value.current) newCategories[key as keyof Categories] = value;
        else categoriesChanged = true;
    });

    if (categoriesChanged) return newCategories;
    return null;
};

export const calculateNewData = <
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
>(
    node: HTMLElement | Window,
    store: ViewportStore<WidthCategories, HeightCategories>,
    formattedWidthCategories: ReturnType<typeof formatCategories<WidthCategories>>["formattedCategories"],
    formattedHeightCategories: ReturnType<typeof formatCategories<HeightCategories>>["formattedCategories"],
) => {
    const nodeWidth = node instanceof Window ? node.innerWidth : node.clientWidth;
    const nodeHeight = node instanceof Window ? node.innerHeight : node.clientHeight;
    const dispatchedData: Partial<ViewportStore<WidthCategories, HeightCategories>> = {};
    if (store.width !== nodeWidth) {
        dispatchedData.width = nodeWidth;
        const newWidthCategories = calculateNewCategories<WidthCategories>(
            nodeWidth,
            formattedWidthCategories,
            store.widthCategories,
        );
        if (newWidthCategories) dispatchedData.widthCategories = newWidthCategories;
    }
    if (store.height !== nodeHeight) {
        dispatchedData.height = nodeHeight;
        if (formattedHeightCategories && store.heightCategories) {
            const newHeightCategories = calculateNewCategories<HeightCategories>(
                nodeHeight,
                formattedHeightCategories,
                store.heightCategories,
            );
            if (newHeightCategories) dispatchedData.heightCategories = newHeightCategories;
        }
    }
    return dispatchedData as ViewportStore<WidthCategories, HeightCategories>;
};
