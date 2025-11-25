import { useViewport } from "contection-viewport";

import { ViewportStore } from "../../../stores/viewport-store";
import { Card } from "../../ui/card";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

export const CustomMutation: React.FC = () => {
    const showBanner = useViewport(ViewportStore, {
        keys: ["width"],
        mutation: (state) => state.width !== null && state.width > 1024,
    });

    return (
        <RenderTracker path="/components/demos/viewport/custom-mutation.tsx" color="#ec4899">
            <Card title="Custom Mutation" description="Computed value from viewport state">
                {showBanner ? <div>Wide Screen Banner Active</div> : <div>No banner</div>}
            </Card>
        </RenderTracker>
    );
};
