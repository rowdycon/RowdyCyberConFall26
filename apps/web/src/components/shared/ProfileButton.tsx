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

const menuItemClasses =
	"text-md cursor-pointer rounded-lg px-6 py-1.5 text-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground";

const dropdownContentClasses =
	"aero-glass mt-1 w-52 rounded-xl border border-white/60 p-0";

export default async function ProfileButton() {
	const clerkUser = await auth();
	const { userId } = clerkUser;

	// This is our default component if there is no user data
	if (!userId) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="aero-inset relative flex items-center justify-center px-2 py-1 text-sm text-foreground transition-all hover:brightness-105">
						<DefaultDropdownTrigger />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className={`${dropdownContentClasses} w-48`}
					align="end"
					forceMount
				>
					<DropdownMenuGroup className="p-1">
						<Link href={`/sign-in`}>
							<DropdownMenuItem
								className={`${menuItemClasses} text-lg`}
							>
								Sign In
							</DropdownMenuItem>
						</Link>
						<Link href={`/register`}>
							<DropdownMenuItem
								className={`${menuItemClasses} text-lg`}
							>
								Register
							</DropdownMenuItem>
						</Link>
						<MobileNavBarLinks />

						<Link href={`/bug-report`}>
							<DropdownMenuItem
								className={`${menuItemClasses} text-lg`}
							>
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
					<button className="aero-inset relative flex min-w-[75px] items-center justify-center px-2 py-1 text-sm text-foreground transition-all hover:brightness-105">
						<DefaultDropdownTrigger />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className={`${dropdownContentClasses} w-48`}
					align="end"
					forceMount
				>
					<DropdownMenuGroup className="p-1">
						<Link href={`/register`}>
							<DropdownMenuItem className={menuItemClasses}>
								Complete Registration
							</DropdownMenuItem>
						</Link>
						<MobileNavBarLinks />
						<Link href={`/bug-report`}>
							<DropdownMenuItem className={menuItemClasses}>
								Report a Bug
							</DropdownMenuItem>
						</Link>
					</DropdownMenuGroup>

					<div className="mx-2 my-1 h-px bg-border" />
					<SignOutButton redirectUrl={"/"}>
						<DropdownMenuItem className="text-md m-1 cursor-pointer rounded-lg px-6 py-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground">
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
				<button className="aero-inset relative flex min-w-0 items-center justify-center rounded-full p-0.5 transition-all hover:brightness-105">
					<Avatar className="h-8 w-8 border-2 border-white/70">
						<AvatarImage
							src={user.profilePhoto}
							alt={`@${user.hackerTag}`}
						/>
						<AvatarFallback className="bg-primary text-[10px] font-bold text-primary-foreground">
							{user.firstName.charAt(0) + user.lastName.charAt(0)}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className={dropdownContentClasses}
				align="end"
				forceMount
			>
				<DropdownMenuLabel className="aero-inset m-1 p-2 font-normal">
					<div className="flex flex-col space-y-0.5">
						<p className="text-[12px] font-bold leading-tight text-foreground">
							{`${user.firstName} ${user.lastName}`}
						</p>
						<p className="text-[11px] font-semibold leading-tight text-muted-foreground">
							@{user.hackerTag}
						</p>
					</div>
				</DropdownMenuLabel>

				<div className="mx-2 my-1 h-px bg-border" />
				<DropdownMenuGroup className="p-1">
					<Link href={"/dash"}>
						<DropdownMenuItem className={menuItemClasses}>
							Dashboard
						</DropdownMenuItem>
					</Link>
					<Link href={`/@${user.hackerTag}`}>
						<DropdownMenuItem className={menuItemClasses}>
							Profile
						</DropdownMenuItem>
					</Link>
					<Link href={`/dash/pass`}>
						<DropdownMenuItem className={menuItemClasses}>
							Event Pass
						</DropdownMenuItem>
					</Link>

					<Link href={c.links.guide} target="_blank">
						<DropdownMenuItem className={menuItemClasses}>
							Survival Guide
						</DropdownMenuItem>
					</Link>

					<Restricted user={user} permissions={PermissionType.ADMIN}>
						<Link href={`/admin`}>
							<DropdownMenuItem
								className={`${menuItemClasses} font-bold text-primary`}
							>
								Admin
							</DropdownMenuItem>
						</Link>
					</Restricted>
					<div className="my-1 h-px bg-border" />

					<MobileNavBarLinks />

					<Link href={`/bug-report`}>
						<DropdownMenuItem className={menuItemClasses}>
							Report a Bug
						</DropdownMenuItem>
					</Link>

					<Link href={"/settings"}>
						<DropdownMenuItem className={menuItemClasses}>
							Settings
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>

				<div className="mx-2 my-1 h-px bg-border" />

				<SignOutButton redirectUrl={"/"}>
					<DropdownMenuItem className="text-md m-1 cursor-pointer rounded-lg px-6 py-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground">
						Sign out
					</DropdownMenuItem>
				</SignOutButton>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
