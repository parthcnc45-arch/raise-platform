"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import {
  Search,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface RoleData {
  id: string;
  name: string;
  code: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function RoleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch roles from backend
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient("/roles");
      const result = await res.json();

      if (result.success) {
        setRoles(result.data || []);
      } else {
        console.error("Failed to fetch roles:", result.message);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [refreshKey]);

  // Client-side search filtering by name or code
  const filteredRoles = roles.filter((role) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      role.name?.toLowerCase().includes(term) ||
      role.code?.toLowerCase().includes(term)
    );
  });

  // Pagination calculation
  const totalRecords = filteredRoles.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  // Summary statistics
  const summary = {
    total: roles.length,
    active: roles.filter((r) => r.is_active !== false).length,
    inactive: roles.filter((r) => r.is_active === false).length,
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Roles</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.total}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Roles</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.active}</h4>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Inactive Roles</p>
            <h4 className="text-xl font-bold text-slate-900">{summary.inactive}</h4>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div>
          {/* Table Filters & Search */}
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
                placeholder="Search roles..."
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
          <div className={`relative ${loading && roles.length === 0 ? "min-h-[240px]" : ""}`}>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && paginatedRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No roles found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRoles.map((role, index) => {
                    const isActive = role.is_active !== false;

                    return (
                      <TableRow key={role.id}>
                        <TableCell className="text-xs text-slate-400">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {role.name}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-700">
                            {role.code}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={isActive ? "success" : "danger"} size="sm">
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
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
    </div>
  );
}
