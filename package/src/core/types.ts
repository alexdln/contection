// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type NonFunction<T> = T extends Function ? never : T extends object ? T : never;

export type StoreKey = string | number | symbol;

export type StoreOptions<Store extends BaseStore = BaseStore> = {
    enabled?: "always" | "never" | "after-hydration" | ((store: Store) => boolean);
};

export type InternalStoreType = {
    [key: StoreKey]: {
        value: unknown;
        subscribers: ((value: unknown) => void)[];
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
     */
    setStore: <NewStorePart extends Partial<Store>, CallbackStorePart extends Partial<Store>>(
        newStorePart: ValidateNewStore<Store, NewStorePart> | CallbackStore<Store, CallbackStorePart>,
    ) => void;
    /**
     * Subscribes to changes for a specific store key
     * @param options.enabled - Condition to enable or disable the subscription. Accepts `"always"` (default), `"never"`, `"after-hydration"`, or a function `(store: Store) => boolean`. When this value changes, the subscription will automatically resubscribe.
     * @returns A function to unsubscribe from the subscriber
     * @example
     * const unsubscribe = subscribe("count", (value) => {
     *     console.log(value);
     * }, { enabled: "always" });
     */
    subscribe: <DataType extends Store[Key], Key extends keyof Store>(
        key: Key,
        onStoreChange: (value: DataType) => void,
    ) => () => void;
    /**
     * Unsubscribes from changes for a specific store key
     */
    unsubscribe: <DataType extends Store[Key], Key extends keyof Store>(
        key: Key,
        onStoreChange: (value: DataType) => void,
    ) => void;
};

/**
 * Lifecycle hook that runs during Storage mount phase (willMount or didMount).
 * Can return a cleanup function that should be called during unmount
 * @template Store - The store state type
 * @returns Optional cleanup function that receives the store
 */
export interface LifecycleMountHook<Store extends BaseStore> {
    (
        store: Store,
        setStore: GlobalStore<Store>["setStore"],
        subscribe: GlobalStore<Store>["subscribe"],
        unsubscribe: GlobalStore<Store>["unsubscribe"],
    ): void | ((store: Store) => void);
}

/**
 * Lifecycle hook that runs during unmount phase
 * @template Store - The store state type
 */
export interface LifecycleUnmountHook<Store extends BaseStore> {
    (store: Store): void;
}

export interface BaseAdapter<Store extends BaseStore> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getServerSnapshot?: (store: Store, ...args: any[]) => Store | Promise<Store>;
    beforeInit?: (store: Store) => Store;
    afterInit?: (store: Store, setStore: GlobalStore<Store>["setStore"]) => void | ((store: Store) => void);
    beforeUpdate?: (store: Store, part: Partial<Store>) => Partial<Store>;
    afterUpdate?: (store: Store, part: Partial<Store>) => void;
    beforeDestroy?: (store: Store) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Validate = (data: any) => boolean | null | never | undefined;

/**
 * Options for creating a storage instance
 * @template Store - The store state type
 * @template Adapter - The adapter type
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
    adapter?: BaseAdapter<Store>;
    validate?: Validate;
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

export type ProviderProps<Store extends BaseStore = BaseStore> = {
    children: React.ReactNode;
    value?: Store;
    options?: CreateStoreOptions<Store>;
};
