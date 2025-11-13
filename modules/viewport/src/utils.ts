import { type ViewportBreakpoints } from "./types";

export const formatOptions = <BreakpointOptions extends ViewportBreakpoints>(breakpoints: BreakpointOptions) => {
    const formattedOptions = Object.entries(breakpoints).map(([option, breakpoints]) => {
        return [
            option,
            Object.entries(breakpoints)
                .map(([name, size]) => {
                    return [name, size] as [keyof BreakpointOptions[string], number];
                })
                .sort((a, b) => ((a[1] as number | null) || 0) - ((b[1] as number | null) || 0)),
        ] as const;
    });

    const currentOptions = Object.fromEntries(
        formattedOptions.map(([option]) => [option, { lowerBreakpoints: null, current: null }]),
    ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    return {
        formattedOptions,
        currentOptions,
    };
};

export const calculateCurrentBreakpoint = <BreakpointOptions extends ViewportBreakpoints>(
    parameter: number,
    formattedOptions: ReturnType<typeof formatOptions<BreakpointOptions>>["formattedOptions"],
) => {
    const currentOptions: {
        [key: string]: {
            lowerBreakpoints: string[] | null;
            current: string | null;
        };
    } = Object.fromEntries(formattedOptions.map(([key]) => [key, { lowerBreakpoints: null, current: null }]));
    for (const [option, breakpoints] of formattedOptions) {
        const passedBreakpoints: string[] = [];
        for (const [name, size] of breakpoints) {
            if (parameter < size) break;
            passedBreakpoints.push(name as string);
        }

        const currentBreakpoint = passedBreakpoints.pop() as string;
        currentOptions[option as string] = {
            lowerBreakpoints: passedBreakpoints,
            current: currentBreakpoint,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return currentOptions as any;
};

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
