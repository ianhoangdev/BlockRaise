import type { Metadata } from "next";
import { Space_Grotesk, Inter } from 'next/font/google';
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import NavBar from "./components/NavBar";
import logo from "@/app/constants/logo.png";

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "BlockRaise",
  description:
    "Decentralized crowdfunding platform for beginners and experts",
  icons: {
    icon: "@/app/constants/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-slate-100 text-slate-700 dark:bg-gray-900 dark:text-gray-100 ${inter.className}`}>
        <ThirdwebProvider>
          <NavBar />
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}