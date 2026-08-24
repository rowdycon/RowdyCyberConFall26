import AccountSettings from "@/components/settings/AccountSettings";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RegistrationSettings from "@/components/settings/RegistrationSettings";
import { getUserCommonData } from "db/functions";

export default async function Page() {
	const { userId } = await auth();
	if (!userId) return redirect("/sign-in");
	const user = await getUserCommonData(userId);
	if (!user) return redirect("/sign-in");
	const { email, ...userData } = user;

	return (
		<main>
			<Header tag="Account" />
			<AccountSettings user={userData} email={email} />
			{/* <Header tag="Profile" /> */}
			<Header tag={"Registration"} />
			<RegistrationSettings />
		</main>
	);
}

function Header({ tag }: { tag: string }) {
	return (
		<h1 id={tag.toLowerCase()} className="mt-10 pb-5 text-4xl font-bold">
			{tag}
		</h1>
	);
}
