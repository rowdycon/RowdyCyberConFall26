import UserInfoSection from "@/components/admin/users/UserInfoSection";
import type { Participant } from "db/types";

export function PersonalInfo({ user }: { user: Participant }) {
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

export function ProfileInfo({ user }: { user: Participant }) {
	const attendeeType = user.attendeeType;
	return (
		<UserInfoSection title="Profile Info">
			<div className="flex flex-wrap gap-x-10 gap-y-5">
				<Cell title="Clerk ID" value={`@${user.clerkID}`} />

				<div>
					{attendeeType === "Student Organizer" && (
						<Cell
							title="Organizing Team"
							value={user.userMetaData.organizerGroup!}
						/>
					)}
					{attendeeType === "Cyber Professional" && (
						<div>
							<Cell
								title="Company"
								value={user.userMetaData.company!}
							/>
							<Cell
								title="Title"
								value={user.userMetaData.title!}
							/>
						</div>
					)}
					{attendeeType === "University Student" && (
						<div>
							<Cell
								title="University"
								value={user.userMetaData.university!}
							/>
							<Cell
								title="University Email"
								value={user.userMetaData.universityEmail!}
							/>
							<Cell
								title="Classification"
								value={user.userMetaData.classification!}
							/>
							<Cell
								title="Major"
								value={user.userMetaData.major!}
							/>
						</div>
					)}
				</div>
			</div>
		</UserInfoSection>
	);
}

export async function AccountInfo({ user }: { user: Participant }) {
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
