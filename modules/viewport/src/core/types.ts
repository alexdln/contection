import { type createStore } from "contection";
import { type GlobalStore, type StoreOptions } from "contection/dist/types";

export type CompareMode = "equal" | "greater" | "less";

export type ViewportCategory = {
    [breakpoint: string]: number;
};

export type ViewportCategories = {
    [category: string]: ViewportCategory;
};

export type CategoryCompare<Categories extends ViewportCategories, Category extends keyof Categories> = {
    lowerBreakpoints: (keyof Categories[Category])[] | null;
    current: keyof Categories[Category] | null;
};

export interface ViewportStore<
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
> {
    width: number | null;
    height: number | null;
    widthCategories: {
        [Category in keyof WidthCategories]: CategoryCompare<WidthCategories, Category>;
    };
    heightCategories: {
        [Category in keyof HeightCategories]: CategoryCompare<HeightCategories, Category>;
    };
    node: HTMLElement | Window | null | undefined;
}

export type ViewportEnabled<
    WidthCategories extends ViewportCategories,
    HeightCategories extends ViewportCategories,
> = StoreOptions<ViewportStore<WidthCategories, HeightCategories>>["enabled"];

export type DetectCategories<CurrentCategories, DefaultCategories> = CurrentCategories extends undefined
    ? DefaultCategories
    : CurrentCategories extends ViewportCategories
      ? CurrentCategories
      : never;

export type StoreInstance<WidthCategories extends ViewportCategories, HeightCategories extends ViewportCategories> = {
    /** The initial store data passed to createStore */
    readonly _initial: ReturnType<typeof createStore<ViewportStore<WidthCategories, HeightCategories>>>["_initial"];
    /** The underlying React Context used for the store */
    readonly _context: React.Context<GlobalStore<ViewportStore<WidthCategories, HeightCategories>>>;
    ({ children }: { children: React.ReactNode }): React.ReactNode;
    /** Consumer component for render props pattern */
    Consumer: ReturnType<typeof createStore<ViewportStore<WidthCategories, HeightCategories>>>["Consumer"];
    /** Provider component (alternative to calling the instance directly) */
    Provider({ children }: { children: React.ReactNode }): React.ReactNode;
};
