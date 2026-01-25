"use client";

import { DemoStore } from "../../store";
import { RenderTracker } from "../render-tracker";

export function ConsumerDemo() {
    return (
        <RenderTracker label="Consumer" color="#f97316">
            <p className="card-desc">Render-prop pattern</p>
            <DemoStore.Consumer options={{ keys: ["counter", "theme"] }}>
                {({ counter, theme }) => (
                    <div className="card-values">
                        <code>counter: {counter}</code>
                        <code>theme: {theme}</code>
                    </div>
                )}
            </DemoStore.Consumer>
        </RenderTracker>
    );
}
