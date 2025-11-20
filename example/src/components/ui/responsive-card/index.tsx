import "./styles.scss";

interface ResponsiveCardProps {
    children: React.ReactNode;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ children }) => {
    return <div className="responsive-card">{children}</div>;
};
