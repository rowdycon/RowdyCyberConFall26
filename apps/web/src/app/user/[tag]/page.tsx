import { notFound } from "next/navigation";
import Image from "next/image";
import RoleBadge from "@/components/dash/shared/RoleBadge";
import Navbar from "@/components/shared/Navbar";
import { getUserCommonDataByTag } from "db/functions";
import c from "config";

function Field({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode | null | undefined;
}) {
	if (!value) return null;
	return (
		<div className="aero-inset flex flex-col gap-0.5 px-4 py-2.5">
			<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			<span className="text-sm font-medium">{value}</span>
		</div>
	);
}

export default async function ({ params }: { params: { tag: string } }) {
	if (!params.tag || params.tag.length <= 1) return notFound();

	const user = await getUserCommonDataByTag(params.tag);
	if (!user) return notFound();

	const isPresenting = user.isPresenting;
	type AttendeeType = (typeof c.registration.attendeeTypes)[number];
	const attendeeType: AttendeeType = user.attendeeType as AttendeeType;
	const meta = user.userMetaData;

	return (
		<>
			<Navbar />
			<div className="aero-bg-soft min-h-screen w-full overflow-x-hidden px-4 py-12">
				<div className="relative z-10 mx-auto max-w-4xl">
					<div className="aero-glass overflow-visible">
						{/* Banner */}
						<div
							className="h-32 rounded-t-2xl"
							style={{
								background:
									"linear-gradient(135deg, #0982cd 0%, #45c3f0 55%, #6eebbe 100%)",
								boxShadow:
									"inset 0 1px 0 rgba(255,255,255,0.6)",
							}}
						/>

						<div className="px-6 pb-8 sm:px-10">
							{/* Avatar overlapping banner */}
							<div className="-mt-16 mb-4 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
								<div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-xl">
									<Image
										fill
										src={user.profilePhoto}
										alt={`@${user.hackerTag}'s Profile Photo`}
										className="object-cover"
									/>
								</div>
								<div className="flex flex-col items-center gap-1 pb-1 sm:items-start">
									<h1 className="text-2xl font-bold">
										{user.firstName} {user.lastName}
									</h1>
									<p className="font-mono text-sm text-muted-foreground">
										@{user.hackerTag}
									</p>
								</div>
								<div className="flex flex-1 items-center justify-center gap-2 pb-1 sm:justify-end">
									<RoleBadge role={user.role} />
									{/* Attendee type badge */}
									<span
										className="rounded-full border border-white/60 px-4 py-1 text-xs font-bold text-white"
										style={{
											background:
												"linear-gradient(180deg, #45c3f0 0%, #0982cd 100%)",
											boxShadow:
												"inset 0 1px 0 rgba(255,255,255,0.6)",
											textShadow:
												"0 1px 2px rgba(0,60,110,0.4)",
										}}
									>
										{attendeeType}
									</span>
								</div>
							</div>

							{/* Details grid */}
							<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
								<Field label="Email" value={user.email} />
								<Field
									label="Attendee Type"
									value={attendeeType}
								/>

								{attendeeType === "University Student" && (
									<>
										<Field
											label="University"
											value={meta.university}
										/>
										<Field
											label="University Email"
											value={meta.universityEmail}
										/>
										<Field
											label="Classification"
											value={meta.classification}
										/>
										<Field
											label="Major"
											value={meta.major}
										/>
									</>
								)}

								{attendeeType === "Cyber Professional" && (
									<>
										<Field
											label="Company"
											value={meta.company}
										/>
										<Field
											label="Title"
											value={meta.title}
										/>
									</>
								)}

								{attendeeType === "Student Organizer" && (
									<Field
										label="Organizer Group"
										value={meta.organizerGroup}
									/>
								)}
							</div>

							{/* Presentation card */}
							{isPresenting && meta.presentationName && (
								<div className="mt-6">
									<div className="aero-glass p-5">
										<div className="mb-1 flex items-center gap-2">
											<span
												className="flex h-8 w-8 items-center justify-center rounded-full text-base text-white"
												style={{
													background:
														"linear-gradient(180deg, #6eebbe 0%, #2bb98a 100%)",
													boxShadow:
														"inset 0 1px 0 rgba(255,255,255,0.6)",
												}}
											>
												🎤
											</span>
											<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Presenting
											</span>
										</div>
										<p className="text-base font-bold">
											{meta.presentationName}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
