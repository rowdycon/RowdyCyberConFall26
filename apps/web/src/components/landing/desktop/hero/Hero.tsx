import HeroCTA from "./HeroCTA";
import HeroDescription from "./HeroDescription";
import HeroTitle from "./HeroTitle";

/**
 * Center zone of the desktop scene. Sits in its own glass card (rather than
 * bare over the sky photo) so it stays readable no matter what the orb or
 * background is doing behind it.
 */
export default function Hero() {
	return (
		<div className="cybercon-area-hero relative z-[var(--z-hero)] flex items-center justify-center px-2 py-6">
			<div className="aero-enter relative w-full max-w-xl rounded-[2rem] border border-white/50 bg-white/20 px-6 py-10 text-center shadow-[0_20px_60px_rgba(10,50,100,0.25)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_28px_75px_rgba(10,50,100,0.32)] sm:px-10 sm:py-14">
				<HeroTitle />
				<HeroDescription />
				<HeroCTA />
			</div>
		</div>
	);
}
