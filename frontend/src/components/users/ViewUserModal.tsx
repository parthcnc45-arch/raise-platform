"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { apiClient } from "@/utils/apiClient";
import { Mail, CheckCircle2, Shield, Clock, User as UserIcon } from "lucide-react";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  user: initialUser,
}: ViewUserModalProps) {
  const [userData, setUserData] = useState<any>(initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialUser) {
      setUserData(initialUser);
      const userId = initialUser.id || initialUser._id;
      if (userId) {
        setLoading(true);
        apiClient(`/users/${userId}`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success && result.data) {
              setUserData(result.data);
            }
          })
          .catch((err) => console.error("Failed to fetch user details:", err))
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, initialUser]);

  if (!isOpen && !userData) return null;

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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const status = userData?.status || (userData?.isActive ? "Active" : "Inactive");
  const isActive = status?.toLowerCase() === "active";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      maxWidth="lg"
    >
      {loading && !userData ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : userData ? (
        <div className="space-y-6">
          {/* Header Profile Banner */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-sm text-lg">
              {getInitials(userData.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {userData.name}
                </h3>
                <Badge variant={isActive ? "success" : "danger"} size="sm">
                  {status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {userData.email}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                Assigned Role
              </span>
              <p className="text-sm font-semibold text-slate-800 capitalize">
                {userData.role || "User"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                Account Status
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {status}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Registered On
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formatDateTime(userData.createdAt || userData.created_at)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Last Updated
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formatDateTime(userData.updatedAt || userData.updated_at)}
              </p>
            </div>
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
