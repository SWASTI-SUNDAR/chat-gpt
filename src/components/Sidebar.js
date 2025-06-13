"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  MessageSquare,
  Settings,
  User,
  MoreHorizontal,
  Edit3,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [hoveredConversation, setHoveredConversation] = useState(null);

  // Get current conversation ID from URL
  const currentConversationId = searchParams.get("conversation");

  // Load conversations when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Update active conversation when URL changes
  useEffect(() => {
    setActiveConversation(currentConversationId);
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      } else {
        console.error("Failed to load conversations");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push("/");
    if (onClose) onClose(); // Close sidebar on mobile
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/?conversation=${conversationId}`);
    setActiveConversation(conversationId);
    if (onClose) onClose(); // Close sidebar on mobile
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from local state
        setConversations((prev) =>
          prev.filter((conv) => conv._id !== conversationId)
        );

        // If we're currently viewing this conversation, redirect to home
        if (activeConversation === conversationId) {
          router.push("/");
        }
      } else {
        console.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Group conversations by date
  const groupConversationsByDate = (conversations) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    conversations.forEach((conv) => {
      const convDate = new Date(conv.lastMessageAt || conv.createdAt);

      if (isSameDay(convDate, today)) {
        groups.today.push(conv);
      } else if (isSameDay(convDate, yesterday)) {
        groups.yesterday.push(conv);
      } else if (convDate > sevenDaysAgo) {
        groups.previous7Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
  };

  const ConversationItem = ({ conversation }) => {
    const isActive = activeConversation === conversation._id;
    const isHovered = hoveredConversation === conversation._id;

    return (
      <div
        className="relative group"
        onMouseEnter={() => setHoveredConversation(conversation._id)}
        onMouseLeave={() => setHoveredConversation(null)}
      >
        <button
          onClick={() => handleConversationClick(conversation._id)}
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
                {formatTime(
                  conversation.lastMessageAt || conversation.createdAt
                )}
              </p>
            </div>
          </div>
        </button>

        {/* Action buttons on hover */}
        {(isHovered || isActive) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button
              className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
              onClick={(e) => handleDeleteConversation(conversation._id, e)}
              title="Delete conversation"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const ConversationGroup = ({ title, conversations }) => {
    if (conversations.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <ConversationItem key={conv._id} conversation={conv} />
          ))}
        </div>
      </div>
    );
  };

  const groupedConversations = groupConversationsByDate(conversations);

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
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-all duration-200 group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <>
              <ConversationGroup
                title="Today"
                conversations={groupedConversations.today}
              />
              <ConversationGroup
                title="Yesterday"
                conversations={groupedConversations.yesterday}
              />
              <ConversationGroup
                title="Previous 7 days"
                conversations={groupedConversations.previous7Days}
              />
              <ConversationGroup
                title="Older"
                conversations={groupedConversations.older}
              />
            </>
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
