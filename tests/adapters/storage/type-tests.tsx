/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStore, type GlobalStore } from "contection";
import { StorageAdapter } from "contection-storage-adapter";

interface TestStore {
    count: number;
    name: string;
    user: {
        id: number;
        email: string;
    };
    theme?: "light" | "dark";
    items: string[];
}

// Test 1: Constructor with options
function testConstructor() {
    new StorageAdapter<TestStore>();
    new StorageAdapter<TestStore>({});
    new StorageAdapter<TestStore>({
        prefix: "custom_",
        enabled: "always",
        onDestroy: "cleanup",
        rawLimit: 5000,
        storage: "localStorage",
        schema: null,
    });

    // @ts-expect-error - invalid enabled
    new StorageAdapter<TestStore>({ enabled: "invalid" });

    // @ts-expect-error - invalid onDestroy
    new StorageAdapter<TestStore>({ onDestroy: "invalid" });

    // @ts-expect-error - invalid storage
    new StorageAdapter<TestStore>({ storage: "invalid" });

    // @ts-expect-error - invalid rawLimit type
    new StorageAdapter<TestStore>({ rawLimit: "invalid" });

    // @ts-expect-error - invalid prefix type
    new StorageAdapter<TestStore>({ prefix: 123 });
}

// Test 2: Configuration options
function testConfigurationOptions() {
    new StorageAdapter<TestStore>({ enabled: "always" });
    new StorageAdapter<TestStore>({ enabled: "never" });
    new StorageAdapter<TestStore>({ enabled: "after-hydration" });

    new StorageAdapter<TestStore>({ storage: "localStorage" });
    new StorageAdapter<TestStore>({ storage: "sessionStorage" });
    new StorageAdapter<TestStore>({ storage: null });

    new StorageAdapter<TestStore>({ onDestroy: "cleanup" });
    new StorageAdapter<TestStore>({ onDestroy: "ignore" });

    new StorageAdapter<TestStore>({ prefix: "app_" });
    new StorageAdapter<TestStore>({ rawLimit: 1000 });

    new StorageAdapter<TestStore>({ autoSync: null });
    new StorageAdapter<TestStore>({ autoSync: 1000 });
    new StorageAdapter<TestStore>({ autoSync: 200 });

    // @ts-expect-error - invalid autoSync type
    new StorageAdapter<TestStore>({ autoSync: "invalid" });
}

// Test 3: Schema validation
function testSchema() {
    const schema = {
        validate: (data: unknown) => {
            const obj = data as { count?: number };
            return obj.count !== undefined;
        },
    };

    new StorageAdapter<TestStore>({ schema });
    new StorageAdapter<TestStore>({ schema: null });
}

// Test 4: Adapter methods
function testAdapterMethods() {
    const adapter = new StorageAdapter<TestStore>({});
    const store: TestStore = {
        count: 0,
        name: "Test",
        user: { id: 1, email: "test@example.com" },
        theme: "light",
        items: [],
    };

    const result = adapter.beforeInit(store);
    const count: number = result.count;
    const name: string = result.name;
    // @ts-expect-error - invalid key
    const invalid = result.invalidKey;

    adapter.beforeUpdate(store, { count: 1 });
    adapter.beforeUpdate(store, { count: 1, name: "New" });
    // @ts-expect-error - invalid key
    adapter.beforeUpdate(store, { invalidKey: "value" });

    adapter.afterUpdate(store, { count: 1 });
    adapter.afterUpdate(store, { theme: "dark" });
    // @ts-expect-error - invalid key
    adapter.afterUpdate(store, { invalidKey: "value" });

    adapter.beforeDestroy(store);

    const setStore: GlobalStore<TestStore>["setStore"] = () => {};
    adapter.afterInit(store, setStore);
}

// Test 5: Type inference
function testTypeInference() {
    const adapter = new StorageAdapter<TestStore>({});
    const store: TestStore = {
        count: 0,
        name: "Test",
        user: { id: 1, email: "test@example.com" },
        theme: "light",
        items: [],
    };

    const result = adapter.beforeInit(store);
    const count: number = result.count;
    const user: { id: number; email: string } = result.user;
    const theme: "light" | "dark" | undefined = result.theme;
}

// Test 6: BaseStore constraint
function testBaseStoreConstraint() {
    // Valid - object is BaseStore
    new StorageAdapter<{ value: number }>({});
    new StorageAdapter<Record<string, unknown>>({});
}

// Test 7: Different store types
function testDifferentStoreTypes() {
    interface SimpleStore {
        value: number;
    }

    interface ComplexStore {
        nested: { deep: { value: string } };
        array: number[];
    }

    interface StoreWithOptional {
        required: string;
        optional?: number;
    }

    const adapter1 = new StorageAdapter<SimpleStore>({});
    const adapter2 = new StorageAdapter<ComplexStore>({});
    const adapter3 = new StorageAdapter<StoreWithOptional>({});

    adapter1.beforeInit({ value: 1 });
    adapter2.beforeInit({ nested: { deep: { value: "test" } }, array: [1, 2, 3] });
    adapter3.afterUpdate({ required: "test", optional: 1 }, { optional: undefined });
}

// Test 8: Integration with createStore
function testCreateStoreIntegration() {
    const Store = createStore<TestStore>(
        {
            count: 0,
            name: "Test",
            user: { id: 1, email: "test@example.com" },
            theme: "light",
            items: [],
        },
        {
            adapter: new StorageAdapter<TestStore>({
                prefix: "app_",
                enabled: "always",
                storage: "localStorage",
            }),
        },
    );

    const initial: TestStore = Store._initial;
    const context = Store._context;
    const Provider = Store.Provider;
    const Consumer = Store.Consumer;
}

// Test 9: Edge cases
function testEdgeCases() {
    type EmptyStore = Record<string, never>;

    const adapter = new StorageAdapter<EmptyStore>({});
    const store: EmptyStore = {} as EmptyStore;

    adapter.beforeInit(store);
    adapter.afterUpdate(store, {});
    adapter.beforeDestroy(store);
}

export {};
