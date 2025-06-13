"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Edit3, X, Save } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 px-4 py-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm text-muted-foreground ml-2">
        ChatGPT is typing...
      </span>
    </div>
  );
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b border-border">
        <span className="text-sm text-muted-foreground font-medium">
          {language || "code"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-accent transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="!mt-0 !rounded-t-none"
        customStyle={{
          margin: 0,
          background: "hsl(var(--muted))",
          fontSize: "0.875rem",
        }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

export default function ChatMessage({
  message,
  isTyping = false,
  onEditMessage,
}) {
  const { role, content, id } = message;
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [isEditing, editedContent]);

  const handleStartEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== content && onEditMessage) {
      onEditMessage(id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  if (isTyping) {
    return (
      <div className="flex gap-4 justify-start">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
          AI
        </div>
        <div className="max-w-2xl bg-muted rounded-lg shadow-sm">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-4 group ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isAssistant && (
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
          AI
        </div>
      )}

      <div className="relative max-w-2xl">
        {/* Edit button for user messages */}
        {isUser && !isEditing && (isHovered || isEditing) && (
          <button
            onClick={handleStartEdit}
            className="absolute -left-8 top-2 p-1 rounded-md hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
            title="Edit message"
          >
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {isEditing ? (
          /* Edit mode */
          <div className="w-full">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border-2 border-ring rounded-lg resize-none focus:outline-none bg-background text-foreground min-h-[52px] max-h-64 overflow-y-auto"
                placeholder="Type your message..."
              />
            </div>

            {/* Edit controls */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editedContent.trim() || editedContent === content}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-3 w-3" />
                Save & Submit
              </button>
            </div>

            {/* Helper text */}
            <div className="text-xs text-muted-foreground mt-2">
              Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to save, Escape to
              cancel
            </div>
          </div>
        ) : (
          /* Display mode */
          <div
            className={`px-4 py-3 rounded-lg shadow-sm ${
              isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    code: CodeBlock,
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 last:mb-0 list-disc list-inside">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 last:mb-0 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-bold mb-2">{children}</h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-border pl-4 my-2 italic">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && !isEditing && (
        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
}
