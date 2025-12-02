import { prepareStore } from "contection/prepare-store";
import { ReactRouterCookieAdapter } from "contection-react-router-cookie-adapter";

import { FEEDS } from "@/src/lib/bsky";

export interface Store {
    currentFeed: keyof typeof FEEDS;
}

const feedStoreInitialData: Store = {
    currentFeed: "cat",
};

export const { getStore, initialData, options } = prepareStore(feedStoreInitialData, {
    adapter: new ReactRouterCookieAdapter({
        saveKeys: ["currentFeed"],
        flags: {
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            secure: true,
            sameSite: "strict",
        },
    }),
});
