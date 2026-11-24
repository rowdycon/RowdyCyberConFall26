/**
 * Talks and workshops from Rowdy CyberCon Fall 2026 that have published
 * materials. Each entry becomes a card on /presentations and a page at
 * /presentations/<slug>.
 *
 * Entries with slides need files in public/presentations/<slug>/ and a key in
 * manifests.json, both produced by scripts/presentations/render_slides.py.
 * See scripts/presentations/README.md for the full steps.
 */

export const PRESENTATION_TOPICS = [
	"AI",
	"Malware",
	"Offense",
	"Defense",
	"GRC",
	"Crypto",
	"Careers",
	"Tools",
	"Web",
	"Radio",
] as const;

export type PresentationTopic = (typeof PRESENTATION_TOPICS)[number];

export type PresentationFormat = "Talk" | "Workshop";

export interface PresentationLink {
	label: string;
	href: string;
}

export interface PresentationEntry {
	/** URL segment: /presentations/<slug>. Lowercase kebab-case. */
	slug: string;
	title: string;
	/** The title used on the schedule, when the deck's title differs. */
	scheduleTitle?: string;
	speakers: string[];
	affiliation?: string;
	/** Matches /schedule/<eventId>. */
	eventId: number;
	format: PresentationFormat;
	/** ISO 8601 with the conference's UTC offset (CST, -06:00). */
	start: string;
	end: string;
	location: string;
	/** One or two sentences for the directory card. */
	summary: string;
	/** Full abstract. Blank lines split paragraphs; "- " lines become a list. */
	description: string;
	topics: PresentationTopic[];
	/** Primary material hosted elsewhere, for sessions without slides. */
	externalLink?: PresentationLink;
	/** The presenter's own copy, e.g. with animations or demo videos. */
	originalLink?: PresentationLink;
}

export const presentationEntries: PresentationEntry[] = [
	{
		slug: "clickfix-when-captcha-solves-you",
		title: "ClickFix: When CAPTCHA Solves You",
		speakers: ["Brian Papile"],
		eventId: 15,
		format: "Talk",
		start: "2026-11-07T08:30:00-06:00",
		end: "2026-11-07T09:00:00-06:00",
		location: "SP1 - 250",
		summary:
			"How fake CAPTCHAs and “fix it” prompts trick people into running malware themselves, and what defenders can do to block, detect, and hunt it.",
		description: `ClickFix is one of those techniques that sounds ridiculous until you see how well it works. Instead of exploiting some new software vulnerability, the attacker convinces the victim to copy and run the payload themselves. What started showing up as fake CAPTCHA prompts has expanded into fake browser errors, failed video calls, security warnings, Word and PDF lures, OneDrive pages, and even Mac and Linux variants. It is being used by everyone from commodity infostealers and ransomware crews to state-sponsored groups.

This talk walks through how ClickFix actually works, using real-world examples and a few demonstrations: the different lures attackers are using, how they convince someone that running a command is a perfectly normal part of fixing a problem, and how the technique has continued to evolve, including FileFix and FileFix2.

The second half is focused on what defenders can actually do about it: Windows and browser controls that make these attacks harder to pull off, detection opportunities, and some of the ways attackers are already getting around those controls. It finishes by hunting for active ClickFix infrastructure with tools like Censys, urlscan.io, VirusTotal, and ClickGrab, pivoting from a suspicious PowerShell command or malicious site to related infrastructure and payloads.`,
		topics: ["Malware", "Defense"],
		originalLink: {
			label: "Original deck with demo videos",
			href: "https://drive.google.com/file/d/1dXUQoGL0eMopMndNWaLWPzw2RdcTgVGZ/view",
		},
	},
	{
		slug: "state-of-ai-vishing",
		title: "When the Caller Isn't Human: The State of AI Vishing",
		scheduleTitle: "The State of AI Vishing",
		speakers: ["Jacob Villarreal"],
		eventId: 18,
		format: "Talk",
		start: "2026-11-07T09:00:00-06:00",
		end: "2026-11-07T10:00:00-06:00",
		location: "SP2 - 200",
		summary:
			"AI voice agents can now run entire vishing calls on their own. Lessons from building one that placed 2nd at DEF CON 34's Battle of the Bots, and why some of the old vishing red flags no longer reliably apply.",
		description: `AI voice agents can now run full vishing (voice phishing) calls autonomously; no human on the other end, just a bot working a script and adapting in real time. Jacob built one of these himself, and it placed 2nd at DEF CON 34's Battle of the Bots CTF.

This talk is about what that build revealed: the state of this capability, and what it means for caller authentication flows and vishing attacks. It covers the common architectures behind these bots, how call flows and social engineering scripts get configured into an LLM's system instructions, and how attackers can point this at real targets.

The goal is to plan for a threat that already exists, not a theoretical one, and to build awareness of why some of the "old" vishing red flags no longer reliably apply now that the caller might not be human at all.`,
		topics: ["AI", "Offense"],
	},
	{
		slug: "caldera-c2",
		title: "Caldera & C2 Operations",
		scheduleTitle: "Caldera C2",
		speakers: ["Josh Beck", "Dalia Pulido"],
		affiliation: "NEISD iCSI Magnet Program",
		eventId: 30,
		format: "Workshop",
		start: "2026-11-07T09:00:00-06:00",
		end: "2026-11-07T10:30:00-06:00",
		location: "SP2 - 306",
		summary:
			"A hands-on lab on the Cyber Kill Chain, the MITRE ATT&CK framework, and adversary emulation with the Caldera C2 framework.",
		description: `A hands-on lab that briefly covers how adversary techniques are classified with the Cyber Kill Chain and the MITRE ATT&CK framework, then walks through the installation and use of MITRE Caldera for adversary emulation.

To follow along, bring Kali Linux plus a disposable Windows VM to use as the target.`,
		topics: ["Offense", "Tools"],
		originalLink: {
			label: "Original Google Slides",
			href: "https://docs.google.com/presentation/d/1d97GTcAzmtJnjhoyhjBlgkEbGDNvZaHsxSbGXbBIRSY/edit?usp=sharing",
		},
	},
	{
		slug: "grc-in-plain-english",
		title: "Governance, Risk, and Compliance in Plain English: Decisions, Risks, and Rules",
		speakers: ["Loren Davis"],
		eventId: 20,
		format: "Talk",
		start: "2026-11-07T13:00:00-06:00",
		end: "2026-11-07T14:00:00-06:00",
		location: "SP1 - 230",
		summary:
			"GRC explained with everyday examples: who makes security decisions, how risk gets handled, what compliance really proves, and how these skills turn into a career.",
		description: `Cybersecurity involves more than configuring firewalls and stopping attacks. It also requires deciding who has authority, understanding what could go wrong, and demonstrating that an organization meets its obligations. These responsibilities come together in governance, risk, and compliance.

This session introduces GRC in plain English, using relatable examples to explain how organizations make informed decisions and balance security with their goals: governance as the structure for setting direction, assigning decision authority, and establishing accountability; risk as understanding uncertainty and its potential consequences; and compliance as meeting applicable requirements and providing evidence that they are being fulfilled.

It covers practical ways to address risk (avoiding an activity, reducing its likelihood or impact, sharing or transferring certain consequences, and accepting remaining risk through an informed, authorized decision), why meeting requirements does not automatically mean an organization is secure, and why decisions need ongoing review as circumstances change.

Designed especially for students and anyone exploring cybersecurity careers, it connects GRC concepts to real responsibilities and career opportunities. No prior GRC experience is required.`,
		topics: ["GRC", "Careers"],
	},
	{
		slug: "ai-agents-attack-surfaces",
		title: "AI Agents are Exploding Enterprise Attack Surfaces",
		speakers: ["Jared Kalmus"],
		affiliation: "Cisco AI Defense",
		eventId: 23,
		format: "Talk",
		start: "2026-11-07T13:00:00-06:00",
		end: "2026-11-07T14:00:00-06:00",
		location: "SP2 - 200",
		summary:
			"Enterprises are moving from chatbots to autonomous agents, and the attack surface is exploding. Real attacks, the novel risks agents bring, and a playbook for securing them.",
		description: `This talk tracks the accelerating adoption of AI in the enterprise as deployments evolve from simple chatbots to complex, autonomous, and powerful orchestrated agentic systems. As the deployments have evolved, the observed security risks have sharply escalated.

It details real-life attacks, explains why agentic systems expose novel risks that legacy security tools can't control, and gives actionable advice for securing agentic systems before and after deployment.

Attendees leave with a deeper understanding of how advanced AI systems work, the security risks they present, a playbook for governing agentic deployments, and resources to keep learning and launch a career in AI security, one of the fastest-growing fields in the industry.`,
		topics: ["AI", "Defense"],
	},
	{
		slug: "quantum-readiness",
		title: "Quantum Readiness: PQC Standardization and Migration",
		scheduleTitle: "Quantum Readiness",
		speakers: ["Keeban Villarreal"],
		eventId: 26,
		format: "Talk",
		start: "2026-11-07T14:00:00-06:00",
		end: "2026-11-07T14:30:00-06:00",
		location: "SP1 - 250",
		summary:
			"Which algorithms quantum computers will break, what the 2026 federal mandates require, and four first steps for planning a post-quantum migration.",
		description: `Which algorithms are quantum-vulnerable, and why symmetric cryptography does not need an emergency migration. What the 2026 executive order and OMB memorandum require, who they reach, and where the obligation ends.

The talk shows how to rank your own systems by exposure using data lifetime and replacement cycles rather than a compliance date, and ends with four first steps:

- Inventory cryptographic assets.
- Rank systems by how long their data must stay secret.
- Write post-quantum and crypto-agility requirements into vendor contracts.
- Deploy crypto-agile gateways where field devices cannot be changed.`,
		topics: ["Crypto", "GRC"],
	},
	{
		slug: "inside-the-soc",
		title: "Inside the SOC: An Intern's Journey Through Real-World Cyber Defense",
		scheduleTitle:
			"Inside the SOC: A Journey Through Real-World Cyber Defense",
		speakers: ["Wesley Huhn", "Bella LoDuca", "Derec Chavez"],
		affiliation: "UTSA Cybersecurity Operations",
		eventId: 31,
		format: "Talk",
		start: "2026-11-07T14:00:00-06:00",
		end: "2026-11-07T14:30:00-06:00",
		location: "SP2 - 300",
		summary:
			"Interns from UTSA's Cybersecurity Operations Internship Program on life inside a real Security Operations Center: monitoring, triage, incident response, and projects.",
		description: `Members of the UTSA Cybersecurity Operations Internship Program (CSOIP) share their firsthand experience rotating through a modern Security Operations Center.

The session covers the tools, processes, and investigations that shape the internship, from threat monitoring and alert triage to incident response simulations and projects, and how early-career analysts develop the mindset, technical skills, and teamwork required to operate in a real-world cybersecurity environment.`,
		topics: ["Defense", "Careers"],
	},
	{
		slug: "gayfemboy-malware",
		title: "Meow-Ware: A Look at the Gayfemboy Malware",
		scheduleTitle: "A Look at the Gayfemboy Malware",
		speakers: ["Dante Moreno"],
		eventId: 24,
		format: "Talk",
		start: "2026-11-07T14:30:00-06:00",
		end: "2026-11-07T15:30:00-06:00",
		location: "SP2 - 200",
		summary:
			"A tour of the Mirai-based Gayfemboy botnet: where it came from, how it has evolved, and how to defend against it.",
		description: `Gayfemboy (yes, that is the actual name) is a recent strain of malware with an impact reaching around the world and across many industries. This presentation looks at the findings published by established malware researchers and highlights their observations in an entertaining way.

- Mirai, the botnet it is based on
- Gayfemboy's evolution and new features
- Mitigation recommendations`,
		topics: ["Malware"],
	},
	{
		slug: "git-for-dummies",
		title: "Git for Dummies",
		speakers: ["Paul Christiansen"],
		eventId: 14,
		format: "Workshop",
		start: "2026-11-07T15:00:00-06:00",
		end: "2026-11-07T16:00:00-06:00",
		location: "SP1 - 250",
		summary:
			"A type-along workshop that builds a real mental model of Git: snapshots, branches, merge conflicts, and the “oh no” commands.",
		description: `A hands-on workshop for anyone who has ever cloned a repo, made changes, and then quietly deleted the whole folder and started over because something broke.

Most people learn Git by copying commands until the error message goes away. That works right up until it doesn't. This workshop replaces that with a mental model of what Git is doing under the hood, starting from the idea everything else hangs off of: Git tracks snapshots, not files. Once that clicks, commits, branches, and merges stop feeling like magic incantations and start feeling like moving a pointer around.

It walks through the day-to-day workflow (init and clone, staging, committing with a message your future self will thank you for, and pushing to a remote), then the parts people actually struggle with: branching, resolving merge conflicts without panicking, fetch vs. pull vs. push, .gitignore and keeping secrets out of repos, and the "oh no" commands: reset, revert, checkout, and stash. It also covers forks, merge requests, and contributing to a project without stepping on anyone's work.

Attendees leave with a working local repo, a resolved merge conflict, a merge request they opened themselves, and enough understanding to be unafraid of the tool.`,
		topics: ["Tools"],
	},
	{
		slug: "meshtastic",
		title: "Where We're Going, We Don't Need the Internet",
		scheduleTitle: "Meshtastic!",
		speakers: ["Jason Scarlett"],
		affiliation: "San Antonio Radio Club · MeshTexas",
		eventId: 34,
		format: "Talk",
		start: "2026-11-07T16:30:00-06:00",
		end: "2026-11-07T17:00:00-06:00",
		location: "SP1 - 230",
		summary:
			"Building a secure, community-run mesh radio network across Texas with MeshCore, MeshTexas, and the San Antonio Radio Club.",
		description: `MeshTexas is a volunteer-led initiative, sponsored by the non-profit San Antonio Radio Club, that supports mesh radio communities across Texas. This talk covers securing a community-built, resilient mesh radio network that keeps working without cell service or the internet.

- Getting started with MeshCore, an open-source LoRa packet-radio messaging protocol, and loading its firmware onto a device
- How repeaters, companion radios, and observers fit together
- Mapping the Texas mesh and finding where you can contribute
- Known security and privacy challenges in MeshCore
- How to get involved`,
		topics: ["Radio"],
	},
	{
		slug: "web-application-exploitation",
		title: "Breaking the Web: Web Application Exploitation",
		scheduleTitle: "Web Application Exploitation",
		speakers: ["Aditya Dindi"],
		eventId: 28,
		format: "Workshop",
		start: "2026-11-07T18:00:00-06:00",
		end: "2026-11-07T19:00:00-06:00",
		location: "SP1 - 230",
		summary:
			"An interactive intro to web hacking: HTTP fundamentals, IDOR, XSS, and SQL injection, plus how to defend against each one.",
		description: `A practical introduction to web application security, from foundational concepts to discovering and exploiting common web vulnerabilities. It starts with the fundamentals of web applications: the client-server model, HTTP requests and responses, authentication, session management, and common application architectures, then explores the attack surface and the mindset and methodology security researchers use when assessing web security.

The hands-on portion demonstrates Insecure Direct Object References (IDOR), Cross-Site Scripting (XSS), and SQL Injection (SQLi) through guided examples and interactive exercises: how these vulnerabilities occur, how to identify them during testing, and the impact they can have. It also covers basic reconnaissance, request manipulation, and widely used web security testing tools.

For each vulnerability, the workshop also covers secure coding principles, common mitigations, and best practices for developers and security teams. The workshop material lives on an interactive site you can work through at your own pace.`,
		topics: ["Web", "Offense"],
		externalLink: {
			label: "Open the interactive workshop",
			href: "https://rowdycybercon.adityadindi.com/",
		},
	},
];
