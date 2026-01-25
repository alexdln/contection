"use client";

import { createStore } from "contection";

export interface DemoStore {
    counter: number;
    user: {
        name: string;
        email: string;
    };
    theme: "light" | "dark";
    settings: {
        notifications: boolean;
        language: string;
    };
}

export const initialState: DemoStore = {
    counter: 0,
    user: {
        name: "Alex",
        email: "alex@example.com",
    },
    theme: "light",
    settings: {
        notifications: true,
        language: "en",
    },
};

export const DemoStore = createStore<DemoStore>(initialState);
