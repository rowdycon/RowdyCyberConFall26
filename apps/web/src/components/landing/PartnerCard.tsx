import React from "react";
import Link from "next/link";
import Image from "next/image";

export type Partner = {
	name: string;
	logo: string;
	url: string;
};

export type PartnerCardSize = "lg" | "md" | "sm";

const sizeStyles: Record<
	PartnerCardSize,
	{ card: string; tile: string; image: number; text: string }
> = {
	lg: {
		card: "p-7",
		tile: "max-w-[180px] p-5",
		image: 170,
		text: "text-sm md:text-lg",
	},
	md: {
		card: "p-6",
		tile: "max-w-[150px] p-4",
		image: 140,
		text: "text-sm md:text-base",
	},
	sm: {
		card: "p-5",
		tile: "max-w-[120px] p-4",
		image: 110,
		text: "text-xs md:text-sm",
	},
};

function PartnerCard({
	partner,
	size = "sm",
}: {
	partner: Partner;
	size?: PartnerCardSize;
}) {
	const styles = sizeStyles[size];

	return (
		<Link
			href={partner.url}
			target="_blank"
			rel="noopener noreferrer"
			className="group block h-full"
		>
			<div
				className={`aero-glass flex h-full flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl ${styles.card}`}
			>
				{/* Circular logo tile */}
				<div
					className={`mb-4 flex aspect-square w-full items-center justify-center rounded-full border-2 border-white/80 bg-white shadow-md transition-transform duration-300 group-hover:scale-105 ${styles.tile}`}
				>
					<Image
						src={`/img/logo/${partner.logo}`}
						alt={`${partner.name} logo`}
						width={styles.image}
						height={styles.image}
						className="max-h-full max-w-full rounded object-contain"
					/>
				</div>

				<div className="flex flex-1 items-center justify-center">
					<h2 className={`font-bold leading-tight ${styles.text}`}>
						{partner.name}
					</h2>
				</div>
			</div>
		</Link>
	);
}

export default PartnerCard;
