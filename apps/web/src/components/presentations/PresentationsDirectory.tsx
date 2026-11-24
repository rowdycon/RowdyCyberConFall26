"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Clock, Globe, Images, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/client/cn";
import { presentationHref } from "@/lib/presentations/paths";
import type {
	PresentationFormat,
	PresentationTopic,
} from "@/lib/presentations/data";
import LinkCover from "./LinkCover";

export interface DirectoryItem {
	slug: string;
	title: string;
	scheduleTitle: string | null;
	speakers: string;
	affiliation: string | null;
	format: PresentationFormat;
	time: string;
	location: string;
	topics: PresentationTopic[];
	summary: string;
	slideCount: number | null;
	cover: string | null;
	coverCaption: string | null;
}

type SortKey = "schedule" | "title";

const SORTS: { key: SortKey; label: string }[] = [
	{ key: "schedule", label: "Schedule" },
	{ key: "title", label: "A–Z" },
];

// Case- and accent-insensitive matching ("José" finds "jose").
const normalize = (s: string) =>
	s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

export default function PresentationsDirectory({
	items,
}: {
	/** Already in schedule order. */
	items: DirectoryItem[];
}) {
	const [query, setQuery] = useState("");
	const [topic, setTopic] = useState<PresentationTopic | null>(null);
	const [sort, setSort] = useState<SortKey>("schedule");
	const searchRef = useRef<HTMLInputElement>(null);

	const topicCounts = useMemo(() => {
		const counts = new Map<PresentationTopic, number>();
		for (const item of items) {
			for (const t of item.topics)
				counts.set(t, (counts.get(t) ?? 0) + 1);
		}
		return Array.from(counts.entries()).sort(
			(a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
		);
	}, [items]);

	const haystacks = useMemo(
		() =>
			new Map(
				items.map((item) => [
					item.slug,
					normalize(
						[
							item.title,
							item.scheduleTitle,
							item.speakers,
							item.affiliation,
							item.summary,
							item.location,
							item.format,
							...item.topics,
						]
							.filter(Boolean)
							.join(" "),
					),
				]),
			),
		[items],
	);

	const visible = useMemo(() => {
		const terms = normalize(query).split(/\s+/).filter(Boolean);
		const filtered = items.filter((item) => {
			if (topic && !item.topics.includes(topic)) return false;
			const hay = haystacks.get(item.slug) ?? "";
			return terms.every((term) => hay.includes(term));
		});
		return sort === "title"
			? [...filtered].sort((a, b) => a.title.localeCompare(b.title))
			: filtered;
	}, [items, haystacks, query, topic, sort]);

	const filtering = query.trim() !== "" || topic !== null;

	return (
		<div className="flex flex-col gap-6">
			<div className="aero-glass flex flex-col gap-4 p-4 sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<label className="aero-inset flex flex-1 items-center gap-2 px-3">
						<Search
							className="h-4 w-4 shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<span className="sr-only">Search presentations</span>
						<input
							ref={searchRef}
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by title, speaker, or topic"
							className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
						/>
						{query && (
							<button
								type="button"
								onClick={() => {
									setQuery("");
									searchRef.current?.focus();
								}}
								className="rounded-full p-1 text-muted-foreground hover:bg-white/70 hover:text-foreground"
								aria-label="Clear search"
							>
								<X className="h-4 w-4" aria-hidden="true" />
							</button>
						)}
					</label>

					<div
						className="aero-inset flex shrink-0 p-1"
						role="group"
						aria-label="Sort presentations"
					>
						{SORTS.map((s) => (
							<button
								key={s.key}
								type="button"
								onClick={() => setSort(s.key)}
								aria-pressed={sort === s.key}
								className={cn(
									"flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none",
									sort === s.key
										? "bg-primary text-primary-foreground shadow"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{s.label}
							</button>
						))}
					</div>
				</div>

				<div
					className="flex flex-wrap gap-2"
					role="group"
					aria-label="Filter by topic"
				>
					<TopicChip
						label="All"
						count={items.length}
						active={topic === null}
						onClick={() => setTopic(null)}
					/>
					{topicCounts.map(([t, count]) => (
						<TopicChip
							key={t}
							label={t}
							count={count}
							active={topic === t}
							onClick={() => setTopic(topic === t ? null : t)}
						/>
					))}
				</div>
			</div>

			<p
				className="text-sm font-medium text-foreground/70"
				aria-live="polite"
			>
				{filtering
					? `${visible.length} of ${items.length} presentations`
					: `${items.length} presentations`}
			</p>

			{visible.length > 0 ? (
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{visible.map((item) => (
						<li key={item.slug}>
							<PresentationCard item={item} />
						</li>
					))}
				</ul>
			) : (
				<div className="aero-glass flex flex-col items-center gap-3 p-10 text-center">
					<p className="font-oswald text-xl font-bold text-foreground">
						No presentations match
					</p>
					<p className="text-sm text-muted-foreground">
						Try a different search or topic.
					</p>
					<button
						type="button"
						onClick={() => {
							setQuery("");
							setTopic(null);
							searchRef.current?.focus();
						}}
						className="aero-btn h-9 text-xs"
					>
						Clear filters
					</button>
				</div>
			)}
		</div>
	);
}

function TopicChip({
	label,
	count,
	active,
	onClick,
}: {
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
				active
					? "border-sky-500 bg-primary text-primary-foreground shadow-sm"
					: "border-sky-200 bg-white/60 text-sky-900 hover:border-sky-400 hover:bg-white/90",
			)}
		>
			{label}
			<span
				className={cn(
					"rounded-full px-1.5 text-[10px]",
					active ? "bg-white/25" : "bg-sky-100 text-sky-700",
				)}
			>
				{count}
			</span>
		</button>
	);
}

function PresentationCard({ item }: { item: DirectoryItem }) {
	return (
		<Link
			href={presentationHref(item.slug)}
			className="aero-glass group flex h-full flex-col transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(2,84,145,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
		>
			<div className="relative aspect-video overflow-hidden border-b border-white/60 bg-[#0b1620]">
				{item.cover ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={item.cover}
						alt=""
						loading="lazy"
						width={960}
						height={540}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
					/>
				) : (
					<LinkCover
						title={item.title.split(":")[0]}
						caption={item.coverCaption ?? ""}
					/>
				)}
				<span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-900 shadow-sm backdrop-blur">
					{item.format}
				</span>
				<span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
					{item.slideCount ? (
						<>
							<Images className="h-3 w-3" aria-hidden="true" />
							{item.slideCount} slides
						</>
					) : (
						<>
							<Globe className="h-3 w-3" aria-hidden="true" />
							Interactive site
						</>
					)}
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-2 p-5">
				<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-primary">
					<span className="inline-flex items-center gap-1">
						<Clock className="h-3.5 w-3.5" aria-hidden="true" />
						{item.time}
					</span>
					<span className="inline-flex items-center gap-1">
						<MapPin className="h-3.5 w-3.5" aria-hidden="true" />
						{item.location}
					</span>
				</p>
				<h2 className="font-oswald text-xl font-bold leading-snug text-foreground">
					{item.title}
				</h2>
				<p className="text-sm font-semibold text-foreground/80">
					{item.speakers}
					{item.affiliation && (
						<span className="font-normal text-muted-foreground">
							{" "}
							· {item.affiliation}
						</span>
					)}
				</p>
				<p className="line-clamp-3 text-sm text-muted-foreground">
					{item.summary}
				</p>
				<div className="mt-auto flex flex-wrap gap-1.5 pt-2">
					{item.topics.map((t) => (
						<span
							key={t}
							className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200"
						>
							{t}
						</span>
					))}
				</div>
			</div>
		</Link>
	);
}
