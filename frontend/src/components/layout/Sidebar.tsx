"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Applications",
      href: "/applications",
      icon: FileText,
    },
    {
      name: "Events",
      href: "/events",
      icon: Calendar,
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
    },
  ];

  const sidebarContent = (
    <div className="relative flex h-full flex-col bg-white text-slate-700 border-r border-slate-200/90 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      {/* Edge Collapse/Expand Tab Button (Desktop Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 h-8 w-6 items-center justify-center rounded-r-md border border-l-0 border-slate-200/90 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer group"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            !isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Top Header / Logo */}
      <div>
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-100 transition-all",
            isOpen ? "justify-start px-5" : "justify-center px-2"
          )}
        >
          <Link href="/" className="flex items-center">
            {isOpen ? (
              <Image
                src="/images/logo/logo.png"
                alt="RAISE Platform"
                width={140}
                height={36}
                priority
                style={{ width: "auto", height: "34px" }}
              />
            ) : (
              <Image
                src="/images/favicon.ico"
                alt="RAISE Platform"
                width={32}
                height={32}
                priority
                style={{ width: "32px", height: "32px" }}
              />
            )}
          </Link>
        </div>

        {/* Navigation items */}
        <div className="px-3 py-4">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    !isOpen && "justify-center px-2"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    )}
                  />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-20",
          isOpen ? "w-64" : "w-20"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
