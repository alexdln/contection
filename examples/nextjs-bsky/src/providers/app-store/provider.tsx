import { AppStore } from "./store";

export interface AppStoreProviderProps {
    children: React.ReactNode;
}

export const AppStoreProvider: React.FC<AppStoreProviderProps> = async ({ children }) => {
    return <AppStore>{children}</AppStore>;
};
