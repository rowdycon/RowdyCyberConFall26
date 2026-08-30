import Navbar from "@/components/shared/Navbar";
import PageBubbles from "@/components/landing/PageBubbles";
import { Oswald } from "next/font/google";
import {
	Users,
	ShieldCheck,
	Ban,
	Camera,
	Flag,
	Gavel,
	GraduationCap,
	FileCheck,
	type LucideIcon,
} from "lucide-react";

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
});

interface GuidelineSection {
	title: string;
	icon: LucideIcon;
	points: React.ReactNode[];
}

const sections: GuidelineSection[] = [
	{
		title: "Respect All Participants",
		icon: Users,
		points: [
			"Show respect and courtesy to all participants, organizers, volunteers, and staff.",
			"Avoid disruptive behavior, including harassment, intimidation, or discrimination of any kind based on gender, race, age, religion, sexual orientation, or disability.",
			"Unacceptable behavior from any community member, including sponsors and those with decision-making authority, will not be tolerated. Anyone asked to stop unacceptable behavior is expected to comply immediately.",
		],
	},
	{
		title: "Ethical Participation",
		icon: ShieldCheck,
		points: [
			"Follow the spirit of the competition and engage only with the designated challenges.",
			"Do not interfere with or disrupt other participants' work, systems, or progress.",
			"Collaboration within the rules is encouraged, but any form of cheating, collusion, or sharing of solutions outside of the competition's policies is prohibited. Any resource on the internet is at your disposal.",
		],
	},
	{
		title: "Prohibited Actions",
		icon: Ban,
		points: [
			<>
				<strong>No Unauthorized Access:</strong> Do not attempt to
				access, exploit, or modify any systems, resources, or networks
				that are not part of the challenges. This includes university
				networks, competition resources, other participants' devices, or
				any unrelated systems.
			</>,
			<>
				<strong>No Hacking of Competition Infrastructure:</strong> Do
				not attempt to attack, disable, or disrupt the competition's
				infrastructure or organizers' systems. Any exploitation of
				vulnerabilities in competition software or hardware outside of
				the specified challenges is strictly forbidden.
			</>,
			<>
				<strong>No Malicious Activities:</strong> Do not deploy or
				distribute malware, viruses, or any software intended to cause
				harm or disruption.
			</>,
		],
	},
	{
		title: "Photo, Video, and Recording Device Policy",
		icon: Camera,
		points: [
			"Event organizers will be taking pictures throughout the event. Pictures may be used in social media posts, event marketing presentations, and shared with the community to show off the event. If you are posted in a picture and would like it to be removed, please contact an event organizer or create a ticket in the Discord.",
			"Some parts of the event may be live streamed. Due to the nature of live video, individual face blurring will not be possible. Events being live streamed will be indicated as such on the schedule.",
			"Participants must have permission from anyone in the photograph or video. If you accidentally take a picture without permission, delete it. If you are asked by a participant to delete/blur a picture they did not give you permission to take, do so immediately.",
		],
	},
	{
		title: "Reporting",
		icon: Flag,
		points: [
			"If you find someone in violation of this code, please report it immediately to an organizer using a Discord ticket.",
			"If you encounter a vulnerability or issue within the competition environment that could affect the integrity of the competition, report it to the organizers immediately by creating a Discord ticket. Do not exploit the issue for personal gain or to disrupt others.",
		],
	},
	{
		title: "Consequences of Violating the Code of Conduct",
		icon: Gavel,
		points: [
			"Violations of this code may result in warnings, disqualification, or banning from the current and/or future competitions or events.",
			"Organizers reserve the right to take appropriate action, including notifying university officials or law enforcement, depending on the severity of the violation.",
		],
	},
	{
		title: "Commitment to Learning and Improvement",
		icon: GraduationCap,
		points: [
			"Use the event as an opportunity to improve your skills in cybersecurity and ethical hacking. Treat the experience as a learning opportunity, and engage constructively with any challenges.",
		],
	},
	{
		title: "Agreement to Rules",
		icon: FileCheck,
		points: [
			"By participating in this competition, you agree to adhere to this Code of Conduct and any additional rules specified by the organizers.",
			"Organizers reserve the right to update this Code of Conduct at any time.",
		],
	},
];

export const metadata = {
	title: "Guidelines | Rowdy CyberCon",
	description:
		"Code of Conduct and competition guidelines for Rowdy CyberCon.",
};

export default function Page() {
	return (
		<div
			className={`${oswald.variable} aero-bg-soft relative min-h-screen w-full overflow-x-hidden`}
		>
			<PageBubbles />
			<Navbar />
			<main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-24 pt-12 sm:px-6">
				{/* Header */}
				<div className="mb-10 text-center">
					<div
						className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-2 text-sm font-semibold text-white backdrop-blur-md"
						style={{
							background:
								"linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 50%, rgba(110,235,190,0.2) 100%)",
							boxShadow:
								"inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 16px rgba(2,84,145,0.25)",
							textShadow: "0 1px 3px rgba(0,60,110,0.5)",
						}}
					>
						<span aria-hidden="true">✦</span>
						Code of Conduct
						<span aria-hidden="true">✦</span>
					</div>
					<h1
						className="font-oswald text-4xl font-bold text-white md:text-6xl"
						style={{
							textShadow: "0 2px 6px rgba(0,60,110,0.5)",
						}}
					>
						Guidelines
					</h1>
				</div>

				{/* Intro panel */}
				<div className="aero-acrylic-panel mb-10 px-6 py-6 sm:px-8">
					<p
						className="relative z-10 text-center text-base text-white/95 md:text-lg"
						style={{
							textShadow: "0 1px 3px rgba(0,60,110,0.45)",
						}}
					>
						The goal of Rowdy CyberCon is to foster learning,
						teamwork, and cybersecurity skills in a positive and
						ethical environment. By participating, all competitors
						agree to the following rules and guidelines.
					</p>
				</div>

				{/* Sections */}
				<div className="flex flex-col gap-6">
					{sections.map((section, i) => {
						const Icon = section.icon;
						return (
							<section
								key={section.title}
								className="aero-glass rounded-3xl p-6 sm:p-8"
							>
								<div className="mb-4 flex items-center gap-4">
									{/* Numbered glossy badge */}
									<div
										className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/60 text-white"
										style={{
											background:
												"linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(110,235,190,0.3) 100%)",
											boxShadow:
												"inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 12px rgba(2,84,145,0.25)",
										}}
									>
										<Icon
											className="h-6 w-6"
											aria-hidden="true"
										/>
									</div>
									<h2 className="font-oswald text-xl font-bold text-foreground md:text-2xl">
										<span className="mr-2 text-foreground/50">
											{i + 1}.
										</span>
										{section.title}
									</h2>
								</div>
								<ul className="flex flex-col gap-3 pl-1">
									{section.points.map((point, j) => (
										<li
											key={j}
											className="flex gap-3 text-sm leading-relaxed text-foreground/90 md:text-base"
										>
											<span
												className="mt-1 shrink-0 text-emerald-600"
												aria-hidden="true"
											>
												✦
											</span>
											<span>{point}</span>
										</li>
									))}
								</ul>
							</section>
						);
					})}
				</div>

				{/* Footer note */}
				<p
					className="mt-10 text-center text-sm text-white/90"
					style={{ textShadow: "0 1px 3px rgba(0,60,110,0.45)" }}
				>
					Questions about these guidelines? Reach out to an organizer
					or open a ticket in our Discord.
				</p>
			</main>
		</div>
	);
}
