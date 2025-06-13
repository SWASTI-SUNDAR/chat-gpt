import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { trimMessagesToContextWindow } from "@/lib/token-counter";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, conversationId, title } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    await connectDB();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation with auto-generated or provided title
      const conversationTitle =
        title ||
        messages[messages.length - 1]?.content?.substring(0, 50) + "..." ||
        "New Chat";

      conversation = new Conversation({
        userId,
        title: conversationTitle,
      });

      await conversation.save();
    }

    // Save user message to database
    const latestMessage = messages[messages.length - 1];
    let savedUserMessage;
    if (latestMessage.role === "user") {
      savedUserMessage = new Message({
        conversationId: conversation._id,
        role: "user",
        content: latestMessage.content,
      });

      await savedUserMessage.save();
    }

    // Trim messages to fit context window (GPT-3.5-turbo has ~16k tokens)
    const {
      messages: trimmedMessages,
      trimmedCount,
      originalCount,
      estimatedTokens,
    } = trimMessagesToContextWindow(messages, 15000);

    if (trimmedCount < originalCount) {
      console.log(
        `Trimmed conversation from ${originalCount} to ${trimmedCount} messages (${estimatedTokens} estimated tokens)`
      );
    }

    // Call OpenAI API for streaming
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: trimmedMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response, {
      onStart: async () => {
        // Optional: Handle stream start
        console.log("Stream started");
      },
      onToken: async (token) => {
        // Optional: Handle each token
        console.log("Token:", token);
      },
      onCompletion: async (completion) => {
        try {
          // Save AI response to database after streaming completes
          const aiMessage = new Message({
            conversationId: conversation._id,
            role: "assistant",
            content: completion,
            metadata: {
              model: "gpt-3.5-turbo",
              tokens: {
                prompt: 0, // OpenAI streaming doesn't provide token counts
                completion: 0,
                total: 0,
              },
              trimmed: trimmedCount < originalCount,
              originalMessageCount: originalCount,
              trimmedMessageCount: trimmedCount,
            },
          });

          await aiMessage.save();

          // Update conversation stats
          const messageIncrement = savedUserMessage ? 2 : 1;
          await Conversation.findByIdAndUpdate(conversation._id, {
            $inc: { messageCount: messageIncrement },
            lastMessageAt: new Date(),
          });

          console.log("Streaming completed and saved to database");
        } catch (error) {
          console.error("Error saving streamed response:", error);
        }
      },
    });

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream, {
      headers: {
        "X-Conversation-Id": conversation._id.toString(),
        "X-Trimmed": trimmedCount < originalCount ? "true" : "false",
        "X-Message-Count": trimmedCount.toString(),
        "X-Original-Message-Count": originalCount.toString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific OpenAI errors
    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 }
      );
    }

    if (error.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "Invalid OpenAI API key." },
        { status: 401 }
      );
    }

    if (error.code === "rate_limit_exceeded") {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate response. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
