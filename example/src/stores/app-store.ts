import { createStore } from "contection";

export const AppStore = createStore(
    {
        user: {
            name: "John Doe",
            email: "john@example.com",
        },
        counter: 0,
        theme: "light",
        notifications: [] as Array<{ id: string; message: string; type: "info" | "success" | "warning" | "error" }>,
        settings: {
            language: "en",
            timezone: "UTC",
        },
        tab: "contection",
    },
    {
        lifecycleHooks: {
            storeWillMount: (_store, setStore) => {
                const TABS = ["contection", "viewport", "top-layer", "combined", "todo"] as const;
                type Tab = (typeof TABS)[number];
                const savedTab = new URLSearchParams(window.location.search).get("tab") as Tab;
                setStore({ tab: TABS.includes(savedTab) ? savedTab : "contection" });
            },
        },
    },
);
