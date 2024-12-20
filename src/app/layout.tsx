import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ROOT_URL } from "@/utils/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Groq Appgen",
	description: "Interactive HTML editor with AI generation",

	icons: {
		icon: "/icons/icon.png",
	},

	openGraph: {
		type: "website",
		url: ROOT_URL,
		title: "Groq Appgen",
		description: "Interactive HTML editor with AI generation",
		images: `${ROOT_URL}/og-labs.png`,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
					<ModeToggle />
					<Toaster position="bottom-right" />
				</ThemeProvider>
			</body>
		</html>
	);
}
