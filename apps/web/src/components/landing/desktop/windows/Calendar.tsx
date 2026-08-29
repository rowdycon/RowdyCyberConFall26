import {
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	isSameDay,
	startOfMonth,
} from "date-fns";
import { CalendarDays } from "lucide-react";
import c from "config";
import AeroWindow from "./AeroWindow";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar() {
	const eventDate = c.startDate;
	const monthStart = startOfMonth(eventDate);
	const monthEnd = endOfMonth(eventDate);
	const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
	const leadingBlanks = getDay(monthStart);

	return (
		<AeroWindow title="Calendar" icon={CalendarDays}>
			<div className="mb-2 text-center text-xs font-semibold text-[#0b4a86]">
				{format(eventDate, "MMMM yyyy")}
			</div>
			<div className="grid grid-cols-7 gap-y-1 text-center text-[10px]">
				{WEEKDAY_LABELS.map((label, i) => (
					<span key={i} className="font-medium text-[#0b4a86]/60">
						{label}
					</span>
				))}
				{Array.from({ length: leadingBlanks }).map((_, i) => (
					<span key={`blank-${i}`} />
				))}
				{days.map((day) => {
					const isEventDay = isSameDay(day, eventDate);
					return (
						<span
							key={day.toISOString()}
							className={
								isEventDay
									? "mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#1c6fb8] font-semibold text-white"
									: "mx-auto flex h-5 w-5 items-center justify-center text-[#0b4a86]/80"
							}
						>
							{format(day, "d")}
						</span>
					);
				})}
			</div>
			<p className="mt-3 text-center text-[11px] text-[#0b4a86]/70">
				{format(eventDate, "EEEE, MMMM d, yyyy")} · {c.prettyLocation}
			</p>
		</AeroWindow>
	);
}
