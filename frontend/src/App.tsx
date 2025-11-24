import { Container, Header, MessageList, Composer, useWebchat, StylesheetProvider } from '@botpress/webchat'
import type { IntegrationMessage } from '@botpress/webchat'
import Context from './components/Context'
import { useMemo, useState, useEffect, useRef } from 'react'
import './App.css'

const headerConfig = {
  botName: 'Assistant',
  botAvatar: 'https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png',
  botDescription: 'Ask AI a question about the documentation. Powered by Botpress.',
}

function App() {
  const [currentContext, setCurrentContext] = useState<Array<{ title: string; path: string }>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { client, messages, isTyping, user, clientState, newConversation } = useWebchat({
    clientId: import.meta.env.VITE_DEV_CLIENT_ID
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
      
      if (event.data.type === 'focusInput') {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }

      if (event.data.type === 'sendMessage' && event.data.message) {
        client?.sendMessage({
          type: 'text',
          text: event.data.message,
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [client])

  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? e.metaKey : e.ctrlKey
      
      if (e.key === 'Escape') {
        e.preventDefault()
        window.parent.postMessage({ type: 'closePanel' }, '*')
      }

      if (modifierKey && e.key === 'i' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        window.parent.postMessage({ type: 'togglePanel' }, '*')
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcut)
    return () => window.removeEventListener('keydown', handleKeyboardShortcut)
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
        inputRef={inputRef}
      >
        <Context currentContext={currentContext} setCurrentContext={setCurrentContext}/>
      </Composer>
    </Container>
    <StylesheetProvider radius={1.5} fontFamily='Inter' variant='solid' />
    </>
  )
}

export default App