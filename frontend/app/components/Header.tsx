"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <nav className="flex w-full px-4 sm:px-6 lg:px-8 h-fit py-6 justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src="/temperature-logo.svg"
            alt="Temperature Check Logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Encrypted Temperature Check
          </h1>
          <p className="text-xs text-gray-500 font-mono">FHEVM Powered</p>
        </div>
      </div>
      <div className="flex items-center">
        <ConnectButton />
      </div>
    </nav>
  );
}

