import React, { useRef, useState, useEffect } from 'react';

export default function Magnetic({ children, className = "" }) {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = el.getBoundingClientRect();
            const middleX = clientX - (left + width / 2);
            const middleY = clientY - (top + height / 2);
            setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
        };

        const onMouseEnter = () => setIsHovered(true);

        const onMouseLeave = () => {
            setIsHovered(false);
            setPosition({ x: 0, y: 0 });
        };

        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);

        return () => {
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('mouseenter', onMouseEnter);
            el.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                willChange: 'transform'
            }}
        >
            {children}
        </div>
    );
}
