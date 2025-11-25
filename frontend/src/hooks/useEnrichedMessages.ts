import { useMemo } from "react";
import type { BlockMessage } from "@botpress/webchat";
import { BOT_CONFIG } from "../config/constants";

export function useEnrichedMessages(
  messages: BlockMessage[],
  userId?: string
) {
  return useMemo(() => {
    const allEnriched = messages.map((message) => {
      const { authorId } = message;
      const direction: "outgoing" | "incoming" =
        authorId === userId ? "outgoing" : "incoming";
      return {
        ...message,
        direction,
        sender:
          direction === "outgoing"
            ? { name: "You", avatar: undefined }
            : { name: BOT_CONFIG.name, avatar: BOT_CONFIG.avatar },
      };
    });

    const incomingMessages = allEnriched.filter(
      (m) => m.direction === "incoming"
    );
    const latestIncoming =
      incomingMessages.length > 0
        ? incomingMessages[incomingMessages.length - 1]
        : null;
    const latestIsCustom = latestIncoming?.block.type === "custom";

    return allEnriched.filter((msg) => {
      if (msg.block.type !== "custom") {
        return true;
      }
      return latestIsCustom && msg.id === latestIncoming?.id;
    });
  }, [messages, userId]);
}

