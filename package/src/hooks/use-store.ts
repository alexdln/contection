"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, use, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import {
    type StoreInstance,
    type BaseStore,
    type GlobalStore,
    type MutationFn,
    type StoreOptions,
} from "../core/types";
import { clone, cloneAndCompare } from "../core/utils";

/**
 * Hook that subscribes to store state with optional key filtering and computed value derivation.
 * Component re-renders only when subscribed keys change (or when mutation result changes).
 * @param instance - The store instance
 * @param options - The options for the store subscription
 * @param options.keys - The keys to subscribe to
 * @param options.mutation - The mutation function to apply to the subscribed state, if provided, the hook will return the result of the mutation function
 * @param options.enabled - Condition to enable or disable the subscription. Accepts `"always"` (default), `"never"`, `"after-hydration"`, or a function `(store: Store) => boolean`. When this value changes, the hook will automatically resubscribe.
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
    options: { keys?: Keys; mutation: MutationFn<Store, Keys, ResultType>; enabled?: StoreOptions<Store>["enabled"] },
): ResultType;
export function useStore<
    Store extends BaseStore = BaseStore,
    ResultType = unknown,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">,
    options?: { keys?: Keys; mutation?: undefined; enabled?: StoreOptions<Store>["enabled"] },
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
    }: { keys?: Keys; mutation?: MutationFn<Store, Keys, ResultType>; enabled?: StoreOptions<Store>["enabled"] } = {},
): ResultType {
    const { store, subscribe: originalSubscribe } = use<GlobalStore<Store>>(instance._context);
    const mounted = useRef(false);
    const localSubscriber = useRef<(() => void) | undefined>(undefined);
    const prevStore = useRef<Store | undefined>(undefined);
    const prevMutatedStore = useRef<ResultType | undefined>(undefined);
    const storeKeys = useMemo(() => keys || (Object.keys(store) as unknown as Keys), []);
    const enabledMemoized = useMemo(() => {
        if (enabled === "always") return true;
        else if (enabled === "after-hydration") return () => mounted.current;
        else if (typeof enabled === "function") return enabled;
        else if (enabled === "never") return false;
    }, [enabled]);

    const getSnapshot = useCallback(() => {
        const isDisabled =
            enabledMemoized === false || (typeof enabledMemoized === "function" && !enabledMemoized(store));
        const { result: newStore, isEqual } = prevStore.current
            ? cloneAndCompare(store, storeKeys, prevStore.current)
            : { result: clone(store, storeKeys), isEqual: false };

        if (isEqual || isDisabled) {
            if (!mutation) {
                prevStore.current ||= clone(instance._initial, storeKeys);
                return prevStore.current;
            } else if (prevMutatedStore.current) {
                return prevMutatedStore.current;
            } else if (isDisabled) {
                const initialStore = clone(instance._initial, storeKeys);
                prevMutatedStore.current = mutation(initialStore, prevStore.current, prevMutatedStore.current);
                prevStore.current = initialStore;
                return prevMutatedStore.current;
            }
        }

        if (mutation) {
            const mutatedData = mutation(newStore, prevStore.current, prevMutatedStore.current);
            prevMutatedStore.current = mutatedData;
            prevStore.current = newStore;
            return mutatedData;
        }

        prevMutatedStore.current = undefined;
        prevStore.current = newStore;
        return newStore;
    }, [storeKeys, enabledMemoized]);

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            if (enabledMemoized === false) return () => {};

            const unsubscribes = storeKeys.map((key) =>
                originalSubscribe<Store[typeof key], typeof key>(key, onStoreChange),
            );
            localSubscriber.current = onStoreChange;

            return () => {
                unsubscribes.forEach((unsubscribe) => unsubscribe());
                localSubscriber.current = undefined;
            };
        },
        [storeKeys, enabledMemoized],
    );

    // We subscribe to the mount state at the component level to avoid prematurely updating new components,
    // especially for PPR or suspense
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;

            if (enabled === "after-hydration" && localSubscriber.current) localSubscriber.current();
        }
    }, [enabled === "after-hydration"]);

    const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return data as ResultType;
}
