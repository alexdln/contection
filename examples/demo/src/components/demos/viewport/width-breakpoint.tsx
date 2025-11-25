import { useViewportWidthBreakpoint } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const WidthBreakpoint: React.FC = () => {
    const breakpoint = useViewportWidthBreakpoint(ViewportStore, { type: "default" });

    return (
        <RenderTracker path="/components/demos/viewport/width-breakpoint.tsx" color="#10b981">
            <Card title="Width Breakpoint" description="Re-renders ONLY when 'default' width breakpoint changes">
                <div>Current: {breakpoint.current || "unknown"}</div>
                <div>Lower: {breakpoint.lowerBreakpoints?.join(", ") || "none"}</div>
            </Card>
        </RenderTracker>
    );
};
