/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStore, type GlobalStore } from "contection";
import { StorageAdapter } from "contection-next-cookie-adapter";

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
        onDestroy: "cleanup",
        rawLimit: 5000,
        flags: {
            path: "/",
            domain: "example.com",
            secure: true,
            sameSite: "strict",
        },
        validate: null,
        saveKeys: ["count", "name"],
        autoSync: 1000,
    });

    // @ts-expect-error - invalid onDestroy
    new StorageAdapter<TestStore>({ onDestroy: "invalid" });

    // @ts-expect-error - invalid rawLimit type
    new StorageAdapter<TestStore>({ rawLimit: "invalid" });

    // @ts-expect-error - invalid prefix type
    new StorageAdapter<TestStore>({ prefix: 123 });
}

// Test 2: Configuration options
function testConfigurationOptions() {
    new StorageAdapter<TestStore>({ onDestroy: "cleanup" });
    new StorageAdapter<TestStore>({ onDestroy: "ignore" });

    new StorageAdapter<TestStore>({ prefix: "app_" });
    new StorageAdapter<TestStore>({ rawLimit: 1000 });

    new StorageAdapter<TestStore>({ autoSync: null });
    new StorageAdapter<TestStore>({ autoSync: 1000 });
    new StorageAdapter<TestStore>({ autoSync: 200 });

    // @ts-expect-error - invalid autoSync type
    new StorageAdapter<TestStore>({ autoSync: "invalid" });

    // Cookie flags
    new StorageAdapter<TestStore>({
        flags: {
            path: "/custom",
            domain: "example.com",
            expires: new Date(),
            maxAge: 3600,
            secure: true,
            sameSite: "strict",
        },
    });

    new StorageAdapter<TestStore>({
        flags: {
            sameSite: "lax",
        },
    });

    new StorageAdapter<TestStore>({
        flags: {
            sameSite: "none",
        },
    });

    new StorageAdapter<TestStore>({
        flags: {
            // @ts-expect-error - invalid sameSite
            sameSite: "invalid",
        },
    });

    new StorageAdapter<TestStore>({
        flags: {
            // @ts-expect-error - invalid expires type
            expires: "invalid",
        },
    });
}

// Test 3: Validate validation
function testValidate() {
    const validate = (data: unknown) => {
        const obj = data as { count?: number };
        return obj.count !== undefined;
    };

    new StorageAdapter<TestStore>({ validate });
    new StorageAdapter<TestStore>({ validate: null });
}

// Test 4: saveKeys
function testSaveKeys() {
    new StorageAdapter<TestStore>({ saveKeys: [] });
    new StorageAdapter<TestStore>({ saveKeys: ["count"] });
    new StorageAdapter<TestStore>({ saveKeys: ["count", "name", "theme"] });

    // @ts-expect-error - invalid key
    new StorageAdapter<TestStore>({ saveKeys: ["invalidKey"] });

    // @ts-expect-error - invalid type
    new StorageAdapter<TestStore>({ saveKeys: "count" });
}

// Test 5: Adapter methods
async function testAdapterMethods() {
    const adapter = new StorageAdapter<TestStore>({});
    const store: TestStore = {
        count: 0,
        name: "Test",
        user: { id: 1, email: "test@example.com" },
        theme: "light",
        items: [],
    };

    const snapshot = await adapter.getServerSnapshot(store);
    const count: number = snapshot.count;
    const name: string = snapshot.name;
    // @ts-expect-error - invalid key
    const invalid = snapshot.invalidKey;

    adapter.afterUpdate(store, { count: 1 });
    adapter.afterUpdate(store, { count: 1, name: "New" });
    adapter.afterUpdate(store, { theme: "dark" });
    // @ts-expect-error - invalid key
    adapter.afterUpdate(store, { invalidKey: "value" });

    adapter.beforeDestroy(store);

    const setStore: GlobalStore<TestStore>["setStore"] = () => {};
    const cleanup = adapter.afterInit(store, setStore);
    cleanup();
}

// Test 6: Type inference
async function testTypeInference() {
    const adapter = new StorageAdapter<TestStore>({});
    const store: TestStore = {
        count: 0,
        name: "Test",
        user: { id: 1, email: "test@example.com" },
        theme: "light",
        items: [],
    };

    const result = await adapter.getServerSnapshot(store);
    const count: number = result.count;
    const user: { id: number; email: string } = result.user;
    const theme: "light" | "dark" | undefined = result.theme;
    const items: string[] = result.items;
}

// Test 7: Integration with createStore
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
                onDestroy: "cleanup",
                flags: {
                    secure: true,
                    sameSite: "strict",
                },
            }),
        },
    );

    const initial: TestStore = Store._initial;
    const context = Store._context;
    const Provider = Store.Provider;
    const Consumer = Store.Consumer;
}

export {};
