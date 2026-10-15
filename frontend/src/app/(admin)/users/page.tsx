import type { Metadata } from "next";
import React from "react";
import UserTable from "@/components/users/UserTable";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const metadata: Metadata = {
  title: "Users Management | RAISE Platform",
  description: "View and manage system users",
};

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageBreadcrumb pageTitle="Users" />
      <UserTable />
    </div>
  );
}
