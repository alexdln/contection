/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStore, type GlobalStore } from "contection";
import { NextCookieAdapter } from "contection-next-cookie-adapter";

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
    new NextCookieAdapter<TestStore>();
    new NextCookieAdapter<TestStore>({});
    new NextCookieAdapter<TestStore>({
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
    new NextCookieAdapter<TestStore>({ onDestroy: "invalid" });

    // @ts-expect-error - invalid rawLimit type
    new NextCookieAdapter<TestStore>({ rawLimit: "invalid" });

    // @ts-expect-error - invalid prefix type
    new NextCookieAdapter<TestStore>({ prefix: 123 });
}

// Test 2: Configuration options
function testConfigurationOptions() {
    new NextCookieAdapter<TestStore>({ onDestroy: "cleanup" });
    new NextCookieAdapter<TestStore>({ onDestroy: "ignore" });

    new NextCookieAdapter<TestStore>({ prefix: "app_" });
    new NextCookieAdapter<TestStore>({ rawLimit: 1000 });

    new NextCookieAdapter<TestStore>({ autoSync: null });
    new NextCookieAdapter<TestStore>({ autoSync: 1000 });
    new NextCookieAdapter<TestStore>({ autoSync: 200 });

    // @ts-expect-error - invalid autoSync type
    new NextCookieAdapter<TestStore>({ autoSync: "invalid" });

    // Cookie flags
    new NextCookieAdapter<TestStore>({
        flags: {
            path: "/custom",
            domain: "example.com",
            expires: new Date(),
            maxAge: 3600,
            secure: true,
            sameSite: "strict",
        },
    });

    new NextCookieAdapter<TestStore>({
        flags: {
            sameSite: "lax",
        },
    });

    new NextCookieAdapter<TestStore>({
        flags: {
            sameSite: "none",
        },
    });

    new NextCookieAdapter<TestStore>({
        flags: {
            // @ts-expect-error - invalid sameSite
            sameSite: "invalid",
        },
    });

    new NextCookieAdapter<TestStore>({
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

    new NextCookieAdapter<TestStore>({ validate });
    new NextCookieAdapter<TestStore>({ validate: null });
}

// Test 4: saveKeys
function testSaveKeys() {
    new NextCookieAdapter<TestStore>({ saveKeys: [] });
    new NextCookieAdapter<TestStore>({ saveKeys: ["count"] });
    new NextCookieAdapter<TestStore>({ saveKeys: ["count", "name", "theme"] });

    // @ts-expect-error - invalid key
    new NextCookieAdapter<TestStore>({ saveKeys: ["invalidKey"] });

    // @ts-expect-error - invalid type
    new NextCookieAdapter<TestStore>({ saveKeys: "count" });
}

// Test 5: Adapter methods
async function testAdapterMethods() {
    const adapter = new NextCookieAdapter<TestStore>({});
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
    const adapter = new NextCookieAdapter<TestStore>({});
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
            adapter: new NextCookieAdapter<TestStore>({
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
