"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  FileText,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    applications: 0,
    events: 0,
    users: 0,
    pendingApps: 0,
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [appsRes, eventsRes, usersRes] = await Promise.allSettled([
          apiClient("/gp-applications?limit=5"),
          apiClient("/events?limit=5"),
          apiClient("/users?limit=5"),
        ]);

        let appCount = 0;
        let pendingCount = 0;
        let recent: any[] = [];

        if (appsRes.status === "fulfilled") {
          const appsData = await appsRes.value.json();
          if (appsData.success) {
            appCount = appsData.meta?.totalRecords || (appsData.data || []).length;
            recent = appsData.data || [];
            pendingCount = recent.filter((a) => a.status === "pending").length;
          }
        }

        let eventCount = 0;
        if (eventsRes.status === "fulfilled") {
          const eventsData = await eventsRes.value.json();
          if (eventsData.success) {
            eventCount = eventsData.meta?.totalRecords || (eventsData.data || []).length;
          }
        }

        let userCount = 0;
        if (usersRes.status === "fulfilled") {
          const usersData = await usersRes.value.json();
          if (usersData.success) {
            userCount = usersData.meta?.totalRecords || (usersData.data || []).length;
          }
        }

        setStats({
          applications: appCount,
          events: eventCount,
          users: userCount,
          pendingApps: pendingCount,
        });
        setRecentApps(recent);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-md shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            <span>Welcome to RAISE Admin</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-blue-100">
            Real-time insights across your summits, partner applications, and system participants.
          </p>
        </div>

        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <Link
          href="/applications"
          className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Applications</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.applications}
            </span>
          </div>
        </Link>

        {/* Active Events */}
        <Link
          href="/events"
          className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Events</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.events}
            </span>
          </div>
        </Link>

        {/* Registered Users */}
        <Link
          href="/users"
          className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registered Users</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.users}
            </span>
          </div>
        </Link>

        {/* Pending Review */}
        <Link
          href="/applications"
          className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Actions</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.pendingApps}
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Applications Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Recent GP Applications
            </h3>
            <p className="text-xs text-slate-500">
              Latest partner submissions awaiting evaluation
            </p>
          </div>
          <Link href="/applications">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-blue-600 hover:text-blue-700">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Applicant</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    No recent applications recorded.
                  </td>
                </tr>
              ) : (
                recentApps.map((app) => (
                  <tr key={app.id || app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {app.company}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {app.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          app.status === "successful"
                            ? "success"
                            : app.status === "failed"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {app.status || "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
