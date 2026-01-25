"use client";

import { useRef, useEffect, type ReactNode } from "react";

import "./styles.scss";

interface RenderTrackerProps {
    children: ReactNode;
    label: string;
    color: string;
}

export function RenderTracker({ children, label, color }: RenderTrackerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const countRef = useRef(0);
    const countDisplayRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        countRef.current += 1;
        if (countDisplayRef.current) {
            countDisplayRef.current.textContent = `${countRef.current}`;
        }

        if (ref.current) {
            ref.current.style.boxShadow = `inset 0 0 0 2px ${color}`;

            const timeout = setTimeout(() => {
                if (ref.current) {
                    ref.current.style.boxShadow = "none";
                }
            }, 300);
            return () => clearTimeout(timeout);
        }
    });

    return (
        <div ref={ref} className="card">
            <div className="card-header">
                <span className="card-label">{label}</span>
                <span ref={countDisplayRef} className="card-count" style={{ backgroundColor: color }}>
                    {countRef.current}
                </span>
            </div>
            {children}
        </div>
    );
}
