"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { apiClient } from "@/utils/apiClient";
import { Plus } from "lucide-react";

interface RoleOption {
  _id: string;
  name: string;
  code: string;
}

interface CreateUserModalProps {
  onSuccess?: () => void;
}

export default function CreateUserModal({ onSuccess }: CreateUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: "success" | "error" } | null>(null);

  // Fetch roles on modal open
  useEffect(() => {
    if (isOpen) {
      apiClient("/roles")
        .then((res) => res.json())
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setRoles(result.data);
            if (result.data.length > 0 && !formData.role) {
              // Default to 'user' role or first role
              const defaultRole = result.data.find((r: any) => r.code === "user") || result.data[0];
              setFormData((prev) => ({ ...prev, role: defaultRole._id }));
            }
          }
        })
        .catch((err) => console.error("Failed to fetch roles:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        status: "Active",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "Email is required";
        else if (!emailRegex.test(value.trim())) error = "Enter a valid email address";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length > 8) error = "Password cannot exceed 8 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        else if (value.length > 8) error = "Password cannot exceed 8 characters";
        break;
      case "role":
        if (!value) error = "Role is required";
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => {
      const updated = { ...prev, [name]: error };
      if (name === "password" && formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          updated.confirmPassword = "Passwords do not match";
        } else {
          updated.confirmPassword = "";
        }
      }
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    ["name", "email", "password", "confirmPassword", "role"].forEach((key) => {
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        status: formData.status,
      };

      const res = await apiClient("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        setToast({ id: Date.now(), message: data.message || "User created successfully!", type: "success" });
        window.dispatchEvent(new Event("user-created"));
        onSuccess?.();
      } else {
        setToast({ id: Date.now(), message: data.message || "Failed to create user", type: "error" });
      }
    } catch (error: any) {
      setToast({ id: Date.now(), message: error?.message || "An error occurred while creating user", type: "error" });
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
        Create User
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title="Create New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              error={errors.name}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              maxLength={8}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              maxLength={8}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              required
            >
              <option value="" disabled>Select a role</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </Select>

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
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
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
