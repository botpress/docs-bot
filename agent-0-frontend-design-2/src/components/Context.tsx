import PlusIcon from "./icons/PlusIcon";
import CloseIcon from "./icons/CloseIcon";
import "./Context.css";

interface ContextProps {
  currentContext: Array<{ title: string; path: string }>;
  setCurrentContext: (value: Array<{ title: string; path: string }>) => void;
  suggestedContext?: { title: string; path: string } | null;
  addSuggestedContext?: () => void;
}

const Context = ({
  currentContext,
  setCurrentContext,
  suggestedContext,
  addSuggestedContext,
}: ContextProps) => {
  const removeContext = (indexToRemove: number) => {
    setCurrentContext(currentContext.filter((_, i) => i !== indexToRemove));
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addSuggestedContext?.();
    }
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      removeContext(index);
    }
  };

  return (
    <>
      {(currentContext.length > 0 || suggestedContext) && (
        <div className="bpComposerFileContainer context-container">
          {suggestedContext && currentContext.length === 0 && (
            <div
              className="bpComposerFileAttachement context-suggested"
              onClick={addSuggestedContext}
              onKeyDown={handleAddKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Add suggested context"
            >
              <div className="context-item-content">
                <div className="bpComposerFileName context-title">
                  {suggestedContext.title}
                </div>
                <div className="bpComposerFileExtension context-path">
                  {suggestedContext.path}
                </div>
              </div>
              <PlusIcon className="lucide lucide-plus context-icon" />
            </div>
          )}

          {currentContext.map((context, index) => (
            <div
              className="bpComposerFileAttachement context-active"
              key={index}
            >
              <div className="context-item-content">
                <div className="bpComposerFileName context-title">
                  {context.title}
                </div>
                <div className="bpComposerFileExtension context-path">
                  {context.path}
                </div>
              </div>
              <button
                className="context-remove-button"
                onClick={() => removeContext(index)}
                onKeyDown={(e) => handleRemoveKeyDown(e, index)}
                aria-label="Remove context"
              >
                <CloseIcon className="lucide lucide-circle-x bpComposerFileRemoveIcon" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Context;
