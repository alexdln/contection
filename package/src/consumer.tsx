/* eslint-disable @typescript-eslint/no-unused-vars */
import { type MutationFn, type BaseStore, type StoreInstance, ListenOptions } from "./types";
import { useStore } from "./hooks";

/**
 * Consumer component that provides store data using the render props pattern.
 * Supports selective subscriptions and computed values, similar to `useStore` hook.
 * @template Store - The store type
 * @template Keys - Array of store keys to subscribe to
 * @template Mutation - Mutation function that transforms the subscribed state
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
