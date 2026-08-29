import Image from "next/image";

/**
 * Base atmosphere layer. Fixed full-bleed photo plus a soft top-to-bottom
 * veil so the glass windows and hero copy sitting on top stay legible
 * against the busy sky/skyline photo.
 */
export default function Sky() {
	return (
		<div
			className="pointer-events-none relative h-full w-full overflow-hidden"
			aria-hidden="true"
		>
			<Image
				src="/img/aero/sky.jpg"
				alt=""
				fill
				priority
				sizes="100vw"
				className="object-cover"
			/>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(180deg, rgba(6,36,74,0.4) 0%, rgba(18,76,134,0.18) 35%, rgba(255,255,255,0.12) 70%, rgba(255,255,255,0.28) 100%)",
				}}
			/>
		</div>
	);
}
