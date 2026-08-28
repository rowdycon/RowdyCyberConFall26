import QRCode from "react-qr-code";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import c from "config";
import { format } from "date-fns";
import TiltWrapper from "@/components/dash/shared/TiltWrapper";
import { createQRpayload } from "@/lib/utils/shared/qr";
import {
	Drawer,
	DrawerContent,
	DrawerTrigger,
} from "@/components/shadcn/ui/drawer";
import { getUserCommonData } from "db/functions";
import { UserWithRole } from "db/types";
import GlassHeader from "@/components/shared/GlassHeader";

interface EventPassProps {
	user: UserWithRole;
	clerk: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
	qrPayload: string;
	attendeeType: string;
}

export default async function Page() {
	const user = await currentUser();
	if (!user) return null;

	const userDbRecord = await getUserCommonData(user.id);
	if (!userDbRecord) return null;

	const qrPayload = createQRpayload({
		userID: user.id,
		createdAt: new Date(),
	});
	const attendeeType = userDbRecord.attendeeType;

	return (
		<div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
			<TiltWrapper>
				<EventPass
					user={userDbRecord}
					qrPayload={qrPayload}
					clerk={user}
					attendeeType={attendeeType}
				/>
			</TiltWrapper>
		</div>
	);
}

function EventPass({ qrPayload, user, clerk, attendeeType }: EventPassProps) {
	return (
		<div className="relative">
			{/* Lanyard hole at top */}
			<div
				className="absolute left-1/2 top-0 z-10 h-12 w-12 -translate-x-1/2 -translate-y-6 rounded-full border-4 border-white/70 bg-background"
				style={{
					boxShadow:
						"inset 2px 2px 4px rgba(2,84,145,0.25), 2px 2px 4px rgba(2,84,145,0.15)",
				}}
			/>

			{/* Main ID Badge */}
			<div className="aero-glass w-[380px] max-w-[95vw]">
				{/* Header */}
				<GlassHeader
					title="Security Credentials"
					imagePath={c.icon.svg}
				/>

				{/* Content */}
				<div className="p-3">
					{/* Header section with gradient */}
					<div
						className="mb-3 rounded-xl border border-white/50 p-3"
						style={{
							background:
								"linear-gradient(135deg, #0982cd 0%, #45c3f0 100%)",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
						}}
					>
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-bold text-white">
									{c.hackathonName}
								</h2>
								<p className="font-mono text-xs text-white/90">
									{c.itteration}
								</p>
							</div>
							<div className="text-right">
								<p className="font-mono text-xs text-white/90">
									{format(c.startDate, "MMM d, yyyy")}
								</p>
								<p className="font-mono text-xs text-white/90">
									{format(c.startDate, "h:mm a")}
								</p>
							</div>
						</div>
					</div>

					{/* ID Card Content */}
					<div className="aero-inset p-3">
						<div className="grid gap-4 md:grid-cols-[140px_1fr]">
							{/* Left - Photo */}
							<div className="flex flex-col items-center">
								<div className="mb-2 overflow-hidden rounded-xl border-2 border-white/70 shadow-md">
									<Image
										src={clerk.imageUrl}
										alt={`${user.firstName}'s Profile Picture`}
										width={120}
										height={120}
									/>
								</div>

								{/* Attendee type badge */}
								<div
									className="w-full rounded-full border border-white/50 py-1 text-center"
									style={{
										background:
											"linear-gradient(180deg, #45c3f0 0%, #0982cd 100%)",
										boxShadow:
											"inset 0 1px 0 rgba(255,255,255,0.6)",
									}}
								>
									<span className="font-mono text-xs font-bold text-white">
										{attendeeType}
									</span>
								</div>
							</div>

							{/* Right - Info */}
							<div className="space-y-2">
								{/* Name field */}
								<div>
									<label className="text-xs font-bold text-foreground">
										NAME:
									</label>
									<div className="aero-inset mt-0.5 px-2 py-1">
										<span className="text-sm font-bold uppercase">
											{user.firstName} {user.lastName}
										</span>
									</div>
								</div>

								{/* Username field */}
								<div>
									<label className="text-xs font-bold text-foreground">
										USER ID:
									</label>
									<div className="aero-inset mt-0.5 px-2 py-1 font-mono">
										<span className="text-sm">
											@{user.hackerTag}
										</span>
									</div>
								</div>

								{/* Location field */}
								<div>
									<label className="text-xs font-bold text-foreground">
										LOCATION:
									</label>
									<div className="aero-inset mt-0.5 px-2 py-1 font-mono">
										<span className="text-sm">
											{c.prettyLocation}
										</span>
									</div>
								</div>

								{/* Access level */}
								<div className="flex items-center gap-2 pt-1">
									<div
										className="h-3 w-3 rounded-full bg-secondary"
										style={{
											boxShadow:
												"0 0 8px hsl(160 65% 45%)",
										}}
									/>
									<span className="font-mono text-xs text-foreground">
										ACCESS GRANTED
									</span>
								</div>
							</div>
						</div>

						{/* Divider */}
						<div className="my-3 border-b border-white/70" />

						{/* Bottom section with QR and logo */}
						<div className="flex items-center justify-between">
							{/* Logo and branding */}
							<div className="flex items-center gap-2">
								<div className="aero-glass p-2">
									<Image
										src={c.icon.svg}
										height={50}
										width={50}
										alt=""
									/>
								</div>
								<div>
									<p className="text-xs font-bold">
										{c.hackathonName}
									</p>
									<p className="font-mono text-xs text-muted-foreground">
										OFFICIAL CREDENTIAL
									</p>
								</div>
							</div>

							{/* QR Code */}
							<Drawer>
								<DrawerTrigger asChild>
									<button className="cursor-pointer rounded-xl border-2 border-white/70 bg-white p-2 shadow-md transition-all hover:scale-105">
										<QRCode
											className="h-20 w-20"
											bgColor="#ffffff"
											fgColor="#0982cd"
											value={qrPayload}
										/>
									</button>
								</DrawerTrigger>
								<DrawerContent className="flex h-[90%] w-full items-center justify-center bg-background focus-visible:outline-none">
									<div className="aero-glass max-w-md">
										<GlassHeader title="Scan QR Code" />
										<div className="bg-white p-8">
											<QRCode
												className="h-full w-full"
												bgColor="#ffffff"
												fgColor="#0982cd"
												value={qrPayload}
											/>
										</div>
									</div>
								</DrawerContent>
							</Drawer>
						</div>
					</div>

					{/* Status bar at bottom */}
					<div className="aero-inset mt-3 flex text-sm">
						<div className="flex flex-1 items-center gap-2 px-2 py-0.5">
							<span>✓</span>
							<span>Valid Credential</span>
						</div>
						<div>
							<span className="px-2 py-0.5">
								ID: {user.hackerTag}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
