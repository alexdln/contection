import React from "react";
import { prepareStore } from "contection/src/prepare-store";
import { createStore, useStore } from "contection/src";

import { render, screen } from "../../setup/test-utils";

type TestStore = {
    count: number;
    name: string;
};

describe("prepareStore", () => {
    const initialData: TestStore = {
        count: 0,
        name: "initial",
    };

    describe("basic functionality", () => {
        it("should return initialData, options, and getStore", () => {
            const result = prepareStore(initialData);

            expect(result).toHaveProperty("initialData");
            expect(result).toHaveProperty("options");
            expect(result).toHaveProperty("getStore");
            expect(typeof result.getStore).toBe("function");
        });

        it("should preserve initialData", () => {
            const result = prepareStore(initialData);

            expect(result.initialData).toEqual(initialData);
        });
    });

    describe("getStore with getServerSnapshot", () => {
        it("should call getServerSnapshot with initialData", () => {
            const getServerSnapshot = jest.fn((store: TestStore) => ({
                ...store,
                count: 10,
            }));

            const { getStore } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot,
                },
            });

            const result = getStore();

            expect(getServerSnapshot).toHaveBeenCalledWith(initialData);
            expect(result).toEqual({ count: 10, name: "initial" });
        });

        it("should support async getServerSnapshot", async () => {
            const getServerSnapshot = jest.fn(async (store: TestStore) => {
                await Promise.resolve();
                return {
                    ...store,
                    count: 20,
                };
            });

            const { getStore } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot,
                },
            });

            const result = await getStore();

            expect(getServerSnapshot).toHaveBeenCalledWith(initialData);
            expect(result).toEqual({ count: 20, name: "initial" });
        });

        it("should allow getServerSnapshot to transform store", async () => {
            const getServerSnapshot = jest.fn((store: TestStore) => ({
                ...store,
                name: "transformed",
            }));

            const { getStore } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot,
                },
            });

            const result = await getStore();

            expect(result.name).toBe("transformed");
            expect(result.count).toBe(0);
        });
    });

    describe("options handling", () => {
        it("should remove getServerSnapshot from adapter in returned options", () => {
            const { options } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot: () => initialData,
                    beforeInit: (store) => store,
                },
            });

            expect(options.adapter).not.toHaveProperty("getServerSnapshot");
            expect(options.adapter?.beforeInit).toBeDefined();
        });

        it("should preserve other adapter options", () => {
            const beforeInit = jest.fn((store: TestStore) => store);
            const afterInit = jest.fn();
            const beforeUpdate = jest.fn((store: TestStore, part) => part);
            const afterUpdate = jest.fn();
            const beforeDestroy = jest.fn();

            const { options } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot: () => initialData,
                    beforeInit,
                    afterInit,
                    beforeUpdate,
                    afterUpdate,
                    beforeDestroy,
                },
            });

            expect(options.adapter?.beforeInit).toBe(beforeInit);
            expect(options.adapter?.afterInit).toBe(afterInit);
            expect(options.adapter?.beforeUpdate).toBe(beforeUpdate);
            expect(options.adapter?.afterUpdate).toBe(afterUpdate);
            expect(options.adapter?.beforeDestroy).toBe(beforeDestroy);
        });

        it("should preserve non-adapter options", () => {
            const storeWillMount = jest.fn();
            const validate = jest.fn(() => true);

            const { options } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot: () => initialData,
                },
                lifecycleHooks: {
                    storeWillMount,
                },
                validate,
            });

            expect(options.lifecycleHooks?.storeWillMount).toBe(storeWillMount);
            expect(options.validate).toBe(validate);
        });

        it("should return options with empty adapter when no options provided", () => {
            const { options } = prepareStore(initialData);

            expect(options).toEqual({ adapter: undefined });
        });

        it("should return empty adapter when only getServerSnapshot is provided", () => {
            const { options } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot: () => initialData,
                },
            });

            expect(options.adapter).toEqual({});
        });
    });

    describe("integration with createStore and Provider", () => {
        it("should work with createStore, async getServerSnapshot, and Provider", async () => {
            const {
                getStore,
                initialData: initial,
                options,
            } = prepareStore(initialData, {
                adapter: {
                    getServerSnapshot: async (store) => ({ ...store, count: 42, name: "server" }),
                    beforeInit: (store) => store,
                    beforeUpdate: (store, part) => part,
                },
            });

            const Store = createStore(initial, options);

            const TestComponent = () => {
                const store = useStore(Store, { keys: ["count", "name"] });
                return (
                    <div>
                        <span data-testid="count">{store.count}</span>
                        <span data-testid="name">{store.name}</span>
                    </div>
                );
            };

            const serverStore = await getStore();
            render(
                <Store.Provider value={serverStore}>
                    <TestComponent />
                </Store.Provider>,
            );

            expect(screen.getByTestId("count")).toHaveTextContent("42");
            expect(screen.getByTestId("name")).toHaveTextContent("server");
        });
    });
});
