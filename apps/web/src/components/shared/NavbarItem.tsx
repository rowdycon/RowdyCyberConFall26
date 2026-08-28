import Link from "next/link";

interface NavbarItemProps {
	link: string;
	children: React.ReactNode;
}

export default function NavbarItem({ children, link }: NavbarItemProps) {
	return (
		<Link href={link} target="_blank">
			<button className="aero-btn flex h-8 items-center text-xs">
				{children}
			</button>
		</Link>
	);
}
