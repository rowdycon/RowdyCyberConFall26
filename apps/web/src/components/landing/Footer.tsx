import {
	DiscordIcon,
	GitHubIcon,
	LinkedinIcon,
	InstagramIcon,
} from "./FooterIcons";

const orgLinks = [
	{
		label: "Women in Cyber Security",
		href: "https://rowdylink.utsa.edu/organization/wicysutsa",
	},
	{
		label: "Cyber Jedis",
		href: "https://rowdylink.utsa.edu/organization/cyberjedis",
	},
	{
		label: "Online Cyber Security Alliance",
		href: "https://rowdylink.utsa.edu/organization/ocsa",
	},
	{
		label: "ACM",
		href: "https://rowdylink.utsa.edu/organization/acm",
	},
];

const socialLinks = [
	{
		icon: InstagramIcon,
		label: "Instagram",
		href: "https://www.instagram.com/rowdycybercon/",
	},
	{
		icon: GitHubIcon,
		label: "GitHub",
		href: "https://github.com/rowdycon",
	},
	{
		icon: LinkedinIcon,
		label: "LinkedIn",
		href: "https://www.linkedin.com/company/utsa-rowdycon/",
	},
	{
		icon: DiscordIcon,
		label: "Discord",
		href: "https://discord.gg/G66gERwNgK",
	},
];

export default function Footer() {
	return (
		<footer className="relative z-10 px-4 pb-6 pt-12">
			<div className="aero-glass mx-auto max-w-6xl p-8">
				<div className="grid gap-8 md:grid-cols-3">
					{/* Brand */}
					<div>
						<h3 className="mb-2 text-lg font-bold text-foreground">
							RowdyCyberCon 2026
						</h3>
						<p className="text-sm text-muted-foreground">
							UTSA&apos;s student-run cybersecurity conference.
						</p>
						<a
							href="https://discord.gg/G66gERwNgK"
							target="_blank"
							rel="noopener noreferrer"
							className="aero-btn mt-4 inline-flex h-9 text-xs"
						>
							Join our Discord
						</a>
					</div>

					{/* Organizations */}
					<div>
						<h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							Organizations
						</h4>
						<ul className="space-y-2">
							{orgLinks.map((org) => (
								<li key={org.label}>
									<a
										href={org.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-foreground/80 transition-colors hover:text-primary"
									>
										{org.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Socials */}
					<div>
						<h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							Connect
						</h4>
						<div className="flex items-center gap-3">
							{socialLinks.map(({ icon: Icon, label, href }) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									title={label}
									className="aero-inset flex h-10 w-10 items-center justify-center text-foreground/80 transition-all hover:scale-110 hover:text-primary"
								>
									<Icon className="h-5 w-5" />
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/60 pt-4 sm:flex-row">
					<span className="text-xs text-muted-foreground">
						© 2026 RowdyCyberCon. All rights reserved.
					</span>
					<a
						href="https://github.com/acmutsa/HackKit"
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-muted-foreground transition-colors hover:text-primary"
					>
						Powered by HackKit
					</a>
				</div>
			</div>
		</footer>
	);
}
