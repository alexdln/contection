import { createStore } from "contection";
import React from "react";

import { TestStoreType, createTestStore } from "../../fixtures/test-store";

describe("createStore", () => {
    describe("basic store creation", () => {
        it("should have all required properties", () => {
            const Store = createTestStore();
            expect(Store).toHaveProperty("_initial");
            expect(Store).toHaveProperty("_context");
            expect(Store).toHaveProperty("Provider");
            expect(Store).toHaveProperty("Consumer");
            expect(Store).toHaveProperty("$$typeof");
        });

        it("should create a store with initial data", () => {
            const initialData: TestStoreType = {
                count: 0,
                name: "Test",
                user: { id: 1, email: "test@example.com" },
                theme: "light",
                items: [],
            };

            const Store = createStore(initialData);

            expect(Store._initial).toEqual(initialData);
            expect(Store._context).toBeDefined();
            expect(Store.Provider).toBeDefined();
            expect(Store.Consumer).toBeDefined();
        });

        it("should have correct $$typeof symbol", () => {
            const Store = createTestStore();
            expect(Store.$$typeof).toBe(Symbol.for("contection.store"));
        });

        it("should create a valid React Context", () => {
            const Store = createTestStore();
            expect(Store._context).toBeDefined();
            expect(Store._context.Provider).toBeDefined();
            expect(Store._context.Consumer).toBeDefined();
        });

        it("should allow Provider to be called as function", () => {
            const Store = createTestStore();
            const TestComponent = () => (
                <Store.Provider>
                    <div>Test</div>
                </Store.Provider>
            );
            expect(TestComponent).toBeDefined();
        });

        it("should allow store to be called as function (same as Provider)", () => {
            const Store = createTestStore();
            const TestComponent = () => (
                <Store>
                    <div>Test</div>
                </Store>
            );
            expect(TestComponent).toBeDefined();
        });
    });

    describe("store with lifecycle hooks", () => {
        it("should accept lifecycle hooks in options", () => {
            const storeWillMount = jest.fn();
            const storeDidMount = jest.fn();
            const storeWillUnmount = jest.fn();
            const storeWillUnmountAsync = jest.fn();

            const Store = createStore<TestStoreType>(
                {
                    count: 0,
                    name: "Test",
                    user: { id: 1, email: "test@example.com" },
                    theme: "light",
                    items: [],
                },
                {
                    lifecycleHooks: {
                        storeWillMount,
                        storeDidMount,
                        storeWillUnmount,
                        storeWillUnmountAsync,
                    },
                },
            );

            expect(Store).toBeDefined();
            // Hooks tested in provider tests
        });

        it("should work without lifecycle hooks", () => {
            const Store = createTestStore();
            expect(Store).toBeDefined();
        });
    });

    describe("store with validate option", () => {
        it("should accept validate option in createStore", () => {
            const validate = jest.fn(() => true);
            const initialData: TestStoreType = {
                count: 0,
                name: "Test",
                user: { id: 1, email: "test@example.com" },
                theme: "light",
                items: [],
            };

            const Store = createStore(initialData, { validate });

            expect(Store).toBeDefined();
            // Validation happens in provider, not during store creation
            expect(validate).not.toHaveBeenCalled();
        });

        it("should work without validate option", () => {
            const Store = createTestStore();
            expect(Store).toBeDefined();
        });
    });
});
