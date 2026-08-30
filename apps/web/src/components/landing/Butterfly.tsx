import Image from "next/image";

/**
 * Purely decorative — a butterfly drifting around the page. `fixed` so it
 * roams the viewport rather than being clipped to one section, pointer-events
 * none so it can never intercept a click/scroll, and z-index sits between
 * the fixed background (-z-10) and the main content (z-10) so it stays
 * above the sky but glides behind glass cards when their paths cross.
 */
export default function Butterfly() {
	return (
		<div
			className="aero-butterfly pointer-events-none fixed z-0"
			style={{
				width: "clamp(38px, 4.5vw, 68px)",
				animation: "butterflyDrift 46s ease-in-out infinite",
			}}
			aria-hidden="true"
		>
			<div
				className="aero-butterfly-wings"
				style={{
					animation: "butterflyFlap 0.5s ease-in-out infinite",
					transformOrigin: "center",
				}}
			>
				<Image
					src="/img/assets/butterfly.png"
					alt=""
					width={200}
					height={150}
					className="h-auto w-full drop-shadow-lg"
				/>
			</div>
		</div>
	);
}
