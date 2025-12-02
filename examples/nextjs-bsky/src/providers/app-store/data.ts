import { prepareStore } from "contection/prepare-store";
import { StorageAdapter } from "contection-storage-adapter";

export interface Store {
    theme: "light" | "dark" | "system";
}

const appStoreInitialData: Store = {
    theme: "system",
};

export const { getStore, initialData, options } = prepareStore(appStoreInitialData, {
    adapter: new StorageAdapter(),
    lifecycleHooks: {
        storeWillMount: (store, dispatch, listen) => {
            return listen("theme", (theme) => {
                if (theme === "system") {
                    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                    document.documentElement.setAttribute("data-theme", systemTheme);
                } else {
                    document.documentElement.setAttribute("data-theme", theme);
                }
                document.documentElement.setAttribute("data-theme-mode", theme);
            });
        },
    },
});
