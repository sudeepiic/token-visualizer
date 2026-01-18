import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate distinct colors for tokens
export function getTokenColor(index: number, hueBase = 210): string {
  const hue = (hueBase + index * 15) % 360;
  const saturation = 70 + (index % 3) * 10;
  const lightness = 85 + (index % 2) * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getTokenBorderColor(index: number, hueBase = 210): string {
  const hue = (hueBase + index * 15) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
