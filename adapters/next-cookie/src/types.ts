import { type BaseStore } from "contection";

export type CookieFlags = {
    path?: string;
    domain?: string;
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
};

export type StorageAdapterProps<Store extends BaseStore = BaseStore> = {
    prefix?: string;
    onDestroy?: "cleanup" | "ignore";
    rawLimit?: number;
    flags?: CookieFlags;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate?: null | ((data: any) => boolean | null | never | undefined);
    saveKeys?: (keyof Store)[];
    autoSync?: number | null;
};
