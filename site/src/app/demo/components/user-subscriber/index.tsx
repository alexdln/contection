"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function UserSubscriber() {
    const { user } = useStore(DemoStore, { keys: ["user"] });

    return (
        <RenderTracker label="User Only" color="#f59e0b">
            <p className="card-desc">Only when user changes</p>
            <div className="card-values">
                <code>{user.name}</code>
                <code>{user.email}</code>
            </div>
        </RenderTracker>
    );
}
