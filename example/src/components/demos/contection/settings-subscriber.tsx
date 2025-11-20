import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const SettingsSubscriber: React.FC = () => {
    const { settings } = useStore(AppStore, { keys: ["settings"] });

    return (
        <RenderTracker path="/components/demos/contection/settings-subscriber.tsx" color="#f99200">
            <Card title="Settings Only" description="Re-renders ONLY when settings change">
                <div>Timezone: {settings.timezone}</div>
                <div>Language: {settings.language}</div>
            </Card>
        </RenderTracker>
    );
};
