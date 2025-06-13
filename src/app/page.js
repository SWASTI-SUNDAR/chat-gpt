"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "ai/react";
import { Send } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNavigation from "@/components/TopNavigation";
import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0); // Force sidebar refresh
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Use Vercel AI SDK's useChat hook for streaming
  const {
    messages,
    input,
    setInput,
    append,
    setMessages,
    isLoading,
    error,
    data,
  } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      // Handle response metadata from headers
      const conversationId = response.headers.get("X-Conversation-Id");
      const trimmed = response.headers.get("X-Trimmed") === "true";
      const messageCount = response.headers.get("X-Message-Count");
      const originalMessageCount = response.headers.get(
        "X-Original-Message-Count"
      );

      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId);
        window.history.pushState({}, "", `/?conversation=${conversationId}`);
        // Force sidebar to refresh to show the new conversation
        setSidebarKey((prev) => prev + 1);
      }

      // Show trimming notification if applicable
      if (trimmed) {
        toast({
          title: "Context Window Trimmed",
          description: `Conversation trimmed from ${originalMessageCount} to ${messageCount} messages to fit context window.`,
          variant: "default",
        });
      }
    },
    onFinish: (message) => {
      // Message finished streaming
      console.log("Streaming finished:", message);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Load conversation on mount or when conversation ID changes
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && isSignedIn) {
      loadConversation(conversationId);
    } else if (isSignedIn) {
      // Start with empty conversation
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [searchParams, isSignedIn]);

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        const loadedMessages = data.messages.map((msg) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
      } else {
        console.error("Failed to load conversation");
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Check if user is near bottom of chat
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Force scroll to bottom when typing starts/stops
  useEffect(() => {
    if (isLoading) {
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  }, [isLoading]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not signed in (handled by useEffect, but this prevents flash)
  if (!isSignedIn) {
    return null;
  }

  const handleSendMessage = async ({ text, files }) => {
    if (!text.trim() && files.length === 0) return;

    // Create message content
    let messageContent = text;
    if (files.length > 0) {
      const fileDescriptions = files
        .map((f) => `[Attached: ${f.name}]`)
        .join(" ");
      messageContent = text
        ? `${text}\n\n${fileDescriptions}`
        : fileDescriptions;
    }

    // Use the streaming append function
    try {
      await append(
        {
          role: "user",
          content: messageContent,
        },
        {
          options: {
            body: {
              conversationId: currentConversationId,
              title: !currentConversationId ? text.substring(0, 50) : undefined,
            },
          },
        }
      );

      if (files.length > 0) {
        toast({
          title: "Files processed",
          description: `Successfully processed ${files.length} file${
            files.length > 1 ? "s" : ""
          }.`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    // Find the message index
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    // Update the message content
    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );

    if (messages[messageIndex].role === "user") {
      // Remove all messages after the edited message and regenerate
      const messagesUpToEdit = updatedMessages.slice(0, messageIndex + 1);
      setMessages(messagesUpToEdit);

      // Use append to regenerate response with updated context
      try {
        await append(
          {
            role: "user",
            content: newContent,
          },
          {
            options: {
              body: {
                conversationId: currentConversationId,
              },
            },
          }
        );

        toast({
          title: "Message updated",
          description: "Response regenerated based on your edited message.",
          variant: "success",
        });
      } catch (error) {
        console.error("Regeneration error:", error);
        toast({
          title: "Regeneration failed",
          description: "Failed to regenerate response.",
          variant: "destructive",
        });
      }
    } else {
      // Just update the message content for assistant messages
      setMessages(updatedMessages);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        key={sidebarKey}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNavigation
          chatTitle={`${user.firstName}'s Chat` || "Chat"}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain scroll-smooth"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onEditMessage={handleEditMessage}
                />
              ))}
              {isLoading && (
                <ChatMessage message={{ role: "assistant" }} isTyping={true} />
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>
        </div>

        {/* Scroll to bottom button */}
        {!shouldAutoScroll && (
          <div className="absolute bottom-20 sm:bottom-24 right-4 sm:right-6 z-10">
            <button
              onClick={() => {
                setShouldAutoScroll(true);
                scrollToBottom("smooth");
              }}
              className="bg-card border border-border rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Message Input - Sticky at bottom */}
        <div className="sticky bottom-0 z-20 bg-background/80 backdrop-blur-sm border-t border-border">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
