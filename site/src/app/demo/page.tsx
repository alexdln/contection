"use client";

import { DemoStore, initialState } from "./store";
import {
    FullStoreSubscriber,
    CounterSubscriber,
    UserSubscriber,
    ThemeSubscriber,
    ComputedSubscriber,
    ConditionalSubscriber,
    NoRenderControls,
    ConsumerDemo,
    StoreControls,
    Level1,
} from "./components";

import "./demo.scss";

export default function DemoPage() {
    return (
        <DemoStore value={initialState}>
            <main className="r-container main">
                <section className="section">
                    <h2>Controls</h2>
                    <StoreControls />
                </section>

                <section className="section">
                    <h2>Subscription Patterns</h2>
                    <div className="grid">
                        <FullStoreSubscriber />
                        <CounterSubscriber />
                        <UserSubscriber />
                        <ThemeSubscriber />
                        <ComputedSubscriber />
                        <ConditionalSubscriber />
                        <NoRenderControls />
                        <ConsumerDemo />
                    </div>
                </section>

                <section className="section">
                    <h2>Nested Components</h2>
                    <p className="section-desc">Each level subscribes independently</p>
                    <div className="nested">
                        <Level1 />
                    </div>
                </section>
            </main>
        </DemoStore>
    );
}
