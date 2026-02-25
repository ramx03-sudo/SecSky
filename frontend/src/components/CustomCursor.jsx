import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const positionRef = useRef({ mouseX: 0, mouseY: 0, destX: 0, destY: 0, req: null });
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check for mobile / touch devices
        if (window.matchMedia("(pointer: coarse)").matches) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMobile(true);
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const onMouseMove = (e) => {
            positionRef.current.mouseX = e.clientX;
            positionRef.current.mouseY = e.clientY;
            if (!isVisible && !prefersReducedMotion) {
                setIsVisible(true);
            }
            if (prefersReducedMotion && cursorRef.current) {
                // Fallback for reduced motion: snap instantly
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }
        };

        const checkHover = () => {
            const el = document.elementFromPoint(positionRef.current.mouseX, positionRef.current.mouseY);
            if (el) {
                const isHoverable = el.tagName.toLowerCase() === 'button' ||
                    el.tagName.toLowerCase() === 'a' ||
                    el.closest('button') ||
                    el.closest('a');
                setIsHovering(!!isHoverable);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousemove', checkHover);

        const render = () => {
            if (!prefersReducedMotion) {
                // Smooth linear interpolation for the specific "spring" feel
                positionRef.current.destX += (positionRef.current.mouseX - positionRef.current.destX) * 0.15;
                positionRef.current.destY += (positionRef.current.mouseY - positionRef.current.destY) * 0.15;
                if (cursorRef.current) {
                    cursorRef.current.style.transform = `translate3d(${positionRef.current.destX}px, ${positionRef.current.destY}px, 0)`;
                }
            }
            positionRef.current.req = requestAnimationFrame(render);
        };

        if (!prefersReducedMotion) {
            positionRef.current.req = requestAnimationFrame(render);
        }

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousemove', checkHover);
            if (positionRef.current.req) cancelAnimationFrame(positionRef.current.req);
        };
    }, [isVisible]);

    if (isMobile) return null;

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[9999] opacity-90 transition-all duration-300 ease-out mix-blend-screen"
            style={{
                width: isHovering ? '64px' : '32px',
                height: isHovering ? '64px' : '32px',
                marginLeft: isHovering ? '-32px' : '-16px',
                marginTop: isHovering ? '-32px' : '-16px',
                willChange: 'transform, width, height',
                opacity: isVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0
            }}
        >
            <div
                className="w-full h-full rounded-full transition-all duration-500"
                style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0) 70%)',
                    boxShadow: isHovering ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
                }}
            />
        </div>
    );
}
