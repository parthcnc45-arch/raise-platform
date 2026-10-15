"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageBreadcrumbProps {
  pageTitle: string;
}

export default function PageBreadcrumb({ pageTitle }: PageBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-medium"
          >
            Home
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </li>
        <li className="font-semibold text-slate-800">
          {pageTitle}
        </li>
      </ol>
    </nav>
  );
}
