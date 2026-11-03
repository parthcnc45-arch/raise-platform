"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { apiClient } from "@/utils/apiClient";
import { Plus } from "lucide-react";

interface CreateEventModalProps {
  onSuccess?: () => void;
}

export default function CreateEventModal({ onSuccess }: CreateEventModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_year: new Date().getFullYear().toString(),
    start_date: "",
    end_date: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        event_year: new Date().getFullYear().toString(),
        start_date: "",
        end_date: "",
        status: "Active",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Event name is required";
        else if (value.trim().length < 2) error = "Event name must be at least 2 characters";
        else if (value.trim().length > 25) error = "Event name cannot exceed 25 characters";
        break;
      case "description":
        if (value && value.length > 50) error = "Description cannot exceed 50 characters";
        break;
      case "start_date":
        if (!value) error = "Start date is required";
        break;
      case "end_date":
        if (!value) error = "End date is required";
        else if (formData.start_date && new Date(value) < new Date(formData.start_date)) {
          error = "End date cannot be earlier than start date";
        }
        break;
      case "event_year":
        if (value) {
          const year = Number(value);
          if (isNaN(year) || year < 1900 || year > 2100) {
            error = "Enter a valid 4-digit year";
          }
        }
        break;
      case "status":
        if (!["Active", "Inactive"].includes(value)) {
          error = "Status must be Active or Inactive";
        }
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "start_date" && value) {
        const year = new Date(value).getFullYear();
        if (!isNaN(year)) {
          updated.event_year = year.toString();
        }
      }
      return updated;
    });

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      };

      if (formData.event_year) {
        payload.event_year = Number(formData.event_year);
      }

      const res = await apiClient("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setToast({ id: Date.now(), message: data.message || "Event created successfully!", type: "success" });
        window.dispatchEvent(new Event("event-created"));
        onSuccess?.();
      } else {
        const errorMsg = data.message || "Failed to create event";
        setToast({ id: Date.now(), message: errorMsg, type: "error" });
        if (errorMsg.toLowerCase().includes("overlap")) {
          setErrors((prev) => ({ ...prev, start_date: errorMsg }));
        }
      }
    } catch (error: any) {
      setToast({ id: Date.now(), message: error?.message || "An error occurred while creating the event", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Event
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title="Create New Event"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Event Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.name.length}/25
              </span>
            </div>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. RAISE Summit 2027"
              error={errors.name}
              maxLength={25}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              error={errors.start_date}
              required
            />

            <Input
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              error={errors.end_date}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Event Year"
              name="event_year"
              type="number"
              value={formData.event_year}
              onChange={handleChange}
              placeholder="e.g. 2027"
              error={errors.event_year}
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Description (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.description.length}/50
              </span>
            </div>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              maxLength={50}
              placeholder="Enter details about this event..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
