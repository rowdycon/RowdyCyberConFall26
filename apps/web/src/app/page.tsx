import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";

import Partners from "@/components/landing/Partners";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/shared/Navbar";

import { Oswald } from "next/font/google";
import FrequentQuestions from "@/components/landing/FrequentQuestions";

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
});

export default function Home() {
	return (
		<div
			className={`${oswald.variable} aero-bg-soft relative min-h-screen w-full overflow-x-hidden`}
		>
			{/* The floating bubbles live inside the hero (HeroClient) so they
			    show over its photo instead of hiding behind it. */}
			<main className="relative z-10 overflow-x-hidden">
				<Navbar />
				<Hero />
				<About />
				<Partners />
				<FrequentQuestions />
				<Footer />
			</main>
		</div>
	);
}

export const revalidate = 30;
