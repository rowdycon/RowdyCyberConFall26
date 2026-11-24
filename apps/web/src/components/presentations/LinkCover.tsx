import { cn } from "@/lib/utils/client/cn";

interface LinkCoverProps {
	title: string;
	caption: string;
	className?: string;
	large?: boolean;
	/** Interactive content (e.g. a call-to-action link) shown under the caption. */
	children?: React.ReactNode;
}

/** Terminal-style artwork for sessions whose material is a website, not slides. */
export default function LinkCover({
	title,
	caption,
	className,
	large = false,
	children,
}: LinkCoverProps) {
	return (
		<div
			className={cn(
				"relative flex h-full w-full flex-col overflow-hidden bg-[#06131c] font-mono text-emerald-300",
				className,
			)}
			style={{
				backgroundImage:
					"linear-gradient(rgba(52,211,153,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.07) 1px, transparent 1px)",
				backgroundSize: large ? "32px 32px" : "20px 20px",
			}}
		>
			<div
				className="flex items-center gap-1.5 border-b border-emerald-400/20 bg-white/5 px-3 py-2"
				aria-hidden="true"
			>
				<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
				<span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
				<span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
				<span className="ml-2 text-[10px] text-emerald-200/70">
					rowdy@cybercon: ~
				</span>
			</div>
			<div
				className={cn(
					"flex flex-1 flex-col justify-center",
					large ? "px-6 py-12 sm:px-14 sm:py-16" : "px-5",
				)}
			>
				<div className="flex flex-col gap-2" aria-hidden="true">
					<p
						className={cn(
							"text-emerald-200/70",
							large ? "text-sm" : "text-[11px]",
						)}
					>
						$ ./workshop --start
					</p>
					<p
						className={cn(
							"font-bold uppercase leading-tight text-white",
							large ? "text-3xl sm:text-5xl" : "text-lg",
						)}
					>
						{title}
					</p>
					<p
						className={cn(
							large ? "max-w-2xl text-base" : "text-xs",
						)}
					>
						{caption}
						<span className="ml-1 animate-pulse">▋</span>
					</p>
				</div>
				{children}
			</div>
		</div>
	);
}
