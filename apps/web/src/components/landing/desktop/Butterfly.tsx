import Image from "next/image";

/**
 * Foreground effect. Path is biased toward the corners/edges of the scene
 * so it rarely lingers directly over the hero text, and it's pointer-events
 * none so it can never block a click even while passing over a window.
 */
export default function Butterfly() {
	return (
		<div
			className="aero-butterfly pointer-events-none absolute z-[var(--z-butterfly)]"
			style={{
				width: "clamp(48px, 6vw, 96px)",
				animation: "butterflyPath 26s ease-in-out infinite",
			}}
			aria-hidden="true"
		>
			<div
				className="aero-butterfly-wings"
				style={{
					animation: "butterflyFlap 0.6s ease-in-out infinite",
					transformOrigin: "center",
				}}
			>
				<Image
					src="/img/aero/butterfly.png"
					alt=""
					width={200}
					height={150}
					className="h-auto w-full drop-shadow-lg"
				/>
			</div>
		</div>
	);
}
