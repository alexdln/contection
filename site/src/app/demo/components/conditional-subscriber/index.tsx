"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function ConditionalSubscriber() {
    const { counter } = useStore(DemoStore, {
        keys: ["counter"],
        enabled: (store) => store.theme === "dark",
    });

    return (
        <RenderTracker label="Conditional" color="#06b6d4">
            <p className="card-desc">Counter only when theme is dark</p>
            <div className="card-value">{counter}</div>
        </RenderTracker>
    );
}
