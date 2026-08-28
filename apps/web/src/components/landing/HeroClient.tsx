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

export default function HeroClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24">
			{/* Soft light flares */}
			<div
				className="pointer-events-none absolute inset-0"
				aria-hidden="true"
				style={{
					background: `
            radial-gradient(ellipse at 25% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 45%),
            radial-gradient(ellipse at 75% 75%, rgba(110, 235, 190, 0.3) 0%, transparent 45%)
          `,
				}}
			/>

			{/* Rising bubbles */}
			<div
				className="pointer-events-none absolute inset-0 overflow-hidden"
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

			{/* Sweeping light streak */}
			<div
				className="pointer-events-none absolute inset-x-0 top-1/4 h-40 -rotate-6"
				aria-hidden="true"
				style={{
					background:
						"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
					animation: "aeroShimmer 9s ease-in-out infinite",
				}}
			/>

			{/* Open content — floats directly over the sky */}
			<div className="relative z-10 w-full max-w-5xl">{children}</div>

			{/* Scroll-down indicator */}
			<a
				href="#About"
				className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/80 transition-opacity hover:text-white"
				aria-label="Scroll to About section"
			>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="animate-bounce drop-shadow-md"
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</a>
		</section>
	);
}
