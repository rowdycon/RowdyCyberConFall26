import Image from "next/image";
import HeroClient from "./HeroClient";
import Link from "next/link";
import c from "config";
import Butterfly from "@/components/landing/Butterfly";

export default function Hero() {
	return (
		<HeroClient>
			<Butterfly />
			<div className="aero-acrylic-panel mx-auto flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12 md:px-16 md:py-14">
				<div className="relative z-10 flex flex-col items-center">
					{/* Logo floating freely with glow ring, framed in a glossy
					    Frutiger Aero medallion. The padded wrapper is what's
					    new — the logo's own size/position inside it is
					    untouched, so nothing shifts except the glass frame
					    appearing around it. */}
					<div className="aero-glass mx-auto mb-2 rounded-full p-3 md:p-5">
						<div className="relative h-[190px] w-[190px] md:h-[300px] md:w-[300px]">
							<div
								className="absolute inset-0 rounded-full"
								style={{
									background:
										"radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(110,235,190,0.25) 50%, transparent 70%)",
									animation:
										"aeroGlow 5s ease-in-out infinite",
								}}
							/>
							<Image
								src={c.icon.svg}
								alt="RowdyCon Logo"
								fill
								className="relative z-10 object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
								priority
								sizes="(max-width: 768px) 190px, 300px"
							/>
						</div>
					</div>

					{/* Text logo */}
					<div className="relative mx-auto h-[90px] w-[280px] drop-shadow-lg md:h-[175px] md:w-[440px]">
						<Image
							src="/img/logo/rcc_for_website.png"
							alt="RowdyCon - Capture The Flag Competition"
							fill
							className="object-contain"
							sizes="(max-width: 768px) 280px, 440px"
						/>
					</div>

					{/* Glossy date pill */}
					<div
						className="mb-8 mt-4 inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-2 text-lg font-semibold text-white backdrop-blur-md md:text-xl"
						style={{
							background:
								"linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 50%, rgba(110,235,190,0.2) 100%)",
							boxShadow:
								"inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 16px rgba(2,84,145,0.25)",
							textShadow: "0 1px 3px rgba(0,60,110,0.5)",
						}}
					>
						<span aria-hidden="true">✦</span>
						November 7th
						<span aria-hidden="true">✦</span>
					</div>

					{/* Tagline */}
					<p
						className="mb-8 max-w-xl text-base text-white/90 md:text-lg"
						style={{ textShadow: "0 1px 3px rgba(0,60,110,0.45)" }}
					>
						San Antonio's student cybersecurity conference —
						workshops, CTF, free food, and networking.
					</p>

					{/* Action buttons */}
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link href={"/register"}>
							<button className="aero-btn px-10 py-3 !text-lg">
								Register Now!
							</button>
						</Link>
						<Link
							// href={
							// 	"https://docs.google.com/spreadsheets/d/19yuormuJRxJL-zdw5Uc7rLdvCFTpus9dUlTM72Xiorg/edit?gid=0#gid=0"
							// }
							href={"/schedule"}
							target="_blank"
						>
							<button
								className="relative inline-flex items-center justify-center rounded-full border border-white/60 px-10 py-3 text-lg font-medium text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-px hover:brightness-110"
								style={{
									background:
										"linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 100%)",
									boxShadow:
										"inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 10px rgba(2,84,145,0.25)",
									textShadow: "0 1px 2px rgba(0,60,110,0.5)",
								}}
							>
								Schedule
							</button>
						</Link>
					</div>
				</div>
			</div>
		</HeroClient>
	);
}
