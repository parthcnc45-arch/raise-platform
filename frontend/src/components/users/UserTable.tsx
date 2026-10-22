"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "@/utils/apiClient";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";
import {
  Search,
  Users,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  roleCode?: string;
  roleId?: string;
  status: string;
  isActive?: boolean;
  phone?: string;
  createdAt?: string;
}

export default function UserTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [users, setUsers] = useState<UserData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Summary statistics
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
  });

  // Dropdown portal state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number; openUpward: boolean } | null>(null);
  const [activeDropdownUser, setActiveDropdownUser] = useState<UserData | null>(null);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ id: Date.now(), message, type });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient(
        `/users?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(debouncedSearchTerm)}`
      );
      const result = await res.json();

      if (result.success) {
        const list: UserData[] = result.data || [];
        setUsers(list);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalRecords(result.meta?.totalRecords || 0);

        setSummary({
          total: result.meta?.totalRecords || list.length,
          active: list.filter((u) => u.status?.toLowerCase() === "active" || u.isActive).length,
          inactive: list.filter((u) => u.status?.toLowerCase() === "inactive" || (!u.isActive && u.status?.toLowerCase() !== "active")).length,
          admins: list.filter((u) => {
            const roleName = (u.role || "").toLowerCase();
            return roleName.includes("admin");
          }).length,
        });
      } else {
        console.error("Failed to fetch users:", result.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".portal-action-menu") && !target.closest(".action-menu-button")) {
        setOpenDropdown(null);
        setDropdownCoords(null);
        setActiveDropdownUser(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Listen for user-created custom event
  useEffect(() => {
    const handleCreated = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener("user-created", handleCreated);
    return () => window.removeEventListener("user-created", handleCreated);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch when page, limit, search, or refreshKey changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, refreshKey]);

  const handleToggleDropdown = (userItem: UserData, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const userId = userItem.id;
    if (openDropdown === userId) {
      setOpenDropdown(null);
      setDropdownCoords(null);
      setActiveDropdownUser(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 180;

    setDropdownCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      right: window.innerWidth - rect.right,
      openUpward,
    });
    setActiveDropdownUser(userItem);
    setOpenDropdown(userId);
  };

  const triggerView = (userItem: UserData) => {
    setSelectedUser(userItem);
    setViewModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownUser(null);
  };

  const triggerEdit = (userItem: UserData) => {
    setSelectedUser(userItem);
    setEditModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownUser(null);
  };

  const triggerDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownUser(null);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      const res = await apiClient(`/users/${recordToDelete}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        showToast(result.message || "User deleted successfully", "success");
        setRefreshKey((prev) => prev + 1);
      } else {
        showToast(result.message || "Failed to delete user", "error");
      }
    } catch (error: any) {
      showToast(error?.message || "An error occurred while deleting the user", "error");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
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

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />

      {/* View & Edit Modals */}
      <ViewUserModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onSuccess={() => {
          showToast("User updated successfully!", "success");
          setRefreshKey((prev) => prev + 1);
        }}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Users</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.total}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Users</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.active}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Inactive Users</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.inactive}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Administrators</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.admins}</h4>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div>
          {/* Table Filters & Search Row */}
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
                  <option value={20}>20</option>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Table Content */}
          <div className={`relative ${loading && users.length === 0 ? "min-h-[240px]" : ""}`}>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No users found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const status = user.status || (user.isActive ? "Active" : "Inactive");
                    const isActive = status?.toLowerCase() === "active";

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.email}
                        </TableCell>
                        <TableCell className="capitalize text-slate-600">
                          {user.role}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isActive ? "success" : "danger"}
                            size="sm"
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={(e) => handleToggleDropdown(user, e)}
                            className="action-menu-button inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
      {openDropdown && dropdownCoords && activeDropdownUser && typeof document !== "undefined" && createPortal(
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
            onClick={() => triggerView(activeDropdownUser)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            View Details
          </button>
          <button
            onClick={() => triggerEdit(activeDropdownUser)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
            Edit User
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => triggerDelete(activeDropdownUser.id)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            Delete User
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
