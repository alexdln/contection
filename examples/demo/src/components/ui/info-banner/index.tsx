import "./styles.scss";

interface InfoBannerProps {
    children: React.ReactNode;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ children }) => {
    return <div className="info-banner">{children}</div>;
};
