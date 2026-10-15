"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface ViewGPApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

export default function ViewGPApplicationModal({
  isOpen,
  onClose,
  application,
}: ViewGPApplicationModalProps) {
  if (!application) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Pending Review";
      case "successful":
        return "Successful";
      case "failed":
        return "Failed";
      case "resended":
        return "Resended";
      default:
        return status || "Pending";
    }
  };

  const getStatusVariant = (status: string): "warning" | "success" | "danger" | "primary" => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "successful":
        return "success";
      case "failed":
        return "danger";
      case "resended":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      description="View full information for this GP application"
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">Company</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {application.company || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">Event</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {typeof application.event === "object"
                ? application.event?.name
                : application.event || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">First Name</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {application.firstName || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">Last Name</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {application.lastName || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Email Address</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {application.email || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500 block mb-1.5">
              Status
            </span>
            <Badge variant={getStatusVariant(application.status)} size="sm">
              {formatStatus(application.status)}
            </Badge>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">Submitted Date</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(application.created_at || application.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
