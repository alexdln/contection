/**
 * Type tests for contection
 * These tests verify TypeScript type safety and inference.
 * Run with: pnpm test:types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { createStore, useStore, useStoreReducer } from "contection";

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

// Test 1: Store creation with type inference
const Store = createStore<TestStore>({
    count: 0,
    name: "Test",
    user: { id: 1, email: "test@example.com" },
    theme: "light",
    items: [],
});

// Test 2: useStoreReducer return type
function testUseStoreReducer() {
    const [storeData, update, listen, unlisten] = useStoreReducer(Store);

    const count: number = storeData.count;
    const name: string = storeData.name;
    // @ts-expect-error - should not have invalid key
    const invalid = storeData.invalidKey;

    // Update should accept partial store
    update({ count: 1 });
    update({ name: "New", theme: undefined });
    // @ts-expect-error - should not accept undefined value if it was not defined in the store
    update({ name: "New", items: undefined });
    update({ name: "New", items: [] });
    update((prev) => ({ count: prev.count + 1 }));
    // @ts-expect-error - should not accept invalid key
    update({ invalidKey: "value" });
    // @ts-expect-error - should not accept undefined value if it was not defined in the store
    update((prev) => ({ count: prev.count + 1, items: undefined }));
    update((prev) => ({ count: prev.count + 1, items: [] }));

    const unsubscribe = listen("count", (value: number) => {});
    listen("name", (value: string) => {});
    // @ts-expect-error - should not accept invalid key
    listen("invalidKey", () => {});

    unlisten("count", () => {});
}

// Test 3: useStore with no options
function testUseStoreNoOptions() {
    const storeData = useStore(Store);

    const count: number = storeData.count;
    const name: string = storeData.name;
    // @ts-expect-error - should not have invalid key
    const invalid = storeData.invalidKey;
}

// Test 4: useStore with keys
function testUseStoreWithKeys() {
    const data = useStore(Store, { keys: ["count", "name"] });

    const count: number = data.count;
    const name: string = data.name;
    // @ts-expect-error - should not have unselected keys
    const user = data.user;
    // @ts-expect-error - should not accept invalid keys
    const invalid = useStore(Store, { keys: ["invalidKey"] });
}

// Test 5: useStore with mutation
function testUseStoreWithMutation() {
    const doubled = useStore(Store, {
        mutation: (Store) => Store.count * 2,
    });
    const doubledType: number = doubled;

    const computed = useStore(Store, {
        keys: ["count", "name"],
        mutation: (Store) => `${Store.name}: ${Store.count}`,
    });
    const computedType: string = computed;

    useStore(Store, {
        keys: ["count"],
        mutation: (newStore, prevStore) => {
            const count: number = newStore.count;
            // prevStore might be undefined on first call
            if (prevStore) {
                const prevCount: number = prevStore.count;
            }
            return newStore.count * 2;
        },
    });

    const accumulatedCount = useStore<TestStore, number, ["count"]>(Store, {
        keys: ["count"],
        mutation: (newStore, prevStore, prevMutatedStore: number | undefined) => {
            const current: number = newStore.count;
            if (prevStore) {
                const prev: number = prevStore.count;
            }
            return (prevMutatedStore ?? 0) + current;
        },
    });
    const accumulatedCountCheck: number = accumulatedCount;
}

// Test 6: Store instance structure
function testStoreInstance() {
    const initial: TestStore = Store._initial;
    const context = Store._context;
    const Provider = Store.Provider;
    const Consumer = Store.Consumer;
}

// Test 7: Provider value prop
function testProviderValue() {
    <Store.Provider>
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider
        value={{
            count: 1,
            name: "Test",
            user: { id: 1, email: "test@example.com" },
            theme: "light",
            items: [],
        }}
    >
        <div>Test</div>
    </Store.Provider>;

    // @ts-expect-error - should not accept invalid value
    <Store.Provider value={{ invalid: "value" }}>
        <div>Test</div>
    </Store.Provider>;
}

// Test 10: Provider options prop
function testProviderOptions() {
    <Store.Provider>
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider
        options={{
            lifecycleHooks: {
                storeWillMount: (Store, update, listen, unlisten) => {
                    const count: number = Store.count;
                    update({ count: 1 });
                    const unsubscribe = listen("count", (value: number) => {});
                    unlisten("count", () => {});
                    return (Store) => {};
                },
                storeDidMount: (Store, update, listen, unlisten) => {
                    return () => {};
                },
                storeWillUnmount: (Store) => {
                    const count: number = Store.count;
                },
                storeWillUnmountAsync: (Store) => {
                    const count: number = Store.count;
                },
            },
        }}
    >
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider options={{}}>
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider
        options={{
            lifecycleHooks: {
                storeDidMount: (Store, update, listen, unlisten) => {},
            },
        }}
    >
        <div>Test</div>
    </Store.Provider>;
    <Store.Provider
        options={{
            lifecycleHooks: {
                // @ts-expect-error - should return void or cleanup function
                storeDidMount: (Store) => "invalid",
            },
        }}
    >
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider
        // @ts-expect-error - should not accept invalid property
        options={{ invalidProperty: true }}
    >
        <div>Test</div>
    </Store.Provider>;
}

// Test 8: Consumer options
function testConsumerOptions() {
    <Store.Consumer>{(data: TestStore) => <div>{data.count}</div>}</Store.Consumer>;
    <Store.Consumer options={{ keys: ["count", "name"] }}>
        {(data: { count: number; name?: string }) => <div>{data.count}</div>}
    </Store.Consumer>;

    <Store.Consumer
        options={{
            keys: ["count"],
        }}
    >
        {/* @ts-expect-error - should not have unselected keys */}
        {(data) => <div>{data.name}</div>}
    </Store.Consumer>;

    <Store.Consumer
        options={{
            mutation: (Store) => Store.count * 2,
        }}
    >
        {(doubled: number) => <div>{doubled}</div>}
    </Store.Consumer>;

    <Store.Consumer
        options={{
            keys: ["count"],
            mutation: (Store) => Store.count * 2,
        }}
    >
        {(doubled: number) => <div>{doubled}</div>}
    </Store.Consumer>;
}

// Test 9: Lifecycle hooks types
function testLifecycleHooks() {
    createStore<TestStore>(
        {
            count: 0,
            name: "Test",
            user: { id: 1, email: "test@example.com" },
            theme: "light",
            items: [],
        },
        {
            lifecycleHooks: {
                storeWillMount: (Store, update, listen, unlisten) => {
                    const count: number = Store.count;
                    update({ count: 1 });
                    const unsubscribe = listen("count", (value: number) => {});
                    unlisten("count", () => {});
                    return (Store) => {};
                },
                storeDidMount: (Store, update, listen, unlisten) => {
                    return () => {};
                },
                storeWillUnmount: (Store) => {
                    const count: number = Store.count;
                },
                storeWillUnmountAsync: (Store) => {
                    const count: number = Store.count;
                },
            },
        },
    );
}

// Test 10: enabled option
function testEnabledOption() {
    const store1 = useStore(Store, { enabled: "always" });
    const store2 = useStore(Store, { enabled: "never" });
    const store3 = useStore(Store, { enabled: "after-hydration" });
    const store4 = useStore(Store, { enabled: (store) => store.count > 0 });
    const count1: number = store1.count;
    const count2: number = store2.count;
    const count3: number = store3.count;
    const count4: number = store4.count;

    // @ts-expect-error - should not accept invalid enabled value
    const invalid1 = useStore(Store, { enabled: "invalid" });

    const data1 = useStore(Store, { keys: ["count", "name"], enabled: "always" });
    const data2 = useStore(Store, { keys: ["count", "name"], enabled: "never" });
    const data3 = useStore(Store, { keys: ["count", "name"], enabled: "after-hydration" });
    const data4 = useStore(Store, { keys: ["count", "name"], enabled: (store) => store.count > 0 });
    const count5: number = data1.count;
    const count6: number = data2.count;
    const count7: number = data3.count;
    const count8: number = data4.count;

    const doubled1 = useStore(Store, {
        keys: ["count"],
        mutation: (store) => store.count * 2,
        enabled: "always",
    });
    const doubled2 = useStore(Store, {
        keys: ["count"],
        mutation: (store) => store.count * 2,
        enabled: "never",
    });
    const doubled3String = useStore(Store, {
        keys: ["count"],
        mutation: (store) => String(store.count * 2),
        enabled: "after-hydration",
    });
    const doubled4String = useStore(Store, {
        keys: ["count"],
        mutation: (store) => String(store.count * 2),
        enabled: (store) => store.count > 0,
    });
    const doubledType1: number = doubled1;
    const doubledType2: number = doubled2;
    const doubledType3: string = doubled3String;
    const doubledType4: string = doubled4String;

    const [, , listen] = useStoreReducer(Store);
    const unsubscribe1 = listen("count", (value: number) => {});

    // @ts-expect-error - should not accept invalid enabled value
    const invalid2 = listen("count", (value: number) => {}, { enabled: "invalid" });
}

// Test 11: validate option
function testValidateOption() {
    const StoreWithValidate = createStore<TestStore>(
        {
            count: 0,
            name: "Test",
            user: { id: 1, email: "test@example.com" },
            theme: "light",
            items: [],
        },
        {
            validate: (data) => {
                const count: number = data.count;
                return count >= 0;
            },
        },
    );

    createStore<TestStore>(
        {
            count: 0,
            name: "Test",
            user: { id: 1, email: "test@example.com" },
            theme: "light",
            items: [],
        },
        {
            validate: () => true,
        },
    );

    <Store.Provider
        options={{
            validate: (data) => {
                const count: number = data.count;
                return count >= 0;
            },
        }}
    >
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider
        options={{
            validate: () => true,
            lifecycleHooks: {
                storeDidMount: () => {},
            },
        }}
    >
        <div>Test</div>
    </Store.Provider>;

    <Store.Provider
        options={{
            // @ts-expect-error - validate should return boolean | null | undefined
            validate: () => "invalid",
        }}
    >
        <div>Test</div>
    </Store.Provider>;
}

export {};
