import { createStore } from "contection";
import { StorageAdapter } from "contection-storage-adapter";

interface AppStore {
    user: {
        name: string;
        email: string;
    };
    counter: number;
    theme: string;
    notifications: Array<{ id: string; message: string; type: "info" | "success" | "warning" | "error" }>;
    settings: {
        language: string;
        timezone: string;
    };
    tab: "contection" | "viewport" | "top-layer" | "combined" | "todo";
}

export const initialState: AppStore = {
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
};

export const AppStore = createStore<AppStore>(initialState, {
    adapter: new StorageAdapter<AppStore>({
        prefix: "app-store-",
        enabled: "always",
        storage: "localStorage",
        autoSync: 300,
    }),
});
