"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-4 shadow-lg animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Join ChatGPT Clone
          </h1>
          <p className="text-muted-foreground text-lg opacity-80">
            Create your account to start chatting with AI
          </p>
        </div>

        {/* Sign Up Component with enhanced styling */}
        <div className="backdrop-blur-xl bg-card/30 border border-white/10 rounded-2xl shadow-2xl p-1 hover:shadow-cyan-500/10 transition-all duration-500">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                headerTitle:
                  "text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent",
                headerSubtitle: "text-muted-foreground/80",
                formButtonPrimary:
                  "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25",
                formFieldInput:
                  "backdrop-blur-sm bg-background/50 border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300",
                socialButtonsBlockButton:
                  "backdrop-blur-sm bg-background/50 border-white/10 hover:bg-accent/50 transition-all duration-300 hover:scale-105",
                footerActionLink:
                  "text-cyan-400 hover:text-cyan-300 transition-colors duration-300",
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center opacity-0 animate-fade-in-delayed">
          <p className="text-sm text-muted-foreground/80">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium relative group"
            >
              Sign in here
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
