import { type BaseAdapter, type BaseStore, type GlobalStore, type ValidateNewStore } from "contection";

import { type ReactRouterCookieAdapterProps } from "./types";
import { isCookieAvailable, cookieStorage } from "./utils";

export class ReactRouterCookieAdapter<Store extends BaseStore> implements BaseAdapter<Store> {
    private prefix: Exclude<ReactRouterCookieAdapterProps<Store>["prefix"], undefined>;

    private onDestroy: Exclude<ReactRouterCookieAdapterProps<Store>["onDestroy"], undefined>;

    private rawLimit: Exclude<ReactRouterCookieAdapterProps<Store>["rawLimit"], undefined>;

    private flags: Exclude<ReactRouterCookieAdapterProps<Store>["flags"], undefined>;

    private validate: Exclude<ReactRouterCookieAdapterProps<Store>["validate"], undefined>;

    private saveKeys: ReactRouterCookieAdapterProps<Store>["saveKeys"];

    private autoSync: Exclude<ReactRouterCookieAdapterProps<Store>["autoSync"], undefined>;

    private syncInterval: ReturnType<typeof setInterval> | null = null;

    private cache: { [Key in keyof Store]?: { rawValue: string; value: Store[Key] } } = {};

    private storage: typeof cookieStorage | null = null;

    constructor({
        prefix = "__ctn_",
        onDestroy = "ignore",
        rawLimit = 1024 * 4,
        flags = {},
        validate = null,
        saveKeys,
        autoSync = null,
    }: ReactRouterCookieAdapterProps<Store> = {}) {
        this.prefix = prefix;
        this.onDestroy = onDestroy;
        this.rawLimit = rawLimit;
        this.validate = validate || null;
        this.saveKeys = saveKeys;
        this.autoSync = autoSync;
        this.flags = flags;

        if (isCookieAvailable()) {
            this.storage = cookieStorage;
        }
    }

    private validateData<T>(data: T): boolean {
        if (!this.validate) return true;

        try {
            if (this.validate) {
                const isValid = this.validate(data) as unknown as T;
                return isValid !== false;
            }

            return true;
        } catch {
            return false;
        }
    }

    private async readFromServerStorage(key: keyof Store, request: Request) {
        if (!this.storage || (this.saveKeys && !this.saveKeys.includes(key))) return null;

        const storageKey = this.prefix + String(key);
        const data = await this.storage.getItemServer(storageKey, request);

        if (!data) return null;

        if (this.cache[key] && this.cache[key].rawValue === data.value) return { value: this.cache[key].value };

        try {
            const valueParsed = data.value ? JSON.parse(decodeURIComponent(data.value)) : undefined;
            const isValidData = this.validateData({ [key]: valueParsed });

            if (!isValidData) {
                await this.storage.removeItemServer(storageKey);
                return null;
            }

            this.cache[key] = { rawValue: data.value, value: valueParsed };

            return { value: valueParsed };
        } catch {
            await this.storage.removeItemServer(storageKey);
        }
    }

    private readFromClientStorage(key: keyof Store) {
        if (!this.storage || (this.saveKeys && !this.saveKeys.includes(key))) return null;

        const storageKey = this.prefix + String(key);
        const data = this.storage.getItem(storageKey);

        if (!data) return null;

        if (this.cache[key] && this.cache[key].rawValue === data.value) return { value: this.cache[key].value };

        try {
            const valueParsed = data.value ? JSON.parse(decodeURIComponent(data.value)) : undefined;
            const isValidData = this.validateData({ [key]: valueParsed });

            if (!isValidData) {
                this.storage.removeItem(storageKey, this.flags);
                return null;
            }

            this.cache[key] = { rawValue: data.value, value: valueParsed };

            return { value: valueParsed };
        } catch {
            this.storage.removeItem(storageKey, this.flags);
        }
    }

    async getServerSnapshot(store: Store, request: Request) {
        const keys = (this.saveKeys || Object.keys(store)) as (keyof Store)[];
        const newStore = { ...store };

        if (this.storage) {
            for (const key of keys) {
                const savedValue = await this.readFromServerStorage(key, request);
                if (savedValue) {
                    newStore[key] = savedValue.value;
                }
            }
        }

        return newStore;
    }

    afterInit(store: Store, setStore: GlobalStore<Store>["setStore"]) {
        const keys = (this.saveKeys || Object.keys(store)) as (keyof Store)[];
        const storage = this.storage;

        if (storage && this.autoSync && this.autoSync > 0) {
            this.syncInterval = setInterval(() => {
                for (const key of keys) {
                    const savedValue = this.readFromClientStorage(key);
                    if (savedValue) {
                        setStore({ [key]: savedValue.value } as ValidateNewStore<Store, Partial<Store>>);
                    }
                }
            }, this.autoSync);
        }

        return () => {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
        };
    }

    afterUpdate(store: Store, part: Partial<Store>) {
        if (this.storage) {
            for (const key in part) {
                if (this.saveKeys && !this.saveKeys.includes(key)) continue;

                const rawValue = JSON.stringify(part[key]);
                if (rawValue.length + this.prefix.length + key.length < this.rawLimit) {
                    this.storage.setItem(this.prefix + key, part[key], this.flags);
                    this.cache[key] = { rawValue, value: store[key] };
                }
            }
        }
        return part;
    }

    beforeDestroy(store: Store) {
        if (this.storage && this.onDestroy === "cleanup") {
            for (const key in store) {
                if (this.saveKeys && !this.saveKeys.includes(key as keyof Store)) continue;

                this.storage.removeItem(this.prefix + key, this.flags);
            }
        }

        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        return;
    }
}
