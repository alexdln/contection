/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { type StoreInstance, type BaseStore, type GlobalStore, type MutationFn, ListenOptions } from "./types";

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
 * @param options.enabled - The condition to subscribe to the store. The hook will only subscribe to the store if the condition is true
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
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">,
    options: { keys?: Keys; mutation: MutationFn<Store, Keys, ResultType>; enabled?: ListenOptions<Store>["enabled"] },
): ResultType;
export function useStore<
    Store extends BaseStore = BaseStore,
    ResultType = unknown,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">,
    options?: { keys?: Keys; mutation?: undefined; enabled?: ListenOptions<Store>["enabled"] },
): Pick<Store, Keys[number]>;
export function useStore<
    Store extends BaseStore = BaseStore,
    ResultType = unknown,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">,
    {
        keys,
        mutation,
        enabled = "always",
    }: { keys?: Keys; mutation?: MutationFn<Store, Keys, ResultType>; enabled?: ListenOptions<Store>["enabled"] } = {},
): ResultType {
    const [store, , listen] = useStoreReducer<Store>(instance);
    const mounted = useRef(false);
    const internalListen = useRef<(() => void) | undefined>(undefined);
    const storeKeys = useMemo(() => keys || (Object.keys(store) as unknown as Keys), [keys]);
    const prevStore = useRef<Store>(
        Object.fromEntries(storeKeys.map((key) => [key, instance._initial[key as keyof Store]])) as Store,
    );
    const prevMutatedStore = useRef<ResultType | undefined>(
        mutation ? mutation(prevStore.current as Store) : undefined,
    );

    const getSnapshot = useCallback(() => {
        let disabled = false;
        if (enabled === "always") disabled = false;
        else if (enabled === "after-hydration") disabled = !mounted.current;
        else if (typeof enabled === "function") disabled = !enabled(store);
        else if (enabled === "never") disabled = true;

        if (disabled) {
            if (mutation) return prevMutatedStore.current;
            return prevStore.current;
        }
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
    }, [storeKeys]);

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const unlistens = storeKeys.map((key) =>
                listen<Store[typeof key], typeof key>(key, onStoreChange, { enabled }),
            );
            internalListen.current = onStoreChange;

            return () => {
                unlistens.forEach((unlisten) => unlisten());
                internalListen.current = undefined;
            };
        },
        [storeKeys, enabled],
    );

    // We listen to the mount state at the component level to avoid prematurely updating new components,
    // especially for PPR or suspense
    useEffect(() => {
        mounted.current = true;
        internalListen.current?.();
    }, [enabled === "after-hydration"]);

    const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return data as ResultType;
}
