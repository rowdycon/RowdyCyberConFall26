interface FormGroupWrapperProps {
	title: string;
	children: React.ReactNode;
}

export default function FormGroupWrapper({
	children,
	title,
}: FormGroupWrapperProps) {
	return (
		<div className="relative rounded-lg border border-border/70 p-5 pt-6">
			<p className="absolute top-0 z-10 -translate-y-1/2 rounded-full border border-border/50 bg-white px-3 py-0.5 text-sm font-medium text-foreground shadow-sm">
				{title}
			</p>
			<div className="relative top-0 space-y-6">{children}</div>
		</div>
	);
}
