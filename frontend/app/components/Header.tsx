"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
      <Image
        src="/temperature-logo.svg"
        alt="Temperature Check Logo"
        width={120}
        height={120}
      />
      <div className="flex items-center">
        <ConnectButton />
      </div>
    </nav>
  );
}

