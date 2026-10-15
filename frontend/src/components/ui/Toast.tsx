"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/utils";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm font-semibold transition-all",
          type === "success" &&
            "bg-emerald-50 text-emerald-800 border-emerald-200",
          type === "error" &&
            "bg-rose-50 text-rose-800 border-rose-200",
          type === "info" &&
            "bg-blue-50 text-blue-800 border-blue-200"
        )}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
        )}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
