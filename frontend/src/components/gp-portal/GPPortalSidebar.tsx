"use client";

import Image from "next/image";
import Link from "next/link";
import { FileCheck2, LayoutDashboard, LogOut, UserRound } from "lucide-react";

type GPPortalSidebarProps = {
  fullName: string;
  company?: string;
  token: string;
  activePage: "overview" | "application";
  onSignOut: () => void;
};

export default function GPPortalSidebar({ fullName, company, token, activePage, onSignOut }: GPPortalSidebarProps) {
  return (
    <aside className="flex w-full flex-col bg-[#183656] text-white lg:min-h-screen lg:w-[260px] lg:shrink-0">
      <div className="flex items-center border-b border-white/10 px-6 py-5 lg:px-7">
        <Link href="/" aria-label="RAISE home" className="inline-flex items-center">
          <Image src="/images/logo/logo-dark.png" alt="RAISE" width={132} height={32} priority className="h-8 w-auto" />
        </Link>
      </div>
      <div className="flex items-center gap-3 px-6 py-6 lg:px-7">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100"><UserRound className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{fullName}</p>
          <p className="truncate text-xs text-blue-100/70">{company || "General Partner"}</p>
        </div>
      </div>
      <nav className="flex gap-2 px-4 pb-4 lg:flex-col lg:px-3">
        <Link href={`/gp-application/details/${token}`} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${activePage === "overview" ? "bg-white/10 font-semibold text-white" : "text-blue-100/80 hover:bg-white/5"}`}><LayoutDashboard className="h-4 w-4" /><span>Overview</span></Link>
        <Link href={`/gp-application/form/${token}`} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${activePage === "application" ? "bg-white/10 font-semibold text-white" : "text-blue-100/80 hover:bg-white/5"}`}><FileCheck2 className="h-4 w-4" /><span>My Application</span></Link>
      </nav>
      <div className="mt-auto hidden p-4 lg:block">
        <button onClick={onSignOut} className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-blue-100/75 transition hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </aside>
  );
}
