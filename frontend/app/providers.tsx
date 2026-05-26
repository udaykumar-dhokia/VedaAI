"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      document.body.classList.remove("bg-veda-back");
    } else {
      document.body.classList.add("bg-veda-back");
    }
  }, [pathname]);

  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
