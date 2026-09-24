"use client";
import { useSyncExternalStore } from "react";

const key = "hanzis-poetry-show-pinyin-v1";
const eventName = "hanzis-poetry-pinyin-change";
let sessionValue: boolean | null = null;
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(eventName, callback); window.removeEventListener("storage", callback); };
}
function getSnapshot(): boolean | null {
  if (sessionValue !== null) return sessionValue;
  try {
    const value = localStorage.getItem(key);
    return value === "true" ? true : value === "false" ? false : sessionValue;
  } catch { return sessionValue; }
}
function setValue(value: boolean) {
  try { localStorage.setItem(key, String(value)); sessionValue = null; }
  catch { sessionValue = value; } // Retain the choice when browser storage is unavailable.
  window.dispatchEvent(new Event(eventName));
}
export function usePoetryPinyinPreference(defaultValue: boolean): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return [value ?? defaultValue, setValue];
}
