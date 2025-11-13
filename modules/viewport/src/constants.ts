import { type ViewportBreakpoint } from "./types";

export const defaultViewportWidthBreakpoint = {
    mobile: 0,
    tablet: 600,
    desktop: 1024,
} as const satisfies ViewportBreakpoint;
