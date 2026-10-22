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
import ViewEventModal from "./ViewEventModal";
import EditEventModal from "./EditEventModal";
import {
  Search,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  event_year: number;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
}

export default function EventTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [events, setEvents] = useState<EventData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Summary statistics
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    thisYear: 0,
  });

  // Dropdown portal state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number; openUpward: boolean } | null>(null);
  const [activeDropdownEvent, setActiveDropdownEvent] = useState<EventData | null>(null);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ id: Date.now(), message, type });
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient(
        `/events?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(debouncedSearchTerm)}`
      );
      const result = await res.json();

      if (result.success) {
        const list: EventData[] = result.data || [];
        setEvents(list);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalRecords(result.meta?.totalRecords || 0);

        const currentYear = new Date().getFullYear();
        setSummary({
          total: result.meta?.totalRecords || list.length,
          active: list.filter((e) => e.status?.toLowerCase() === "active" || e.is_active).length,
          inactive: list.filter((e) => e.status?.toLowerCase() === "inactive" || (!e.is_active && e.status?.toLowerCase() !== "active")).length,
          thisYear: list.filter((e) => Number(e.event_year) === currentYear).length,
        });
      } else {
        console.error("Failed to fetch events:", result.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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
        setActiveDropdownEvent(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Listen for event-created globally
  useEffect(() => {
    const handleCreated = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener("event-created", handleCreated);
    return () => window.removeEventListener("event-created", handleCreated);
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
    fetchEvents();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, refreshKey]);

  const handleToggleDropdown = (eventItem: EventData, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const eventId = eventItem.id;
    if (openDropdown === eventId) {
      setOpenDropdown(null);
      setDropdownCoords(null);
      setActiveDropdownEvent(null);
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
    setActiveDropdownEvent(eventItem);
    setOpenDropdown(eventId);
  };

  const triggerView = (eventItem: EventData) => {
    setSelectedEvent(eventItem);
    setViewModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownEvent(null);
  };

  const triggerEdit = (eventItem: EventData) => {
    setSelectedEvent(eventItem);
    setEditModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownEvent(null);
  };

  const triggerDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteModalOpen(true);
    setOpenDropdown(null);
    setDropdownCoords(null);
    setActiveDropdownEvent(null);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      const res = await apiClient(`/events/${recordToDelete}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        showToast(result.message || "Event deleted successfully", "success");
        setRefreshKey((prev) => prev + 1);
      } else {
        showToast(result.message || "Failed to delete event", "error");
      }
    } catch (error: any) {
      showToast(error?.message || "An error occurred while deleting the event", "error");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
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
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete Event"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />

      {/* View & Edit Modals */}
      <ViewEventModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        event={selectedEvent}
      />

      <EditEventModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        event={selectedEvent}
        onSuccess={() => {
          showToast("Event updated successfully!", "success");
          setRefreshKey((prev) => prev + 1);
        }}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Events</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.total}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Events</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.active}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Inactive Events</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.inactive}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Events This Year</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.thisYear}</h4>
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
                placeholder="Search events..."
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
          <div className={`relative ${loading && events.length === 0 ? "min-h-[240px]" : ""}`}>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Calendar className="h-8 w-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No events found</p>
                        <p className="text-xs text-slate-400">There are no events registered yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const status = event.status || (event.is_active ? "Active" : "Inactive");
                    const isActive = status?.toLowerCase() === "active";

                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-semibold text-slate-900">
                          {event.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {event.event_year}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatDate(event.start_date)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatDate(event.end_date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "success" : "neutral"} size="sm">
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={(e) => handleToggleDropdown(event, e)}
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
      {openDropdown && dropdownCoords && activeDropdownEvent && typeof document !== "undefined" && createPortal(
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
            onClick={() => triggerView(activeDropdownEvent)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            View Details
          </button>
          <button
            onClick={() => triggerEdit(activeDropdownEvent)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
            Edit Event
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => triggerDelete(activeDropdownEvent.id)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            Delete Event
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
