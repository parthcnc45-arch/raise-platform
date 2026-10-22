"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { apiClient } from "@/utils/apiClient";

interface RoleOption {
  _id: string;
  name: string;
  code: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
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

  // Fetch roles
  useEffect(() => {
    if (isOpen) {
      apiClient("/roles")
        .then((res) => res.json())
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setRoles(result.data);
          }
        })
        .catch((err) => console.error("Failed to fetch roles:", err));
    }
  }, [isOpen]);

  // Pre-populate user data
  useEffect(() => {
    if (isOpen && user) {
      const userId = user.id || user._id;

      apiClient(`/users/${userId}`)
        .then((res) => res.json())
        .then((result) => {
          const item = result.success && result.data ? result.data : user;
          setFormData({
            name: item.name || "",
            email: item.email || "",
            password: "",
            confirmPassword: "",
            role: item.roleId || (typeof item.role === "object" ? item.role?._id : "") || "",
            status: item.status || (item.isActive ? "Active" : "Inactive"),
          });
        })
        .catch(() => {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            confirmPassword: "",
            role: user.roleId || (typeof user.role === "object" ? user.role?._id : "") || "",
            status: user.status || (user.isActive ? "Active" : "Inactive"),
          });
        });

      setErrors({});
    }
  }, [isOpen, user]);

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Name cannot be empty";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "Email cannot be empty";
        else if (!emailRegex.test(value.trim())) error = "Enter a valid email address";
        break;
      case "password":
        if (value && value.length > 8) error = "Password cannot exceed 8 characters";
        break;
      case "confirmPassword":
        if (formData.password && !value) error = "Please confirm your new password";
        else if (formData.password && value !== formData.password) error = "Passwords do not match";
        else if (value && value.length > 8) error = "Password cannot exceed 8 characters";
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
    ["name", "email", "role"].forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    if (formData.password) {
      const pwdError = validateField("password", formData.password);
      if (pwdError) newErrors.password = pwdError;
      const confirmPwdError = validateField("confirmPassword", formData.confirmPassword);
      if (confirmPwdError) newErrors.confirmPassword = confirmPwdError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userId = user?.id || user?._id;
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        role: formData.role,
        status: formData.status,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const res = await apiClient(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setToast({ id: Date.now(), message: data.message || "Failed to update user", type: "error" });
      }
    } catch (error: any) {
      setToast({ id: Date.now(), message: error?.message || "An error occurred while updating user", type: "error" });
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
        title="Edit User"
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
              label="New Password (Optional)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current"
              error={errors.password}
              maxLength={8}
              hint="Leave empty to retain existing password"
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              error={errors.confirmPassword}
              maxLength={8}
              disabled={!formData.password}
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
