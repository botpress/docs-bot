import { Container, Header, MessageList, Composer, useWebchat, StylesheetProvider } from '@botpress/webchat'
import type { IntegrationMessage } from '@botpress/webchat'
import Context from './components/Context'
import CustomTextRenderer from './components/CustomTextRenderer'
import { useMemo, useState, useEffect, useRef } from 'react'
import './App.css'

const headerConfig = {
  botName: 'Assistant',
  botAvatar: 'https://files.bpcontent.cloud/2025/11/19/21/20251119210301-2SLGBPIY.png',
  botDescription: 'Ask AI a question about the documentation. Powered by Botpress.',
}

function App() {
  const [currentContext, setCurrentContext] = useState<Array<{ title: string; path: string }>>([])
  const [suggestedContext, setSuggestedContext] = useState<{ title: string; path: string } | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastSentMessagePath = useRef<string | null>(null)
  const currentPagePath = useRef<string | null>(null)

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
        setSuggestedContext(null)
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

      if (event.data.type === 'panelOpened' && event.data.data?.path && event.data.data?.title) {
        const isLandingPage = event.data.data.path === '/' || 
                             event.data.data.path === '/index' || 
                             event.data.data.path.endsWith('/index.html')
        
        currentPagePath.current = event.data.data.path
        const isNewPath = lastSentMessagePath.current !== event.data.data.path
        
        if (!isLandingPage && currentContext.length === 0 && isNewPath) {
          const alreadyInContext = currentContext.some(item => item.path === event.data.data.path)
          if (!alreadyInContext) {
            setSuggestedContext({ title: event.data.data.title, path: event.data.data.path })
          } else {
            setSuggestedContext(null)
          }
        } else {
          setSuggestedContext(null)
        }
      }

      if (event.data.type === 'pageChanged' && event.data.data?.path && event.data.data?.title) {
        const isLandingPage = event.data.data.path === '/' || 
                             event.data.data.path === '/index' || 
                             event.data.data.path.endsWith('/index.html')
        
        currentPagePath.current = event.data.data.path
        
        lastSentMessagePath.current = null
        
        if (!isLandingPage && currentContext.length === 0) {
          setSuggestedContext({ title: event.data.data.title, path: event.data.data.path })
        } else if (currentContext.length > 0) {
          setSuggestedContext(null)
        } else {
          setSuggestedContext(null)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [client, currentContext])

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
  () => {
    const allEnriched = messages.map((message) => {
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
    })

    const incomingMessages = allEnriched.filter(m => m.direction === 'incoming')
    const latestIncoming = incomingMessages.length > 0 ? incomingMessages[incomingMessages.length - 1] : null
    const latestIsCustom = latestIncoming?.block.type === 'custom'

    // Filter: keep all non-custom messages, and only the latest custom message if it's the most recent incoming.
    // we do this to display status updates
    return allEnriched.filter((msg) => {
      if (msg.block.type !== 'custom') {
        return true
      }
      return latestIsCustom && msg.id === latestIncoming?.id
    })
  },
  [config.botAvatar, config.botName, messages, user?.userId]
  )


  const sendMessage = async (payload: IntegrationMessage['payload']) => {
    if (payload.type === 'text') {
      await client?.sendMessage({
        ...payload,
        value: JSON.stringify({currentContext}),
      })
      
      // If message was sent with context, remember the current path
      if (currentContext.length > 0) {
        lastSentMessagePath.current = currentPagePath.current
      }
    } else {
      await client?.sendMessage(payload)
    }
    setCurrentContext([])
    setSuggestedContext(null)
  }

  const addSuggestedContext = () => {
    if (suggestedContext) {
      setCurrentContext([...currentContext, suggestedContext])
      setSuggestedContext(null)
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    if (currentContext.length === 0) {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'requestCurrentPage' }, '*')
      }
    }
  }, [currentContext.length])

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
        renderers={{
          custom: CustomTextRenderer
        }}
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
        <Context 
          currentContext={currentContext} 
          setCurrentContext={setCurrentContext}
          suggestedContext={suggestedContext}
          addSuggestedContext={addSuggestedContext}
        />
      </Composer>
    </Container>
    <StylesheetProvider radius={1.5} fontFamily='Inter' variant='solid' color='#0090FF'/>
    </>
  )
}

export default App