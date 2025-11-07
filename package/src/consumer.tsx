import { type BaseStore, type StoreInstance } from "./types";
import { useStore } from "./hooks";

export function GlobalStoreConsumer<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
    Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown = (
        newStore: Pick<Store, Keys[number]>,
        prevStore?: Pick<Store, Keys[number]>,
    ) => unknown,
>(props: {
    children: (data: ReturnType<Mutation>) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context">;
    options: { keys: Keys; mutation: Mutation };
}): React.ReactNode;
export function GlobalStoreConsumer<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
    Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown = (
        newStore: Pick<Store, Keys[number]>,
        prevStore?: Pick<Store, Keys[number]>,
    ) => unknown,
>(props: {
    children: (data: ReturnType<Mutation>) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context">;
    options: { keys?: undefined; mutation: Mutation };
}): React.ReactNode;
export function GlobalStoreConsumer<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
>(props: {
    children: (data: Pick<Store, Keys[number]>) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context">;
    options: { keys: Keys; mutation?: undefined };
}): React.ReactNode;
export function GlobalStoreConsumer<Store extends BaseStore>(props: {
    children: (data: Store) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context">;
    options?: { keys?: undefined; mutation?: undefined };
}): React.ReactNode;
export function GlobalStoreConsumer<
    Store extends BaseStore,
    Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
    Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown = (
        newStore: Pick<Store, Keys[number]>,
        prevStore?: Pick<Store, Keys[number]>,
    ) => unknown,
>({
    children,
    instance,
    options,
}: {
    children: (data: Store | ReturnType<Mutation>) => React.ReactNode;
    instance: Pick<StoreInstance<Store>, "_context">;
    options?: { keys?: Keys; mutation?: Mutation };
}): React.ReactNode {
    const data = useStore(instance, options as { keys: Keys; mutation: Mutation });

    return children(data);
}
