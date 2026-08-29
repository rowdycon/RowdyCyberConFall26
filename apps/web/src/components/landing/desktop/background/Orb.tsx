import Image from "next/image";

/**
 * Large atmospheric centerpiece behind the hero. Built with CSS gradients
 * (not a photo) so its size/color stay fully controllable, with the
 * flare.png asset layered on top as a specular highlight for extra gloss.
 */
export default function Orb() {
	return (
		<div
			className="pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden"
			aria-hidden="true"
		>
			<div
				className="aero-orb relative"
				style={{
					width: "clamp(320px, 42vw, 720px)",
					height: "clamp(320px, 42vw, 720px)",
					animation: "orbPulse 8s ease-in-out infinite",
				}}
			>
				<div
					className="absolute inset-0 rounded-full"
					style={{
						background:
							"radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(150,220,255,0.55) 22%, rgba(60,150,230,0.35) 45%, rgba(30,90,160,0.12) 65%, rgba(30,90,160,0) 78%)",
						filter: "blur(2px)",
					}}
				/>
				<div className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
			</div>
			<div className="absolute left-[58%] top-[36%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-screen sm:h-[340px] sm:w-[340px]">
				<Image
					src="/img/aero/flare.png"
					alt=""
					fill
					className="object-contain"
				/>
			</div>
		</div>
	);
}
