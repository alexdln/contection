import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const UserSubscriber: React.FC = () => {
    const { user } = useStore(AppStore, { keys: ["user"] });

    return (
        <RenderTracker path="/components/demos/contection/user-subscriber.tsx" color="#f59e0b">
            <Card title="User Only" description="Re-renders ONLY when user changes">
                <div>Name: {user.name}</div>
                <div>Email: {user.email}</div>
            </Card>
        </RenderTracker>
    );
};
