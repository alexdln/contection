import "./styles.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = "secondary", className, children, ...props }) => {
    return (
        <button className={`button button--${variant} ${className || ""}`} {...props}>
            {children}
        </button>
    );
};
