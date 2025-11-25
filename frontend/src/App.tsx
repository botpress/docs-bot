import {
  Container,
  Header,
  MessageList,
  Composer,
  useWebchat,
  StylesheetProvider,
} from "@botpress/webchat";
import Context from "./components/Context";
import CustomTextRenderer from "./components/CustomTextRenderer";
import ModelSelector from "./components/ModelSelector";
import { DEFAULT_MODEL } from "./config/models";
import { BOT_CONFIG, CLIENT_ID } from "./config/constants";
import { useState } from "react";
import { useContextManagement } from "./hooks/useContextManagement";
import { useParentWindowMessages } from "./hooks/useParentWindowMessages";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useEnrichedMessages } from "./hooks/useEnrichedMessages";
import { useMessageSender } from "./hooks/useMessageSender";
import "./App.css";

function App() {
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL.id);

  const {
    currentContext,
    setCurrentContext,
    suggestedContext,
    setSuggestedContext,
    addSuggestedContext,
    inputRef,
  } = useContextManagement();

  const { client, messages, isTyping, user, clientState, newConversation } =
    useWebchat({
      clientId: CLIENT_ID,
    });

  const { lastSentMessagePathRef, currentPagePathRef } = useParentWindowMessages({
    client,
    currentContext,
    setCurrentContext,
    setSuggestedContext,
    inputRef,
  });

  useKeyboardShortcuts();

  const enrichedMessages = useEnrichedMessages(messages, user?.userId);

  const sendMessage = useMessageSender({
    client,
          currentContext, 
    selectedModel,
    setCurrentContext,
    setSuggestedContext,
    lastSentMessagePathRef,
    currentPagePathRef,
  });

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
        <Header
          defaultOpen={false}
          restartConversation={newConversation}
          disabled={false}
          configuration={{
            botName: BOT_CONFIG.name,
            botAvatar: BOT_CONFIG.avatar,
            botDescription: BOT_CONFIG.description,
          }}
        />
        <MessageList
          botName={BOT_CONFIG.name}
          botDescription={BOT_CONFIG.description}
          isTyping={isTyping}
          showMarquee={true}
          messages={enrichedMessages}
          sendMessage={sendMessage}
          renderers={{
            custom: CustomTextRenderer,
          }}
        />
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
