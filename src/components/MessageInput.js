"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Image, X } from "lucide-react";

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Message ChatGPT...",
}) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() && attachedFiles.length === 0) return;

    onSendMessage({
      text: message,
      files: attachedFiles,
    });

    setMessage("");
    setAttachedFiles([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId) => {
    setAttachedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      // Clean up object URLs for images
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isDisabled =
    disabled || (!message.trim() && attachedFiles.length === 0);

  return (
    <div className="bg-card">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* File attachments preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-2 pr-8 max-w-xs sm:max-w-sm">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent rounded flex items-center justify-center">
                      <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2 sm:h-3 sm:w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 sm:gap-3 items-end">
          {/* File upload buttons */}
          <div className="flex gap-1 sm:gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 sm:p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              title="Attach files"
            >
              <Paperclip className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.click();
                  fileInputRef.current.accept = "image/*,.pdf,.doc,.docx,.txt";
                }
              }}
              disabled={disabled}
              className="p-2 sm:p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              title="Upload image"
            >
              <Image className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Text input area */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background shadow-sm transition-all min-h-[44px] sm:min-h-[52px] max-h-24 sm:max-h-32 overflow-y-auto text-sm sm:text-base"
              style={{ height: "44px" }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isDisabled}
              className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 p-1.5 sm:p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              title="Send message"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-muted-foreground text-center px-2">
          <span className="hidden sm:inline">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span className="sm:hidden">Tap send button or Enter to send</span>
          {attachedFiles.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>
                {attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""}{" "}
                attached
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
