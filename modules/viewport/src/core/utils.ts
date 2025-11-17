import { type CategoryCompare, type CompareMode, type ViewportCategories } from "./types";

export const throttle = <Callback extends (...args: unknown[]) => unknown>(
    callback: Callback,
    delay: number,
): ((...args: Parameters<Callback>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastExecTime = 0;

    return function throttled(...args: Parameters<Callback>) {
        const currentTime = Date.now();

        if (timeoutId) clearTimeout(timeoutId);

        if (currentTime - lastExecTime >= delay) {
            callback(...args);
            lastExecTime = currentTime;
            timeoutId = null;
        } else {
            timeoutId = setTimeout(
                () => {
                    callback(...args);
                    lastExecTime = Date.now();
                    timeoutId = null;
                },
                delay - (currentTime - lastExecTime),
            );
        }
    };
};

export const compareBreakpoint = <Categories extends ViewportCategories, Type extends keyof Categories>(
    category: CategoryCompare<Categories, Type> | undefined,
    compareWith: keyof Categories[Type],
    mode: CompareMode[],
) => {
    if (!category || !category.current || !category.lowerBreakpoints) return null;

    const isCurrentBreakpoint = category.current === compareWith;
    const isLowerBreakpoint = category.lowerBreakpoints?.includes(compareWith);
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
};
