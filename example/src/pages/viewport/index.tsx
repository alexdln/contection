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
                    <br />
                    <p>Resize your browser window to see selective re-renders in action</p>
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
