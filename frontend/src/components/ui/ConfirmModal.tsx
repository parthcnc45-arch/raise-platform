"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "danger" | "primary" | "warning";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = "danger",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            type === "danger"
              ? "bg-rose-100 text-rose-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {type === "danger" ? (
            <AlertTriangle className="h-6 w-6" />
          ) : (
            <Info className="h-6 w-6" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          {message}
        </p>

        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={type === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
