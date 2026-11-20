import { Check } from "lucide-react";

const STEPS = ["Contact & Company", "Company Focus", "Deck & Track Record", "Portfolio", "Submit"];

// Horizontal progress indicator for the 5-page GP application form.
export default function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex w-full items-start" aria-label="Application progress">
      {STEPS.map((label, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden
                className={`absolute left-[-50%] top-3.5 h-0.5 w-full ${index <= currentStep ? "bg-[#2d9ab7]" : "bg-slate-200"}`}
              />
            )}
            <span
              aria-current={active ? "step" : undefined}
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition ${
                done
                  ? "border-[#2d9ab7] bg-[#2d9ab7] text-white"
                  : active
                    ? "border-[#2d9ab7] bg-white text-[#2d9ab7] ring-4 ring-[#2d9ab7]/15"
                    : "border-slate-300 bg-white text-slate-400"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={`mt-1.5 hidden px-1 text-[10px] font-semibold leading-tight sm:block ${
                active ? "text-[#1B365D]" : done ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
