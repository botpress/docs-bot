import { useCallback } from "react";
import type { IntegrationMessage, useWebchat } from "@botpress/webchat";
import type { ContextItem } from "../utils/messageHandlers";

type WebchatClient = ReturnType<typeof useWebchat>["client"];

interface UseMessageSenderProps {
  client: WebchatClient;
  currentContext: ContextItem[];
  selectedModel: string;
  setCurrentContext: (value: ContextItem[]) => void;
  setSuggestedContext: (value: ContextItem | null) => void;
  lastSentMessagePathRef: React.MutableRefObject<string | null>;
  currentPagePathRef: React.MutableRefObject<string | null>;
}

export function useMessageSender({
  client,
  currentContext,
  selectedModel,
  setCurrentContext,
  setSuggestedContext,
  lastSentMessagePathRef,
  currentPagePathRef,
}: UseMessageSenderProps) {
  return useCallback(
    async (payload: IntegrationMessage["payload"]) => {
      try {
        if (payload.type === "text") {
          await client?.sendMessage({
            ...payload,
            value: JSON.stringify({
              currentContext,
              model: selectedModel,
            }),
          });

          if (currentContext.length > 0) {
            lastSentMessagePathRef.current = currentPagePathRef.current;
          }
        } else {
          await client?.sendMessage(payload);
        }
        setCurrentContext([]);
        setSuggestedContext(null);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [client, currentContext, selectedModel, setCurrentContext, setSuggestedContext, lastSentMessagePathRef, currentPagePathRef]
  );
}

