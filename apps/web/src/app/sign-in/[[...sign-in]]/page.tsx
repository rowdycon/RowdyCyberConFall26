import { SignIn } from "@clerk/nextjs";

export default function Page() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="aero-page-bg fixed inset-0 -z-10" />
			<SignIn fallbackRedirectUrl={"/dash/"} />
		</div>
	);
}
