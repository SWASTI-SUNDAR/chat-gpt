"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNavigation from "@/components/TopNavigation";
import ChatMessage from "@/components/ChatMessage";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: `I understand you're asking about: "${message}"\n\nThis is a simulated response. In a real application, this would be connected to an AI API like OpenAI's ChatGPT.\n\n**Here's how you might implement this:**\n\n\`\`\`javascript\nconst response = await fetch('/api/chat', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({ message }),\n});\n\nconst data = await response.json();\n\`\`\`\n\nIs there anything specific you'd like to know more about?`,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

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
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <ChatMessage message={{ role: "assistant" }} isTyping={true} />
              )}
              <div ref={messagesEndRef} />
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
                  disabled={isTyping}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 bottom-2 p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!message.trim() || isTyping}
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
