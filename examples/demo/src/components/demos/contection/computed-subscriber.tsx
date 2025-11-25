import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const ComputedSubscriber: React.FC = () => {
    const counterQuotient10 = useStore(AppStore, {
        keys: ["counter"],
        mutation: (store) => Math.floor(store.counter / 10),
    });

    return (
        <RenderTracker path="/components/demos/contection/computed-subscriber.tsx" color="#8b5cf6">
            <Card title="Computed Value" description="Re-renders ONLY when computed value changes">
                <div>
                    Counter / 10 = <strong>{counterQuotient10}</strong>
                </div>
            </Card>
        </RenderTracker>
    );
};
