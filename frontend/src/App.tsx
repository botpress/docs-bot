import { Container, Header, MessageList, Composer, useWebchat, StylesheetProvider } from '@botpress/webchat'
import type { IntegrationMessage } from '@botpress/webchat'
import Context from './components/context'
import { useMemo, useState, useEffect } from 'react'
import './App.css'

const headerConfig = {
  botName: 'Assistant',
  botAvatar: 'https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png',
  botDescription: 'Ask AI a question about the documentation. Powered by Botpress.',
}

function App() {
  const [currentContext, setCurrentContext] = useState<Array<{ title: string; path: string }>>([])

  const { client, messages, isTyping, user, clientState, newConversation } = useWebchat({
    clientId: import.meta.env.VITE_AGENT_CLIENT_ID
  })

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'askAI' && event.data.data?.path) {
        setCurrentContext((prev) => {

          if (!prev.some(item => item.path === event.data.data.path)) {
            return [...prev, { title: event.data.data.title, path: event.data.data.path }]
          }
          return prev
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const config = {
    botName: 'Assistant',
    botAvatar: 'https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png',
    botDescription: 'Ask AI a question about the documentation. Powered by Botpress.',
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

  const sendMessage = async (payload: IntegrationMessage['payload']) => {
    if (payload.type === 'text') {
      await client?.sendMessage({
        ...payload,
        value: JSON.stringify({currentContext}),
      })
    } else {
      await client?.sendMessage(payload)
    }
    setCurrentContext([])
  }

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
        restartConversation={newConversation}
        disabled={false}
        configuration={headerConfig}
      />
      <MessageList
        botName={config.botName}
        botDescription={config.botDescription}
        isTyping={isTyping}
        showMarquee={true}
        messages={enrichedMessages}
        sendMessage={sendMessage}
      />
      <Composer
        disableComposer={false}
        isReadOnly={false}
        allowFileUpload={false}
        connected={clientState !== 'disconnected'}
        sendMessage={sendMessage}
        composerPlaceholder="Ask a question..."
      >
        <Context currentContext={currentContext} setCurrentContext={setCurrentContext}/>
      </Composer>
    </Container>
    <StylesheetProvider radius={1.5} fontFamily='Inter'/>
    </>
  )
}

export default App