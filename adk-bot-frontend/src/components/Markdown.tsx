import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  text: string
  className?: string
}

/**
 * Renders assistant messages as Markdown with GitHub-flavored extensions
 * (tables, fenced code, task lists). Code blocks get a subtle surface card
 * with a copy button; everything else uses the chat type scale.
 */
export const Markdown = memo(function Markdown({ text, className }: MarkdownProps) {
  return (
    <div className={cn('markdown text-[14px] leading-6.5 text-foreground', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,

          h1: ({ children }) => (
            <h1 className="mt-5 mb-2 text-[18px] font-semibold leading-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 text-[16px] font-semibold leading-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-1.5 text-[14px] font-semibold leading-tight">{children}</h3>
          ),

          ul: ({ children }) => (
            <ul className="my-3 ml-5 list-disc marker:text-muted-foreground/60 space-y-1.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-5 list-decimal marker:text-muted-foreground/70 space-y-1.5">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,

          a: ({ href, children }) => (
            <a
              href={href}
              onClick={(e) => {
                if (!href) return
                // Hand the URL to the parent docs page so it can navigate
                // same-tab for in-docs links and keep the panel open. The
                // parent falls back to a new tab for external URLs.
                if (window.parent !== window) {
                  e.preventDefault()
                  e.stopPropagation()
                  window.parent.postMessage({ type: 'navigate', url: href }, '*')
                }
              }}
              target="_blank"
              rel="noreferrer noopener"
              className="text-foreground underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground"
            >
              {children}
            </a>
          ),

          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,

          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-border pl-3 text-muted-foreground">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-4 border-border/60" />,

          table: ({ children }) => (
            <div className="my-3 overflow-x-auto scrollbar-subtle">
              <table className="text-[13px] border-collapse w-full">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-2 py-1 text-left font-semibold bg-muted/60">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1 align-top">{children}</td>
          ),

          code: ({ className, children, ...props }) => {
            // Inline code only. Fenced blocks (with or without a language)
            // are routed to CodeBlock through the `pre` handler below so
            // they always get the language pill + copy button treatment.
            return (
              <code
                {...props}
                className="px-1.5 py-0.5 rounded-md bg-muted text-[0.86em] font-mono"
              >
                {children}
              </code>
            )
          },

          pre: ({ children }) => {
            // react-markdown gives us a single ReactElement child here:
            // the <code> node. Pull its className (for the language) and
            // its children (the raw code string).
            const child = Array.isArray(children) ? children[0] : children
            const codeProps = (child as { props?: { className?: string; children?: unknown } })
              ?.props
            const className = codeProps?.className || ''
            const lang = (className.match(/language-([\w-]+)/) || [])[1] || ''
            const raw = String(codeProps?.children ?? '').replace(/\n$/, '')
            return <CodeBlock lang={lang} code={raw} />
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
})

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="group relative my-3 rounded-lg border border-border/70 bg-muted/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-[11px] text-muted-foreground">
        <span className="font-mono">{lang || 'code'}</span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors',
            'hover:bg-background/60 hover:text-foreground',
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto scrollbar-subtle px-3 py-2.5 text-[12.5px] leading-5 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}
