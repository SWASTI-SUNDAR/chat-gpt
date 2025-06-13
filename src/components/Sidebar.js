"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Settings,
  User,
  MoreHorizontal,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const [activeConversation, setActiveConversation] = useState(1);
  const [hoveredConversation, setHoveredConversation] = useState(null);

  const conversations = [
    {
      id: 1,
      title: "React Best Practices",
      time: "2 hours ago",
      isToday: true,
    },
    {
      id: 2,
      title: "JavaScript Async/Await",
      time: "1 day ago",
      isToday: true,
    },
    { id: 3, title: "CSS Grid Layout", time: "3 days ago", isToday: false },
    {
      id: 4,
      title: "Node.js Express Setup",
      time: "1 week ago",
      isToday: false,
    },
    {
      id: 5,
      title: "TypeScript Interfaces vs Types",
      time: "2 weeks ago",
      isToday: false,
    },
    {
      id: 6,
      title: "Database Design Patterns",
      time: "3 weeks ago",
      isToday: false,
    },
    {
      id: 7,
      title: "API Rate Limiting Strategies",
      time: "1 month ago",
      isToday: false,
    },
    {
      id: 8,
      title: "Docker Container Optimization",
      time: "1 month ago",
      isToday: false,
    },
  ];

  const todayConversations = conversations.filter((conv) => conv.isToday);
  const olderConversations = conversations.filter((conv) => !conv.isToday);

  const ConversationItem = ({ conversation }) => {
    const isActive = activeConversation === conversation.id;
    const isHovered = hoveredConversation === conversation.id;

    return (
      <div
        className="relative group"
        onMouseEnter={() => setHoveredConversation(conversation.id)}
        onMouseLeave={() => setHoveredConversation(null)}
      >
        <button
          onClick={() => setActiveConversation(conversation.id)}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center gap-3 pr-8">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">
                {conversation.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {conversation.time}
              </p>
            </div>
          </div>
        </button>

        {/* Action buttons on hover */}
        {(isHovered || isActive) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button
              className="p-1.5 rounded-md hover:bg-accent-foreground/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Edit conversation:", conversation.id);
              }}
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Delete conversation:", conversation.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-lg font-semibold">ChatGPT</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-all duration-200 group">
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Today's conversations */}
          {todayConversations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Today
              </h3>
              <div className="space-y-1">
                {todayConversations.map((conv) => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
              </div>
            </div>
          )}

          {/* Previous conversations */}
          {olderConversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Previous
              </h3>
              <div className="space-y-1">
                {olderConversations.map((conv) => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group">
            <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
