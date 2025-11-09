import { createStore } from "contection";

export type TestStoreType = {
    count: number;
    name: string;
    user: {
        id: number;
        email: string;
    };
    theme: "light" | "dark";
    items: string[];
};

export const createTestStore = (
    initialData?: Partial<TestStoreType>,
    options?: Parameters<typeof createStore<TestStoreType>>[1],
) => {
    const defaultData: TestStoreType = {
        count: 0,
        name: "Test",
        user: {
            id: 1,
            email: "test@example.com",
        },
        theme: "light",
        items: [],
    };

    return createStore<TestStoreType>({ ...defaultData, ...initialData }, options);
};
