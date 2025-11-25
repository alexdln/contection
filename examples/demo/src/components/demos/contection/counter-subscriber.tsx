import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const CounterSubscriber: React.FC = () => {
    const { counter } = useStore(AppStore, { keys: ["counter"] });

    return (
        <RenderTracker path="/components/demos/contection/counter-subscriber.tsx" color="#10b981">
            <Card title="Counter Only" description="Re-renders ONLY when counter changes">
                <div>{counter}</div>
            </Card>
        </RenderTracker>
    );
};
