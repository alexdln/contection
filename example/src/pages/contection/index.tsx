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
import { InfoBanner } from "../../components/ui/info-banner";
import { RenderTracker } from "../../components/ui/render-tracker";

import "./styles.scss";

export const ContectionPage: React.FC = () => {
    return (
        <RenderTracker path="/pages/contection/index.tsx" color="#ef4444">
            <div className="page-contection">
                <InfoBanner>
                    <div>
                        <a href="https://www.npmjs.com/package/contection" target="_blank" rel="noopener noreferrer">
                            npm
                        </a>
                        {" • "}
                        <code>npm install contection</code>
                    </div>
                </InfoBanner>
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
