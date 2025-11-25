import { useStore } from "contection";

import { AppStore } from "../../../stores/app-store";
import { RenderTracker } from "../../ui/render-tracker";

import "./styles.scss";

const NestedLevel3: React.FC = () => {
    const { theme } = useStore(AppStore, { keys: ["theme"] });

    return (
        <RenderTracker path="/components/demos/contection/nested-components-demo.tsx" color="#322cf3">
            <div className="demo-contection__nested-level">
                <div>Level 3 - Theme: {theme}</div>
                <div className="demo-contection__nested-note">
                    Each level subscribes to different keys, so they re-render independently.
                </div>
            </div>
        </RenderTracker>
    );
};

const NestedLevel2Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const userEmail = useStore(AppStore, { keys: ["user"], mutation: (store) => store.user.email });

    return (
        <RenderTracker path="/components/demos/contection/nested-components-demo.tsx" color="#2a4f06">
            <div className="demo-contection__nested-level">
                <div>Level 2 - User Email [as Layout]: {userEmail}</div>
                {children}
            </div>
        </RenderTracker>
    );
};

const NestedLevel2: React.FC = () => {
    return (
        <NestedLevel2Layout>
            <NestedLevel3 />
        </NestedLevel2Layout>
    );
};

export const NestedComponentsDemo: React.FC = () => {
    return (
        <RenderTracker path="/components/demos/contection/nested-components-demo.tsx" color="#3b82f6">
            <div className="demo-contection__nested-level">
                <AppStore.Consumer options={{ keys: ["counter"] }}>
                    {({ counter }) => (
                        <RenderTracker path="/components/demos/contection/nested-components-demo.tsx" color="#3282f6">
                            <div>Level 1 - Counter [in Consumer]: {counter}</div>
                        </RenderTracker>
                    )}
                </AppStore.Consumer>
                <NestedLevel2 />
            </div>
        </RenderTracker>
    );
};
