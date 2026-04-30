import { useState, useEffect, useRef } from "react";
import type { ContextItem } from "../utils/messageHandlers";
import { ALLOWED_PARENT_ORIGINS } from "../config/constants";

export function useContextManagement() {
  const [currentContext, setCurrentContext] = useState<ContextItem[]>([]);
  const [suggestedContext, setSuggestedContext] = useState<ContextItem | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addSuggestedContext = () => {
    if (suggestedContext) {
      setCurrentContext([...currentContext, suggestedContext]);
      setSuggestedContext(null);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (currentContext.length === 0) {
      if (window.parent !== window) {
        window.parent.postMessage({ type: "requestCurrentPage" }, ALLOWED_PARENT_ORIGINS.includes(document.referrer) ? document.referrer : "https://botpress.com");
      }
    }
  }, [currentContext.length]);

  return {
    currentContext,
    setCurrentContext,
    suggestedContext,
    setSuggestedContext,
    addSuggestedContext,
    inputRef,
  };
}

