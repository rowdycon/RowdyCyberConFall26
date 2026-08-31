"use client";

import Butterfly from "./Butterfly";

export default function HeroClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="relative -mt-16 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24">
			{/* Hero-scoped background image (flowers, grass, building) */}
			<div className="aero-bg absolute inset-0" aria-hidden="true" />

			{/* Soft fade into the page background at the bottom of the hero */}
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
				aria-hidden="true"
				style={{
					background:
						"linear-gradient(180deg, transparent 0%, rgba(223, 246, 253, 0.9) 100%)",
				}}
			/>

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

			{/* Decorative butterfly — rendered outside the z-10 content
			    wrapper so it never inherits the content's stacking context.
			    At z-0 it floats above backgrounds but always behind text
			    and glass cards throughout the page. */}
			<Butterfly />

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
