import {
    FullStoreSubscriber,
    CounterSubscriber,
    UserSubscriber,
    ComputedSubscriber,
    ConditionalSubscriber,
    NestedComponentsDemo,
    StoreControls,
    SettingsSubscriber,
} from "../../components/demos/contection";
import { RenderTracker } from "../../components/ui/render-tracker";

import "./styles.scss";

export const ContectionPage: React.FC = () => {
    return (
        <RenderTracker path="/pages/contection/index.tsx" color="#ef4444">
            <div className="page-contection">
                <StoreControls />

                <div className="page-contection__grid">
                    <FullStoreSubscriber />
                    <UserSubscriber />
                    <SettingsSubscriber />
                    <CounterSubscriber />
                    <ConditionalSubscriber />
                    <ComputedSubscriber />
                </div>

                <NestedComponentsDemo />
            </div>
        </RenderTracker>
    );
};
