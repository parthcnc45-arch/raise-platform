"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { apiClient } from "@/utils/apiClient";
import { Plus } from "lucide-react";

export default function CreateGPApplicationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    event: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ firstName: "", lastName: "", email: "", company: "", event: "" });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchEvents = async () => {
        try {
          const res = await apiClient("/events?limit=100");
          const result = await res.json();
          if (result.success) {
            setEvents(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };
      fetchEvents();
    }
  }, [isOpen]);

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        else if (value.length < 2 || value.length > 50) error = "First name must be 2-50 characters";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required";
        else if (value.length < 2 || value.length > 50) error = "Last name must be 2-50 characters";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Invalid email address";
        break;
      case "company":
        if (!value.trim()) error = "Company is required";
        else if (value.length < 2 || value.length > 100) error = "Company must be 2-100 characters";
        break;
      case "event":
        if (!value) error = "Event is required";
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    setIsSubmitting(true);
    try {
      const res = await apiClient("/gp-applications", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setFormData({ firstName: "", lastName: "", email: "", company: "", event: "" });
        setToast({ id: Date.now(), message: "GP Application created successfully!", type: "success" });
        window.dispatchEvent(new Event("gp-application-created"));
      } else {
        setToast({ id: Date.now(), message: data.message || "Failed to create application", type: "error" });
      }
    } catch (error) {
      setToast({ id: Date.now(), message: "An error occurred while submitting", type: "error" });
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
        Create GP Application
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title="Create GP Application"
        description=""
        maxWidth="lg"
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john.doe@firm.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Company / Firm"
            name="company"
            placeholder="e.g. Horizon Ventures"
            value={formData.company}
            onChange={handleChange}
            error={errors.company}
            required
          />

          <Select
            label="Event"
            name="event"
            value={formData.event}
            onChange={handleChange}
            error={errors.event}
            required
          >
            <option value="">Select an Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Application
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
