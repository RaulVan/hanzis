"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export function AppProviders() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
      window.speechSynthesis?.cancel();
    }
  }, [pathname]);

  return <Toaster theme="light" position="bottom-right" closeButton duration={4000} />;
}
