"use client";

import { useState } from "react";
import { Menu, Plus, MessageSquare, Settings, User, Send } from "lucide-react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const conversations = [
    { id: 1, title: "React Best Practices", time: "2 hours ago" },
    { id: 2, title: "JavaScript Async/Await", time: "1 day ago" },
    { id: 3, title: "CSS Grid Layout", time: "3 days ago" },
    { id: 4, title: "Node.js Express Setup", time: "1 week ago" },
  ];

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
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-lg font-semibold">ChatGPT</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conv.time}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-border p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
              <User className="h-4 w-4" />
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">React Best Practices</h2>
          <div className="w-8"></div> {/* Spacer for centering */}
        </header>

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
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      U
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-border bg-card">
          <div className="max-w-3xl mx-auto p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message ChatGPT..."
                  className="w-full px-4 py-3 pr-12 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background min-h-[52px] max-h-32"
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
                  className="absolute right-2 bottom-2 p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
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
