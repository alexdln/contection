import { Dialogs } from "../../stores/top-layer-store";
import {
    DialogStatus,
    UpperLayerStatus,
    GlobalLayerStatus,
    DialogDemo,
    SettingsDialogDemo,
    TopLayerControls,
} from "../../components/demos/top-layer";
import { InfoBanner } from "../../components/ui/info-banner";

import "./styles.scss";
import { RenderTracker } from "../../components/ui/render-tracker";

export const TopLayerPage: React.FC = () => {
    return (
        <RenderTracker path="/pages/top-layer/index.tsx" color="#ef4444">
            <div className="page-top-layer">
                <InfoBanner>
                    <div>
                        <a
                            href="https://www.npmjs.com/package/contection-top-layer"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            npm
                        </a>
                        {" • "}
                        <code>npm install contection contection-top-layer</code>
                    </div>
                    <br />
                    <p>Dialogs are natively implemented using the HTML dialog element</p>
                </InfoBanner>
                <TopLayerControls />

                <div className="page-top-layer__grid">
                    <DialogStatus />
                    <UpperLayerStatus />
                    <GlobalLayerStatus />
                </div>

                <Dialogs.ConfirmDialog>
                    <DialogDemo />
                </Dialogs.ConfirmDialog>
                <Dialogs.SettingsDialog>
                    <SettingsDialogDemo />
                </Dialogs.SettingsDialog>
            </div>
        </RenderTracker>
    );
};
