"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiClient } from "@/utils/apiClient";

interface GPApplicationLinkDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

type AccessLog = {
  ip_address?: string;
  browser?: string;
  os?: string;
  device?: string;
  accessed_at?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-1 break-words text-sm font-semibold text-slate-900">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function GPApplicationLinkDetailsModal({
  isOpen,
  onClose,
  application,
}: GPApplicationLinkDetailsModalProps) {
  const [details, setDetails] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applicationId = application?.id || application?._id;

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetails(null);

    (async () => {
      try {
        const res = await apiClient(`/gp-applications/${applicationId}/details`);
        const result = await res.json();
        if (cancelled) return;
        if (result?.success) {
          setDetails(result.data);
        } else {
          setError(result?.message || "Failed to load details");
        }
      } catch {
        if (!cancelled) setError("An error occurred while loading details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, applicationId]);

  if (!application) return null;

  const isLocked =
    !!details?.magic_link_locked_until && new Date(details.magic_link_locked_until) > new Date();

  // An expired lock is history: show no lock expiry and treat the failed-attempt counter as reset.
  const lockExpired =
    !!details?.magic_link_locked_until && new Date(details.magic_link_locked_until) <= new Date();
  const failedAttempts = lockExpired ? 0 : details?.magic_link_failed_attempts ?? 0;

  const accessLogs: AccessLog[] = Array.isArray(details?.access_logs)
    ? [...details!.access_logs].reverse()
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Details"
      description="Magic link activity, security status and access history for this application"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {loading && (
          <div className="flex min-h-[160px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">{error}</div>
        )}

        {details && !loading && (
          <>
            <Section title="Magic Link Activity">
              <Field label="Link Accessed">
                <Badge variant={details.magic_link_accessed ? "success" : "warning"} size="sm">
                  {details.magic_link_accessed ? "Accessed" : "Not Accessed"}
                </Badge>
              </Field>
              <Field label="Total Verifications">{details.magic_link_access_count ?? 0}</Field>
              <Field label="First Accessed">{formatDate(details.magic_link_first_accessed_at)}</Field>
              <Field label="Last Accessed">{formatDate(details.magic_link_last_accessed_at)}</Field>
            </Section>

            <Section title="Link Security">
              <Field label="Magic Token">
                <Badge variant={details.has_magic_token ? "success" : "danger"} size="sm">
                  {details.has_magic_token ? "Active (stored hashed)" : "No active token"}
                </Badge>
              </Field>
              <Field label="Lock Status">
                <Badge variant={isLocked ? "danger" : "success"} size="sm">
                  {isLocked ? "Temporarily Locked" : "Not Locked"}
                </Badge>
              </Field>
              <Field label="Failed Email Attempts">{failedAttempts}</Field>
              <Field label="Locked Until">{isLocked ? formatDate(details.magic_link_locked_until) : "-"}</Field>
            </Section>

            <div>
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                Access History ({accessLogs.length})
              </h4>
              {accessLogs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  No successful access recorded yet
                </div>
              ) : (
                <div className="max-h-56 overflow-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Date &amp; Time</th>
                        <th className="px-3 py-2 font-semibold">IP Address</th>
                        <th className="px-3 py-2 font-semibold">Browser</th>
                        <th className="px-3 py-2 font-semibold">OS</th>
                        <th className="px-3 py-2 font-semibold">Device</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {accessLogs.map((log, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-3 py-2">{formatDate(log.accessed_at)}</td>
                          <td className="px-3 py-2 font-mono">{log.ip_address || "-"}</td>
                          <td className="px-3 py-2">{log.browser || "-"}</td>
                          <td className="px-3 py-2">{log.os || "-"}</td>
                          <td className="px-3 py-2">{log.device || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
