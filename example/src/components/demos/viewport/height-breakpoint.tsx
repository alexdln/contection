import { useViewportHeightBreakpoint } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const HeightBreakpoint: React.FC = () => {
    const heightBreakpoint = useViewportHeightBreakpoint(ViewportStore, { type: "vertical" });

    return (
        <RenderTracker path="/components/demos/viewport/height-breakpoint.tsx" color="#8b5cf6">
            <Card title="Height Breakpoint" description="Vertical breakpoints">
                <div>Current: {heightBreakpoint.current}</div>
                <div>Lower: {heightBreakpoint.lowerBreakpoints?.join(", ") || "none"}</div>
            </Card>
        </RenderTracker>
    );
};
