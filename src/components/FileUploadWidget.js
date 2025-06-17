"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileIcon,
} from "lucide-react";

export default function FileUploadWidget({ onFileSelected, disabled = false }) {
  const fileInputRef = useRef(null);
  const widgetRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Memoize the file selected callback to prevent duplicate calls
  const handleFileSelected = useCallback(
    (fileData) => {
      console.log("File selected:", fileData.name);
      onFileSelected(fileData);
    },
    [onFileSelected]
  );

  useEffect(() => {
    // Initialize Uploadcare widget when component mounts
    const initializeWidget = () => {
      if (
        typeof window !== "undefined" &&
        window.uploadcare &&
        widgetRef.current &&
        !isInitializedRef.current
      ) {
        try {
          console.log("Initializing Uploadcare widget...");
          const widget = window.uploadcare.Widget(widgetRef.current);
          isInitializedRef.current = true;

          widget.onUploadComplete((fileInfo) => {
            console.log("File uploaded to Uploadcare:", fileInfo);

            // Format file data for our backend
            const fileData = {
              id: fileInfo.uuid,
              name: fileInfo.name,
              size: fileInfo.size,
              type: fileInfo.mimeType,
              uploadcareUrl: fileInfo.cdnUrl,
              isImage: fileInfo.isImage,
              originalUrl: fileInfo.originalUrl,
            };

            handleFileSelected(fileData);
          });

          widget.onDialogOpen(() => {
            console.log("Uploadcare dialog opened");
          });

          widget.onDialogClose(() => {
            console.log("Uploadcare dialog closed");
          });

          // Store widget instance
          widgetRef.current.widget = widget;
        } catch (error) {
          console.error("Error initializing Uploadcare widget:", error);
          isInitializedRef.current = false;
        }
      }
    };

    // Wait for Uploadcare to load
    const checkUploadcare = () => {
      if (window.uploadcare) {
        initializeWidget();
      } else {
        setTimeout(checkUploadcare, 100);
      }
    };

    checkUploadcare();

    // Cleanup function
    return () => {
      isInitializedRef.current = false;
    };
  }, [handleFileSelected]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    // Process only the first file to prevent duplicates
    if (files.length > 0) {
      const file = files[0];
      console.log("File selected from input:", file.name);

      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadcareUrl: URL.createObjectURL(file), // Temporary preview URL
        isImage: file.type.startsWith("image/"),
        file: file, // Keep original file for fallback
      };

      handleFileSelected(fileData);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      console.log("Upload button clicked");

      // Try Uploadcare first, fallback to regular file input
      if (widgetRef.current?.widget) {
        try {
          console.log("Opening Uploadcare dialog");
          widgetRef.current.widget.openDialog();
        } catch (error) {
          console.error("Uploadcare error, using fallback:", error);
          fileInputRef.current?.click();
        }
      } else {
        console.log("Uploadcare not available, using file input");
        // Fallback to regular file input
        fileInputRef.current?.click();
      }
    }
  };

  return (
    <>
      {/* Hidden Uploadcare widget input */}
      <input
        ref={widgetRef}
        type="hidden"
        role="uploadcare-uploader"
        data-public-key={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY}
        data-multiple="false"
        data-images-only="false"
        data-preview-step="true"
        data-clearable="true"
        data-tabs="file camera url"
        data-file-types="image/*, video/*, audio/*, .pdf, .doc, .docx, .txt, .csv, .xlsx"
        data-max-file-size="10485760"
        style={{
          display: "none !important",
          visibility: "hidden",
          position: "absolute",
          left: "-9999px",
        }}
      />

      {/* Fallback file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        multiple={false}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
        style={{
          display: "none !important",
          visibility: "hidden",
          position: "absolute",
          left: "-9999px",
        }}
      />

      {/* Custom trigger button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 group"
        title="Upload files"
        type="button"
      >
        <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-purple-400 transition-colors duration-300" />
      </button>
    </>
  );
}

// File type icon component
export function FileTypeIcon({ fileType, className = "h-4 w-4" }) {
  if (fileType?.startsWith("image/")) {
    return <ImageIcon className={className} />;
  } else if (fileType?.startsWith("video/")) {
    return <Video className={className} />;
  } else if (fileType?.startsWith("audio/")) {
    return <Music className={className} />;
  } else if (fileType?.includes("pdf") || fileType?.includes("document")) {
    return <FileText className={className} />;
  } else {
    return <FileIcon className={className} />;
  }
}
