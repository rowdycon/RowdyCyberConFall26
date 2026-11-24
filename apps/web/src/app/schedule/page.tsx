import ScheduleTimeline from "../dash/schedule/schedule-timeline";
import { getAllEvents } from "db/functions";
import c from "config";
import Link from "next/link";
import { Presentation } from "lucide-react";

export default async function Page() {
	const sched = await getAllEvents();
	const userTimeZone = c.hackathonTimezone;

	return (
		<div className="mb-20 mt-10 space-y-6 px-4 sm:px-6">
			<h1 className="mx-auto max-w-6xl text-center text-3xl font-black sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
				Schedule
			</h1>

			<div className="flex justify-center">
				<Link
					href="/presentations"
					className="aero-btn h-10 gap-2 px-6 text-sm"
				>
					<Presentation className="h-4 w-4" aria-hidden="true" />
					Slides from the talks
				</Link>
			</div>

			<ScheduleTimeline schedule={sched} timezone={userTimeZone} />
		</div>
	);
}

export const revalidate = 60;
