/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";

import { type StoreInstance, type BaseStore, type GlobalStore, type MutationFn } from "./types";

/**
 * Hook that returns a tuple containing the store state and dispatch functions, similar to `useReducer`.
 * Unlike `useStore`, the store returned from `useStoreReducer` does not trigger re-renders when it changes,
 * making it useful for reading values in handlers or effects.
 * @template Store - The store type
 * @param store - The store instance
 * @returns A tuple `[store, dispatch, listen, unlisten]`
 * @example
 * const [store, dispatch, listen, unlisten] = useStoreReducer(Store);
 * // ...
 * useEffect(() => {
 *   return listen("count", (count) => {
 *     console.log(count);
 *   });
 * }, []);
 * const sendAnalyticsEvent = useCallback(() => {
 *   sendAnalyticsEvent("user_action", { userId: store.user.id });
 * }, []);
 * // ...
 * <button onClick={() => dispatch((prev) => ({ count: prev.count + 1 }))}>Increment</button>
 */
export const useStoreReducer = <Store extends BaseStore>(store: Pick<StoreInstance<Store>, "_context">) => {
    const data = useContext<GlobalStore<Store>>(store._context);
    return useMemo(() => [data.store, data.update, data.listen, data.unlisten] as const, [data]);
};

/**
 * Hook that subscribes to store state with optional key filtering and computed value derivation.
 * Component re-renders only when subscribed keys change (or when mutation result changes).
 * @template Store - The store type
 * @template Keys - Array of store keys to subscribe to
 * @template Mutation - Mutation function that transforms the subscribed state
 * @param instance - The store instance
 * @param options - The options for the store subscription
 * @param options.keys - The keys to subscribe to
 * @param options.mutation - The mutation function to apply to the subscribed state, if provided, the hook will return the result of the mutation function
 * @returns The subscribed store state
 * @example
 * const store = useStore(Store);
 * const headerStore = useStore(Store, { keys: ["user", "project"] });
 * const doubledCount = useStore(Store, { keys: ["count"], mutation: (store) => store.count * 2 });
 */
export function useStore<
    Store extends BaseStore = BaseStore,
    ResultType = unknown,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(
    instance: Pick<StoreInstance<Store>, "_context">,
    options: { keys?: Keys; mutation: MutationFn<Store, Keys, ResultType> },
): ResultType;
export function useStore<
    Store extends BaseStore = BaseStore,
    ResultType = unknown,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(
    instance: Pick<StoreInstance<Store>, "_context">,
    options?: { keys?: Keys; mutation?: undefined },
): Pick<Store, Keys[number]>;
export function useStore<
    Store extends BaseStore = BaseStore,
    ResultType = unknown,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(
    instance: Pick<StoreInstance<Store>, "_context">,
    { keys, mutation }: { keys?: Keys; mutation?: MutationFn<Store, Keys, ResultType> } = {},
): ResultType {
    const [store, , listen] = useStoreReducer<Store>(instance);
    const storeKeys = keys || (Object.keys(store) as unknown as Keys);
    const prevStore = useRef<Store | undefined>(
        Object.fromEntries(storeKeys.map((key) => [key, store[key as keyof Store]])) as Store,
    );
    const prevMutatedStore = useRef<ResultType | undefined>(mutation ? mutation(store) : undefined);

    const getSnapshot = useCallback(() => {
        const newStore = Object.fromEntries(storeKeys.map((key) => [key, store[key as keyof Store]])) as Store;

        const isStoreEqual = Object.entries(newStore).every(
            ([key, value]) => value === prevStore.current?.[key as keyof Store],
        );

        if (mutation && prevStore.current && prevMutatedStore.current && isStoreEqual) return prevMutatedStore.current;

        if (!mutation && prevStore.current && isStoreEqual) return prevStore.current;

        prevStore.current = newStore;

        if (mutation) {
            const mutatedData = mutation(newStore, prevStore.current, prevMutatedStore.current);
            prevMutatedStore.current = mutatedData;
            return mutatedData;
        }

        return newStore;
    }, []);

    const data = useSyncExternalStore(
        (onStoreChange: () => void) => {
            const unlistens = storeKeys.map((key) => listen<Store[typeof key], typeof key>(key, onStoreChange));

            return () => {
                unlistens.forEach((unlisten) => unlisten());
            };
        },
        getSnapshot,
        getSnapshot,
    );
    return data as ResultType;
}
