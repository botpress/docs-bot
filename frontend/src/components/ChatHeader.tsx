import { useState, useRef, useEffect } from "react";
import "./ChatHeader.css";

interface ChatHeaderProps {
  botName: string;
  botDescription: string;
  botAvatar?: string;
  conversationIds: string[];
  selectedConversationId: string | undefined;
  currentConversationId: string | undefined;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onClearAllConversations: () => void;
  onDeleteConversation: (id: string) => void;
  getConversationTitle: (id: string) => string;
  titleJustUpdated?: boolean;
}

export function ChatHeader({
  botName,
  botDescription,
  botAvatar,
  conversationIds,
  selectedConversationId,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onClearAllConversations,
  onDeleteConversation,
  getConversationTitle,
  titleJustUpdated,
}: ChatHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayIds =
    currentConversationId && !conversationIds.includes(currentConversationId)
      ? [...conversationIds, currentConversationId]
      : conversationIds;

  const hasMultipleConversations = displayIds.length > 1;

  const currentTitle = selectedConversationId
    ? getConversationTitle(selectedConversationId)
    : "New chat";

  const displayTitle =
    hasMultipleConversations || currentTitle !== "New chat"
      ? currentTitle
      : botName;

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setDropdownOpen(false);
      setIsClosing(false);
    }, 120);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (dropdownOpen && !isClosing) {
          closeDropdown();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, isClosing]);

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    closeDropdown();
  };

  const handleNewChat = () => {
    onNewConversation();
    closeDropdown();
  };

  const handleClearAll = () => {
    onClearAllConversations();
    closeDropdown();
  };

  const handleTitleClick = () => {
    if (dropdownOpen && !isClosing) {
      closeDropdown();
    } else if (!dropdownOpen) {
      setDropdownOpen(true);
    }
  };

  return (
    <div className="bpReset bpHeaderContainer bpFont" data-state="closed">
      <div className="bpReset bpHeaderContentContainer" data-state="closed">
        <div className="bpReset bpHeaderContentAvatarContainer">
          {botAvatar ? (
            <img
              src={botAvatar}
              alt={botName}
              className="bpHeaderContentAvatarImage"
            />
          ) : (
            <span className="bpHeaderContentAvatarFallback">
              {botName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="chatHeaderInfo">
          <div
            className="chatHeaderTitleRow"
            ref={dropdownRef}
            onClick={handleTitleClick}
            style={{ cursor: "pointer" }}
          >
            <span
              className={`bpHeaderContentTitle ${titleJustUpdated ? "titleFadeIn" : ""}`}
            >
              {displayTitle}
            </span>
            <svg
              className="chatHeaderDropdownChevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>

            {dropdownOpen && (
              <div
                className={`chatHeaderDropdown ${isClosing ? "closing" : ""}`}
              >
                <div className="chatHeaderDropdownItems">
                  {displayIds.map((id) => {
                    const isSelected = id === selectedConversationId;
                    return (
                      <div
                        key={id}
                        className={`chatHeaderDropdownItem ${isSelected ? "selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(id);
                        }}
                      >
                        <span className="chatHeaderDropdownItemTitle">
                          {getConversationTitle(id)}
                        </span>
                        {!isSelected && (
                          <button
                            className="chatHeaderDropdownItemDelete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(id);
                            }}
                            title="Delete conversation"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="chatHeaderDropdownDivider" />
                <div className="chatHeaderDropdownActions">
                  <button
                    className="chatHeaderDropdownAction"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewChat();
                    }}
                  >
                    Add new chat
                  </button>
                  <button
                    className="chatHeaderDropdownAction chatHeaderDropdownActionDanger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                  >
                    Clear all chats
                  </button>
                </div>
              </div>
            )}
          </div>
          <span className="bpHeaderContentDescription">{botDescription}</span>
        </div>

        <div className="bpReset bpHeaderContentActionsContainer">
          <button
            className="bpHeaderContentActionsIcons"
            onClick={handleNewChat}
            title="New conversation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
