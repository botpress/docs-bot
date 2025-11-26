import { useEffect } from "react";
import { ALLOWED_PARENT_ORIGINS } from "../config/constants";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      const originUrl = new URL(document.referrer).origin

      if (e.key === "Escape") {
        e.preventDefault();
        window.parent.postMessage({ type: "closePanel" }, ALLOWED_PARENT_ORIGINS.includes(originUrl) ? originUrl : "https://botpress.com/");
      }

      if (modifierKey && e.key === "i" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        window.parent.postMessage({ type: "togglePanel" }, ALLOWED_PARENT_ORIGINS.includes(originUrl) ? originUrl : "https://botpress.com/");
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, []);
}

