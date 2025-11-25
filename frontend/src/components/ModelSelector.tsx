import { useState, useRef, useEffect } from "react";
import { MODELS } from "../config/models";
import "./ModelSelector.css";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModelName =
    MODELS.find((m) => m.id === selectedModel)?.displayName || MODELS[0].displayName;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button
        className="model-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select model"
      >
        <span className="model-name">{currentModelName}</span>
        <span className={`model-arrow ${isOpen ? "open" : ""}`}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg></span>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          {MODELS.map((model) => (
            <button
              key={model.id}
              className={`model-option ${
                selectedModel === model.id ? "selected" : ""
              }`}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
            >
              <span className="model-option-name">{model.displayName}</span>
              {selectedModel === model.id && (
                <span className="model-checkmark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

