// src/lib/utils.js
import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function extractSlugFromLink(link) {
  const segments = new URL(link).pathname  // np. "/pl/o-nas/"
    .split('/')
    .filter(Boolean);                     // ["pl","o-nas"]
  // jeśli pierwszy segment to język, odrzuć go
  if (['de','pl','en'].includes(segments[0])) segments.shift();
  // teraz segments[0] to Twój slug albo undefined dla home
  return segments[0] || '';               // "" → homepage
}