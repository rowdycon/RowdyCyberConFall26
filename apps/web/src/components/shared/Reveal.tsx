"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/client/cn";

/**
 * Fades + slides a section into place the first time it scrolls into view.
 * Pure CSS transition (opacity/transform only) triggered by one
 * IntersectionObserver — no scroll-position math, no re-render per frame.
 * Renders fully visible immediately under prefers-reduced-motion.
 */
export default function Reveal({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setVisible(true);
			return;
		}

		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn("aero-reveal", visible && "aero-reveal-visible", className)}
		>
			{children}
		</div>
	);
}
