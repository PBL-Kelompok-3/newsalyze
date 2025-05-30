import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTitle(text: string): string {
  if (!text) return "Ringkasan";

  const sentences = text.trim().split(/[.?!]/);
  const firstSentence = sentences.find(s => s.trim().length > 0)?.trim() || "Ringkasan";

  // Ambil maksimal 10 kata dari kalimat pertama
  const words = firstSentence.split(/\s+/).slice(0, 5);
  return words.join(" ") + (words.length >= 5 ? "..." : "");
}
