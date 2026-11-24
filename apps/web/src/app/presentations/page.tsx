import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import PageBubbles from "@/components/landing/PageBubbles";
import PresentationsDirectory, {
	type DirectoryItem,
} from "@/components/presentations/PresentationsDirectory";
import {
	PRESENTATIONS_SITE_URL,
	coverSrc,
	formatSpeakers,
	formatTimeRange,
	presentations,
} from "@/lib/presentations";

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
});

const description =
	"Slides and materials from the talks and workshops at Rowdy CyberCon Fall 2026.";

export const metadata: Metadata = {
	title: "Presentations | Rowdy CyberCon",
	description,
	metadataBase: new URL(PRESENTATIONS_SITE_URL),
	alternates: { canonical: "/presentations" },
	openGraph: {
		title: "Presentations | Rowdy CyberCon",
		description,
		url: "/presentations",
		siteName: "Rowdy CyberCon",
		type: "website",
	},
};

export default function Page() {
	const items: DirectoryItem[] = presentations.map((p) => ({
		slug: p.slug,
		title: p.title,
		scheduleTitle: p.scheduleTitle ?? null,
		speakers: formatSpeakers(p.speakers),
		affiliation: p.affiliation ?? null,
		format: p.format,
		time: formatTimeRange(p),
		location: p.location,
		topics: p.topics,
		summary: p.summary,
		slideCount: p.deck?.slideCount ?? null,
		cover: p.deck ? coverSrc(p.slug) : null,
		coverCaption: p.deck ? null : (p.externalLink?.label ?? null),
	}));

	return (
		<div
			className={`${oswald.variable} aero-bg-soft relative min-h-screen w-full overflow-x-hidden`}
		>
			<PageBubbles />
			<Navbar />
			<main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-6">
				<div className="mb-10 text-center">
					<div
						className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-2 text-sm font-semibold text-white backdrop-blur-md"
						style={{
							background:
								"linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 50%, rgba(110,235,190,0.2) 100%)",
							boxShadow:
								"inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 16px rgba(2,84,145,0.25)",
							textShadow: "0 1px 3px rgba(0,60,110,0.5)",
						}}
					>
						<span aria-hidden="true">✦</span>
						Fall 2026 · November 7<span aria-hidden="true">✦</span>
					</div>
					<h1
						className="font-oswald text-4xl font-bold text-white md:text-6xl"
						style={{ textShadow: "0 2px 6px rgba(0,60,110,0.5)" }}
					>
						Presentations
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-base font-medium text-foreground/80 md:text-lg">
						Slides and materials from the talks and workshops at
						Rowdy CyberCon. Pick a session to flip through the
						slides or download the PDF.
					</p>
				</div>

				<PresentationsDirectory items={items} />

				<p className="mt-12 text-center text-sm text-foreground/70">
					Presented at Rowdy CyberCon and don&apos;t see your slides?
					Send them to us in{" "}
					<a
						href="https://discord.gg/G66gERwNgK"
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-primary underline-offset-2 hover:underline"
					>
						#ask-an-organizer on Discord
					</a>
					.
				</p>
			</main>
		</div>
	);
}
