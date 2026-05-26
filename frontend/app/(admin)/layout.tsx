"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { SpinnerIcon } from "@phosphor-icons/react";
import axiosClient from "@/lib/api";
import { RootState } from "@/store/store";
import { setAdmin, clearAdmin } from "@/store/slices/admin.slice";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector(
    (state: RootState) => state.admin,
  );

  useEffect(() => {
    const getAdmin = async () => {
      try {
        setTimeout(async () => {
          const response = await axiosClient.get("/admin");
          dispatch(setAdmin(response.data.user));
        }, 5000);
      } catch (e) {
        dispatch(clearAdmin());
        router.push("/");
      }
    };

    getAdmin();
  }, [dispatch, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center text-black gap-4">
        <motion.div>
          <img src="/logo.svg" alt="VedaAI Logo" className="w-16 h-16" />
        </motion.div>
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <SpinnerIcon className="animate-spin" size={20} />
          <p className="tracking-wide text-sm">Verifying session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar name={user?.name!} school={user?.school!} />
        <main className="bg-veda-back">{children}</main>
      </SidebarProvider>
    </>
  );
};

export default Layout;
