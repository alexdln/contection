import "./styles.scss";

interface CardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, children }) => {
    return (
        <div className="card">
            <h3 className="card__title">{title}</h3>
            <p className="card__description">{description}</p>
            <div className="card__content">{children}</div>
        </div>
    );
};
