"use client";

import { use, useMemo } from "react";

import { type StoreInstance, type BaseStore, type GlobalStore } from "../core/types";

/**
 * Hook that returns a tuple containing the store state and dispatch functions, similar to `useReducer`.
 * Unlike `useStore`, the store returned from `useStoreReducer` does not trigger re-renders when it changes,
 * making it useful for reading values in handlers or effects.
 * @param store - The store instance
 * @returns A tuple `[store, setStore, subscribe, unsubscribe]`
 * @example
 * const [store, setStore, subscribe, unsubscribe] = useStoreReducer(Store);
 * // ...
 * useEffect(() => {
 *   return subscribe("count", (count) => {
 *     console.log(count);
 *   });
 * }, []);
 * const sendAnalyticsEvent = useCallback(() => {
 *   sendAnalyticsEvent("user_action", { userId: store.user.id });
 * }, []);
 * // ...
 * <button onClick={() => setStore((prev) => ({ count: prev.count + 1 }))}>Increment</button>
 */
export const useStoreReducer = <Store extends BaseStore>(store: Pick<StoreInstance<Store>, "_context">) => {
    const data = use<GlobalStore<Store>>(store._context);
    return useMemo(() => [data.store, data.setStore, data.subscribe, data.unsubscribe] as const, [data]);
};
