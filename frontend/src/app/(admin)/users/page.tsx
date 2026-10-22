import type { Metadata } from "next";
import React from "react";
import UserTable from "@/components/users/UserTable";
import CreateUserModal from "@/components/users/CreateUserModal";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const metadata: Metadata = {
  title: "Users Management | RAISE Platform",
  description: "View and manage system users",
};

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadcrumb pageTitle="Users" />
        <CreateUserModal />
      </div>
      <UserTable />
    </div>
  );
}
