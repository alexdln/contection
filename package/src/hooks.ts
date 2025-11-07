/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";

import { type StoreInstance, type BaseStore, type GlobalStore } from "./types";

export const useStoreReducer = <Store extends BaseStore>(store: Pick<StoreInstance<Store>, "_context">) => {
    const data = useContext<GlobalStore<Store>>(store._context);
    return useMemo(() => [data.store, data.update, data.listen, data.unlisten] as const, [data]);
};

export function useStore<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[],
    Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown,
    ResultType = ReturnType<Mutation>,
>(instance: Pick<StoreInstance<Store>, "_context">, options: { keys: Keys; mutation: Mutation }): ReturnType<Mutation>;
export function useStore<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[],
    Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown,
    ResultType = ReturnType<Mutation>,
>(
    instance: Pick<StoreInstance<Store>, "_context">,
    options: { keys?: undefined; mutation: Mutation },
): ReturnType<Mutation>;
export function useStore<Store extends BaseStore, Keys extends Extract<keyof Store, string>[]>(
    instance: Pick<StoreInstance<Store>, "_context">,
    options: { keys: Keys; mutation?: undefined },
): Pick<Store, Keys[number]>;
export function useStore<Store extends BaseStore>(
    instance: Pick<StoreInstance<Store>, "_context">,
    options?: { keys?: undefined; mutation?: undefined },
): Store;
export function useStore<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[],
    Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: unknown) => unknown,
    ResultType = ReturnType<Mutation>,
>(
    instance: Pick<StoreInstance<Store>, "_context">,
    { keys, mutation }: { keys?: Keys; mutation?: Mutation } = {},
): ResultType {
    const [store, , listen] = useStoreReducer<Store>(instance);
    const prevStore = useRef<Store | null>(
        keys ? (Object.fromEntries(keys.map((key) => [key, store[key as keyof Store]])) as Store) : store,
    );
    const prevMutatedStore = useRef<ResultType | null | unknown>(mutation ? mutation(store, null) : null);

    const getSnapshot = useCallback(() => {
        const newStore = keys
            ? (Object.fromEntries(keys.map((key) => [key, store[key as keyof Store]])) as Store)
            : store;

        if (
            mutation &&
            prevStore.current &&
            Object.entries(newStore).every(([key, value]) => value === prevStore.current?.[key as keyof Store])
        )
            return prevMutatedStore.current;

        prevStore.current = newStore;

        if (mutation) {
            const mutatedData = mutation(newStore, prevStore.current);
            prevMutatedStore.current = mutatedData;
            return mutatedData;
        }

        return newStore;
    }, []);

    const data = useSyncExternalStore(
        (onStoreChange: () => void) => {
            const unlistens = (keys || (Object.keys(store) as unknown as Keys)).map((key) =>
                listen<Store[typeof key], typeof key>(key, onStoreChange),
            );

            return () => {
                unlistens.forEach((unlisten) => unlisten());
            };
        },
        getSnapshot,
        getSnapshot,
    );
    return data as ResultType;
}
