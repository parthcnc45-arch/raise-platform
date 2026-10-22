"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { apiClient } from "@/utils/apiClient";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess: () => void;
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EditEventModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_year: "",
    start_date: "",
    end_date: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      const eventId = event.id || event._id;
      // Fetch full latest event details to ensure all fields are fresh
      apiClient(`/events/${eventId}`)
        .then((res) => res.json())
        .then((result) => {
          const item = result.success && result.data ? result.data : event;
          setFormData({
            name: item.name || "",
            description: item.description || "",
            event_year: item.event_year?.toString() || "",
            start_date: formatDateForInput(item.start_date),
            end_date: formatDateForInput(item.end_date),
            status: item.status || (item.is_active ? "Active" : "Inactive"),
          });
        })
        .catch(() => {
          setFormData({
            name: event.name || "",
            description: event.description || "",
            event_year: event.event_year?.toString() || "",
            start_date: formatDateForInput(event.start_date),
            end_date: formatDateForInput(event.end_date),
            status: event.status || (event.is_active ? "Active" : "Inactive"),
          });
        });

      setErrors({});
    }
  }, [isOpen, event]);

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Event name cannot be empty";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const eventId = event?.id || event?._id;
    if (!eventId) return;

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

      const res = await apiClient(`/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setToast({ id: Date.now(), message: data.message || "Failed to update event", type: "error" });
      }
    } catch (error: any) {
      setToast({ id: Date.now(), message: error?.message || "An error occurred while updating the event", type: "error" });
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

      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && onClose()}
        title="Edit Event"
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
                Description
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
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
