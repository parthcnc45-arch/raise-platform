"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ViewGPApplicationModal from "./ViewGPApplicationModal";
import EditGPApplicationModal from "./EditGPApplicationModal";
import { apiClient } from "@/utils/apiClient";
import {
  MoreHorizontal,
  Search,
  Eye,
  Edit2,
  Send,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function GPApplicationTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number; openUpward: boolean } | null>(null);
  const [activeDropdownApp, setActiveDropdownApp] = useState<any>(null);

  const [applications, setApplications] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    successful: 0,
    failed: 0,
  });

  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [recordToResend, setRecordToResend] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ id: Date.now(), message, type });
  };

  const handleToggleDropdown = (app: any, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const appId = app.id || app._id;
    if (openDropdown === appId) {
      setOpenDropdown(null);
      setDropdownCoords(null);
      setActiveDropdownApp(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 200;

    setDropdownCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      right: window.innerWidth - rect.right,
      openUpward,
    });
    setActiveDropdownApp(app);
    setOpenDropdown(appId);
  };

  const triggerView = (app: any) => {
    setSelectedApplication(app);
    setViewModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownApp(null);
  };

  const triggerEdit = (app: any) => {
    setSelectedApplication(app);
    setEditModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownApp(null);
  };

  const triggerDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownApp(null);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      const res = await apiClient(`/gp-applications/${recordToDelete}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        showToast(result.message || "Application deleted successfully", "success");
        setRefreshKey((prev) => prev + 1);
      } else {
        showToast(result.message || "Failed to delete application", "error");
      }
    } catch (error) {
      showToast("An error occurred while deleting", "error");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const triggerResendMagicLink = (appId: string) => {
    setRecordToResend(appId);
    setResendModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownApp(null);
  };

  const confirmResendMagicLink = async () => {
    if (!recordToResend) return;

    setIsResending(true);
    try {
      const res = await apiClient(`/gp-applications/${recordToResend}/resend-magic-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (data?.success) {
        showToast("Magic link resent successfully!", "success");
        setRefreshKey((prev) => prev + 1);
      } else {
        showToast(data?.message || "Failed to send magic link", "error");
      }
    } catch (error) {
      showToast("Error sending magic link", "error");
    } finally {
      setIsResending(false);
      setResendModalOpen(false);
      setRecordToResend(null);
    }
  };

  useEffect(() => {
    const handleCreated = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener("gp-application-created", handleCreated);
    return () => window.removeEventListener("gp-application-created", handleCreated);
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        let url = `/gp-applications?page=${currentPage}&limit=${itemsPerPage}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await apiClient(url);
        const result = await res.json();

        if (result.success) {
          setApplications(result.data || []);
          setTotalRecords(result.meta?.totalRecords || 0);
          setTotalPages(result.meta?.totalPages || 1);

          const list = result.data || [];
          setSummary({
            total: result.meta?.totalRecords || list.length,
            pending: list.filter((a: any) => a.status === "pending").length,
            successful: list.filter((a: any) => a.status === "successful").length,
            failed: list.filter((a: any) => a.status === "failed" || a.status === "resended").length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchApplications();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, itemsPerPage, searchTerm, refreshKey]);

  // Close actions dropdown on click outside
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".portal-action-menu") && !target.closest(".action-menu-button")) {
        setOpenDropdown(null);
        setDropdownCoords(null);
        setActiveDropdownApp(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

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
    <div className="flex flex-1 flex-col space-y-6">
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Application"
        message="Are you sure you want to delete this GP Application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />

      <ConfirmModal
        isOpen={resendModalOpen}
        onClose={() => !isResending && setResendModalOpen(false)}
        onConfirm={confirmResendMagicLink}
        title="Resend Magic Link"
        message="Are you sure you want to resend the magic verification link to this applicant?"
        confirmText="Resend Link"
        cancelText="Cancel"
        isLoading={isResending}
        type="primary"
      />

      {/* View & Edit Modals */}
      <ViewGPApplicationModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        application={selectedApplication}
      />

      <EditGPApplicationModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        application={selectedApplication}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Applications</p>
            <h4 className="text-xl font-bold text-slate-900">
              {summary.total}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Review</p>
            <h4 className="text-xl font-bold text-slate-900">
              {summary.pending}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Qualified / Successful</p>
            <h4 className="text-xl font-bold text-slate-900">
              {summary.successful}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Failed / Unqualified</p>
            <h4 className="text-xl font-bold text-slate-900">
              {summary.failed}
            </h4>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div>
          {/* Table Top Controls */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              title="Refresh"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Table Data */}
        <div className={`relative ${loading && applications.length === 0 ? "min-h-[240px]" : ""}`}>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No applications found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app, index) => (
                  <TableRow key={app.id || app._id}>
                    <TableCell className="text-xs text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {app.company}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {app.firstName} {app.lastName}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {app.email}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {typeof app.event === "object" ? app.event?.name : app.event || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)} size="sm">
                        {app.status || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => handleToggleDropdown(app, e)}
                        className="action-menu-button inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Portal Dropdown Menu */}
      {openDropdown && dropdownCoords && activeDropdownApp && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            top: dropdownCoords.openUpward ? undefined : dropdownCoords.top,
            bottom: dropdownCoords.openUpward ? window.innerHeight - dropdownCoords.top : undefined,
            right: dropdownCoords.right,
          }}
          className="portal-action-menu z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={() => triggerView(activeDropdownApp)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            View
          </button>
          <button
            onClick={() => triggerEdit(activeDropdownApp)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
            Edit
          </button>
          <button
            onClick={() => triggerResendMagicLink(activeDropdownApp.id || activeDropdownApp._id)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Resend Link
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => triggerDelete(activeDropdownApp.id || activeDropdownApp._id)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
