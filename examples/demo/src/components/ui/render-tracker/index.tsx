import { useEffect, useRef } from "react";

import "./styles.scss";

interface RenderTrackerProps {
    path: string;
    children: React.ReactNode;
    color?: string;
}

export const RenderTracker: React.FC<RenderTrackerProps> = ({ path, children, color = "#6366f1" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const renderCountRef = useRef<HTMLDivElement>(null);
    const renderCount = useRef(0);
    const prevRenderTime = useRef(Date.now());

    useEffect(() => {
        renderCount.current += 1;
        if (renderCountRef.current) {
            renderCountRef.current.textContent = `#${renderCount.current}`;
        }
        const now = Date.now();
        const timeSinceLastRender = now - prevRenderTime.current;
        prevRenderTime.current = now;

        console.log(
            `[RenderTracker] ${path} rendered (#${renderCount.current}, ${timeSinceLastRender}ms since last render)`,
        );

        if (ref.current) {
            ref.current.style.borderColor = color;
            ref.current.style.backgroundColor = `${color}10`;
            ref.current.setAttribute("title", `${path}, rendered ${renderCount.current} times`);
            const timeout = setTimeout(() => {
                if (ref.current) {
                    ref.current.style.borderColor = "transparent";
                    ref.current.style.backgroundColor = "transparent";
                }
            }, 300);
            return () => clearTimeout(timeout);
        }
    });

    return (
        <div
            className="render-tracker"
            ref={ref}
            style={{ "--tracker-color": color } as React.CSSProperties}
            title={`${path}, rendered ${renderCount.current} times`}
        >
            <div className="render-tracker__badges">
                <a
                    href={`https://github.com/alexdln/contection/tree/main/example/src${path}`}
                    className="render-tracker__badge"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {"</>"}
                </a>
                <div className="render-tracker__badge" ref={renderCountRef}>
                    #{renderCount.current}
                </div>
            </div>
            {children}
        </div>
    );
};

export const useRenderCount = (name: string) => {
    const renderCount = useRef(0);
    const prevRenderTime = useRef(Date.now());

    useEffect(() => {
        renderCount.current += 1;
        const now = Date.now();
        const timeSinceLastRender = now - prevRenderTime.current;
        prevRenderTime.current = now;
        console.log(
            `[useRenderCount] ${name} rendered (#${renderCount.current}, ${timeSinceLastRender}ms since last render)`,
        );
    });

    return renderCount.current;
};
