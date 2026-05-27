"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BellIcon, CaretDownIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { cn } from "@/lib/utils";

interface HeaderProps {
  breadcrumb: React.ReactNode;
  className?: string;
}

export function Header({ breadcrumb, className }: HeaderProps) {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.admin);

  return (
    <header
      className={cn(
        "sticky top-2 z-50 flex items-center justify-between border-b border-border/40 bg-white/80 backdrop-blur-md px-6 py-3 rounded-xl mx-2 mt-2 shadow-sm print:hidden",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-veda-back"
        >
          <ArrowLeftIcon size={20} weight="bold" />
        </button>
        <div className="h-5 w-px bg-border" />
        {breadcrumb}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-veda-back">
          <BellIcon size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Image
            src="/avatar.png"
            alt="Avatar"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{user?.name || "User"}</span>
          <CaretDownIcon size={14} className="text-foreground/50" />
        </div>
      </div>
    </header>
  );
}
