import Image from "next/image";
import c from "config";

const GlassHeader = ({
	title,
	imagePath,
}: {
	title: string;
	imagePath?: string;
}) => {
	return (
		<div
			className="flex w-full items-center gap-2 rounded-t-2xl border-b border-white/50 px-4 py-2.5"
			style={{
				background:
					"linear-gradient(180deg, rgba(140, 220, 255, 0.75) 0%, rgba(41, 160, 230, 0.65) 100%)",
				backdropFilter: "blur(10px)",
				WebkitBackdropFilter: "blur(10px)",
				boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
			}}
		>
			{imagePath && (
				<Image
					src={imagePath || "/placeholder.svg"}
					alt={c.hackathonName + " Logo"}
					width={20}
					height={20}
				/>
			)}
			<span
				className="text-sm font-semibold text-white"
				style={{ textShadow: "0 1px 2px rgba(0,60,110,0.45)" }}
			>
				{title}
			</span>
		</div>
	);
};

export default GlassHeader;
