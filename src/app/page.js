"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNavigation from "@/components/TopNavigation";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const messages = [
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
        "The useEffect hook is one of the most important hooks in React. It lets you perform side effects in functional components. Here's what you need to know:\n\n1. **Basic syntax**: useEffect takes a function as its first argument\n2. **Dependency array**: The second argument controls when the effect runs\n3. **Cleanup**: You can return a cleanup function\n\nWould you like me to show you some examples?",
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Navigation */}
        <TopNavigation
          chatTitle="React Best Practices"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      U
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-border bg-card sticky bottom-0">
          <div className="max-w-3xl mx-auto p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message ChatGPT..."
                  className="w-full px-4 py-3 pr-12 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background min-h-[52px] max-h-32 shadow-sm"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      // Handle send message
                      console.log("Send message:", message);
                      setMessage("");
                    }
                  }}
                />
                <button
                  className="absolute right-2 bottom-2 p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
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
