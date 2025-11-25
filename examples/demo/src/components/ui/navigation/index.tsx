import { useViewportWidthCompare } from "contection-viewport";
import { useStore, useStoreReducer } from "contection";

import { AppStore } from "../../../stores/app-store";
import { ViewportStore } from "../../../stores/viewport-store";

import "./styles.scss";

type Page = "contection" | "viewport" | "top-layer" | "todo";

export const Navigation: React.FC = () => {
    const [, setStore] = useStoreReducer(AppStore);
    const isMobile = useViewportWidthCompare(ViewportStore, {
        compareWith: "tablet",
        type: "default",
        mode: ["less"],
    });

    const navigateHandler = (tab: Page) => {
        setStore({ tab });
    };

    return (
        <nav className="navigation">
            <div className={`navigation__container ${isMobile ? "navigation__container--mobile" : ""}`}>
                <NavButton tab="todo" onClick={() => navigateHandler("todo")}>
                    Todo List
                </NavButton>
                <NavButton tab="contection" onClick={() => navigateHandler("contection")}>
                    Store Management
                </NavButton>
                <NavButton tab="viewport" onClick={() => navigateHandler("viewport")}>
                    Viewport
                </NavButton>
                <NavButton tab="top-layer" onClick={() => navigateHandler("top-layer")}>
                    Top Layer
                </NavButton>
            </div>
        </nav>
    );
};

interface NavButtonProps {
    tab: Page;
    onClick: () => void;
    children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ tab, onClick, children }) => {
    const isActive = useStore(AppStore, { mutation: (store) => store.tab === tab });

    return (
        <button onClick={onClick} className={`navigation__button ${isActive ? "navigation__button--active" : ""}`}>
            {children}
        </button>
    );
};

interface NavigationTabProps {
    children: React.ReactNode;
    tab: Page;
}

export const NavigationTab: React.FC<NavigationTabProps> = ({ children, tab }) => {
    const store = useStore(AppStore);

    return <div style={{ display: store.tab === tab ? "block" : "none" }}>{children}</div>;
};
