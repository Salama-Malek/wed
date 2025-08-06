import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param classes 
 * @returns 
 */
export function classes(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}
