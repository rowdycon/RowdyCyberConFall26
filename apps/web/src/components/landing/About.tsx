import Link from "next/link";

const highlights = [
	{ emoji: "🛠️", label: "Hands-on Workshops" },
	{ emoji: "🚩", label: "Capture The Flag" },
	{ emoji: "🍕", label: "Free Food & Swag" },
	{ emoji: "🤝", label: "Industry Networking" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<div className="mb-10 flex flex-col items-center">
			<h2
				className="text-center text-3xl font-bold text-white md:text-4xl"
				style={{ textShadow: "0 2px 6px rgba(0,60,110,0.45)" }}
			>
				{children}
			</h2>
			<div
				className="mt-3 h-1 w-24 rounded-full"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
				}}
			/>
		</div>
	);
}

export default function About() {
	return (
		<section className="w-full py-16" id="About">
			<div className="mx-auto max-w-6xl px-4">
				<SectionTitle>About RowdyCyberCon</SectionTitle>

				{/* Asymmetric layout: glass card + floating stat chips */}
				<div className="mb-16 grid grid-cols-1 items-center gap-8 md:grid-cols-5">
					{/* Description card */}
					<div className="aero-glass p-8 md:col-span-3">
						<h3 className="mb-4 text-2xl font-bold text-primary">
							Who are we?
						</h3>
						<p className="text-base leading-relaxed">
							RowdyCyberCon is a one-day cybersecurity conference
							where San Antonio area based students can learn{" "}
							<strong>
								new skills, participate in challenges, and
								network
							</strong>
							! You'll also have the opportunity to attend a
							plethora of different{" "}
							<strong>workshops and meet employers</strong>. We
							welcome all students no matter what major or skill
							level, so go ahead and register today to secure your
							spot!
						</p>
					</div>

					{/* Floating highlight chips */}
					<div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-1">
						{highlights.map((h, i) => (
							<div
								key={h.label}
								className="aero-glass flex items-center gap-3 px-5 py-4 transition-transform hover:scale-105 md:even:translate-x-6"
							>
								<span className="text-2xl">{h.emoji}</span>
								<span className="text-sm font-semibold">
									{h.label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Partnering — centered floating card */}
				<div className="mx-auto max-w-3xl">
					<div className="aero-glass relative overflow-visible p-8 text-center">
						<h3 className="mb-3 text-2xl font-bold text-primary">
							Interested in Partnering?
						</h3>
						<p className="mx-auto mb-6 max-w-xl text-base leading-relaxed">
							RowdyCyberCon is very grateful for the amazing
							support of our partners. If you or your organization
							are interested in becoming a partner, click the
							button below to explore our Partner Packet for more
							information.
						</p>
						<Link
							href={"https://tally.so/r/WOOr1Q"}
							target="_blank"
							rel="noopener noreferrer"
						>
							<button className="aero-btn px-10 py-2.5">
								Partner Form
							</button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
