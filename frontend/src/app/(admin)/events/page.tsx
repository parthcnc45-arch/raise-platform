import type { Metadata } from "next";
import React from "react";
import EventTable from "@/components/events/EventTable";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

export const metadata: Metadata = {
  title: "Events Management | RAISE Platform",
  description: "View and manage RAISE events",
};

export default function EventsPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageBreadcrumb pageTitle="Events" />
      <EventTable />
    </div>
  );
}
