import { type ViewportCategories } from "./types";

export const defaultViewportCategories = {
    default: {
        mobile: 0,
        tablet: 600,
        desktop: 1024,
    },
} as const satisfies ViewportCategories;

export const defaultGetNode = () => window;
