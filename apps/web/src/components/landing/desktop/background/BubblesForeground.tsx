const FOREGROUND_BUBBLES: {
	left: string;
	bottom: string;
	size: number;
	duration: string;
	delay: string;
	peakOpacity: number;
	drift: number;
	rise: string;
}[] = [
	{ left: "3%", bottom: "6%", size: 78, duration: "21s", delay: "-4s", peakOpacity: 0.4, drift: 20, rise: "-80vh" },
	{ left: "95%", bottom: "14%", size: 96, duration: "24s", delay: "-14s", peakOpacity: 0.35, drift: -26, rise: "-88vh" },
	{ left: "50%", bottom: "1%", size: 60, duration: "19s", delay: "-9s", peakOpacity: 0.4, drift: 16, rise: "-70vh" },
];

/**
 * A handful of larger, sharper bubbles riding above the interactive UI
 * layer (unlike the main Bubbles field, which stays behind it) so the scene
 * gets a genuine foreground pass — the "user can actually notice while
 * scrolling" layer. Kept to the far edges / bottom center so they drift
 * near the hero card without ever sitting on top of its text.
 */
export default function BubblesForeground() {
	return (
		<div
			className="pointer-events-none relative h-full w-full overflow-hidden"
			aria-hidden="true"
		>
			{FOREGROUND_BUBBLES.map((b, i) => (
				<div
					key={i}
					className="aero-bubble aero-bubble-shape absolute rounded-full"
					style={
						{
							left: b.left,
							bottom: b.bottom,
							width: b.size,
							height: b.size,
							animation: `bubbleRise ${b.duration} ease-in-out ${b.delay} infinite`,
							"--peak-opacity": b.peakOpacity,
							"--drift": `${b.drift}px`,
							"--rise": b.rise,
						} as React.CSSProperties
					}
				/>
			))}
		</div>
	);
}
