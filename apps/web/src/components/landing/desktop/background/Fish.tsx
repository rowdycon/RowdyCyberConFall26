import Image from "next/image";

const FISH: {
	left?: string;
	right?: string;
	bottom: string;
	width: string;
	opacity: number;
	blur?: string;
	duration: string;
	delay: string;
	direction?: "normal" | "reverse";
}[] = [
	// two lone fish, scattered wide
	{
		left: "6%",
		bottom: "12%",
		width: "clamp(56px, 7vw, 110px)",
		opacity: 0.3,
		duration: "34s",
		delay: "0s",
	},
	{
		right: "7%",
		bottom: "32%",
		width: "clamp(38px, 4.5vw, 76px)",
		opacity: 0.24,
		duration: "26s",
		delay: "4s",
		direction: "reverse",
	},
	// a small school passing behind the hero card — visible through its
	// frosted glass, staggered so the three don't move as one block
	{
		left: "24%",
		bottom: "34%",
		width: "clamp(22px, 2.6vw, 38px)",
		opacity: 0.32,
		duration: "22s",
		delay: "-3s",
	},
	{
		left: "27%",
		bottom: "26%",
		width: "clamp(16px, 2vw, 28px)",
		opacity: 0.26,
		duration: "19s",
		delay: "-9s",
	},
	{
		left: "21%",
		bottom: "20%",
		width: "clamp(18px, 2.2vw, 30px)",
		opacity: 0.28,
		duration: "25s",
		delay: "-14s",
	},
	// two more, faint and blurred, deep in the background
	{
		left: "38%",
		bottom: "6%",
		width: "clamp(22px, 2.6vw, 40px)",
		opacity: 0.14,
		blur: "1.5px",
		duration: "40s",
		delay: "9s",
	},
	{
		right: "24%",
		bottom: "14%",
		width: "clamp(20px, 2.4vw, 36px)",
		opacity: 0.13,
		blur: "1.5px",
		duration: "30s",
		delay: "2s",
		direction: "reverse",
	},
];

/**
 * Small sealife silhouettes distributed through the scene — most notably a
 * tiny school passing behind the hero card, where the glass blur gives them
 * a genuine "seen through frosted glass" depth cue — rather than pushed
 * into one faint corner. Tinted to a flat silhouette (brightness(0), alpha
 * preserved) so the source photo reads as an abstract fish shape against
 * the sky instead of a literal clownfish photo.
 */
export default function Fish() {
	return (
		<div
			className="pointer-events-none relative h-full w-full overflow-hidden"
			aria-hidden="true"
		>
			{FISH.map((fish, i) => (
				<div
					key={i}
					className="aero-fish absolute"
					style={{
						left: fish.left,
						right: fish.right,
						bottom: fish.bottom,
						width: fish.width,
						opacity: fish.opacity,
						filter: `brightness(0) ${fish.blur ? `blur(${fish.blur})` : ""}`,
						animation: `fishDrift ${fish.duration} ease-in-out ${fish.delay} infinite ${fish.direction ?? "normal"}`,
					}}
				>
					<Image
						src="/img/aero/fish.png"
						alt=""
						width={280}
						height={196}
						className="h-auto w-full"
					/>
				</div>
			))}
		</div>
	);
}
