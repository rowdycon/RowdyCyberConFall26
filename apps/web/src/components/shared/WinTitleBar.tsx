import Image from "next/image";
import c from "config";

const controlButtonClass =
	"flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-white/40 bg-white/20 text-xs leading-none text-white transition-colors hover:bg-white/35";

const WindowsControlButtons = () => {
	return (
		<div className="flex gap-0.5">
			<button className={`${controlButtonClass} font-bold`}>_</button>
			<button className={controlButtonClass}>□</button>
			<button className={`${controlButtonClass} font-bold`}>x</button>
		</div>
	);
};

const WinTitleBar = ({
	title,
	imagePath,
}: {
	title: string;
	imagePath?: string;
}) => {
	return (
		<div
			className="flex h-7 w-full items-center justify-between px-2"
			style={{
				background:
					"linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%), linear-gradient(180deg, #4fa8e0 0%, #1c6fb8 55%, #0b4a86 100%)",
			}}
		>
			<div className="flex items-center gap-2">
				{imagePath && (
					<Image
						src={imagePath || "/placeholder.svg"}
						alt={c.hackathonName + " Logo"}
						width={16}
						height={16}
						className="pixelated"
					/>
				)}
				<span className="text-xs font-bold text-white">{title}</span>
			</div>
			<WindowsControlButtons />
		</div>
	);
};

export default WinTitleBar;
