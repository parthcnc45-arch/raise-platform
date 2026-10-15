"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { Search, Calendar, RefreshCw } from "lucide-react";

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

  const [events, setEvents] = useState<EventData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient(
        `/events?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      const result = await res.json();

      if (result.success) {
        setEvents(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalRecords(result.meta?.totalRecords || 0);
      } else {
        console.error("Failed to fetch events:", result.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm]);

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
            onClick={fetchEvents}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No events found</p>
                    <p className="text-xs text-slate-400">There are no events registered yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
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
                    <Badge
                      variant={
                        event.status?.toLowerCase() === "active" || event.is_active
                          ? "success"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {event.status || (event.is_active ? "Active" : "Inactive")}
                    </Badge>
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
  );
}
