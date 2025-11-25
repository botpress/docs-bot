import { useState, useRef, useEffect } from "react";
import { MODELS } from "../config/models";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import CheckIcon from "./icons/CheckIcon";
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
        <span className={`model-arrow ${isOpen ? "open" : ""}`}>
          <ChevronDownIcon className="lucide lucide-chevron-down-icon lucide-chevron-down" />
        </span>
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
                  <CheckIcon className="lucide lucide-check-icon lucide-check" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

