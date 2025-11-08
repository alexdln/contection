export type BaseStore = Record<string | number | symbol, unknown>;
export type BaseMutation<Store extends BaseStore, ReturnType = unknown> = (
    newStore: Store,
    prevStore?: Store,
) => ReturnType;

export type ValidateNewStore<Store extends BaseStore, NewStorePart extends BaseStore> = NewStorePart extends {
    [K in keyof NewStorePart]: K extends keyof Store ? (undefined extends Store[K] ? Store[K] : never) : never;
}
    ? NewStorePart
    : Pick<Store, keyof NewStorePart>;

export type CallbackStore<Store extends BaseStore, NewStorePart> = (prevStore: Store) => NewStorePart extends {
    [K in keyof NewStorePart]: K extends keyof Store ? (undefined extends Store[K] ? Store[K] : never) : never;
}
    ? NewStorePart
    : Pick<Store, keyof NewStorePart>;

export type GlobalStore<Store extends BaseStore> = {
    store: Store;
    update: <NewStorePart extends Partial<Store>>(
        newStorePart:
            | ValidateNewStore<Store, NewStorePart>
            | ((prevStore: Store) => ValidateNewStore<Store, NewStorePart>),
    ) => void;
    listen: <DataType extends Store[Key], Key extends keyof Store>(
        key: Key,
        listener: (value: DataType) => void,
    ) => () => void;
    unlisten: <DataType extends Store[Key], Key extends keyof Store>(
        key: Key,
        listener: (value: DataType) => void,
    ) => void;
};

type LifecycleMountHook<Store extends BaseStore> = (
    store: Store,
    dispatch: GlobalStore<Store>["update"],
    listen: GlobalStore<Store>["listen"],
    unlisten: GlobalStore<Store>["unlisten"],
) => void | ((store: Store) => void);

type LifecycleUnmountHook<Store extends BaseStore> = (store: Store) => void;

export type CreateStoreOptions<Store extends BaseStore> = {
    lifecycleHooks?: {
        storeWillMount?: LifecycleMountHook<Store>;
        storeDidMount?: LifecycleMountHook<Store>;
        storeWillUnmount?: LifecycleUnmountHook<Store>;
        storeWillUnmountAsync?: LifecycleUnmountHook<Store>;
    };
};

export interface StoreInstance<Store extends BaseStore = BaseStore> {
    readonly _initial: Store;
    readonly _context: React.Context<GlobalStore<Store>>;
    ({ children, value }: { children: React.ReactNode; value?: Store }): React.ReactNode;
    Consumer({ children }: { children: (store: Store) => React.ReactNode }): React.ReactNode;
    Provider({ children, value }: { children: React.ReactNode; value?: Store }): React.ReactNode;
}
