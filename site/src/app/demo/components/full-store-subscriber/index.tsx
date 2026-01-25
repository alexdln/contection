"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function FullStoreSubscriber() {
    const store = useStore(DemoStore);

    return (
        <RenderTracker label="Full Store" color="#ef4444">
            <p className="card-desc">Re-renders on ANY change</p>
            <div className="card-values">
                <code>counter: {store.counter}</code>
                <code>theme: {store.theme}</code>
                <code>user: {store.user.name}</code>
            </div>
        </RenderTracker>
    );
}
