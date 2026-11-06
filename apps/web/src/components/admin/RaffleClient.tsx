"use client";

import {
	useState,
	useRef,
	useMemo,
	useCallback,
	useEffect,
	useId,
} from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "usehooks-ts";
import GlassHeader from "../shared/GlassHeader";

type Participant = {
	userId: string;
	firstName: string;
	lastName: string;
	points: number;
};

type Segment = {
	participant: Participant;
	start: number;
	end: number;
	color: string;
};

type HistoryEntry = {
	drawNo: number;
	participant: Participant;
	odds: number;
};

/* ---------- wheel geometry (SVG viewBox units) ---------- */
const VIEW = 400;
const C = VIEW / 2; // center
const RIM_R = 196;
const LIGHT_R = 184;
const WHEEL_R = 172;
const HUB_R = 34;
const LIGHT_COUNT = 24;

/* ---------- labels ---------- */
const MAX_LABELED_SEGMENTS = 60;
const MIN_LABEL_SPAN_DEG = 6;

/* ---------- spin ---------- */
const SPIN_MS = 5500;
const SPIN_MS_REDUCED = 1200;

/* Frutiger Aero palette — mirrors --chart-1..5 in globals.css */
const SLICE_COLORS = [
	"hsl(199 92% 48%)", // sky blue
	"hsl(160 65% 45%)", // aqua green
	"hsl(187 85% 43%)", // cyan
	"hsl(90 60% 50%)", // lime
	"hsl(215 80% 55%)", // blue
];

const CONFETTI_COLORS = [
	"#29a0e6",
	"#78d2ff",
	"#2bbf8a",
	"#1fb5c9",
	"#9fd65a",
	"#ffffff",
];

function pickWinner(participants: Participant[]): Participant {
	const total = participants.reduce((s, p) => s + p.points, 0);
	let r = Math.random() * total;
	for (const p of participants) {
		r -= p.points;
		// strict "< 0" so a zero-ticket entry can never win on r === 0
		if (r < 0) return p;
	}
	return participants[participants.length - 1];
}

function sliceColor(i: number, n: number) {
	let idx = i % SLICE_COLORS.length;
	// avoid the last slice matching the first one where the wheel wraps
	if (n > 1 && i === n - 1 && idx === 0) idx = 2;
	return SLICE_COLORS[idx];
}

function buildSegments(pool: Participant[]): Segment[] {
	const total = pool.reduce((s, p) => s + p.points, 0);
	if (total <= 0) return [];
	let acc = 0;
	return pool.map((participant, i) => {
		const start = (acc / total) * 360;
		acc += participant.points;
		const end = (acc / total) * 360;
		return {
			participant,
			start,
			end,
			color: sliceColor(i, pool.length),
		};
	});
}

/** Index of the segment containing `angle` (0..360), via binary search. */
function segmentAt(segments: Segment[], angle: number) {
	let lo = 0;
	let hi = segments.length - 1;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (segments[mid].end <= angle) lo = mid + 1;
		else hi = mid;
	}
	return lo;
}

/** Which segment sits under the 12 o'clock pointer at a given rotation. */
function indexUnderPointer(segments: Segment[], rotation: number) {
	if (segments.length === 0) return -1;
	const angle = ((-rotation % 360) + 360) % 360;
	return segmentAt(segments, angle);
}

function polar(r: number, deg: number) {
	const rad = (deg * Math.PI) / 180;
	return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
}

function slicePath(start: number, end: number, r: number) {
	const a = polar(r, start);
	const b = polar(r, end);
	const large = end - start > 180 ? 1 : 0;
	return `M ${C} ${C} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

function fullName(p: Participant) {
	return `${p.firstName} ${p.lastName}`;
}

function labelFor(p: Participant, maxChars: number) {
	const full = fullName(p);
	if (full.length <= maxChars) return full;
	const short = `${p.firstName} ${p.lastName.charAt(0)}.`;
	if (short.length <= maxChars) return short;
	return `${p.firstName.slice(0, Math.max(1, maxChars - 1))}…`;
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

/** Imperatively rotate the wheel group (avoids a React render per frame). */
function setWheelRotation(el: SVGGElement | null, deg: number) {
	el?.setAttribute("transform", `rotate(${deg} ${C} ${C})`);
}

/** Little "flapper" kick on the pointer each time a slice passes. */
function kickPointer(el: SVGGElement | null) {
	el?.animate(
		[{ transform: "rotate(-14deg)" }, { transform: "rotate(0deg)" }],
		{ duration: 140, easing: "ease-out" },
	);
}

function formatOdds(o: number) {
	return o >= 0.1 ? `${(o * 100).toFixed(0)}%` : `${(o * 100).toFixed(2)}%`;
}

export function RaffleClient({
	participants,
}: {
	participants: Participant[];
}) {
	const [winner, setWinner] = useState<Participant | null>(null);
	const [isSpinning, setIsSpinning] = useState(false);
	const [pointerName, setPointerName] = useState("");
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [drawCount, setDrawCount] = useState(0);
	const [excludeWinners, setExcludeWinners] = useState(true);
	const [showConfetti, setShowConfetti] = useState(false);
	const { width = 0, height = 0 } = useWindowSize();

	const wheelRef = useRef<SVGGElement | null>(null);
	const pointerRef = useRef<SVGGElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const rotationRef = useRef(0);
	const spinningRef = useRef(false);
	const segmentsRef = useRef<Segment[]>([]);

	const uid = useId().replace(/:/g, "");
	const ids = {
		gloss: `${uid}-gloss`,
		rim: `${uid}-rim`,
		hub: `${uid}-hub`,
		pointer: `${uid}-pointer`,
		clip: `${uid}-clip`,
		shadow: `${uid}-shadow`,
	};

	/* Everyone who has won this session. */
	const wonIds = useMemo(
		() => new Set(history.map((h) => h.participant.userId)),
		[history],
	);

	/* The pool the NEXT draw uses. */
	const eligible = useMemo(
		() =>
			participants.filter(
				(p) =>
					p.points > 0 && (!excludeWinners || !wonIds.has(p.userId)),
			),
		[participants, excludeWinners, wonIds],
	);

	/* What the wheel shows. The latest winner keeps their (highlighted)
	   slice until the next spin starts, so it doesn't vanish the moment
	   the wheel stops. */
	const displayed = useMemo(() => {
		if (!winner || !excludeWinners) return eligible;
		return participants.filter(
			(p) =>
				p.points > 0 &&
				(!wonIds.has(p.userId) || p.userId === winner.userId),
		);
	}, [participants, eligible, excludeWinners, wonIds, winner]);

	const segments = useMemo(() => buildSegments(displayed), [displayed]);

	const eligibleTotal = useMemo(
		() => eligible.reduce((s, p) => s + p.points, 0),
		[eligible],
	);

	const showLabels = segments.length <= MAX_LABELED_SEGMENTS;

	/* Sync wheel + pointer readout whenever the wheel's contents change. */
	useEffect(() => {
		if (spinningRef.current) return;
		segmentsRef.current = segments;
		setWheelRotation(wheelRef.current, rotationRef.current);
		const idx = indexUnderPointer(segments, rotationRef.current);
		setPointerName(idx >= 0 ? fullName(segments[idx].participant) : "");
	}, [segments]);

	/* Cancel any in-flight animation on unmount. */
	useEffect(() => {
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
			spinningRef.current = false;
		};
	}, []);

	const draw = useCallback(() => {
		if (spinningRef.current || eligible.length === 0) return;

		const pool = eligible;
		const poolSegments = buildSegments(pool);
		const poolTotal = pool.reduce((s, p) => s + p.points, 0);
		if (poolSegments.length === 0 || poolTotal <= 0) return;

		// The winner is decided up front by the weighted pick; the
		// animation just lands somewhere inside their slice.
		const chosen = pickWinner(pool);
		const seg =
			poolSegments.find((s) => s.participant.userId === chosen.userId) ??
			poolSegments[0];
		const span = seg.end - seg.start;
		const target = seg.start + span * (0.15 + Math.random() * 0.7);

		const reduced = prefersReducedMotion();
		const duration = reduced ? SPIN_MS_REDUCED : SPIN_MS;
		const turns = reduced ? 2 : 6 + Math.floor(Math.random() * 3);

		// Pointer sits at 0deg; a wheel rotated by R shows angle (-R) under
		// it, so we need R ≡ 360 - target (mod 360), plus whole turns.
		const from = rotationRef.current;
		const base = from - (((from % 360) + 360) % 360);
		const to = base + turns * 360 + ((360 - target) % 360);

		spinningRef.current = true;
		segmentsRef.current = poolSegments;
		setWinner(null);
		setShowConfetti(false);
		setIsSpinning(true);

		let lastIdx = -1;
		const startTime = performance.now();

		const frame = (now: number) => {
			const t = Math.min(1, (now - startTime) / duration);
			const rot = from + (to - from) * easeOutQuart(t);
			rotationRef.current = rot;
			setWheelRotation(wheelRef.current, rot);

			const idx = indexUnderPointer(poolSegments, rot);
			if (idx !== lastIdx && idx >= 0) {
				lastIdx = idx;
				setPointerName(fullName(poolSegments[idx].participant));
				if (!reduced && poolSegments.length > 1)
					kickPointer(pointerRef.current);
			}

			if (t < 1) {
				rafRef.current = requestAnimationFrame(frame);
				return;
			}

			rafRef.current = null;
			rotationRef.current = to % 360;
			setWheelRotation(wheelRef.current, rotationRef.current);
			spinningRef.current = false;

			const drawNo = drawCount + 1;
			setDrawCount(drawNo);
			setIsSpinning(false);
			setWinner(chosen);
			setPointerName(fullName(chosen));
			setShowConfetti(true);
			setHistory((h) => [
				{
					drawNo,
					participant: chosen,
					odds: chosen.points / poolTotal,
				},
				...h,
			]);
		};

		rafRef.current = requestAnimationFrame(frame);
	}, [eligible, drawCount]);

	const reset = () => {
		if (spinningRef.current) return;
		setHistory([]);
		setWinner(null);
		setDrawCount(0);
		setShowConfetti(false);
	};

	const canDraw = !isSpinning && eligible.length > 0;
	const latestOdds = history[0]?.odds ?? 0;

	return (
		<div>
			{showConfetti && (
				<Confetti
					onConfettiComplete={() => setShowConfetti(false)}
					recycle={false}
					run={showConfetti}
					numberOfPieces={260}
					colors={CONFETTI_COLORS}
					width={width}
					height={height}
					style={{
						position: "fixed",
						inset: 0,
						pointerEvents: "none",
						zIndex: 50,
					}}
				/>
			)}

			<div className="aero-glass mx-auto max-w-3xl">
				<GlassHeader title="Raffle Draw" />

				<div className="p-4">
					<div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
						<div className="aero-inset px-3 py-1.5">
							<span className="text-muted-foreground">
								Eligible:{" "}
							</span>
							<span className="font-bold">
								{eligible.length.toLocaleString()}
							</span>
							<span className="text-muted-foreground">
								{" "}
								/ {participants.length.toLocaleString()}
							</span>
						</div>
						<div className="aero-inset px-3 py-1.5">
							<span className="text-muted-foreground">
								Tickets in draw:{" "}
							</span>
							<span className="font-bold">
								{eligibleTotal.toLocaleString()}
							</span>
						</div>
						<label className="aero-inset flex cursor-pointer select-none items-center gap-2 px-3 py-1.5 sm:ml-auto">
							<input
								type="checkbox"
								className="h-3.5 w-3.5 accent-sky-500"
								checked={excludeWinners}
								disabled={isSpinning}
								onChange={(e) =>
									setExcludeWinners(e.target.checked)
								}
							/>
							<span>Exclude previous winners</span>
						</label>
					</div>

					<div className="mb-3 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
						{/* ---------- wheel ---------- */}
						<div className="aero-inset relative mx-auto w-full max-w-[440px] p-3">
							<svg
								viewBox={`0 0 ${VIEW} ${VIEW}`}
								className="block h-auto w-full select-none"
								role="img"
								aria-label="Raffle wheel"
							>
								<defs>
									<linearGradient
										id={ids.rim}
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="rgb(170,228,255)"
										/>
										<stop
											offset="48%"
											stopColor="rgb(41,160,230)"
										/>
										<stop
											offset="52%"
											stopColor="rgb(9,130,205)"
										/>
										<stop
											offset="100%"
											stopColor="rgb(60,175,240)"
										/>
									</linearGradient>
									<linearGradient
										id={ids.gloss}
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="#fff"
											stopOpacity="0.55"
										/>
										<stop
											offset="46%"
											stopColor="#fff"
											stopOpacity="0.12"
										/>
										<stop
											offset="50%"
											stopColor="#fff"
											stopOpacity="0"
										/>
									</linearGradient>
									<radialGradient
										id={ids.hub}
										cx="35%"
										cy="30%"
										r="75%"
									>
										<stop
											offset="0%"
											stopColor="#fff"
											stopOpacity="0.98"
										/>
										<stop
											offset="35%"
											stopColor="rgb(205,240,255)"
										/>
										<stop
											offset="100%"
											stopColor="rgb(41,160,230)"
										/>
									</radialGradient>
									<linearGradient
										id={ids.pointer}
										x1="0"
										y1="0"
										x2="1"
										y2="0"
									>
										<stop
											offset="0%"
											stopColor="rgb(120,210,255)"
										/>
										<stop
											offset="50%"
											stopColor="rgb(9,130,205)"
										/>
										<stop
											offset="100%"
											stopColor="rgb(41,160,230)"
										/>
									</linearGradient>
									<clipPath id={ids.clip}>
										<circle cx={C} cy={C} r={WHEEL_R} />
									</clipPath>
									<filter
										id={ids.shadow}
										x="-20%"
										y="-20%"
										width="140%"
										height="140%"
									>
										<feDropShadow
											dx="0"
											dy="3"
											stdDeviation="5"
											floodColor="rgb(2,84,145)"
											floodOpacity="0.3"
										/>
									</filter>
								</defs>

								{/* glossy outer rim */}
								<circle
									cx={C}
									cy={C}
									r={RIM_R}
									fill={`url(#${ids.rim})`}
									stroke="rgba(255,255,255,0.75)"
									strokeWidth={2}
									filter={`url(#${ids.shadow})`}
								/>

								{/* rim lights */}
								{Array.from({ length: LIGHT_COUNT }).map(
									(_, i) => {
										const p = polar(
											LIGHT_R,
											(i * 360) / LIGHT_COUNT,
										);
										return (
											<circle
												key={i}
												cx={p.x}
												cy={p.y}
												r={3.5}
												fill="#fff"
												className={
													isSpinning && i % 2 === 0
														? "animate-pulse"
														: undefined
												}
												opacity={
													isSpinning || i % 2
														? 0.95
														: 0.6
												}
											/>
										);
									},
								)}

								{/* rotating wheel */}
								<g ref={wheelRef}>
									{segments.length <= 1 ? (
										<circle
											cx={C}
											cy={C}
											r={WHEEL_R}
											fill={
												segments[0]?.color ??
												"rgba(200,230,245,0.9)"
											}
										/>
									) : (
										segments.map((s) => {
											const dim =
												!!winner &&
												!isSpinning &&
												s.participant.userId !==
													winner.userId;
											return (
												<path
													key={s.participant.userId}
													d={slicePath(
														s.start,
														s.end,
														WHEEL_R,
													)}
													fill={s.color}
													stroke="rgba(255,255,255,0.85)"
													strokeWidth={
														segments.length > 120
															? 0.4
															: 1.5
													}
													opacity={dim ? 0.4 : 1}
													style={{
														transition:
															"opacity 400ms ease",
													}}
												/>
											);
										})
									)}

									{showLabels &&
										segments.map((s) => {
											const span = s.end - s.start;
											if (
												segments.length > 1 &&
												span < MIN_LABEL_SPAN_DEG
											)
												return null;
											const mid =
												segments.length === 1
													? 0
													: (s.start + s.end) / 2;
											// arc length at mid-radius bounds the font size
											const arc =
												(110 *
													Math.min(span, 60) *
													Math.PI) /
												180;
											const fontSize = Math.max(
												8,
												Math.min(15, arc * 0.6),
											);
											const maxChars = Math.max(
												3,
												Math.floor(
													(WHEEL_R - HUB_R - 22) /
														(fontSize * 0.58),
												),
											);
											return (
												<text
													key={`label-${s.participant.userId}`}
													x={C + HUB_R + 12}
													y={C}
													transform={`rotate(${mid - 90} ${C} ${C})`}
													dominantBaseline="middle"
													fill="#fff"
													fontSize={fontSize}
													fontWeight={600}
													stroke="rgba(0,60,110,0.35)"
													strokeWidth={2}
													paintOrder="stroke"
												>
													{labelFor(
														s.participant,
														maxChars,
													)}
												</text>
											);
										})}
								</g>

								{/* glass sheen — static, so the light source stays put */}
								<circle
									cx={C}
									cy={C}
									r={WHEEL_R}
									fill={`url(#${ids.gloss})`}
									clipPath={`url(#${ids.clip})`}
									pointerEvents="none"
								/>
								<circle
									cx={C}
									cy={C}
									r={WHEEL_R}
									fill="none"
									stroke="rgba(255,255,255,0.8)"
									strokeWidth={2}
									pointerEvents="none"
								/>

								{/* hub bubble — doubles as a spin button */}
								<g
									role="button"
									tabIndex={canDraw ? 0 : -1}
									aria-label="Spin the wheel"
									aria-disabled={!canDraw}
									onClick={draw}
									onKeyDown={(e) => {
										if (
											e.key === "Enter" ||
											e.key === " "
										) {
											e.preventDefault();
											draw();
										}
									}}
									className={
										canDraw
											? "cursor-pointer outline-none"
											: "cursor-not-allowed outline-none"
									}
								>
									<circle
										cx={C}
										cy={C}
										r={HUB_R}
										fill={`url(#${ids.hub})`}
										stroke="rgba(255,255,255,0.9)"
										strokeWidth={2.5}
										filter={`url(#${ids.shadow})`}
									/>
									<ellipse
										cx={C - 8}
										cy={C - 15}
										rx={15}
										ry={7}
										fill="#fff"
										opacity={0.6}
									/>
									<text
										x={C}
										y={C + 1}
										textAnchor="middle"
										dominantBaseline="middle"
										fontSize={isSpinning ? 18 : 12}
										fontWeight={700}
										fill="rgb(9,100,165)"
										pointerEvents="none"
									>
										{isSpinning
											? "···"
											: drawCount > 0
												? `#${drawCount}`
												: "SPIN"}
									</text>
								</g>

								{/* droplet pointer at 12 o'clock */}
								<g
									ref={pointerRef}
									style={{
										transformBox: "fill-box",
										transformOrigin: "50% 25%",
									}}
								>
									<path
										d={`M ${C} ${C - WHEEL_R + 22} C ${C - 5} ${C - WHEEL_R + 10}, ${C - 15} ${C - RIM_R + 12}, ${C - 15} ${C - RIM_R + 2} A 15 15 0 0 1 ${C + 15} ${C - RIM_R + 2} C ${C + 15} ${C - RIM_R + 12}, ${C + 5} ${C - WHEEL_R + 10}, ${C} ${C - WHEEL_R + 22} Z`}
										fill={`url(#${ids.pointer})`}
										stroke="#fff"
										strokeWidth={2}
										filter={`url(#${ids.shadow})`}
									/>
									<ellipse
										cx={C - 4}
										cy={C - RIM_R - 3}
										rx={6}
										ry={3.5}
										fill="#fff"
										opacity={0.75}
									/>
								</g>
							</svg>
						</div>

						{/* ---------- controls ---------- */}
						<div className="flex flex-col gap-3">
							<div className="aero-inset p-3">
								<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{isSpinning
										? "Spinning"
										: winner
											? "Winner"
											: "Pointer"}
								</div>
								<div
									className="aero-inset flex h-10 items-center overflow-hidden px-3 text-sm font-bold"
									aria-live="polite"
								>
									{pointerName ? (
										<span className="truncate text-primary">
											{isSpinning || winner
												? pointerName
												: `→ ${pointerName}`}
										</span>
									) : (
										<span className="text-muted-foreground">
											{eligible.length === 0
												? "No eligible participants"
												: "Press Draw to spin"}
										</span>
									)}
								</div>
								<div className="mt-3 flex gap-2">
									<button
										onClick={draw}
										disabled={!canDraw}
										className="aero-btn flex-1 py-1.5 text-xs disabled:opacity-50"
									>
										{isSpinning ? "Drawing..." : "Draw"}
									</button>
									{history.length > 0 && (
										<button
											onClick={reset}
											disabled={isSpinning}
											className="aero-inset px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-white/80 disabled:opacity-50"
										>
											Reset
										</button>
									)}
								</div>
							</div>

							{winner && !isSpinning && (
								<div className="aero-inset bg-secondary/10 p-3 text-xs duration-500 animate-in fade-in zoom-in-95">
									<div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
										Draw #{drawCount}
									</div>
									<div className="text-base font-bold text-foreground">
										🏆 {fullName(winner)}
									</div>
									<div className="mt-1 text-muted-foreground">
										{winner.points.toLocaleString()} tickets
										· {formatOdds(latestOdds)} chance
									</div>
								</div>
							)}
						</div>
					</div>

					{history.length > 0 && (
						<div className="aero-inset p-3">
							<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								History
							</div>
							<div className="aero-inset aero-scrollbar max-h-64 overflow-y-auto bg-white/70">
								<table className="w-full text-xs">
									<tbody>
										{history.map((h, i) => (
											<tr
												key={h.drawNo}
												className={
													i % 2 === 0
														? "bg-white/60"
														: "bg-white/30"
												}
											>
												<td className="w-10 px-2 py-1 text-muted-foreground">
													#{h.drawNo}
												</td>
												<td className="px-2 py-1">
													{fullName(h.participant)}
												</td>
												<td className="px-2 py-1 text-right text-muted-foreground">
													{h.participant.points.toLocaleString()}{" "}
													tickets
												</td>
												<td className="w-16 px-2 py-1 text-right text-muted-foreground">
													{formatOdds(h.odds)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					<div className="mt-3 flex gap-1">
						<div className="aero-inset flex-1 px-2 py-1 text-[11px] text-muted-foreground">
							{isSpinning
								? "Drawing..."
								: winner
									? `Winner: ${fullName(winner)}`
									: eligible.length === 0
										? "No eligible participants"
										: "Ready"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
