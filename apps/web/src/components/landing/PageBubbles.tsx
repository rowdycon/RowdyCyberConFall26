"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

function seeded(i: number, salt: number) {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
}

/** Math.sin can differ in the last bits between the server and the browser,
 *  so round the generated values to keep server and client markup identical. */
const round = (n: number) => Number(n.toFixed(3));

const BUBBLES = Array.from({ length: 22 }, (_, i) => ({
	id: i,
	left: round(seeded(i, 1) * 100),
	size: round(12 + seeded(i, 2) * 60),
	duration: round(14 + seeded(i, 3) * 18),
	delay: round(-(seeded(i, 4) * 30)),
	opacity: round(0.3 + seeded(i, 5) * 0.5),
}));

/** Directions for the droplets that fly out of a popped bubble. */
const DROPLETS = Array.from({ length: 8 }, (_, i) => {
	const angle = (i / 8) * Math.PI * 2 + (seeded(i, 6) - 0.5) * 0.6;
	return {
		dx: Math.cos(angle),
		dy: Math.sin(angle),
		reach: 0.8 + seeded(i, 7) * 0.5,
		scale: 0.7 + seeded(i, 8) * 0.6,
	};
});

const POP_MS = 600;

interface Pop {
	id: number;
	x: number;
	y: number;
	size: number;
}

/**
 * Rising bubbles that float over the entire page (fixed to viewport).
 *
 * Click or tap a bubble to pop it; it grows back from the bottom on its next
 * trip up. The layer never takes pointer events, so links and buttons under
 * a bubble keep working: a page-level listener checks whether the pointer
 * landed on a bubble instead.
 */
export default function PageBubbles() {
	const tracks = useRef<(HTMLDivElement | null)[]>([]);
	const [pops, setPops] = useState<Pop[]>([]);

	useEffect(() => {
		let nextId = 0;
		let hovered: HTMLElement | null = null;
		let frame = 0;
		let lastX = 0;
		let lastY = 0;
		const timers = new Set<number>();

		/** The topmost unpopped bubble under the point, if any. */
		const bubbleAt = (x: number, y: number, slop: number) => {
			for (let i = tracks.current.length - 1; i >= 0; i--) {
				const el = tracks.current[i];
				if (!el || el.hasAttribute("data-popped")) continue;
				const rect = el.getBoundingClientRect();
				const r = rect.width / 2;
				const dx = x - (rect.left + r);
				const dy = y - (rect.top + rect.height / 2);
				if (dx * dx + dy * dy <= (r + slop) ** 2) return { el, rect };
			}
			return null;
		};

		const setHovered = (el: HTMLElement | null) => {
			if (el === hovered) return;
			hovered?.removeAttribute("data-hover");
			el?.setAttribute("data-hover", "");
			hovered = el;
		};

		const pop = (el: HTMLElement) => {
			// Size the burst from the bubble as drawn, which includes the hover swell.
			const drawn = (el.firstElementChild ?? el).getBoundingClientRect();
			if (el === hovered) setHovered(null);
			el.setAttribute("data-popped", "");
			const burst = {
				id: nextId++,
				x: drawn.left + drawn.width / 2,
				y: drawn.top + drawn.height / 2,
				size: drawn.width,
			};
			setPops((current) => [...current, burst]);
			const timer = window.setTimeout(() => {
				timers.delete(timer);
				setPops((current) => current.filter((p) => p.id !== burst.id));
			}, POP_MS);
			timers.add(timer);
		};

		// A touch or pen press that might turn into a scroll: it pops on release
		// only if the pointer stayed put and the browser didn't take it for a pan.
		let pressed: {
			id: number;
			el: HTMLElement;
			x: number;
			y: number;
		} | null = null;

		const onPointerDown = (e: PointerEvent) => {
			if (!e.isPrimary || e.button > 0) return;
			if (e.pointerType === "mouse") {
				const hit = bubbleAt(e.clientX, e.clientY, 0);
				if (hit) pop(hit.el);
				return;
			}
			// Fingers are less precise than a mouse, so a near miss counts too,
			// but only when no bubble is directly under the finger.
			const hit =
				bubbleAt(e.clientX, e.clientY, 0) ??
				bubbleAt(e.clientX, e.clientY, 12);
			pressed = hit
				? { id: e.pointerId, el: hit.el, x: e.clientX, y: e.clientY }
				: null;
		};

		const onPointerUp = (e: PointerEvent) => {
			if (!pressed || e.pointerId !== pressed.id) return;
			const { el } = pressed;
			pressed = null;
			if (!el.hasAttribute("data-popped")) pop(el);
		};

		const onPointerCancel = (e: PointerEvent) => {
			if (pressed && e.pointerId === pressed.id) pressed = null;
		};

		// While a bubble is hovered, keep checking every frame: bubbles drift
		// out from under a still mouse.
		const trackHover = () => {
			frame = 0;
			setHovered(bubbleAt(lastX, lastY, 0)?.el ?? null);
			if (hovered) frame = requestAnimationFrame(trackHover);
		};

		const onPointerMove = (e: PointerEvent) => {
			if (
				pressed &&
				e.pointerId === pressed.id &&
				Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) > 10
			) {
				pressed = null;
			}
			if (e.pointerType !== "mouse") return;
			lastX = e.clientX;
			lastY = e.clientY;
			if (!frame) frame = requestAnimationFrame(trackHover);
		};

		const onPointerOut = (e: PointerEvent) => {
			if (e.relatedTarget) return;
			cancelAnimationFrame(frame);
			frame = 0;
			setHovered(null);
		};

		// Capture phase, so page elements that stop propagation can't block a pop.
		const options = { capture: true, passive: true };
		const listeners = [
			["pointerdown", onPointerDown],
			["pointerup", onPointerUp],
			["pointercancel", onPointerCancel],
			["pointermove", onPointerMove],
			["pointerout", onPointerOut],
		] as const;
		listeners.forEach(([type, listener]) =>
			document.addEventListener(type, listener, options),
		);
		return () => {
			listeners.forEach(([type, listener]) =>
				document.removeEventListener(type, listener, options),
			);
			cancelAnimationFrame(frame);
			timers.forEach((timer) => window.clearTimeout(timer));
		};
	}, []);

	return (
		<div
			className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
			aria-hidden="true"
		>
			{BUBBLES.map((bubble, i) => (
				<div
					key={bubble.id}
					ref={(el) => {
						tracks.current[i] = el;
					}}
					className="aero-bubble-track absolute bottom-[-80px]"
					style={{
						left: `${bubble.left}%`,
						width: `${bubble.size}px`,
						height: `${bubble.size}px`,
						opacity: bubble.opacity,
						animation: `bubbleRise ${bubble.duration}s linear ${bubble.delay}s infinite`,
					}}
					onAnimationIteration={(e) => {
						// Back at the bottom: a popped bubble grows back.
						e.currentTarget.removeAttribute("data-popped");
					}}
				>
					<div className="aero-bubble inset-0" />
				</div>
			))}
			{pops.map((pop) => (
				<div
					key={pop.id}
					className="aero-bubble-pop"
					style={{
						left: pop.x,
						top: pop.y,
						width: pop.size,
						height: pop.size,
					}}
				>
					<span className="aero-bubble-pop-flash" />
					<span className="aero-bubble-pop-ring" />
					{DROPLETS.map((drop, k) => {
						// Droplets leave from the bubble's rim and fly outward.
						const rim = (pop.size / 2) * 0.85;
						const distance =
							(pop.size / 2 + 10 + pop.size * 0.2) * drop.reach;
						const diameter =
							Math.min(7, Math.max(3, pop.size * 0.12)) *
							drop.scale;
						return (
							<span
								key={k}
								className="aero-bubble-pop-drop"
								style={
									{
										width: diameter,
										height: diameter,
										"--sx": `${(drop.dx * rim).toFixed(1)}px`,
										"--sy": `${(drop.dy * rim).toFixed(1)}px`,
										"--dx": `${(drop.dx * distance).toFixed(1)}px`,
										"--dy": `${(drop.dy * distance).toFixed(1)}px`,
									} as CSSProperties
								}
							/>
						);
					})}
				</div>
			))}
		</div>
	);
}
