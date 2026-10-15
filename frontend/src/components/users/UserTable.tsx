"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { Search, Users, RefreshCw } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UserTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient(
        `/users?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );
      const result = await res.json();

      if (result.success) {
        setUsers(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalRecords(result.meta?.totalRecords || 0);
      } else {
        console.error("Failed to fetch users:", result.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm]);

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
            onClick={fetchUsers}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                      variant={
                        user.status?.toLowerCase() === "active"
                          ? "success"
                          : user.status?.toLowerCase() === "pending"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {user.status || "Unknown"}
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
