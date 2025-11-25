import "./styles.scss";

interface TooltipProps {
    content: string;
    x: number;
    y: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, x, y }) => {
    return (
        <div
            className="tooltip"
            style={{
                left: `${x}px`,
                top: `${y}px`,
            }}
        >
            {content}
        </div>
    );
};
