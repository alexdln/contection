import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const FullStoreSubscriber: React.FC = () => {
    const store = useStore(AppStore);

    return (
        <RenderTracker path="/components/demos/contection/full-store-subscriber.tsx" color="#ef4444">
            <Card title="Full Store Subscription" description="Re-renders on ANY store change">
                <div>Tab: {store.tab}</div>
                <div>Theme: {store.theme}</div>
                <div>Counter: {store.counter}</div>
            </Card>
        </RenderTracker>
    );
};
