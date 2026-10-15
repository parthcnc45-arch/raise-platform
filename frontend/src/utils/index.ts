import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS class names with conditional logic.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
