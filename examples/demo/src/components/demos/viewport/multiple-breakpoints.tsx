import { useViewportWidthBreakpoint } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const MultipleBreakpoints: React.FC = () => {
    const defaultBreakpoint = useViewportWidthBreakpoint(ViewportStore, { type: "default" });
    const contentBreakpoint = useViewportWidthBreakpoint(ViewportStore, { type: "content" });

    return (
        <RenderTracker path="/components/demos/viewport/multiple-breakpoints.tsx" color="#6366f1">
            <Card title="Multiple Breakpoint Types" description="Different breakpoint categories">
                <div>
                    Default: <strong>{defaultBreakpoint.current}</strong>
                </div>
                <div>
                    Content: <strong>{contentBreakpoint.current}</strong>
                </div>
            </Card>
        </RenderTracker>
    );
};
