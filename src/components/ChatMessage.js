"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Edit3, X, Save, Sparkles } from "lucide-react";
import { FileTypeIcon } from "./FileUploadWidget";
import { ExternalLink, Download } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 px-5 py-4">
      <div className="flex space-x-1">
        <div className="w-2.5 h-2.5 bg-purple-400/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-pink-400/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-indigo-400/60 rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm text-muted-foreground/80 ml-3">
        ChatGPT is thinking...
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
  const { role, content, id, attachments } = message;
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

  const renderAttachments = () => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm"
          >
            {attachment.isImage ? (
              <div className="relative group">
                <img
                  src={attachment.cloudinaryUrl || attachment.uploadcareUrl}
                  alt={attachment.name}
                  className="w-full max-w-md h-auto rounded-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <a
                      href={attachment.cloudinaryUrl || attachment.uploadcareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/90 text-black rounded-lg hover:bg-white transition-colors"
                      title="View full size"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={attachment.cloudinaryUrl || attachment.uploadcareUrl}
                      download={attachment.name}
                      className="p-2 bg-white/90 text-black rounded-lg hover:bg-white transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileTypeIcon
                    fileType={attachment.type}
                    className="h-6 w-6 text-purple-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {attachment.size
                      ? `${Math.round(attachment.size / 1024)} KB`
                      : "Unknown size"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={attachment.cloudinaryUrl || attachment.uploadcareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title="Open file"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={attachment.cloudinaryUrl || attachment.uploadcareUrl}
                    download={attachment.name}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isTyping) {
    return (
      <div className="flex gap-4 justify-start">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0 animate-pulse">
          AI
        </div>
        <div className="max-w-2xl backdrop-blur-xl bg-gradient-to-r from-white/5 to-white/10 rounded-2xl shadow-lg border border-white/10">
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
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10">AI</span>
        </div>
      )}

      <div className="relative max-w-2xl">
        {/* Enhanced edit button for user messages */}
        {isUser && !isEditing && (isHovered || isEditing) && (
          <button
            onClick={handleStartEdit}
            className="absolute -left-10 top-3 p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Edit message"
          >
            <Edit3 className="h-4 w-4 text-muted-foreground hover:text-purple-400 transition-colors" />
          </button>
        )}

        {isEditing ? (
          /* Enhanced edit mode */
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm"></div>
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-5 py-4 border-2 border-purple-400/50 rounded-2xl resize-none focus:outline-none focus:border-purple-400 bg-background/80 backdrop-blur-xl text-foreground min-h-[60px] max-h-64 overflow-y-auto relative z-10 shadow-lg"
                placeholder="Type your message..."
              />
            </div>

            {/* Enhanced edit controls */}
            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editedContent.trim() || editedContent === content}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
              >
                <Save className="h-4 w-4" />
                Save & Submit
              </button>
            </div>

            {/* Enhanced helper text */}
            <div className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-purple-400/70" />
              Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to save, Escape to
              cancel
            </div>
          </div>
        ) : (
          /* Enhanced display mode */
          <div
            className={`px-5 py-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
              isUser
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto backdrop-blur-xl border border-purple-400/20"
                : "backdrop-blur-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-white/20"
            }`}
          >
            {/* Shimmer effect for user messages */}
            {isUser && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden"></div>
            )}

            <div className="relative z-10">
              {isUser ? (
                <>
                  <p className="whitespace-pre-wrap text-white">{content}</p>
                  {renderAttachments()}
                </>
              ) : (
                <>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-purple">
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
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold mb-2">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold mb-2">
                            {children}
                          </h2>
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
                  {renderAttachments()}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {isUser && !isEditing && (
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10">U</span>
        </div>
      )}
    </div>
  );
}
