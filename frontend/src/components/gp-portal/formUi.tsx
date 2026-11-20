import type { ReactNode } from "react";

// Shared building blocks that mirror the official RAISE GP portal form style.

export const inputCls =
  "h-9 text-[13px] border border-slate-300 rounded-md px-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20";

export const textareaCls =
  "w-full text-[13px] border border-slate-300 rounded-md p-3 bg-white text-slate-800 shadow-sm transition focus:outline-none focus:border-[#2d9ab7] focus:ring-2 focus:ring-[#2d9ab7]/20";

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-[#1B365D] font-bold text-[15px] tracking-wide uppercase mb-2 pb-1.5 border-b-2 border-[#2d9ab7]/40">{children}</h1>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-[#1B365D] font-bold text-[13px] tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-200">{children}</h2>;
}

export function BodyText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[#333333] text-xs leading-relaxed ${className}`}>{children}</p>;
}

// Blue "(help text)" link. Pass onClick to make it open a popup; otherwise it is only styled text.
export function HelpLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  if (!onClick) {
    return <span className="text-[#1F5FBF] cursor-pointer hover:underline">({children})</span>;
  }
  return (
    <button type="button" onClick={onClick} className="text-[#1F5FBF] hover:underline">
      ({children})
    </button>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <span className="text-[10px] text-gray-500">{children}</span>;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-[11px] text-red-600">{message}</span>;
}

type Option = string | { label: string; value: string };

export function SelectInput({
  value,
  onChange,
  options,
  className = "w-full sm:w-72",
}: {
  value: string;
  onChange: (next: string) => void;
  options: Option[];
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${className}`}>
      <option value="">Please select...</option>
      {options.map((opt) => {
        const o = typeof opt === "string" ? { label: opt, value: opt } : opt;
        return (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        );
      })}
    </select>
  );
}

// A question on the left with its control on the right, with an optional inline error.
export function QuestionRow({
  question,
  error,
  children,
}: {
  question: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-xs text-gray-800 sm:max-w-xl">{question}</div>
        <div className="shrink-0">{children}</div>
      </div>
      {error && <div className="text-right"><FieldError message={error} /></div>}
    </div>
  );
}

// Fixed-width label with its control next to it (used for simple text inputs).
export function LabelRow({
  label,
  error,
  children,
}: {
  label: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center">
      <label className="w-52 text-xs text-gray-800 shrink-0">{label}</label>
      {children}
      {error && (
        <span className="basis-full text-[11px] text-red-600 sm:pl-52">{error}</span>
      )}
    </div>
  );
}

export function CheckboxList({
  options,
  selected,
  onToggle,
  columns = 1,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={`pl-1 text-xs text-gray-800 ${columns === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5" : "space-y-1.5"}`}>
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="h-3.5 w-3.5 accent-[#1B365D]"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export const toList = (csv: string | undefined) => (csv || "").split(",").map((s) => s.trim()).filter(Boolean);
