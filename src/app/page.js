"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNavigation from "@/components/TopNavigation";
import ChatMessage from "@/components/ChatMessage";
import MessageInput from "@/components/MessageInput";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Temporary debug - remove this after fixing
  useEffect(() => {
    console.log(
      "Clerk Publishable Key:",
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    );
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const [messages, setMessages] = useState([
    { id: 1, role: "user", content: "Hello! Can you help me with React?" },
    {
      id: 2,
      role: "assistant",
      content:
        "Of course! I'd be happy to help you with React. What specific aspect would you like to learn about or what problem are you trying to solve?",
    },
    {
      id: 3,
      role: "user",
      content: "I want to understand useEffect hook better.",
    },
    {
      id: 4,
      role: "assistant",
      content:
        "The useEffect hook is one of the most important hooks in React. It lets you perform side effects in functional components. Here's what you need to know:\n\n## Basic Syntax\n\n```javascript\nuseEffect(() => {\n  // Your side effect code here\n}, [dependencies]);\n```\n\n## Key Concepts\n\n1. **Basic syntax**: useEffect takes a function as its first argument\n2. **Dependency array**: The second argument controls when the effect runs\n3. **Cleanup**: You can return a cleanup function\n\n### Example with cleanup:\n\n```javascript\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.log('Timer tick');\n  }, 1000);\n\n  return () => {\n    clearInterval(timer);\n  };\n}, []);\n```\n\nWould you like me to show you some more specific examples?",
    },
  ]);

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
  }, [messages, isTyping]);

  // Force scroll to bottom when typing starts/stops
  useEffect(() => {
    if (isTyping) {
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  }, [isTyping]);

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

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageContent,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Call the Gemini API with user context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userId: user.id, // Include user ID for personalization
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, aiResponse]);

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
      console.error("Chat API error:", error);

      toast({
        title: "Error",
        description:
          error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again or check your internet connection.`,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEditMessage = (messageId, newContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    );

    // Optionally regenerate AI response after editing user message
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1 && messages[messageIndex].role === "user") {
      // Remove all messages after the edited message
      setMessages((prev) => prev.slice(0, messageIndex + 1));

      // Regenerate AI response
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          role: "assistant",
          content: `I see you've updated your message to: "${newContent}"\n\nThis is a regenerated response based on your edited message. In a real application, this would trigger a new API call to get a fresh response from the AI.\n\n**The edited message would be processed again:**\n\n\`\`\`javascript\nconst response = await fetch('/api/chat', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({ \n    message: newContent,\n    regenerate: true \n  }),\n});\n\`\`\`\n\nWhat would you like to explore further?`,
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
          style={{ height: "calc(100vh - 120px)" }} // Adjust for header and input
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
              {isTyping && (
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
          <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
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
