"use client";

import { useStore } from "contection";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function ThemeSubscriber() {
    const { theme } = useStore(DemoStore, { keys: ["theme"] });

    return (
        <RenderTracker label="Theme Only" color="#8b5cf6">
            <p className="card-desc">Only when theme changes</p>
            <div className="card-value">{theme}</div>
        </RenderTracker>
    );
}
