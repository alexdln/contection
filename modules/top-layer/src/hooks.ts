import { type StoreInstance } from "contection/dist/types";
import { useStore, useStoreReducer } from "contection";
import { useMemo } from "react";

import { type TopLayerStore, type Dialog, type UpperLayer, TopLayerHookStore } from "./types";

export const useTopLayer = <
    Store extends TopLayerStore,
    Keys extends ("dialogs" | "upperLayers" | "hasActiveIsolatedLayers" | "hasActiveLayers")[],
>(
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">,
    options?: {
        keys?: Keys;
    },
) => {
    const keys = options?.keys ?? ["dialogs", "upperLayers", "hasActiveIsolatedLayers", "hasActiveLayers"];
    const store = useStore(instance, {
        mutation: (store, prevStore, prevMutatedStore) => {
            const newStore = {
                dialogs: keys.includes("dialogs") && Object.values(store).filter((dialog) => dialog.type === "dialog"),
                upperLayers:
                    keys.includes("upperLayers") &&
                    Object.values(store).filter((upperLayer) => upperLayer.type === "upperLayer"),
                hasActiveIsolatedLayers:
                    keys.includes("hasActiveIsolatedLayers") &&
                    Object.values(store).some(
                        ({ checkIsActive, isolated, type, ...layer }) =>
                            isolated &&
                            (type === "dialog" ? checkIsActive(layer as Dialog) : checkIsActive(layer as UpperLayer)),
                    ),
                hasActiveLayers:
                    keys.includes("hasActiveLayers") &&
                    Object.values(store).some(({ checkIsActive, type, ...layer }) =>
                        type === "dialog" ? checkIsActive(layer as Dialog) : checkIsActive(layer as UpperLayer),
                    ),
            } as const;
            const prevMutatedStoreTyped = prevMutatedStore as typeof newStore;
            const isSameStore =
                prevMutatedStoreTyped &&
                keys.length === Object.keys(prevMutatedStoreTyped).length &&
                keys.every((key) => newStore[key] === prevMutatedStoreTyped[key]);

            if (isSameStore) return prevMutatedStoreTyped as Pick<TopLayerHookStore, (typeof keys)[number]>;

            return Object.fromEntries(keys.map((key) => [key, newStore[key]])) as Pick<
                TopLayerHookStore,
                (typeof keys)[number]
            >;
        },
    }) as Pick<TopLayerHookStore, Keys[number]>;

    return store;
};

export const useTopLayerImperative = <Store extends TopLayerStore>(
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">,
) => {
    const [store] = useStoreReducer(instance);
    return useMemo(() => {
        const storeProxy = {
            get dialogs(): Dialog[] {
                return Object.values(store).filter((dialog) => dialog.type === "dialog");
            },
            get upperLayers(): UpperLayer[] {
                return Object.values(store).filter((upperLayer) => upperLayer.type === "upperLayer");
            },
            get hasActiveIsolatedLayers(): boolean {
                return Object.values(store).some(
                    ({ checkIsActive, isolated, type, ...layer }) =>
                        isolated &&
                        (type === "dialog" ? checkIsActive(layer as Dialog) : checkIsActive(layer as UpperLayer)),
                );
            },
            get hasActiveLayers(): boolean {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return Object.values(store).some(({ checkIsActive, isolated, type, ...layer }) =>
                    type === "dialog" ? checkIsActive(layer as Dialog) : checkIsActive(layer as UpperLayer),
                );
            },
        };
        return storeProxy as TopLayerHookStore;
    }, []);
};
