import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getStoredCurrency() {
  if (typeof window === "undefined") return "USD";
  return window.localStorage.getItem("businessflow_currency") || "USD";
}

export function storeCurrency(currency: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("businessflow_currency", currency);
}
