import { format } from "date-fns";
import c from "config";

export default function HeroDescription() {
	return (
		<p className="mt-4 max-w-md text-center text-lg font-medium text-[#0b4a86] sm:text-xl">
			{format(c.startDate, "MMMM d, yyyy")} · {c.prettyLocation}
		</p>
	);
}
