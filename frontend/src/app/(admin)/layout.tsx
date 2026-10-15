import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";

export const dynamic = "force-dynamic";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
