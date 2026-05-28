"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SquaresFourIcon, CalendarIcon, FilePlusIcon, SparkleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: SquaresFourIcon, href: "#" },
  { label: "Assignments", icon: CalendarIcon, href: "/assignments" },
  { label: "Library", icon: FilePlusIcon, href: "#" },
  { label: "AI Toolkit", icon: SparkleIcon, href: "#" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 print:hidden">
      <div className="bg-[#1C1C1E] text-gray-400 rounded-[2rem] flex items-center justify-between px-6 py-4 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-white" : "hover:text-white"
              )}
            >
              <Icon size={24} weight={isActive ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
