"use client";

import { Button } from "@/components/shadcn/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function RegistrationSettings() {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<main>
			<div className="rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_32px_rgba(2,84,145,0.15)] backdrop-blur-md">
				<div className={"mb-5"}>
					Registration data is only editable in the form.{" "}
				</div>
				<Button
					asChild
					disabled={isLoading}
					onClick={() => setIsLoading(true)}
				>
					{isLoading ? (
						<div className={"flex"}>
							<Loader2 className={"mr-2 h-4 w-4 animate-spin"} />
							<div>Please wait...</div>
						</div>
					) : (
						<Link href={"/settings/registration"}>
							Click here to go back to registration form
						</Link>
					)}
				</Button>
			</div>
		</main>
	);
}
