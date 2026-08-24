import UserInfoSection from "@/components/admin/users/UserInfoSection";
import type { UserWithRole } from "db/types";

export function PersonalInfo({ user }: { user: UserWithRole }) {
	return (
		<UserInfoSection title="Personal Info">
			<div className="flex flex-wrap gap-x-10 gap-y-5">
				<Cell title="First Name" value={user.firstName} />
				<Cell title="Last Name" value={user.lastName} />
				<Cell title="Age" value={user.age} />
				<Cell title="Attendee Type" value={user.attendeeType} />
			</div>
		</UserInfoSection>
	);
}

export function ProfileInfo({ user }: { user: UserWithRole }) {
	return (
		<UserInfoSection title="Profile Info">
			<div className="flex flex-wrap gap-x-10 gap-y-5">
				<Cell title="Clerk ID" value={`@${user.clerkID}`} />
			</div>
		</UserInfoSection>
	);
}

export async function AccountInfo({ user }: { user: UserWithRole }) {
	return (
		<UserInfoSection title="Account Info">
			<div className="flex flex-wrap gap-x-10 gap-y-5">
				{user ? (
					<>
						<Cell title="Email" value={user.email} />
						<Cell title="Clerk ID" value={user.clerkID} />
					</>
				) : (
					<div className="text-yellow-500">
						Failed to find Clerk authentication data.
					</div>
				)}
			</div>
		</UserInfoSection>
	);
}

function Cell({
	title,
	value,
}: {
	title: string;
	value: string | number | boolean;
}) {
	return (
		<div>
			<p className="whitespace-nowrap font-bold">{title}</p>
			<p className="whitespace-nowrap">{value.toString()}</p>
		</div>
	);
}
