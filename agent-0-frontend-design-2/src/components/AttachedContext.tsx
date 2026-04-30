import "./AttachedContext.css";
import Attachment from "./icons/Attachment";

export function Context({ attached }: { attached: string }) {
  const parsed = JSON.parse(attached);

  return (
    <div className="attached-context-container">
      {parsed.currentContext.map(
        (context: { title: string; path: string }, index: number) => (
          <div className="attached-context" key={index}>
            <Attachment />
            <span className="attached-context-title">
              <a
                href={`https://botpress.com/docs` + context.path}
                className="attached-context-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {context.title}
              </a>
            </span>
          </div>
        )
      )}
    </div>
  );
}
