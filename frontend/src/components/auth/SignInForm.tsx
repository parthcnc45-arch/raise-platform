"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiClient } from "@/utils/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = { message: `Server error (${response.status})` };
      }

      if (response.ok && (data.token || data.data?.token)) {
        const token = data.token || data.data?.token;
        localStorage.setItem("token", token);
        if (data.data?.user || data.user) {
          localStorage.setItem("user", JSON.stringify(data.data?.user || data.user));
        }
        router.push("/");
      } else {
        setApiError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setApiError("Network error or server unreachable. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Mobile-only logo */}
      <div className="lg:hidden mb-8 text-center">
        <Image
          src="/images/logo/logo.png"
          alt="RAISE"
          width={150}
          height={36}
          priority
          className="h-8 w-auto mx-auto"
        />
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Log In
        </h1>
      </div>

      {/* Alert Error Box */}
      {apiError && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
          {apiError}
        </div>
      )}

      {/* Sign-in Form */}
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@raise.org"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />
        </div>

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-md shadow-blue-600/20"
            isLoading={loading}
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
}
