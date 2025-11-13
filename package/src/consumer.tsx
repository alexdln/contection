/* eslint-disable @typescript-eslint/no-unused-vars */
import { type MutationFn, type BaseStore, type StoreInstance, ListenOptions } from "./types";
import { useStore } from "./hooks";

/**
 * Consumer component that provides store data using the render props pattern.
 * Supports selective subscriptions and computed values, similar to `useStore` hook.
 * @param options - The options for the store subscription
 * @param options.keys - The keys to subscribe to
 * @param options.mutation - The mutation function to apply to the subscribed state, if provided, the hook will return the result of the mutation function
 * @param options.enabled - Condition to enable or disable the subscription. Accepts `"always"` (default), `"never"`, `"after-hydration"`, or a function `(store: Store) => boolean`. When this value changes, the hook will automatically resubscribe.
 */
export function GlobalStoreConsumer<
    Store extends BaseStore,
    ResultType,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(props: {
    options: { keys?: Keys; mutation: MutationFn<Store, Keys, ResultType>; enabled?: ListenOptions<Store>["enabled"] };
    children: (data: ResultType) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
}): React.ReactNode;
export function GlobalStoreConsumer<
    Store extends BaseStore,
    ResultType,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>(props: {
    options?: { keys?: Keys; mutation?: undefined; enabled?: ListenOptions<Store>["enabled"] };
    children: (data: Pick<Store, Keys[number]>) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
}): React.ReactNode;
export function GlobalStoreConsumer<
    Store extends BaseStore,
    ResultType,
    Keys extends Array<keyof Store> = Array<keyof Store>,
>({
    children,
    instance,
    options,
}: {
    options?: {
        keys?: Keys;
        mutation?: MutationFn<Store, Keys, ResultType>;
        enabled?: ListenOptions<Store>["enabled"];
    };
    children: (data: Store | ResultType) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
}): React.ReactNode {
    const data = useStore(
        instance,
        options as {
            keys: Keys;
            mutation: MutationFn<Store, Keys, ResultType>;
            enabled?: ListenOptions<Store>["enabled"];
        },
    );

    return children(data);
}
