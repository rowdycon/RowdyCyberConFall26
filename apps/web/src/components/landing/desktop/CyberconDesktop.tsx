import Bubbles from "./background/Bubbles";
import BubblesForeground from "./background/BubblesForeground";
import Clouds from "./background/Clouds";
import Fish from "./background/Fish";
import Orb from "./background/Orb";
import ParallaxLayer from "./background/ParallaxLayer";
import Sky from "./background/Sky";
import Butterfly from "./Butterfly";
import DesktopIcons from "./DesktopIcons";
import Hero from "./hero/Hero";
import Calendar from "./windows/Calendar";
import Clock from "./windows/Clock";

/**
 * The Frutiger Aero desktop hero. Everything decorative (sky, clouds, fish,
 * bubbles, orb, butterfly) is an absolutely-positioned layer keyed to the
 * z-index scale in globals.css; everything interactive (icons, hero, the
 * clock/calendar pair) lives in a real CSS grid (`.cybercon-grid`) so it
 * gets a fixed zone instead of fighting over coordinates. `isolate` keeps
 * this section's z-index scale from ever colliding with the sticky Navbar /
 * fixed taskbar outside it.
 *
 * Each background layer is wrapped in `ParallaxLayer` with its own speed —
 * slowest for the deep sky, fastest for the near bubbles — so the scene
 * gains depth as the page scrolls, without the interface itself moving.
 * Every wrapper is pointer-events-none: BubblesForeground in particular
 * sits above the interactive grid in z-index, and without that it would
 * silently swallow clicks meant for the Register/Schedule buttons beneath
 * it even though it's visually transparent.
 */
export default function CyberconDesktop() {
	return (
		<section
			className="relative isolate min-h-screen w-full overflow-hidden"
			aria-label="RowdyCyberCon desktop"
		>
			<ParallaxLayer speed={0.04} className="pointer-events-none absolute inset-0 z-[var(--z-sky)]">
				<Sky />
			</ParallaxLayer>
			<ParallaxLayer speed={0.1} className="pointer-events-none absolute inset-0 z-[var(--z-clouds)]">
				<Clouds />
			</ParallaxLayer>
			<ParallaxLayer speed={0.07} className="pointer-events-none absolute inset-0 z-[var(--z-fish)]">
				<Fish />
			</ParallaxLayer>
			<ParallaxLayer speed={0.13} className="pointer-events-none absolute inset-0 z-[var(--z-fish)]">
				<Bubbles />
			</ParallaxLayer>
			<ParallaxLayer speed={0.09} className="pointer-events-none absolute inset-0 z-[var(--z-orb)]">
				<Orb />
			</ParallaxLayer>

			<div className="cybercon-grid relative z-[var(--z-window)] mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-8">
				<DesktopIcons />
				<Hero />
				<div className="cybercon-area-rail aero-enter grid grid-cols-2 gap-3" style={{ animationDelay: "160ms" }}>
					<Clock />
					<Calendar />
				</div>
			</div>

			<ParallaxLayer speed={0.18} className="pointer-events-none absolute inset-0 z-[var(--z-controls)]">
				<BubblesForeground />
			</ParallaxLayer>

			<Butterfly />
		</section>
	);
}
