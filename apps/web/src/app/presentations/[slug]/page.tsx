import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Oswald } from "next/font/google";
import {
	ArrowLeft,
	ArrowRight,
	CalendarDays,
	Clock,
	Download,
	ExternalLink,
	FileText,
	MapPin,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import SlideViewer from "@/components/presentations/SlideViewer";
import LinkCover from "@/components/presentations/LinkCover";
import {
	PRESENTATIONS_SITE_URL,
	coverSrc,
	formatBytes,
	formatDay,
	formatSpeakers,
	formatTimeRange,
	getPresentation,
	parseDescription,
	pdfDownloadName,
	pdfSrc,
	presentationHref,
	presentations,
} from "@/lib/presentations";

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
});

type PageProps = { params: { slug: string } };

export function generateMetadata({ params }: PageProps): Metadata {
	const p = getPresentation(params.slug);
	if (!p) return { title: "Presentation not found | Rowdy CyberCon" };
	const images = p.deck
		? [{ url: coverSrc(p.slug), width: 960, height: 540, alt: p.title }]
		: undefined;
	return {
		title: `${p.title} | Rowdy CyberCon`,
		description: p.summary,
		metadataBase: new URL(PRESENTATIONS_SITE_URL),
		alternates: { canonical: presentationHref(p.slug) },
		openGraph: {
			title: p.title,
			description: p.summary,
			url: presentationHref(p.slug),
			siteName: "Rowdy CyberCon",
			type: "article",
			images,
		},
		twitter: {
			card: images ? "summary_large_image" : "summary",
			title: p.title,
			description: p.summary,
			images: images?.map((i) => i.url),
		},
	};
}

/** Id prefix of each slide's entry in the text version (describes the slide image). */
const SLIDE_TEXT_ID = "slide-text-";

const chip =
	"aero-inset inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-foreground";

const glassButton =
	"inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/70 bg-white/60 px-5 text-sm font-semibold text-sky-900 shadow-sm backdrop-blur-md transition hover:-translate-y-px hover:bg-white/85";

export default function Page({ params }: PageProps) {
	const p = getPresentation(params.slug);
	if (!p) notFound();

	const position = presentations.indexOf(p);
	const previous = presentations[position - 1];
	const next = presentations[position + 1];
	const blocks = parseDescription(p.description);
	const slideText = p.deck?.text ?? [];
	const hasSlideText = slideText.some((t) => t.trim() !== "");

	return (
		<div
			className={`${oswald.variable} aero-bg-soft relative min-h-screen w-full overflow-x-hidden`}
		>
			<Navbar />
			<main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
				<Link
					href="/presentations"
					className="aero-inset inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-foreground transition hover:bg-white/80"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					All presentations
				</Link>

				<header className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-3xl">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							<span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
								{p.format}
							</span>
							<span className={chip}>
								<CalendarDays
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								Sat, Nov 7
							</span>
							<span className={chip}>
								<Clock
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								{formatTimeRange(p)}
							</span>
							<span className={chip}>
								<MapPin
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								{p.location}
							</span>
						</div>
						<h1 className="font-oswald text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
							{p.title}
						</h1>
						<p className="mt-3 text-base font-semibold text-foreground/80 sm:text-lg">
							{formatSpeakers(p.speakers)}
							{p.affiliation && (
								<span className="font-normal text-muted-foreground">
									{" "}
									· {p.affiliation}
								</span>
							)}
						</p>
					</div>

					<div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
						{p.deck && (
							<a
								href={pdfSrc(p.slug)}
								download={pdfDownloadName(p.slug)}
								className="aero-btn h-10 gap-2 px-5 text-sm"
							>
								<Download
									className="h-4 w-4"
									aria-hidden="true"
								/>
								Download PDF
								<span className="opacity-80">
									({formatBytes(p.deck.pdfBytes)})
								</span>
							</a>
						)}
						{p.externalLink && (
							<a
								href={p.externalLink.href}
								target="_blank"
								rel="noopener noreferrer"
								className="aero-btn h-10 gap-2 px-5 text-sm"
							>
								{p.externalLink.label}
								<ExternalLink
									className="h-4 w-4"
									aria-hidden="true"
								/>
							</a>
						)}
						<Link
							href={`/schedule/${p.eventId}`}
							className={glassButton}
						>
							View on schedule
						</Link>
					</div>
				</header>

				<section className="mt-8" aria-label="Slides">
					{p.deck ? (
						<SlideViewer
							slug={p.slug}
							title={p.title}
							count={p.deck.slideCount}
							width={p.deck.width}
							height={p.deck.height}
							textIdPrefix={
								hasSlideText ? SLIDE_TEXT_ID : undefined
							}
							hasText={slideText.map((t) => t.trim() !== "")}
						/>
					) : p.externalLink ? (
						<div className="aero-glass p-2 sm:p-3">
							<div className="overflow-hidden rounded-xl">
								<LinkCover
									large
									title={p.title.split(":")[0]}
									caption={p.summary}
								>
									<a
										href={p.externalLink.href}
										target="_blank"
										rel="noopener noreferrer"
										className="aero-btn mt-8 h-auto min-h-12 w-full gap-2 px-6 py-3 text-center font-sans !text-base sm:w-fit sm:px-8"
									>
										{p.externalLink.label}
										<ExternalLink
											className="h-4 w-4"
											aria-hidden="true"
										/>
									</a>
								</LinkCover>
							</div>
						</div>
					) : null}
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-3">
					<article className="aero-glass p-6 sm:p-8 lg:col-span-2">
						<h2 className="font-oswald text-2xl font-bold text-foreground">
							About this {p.format.toLowerCase()}
						</h2>
						<div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">
							{blocks.map((block, i) =>
								block.kind === "list" ? (
									<ul
										key={i}
										className="list-disc space-y-1.5 pl-5"
									>
										{block.items.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								) : (
									<p key={i}>{block.text}</p>
								),
							)}
						</div>
					</article>

					<aside className="aero-glass h-fit p-6">
						<h2 className="font-oswald text-xl font-bold text-foreground">
							Details
						</h2>
						<dl className="mt-4 space-y-4 text-sm text-foreground">
							<Detail label="When">
								{formatDay(p)}
								<br />
								{formatTimeRange(p)} (Central)
							</Detail>
							<Detail label="Where">{p.location}</Detail>
							<Detail
								label={
									p.speakers.length > 1
										? "Presenters"
										: "Presenter"
								}
							>
								{p.speakers.join(", ")}
								{p.affiliation && (
									<span className="block text-muted-foreground">
										{p.affiliation}
									</span>
								)}
							</Detail>
							{p.scheduleTitle && (
								<Detail label="On the schedule as">
									&ldquo;{p.scheduleTitle}&rdquo;
								</Detail>
							)}
							{p.deck && (
								<Detail label="Slides">
									{p.deck.slideCount} slides · PDF,{" "}
									{formatBytes(p.deck.pdfBytes)}
								</Detail>
							)}
							<Detail label="Topics">
								<span className="mt-1 flex flex-wrap gap-1.5">
									{p.topics.map((t) => (
										<span
											key={t}
											className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200"
										>
											{t}
										</span>
									))}
								</span>
							</Detail>
						</dl>
						{p.originalLink && (
							<a
								href={p.originalLink.href}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
							>
								{p.originalLink.label}
								<ExternalLink
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
							</a>
						)}
					</aside>
				</section>

				{hasSlideText && (
					<details className="aero-glass group mt-6 p-6 sm:p-8">
						<summary className="flex cursor-pointer list-none items-center gap-2 font-oswald text-xl font-bold text-foreground [&::-webkit-details-marker]:hidden">
							<FileText className="h-5 w-5" aria-hidden="true" />
							Text version of the slides
							<span className="font-sans text-sm font-normal text-muted-foreground">
								(automatically extracted)
							</span>
							<ArrowRight
								className="ml-auto h-4 w-4 transition-transform group-open:rotate-90"
								aria-hidden="true"
							/>
						</summary>
						<ol className="mt-6 space-y-5">
							{slideText.map((text, i) =>
								text.trim() ? (
									<li key={i}>
										<a
											href={`#slide-${i + 1}`}
											className="text-xs font-bold uppercase tracking-wide text-primary hover:underline"
										>
											Slide {i + 1}
										</a>
										<p
											id={`${SLIDE_TEXT_ID}${i + 1}`}
											className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/85"
										>
											{text}
										</p>
									</li>
								) : null,
							)}
						</ol>
					</details>
				)}

				{(previous || next) && (
					<nav
						className="mt-10 grid gap-4 sm:grid-cols-2"
						aria-label="More presentations"
					>
						{previous ? (
							<Link
								href={presentationHref(previous.slug)}
								className="aero-glass group flex flex-col gap-1 p-5 transition hover:-translate-y-0.5"
							>
								<span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									<ArrowLeft
										className="h-3.5 w-3.5"
										aria-hidden="true"
									/>
									Earlier
								</span>
								<span className="font-oswald text-lg font-bold leading-snug text-foreground group-hover:text-primary">
									{previous.title}
								</span>
							</Link>
						) : (
							<span className="hidden sm:block" />
						)}
						{next && (
							<Link
								href={presentationHref(next.slug)}
								className="aero-glass group flex flex-col items-end gap-1 p-5 text-right transition hover:-translate-y-0.5"
							>
								<span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Later
									<ArrowRight
										className="h-3.5 w-3.5"
										aria-hidden="true"
									/>
								</span>
								<span className="font-oswald text-lg font-bold leading-snug text-foreground group-hover:text-primary">
									{next.title}
								</span>
							</Link>
						)}
					</nav>
				)}
			</main>
		</div>
	);
}

function Detail({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</dt>
			<dd className="mt-0.5">{children}</dd>
		</div>
	);
}
