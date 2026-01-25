"use client";

import { useStoreReducer } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function NoRenderControls() {
    const [store, setStore] = useStoreReducer(DemoStore);

    return (
        <RenderTracker label="useStoreReducer" color="#64748b">
            <p className="card-desc">Updates without re-rendering this component</p>
            <div className="card-buttons">
                <button className="btn sm" onClick={() => setStore({ counter: store.counter + 100 })}>
                    +100
                </button>
                <button
                    className="btn sm"
                    onClick={() => {
                        const newName = `User_${Math.random().toString(36).slice(2, 6)}`;
                        setStore((prev) => ({ user: { ...prev.user, name: newName } }));
                    }}
                >
                    Random Name
                </button>
            </div>
        </RenderTracker>
    );
}
