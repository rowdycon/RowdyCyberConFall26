import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SettingsSection from "@/components/settings/SettingsSection";
import { Settings } from "lucide-react";
import ClientToast from "@/components/shared/ClientToast";
import { getUserCommonData } from "db/functions/user";
import Link from "next/link";
import Image from "next/image";
import c from "config";
import ProfileButton from "@/components/shared/ProfileButton";
import { Separator } from "@/components/shadcn/ui/separator";

export default async function SettingsLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { userId } = await auth();
	const user = await currentUser();

	if (!user || !userId) {
		return redirect("/sign-in");
	}

	if ((await getUserCommonData(userId)) == undefined) {
		return redirect("/register");
	}

	return (
		<>
			<div className="aero-page-bg fixed inset-0 -z-10" />
			<ClientToast />
			<div className="m-5 flex items-center justify-between rounded-2xl border border-white/50 bg-white/40 px-4 py-3 shadow-md backdrop-blur-md">
				<div className="flex items-center gap-x-4">
					<Link href="/">
						<Image
							src={c.icon.svg}
							alt={c.hackathonName + " Logo"}
							width={32}
							height={32}
						/>
					</Link>

					<div className="h-[45%] w-[2px] rotate-[25deg] bg-[#0b4a86]/40" />
					<Link href="/dash">
						<h2 className="font-bold tracking-tight text-[#0b4a86]">
							Dashboard
						</h2>
					</Link>
				</div>
				<ProfileButton />
			</div>
			<Separator />
			<div className="mx-3 grid max-w-5xl grid-cols-5 gap-x-3 py-12 md:mx-auto">
				<div className="col-span-5 mb-10 flex items-center gap-x-2 text-3xl font-bold">
					<Settings />
					Settings
				</div>
				<aside className="sticky hidden h-screen md:block">
					<SettingsSection name="Account" path="/settings#account" />
					{/* <SettingsSection name="Profile" path="/settings#profile" /> */}
					<SettingsSection
						name="Registration"
						path="/settings#registration"
					/>
				</aside>
				<div className="col-span-5 mb-20 md:col-span-4 md:ml-5">
					{children}
				</div>
			</div>
		</>
	);
}
