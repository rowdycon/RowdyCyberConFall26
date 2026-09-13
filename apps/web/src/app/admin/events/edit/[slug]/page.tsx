import { getEventById } from "db/functions";
import { notFound } from "next/navigation";
import EditEventForm from "@/components/events/admin/EditEventForm";
import { userHasPermission } from "@/lib/utils/server/admin";
import { PermissionType } from "@/lib/constants/permission";
import { getCurrentUser } from "@/lib/utils/server/user";

export default async function EditEventPage({
	params,
}: {
	params: { slug: string };
}) {
	const user = await getCurrentUser();
	if (!userHasPermission(user, PermissionType.EDIT_EVENTS)) {
		return notFound();
	}

	const eventId = parseInt(params.slug);

	if (!eventId) {
		return notFound();
	}

	const event = await getEventById(eventId);

	if (!event) {
		return notFound();
	}

	return (
		<div className="mx-2 max-w-3xl md:mx-auto">
			<div className="grid grid-cols-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Edit Event
				</h1>
			</div>
			<div className="my-2 rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_32px_rgba(2,84,145,0.15)] backdrop-blur-md">
				<EditEventForm {...event} />
			</div>
		</div>
	);
}
