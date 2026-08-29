import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils/client/cn";

interface AeroWindowProps {
	title: string;
	icon?: ElementType;
	live?: boolean;
	className?: string;
	contentClassName?: string;
	children: ReactNode;
}

/**
 * Shared glass-window shell every desktop widget is built on: a glossy
 * title bar plus a padded, independently-scrollable content region. Giving
 * every widget the same min-height/overflow rules is what keeps window
 * content from spilling into its neighbors.
 */
export default function AeroWindow({
	title,
	icon: Icon,
	live,
	className,
	contentClassName,
	children,
}: AeroWindowProps) {
	return (
		<div
			className={cn(
				"aero-glass flex min-h-[9rem] flex-col transition-transform duration-300 hover:-translate-y-0.5",
				className,
			)}
		>
			<div className="aero-titlebar">
				<div className="flex min-w-0 items-center gap-2">
					{Icon && (
						<Icon
							className="h-4 w-4 shrink-0 text-white drop-shadow"
							aria-hidden="true"
						/>
					)}
					<span className="truncate text-xs font-semibold tracking-wide text-white drop-shadow">
						{title}
					</span>
				</div>
				{live && (
					<span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
						LIVE
					</span>
				)}
			</div>
			<div
				className={cn(
					"win98-scrollbar relative z-[var(--z-controls)] flex-1 overflow-y-auto p-3 sm:p-4",
					contentClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}
