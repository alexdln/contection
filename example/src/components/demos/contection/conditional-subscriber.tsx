import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const ConditionalSubscriber: React.FC = () => {
    const { counter } = useStore(AppStore, {
        keys: ["counter"],
        enabled: (store) => store.theme === "dark",
    });

    return (
        <RenderTracker path="/components/demos/contection/conditional-subscriber.tsx" color="#ec4899">
            <Card title="Conditional Subscription" description="Only subscribes when theme is dark">
                <div>Counter is {counter}</div>
            </Card>
        </RenderTracker>
    );
};
