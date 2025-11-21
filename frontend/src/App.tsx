import { Container, Header, MessageList, Composer, useWebchat } from '@botpress/webchat'
import { useMemo } from 'react'
import './App.css'

const headerConfig = {
  botName: 'Assistant',
  botAvatar: 'https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png',
  botDescription: 'Ask a question about the documentation.',
}

function App() {
  const { client, messages, isTyping, user, clientState, newConversation } = useWebchat({
    clientId: import.meta.env.VITE_AGENT_CLIENT_ID
  })

  const config = {
    botName: 'Assistant',
    botAvatar: 'https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png',
    botDescription: 'Ask a question about the documentation. Powered by Botpress.',
  }
  const enrichedMessages = useMemo(
  () =>
    messages.map((message) => {
      const { authorId } = message
      const direction: 'outgoing' | 'incoming' = authorId === user?.userId ? 'outgoing' : 'incoming'
      return {
        ...message,
        direction,
        sender:
          direction === 'outgoing'
            ? { name: 'You', avatar: undefined }
            : { name: config.botName ?? 'Bot', avatar: config.botAvatar },
      }
    }),
  [config.botAvatar, config.botName, messages, user?.userId]
  )

  return (
    <>
    <Container
      connected={clientState !== 'disconnected'}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
      }}
    >
      <Header
        defaultOpen={false}
        closeWindow={() => console.log(close)}
        restartConversation={newConversation}
        disabled={false}
        configuration={headerConfig}
      />
      <MessageList
        botName={config.botName}
        botDescription={config.botDescription}
        isTyping={isTyping}
        showMarquee={false}
        messages={enrichedMessages}
        sendMessage={client?.sendMessage}
      />
      <Composer
        disableComposer={false}
        isReadOnly={false}
        allowFileUpload={true}
        connected={clientState !== 'disconnected'}
        sendMessage={client?.sendMessage}
        uploadFile={client?.uploadFile}
        composerPlaceholder="Type a message..."
      />
    </Container>
    </>
  )
}

export default App