// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type NonFunction<T> = T extends Function ? never : T extends object ? T : never;

export type StoreKey = string | number | symbol;

export type ListenOptions<Store extends BaseStore = BaseStore> = {
    enabled?: boolean | ((store: Store) => boolean);
};

export type InternalStoreType<Store extends BaseStore = BaseStore> = {
    [key: StoreKey]: {
        value: unknown;
        listeners: ({ callback: (value: unknown) => void } & ListenOptions<Store>)[];
    };
};

/** Base type for all store objects */
export type BaseStore = NonFunction<object>;

/**
 * Base type for mutation functions that transform store state in Consumer and useStore
 * @template Store - The store state type
 * @template Keys - The keys of the store to mutate
 * @template ReturnType - The return type of the mutation
 */
export type MutationFn<Store, Keys extends Array<keyof Store> = Array<keyof Store>, ReturnType = unknown> = (
    newStore: Pick<Store, Keys[number]>,
    prevStore?: Pick<Store, Keys[number]>,
    prevMutatedStore?: ReturnType,
) => ReturnType;

/**
 * Validates that a partial store update only contains correct keys with right value type
 * @template Store - The full store state type
 * @template NewStorePart - The dispatched partial store state type being validated
 */
export type ValidateNewStore<Store extends BaseStore, NewStorePart extends BaseStore> = NewStorePart extends {
    [K in keyof NewStorePart]: K extends keyof Store ? (undefined extends Store[K] ? Store[K] : never) : never;
}
    ? NewStorePart // @ts-expect-error - NewStorePart is guaranteed to be a subset of Store
    : Pick<Store, keyof NewStorePart>;

/**
 * Validates that a callback argument of partial store update only contains correct keys with right value type
 * @template Store - The full store state type
 * @template NewStorePart - The callback argument as partial store state type being validated
 */
export type CallbackStore<Store extends BaseStore, NewStorePart extends BaseStore> = (
    prevStore: Store,
) => NewStorePart extends {
    [K in keyof NewStorePart]: K extends keyof Store ? (undefined extends Store[K] ? Store[K] : never) : never;
}
    ? NewStorePart // @ts-expect-error - NewStorePart is guaranteed to be a subset of Store
    : Pick<Store, keyof NewStorePart>;

/**
 * The Storage object that provides access to store state and operations.
 * @template Store - The store state type
 */
export type GlobalStore<Store extends BaseStore> = {
    /** The current store state */
    store: Store;
    /**
     * Updates the store state with a partial state or a callback function
     * @template NewStorePart - The partial store state type for direct updates
     * @template CallbackStorePart - The partial store state type for callback updates
     */
    update: <NewStorePart extends Partial<Store>, CallbackStorePart extends Partial<Store>>(
        newStorePart: ValidateNewStore<Store, NewStorePart> | CallbackStore<Store, CallbackStorePart>,
    ) => void;
    /**
     * Subscribes to changes for a specific store key
     * @template DataType - The type of the value for the listened key
     * @template Key - The listened key in the store
     * @param options.enabled - The condition to subscribe to the store. The hook will only subscribe to the store if the condition is true
     * @returns A function to unsubscribe from the listener
     * @example
     * const unlisten = listen("count", (value) => {
     *     console.log(value);
     * }, { enabled: true });
     */
    listen: <DataType extends Store[Key], Key extends keyof Store>(
        key: Key,
        listener: (value: DataType) => void,
        options?: ListenOptions<Store>,
    ) => () => void;
    /**
     * Unsubscribes from changes for a specific store key
     * @template DataType - The type of the value for the listened key
     * @template Key - The listened key in the store
     */
    unlisten: <DataType extends Store[Key], Key extends keyof Store>(
        key: Key,
        listener: (value: DataType) => void,
    ) => void;
};

/**
 * Lifecycle hook that runs during Storage mount phase (willMount or didMount).
 * Can return a cleanup function that should be called during unmount
 * @template Store - The store state type
 * @returns Optional cleanup function that receives the store
 */
interface LifecycleMountHook<Store extends BaseStore> {
    (
        store: Store,
        dispatch: GlobalStore<Store>["update"],
        listen: GlobalStore<Store>["listen"],
        unlisten: GlobalStore<Store>["unlisten"],
    ): void | ((store: Store) => void);
}

/**
 * Lifecycle hook that runs during unmount phase
 * @template Store - The store state type
 */
interface LifecycleUnmountHook<Store extends BaseStore> {
    (store: Store): void;
}

/**
 * Options for creating a storage instance
 * @template Store - The store state type
 */
export type CreateStoreOptions<Store extends BaseStore> = {
    /** Lifecycle hooks for storage initialization and cleanup */
    lifecycleHooks?: {
        /** Runs synchronously during render, before the store is fully initialized */
        storeWillMount?: LifecycleMountHook<Store>;
        /** Runs asynchronously after the component mounts. Safe for browser APIs and client-only operations */
        storeDidMount?: LifecycleMountHook<Store>;
        /** Runs synchronously before the component unmounts. Use for synchronous cleanup */
        storeWillUnmount?: LifecycleUnmountHook<Store>;
        /** Runs asynchronously during component unmount. Use for async cleanup operations */
        storeWillUnmountAsync?: LifecycleUnmountHook<Store>;
    };
};

/**
 * A storage instance created by `createStore`. Can be used as a Provider component or accessed via its properties
 * @template Store - The store state type
 */
export interface StoreInstance<Store extends BaseStore = BaseStore> {
    /** The initial store data passed to createStore */
    readonly _initial: Store;
    /** The underlying React Context used for the store */
    readonly _context: React.Context<GlobalStore<Store>>;
    ({ children, value }: { children: React.ReactNode; value?: Store }): React.ReactNode;
    /** Consumer component for render props pattern */
    Consumer({ children }: { children: (store: Store) => React.ReactNode }): React.ReactNode;
    /** Provider component (alternative to calling the instance directly) */
    Provider({ children, value }: { children: React.ReactNode; value?: Store }): React.ReactNode;
}
