"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Sparkles, Zap, Loader2 } from "lucide-react";
import FileUploadWidget, { FileTypeIcon } from "./FileUploadWidget";

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Message ChatGPT...",
}) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() && attachedFiles.length === 0) return;

    // Process files through Cloudinary before sending
    let processedFiles = [];
    if (attachedFiles.length > 0) {
      setIsProcessingFiles(true);
      try {
        const response = await fetch("/api/files/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: attachedFiles }),
        });

        if (response.ok) {
          const result = await response.json();
          processedFiles = result.files;
        } else {
          console.log("File processing API not available, using files as-is");
          // Use original files as fallback
          processedFiles = attachedFiles.map((file) => ({
            ...file,
            cloudinaryUrl:
              file.uploadcareUrl || file.url || URL.createObjectURL(file.file),
            cloudinaryPublicId: null,
          }));
        }
      } catch (error) {
        console.log("File processing failed, using files as-is:", error);
        // Use original files as fallback
        processedFiles = attachedFiles.map((file) => ({
          ...file,
          cloudinaryUrl:
            file.uploadcareUrl ||
            file.url ||
            (file.file ? URL.createObjectURL(file.file) : ""),
          cloudinaryPublicId: null,
        }));
      } finally {
        setIsProcessingFiles(false);
      }
    }

    onSendMessage({
      text: message,
      files: processedFiles,
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

  // Memoize the file selected handler to prevent duplicate calls
  const handleFileSelected = useCallback((fileData) => {
    setAttachedFiles((prev) => {
      // Check if file with same ID already exists
      const existingFile = prev.find((f) => f.id === fileData.id);
      if (existingFile) {
        console.log("File already exists, skipping duplicate");
        return prev;
      }

      console.log("Adding new file:", fileData.name);
      return [...prev, fileData];
    });
  }, []);

  const removeFile = (fileId) => {
    setAttachedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      // Clean up object URLs for files to prevent memory leaks
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (
        fileToRemove?.uploadcareUrl &&
        fileToRemove.uploadcareUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.uploadcareUrl);
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
    disabled ||
    isProcessingFiles ||
    (!message.trim() && attachedFiles.length === 0);

  return (
    <div className="backdrop-blur-2xl bg-card/40 border-t border-white/10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Enhanced file attachments preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {attachedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-3 pr-10 max-w-xs sm:max-w-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                  {file.isImage && file.uploadcareUrl ? (
                    <div className="relative">
                      <img
                        src={
                          file.uploadcareUrl.includes("ucarecdn.com")
                            ? `${file.uploadcareUrl}-/preview/80x80/`
                            : file.uploadcareUrl
                        }
                        alt={file.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border border-white/10"
                        onError={(e) => {
                          // Fallback to file icon if image fails to load
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg"></div>
                      {/* Fallback icon (hidden by default) */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-white/10 hidden">
                        <FileTypeIcon
                          fileType={file.type}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-white/10">
                      <FileTypeIcon
                        fileType={file.type}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate text-foreground/90">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-red-400/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced input area */}
        <div className="flex gap-3 sm:gap-4 items-end">
          {/* Enhanced file upload button */}
          <div className="flex gap-2">
            <FileUploadWidget
              onFileSelected={handleFileSelected}
              disabled={disabled || isProcessingFiles}
            />
          </div>

          {/* Enhanced text input area */}
          <div className="flex-1 relative min-w-0">
            <div className="relative backdrop-blur-xl bg-gradient-to-r from-white/5 to-white/10 rounded-2xl border border-white/10 hover:border-white/20 focus-within:border-purple-400/50 transition-all duration-300 overflow-hidden">
              {/* Input glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isProcessingFiles ? "Processing files..." : placeholder
                }
                disabled={disabled || isProcessingFiles}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-16 resize-none focus:outline-none bg-transparent text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[52px] sm:min-h-[60px] max-h-32 sm:max-h-40 overflow-y-auto text-sm sm:text-base relative z-10"
                style={{ height: "52px" }}
              />

              {/* Enhanced send button */}
              <button
                onClick={handleSend}
                disabled={isDisabled}
                className={`absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300 ${
                  isDisabled
                    ? "bg-white/5 text-muted-foreground/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 group"
                }`}
                title="Send message"
              >
                {isProcessingFiles ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : isDisabled ? (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced helper text */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-purple-400/70" />
            <span className="hidden sm:inline">
              Press Enter to send, Shift+Enter for new line
            </span>
            <span className="sm:hidden">Tap send or Enter to send</span>
          </div>

          {attachedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-purple-400/70" />
              <span>
                {attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""}{" "}
                {isProcessingFiles ? "processing..." : "attached"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
