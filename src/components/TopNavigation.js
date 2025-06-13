"use client";

import {
  Menu,
  Settings,
  User,
  LogOut,
  CreditCard,
  Users,
  Plus,
  HelpCircle,
  Sparkles,
  Crown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";

export default function TopNavigation({ chatTitle, onMenuClick }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="backdrop-blur-2xl bg-card/40 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>

      {/* Left side - Menu button for mobile */}
      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/5"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Enhanced settings button for desktop */}
        <button className="hidden lg:flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group backdrop-blur-sm border border-white/5 hover:scale-105">
          <Settings className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500 text-muted-foreground group-hover:text-purple-400" />
        </button>
      </div>

      {/* Center - Enhanced Chat title */}
      <div className="flex-1 text-center relative z-10">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent truncate max-w-md mx-auto">
            {chatTitle}
          </h2>
        </div>
      </div>

      {/* Right side - Enhanced controls */}
      <div className="flex items-center gap-3 relative z-10">
        {/* Enhanced New chat button for desktop */}
        <button className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10">
          <Plus className="h-4 w-4 text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-medium">New</span>
          <Sparkles className="h-3 w-3 text-purple-400/70 group-hover:text-purple-400 transition-colors duration-300" />
        </button>

        {/* Enhanced User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 hover:scale-110 group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <Avatar className="h-10 w-10 border-2 border-white/10 relative z-10">
                <AvatarImage src={user?.imageUrl} alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-foreground font-bold backdrop-blur-sm">
                  {user?.firstName?.charAt(0) ||
                    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 backdrop-blur-xl bg-card/80 border border-white/10 shadow-2xl"
            align="end"
            forceMount
          >
            {/* Enhanced user info section */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
              <Avatar className="h-12 w-12 border-2 border-white/20">
                <AvatarImage src={user?.imageUrl} alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-foreground font-bold">
                  {user?.firstName?.charAt(0) ||
                    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || "User"}
                  </p>
                  <Crown className="h-3 w-3 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground/80 truncate">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Pro Plan</span>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-white/10" />

            {/* Enhanced menu items */}
            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
                <User className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Profile</span>
                <p className="text-xs text-muted-foreground/60">
                  Account settings
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
                <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Billing</span>
                <p className="text-xs text-muted-foreground/60">
                  Manage subscription
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
                <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Settings</span>
                <p className="text-xs text-muted-foreground/60">
                  Preferences & more
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Team</span>
                <p className="text-xs text-muted-foreground/60">
                  Collaborate together
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all duration-300">
                <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Help & Support</span>
                <p className="text-xs text-muted-foreground/60">
                  Get assistance
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem
              className="flex items-center gap-3 p-3 hover:bg-red-500/10 transition-all duration-300 group cursor-pointer"
              onClick={handleSignOut}
            >
              <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-all duration-300">
                <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
                  Log out
                </span>
                <p className="text-xs text-red-400/60">
                  Sign out of your account
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
