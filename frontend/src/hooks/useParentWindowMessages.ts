import { useEffect, useRef } from "react";
import type { useWebchat } from "@botpress/webchat";
import { shouldSuggestContext, type MessageData, type ContextItem } from "../utils/messageHandlers";
import { PARENT_ORIGIN } from "../config/constants";

type WebchatClient = ReturnType<typeof useWebchat>["client"];

interface UseParentWindowMessagesProps {
  client: WebchatClient;
  currentContext: ContextItem[];
  setCurrentContext: (value: ContextItem[] | ((prev: ContextItem[]) => ContextItem[])) => void;
  setSuggestedContext: (value: ContextItem | null) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function useParentWindowMessages({
  client,
  currentContext,
  setCurrentContext,
  setSuggestedContext,
  inputRef,
}: UseParentWindowMessagesProps) {
  const lastSentMessagePathRef = useRef<string | null>(null);
  const currentPagePathRef = useRef<string | null>(null);

  useEffect(() => {
    const handleAskAI = (data: MessageData) => {
      if (!data.data?.path || !data.data?.title) return;
      
      setCurrentContext((prev) => {
        if (!prev.some((item) => item.path === data.data!.path)) {
          return [...prev, { title: data.data!.title!, path: data.data!.path! }];
        }
        return prev;
      });
      setSuggestedContext(null);
    };

    const handleFocusInput = () => {
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSendMessage = (data: MessageData) => {
      if (!data.message) return;
      client?.sendMessage({
        type: "text",
        text: data.message,
      });
    };

    const handlePanelOpened = (data: MessageData) => {
      if (!data.data?.path || !data.data?.title) return;
      
      currentPagePathRef.current = data.data.path;
      const isNewPath = lastSentMessagePathRef.current !== data.data.path;

      if (shouldSuggestContext(currentContext, data.data.path, isNewPath)) {
        setSuggestedContext({ title: data.data.title, path: data.data.path });
      } else {
        setSuggestedContext(null);
      }
    };

    const handlePageChanged = (data: MessageData) => {
      if (!data.data?.path || !data.data?.title) return;
      
      currentPagePathRef.current = data.data.path;
      lastSentMessagePathRef.current = null;

      if (shouldSuggestContext(currentContext, data.data.path)) {
        setSuggestedContext({ title: data.data.title, path: data.data.path });
      } else {
        setSuggestedContext(null);
      }
    };

    const handleMessage = (event: MessageEvent<MessageData>) => {
      if (event.origin !== PARENT_ORIGIN) {
        console.warn(`Blocked message from unauthorized origin: ${event.origin}`);
        return;
      }

      const { type, data, message } = event.data;

      switch (type) {
        case "askAI":
          handleAskAI({ type, data, message });
          break;
        case "focusInput":
          handleFocusInput();
          break;
        case "sendMessage":
          handleSendMessage({ type, data, message });
          break;
        case "panelOpened":
          handlePanelOpened({ type, data, message });
          break;
        case "pageChanged":
          handlePageChanged({ type, data, message });
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [client, currentContext, setCurrentContext, setSuggestedContext, inputRef]);

  return { lastSentMessagePathRef, currentPagePathRef };
}

