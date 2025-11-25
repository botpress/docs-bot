import { useEffect } from "react";
import { PARENT_ORIGIN } from "../config/constants";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "Escape") {
        e.preventDefault();
        window.parent.postMessage({ type: "closePanel" }, PARENT_ORIGIN);
      }

      if (modifierKey && e.key === "i" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        window.parent.postMessage({ type: "togglePanel" }, PARENT_ORIGIN);
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, []);
}

