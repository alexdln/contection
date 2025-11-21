const localStorageAdapter = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key),
    clear: () => localStorage.clear(),
    get length() {
        return localStorage.length;
    },
    key: (index: number) => localStorage.key(index),
} as typeof localStorage;

const sessionStorageAdapter = {
    getItem: (key: string) => sessionStorage.getItem(key),
    setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
    removeItem: (key: string) => sessionStorage.removeItem(key),
    clear: () => sessionStorage.clear(),
    get length() {
        return sessionStorage.length;
    },
    key: (index: number) => sessionStorage.key(index),
} as typeof sessionStorage;

export const STORAGE_TYPES = {
    localStorage: localStorageAdapter,
    sessionStorage: sessionStorageAdapter,
} as const;
