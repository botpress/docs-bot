import {
  Container,
  MessageList,
  Composer,
  useWebchat,
  StylesheetProvider,
  getUseWebchatClientStore,
} from "@botpress/webchat";
import Context from "./components/Context";
import TextRenderer from "./components/TextRenderer";
import CustomTextRenderer from "./components/CustomTextRenderer";
import ModelSelector from "./components/ModelSelector";
import { ChatHeader } from "./components/ChatHeader";
import { EmptyState } from "./components/EmptyState";
import { DEFAULT_MODEL } from "./config/models";
import { BOT_CONFIG, CLIENT_ID } from "./config/constants";
import { useState, useEffect, useCallback } from "react";
import { useContextManagement } from "./hooks/useContextManagement";
import { useParentWindowMessages } from "./hooks/useParentWindowMessages";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useEnrichedMessages } from "./hooks/useEnrichedMessages";
import { useMessageSender } from "./hooks/useMessageSender";
import { useConversationHistory } from "./hooks/useConversationHistory";
import "./App.css";

function App() {
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL.id);
  const [titleJustUpdated, setTitleJustUpdated] = useState(false);

  const {
    conversationIds,
    selectedConversationId,
    conversationTitles,
    addConversation,
    selectConversation,
    removeConversation,
    setConversationTitle,
    getConversationTitle,
    clearAllConversations,
  } = useConversationHistory();

  // Initialize as true when there are no conversations (fresh session)
  const [isNewChatRequested, setIsNewChatRequested] = useState(
    () => conversationIds.length === 0
  );

  const {
    currentContext,
    setCurrentContext,
    suggestedContext,
    setSuggestedContext,
    addSuggestedContext,
    inputRef,
  } = useContextManagement();

  const {
    client,
    messages,
    isTyping,
    user,
    clientState,
    newConversation,
    conversationId,
    on,
  } = useWebchat({
    clientId: CLIENT_ID,
    conversationId: selectedConversationId,
  });

  const useWebchatClientStore = getUseWebchatClientStore();
  const setConversationId = useWebchatClientStore(
    (state) => state.setConversationId
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setIsNewChatRequested(false);
      selectConversation(id);
      setConversationId(id);
    },
    [selectConversation, setConversationId]
  );

  useEffect(() => {
    if (conversationId && !conversationIds.includes(conversationId)) {
      addConversation(conversationId);
    }
  }, [conversationId, conversationIds, addConversation]);

  useEffect(() => {
    const unsubscribe = on("customEvent", (event: Record<string, unknown>) => {
      if (
        event.type === "conversationTitle" &&
        typeof event.title === "string"
      ) {
        if (conversationId && !conversationTitles[conversationId]) {
          setConversationTitle(conversationId, event.title);
          setTitleJustUpdated(true);
          setTimeout(() => setTitleJustUpdated(false), 400);
        }
      }
    });

    return unsubscribe;
  }, [on, conversationId, conversationTitles, setConversationTitle]);

  const { lastSentMessagePathRef, currentPagePathRef } =
    useParentWindowMessages({
      client,
      currentContext,
      setCurrentContext,
      setSuggestedContext,
      inputRef,
    });

  useKeyboardShortcuts();

  const enrichedMessages = useEnrichedMessages(messages, user?.userId);

  useEffect(() => {
    if (enrichedMessages.length > 0 || isTyping) {
      setIsNewChatRequested(false);
    }
  }, [enrichedMessages.length, isTyping]);

  const sendMessage = useMessageSender({
    client,
    currentContext,
    selectedModel,
    setCurrentContext,
    setSuggestedContext,
    lastSentMessagePathRef,
    currentPagePathRef,
  });

  const handleNewConversation = async () => {
    setIsNewChatRequested(true);
    const emptyChat = conversationIds.find(
      (id) => getConversationTitle(id) === "New chat"
    );

    if (emptyChat) {
      selectConversation(emptyChat);
      setConversationId(emptyChat);
    } else {
      await newConversation();
    }
  };

  const handleClearAllConversations = async () => {
    setIsNewChatRequested(true);
    clearAllConversations();
    await newConversation();
  };

  return (
    <>
      <Container
        connected={clientState !== "disconnected"}
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
        }}
      >
        <ChatHeader
          botName={BOT_CONFIG.name}
          botDescription={BOT_CONFIG.description}
          botAvatar={BOT_CONFIG.avatar}
          conversationIds={conversationIds}
          selectedConversationId={selectedConversationId}
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onClearAllConversations={handleClearAllConversations}
          onDeleteConversation={removeConversation}
          getConversationTitle={getConversationTitle}
          titleJustUpdated={titleJustUpdated}
        />
        {(() => {
          const isConversationReady =
            clientState === "connected" &&
            (!selectedConversationId ||
              selectedConversationId === conversationId);

          // Show empty state immediately when:
          // - Conversation is ready and empty
          // - User explicitly requested new chat
          // - No conversation selected yet
          // - Fresh session with no conversation history
          const showEmptyState =
            enrichedMessages.length === 0 &&
            !isTyping &&
            (isConversationReady ||
              isNewChatRequested ||
              !selectedConversationId ||
              conversationIds.length === 0);

          if (showEmptyState) {
            return (
              <EmptyState
                onSendMessage={(text) => sendMessage({ type: "text", text })}
              />
            );
          }

          return (
            <MessageList
              botName={BOT_CONFIG.name}
              botDescription={BOT_CONFIG.description}
              isTyping={isTyping}
              showMessageStatus={true}
              showMarquee={true}
              messages={enrichedMessages}
              sendMessage={sendMessage}
              renderers={{
                bubble: TextRenderer,
                custom: CustomTextRenderer,
              }}
            />
          );
        })()}
        <Composer
          disableComposer={false}
          isReadOnly={false}
          allowFileUpload={false}
          connected={clientState !== "disconnected"}
          sendMessage={sendMessage}
          composerPlaceholder="Ask a question..."
          inputRef={inputRef}
        >
          <div className="composer-top-row">
            <Context
              currentContext={currentContext}
              setCurrentContext={setCurrentContext}
              suggestedContext={suggestedContext}
              addSuggestedContext={addSuggestedContext}
            />
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </Composer>
      </Container>
      <StylesheetProvider
        radius={1.5}
        fontFamily="Inter"
        variant="solid"
        color="#0090FF"
      />
    </>
  );
}

export default App;
