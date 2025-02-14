'use client';

import { useEffect, useState } from "react";
import { client } from "@/app/client";
import Link from "next/link";
import { ConnectButton, darkTheme, lightTheme, useActiveAccount } from "thirdweb/react";
import Image from "next/image";
import logo from "@/app/constants/logo.png";

const Navbar = () => {
  const account = useActiveAccount();
  const [theme, setTheme] = useState<string>('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  // Toggle theme and update localStorage
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <nav className="bg-slate-100 dark:bg-slate-800 shadow-md border-b-2 border-slate-300 dark:border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Image 
              src={logo} 
              alt="logo" 
              width={40} 
              height={40} 
              className="rounded-full hover:animate-pulse"
              style={{
                filter: "drop-shadow(0px 0px 24px #a726a9a8)",
              }}
            />
            <Link href="/">
              <p className="ml-4 text-lg font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-transform transform hover:scale-105">
                BlockRaise
              </p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex space-x-6">
            <Link href="/">
              <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
                Campaigns
              </p>
            </Link>
            {account && (
              <Link href={`/dashboard/${account?.address}`}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
                  Dashboard
                </p>
              </Link>
            )}
          </div>

          {/* Connect Button & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ConnectButton 
              client={client}
              theme={theme === 'light' ? lightTheme() : darkTheme()}
              detailsButton={{
                style: {
                  maxHeight: "40px",
                  fontSize: "14px",
                },
              }}
            />
            <button
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-all"
              onClick={toggleTheme}
            >
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;