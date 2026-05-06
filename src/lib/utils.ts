import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: any) {
  if (!date) return "N/A";
  
  // Handle Firestore Timestamp
  if (date?.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  // Handle ISO String or Date object
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return "N/A";
  }
}

export function generateCustomId(name: string) {
  const username = name.toUpperCase().replace(/\s+/g, '').substring(0, 10) || "USER";
  const randomNum = Math.floor(10000 + Math.random() * 90000); 
  return `IND-${username}-${randomNum}`;
}
