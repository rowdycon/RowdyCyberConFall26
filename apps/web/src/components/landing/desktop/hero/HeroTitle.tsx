import Image from "next/image";
import c from "config";

export default function HeroTitle() {
	return (
		<div className="flex flex-col items-center">
			<div className="relative mx-auto h-[120px] w-[120px] sm:h-[160px] sm:w-[160px] md:h-[220px] md:w-[220px]">
				<div
					className="aero-orb absolute inset-0 rounded-full bg-[#1c6fb8]/30 blur-2xl"
					style={{ animation: "orbPulse 6s ease-in-out infinite" }}
				/>
				<Image
					src="/img/logo/rowdyconlogo.png"
					alt="RowdyCon Logo"
					fill
					className="relative z-[var(--z-controls)] object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
					priority
					sizes="(max-width: 768px) 120px, 220px"
				/>
			</div>
			<div className="relative mx-auto mt-2 h-[64px] w-[200px] sm:h-[90px] sm:w-[280px] md:h-[120px] md:w-[360px]">
				<Image
					src="/img/logo/rcc_for_website.png"
					alt={`${c.hackathonName} - Capture The Flag Competition`}
					fill
					className="object-contain drop-shadow"
					sizes="(max-width: 768px) 200px, 360px"
				/>
			</div>
		</div>
	);
}
