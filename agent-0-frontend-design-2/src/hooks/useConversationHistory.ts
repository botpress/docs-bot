import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "docs-bot-conversations";
const TITLES_STORAGE_KEY = "docs-bot-conversation-titles";

export type ConversationTitles = Record<string, string>;

export function useConversationHistory() {
  const [conversationIds, setConversationIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [conversationTitles, setConversationTitles] =
    useState<ConversationTitles>(() => {
      const stored = localStorage.getItem(TITLES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    });

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const ids = stored ? JSON.parse(stored) : [];
    return ids.length > 0 ? ids[ids.length - 1] : undefined;
  });

  // Sync conversation IDs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationIds));
  }, [conversationIds]);

  // Sync titles to localStorage
  useEffect(() => {
    localStorage.setItem(
      TITLES_STORAGE_KEY,
      JSON.stringify(conversationTitles)
    );
  }, [conversationTitles]);

  const addConversation = useCallback((conversationId: string) => {
    setConversationIds((prev) => {
      if (prev.includes(conversationId)) {
        return prev;
      }
      return [...prev, conversationId];
    });
    setSelectedConversationId(conversationId);
  }, []);

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  const removeConversation = useCallback(
    (conversationId: string) => {
      setConversationIds((prev) => {
        const newIds = prev.filter((id) => id !== conversationId);
        if (selectedConversationId === conversationId && newIds.length > 0) {
          setSelectedConversationId(newIds[newIds.length - 1]);
        } else if (newIds.length === 0) {
          setSelectedConversationId(undefined);
        }
        return newIds;
      });
      // Also remove the title
      setConversationTitles((prev) => {
        const newTitles = { ...prev };
        delete newTitles[conversationId];
        return newTitles;
      });
    },
    [selectedConversationId]
  );

  const setConversationTitle = useCallback(
    (conversationId: string, title: string) => {
      setConversationTitles((prev) => ({
        ...prev,
        [conversationId]: title,
      }));
    },
    []
  );

  const getConversationTitle = useCallback(
    (conversationId: string): string => {
      return conversationTitles[conversationId] || "New chat";
    },
    [conversationTitles]
  );

  const clearAllConversations = useCallback(() => {
    setConversationIds([]);
    setConversationTitles({});
    setSelectedConversationId(undefined);
  }, []);

  return {
    conversationIds,
    selectedConversationId,
    conversationTitles,
    addConversation,
    selectConversation,
    removeConversation,
    setConversationTitle,
    getConversationTitle,
    clearAllConversations,
  };
}
