const CLOUDS = [
	{ top: "6%", left: "-8%", size: 420, duration: 46, delay: 0, opacity: 0.55 },
	{
		top: "16%",
		left: "58%",
		size: 520,
		duration: 60,
		delay: -18,
		opacity: 0.42,
	},
	{
		top: "44%",
		left: "6%",
		size: 340,
		duration: 52,
		delay: -30,
		opacity: 0.32,
	},
];

/**
 * Soft CSS cloud blobs drifting slowly above the sky photo. Pure gradients
 * (no image asset for this layer) so color/opacity stay easy to tune.
 */
export default function Clouds() {
	return (
		<div
			className="pointer-events-none relative h-full w-full overflow-hidden"
			aria-hidden="true"
		>
			{CLOUDS.map((cloud, i) => (
				<div
					key={i}
					className="aero-cloud absolute rounded-full blur-2xl"
					style={{
						top: cloud.top,
						left: cloud.left,
						width: cloud.size,
						height: cloud.size * 0.55,
						opacity: cloud.opacity,
						background:
							"radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 55%, rgba(255,255,255,0) 75%)",
						animation: `cloudDrift ${cloud.duration}s ease-in-out infinite`,
						animationDelay: `${cloud.delay}s`,
					}}
				/>
			))}
		</div>
	);
}
