"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import GlassHeader from "../shared/GlassHeader";

type Participant = {
	userId: string;
	firstName: string;
	lastName: string;
	points: number;
};

function pickWinner(participants: Participant[]): Participant {
	const total = participants.reduce((s, p) => s + p.points, 0);
	let r = Math.random() * total;
	for (const p of participants) {
		r -= p.points;
		if (r <= 0) return p;
	}
	return participants[participants.length - 1];
}

export function RaffleClient({
	participants,
}: {
	participants: Participant[];
}) {
	const [winner, setWinner] = useState<Participant | null>(null);
	const [isSpinning, setIsSpinning] = useState(false);
	const [drumName, setDrumName] = useState("");
	const [history, setHistory] = useState<Participant[]>([]);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const total = useMemo(
		() => participants.reduce((s, p) => s + p.points, 0),
		[participants],
	);

	const draw = useCallback(() => {
		if (isSpinning) return;
		setWinner(null);
		setIsSpinning(true);

		const chosen = pickWinner(participants);

		intervalRef.current = setInterval(() => {
			const p =
				participants[Math.floor(Math.random() * participants.length)];
			setDrumName(`${p.firstName} ${p.lastName}`);
		}, 80);

		setTimeout(() => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			setIsSpinning(false);
			setWinner(chosen);
			setDrumName(`${chosen.firstName} ${chosen.lastName}`);
			setHistory((h) => [chosen, ...h.slice(0, 19)]);
		}, 2500);
	}, [isSpinning, participants]);

	return (
		<div>
			<div className="aero-glass mx-auto max-w-2xl">
				<GlassHeader title="Raffle Draw" />

				<div className="p-4">
					<div className="mb-3 flex gap-2 text-xs">
						<div className="aero-inset px-3 py-1.5">
							<span className="text-muted-foreground">
								Participants:{" "}
							</span>
							<span className="font-bold">
								{participants.length.toLocaleString()}
							</span>
						</div>
						<div className="aero-inset px-3 py-1.5">
							<span className="text-muted-foreground">
								Total tickets:{" "}
							</span>
							<span className="font-bold">
								{total.toLocaleString()}
							</span>
						</div>
					</div>

					<div className="aero-inset mb-3 p-3">
						<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Draw
						</div>
						<div className="flex items-center gap-2">
							<div className="aero-inset flex h-9 flex-1 items-center overflow-hidden px-3 text-sm font-bold">
								{isSpinning ? (
									<span className="text-primary">
										{drumName || "..."}
									</span>
								) : winner ? (
									<span className="text-primary">
										{winner.firstName} {winner.lastName}
									</span>
								) : (
									<span className="text-muted-foreground">
										Press "Draw" to pick a winner
									</span>
								)}
							</div>
							<button
								onClick={draw}
								disabled={isSpinning}
								className="aero-btn px-5 py-1.5 text-xs disabled:opacity-50"
							>
								{isSpinning ? "Drawing..." : "Draw"}
							</button>
						</div>
						{winner && !isSpinning && (
							<div className="aero-inset mt-2 bg-secondary/10 px-3 py-1.5 text-xs">
								🏆{" "}
								<strong>
									{winner.firstName} {winner.lastName}
								</strong>{" "}
								— {winner.points.toLocaleString()} tickets
							</div>
						)}
					</div>

					{history.length > 0 && (
						<div className="aero-inset p-3">
							<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								History
							</div>
							<div className="aero-inset overflow-hidden bg-white/70">
								<table className="w-full text-xs">
									<tbody>
										{history.map((w, i) => (
											<tr
												key={i}
												className={
													i % 2 === 0
														? "bg-white/60"
														: "bg-white/30"
												}
											>
												<td className="w-8 px-2 py-1 text-muted-foreground">
													#{history.length - i}
												</td>
												<td className="px-2 py-1">
													{w.firstName} {w.lastName}
												</td>
												<td className="px-2 py-1 text-right text-muted-foreground">
													{w.points.toLocaleString()}{" "}
													tickets
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
									? `Winner: ${winner.firstName} ${winner.lastName}`
									: "Ready"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
