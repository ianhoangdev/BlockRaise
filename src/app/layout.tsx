import type { Metadata } from "next";
import { Space_Grotesk, Inter } from 'next/font/google';
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import NavBar from "./components/NavBar";

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "BlockFund",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
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