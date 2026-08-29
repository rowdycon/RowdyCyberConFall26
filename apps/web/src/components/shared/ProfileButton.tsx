import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import DefaultDropdownTrigger from "../dash/shared/DefaultDropDownTrigger";
import MobileNavBarLinks from "./MobileNavBarLinks";
import { getUserCommonData } from "db/functions";
import Restricted from "../Restricted";
import { PermissionType } from "@/lib/constants/permission";
import c from "config";

const menuItemClass =
	"mx-1 my-0.5 cursor-pointer rounded-lg px-4 py-1.5 text-sm text-[#0b4a86] transition-colors hover:bg-[#1c6fb8] hover:text-white focus:bg-[#1c6fb8] focus:text-white";
const menuDividerClass = "mx-2 my-1 h-px bg-white/40";

export default async function ProfileButton() {
	const clerkUser = await auth();
	const { userId } = clerkUser;

	// This is our default component if there is no user data
	if (!userId) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="win98-btn flex h-9 min-w-0 items-center justify-center px-3">
						<DefaultDropdownTrigger />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="win98-window mt-2 w-48 p-1"
					align="end"
					forceMount
				>
					<DropdownMenuGroup>
						<Link href={`/sign-in`}>
							<DropdownMenuItem className={menuItemClass}>
								Sign In
							</DropdownMenuItem>
						</Link>
						<Link href={`/register`}>
							<DropdownMenuItem className={menuItemClass}>
								Register
							</DropdownMenuItem>
						</Link>
						<MobileNavBarLinks />

						<Link href={`/bug-report`}>
							<DropdownMenuItem className={menuItemClass}>
								Report a Bug
							</DropdownMenuItem>
						</Link>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	// Make request with the clerk data that we may or may not have
	const user = await getUserCommonData(userId);

	// If we do not have a fully fledged user, encourage them to complete registration
	if (!user) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="win98-btn flex h-9 min-w-[75px] items-center justify-center px-3">
						<DefaultDropdownTrigger />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="win98-window mt-2 w-48 p-1"
					align="end"
					forceMount
				>
					<DropdownMenuGroup>
						<Link href={`/register`}>
							<DropdownMenuItem className={menuItemClass}>
								Complete Registration
							</DropdownMenuItem>
						</Link>
						<MobileNavBarLinks />
						<Link href={`/bug-report`}>
							<DropdownMenuItem className={menuItemClass}>
								Report a Bug
							</DropdownMenuItem>
						</Link>
					</DropdownMenuGroup>

					<div className={menuDividerClass} />
					<SignOutButton redirectUrl={"/"}>
						<DropdownMenuItem className="mx-1 my-0.5 cursor-pointer rounded-lg px-4 py-1.5 text-sm text-[#b3261e] transition-colors hover:bg-[#b3261e] hover:text-white focus:bg-[#b3261e] focus:text-white">
							Sign out
						</DropdownMenuItem>
					</SignOutButton>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	// Returns only if there is a full user
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/30 p-0.5 shadow-md backdrop-blur-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-white/50">
					<Avatar className="h-full w-full border border-white/60">
						<AvatarImage
							src={user.profilePhoto}
							alt={`@${user.hackerTag}`}
						/>
						<AvatarFallback className="bg-[#1c6fb8] text-[10px] font-bold text-white">
							{user.firstName.charAt(0) + user.lastName.charAt(0)}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="win98-window mt-2 w-52 p-1"
				align="end"
				forceMount
			>
				<DropdownMenuLabel className="mx-1 mb-1 mt-0.5 rounded-lg border border-white/50 bg-white/30 p-2 font-normal">
					<div className="flex flex-col space-y-0.5">
						<p className="text-[12px] font-bold leading-tight text-[#0b2a52]">
							{`${user.firstName} ${user.lastName}`}
						</p>
						<p className="text-[11px] font-semibold leading-tight text-[#0b4a86]/60">
							@{user.hackerTag}
						</p>
					</div>
				</DropdownMenuLabel>

				<div className={menuDividerClass} />
				<DropdownMenuGroup>
					<Link href={"/dash"}>
						<DropdownMenuItem className={menuItemClass}>
							Dashboard
						</DropdownMenuItem>
					</Link>
					<Link href={`/@${user.hackerTag}`}>
						<DropdownMenuItem className={menuItemClass}>
							Profile
						</DropdownMenuItem>
					</Link>
					<Link href={`/dash/pass`}>
						<DropdownMenuItem className={menuItemClass}>
							Event Pass
						</DropdownMenuItem>
					</Link>

					<Link href={c.links.guide} target="_blank">
						<DropdownMenuItem className={menuItemClass}>
							Survival Guide
						</DropdownMenuItem>
					</Link>

					<Restricted user={user} permissions={PermissionType.ADMIN}>
						<Link href={`/admin`}>
							<DropdownMenuItem
								className={`${menuItemClass} font-bold`}
							>
								Admin
							</DropdownMenuItem>
						</Link>
					</Restricted>
					<div className={menuDividerClass} />

					<MobileNavBarLinks />

					<Link href={`/bug-report`}>
						<DropdownMenuItem className={menuItemClass}>
							Report a Bug
						</DropdownMenuItem>
					</Link>

					<Link href={"/settings"}>
						<DropdownMenuItem className={menuItemClass}>
							Settings
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>

				<div className={menuDividerClass} />

				<SignOutButton redirectUrl={"/"}>
					<DropdownMenuItem className="mx-1 my-0.5 cursor-pointer rounded-lg px-4 py-1.5 text-sm text-[#b3261e] transition-colors hover:bg-[#b3261e] hover:text-white focus:bg-[#b3261e] focus:text-white">
						Sign out
					</DropdownMenuItem>
				</SignOutButton>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
