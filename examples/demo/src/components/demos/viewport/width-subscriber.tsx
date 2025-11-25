import { useViewportWidth } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const WidthSubscriber: React.FC = () => {
    const width = useViewportWidth(ViewportStore);

    return (
        <RenderTracker path="/components/demos/viewport/width-subscriber.tsx" color="#ef4444">
            <Card title="Raw Size" description="Re-renders on every width change">
                <div>{width}px</div>
            </Card>
        </RenderTracker>
    );
};
