import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  SparkleIcon,
  SquaresFourIcon,
  UsersIcon,
  FileTextIcon,
  BookOpenIcon,
  ChartPieSliceIcon,
  GearIcon,
} from "@phosphor-icons/react";

interface SidebarProps {
  name: string;
  school: string;
}

const menuItems = [
  { label: "Home", icon: SquaresFourIcon },
  { label: "My Groups", icon: UsersIcon },
  { label: "Assignments", icon: FileTextIcon, isActive: true },
  { label: "AI Teacher's Toolkit", icon: BookOpenIcon },
  { label: "My Library", icon: ChartPieSliceIcon },
];

export function AppSidebar(props: SidebarProps) {
  return (
    <Sidebar variant="floating" collapsible="icon" className="">
      <SidebarHeader>
        <SidebarMenu className="flex flex-col gap-8">
          <SidebarMenuItem>
            <div className="flex items-center justify-start gap-2 mt-4 ms-2">
              <Image
                src="/logo.svg"
                alt="VedaAI Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h1 className="font-bold text-2xl">VedaAI</h1>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button className="w-full rounded-full py-5 inset-shadow-sm inset-shadow-white shadow-sm shadow-veda">
              <SparkleIcon /> Create Assignment
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 mt-12">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={item.isActive}
                      className={cn(
                        "py-6 px-4 rounded-xl text-base text-muted-foreground transition-colors",
                        item.isActive
                          ? "font-semibold"
                          : "font-medium text-muted-foreground hover:text-slate-900"
                      )}
                    >
                      <Icon size={22} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                "py-6 px-4 rounded-xl text-base text-muted-foreground transition-colors mb-3",
                "font-medium text-muted-foreground hover:text-slate-900"
              )}
            >
              <GearIcon size={22} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center justify-center py-4 gap-3 px-2 bg-veda-back rounded-xl">
              <Image
                src="/avatar.png"
                alt="Avatar"
                width={60}
                height={60}
                className="w-15 shrink-0"
              />
              <div className="min-w-0">
                <h1 className="font-bold text-md truncate">{props.school}</h1>
                <p className="text-muted-foreground text-sm">{props.name}</p>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
