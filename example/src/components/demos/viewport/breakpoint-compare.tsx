import { useViewportWidthCompare } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const BreakpointCompare: React.FC = () => {
    const isTabletOrLarger = useViewportWidthCompare(ViewportStore, {
        compareWith: "tablet",
        type: "default",
        mode: ["equal", "greater"],
    });

    const isDesktop = useViewportWidthCompare(ViewportStore, {
        compareWith: "desktop",
        type: "default",
        mode: ["equal", "greater"],
    });

    return (
        <RenderTracker path="/components/demos/viewport/breakpoint-compare.tsx" color="#f59e0b">
            <Card title="Breakpoint Comparison" description="Re-renders ONLY when comparison result changes">
                <div>
                    Tablet+: <strong>{isTabletOrLarger ? "Yes" : "No"}</strong>
                </div>
                <div>
                    Desktop+: <strong>{isDesktop ? "Yes" : "No"}</strong>
                </div>
            </Card>
        </RenderTracker>
    );
};
