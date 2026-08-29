"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps one decorative background layer and nudges it vertically as the
 * page scrolls, at a fraction of scroll speed (`speed`) so the layer behind
 * the interface drifts rather than scrolling 1:1 with it. Scroll position is
 * read with a rAF-throttled listener so it never fires more than once per
 * frame, and transform/opacity are the only properties touched so the
 * browser can composite this on the GPU instead of relaunching layout.
 * Disabled entirely under prefers-reduced-motion — the layer just sits
 * still instead.
 */
export default function ParallaxLayer({
	speed,
	className,
	children,
}: {
	speed: number;
	className?: string;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		let raf = 0;
		const onScroll = () => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				const el = ref.current;
				if (el) {
					el.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
				}
			});
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [speed]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
