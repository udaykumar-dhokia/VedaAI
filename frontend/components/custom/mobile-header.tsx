"use client";

import Image from "next/image";
import { BellIcon, ListIcon } from "@phosphor-icons/react";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden sticky top-4 flex items-center justify-between bg-white px-5 py-3 rounded-[2rem] mx-4 shadow-sm z-50 mb-4 print:hidden">
      <div className="flex items-center gap-2">
        <Image src="/logo.svg" alt="VedaAI Logo" width={28} height={28} className="w-7 h-7" />
        <span className="font-bold text-xl">VedaAI</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-1">
          <BellIcon size={24} weight="regular" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
        </button>
        <Image
          src="/avatar.png"
          alt="Avatar"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <button className="p-1" onClick={toggleSidebar}>
          <ListIcon size={24} weight="regular" />
        </button>
      </div>
    </div>
  );
}
