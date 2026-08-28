import Link from "next/link";
import Image from "next/image";
import c from "config";
import ProfileButton from "./ProfileButton";
import { currentUser } from "@clerk/nextjs/server";
import NavBarLinksGrouper from "./NavBarLinksGrouper";
import { getUserCommonData } from "db/functions";

export default async function Navbar() {
	const user = await currentUser();
	const registrationIsComplete =
		user != null && (await getUserCommonData(user.id)) != undefined;

	return (
		<div className="sticky top-0 z-50 px-2 pt-2 sm:px-4">
			<nav
				className={
					"aero-glass flex h-14 w-full items-center justify-between px-3 sm:px-5"
				}
			>
				{/* Logo & name */}
				<Link href="/" className="flex items-center gap-2">
					<Image
						src={c.icon.svg}
						alt={c.hackathonName + " Logo"}
						width={28}
						height={28}
					/>
					<span className="hidden text-sm font-bold text-foreground sm:block">
						{c.hackathonName}
					</span>
				</Link>

				{/* Links, actions, profile */}
				<div className="flex items-center gap-2">
					<div className="hidden text-sm md:flex">
						<NavBarLinksGrouper />
					</div>

					<div className="mx-1 hidden h-6 w-px bg-border md:block" />

					<div className="mr-1 hidden items-center gap-2 md:flex">
						{user ? (
							<Link
								href={
									registrationIsComplete
										? "/dash"
										: "/register"
								}
							>
								<button className="aero-btn h-9 text-xs">
									{registrationIsComplete
										? "Dashboard"
										: "Register"}
								</button>
							</Link>
						) : (
							<>
								<Link href="/sign-in">
									<button className="aero-btn h-9 text-xs">
										Sign In
									</button>
								</Link>
								<Link href="/register">
									<button className="aero-btn h-9 text-xs">
										Register
									</button>
								</Link>
							</>
						)}
					</div>

					<ProfileButton />
				</div>
			</nav>
		</div>
	);
}
