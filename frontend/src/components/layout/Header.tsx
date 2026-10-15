"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ChevronDown } from "lucide-react";

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const pathname = usePathname();
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState("Admin User");
  const [userEmail, setUserEmail] = useState("admin@raise.org");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.email) setUserEmail(parsed.email);
        } catch (e) {
          console.error("Failed to parse user profile:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/applications")) return "GP Applications";
    if (pathname.startsWith("/events")) return "Events";
    if (pathname.startsWith("/users")) return "Users Management";
    return "Raise Platform";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Left side: Hamburger on mobile + Page title / breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side: User profile */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {userName}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                {userEmail}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {userDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-semibold text-slate-800">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {userEmail}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
