"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretRightIcon, EyeIcon, EyeSlashIcon, SpinnerIcon } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";
import axiosClient from "@/lib/api";
import { useDispatch } from "react-redux";
import { setAdmin } from "@/store/slices/admin.slice";

const MotionButton = motion(Button);

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill the required details.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: email,
        password: password,
      };
      const response = await axiosClient.post("/auth/login", payload);

      dispatch(setAdmin(response.data.user));
      toast.success("Welcome back to VedaAI!");
      router.push("/dashboard");
    } catch (e: unknown) {
      console.log(e);
      const errorMessage = "Invalid credentials. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="border p-4 bg-veda-back rounded-xl flex flex-col gap-4 max-w-md shadow-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-start gap-2">
            <Image src="/logo.svg" alt="VedaAI Logo" width={40} height={40} className="w-10 h-10" />
            <h1 className="font-bold text-2xl">VedaAI</h1>
          </div>
          <p className="text-muted-foreground">
            An AI academic system for assessment, teaching, <br /> and personalised learning.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold mb-1">Teacher Login</h1>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="admin@admin.com"
              value={email}
              className="bg-white min-w-2xs"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="admin123"
                value={password}
                className="bg-white min-w-2xs pr-10"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              >
                {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div className="w-full">
          <MotionButton
            disabled={!email || !password || isLoading}
            onClick={handleLogin}
            whileHover="hover"
            initial="initial"
            className="w-full rounded-full py-5 flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <SpinnerIcon className="animate-spin" size={18} />
            ) : (
              <>
                <p>Continue</p>
                <div className="relative overflow-hidden w-4 h-4 flex items-center justify-center">
                  <motion.div
                    className="absolute"
                    variants={{
                      initial: { x: 0 },
                      hover: { x: 20 },
                    }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  >
                    <CaretRightIcon weight="fill" />
                  </motion.div>
                  <motion.div
                    className="absolute"
                    variants={{
                      initial: { x: -20 },
                      hover: { x: 0 },
                    }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  >
                    <CaretRightIcon weight="fill" />
                  </motion.div>
                </div>
              </>
            )}
          </MotionButton>
        </div>
        <Separator />

        <div className="text-muted-foreground space-y-1 text-sm">
          <p>This is the demo version of VedaAI. Please use below given credentials to try.</p>
          <ul>
            <li>- Email: admin@admin.com</li>
            <li>- Password: admin123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;
