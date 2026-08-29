import {
	HelpCircle,
	Info,
	MessageCircle,
	UserPlus,
	Users,
} from "lucide-react";
import c from "config";

const ITEMS: {
	icon: typeof Info;
	label: string;
	href: string;
	external?: boolean;
}[] = [
	{ icon: Info, label: "About", href: "#About" },
	{ icon: Users, label: "Partners", href: "#Partners" },
	{ icon: HelpCircle, label: "FAQ", href: "#FAQ" },
	{
		icon: MessageCircle,
		label: "Discord",
		href: c.links.discord,
		external: true,
	},
	{ icon: UserPlus, label: "Register", href: "/register" },
];

/**
 * The site's only quick-nav: a horizontal strip under the hero on small
 * screens, a vertical rail top-left from `lg` up. One nav, not a second
 * copy of it living in a separate window.
 */
export default function DesktopIcons() {
	return (
		<nav
			className="cybercon-area-icons aero-enter flex flex-wrap justify-center gap-3 lg:flex-col lg:justify-start"
			style={{ animationDelay: "80ms" }}
			aria-label="Quick navigation"
		>
			{ITEMS.map(({ icon: Icon, label, href, external }) => (
				<a
					key={label}
					href={href}
					target={external ? "_blank" : undefined}
					rel={external ? "noopener noreferrer" : undefined}
					className="group flex w-16 flex-col items-center gap-1 text-center lg:w-20"
				>
					<span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/30 text-[#0b4a86] shadow-md backdrop-blur-md transition-all duration-200 group-hover:-translate-y-1 group-hover:bg-white/50 group-hover:shadow-lg">
						<Icon className="h-5 w-5" aria-hidden="true" />
					</span>
					<span className="rounded px-1 text-xs font-medium text-white [text-shadow:0_1px_3px_rgba(10,40,80,0.6)]">
						{label}
					</span>
				</a>
			))}
		</nav>
	);
}
