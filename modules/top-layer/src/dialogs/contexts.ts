import { createContext } from "react";

import { type DialogWrapperContext as DialogWrapperContextType } from "./types";

export const DialogWrapperContext = createContext<DialogWrapperContextType>({});
