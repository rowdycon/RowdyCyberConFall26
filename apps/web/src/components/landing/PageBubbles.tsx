"use client";

function seeded(i: number, salt: number) {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
}

const BUBBLES = Array.from({ length: 22 }, (_, i) => ({
	id: i,
	left: seeded(i, 1) * 100,
	size: 12 + seeded(i, 2) * 60,
	duration: 14 + seeded(i, 3) * 18,
	delay: -(seeded(i, 4) * 30),
	opacity: 0.3 + seeded(i, 5) * 0.5,
}));

/** Rising bubbles that float over the entire page (fixed to viewport). */
export default function PageBubbles() {
	return (
		<div
			className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
			aria-hidden="true"
		>
			{BUBBLES.map((bubble) => (
				<div
					key={bubble.id}
					className="aero-bubble bottom-[-80px]"
					style={{
						left: `${bubble.left}%`,
						width: `${bubble.size}px`,
						height: `${bubble.size}px`,
						opacity: bubble.opacity,
						animation: `bubbleRise ${bubble.duration}s linear ${bubble.delay}s infinite`,
					}}
				/>
			))}
		</div>
	);
}
