import { useUpperLayerStore } from "contection-top-layer";

import { UpperLayers } from "../../../stores/top-layer-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const UpperLayerStatus: React.FC = () => {
    const notification = useUpperLayerStore(UpperLayers.NotificationLayer);
    const tooltip = useUpperLayerStore(UpperLayers.TooltipLayer);

    return (
        <RenderTracker path="/components/demos/top-layer/upper-layer-status.tsx" color="#10b981">
            <Card title="Upper Layer Status" description="Re-renders when layer data changes">
                <div className="demo-top-layer__card-content">
                    <div>
                        Notification: <strong>{notification.data ? notification.data.type : "None"}</strong>
                    </div>
                    <div>
                        Tooltip: <strong>{tooltip.data ? "Visible" : "Hidden"}</strong>
                    </div>
                </div>
            </Card>
        </RenderTracker>
    );
};
