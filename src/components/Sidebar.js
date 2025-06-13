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
  Sparkles,
  Brain,
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
          className={`w-full text-left p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
            isActive
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 shadow-lg backdrop-blur-sm"
              : "hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/5"
          } transform hover:scale-[1.02] group`}
        >
          {/* Shimmer effect for active conversation */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
          )}

          <div className="flex items-center gap-3 pr-8 relative z-10">
            <div
              className={`p-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 shadow-lg"
                  : "bg-white/5 group-hover:bg-white/10"
              }`}
            >
              <MessageSquare
                className={`h-4 w-4 transition-all duration-300 ${
                  isActive
                    ? "text-purple-400 scale-110"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate leading-tight transition-colors duration-300 ${
                  isActive
                    ? "text-foreground"
                    : "text-foreground/90 group-hover:text-foreground"
                }`}
              >
                {conversation.title}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 transition-colors duration-300 group-hover:text-muted-foreground">
                {formatTime(
                  conversation.lastMessageAt || conversation.createdAt
                )}
              </p>
            </div>
            {isActive && (
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>

        {/* Enhanced action buttons */}
        {(isHovered || isActive) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
              onClick={(e) => handleDeleteConversation(conversation._id, e)}
              title="Delete conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const ConversationGroup = ({ title, conversations }) => {
    if (conversations.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        <div className="space-y-2">
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
      className={`fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-2xl bg-card/40 border-r border-white/10 transform transition-all duration-500 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-0 shadow-2xl`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>

      <div className="flex flex-col h-full relative z-10">
        {/* Enhanced Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                ChatGPT Pro
              </h1>
              <p className="text-xs text-muted-foreground/60">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Enhanced New Chat Button */}
        <div className="p-6">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group backdrop-blur-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="p-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-4 w-4 text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <div className="flex-1 text-left relative z-10">
              <span className="font-semibold text-foreground">New Chat</span>
              <p className="text-xs text-muted-foreground/70">
                Start a conversation
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-purple-400/70 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" />
          </button>
        </div>

        {/* Enhanced Conversations List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Loading conversations...
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/5">
                <MessageSquare className="h-10 w-10 text-purple-400/70" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No conversations yet
              </h3>
              <p className="text-sm text-muted-foreground/60 mb-4">
                Your AI conversations will appear here
              </p>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent mx-auto"></div>
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

        {/* Enhanced Sidebar Footer */}
        <div className="border-t border-white/10 p-6 space-y-3 backdrop-blur-sm bg-card/20">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 group hover:scale-[1.02]">
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
              <Settings className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500 text-muted-foreground group-hover:text-foreground" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                Settings
              </span>
              <p className="text-xs text-muted-foreground/60">
                Preferences & more
              </p>
            </div>
          </button>

          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 group hover:scale-[1.02]">
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
              <User className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                Profile
              </span>
              <p className="text-xs text-muted-foreground/60">
                Account settings
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
