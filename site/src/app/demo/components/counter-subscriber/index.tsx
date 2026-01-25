"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function CounterSubscriber() {
    const { counter } = useStore(DemoStore, { keys: ["counter"] });

    return (
        <RenderTracker label="Counter Only" color="#10b981">
            <p className="card-desc">Only when counter changes</p>
            <div className="card-value">{counter}</div>
        </RenderTracker>
    );
}
