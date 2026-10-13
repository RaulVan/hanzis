"use client";

import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { LANGUAGE_STORAGE_KEY, resolveLanguage, translate, type Language } from "@/lib/i18n";

let language: Language = "zh";
let sessionChoice: Language | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => language;
const getServerSnapshot = (): Language => "zh";

function publish(next: Language) {
  language = next;
  document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  listeners.forEach(listener => listener());
}

function setLanguage(next: Language) {
  sessionChoice = next;
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* Keep the choice for this visit. */ }
  publish(next);
}

/** One controller owns browser listeners; subscribers hydrate against the static Chinese snapshot. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const detect = () => {
      let saved: string | null = sessionChoice;
      try { saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? sessionChoice; } catch { /* Session selection still works. */ }
      publish(resolveLanguage(navigator.language || navigator.languages?.[0] || "en", saved));
    };
    detect();
    const syncStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) {
        sessionChoice = null;
        detect();
      }
    };
    window.addEventListener("languagechange", detect);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener("languagechange", detect);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);
  return children;
}

export function useLanguage() {
  return { language: useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), setLanguage };
}

export function useTranslate() {
  const { language } = useLanguage();
  return useMemo(() => {
    type Values = readonly (string | number | boolean | null | undefined)[];
    function t(text: string, values?: Values): string;
    function t(text: string | undefined, values?: Values): string | undefined;
    function t(text: string | undefined, values?: Values) {
      return text === undefined ? undefined : translate(text, language, values?.map(value => typeof value === "boolean" ? "" : String(value ?? "")));
    }
    return t;
  }, [language]);
}
