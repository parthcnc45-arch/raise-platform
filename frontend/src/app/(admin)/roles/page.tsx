import type { Metadata } from "next";
import React from "react";
import RoleTable from "@/components/roles/RoleTable";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const metadata: Metadata = {
  title: "Roles Management | RAISE Platform",
  description: "View system roles and permissions",
};

export default function RolesPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadcrumb pageTitle="Roles" />
      </div>
      <RoleTable />
    </div>
  );
}

