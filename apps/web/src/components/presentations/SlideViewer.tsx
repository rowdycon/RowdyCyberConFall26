"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type TouchEvent as ReactTouchEvent,
} from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils/client/cn";
import { slideSrc, thumbSrc } from "@/lib/presentations/paths";

interface SlideViewerProps {
	slug: string;
	title: string;
	count: number;
	width: number;
	height: number;
	/**
	 * When slide N has text, its image is described by the element with id
	 * `${textIdPrefix}${N}` (the page's text version of the slides).
	 */
	textIdPrefix?: string;
	/** hasText[i] is true when slide i + 1 has extracted text. */
	hasText?: boolean[];
}

const HASH_RE = /^#slide-(\d+)$/;
const SWIPE_MIN_PX = 40;
const HASH_WRITE_DELAY_MS = 400;

/** Image-based slide deck viewer: arrows, swipe, thumbnails, fullscreen, #slide-N links. */
export default function SlideViewer({
	slug,
	title,
	count,
	width,
	height,
	textIdPrefix,
	hasText,
}: SlideViewerProps) {
	const [index, setIndex] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [canFullscreen, setCanFullscreen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const stripRef = useRef<HTMLOListElement>(null);
	const gesture = useRef<{ x: number; y: number; multi: boolean } | null>(
		null,
	);
	const userNavigated = useRef(false);
	const wasFullscreen = useRef(false);

	const clamp = useCallback(
		(i: number) => Math.min(Math.max(i, 0), count - 1),
		[count],
	);

	const goTo = useCallback(
		(i: number) => {
			userNavigated.current = true;
			setIndex(clamp(i));
		},
		[clamp],
	);

	const step = useCallback(
		(delta: number) => {
			userNavigated.current = true;
			setIndex((i) => clamp(i + delta));
		},
		[clamp],
	);

	// Open the slide named in the URL (#slide-N) on load, and follow manual
	// edits of the hash. A hash without a valid slide means slide 1.
	useEffect(() => {
		const syncFromHash = (initial: boolean) => {
			const match = window.location.hash.match(HASH_RE);
			const n = match ? parseInt(match[1], 10) : NaN;
			if (n >= 1 && n <= count) {
				setIndex(n - 1);
				rootRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			} else if (!initial) {
				setIndex(0);
			}
		};
		syncFromHash(true);
		const onHashChange = () => syncFromHash(false);
		window.addEventListener("hashchange", onHashChange);
		return () => window.removeEventListener("hashchange", onHashChange);
	}, [count]);

	// "Slide N" links elsewhere on the page (href="#slide-N"): handle them here
	// instead of letting the browser add a history entry the app router can't
	// restore, and so clicking the current slide's link still scrolls back up.
	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (
				e.defaultPrevented ||
				e.button !== 0 ||
				e.metaKey ||
				e.ctrlKey ||
				e.shiftKey ||
				e.altKey
			) {
				return;
			}
			const link = (e.target as Element | null)?.closest?.(
				'a[href^="#slide-"]',
			);
			const match = link?.getAttribute("href")?.match(HASH_RE);
			if (!match) return;
			const n = parseInt(match[1], 10);
			if (n < 1 || n > count) return;
			e.preventDefault();
			goTo(n - 1);
			rootRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			rootRef.current?.focus({ preventScroll: true });
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, [count, goTo]);

	// Mirror the current slide into the URL once the visitor starts flipping,
	// so the address bar holds a shareable link. Debounced because browsers
	// rate-limit history updates (Safari throws after 100 in a few seconds),
	// and it reuses the router's own history state so Next's patched
	// replaceState passes straight through instead of dispatching a restore.
	useEffect(() => {
		if (!userNavigated.current) return;
		const timer = window.setTimeout(() => {
			const hash = `#slide-${index + 1}`;
			if (window.location.hash === hash) return;
			try {
				window.history.replaceState(window.history.state, "", hash);
			} catch {
				// Rate-limited; the hash is only a convenience.
			}
		}, HASH_WRITE_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [index]);

	// Warm the cache for the neighbouring slides.
	useEffect(() => {
		for (const n of [index + 2, index, index + 3]) {
			if (n >= 1 && n <= count) {
				const img = new Image();
				img.src = slideSrc(slug, n);
			}
		}
	}, [index, count, slug]);

	// Keep the active thumbnail centred without scrolling the page, including
	// right after leaving fullscreen (the strip remounts scrolled to the start).
	useEffect(() => {
		const remounted = wasFullscreen.current && !isFullscreen;
		wasFullscreen.current = isFullscreen;
		const strip = stripRef.current;
		const thumb = strip?.querySelector<HTMLElement>(
			`[data-index="${index}"]`,
		);
		if (!strip || !thumb) return;
		strip.scrollTo({
			left:
				thumb.offsetLeft -
				strip.clientWidth / 2 +
				thumb.clientWidth / 2,
			behavior: remounted ? "auto" : "smooth",
		});
	}, [index, isFullscreen]);

	useEffect(() => {
		setCanFullscreen(Boolean(document.fullscreenEnabled));
		const onChange = () =>
			setIsFullscreen(document.fullscreenElement === rootRef.current);
		document.addEventListener("fullscreenchange", onChange);
		return () => document.removeEventListener("fullscreenchange", onChange);
	}, []);

	const toggleFullscreen = useCallback(() => {
		if (document.fullscreenElement) {
			void document.exitFullscreen();
		} else {
			rootRef.current?.requestFullscreen().catch(() => {});
		}
	}, []);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) {
				return;
			}
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.isContentEditable ||
					["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
			) {
				return;
			}
			// Left/right and F work anywhere on the page; keys that normally
			// scroll the page only take over while the viewer has focus.
			const owned =
				document.fullscreenElement === rootRef.current ||
				rootRef.current?.contains(document.activeElement) === true;
			let handled = true;
			switch (e.key) {
				case "ArrowRight":
					step(1);
					break;
				case "ArrowLeft":
					step(-1);
					break;
				case "PageDown":
					if (owned) step(1);
					else handled = false;
					break;
				case "PageUp":
					if (owned) step(-1);
					else handled = false;
					break;
				case "Home":
					if (owned) goTo(0);
					else handled = false;
					break;
				case "End":
					if (owned) goTo(count - 1);
					else handled = false;
					break;
				case "f":
				case "F":
					if (canFullscreen) toggleFullscreen();
					else handled = false;
					break;
				default:
					handled = false;
			}
			if (handled) e.preventDefault();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [step, goTo, count, canFullscreen, toggleFullscreen]);

	// Swipe to flip, but never while pinch-zooming or panning a zoomed slide.
	const onTouchStart = (e: ReactTouchEvent) => {
		if (e.touches.length > 1) {
			gesture.current = { x: 0, y: 0, multi: true };
			return;
		}
		const t = e.touches[0];
		gesture.current = t
			? { x: t.clientX, y: t.clientY, multi: false }
			: null;
	};

	const onTouchEnd = (e: ReactTouchEvent) => {
		if (e.touches.length > 0) return; // wait until every finger has lifted
		const start = gesture.current;
		gesture.current = null;
		const t = e.changedTouches[0];
		if (!start || start.multi || !t) return;
		if ((window.visualViewport?.scale ?? 1) > 1.01) return;
		const dx = t.clientX - start.x;
		const dy = t.clientY - start.y;
		if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
			step(dx < 0 ? 1 : -1);
		}
	};

	// Clicking anywhere in the viewer lets it own Home/End/PageUp/PageDown,
	// even in browsers that don't focus buttons on click (Safari).
	const onPointerDown = () => {
		const root = rootRef.current;
		if (root && !root.contains(document.activeElement)) {
			root.focus({ preventScroll: true });
		}
	};

	const current = index + 1;
	const atStart = index === 0;
	const atEnd = index === count - 1;
	const describedBy =
		textIdPrefix && hasText?.[index]
			? `${textIdPrefix}${current}`
			: undefined;

	return (
		<div
			ref={rootRef}
			role="region"
			aria-roledescription="slide deck"
			aria-label={`${title}: slides`}
			tabIndex={-1}
			onPointerDown={onPointerDown}
			className={cn(
				"flex flex-col outline-none",
				isFullscreen
					? "h-full w-full bg-black text-white"
					: "aero-glass slide-deck-size mx-auto w-full gap-3 p-2 sm:p-3",
			)}
			style={
				isFullscreen
					? undefined
					: ({ "--slide-ratio": width / height } as CSSProperties)
			}
		>
			<div
				className={cn(
					"group relative w-full select-none overflow-hidden bg-[#0b1620]",
					isFullscreen ? "flex-1" : "rounded-xl",
				)}
				style={
					isFullscreen
						? undefined
						: { aspectRatio: `${width} / ${height}` }
				}
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}
				onTouchCancel={() => (gesture.current = null)}
			>
				{/* Shown until the slide image paints over it. */}
				<div
					className="absolute inset-0 flex items-center justify-center"
					aria-hidden="true"
				>
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
				</div>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={slideSrc(slug, current)}
					alt={`Slide ${current} of ${count}`}
					aria-describedby={describedBy}
					width={width}
					height={height}
					draggable={false}
					className="relative h-full w-full object-contain"
				/>

				{/* Large tap targets on either side (mouse shortcut; the labelled
				    buttons below are the accessible controls). */}
				<button
					type="button"
					tabIndex={-1}
					aria-hidden="true"
					onClick={() => step(-1)}
					disabled={atStart}
					className="absolute inset-y-0 left-0 hidden w-1/5 items-center justify-start pl-3 text-white opacity-0 transition-opacity focus:outline-none disabled:hidden group-hover:opacity-100 sm:flex"
				>
					<span className="rounded-full bg-black/45 p-2 backdrop-blur-sm">
						<ChevronLeft className="h-6 w-6" />
					</span>
				</button>
				<button
					type="button"
					tabIndex={-1}
					aria-hidden="true"
					onClick={() => step(1)}
					disabled={atEnd}
					className="absolute inset-y-0 right-0 hidden w-1/5 items-center justify-end pr-3 text-white opacity-0 transition-opacity focus:outline-none disabled:hidden group-hover:opacity-100 sm:flex"
				>
					<span className="rounded-full bg-black/45 p-2 backdrop-blur-sm">
						<ChevronRight className="h-6 w-6" />
					</span>
				</button>

				<div
					className="absolute inset-x-0 bottom-0 h-1 bg-white/15"
					aria-hidden="true"
				>
					<div
						className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-[width] duration-300"
						style={{ width: `${(current / count) * 100}%` }}
					/>
				</div>
			</div>

			<div
				className={cn(
					"flex items-center justify-between gap-3",
					isFullscreen ? "px-4 py-3" : "px-1",
				)}
			>
				{/* aria-disabled (not disabled) so a focused button keeps focus
				    when it reaches the first/last slide. */}
				<button
					type="button"
					onClick={() => step(-1)}
					aria-disabled={atStart}
					aria-label="Previous slide"
					className="aero-btn h-10 min-w-0 px-4 aria-disabled:pointer-events-none aria-disabled:opacity-40"
				>
					<ChevronLeft className="h-5 w-5" aria-hidden="true" />
				</button>

				<p
					className="text-sm font-semibold tabular-nums"
					aria-live="polite"
					aria-atomic="true"
				>
					Slide {current}{" "}
					<span
						className={
							isFullscreen
								? "text-white/60"
								: "text-muted-foreground"
						}
					>
						of {count}
					</span>
				</p>

				<div className="flex items-center gap-2">
					{canFullscreen && (
						<button
							type="button"
							onClick={toggleFullscreen}
							aria-label={
								isFullscreen
									? "Exit full screen"
									: "Full screen"
							}
							title={
								isFullscreen
									? "Exit full screen (F)"
									: "Full screen (F)"
							}
							className="aero-btn hidden h-10 min-w-0 px-3 sm:inline-flex"
						>
							{isFullscreen ? (
								<Minimize2
									className="h-4 w-4"
									aria-hidden="true"
								/>
							) : (
								<Maximize2
									className="h-4 w-4"
									aria-hidden="true"
								/>
							)}
						</button>
					)}
					<button
						type="button"
						onClick={() => step(1)}
						aria-disabled={atEnd}
						aria-label="Next slide"
						className="aero-btn h-10 min-w-0 px-4 aria-disabled:pointer-events-none aria-disabled:opacity-40"
					>
						<ChevronRight className="h-5 w-5" aria-hidden="true" />
					</button>
				</div>
			</div>

			{!isFullscreen && (
				<ol
					ref={stripRef}
					className="aero-scrollbar relative flex gap-2 overflow-x-auto px-1 pb-2"
					aria-label="All slides"
				>
					{Array.from({ length: count }, (_, i) => (
						<li key={i} className="shrink-0">
							<button
								type="button"
								data-index={i}
								onClick={() => goTo(i)}
								aria-label={`Go to slide ${i + 1}`}
								aria-current={i === index ? "true" : undefined}
								className={cn(
									"block w-24 overflow-hidden rounded-lg border-2 bg-[#0b1620] transition sm:w-32",
									i === index
										? "border-sky-500 shadow-md shadow-sky-500/30"
										: "border-white/70 opacity-75 hover:opacity-100",
								)}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={thumbSrc(slug, i + 1)}
									alt=""
									loading="lazy"
									width={160}
									height={Math.round((160 * height) / width)}
									draggable={false}
									className="block h-auto w-full"
								/>
							</button>
						</li>
					))}
				</ol>
			)}
		</div>
	);
}
