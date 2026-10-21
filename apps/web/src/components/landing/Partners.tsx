import partnerData from "./partners.json";
import PartnerCard, { type Partner, type PartnerCardSize } from "./PartnerCard";

type TierConfig = {
	label: string | null;
	size: PartnerCardSize;
	itemClass: string;
};

const TIER_ORDER = [
	"Cloud",
	"Horizon",
	"Gateway",
	"Beacon",
	"Unknown",
] as const;

const TIER_CONFIG: Record<string, TierConfig> = {
	Cloud: {
		label: "Cloud",
		size: "lg",
		itemClass: "w-full sm:w-[calc(50%-1rem)] md:w-72",
	},
	Horizon: {
		label: "Horizon",
		size: "md",
		itemClass: "w-[calc(50%-0.75rem)] md:w-60",
	},
	Gateway: {
		label: "Gateway",
		size: "sm",
		itemClass: "w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-52",
	},
	Beacon: {
		label: "Beacon",
		size: "sm",
		itemClass: "w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-52",
	},
	Unknown: {
		label: null,
		size: "sm",
		itemClass: "w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-52",
	},
};

const DEFAULT_TIER_CONFIG: TierConfig = {
	label: null,
	size: "sm",
	itemClass: "w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-52",
};

const partnersByTier = partnerData.partners as Record<string, Partner[]>;

const orderedTiers = [
	...TIER_ORDER.filter((tier) => tier in partnersByTier),
	...Object.keys(partnersByTier).filter(
		(tier) => !(TIER_ORDER as readonly string[]).includes(tier),
	),
];

function TierHeading({ label }: { label: string }) {
	return (
		<div className="mb-6 flex items-center justify-center gap-4">
			<div
				className="h-px w-12 md:w-20"
				style={{
					background:
						"linear-gradient(90deg, transparent, rgba(255,255,255,0.8))",
				}}
			/>
			<h3
				className="text-center text-xl font-semibold uppercase tracking-widest text-white md:text-2xl"
				style={{ textShadow: "0 2px 6px rgba(0,60,110,0.45)" }}
			>
				{label}
			</h3>
			<div
				className="h-px w-12 md:w-20"
				style={{
					background:
						"linear-gradient(90deg, rgba(255,255,255,0.8), transparent)",
				}}
			/>
		</div>
	);
}

export default function Partners() {
	return (
		<section className="relative w-full py-16" id="Partners">
			<div className="mx-auto max-w-6xl px-4">
				{/* Section title */}
				<div className="mb-10 flex flex-col items-center">
					<h2
						className="text-center text-3xl font-bold text-white md:text-4xl"
						style={{ textShadow: "0 2px 6px rgba(0,60,110,0.45)" }}
					>
						Our Partners
					</h2>
					<div
						className="mt-3 h-1 w-24 rounded-full"
						style={{
							background:
								"linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
						}}
					/>
				</div>

				{/* Partner tiers */}
				<div className="flex flex-col gap-14">
					{orderedTiers.map((tier) => {
						const partners = partnersByTier[tier] ?? [];
						if (partners.length === 0) return null;

						const config = TIER_CONFIG[tier] ?? DEFAULT_TIER_CONFIG;

						return (
							<div key={tier} aria-label={`${tier} partners`}>
								{config.label && (
									<TierHeading label={config.label} />
								)}

								{/* Floating partner tiles */}
								<div className="flex flex-wrap items-stretch justify-center gap-6">
									{partners.map((partner) => (
										<div
											key={partner.name}
											className={config.itemClass}
										>
											<PartnerCard
												partner={partner}
												size={config.size}
											/>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
