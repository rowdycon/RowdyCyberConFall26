import { getAllNavItems } from "@/lib/utils/server/redis";
import { DropdownMenuItem } from "@/components/shadcn/ui/dropdown-menu";
import Link from "next/link";

export default async function MobileNavBarLinks() {
	const navLinks = await getAllNavItems();

	return (
		<div className="cursor-pointer md:hidden">
			{navLinks.items.map((nav, key) => {
				return (
					<div key={nav.name}>
						{nav.enabled ? (
							<Link href={nav.url} target="_blank">
								<DropdownMenuItem className="mx-1 my-0.5 cursor-pointer rounded-lg px-4 py-1.5 text-sm text-[#0b4a86] transition-colors hover:bg-[#1c6fb8] hover:text-white focus:bg-[#1c6fb8] focus:text-white">
									{nav.name}
								</DropdownMenuItem>
							</Link>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

export const revalidate = 30;
