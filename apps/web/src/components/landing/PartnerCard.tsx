import React from "react";
import Link from "next/link";
import Image from "next/image";

type Partner = {
	name: string;
	logo: string;
	url: string;
	tier: string;
};

function PartnerCard({ partner }: { partner: Partner }) {
	return (
		<Link
			href={partner.url}
			target="_blank"
			rel="noopener noreferrer"
			className="group block h-full"
		>
			<div className="aero-glass flex h-full flex-col items-center p-5 text-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
				{/* Circular logo tile */}
				<div className="mb-4 flex aspect-square w-full max-w-[120px] items-center justify-center rounded-full border-2 border-white/80 bg-white p-4 shadow-md transition-transform duration-300 group-hover:scale-105">
					<Image
						src={`/img/logo/${partner.logo}`}
						alt={`${partner.name} logo`}
						width={110}
						height={110}
						className="max-h-full max-w-full rounded-full object-contain"
					/>
				</div>

				<div className="flex flex-1 items-center justify-center">
					<h2 className="text-xs font-bold leading-tight md:text-sm">
						{partner.name}
					</h2>
				</div>
			</div>
		</Link>
	);
}

export default PartnerCard;
