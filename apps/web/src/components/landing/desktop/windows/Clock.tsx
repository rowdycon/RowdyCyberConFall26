const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => {
	const hour = i + 1;
	const angle = (hour * 30 * Math.PI) / 180;
	const radius = 37;
	return {
		hour,
		x: 50 + radius * Math.sin(angle),
		y: 50 - radius * Math.cos(angle),
	};
});

/**
 * Standalone event-start clock — a freestanding glossy analog clock face
 * floating directly on the desktop scene, deliberately NOT boxed in a
 * rectangular card/widget shell (that's what made it read as "a dashboard
 * gadget" instead of "a physical clock sitting on the desk"). This
 * intentionally does NOT show the visitor's live time — the hands are
 * fixed at 9:00 (the event's actual start time).
 */
export default function Clock() {
	return (
		<div className="flex h-full flex-col items-center justify-start gap-2.5 pt-1">
			<div className="relative aspect-square w-full max-w-[9.5rem]">
				<div className="aero-clock-glow absolute inset-[-22%] rounded-full" />

				{/* glossy acrylic bezel — the only place the Aero gloss lives */}
				<div className="aero-clock-bezel absolute inset-0 rounded-full p-[9%] shadow-[0_16px_34px_rgba(10,50,100,0.4)]">
					<div className="aero-clock-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-full">
						<div className="aero-clock-highlight absolute -inset-1/2 rounded-full" />
					</div>

					{/* plain, high-contrast face — numerals + hands only */}
					<div className="relative h-full w-full rounded-full border-2 border-[#0b4a86] bg-white shadow-[inset_0_2px_6px_rgba(10,50,100,0.15)]">
						{HOUR_MARKS.map(({ hour, x, y }) => (
							<span
								key={hour}
								className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[#0b2a52]"
								style={{ left: `${x}%`, top: `${y}%` }}
							>
								{hour}
							</span>
						))}

						{/* hour hand — fixed pointing at 9. The box extends
						    downward from the center pivot by default, so
						    rotate(90deg) swings it to 9 o'clock and
						    rotate(180deg) swings it to 12. */}
						<div
							className="absolute left-1/2 top-1/2 h-[24%] w-[9%] origin-top rounded-full bg-[#0b2a52]"
							style={{ transform: "rotate(90deg) translateX(-50%)" }}
						/>
						{/* minute hand — fixed pointing at 12 */}
						<div
							className="absolute left-1/2 top-1/2 h-[34%] w-[6%] origin-top rounded-full bg-[#0b2a52]"
							style={{ transform: "rotate(180deg) translateX(-50%)" }}
						/>
						{/* center pin */}
						<div className="absolute left-1/2 top-1/2 h-[11%] w-[11%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0b2a52]" />
					</div>
				</div>
			</div>

			<div className="text-center leading-tight [text-shadow:0_1px_4px_rgba(255,255,255,0.8),0_1px_2px_rgba(255,255,255,0.6)]">
				<p className="text-[10px] font-semibold uppercase tracking-wide text-[#0b4a86]/80">
					Doors Open
				</p>
				<p className="text-sm font-bold text-[#0b2a52]">9:00 AM</p>
			</div>
		</div>
	);
}
