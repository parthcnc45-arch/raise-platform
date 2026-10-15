import React from "react";
import { cn } from "@/utils";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "required"> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, required, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={generatedId}
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-blue-100",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
