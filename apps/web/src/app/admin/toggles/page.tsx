export default async function Page() {
	return (
		<div className="min-h-[250px] w-full space-y-3 rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_32px_rgba(2,84,145,0.15)] backdrop-blur-md">
			<h2 className="text-3xl font-semibold">Toggles</h2>
			<p className="text-sm">
				Toggles allow you to control various dynamic options on the
				website. If you don't see an option here, chances are it can be
				changed in the <code>hackkit.config.ts</code> file or via
				enviroment variables. Visit the HackKit docs to learn more!
			</p>
		</div>
	);
}
