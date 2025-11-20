import "./styles.scss";

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <div className="layout__wrapper">
                <div className="layout__content">{children}</div>
            </div>
        </div>
    );
};
