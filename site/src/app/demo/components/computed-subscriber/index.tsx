"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function ComputedSubscriber() {
    const counterTens = useStore(DemoStore, {
        keys: ["counter"],
        mutation: (store) => Math.floor(store.counter / 10),
    });

    return (
        <RenderTracker label="Computed" color="#ec4899">
            <p className="card-desc">Only when counter / 10 changes</p>
            <div className="card-value">{counterTens}</div>
        </RenderTracker>
    );
}
