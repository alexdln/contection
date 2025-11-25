import { useTopLayerStore } from "contection-top-layer";

import { TopLayerStore } from "../../../stores/top-layer-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const GlobalLayerStatus: React.FC = () => {
    const { hasActiveIsolatedLayers, hasActiveLayers } = useTopLayerStore(TopLayerStore, {
        keys: ["hasActiveIsolatedLayers", "hasActiveLayers"],
    });

    return (
        <RenderTracker path="/components/demos/top-layer/global-layer-status.tsx" color="#6366f1">
            <Card title="Global Layer Status" description="Re-renders when global layer state changes">
                <div className="demo-top-layer__card-content">
                    <div>
                        Isolated Layers: <strong>{hasActiveIsolatedLayers ? "Active" : "Inactive"}</strong>
                    </div>
                    <div>
                        Any Layers: <strong>{hasActiveLayers ? "Active" : "Inactive"}</strong>
                    </div>
                </div>
            </Card>
        </RenderTracker>
    );
};
