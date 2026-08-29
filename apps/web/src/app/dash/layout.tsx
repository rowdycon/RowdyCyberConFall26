import c from "config";
import Image from "next/image";

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import DashNavItem from "@/components/dash/shared/DashNavItem";
import { redirect } from "next/navigation";
import ClientToast from "@/components/shared/ClientToast";

import { TRPCReactProvider } from "@/trpc/react";
import { getUserCommonData } from "db/functions";
import ProfileButton from "@/components/shared/ProfileButton";

interface DashLayoutProps {
	children: React.ReactNode;
}

export default async function DashLayout({ children }: DashLayoutProps) {
	const clerkUser = await currentUser();

	if (!clerkUser || (await getUserCommonData(clerkUser.id)) == undefined) {
		return redirect("/register");
	}

	const user = await getUserCommonData(clerkUser.id);
	if (!user) return redirect("/register");

	if (
		(c.featureFlags.core.requireUsersApproval as boolean) === true &&
		user.isApproved === false
	) {
		return redirect("/i/approval");
	}

	return (
		<>
			<TRPCReactProvider>
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
						<h2 className="font-bold tracking-tight text-[#0b4a86]">
							Dashboard
						</h2>
					</div>
					<ProfileButton />
				</div>
				<div className="mx-5 mt-4 flex h-12 w-full items-center rounded-xl border border-white/50 bg-white/30 px-5 backdrop-blur-md">
					{Object.entries(c.dashPaths.dash).map(([name, path]) => (
						<DashNavItem key={name} name={name} path={path} />
					))}
				</div>
				{children}
			</TRPCReactProvider>
		</>
	);
}
