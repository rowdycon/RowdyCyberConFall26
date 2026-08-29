const BUBBLES: {
	left: string;
	bottom: string;
	size: number;
	duration: string;
	delay: string;
	peakOpacity: number;
	drift: number;
	rise: string;
	blur?: string;
}[] = [
	// far background — small, blurred, faint
	{ left: "13%", bottom: "4%", size: 16, duration: "15s", delay: "-3s", peakOpacity: 0.25, drift: 12, rise: "-55vh", blur: "1.5px" },
	{ left: "24%", bottom: "16%", size: 12, duration: "12s", delay: "-9s", peakOpacity: 0.2, drift: -10, rise: "-38vh", blur: "2px" },
	{ left: "47%", bottom: "2%", size: 14, duration: "13s", delay: "-1s", peakOpacity: 0.22, drift: 8, rise: "-40vh", blur: "1.5px" },
	{ left: "63%", bottom: "20%", size: 18, duration: "16s", delay: "-11s", peakOpacity: 0.22, drift: -12, rise: "-45vh", blur: "2px" },
	{ left: "83%", bottom: "6%", size: 13, duration: "14s", delay: "-5s", peakOpacity: 0.2, drift: 10, rise: "-42vh", blur: "1.5px" },
	{ left: "95%", bottom: "26%", size: 15, duration: "17s", delay: "-7s", peakOpacity: 0.2, drift: -8, rise: "-36vh", blur: "2px" },

	// mid-ground — the bulk of the field, clearly visible, no blur
	{ left: "8%", bottom: "8%", size: 30, duration: "14s", delay: "-2s", peakOpacity: 0.55, drift: 18, rise: "-62vh" },
	{ left: "19%", bottom: "1%", size: 24, duration: "11s", delay: "-6.5s", peakOpacity: 0.45, drift: -14, rise: "-48vh" },
	{ left: "34%", bottom: "10%", size: 40, duration: "18s", delay: "-4s", peakOpacity: 0.6, drift: 22, rise: "-72vh" },
	{ left: "44%", bottom: "22%", size: 22, duration: "12s", delay: "-8s", peakOpacity: 0.4, drift: -10, rise: "-44vh" },
	{ left: "56%", bottom: "3%", size: 34, duration: "15.5s", delay: "-10s", peakOpacity: 0.5, drift: 16, rise: "-58vh" },
	{ left: "71%", bottom: "9%", size: 26, duration: "13s", delay: "-3.5s", peakOpacity: 0.45, drift: -18, rise: "-50vh" },
	{ left: "80%", bottom: "18%", size: 20, duration: "10.5s", delay: "-12s", peakOpacity: 0.4, drift: 12, rise: "-40vh" },
	{ left: "90%", bottom: "4%", size: 32, duration: "16.5s", delay: "-6s", peakOpacity: 0.5, drift: -20, rise: "-64vh" },
];

/**
 * Glass-sphere bubbles rising slowly through the scene, spread across the
 * full width and split into a faint/blurred far layer plus a clearly-visible
 * mid layer. Drawn as pure CSS gradients rather than the bubbles.png sprite
 * — that asset is a decorative cluster illustration (three bubbles with
 * butterflies baked in, lots of transparent padding), so shrinking it down
 * per-instance just produced a faint smudge instead of a clean circle.
 */
export default function Bubbles() {
	return (
		<div
			className="pointer-events-none relative h-full w-full overflow-hidden"
			aria-hidden="true"
		>
			{BUBBLES.map((b, i) => (
				<div
					key={i}
					className="aero-bubble aero-bubble-shape absolute rounded-full"
					style={
						{
							left: b.left,
							bottom: b.bottom,
							width: b.size,
							height: b.size,
							filter: b.blur ? `blur(${b.blur})` : undefined,
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
