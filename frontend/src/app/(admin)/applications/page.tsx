import type { Metadata } from "next";
import React from "react";
import GPApplicationTable from "@/components/gp-applications/GPApplicationTable";
import CreateGPApplicationModal from "@/components/gp-applications/CreateGPApplicationModal";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const metadata: Metadata = {
  title: "GP Applications | RAISE Platform",
  description: "Manage General Partner grant applications",
};

export default function ApplicationsPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadcrumb pageTitle="Applications" />
        <CreateGPApplicationModal />
      </div>

      <GPApplicationTable />
    </div>
  );
}
