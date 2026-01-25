"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

import "./styles.scss";

function Level3() {
    const { theme } = useStore(DemoStore, { keys: ["theme"] });
    return (
        <RenderTracker label="Level 3 (theme)" color="#a855f7">
            <span className="nested-value">{theme}</span>
        </RenderTracker>
    );
}

function Level2() {
    const email = useStore(DemoStore, {
        keys: ["user"],
        mutation: (store) => store.user.email,
    });
    return (
        <RenderTracker label="Level 2 (email)" color="#3b82f6">
            <span className="nested-value">{email}</span>
            <Level3 />
        </RenderTracker>
    );
}

export function Level1() {
    return (
        <RenderTracker label="Level 1 (counter/in consumer)" color="#22c55e">
            <DemoStore.Consumer options={{ keys: ["counter"] }}>
                {({ counter }) => <span className="nested-value">{counter}</span>}
            </DemoStore.Consumer>
            <Level2 />
        </RenderTracker>
    );
}
