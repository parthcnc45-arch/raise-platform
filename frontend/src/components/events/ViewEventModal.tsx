"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiClient } from "@/utils/apiClient";
import { Calendar, Hash, FileText, Clock, Tag } from "lucide-react";

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export default function ViewEventModal({
  isOpen,
  onClose,
  event: initialEvent,
}: ViewEventModalProps) {
  const [eventData, setEventData] = useState<any>(initialEvent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialEvent) {
      setEventData(initialEvent);
      const eventId = initialEvent.id || initialEvent._id;
      if (eventId) {
        setLoading(true);
        apiClient(`/events/${eventId}`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success && result.data) {
              setEventData(result.data);
            }
          })
          .catch((err) => console.error("Failed to fetch event details:", err))
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, initialEvent]);

  if (!isOpen && !eventData) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
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

  const status = eventData?.status || (eventData?.is_active ? "Active" : "Inactive");
  const isActive = status?.toLowerCase() === "active";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Details"
      maxWidth="xl"
    >
      {loading && !eventData ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : eventData ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex items-start justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {eventData.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-700 font-mono text-[11px]">
                  {eventData.slug || "-"}
                </code>
              </div>
            </div>
            <Badge variant={isActive ? "success" : "neutral"} size="sm">
              {status}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                Event Year
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {eventData.event_year || "-"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Start Date
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(eventData.start_date)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                End Date
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(eventData.end_date)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Created At
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formatDateTime(eventData.created_at || eventData.createdAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Description
            </span>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {eventData.description || "No description provided."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
