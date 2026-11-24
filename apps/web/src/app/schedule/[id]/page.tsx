import { db } from "db";
import { eq } from "db/drizzle";
import { events } from "db/schema";
import FullScreenMessage from "@/components/shared/FullScreenMessage";
import EventDetails from "@/components/events/admin/EventDetails";
import { getPresentationForEvent, presentationHref } from "@/lib/presentations";

export default async function Page({ params }: { params: { id: string } }) {
	if (!params || !params.id || isNaN(parseInt(params.id))) {
		return (
			<FullScreenMessage
				title={"Invalid ID"}
				message={"The Event ID in the URL is invalid."}
			/>
		);
	}

	const event = await db.query.events.findFirst({
		where: eq(events.id, parseInt(params.id)),
	});

	if (!event) {
		return (
			<FullScreenMessage
				title={"Invalid ID"}
				message={
					"The Event ID in the URL is invalid or does not exist."
				}
			/>
		);
	}

	const presentation = getPresentationForEvent(event.id);

	return (
		<div className="mx-3">
			<EventDetails
				event={event}
				materialsLink={
					presentation
						? {
								href: presentationHref(presentation.slug),
								label: presentation.deck
									? "View the slides"
									: "Workshop materials",
							}
						: undefined
				}
			/>
		</div>
	);
}
