import { InfoBanner } from "../../components/ui/info-banner";
import {
    WidthSubscriber,
    WidthBreakpoint,
    BreakpointCompare,
    MultipleBreakpoints,
    HeightBreakpoint,
    CustomMutation,
    ResponsiveLayoutDemo,
} from "../../components/demos/viewport";
import { RenderTracker } from "../../components/ui/render-tracker";

import "./styles.scss";

export const ViewportPage: React.FC = () => {
    return (
        <RenderTracker path="/pages/viewport/index.tsx" color="#ef4444">
            <div className="page-viewport">
                <InfoBanner>
                    <div>
                        <a
                            href="https://www.npmjs.com/package/contection-viewport"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            npm
                        </a>
                        {" • "}
                        <code>npm install contection contection-viewport</code>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        Resize your browser window to see selective re-renders in action. Components with breakpoint
                        subscriptions only re-render when the breakpoint changes, not on every pixel change.
                    </div>
                </InfoBanner>

                <div className="page-viewport__grid">
                    <WidthSubscriber />
                    <WidthBreakpoint />
                    <BreakpointCompare />
                    <MultipleBreakpoints />
                    <HeightBreakpoint />
                    <CustomMutation />
                </div>

                <ResponsiveLayoutDemo />
            </div>
        </RenderTracker>
    );
};
