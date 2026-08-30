import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import c from "config";

export const metadata: Metadata = {
	title: "Rowdy CyberCon",
	description: "San Antonio's student cybersecurity conference",
	icons: [{ rel: "icon", url: c.icon.sm }],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={"light"}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
