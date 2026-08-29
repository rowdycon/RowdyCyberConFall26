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
import WinTitleBar from "@/components/shared/WinTitleBar";

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
			{/* Floating Win98 icons background */}
			<div className="pointer-events-none fixed inset-0 opacity-5">
				{[...Array(20)].map((_, i) => (
					<div
						key={i}
						className="absolute animate-pulse"
						style={{
							left: `${(i * 13) % 100}%`,
							top: `${(i * 19) % 100}%`,
							fontSize: "32px",
							animationDelay: `${i * 0.2}s`,
						}}
					>
						{["💾", "📁", "🖥️", "📧", "🌐"][i % 5]}
					</div>
				))}
			</div>

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
				className="absolute left-1/2 top-0 z-10 h-12 w-12 -translate-x-1/2 -translate-y-6 rounded-full border-4 border-white/70 bg-white/40 backdrop-blur-md"
				style={{
					boxShadow:
						"inset 2px 2px 4px rgba(10,50,100,0.25), 2px 2px 6px rgba(10,50,100,0.2)",
				}}
			/>

			{/* Main ID Badge */}
			<div className="win98-window w-[380px] max-w-[95vw]">
				{/* Title bar */}
				<WinTitleBar
					title="Security Credentials"
					imagePath={c.icon.svg}
				/>

				{/* Content */}
				<div className="p-3">
					{/* Header section with gradient */}
					<div
						className="mb-3 rounded-xl border border-white/40 p-3"
						style={{
							background:
								"linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 45%), linear-gradient(180deg, #4fa8e0 0%, #1c6fb8 55%, #0b4a86 100%)",
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
					<div className="win98-inset bg-white/80 p-3">
						<div className="grid gap-4 md:grid-cols-[140px_1fr]">
							{/* Left - Photo */}
							<div className="flex flex-col items-center">
								<div className="win98-inset mb-2 p-1">
									<Image
										src={clerk.imageUrl}
										alt={`${user.firstName}'s Profile Picture`}
										width={120}
										height={120}
										className="rounded-md"
									/>
								</div>

								{/* Security level badge */}
								<div className="w-full rounded-full border border-white/40 bg-[#1c6fb8] py-1 text-center">
									<span className="font-mono text-xs font-bold text-white">
										{attendeeType}
									</span>
								</div>
							</div>

							{/* Right - Info */}
							<div className="space-y-2">
								{/* Name field */}
								<div>
									<label className="text-xs font-bold text-black">
										NAME:
									</label>
									<div className="win98-inset mt-0.5 bg-white/70 px-2 py-1">
										<span className="text-sm font-bold uppercase">
											{user.firstName} {user.lastName}
										</span>
									</div>
								</div>

								{/* Username field */}
								<div>
									<label className="text-xs font-bold text-black">
										USER ID:
									</label>
									<div className="win98-inset mt-0.5 bg-white/70 px-2 py-1 font-mono">
										<span className="text-sm">
											@{user.hackerTag}
										</span>
									</div>
								</div>

								{/* Location field */}
								<div>
									<label className="text-xs font-bold text-black">
										LOCATION:
									</label>
									<div className="win98-inset mt-0.5 bg-white/70 px-2 py-1 font-mono">
										<span className="text-sm">
											{c.prettyLocation}
										</span>
									</div>
								</div>

								{/* Access level */}
								<div className="flex items-center gap-2 pt-1">
									<div
										className="h-3 w-3 bg-[#00ff00]"
										style={{
											boxShadow: "0 0 8px #00ff00",
										}}
									/>
									<span className="font-mono text-xs text-black">
										ACCESS GRANTED
									</span>
								</div>
							</div>
						</div>

						{/* Divider */}
						<div className="my-3 border-t border-[#0b4a86]/20" />

						{/* Bottom section with QR and logo */}
						<div className="flex items-center justify-between">
							{/* Logo and branding */}
							<div className="flex items-center gap-2">
								<div className="win98-inset p-2">
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
									<p className="font-mono text-xs text-gray-600">
										OFFICIAL CREDENTIAL
									</p>
								</div>
							</div>

							{/* QR Code */}
							<Drawer>
								<DrawerTrigger asChild>
									<button className="win98-inset cursor-pointer bg-white p-2 transition-transform hover:scale-105">
										<QRCode
											className="h-20 w-20"
											bgColor="#ffffff"
											fgColor="#0b2a52"
											value={qrPayload}
										/>
									</button>
								</DrawerTrigger>
								<DrawerContent className="aero-page-bg flex h-[90%] w-full items-center justify-center focus-visible:outline-none">
									<div className="win98-window max-w-md">
										<WinTitleBar title="Scan QR Code" />
										<div className="bg-white p-8">
											<QRCode
												className="h-full w-full"
												bgColor="#ffffff"
												fgColor="#0b2a52"
												value={qrPayload}
											/>
										</div>
									</div>
								</DrawerContent>
							</Drawer>
						</div>
					</div>

					{/* Status bar at bottom */}
					<div className="mt-3 flex rounded-lg border border-white/40 bg-white/30 text-sm backdrop-blur-sm">
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
