"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BellIcon, CaretDownIcon, SignOutIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { clearAdmin } from "@/store/slices/admin.slice";
import { clearAssignments } from "@/store/slices/assignment.slice";
import axiosClient from "@/lib/api";
import { toast } from "sonner";

interface HeaderProps {
  breadcrumb: React.ReactNode;
  className?: string;
}

export function Header({ breadcrumb, className }: HeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.admin);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
      dispatch(clearAdmin());
      dispatch(clearAssignments());
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

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

      <div className="hidden md:flex items-center gap-4">
        <button className="relative rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-veda-back">
          <BellIcon size={20} />
        </button>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:bg-veda-back p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Image
              src="/avatar.png"
              alt="Avatar"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-slate-800">{user?.name || "User"}</span>
            <CaretDownIcon
              size={14}
              className={cn(
                "text-foreground/50 transition-transform duration-200",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 origin-top-right"
                >
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <SignOutIcon size={16} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
