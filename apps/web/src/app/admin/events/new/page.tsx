import NewEventForm from "@/components/events/admin/NewEventForm";
import { PermissionType } from "@/lib/constants/permission";
import { userHasPermission } from "@/lib/utils/server/admin";
import { getCurrentUser } from "@/lib/utils/server/user";
import { notFound } from "next/navigation";

export default async function Page() {
	const user = await getCurrentUser();
	if (!userHasPermission(user, PermissionType.CREATE_EVENTS)) {
		return notFound();
	}
	const defaultDate = new Date();

	return (
		<div className="mx-2 max-w-3xl md:mx-auto">
			<h1 className="text-3xl font-bold">New Event</h1>

			<div className="my-2 rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_32px_rgba(2,84,145,0.15)] backdrop-blur-md">
				<NewEventForm defaultDate={defaultDate} />
			</div>
		</div>
	);
}
