import { type createStore } from "contection";
import { type GlobalStore, type StoreOptions } from "contection/dist/types";

export type ViewportBreakpoint = {
    [name: string]: number;
};

export type ViewportBreakpoints = {
    [key: string]: ViewportBreakpoint;
};

export type Option<Options extends ViewportBreakpoints, Key extends keyof Options> = {
    lowerBreakpoints: (keyof Options[Key])[] | null;
    current: keyof Options[Key] | null;
};

export interface ViewportStoreType<
    BreakpointWidthOptions extends ViewportBreakpoints,
    BreakpointHeightOptions extends ViewportBreakpoints | undefined = undefined,
> {
    width: number | null;
    height: number | null;
    widthOptions: {
        [Key in keyof BreakpointWidthOptions]: Option<BreakpointWidthOptions, Key>;
    };
    heightOptions: BreakpointHeightOptions extends undefined
        ? undefined
        : {
              [Key in keyof BreakpointHeightOptions]: Option<Exclude<BreakpointHeightOptions, undefined>, Key>;
          };
    mounted: boolean;
    node: HTMLElement | Window | null | undefined;
}

export type ViewportEnabled<
    WidthOptions extends ViewportBreakpoints,
    HeightOptions extends ViewportBreakpoints | undefined,
> = StoreOptions<ViewportStoreType<WidthOptions, HeightOptions>>["enabled"];

export type DetectViewportType<BreakpointOptions, DefaultBreakpoint> = BreakpointOptions extends undefined
    ? DefaultBreakpoint
    : BreakpointOptions extends ViewportBreakpoints
      ? BreakpointOptions
      : never;

export type StoreInstance<
    BreakpointWidthOptions extends ViewportBreakpoints,
    BreakpointHeightOptions extends ViewportBreakpoints | undefined,
> = {
    /** The initial store data passed to createStore */
    readonly _initial: ReturnType<
        typeof createStore<ViewportStoreType<BreakpointWidthOptions, BreakpointHeightOptions>>
    >["_initial"];
    /** The underlying React Context used for the store */
    readonly _context: React.Context<GlobalStore<ViewportStoreType<BreakpointWidthOptions, BreakpointHeightOptions>>>;
    ({ children }: { children: React.ReactNode }): React.ReactNode;
    /** Consumer component for render props pattern */
    Consumer: ReturnType<
        typeof createStore<ViewportStoreType<BreakpointWidthOptions, BreakpointHeightOptions>>
    >["Consumer"];
    /** Provider component (alternative to calling the instance directly) */
    Provider({ children }: { children: React.ReactNode }): React.ReactNode;
};
