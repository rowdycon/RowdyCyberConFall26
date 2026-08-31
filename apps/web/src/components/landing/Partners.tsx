import partnerData from "./partners.json";
import PartnerCard from "./PartnerCard";

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

				{/* Floating partner tiles */}
				<div className="grid grid-cols-2 items-stretch gap-6 sm:grid-cols-3 md:grid-cols-4">
					{partnerData.partners.map((partner) => (
						<PartnerCard key={partner.name} partner={partner} />
					))}
				</div>
			</div>
		</section>
	);
}
