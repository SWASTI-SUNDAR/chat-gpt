import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Join ChatGPT Clone
          </h1>
          <p className="text-muted-foreground text-lg">
            Create your account to start chatting with AI
          </p>
        </div>

        {/* Sign Up Component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl rounded-lg",
            },
          }}
        />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-primary hover:text-primary/90 transition-colors duration-200 font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
