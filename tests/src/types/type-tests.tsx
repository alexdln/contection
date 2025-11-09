/**
 * Type tests for Contection
 * These tests verify TypeScript type safety and inference.
 * Run with: pnpm test:types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { createStore, useStore, useStoreReducer } from "contection";

// @TODO add support for interface
type TestStore = {
    count: number;
    name: string;
    user: {
        id: number;
        email: string;
    };
    theme: "light" | "dark";
    items: string[];
};

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

    // Store should have correct type
    const count: number = storeData.count;
    const name: string = storeData.name;
    // @ts-expect-error - should not have invalid key
    const invalid = storeData.invalidKey;

    // Update should accept partial store
    update({ count: 1 });
    update({ name: "New" });
    update((prev) => ({ count: prev.count + 1 }));
    // @ts-expect-error - should not accept invalid key
    update({ invalidKey: "value" });

    // Listen should be typed correctly
    const unsubscribe = listen("count", (value: number) => {
        // value should be number
    });
    listen("name", (value: string) => {
        // value should be string
    });
    // @ts-expect-error - should not accept invalid key
    listen("invalidKey", () => {});

    // Unlisten should work
    unlisten("count", () => {});
}

// Test 3: useStore with no options
function testUseStoreNoOptions() {
    const storeData = useStore(Store);

    // Should return full store type
    const count: number = storeData.count;
    const name: string = storeData.name;
    // @ts-expect-error - should not have invalid key
    const invalid = storeData.invalidKey;
}

// Test 4: useStore with keys
function testUseStoreWithKeys() {
    const data = useStore(Store, { keys: ["count", "name"] });

    // Should return only selected keys
    const count: number = data.count;
    const name: string = data.name;
    // @ts-expect-error - should not have unselected keys
    const user = data.user;
    // @ts-expect-error - should not accept invalid keys
    const invalid = useStore(Store, { keys: ["invalidKey"] });
}

// Test 5: useStore with mutation
function testUseStoreWithMutation() {
    // Mutation without keys
    const doubled = useStore(Store, {
        mutation: (Store) => Store.count * 2,
    });
    const doubledType: number = doubled;

    // Mutation with keys
    const computed = useStore(Store, {
        keys: ["count", "name"],
        mutation: (Store) => `${Store.name}: ${Store.count}`,
    });
    const computedType: string = computed;

    // Mutation should receive correct types
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
}

// Test 6: Store instance structure
function testStoreInstance() {
    // Should have _initial
    const initial: TestStore = Store._initial;

    // Should have _context
    const context = Store._context;

    // Should be callable as Provider
    const Provider = Store.Provider;

    // Should have Consumer
    const Consumer = Store.Consumer;
}

// Test 7: Provider value prop
function testProviderValue() {
    // Should accept optional value prop
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

// Test 8: Consumer options
function testConsumerOptions() {
    // No options
    <Store.Consumer>{(data: TestStore) => <div>{data.count}</div>}</Store.Consumer>;

    // With keys
    <Store.Consumer options={{ keys: ["count", "name"] }}>
        {(data: { count: number; name: string }) => <div>{data.count}</div>}
    </Store.Consumer>;

    // With mutation
    <Store.Consumer
        options={{
            mutation: (Store) => Store.count * 2,
        }}
    >
        {/* @TODO add support for argument type with mutation. i.e. (doubled: number) => <div>{doubled}</div> */}
        {(doubled) => <div>{doubled as number}</div>}
    </Store.Consumer>;

    // With keys and mutation
    <Store.Consumer
        options={{
            keys: ["count"],
            mutation: (Store) => Store.count * 2,
        }}
    >
        {(doubled) => <div>{doubled as number}</div>}
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
                    // All parameters should be correctly typed
                    const count: number = Store.count;
                    update({ count: 1 });
                    const unsubscribe = listen("count", (value: number) => {});
                    unlisten("count", () => {});
                    // Can return cleanup function
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

// All tests should compile without errors if types are correct
export {};
