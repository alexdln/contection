import { createContext } from "react";

import { type UpperLayerContext as UpperLayerContextType } from "./types";

export const UpperLayerContext = createContext<UpperLayerContextType>({});
