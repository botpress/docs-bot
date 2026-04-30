import { useState } from "react";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import "./SourceViewer.css";

interface SourceViewerProps {
  citations: Array<{
    title: string;
    url: string;
  }>;
}

export default function SourceViewer({ citations }: SourceViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bpMessageBlocksBubble source-viewer-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="source-viewer-toggle"
      >
        Consulted {citations.length} {citations.length === 1 ? "page" : "pages"}
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="source-viewer-list">
          {citations.map((citation, index) => (
            <a
              key={index}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-viewer-link"
            >
              {citation.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
