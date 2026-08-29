import c from "config";
import Image from "next/image";
import Link from "next/link";
import DashNavItem from "@/components/dash/shared/DashNavItem";
import FullScreenMessage from "@/components/shared/FullScreenMessage";
import React, { Suspense } from "react";
import ClientToast from "@/components/shared/ClientToast";
import { isUserAdmin, userHasPermission } from "../../lib/utils/server/admin";
import { PermissionType } from "@/lib/constants/permission";
import { getCurrentUser } from "@/lib/utils/server/user";
import ProfileButton from "@/components/shared/ProfileButton";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	const user = await getCurrentUser();

	if (!isUserAdmin(user)) {
		return (
			<FullScreenMessage
				title="Access Denied"
				message="You are not an admin. If you belive this is a mistake, please contact a administrator."
			/>
		);
	}

	const adminNavItems = Object.entries(c.dashPaths.admin).filter(([name]) => {
		// Gate specific admin nav items by permission
		if (
			name === "Users" &&
			!userHasPermission(user, PermissionType.VIEW_USERS)
		)
			return false;
		if (
			name === "Events" &&
			!userHasPermission(user, PermissionType.VIEW_EVENTS)
		)
			return false;
		if (
			name === "Roles" &&
			!userHasPermission(user, PermissionType.VIEW_ROLES)
		)
			return false;
		if (
			name === "Toggles" &&
			!userHasPermission(user, PermissionType.MANAGE_NAVLINKS)
		)
			return false;
		if (
			name === "Raffle" &&
			!userHasPermission(user, PermissionType.VIEW_RAFFLE)
		)
			return false;
		return true;
	});

	return (
		<div className="max-w-[100vw]">
			<div className="aero-page-bg fixed inset-0 -z-10" />
			<ClientToast duration={2500} position="top-right" />

			<div className="m-5 flex items-center justify-between rounded-2xl border border-white/50 bg-white/40 px-4 py-3 shadow-md backdrop-blur-md">
				<Link
					href={"/"}
					className="mr-2 flex items-center gap-x-2 sm:mr-5"
				>
					<Image
						src={c.icon.svg}
						alt={c.hackathonName + " Logo"}
						width={32}
						height={32}
						className="h-6 w-6 sm:h-8 sm:w-8"
					/>
					<div className="h-[45%] w-[2px] rotate-[25deg] bg-[#0b4a86]/40" />
					<h2 className="text-sm font-bold tracking-tight text-[#0b4a86] sm:text-base">
						Admin
					</h2>
				</Link>
				<ProfileButton />
			</div>

			<div className="mx-5 mt-4 h-12 w-full max-w-[calc(100vw-2.5rem)] overflow-x-auto rounded-xl border border-white/50 bg-white/30 px-3 backdrop-blur-md sm:px-5">
				<div className="flex h-full items-center gap-x-1 sm:gap-x-2">
					{adminNavItems.map(([name, path]) => (
						<DashNavItem key={name} name={name} path={path} />
					))}
				</div>
			</div>

			<div className="mt-10 w-full md:mt-20">
				<Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
			</div>
		</div>
	);
}
