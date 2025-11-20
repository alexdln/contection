import { useViewportWidthCompare } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { RenderTracker } from "../../ui/render-tracker";
import { ResponsiveCard } from "../../ui/responsive-card";

import "./styles.scss";

export const ResponsiveLayoutDemo: React.FC = () => {
    const isMobile = useViewportWidthCompare(ViewportStore, {
        compareWith: "tablet",
        type: "default",
        mode: ["less"],
    });

    const isDesktop = useViewportWidthCompare(ViewportStore, {
        compareWith: "desktop",
        type: "default",
        mode: ["equal", "greater"],
    });

    return (
        <RenderTracker path="/components/demos/viewport/responsive-layout-demo.tsx" color="#14b8a6">
            <div className="demo-viewport__responsive-demo">
                <div className="demo-viewport__layout-info">
                    Current layout based on breakpoint: {isMobile ? "Mobile" : isDesktop ? "Desktop" : "Tablet"}
                </div>
                <div
                    className={`demo-viewport__responsive-grid ${
                        isMobile
                            ? "demo-viewport__responsive-grid--mobile"
                            : isDesktop
                              ? "demo-viewport__responsive-grid--desktop"
                              : "demo-viewport__responsive-grid--tablet"
                    }`}
                >
                    <ResponsiveCard>Card 1</ResponsiveCard>
                    <ResponsiveCard>Card 2</ResponsiveCard>
                    <ResponsiveCard>Card 3</ResponsiveCard>
                </div>
            </div>
        </RenderTracker>
    );
};
