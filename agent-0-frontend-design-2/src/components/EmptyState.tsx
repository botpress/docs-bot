import "./EmptyState.css";

const SUGGESTED_QUESTIONS: string[] = [
  "How do I add an AI agent to WhatsApp?",
  "What are Knowledge Bases?",
  "How to add a webhook to my agent?",
];

interface EmptyStateProps {
  onSendMessage: (text: string) => void;
}

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <span className="bpHeaderContentTitle">
          What can I help with today?
        </span>
        <div className="suggested-questions">
          {SUGGESTED_QUESTIONS.map((question, index) => (
            <button
              key={index}
              className="suggested-question"
              onClick={() => onSendMessage(question)}
            >
              <span className="suggested-question-text">{question}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
