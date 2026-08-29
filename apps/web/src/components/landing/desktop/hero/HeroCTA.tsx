import Link from "next/link";

export default function HeroCTA() {
	return (
		<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
			<Link href="/register" className="aero-btn">
				Register Now
			</Link>
			<Link
				href="https://docs.google.com/spreadsheets/d/19yuormuJRxJL-zdw5Uc7rLdvCFTpus9dUlTM72Xiorg/edit?gid=0#gid=0"
				target="_blank"
				className="aero-btn-secondary"
			>
				Schedule
			</Link>
		</div>
	);
}
