import { createViewportStore } from "contection-viewport";

export const ViewportStore = createViewportStore({
    width: {
        default: {
            mobile: 0,
            tablet: 768,
            desktop: 1024,
            wide: 1440,
        },
        content: {
            narrow: 0,
            medium: 800,
            wide: 1200,
        },
    },
    height: {
        vertical: {
            short: 0,
            medium: 600,
            tall: 900,
        },
    },
    throttleMs: 100,
});
