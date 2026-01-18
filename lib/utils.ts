import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate distinct colors for tokens with good contrast
export function getTokenColor(index: number, hueBase = 210): string {
  const hue = (hueBase + index * 25) % 360;
  const saturation = 65 + (index % 4) * 8;
  // Use medium-light backgrounds (45-55%) for good contrast with white text
  const lightness = 45 + (index % 3) * 5;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getTokenTextColor(): string {
  return 'white';
}

export function getTokenBorderColor(index: number, hueBase = 210): string {
  const hue = (hueBase + index * 25) % 360;
  return `hsl(${hue}, 70%, 40%)`;
}
