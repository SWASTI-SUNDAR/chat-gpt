import OpenAI from 'openai';
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        userId
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create new conversation with auto-generated or provided title
      const conversationTitle = title || messages[messages.length - 1]?.content?.substring(0, 50) + '...' || 'New Chat';
      
      conversation = new Conversation({
        userId,
        title: conversationTitle,
      });
      
      await conversation.save();
    }

    // Save user message to database
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role === 'user') {
      const userMessage = new Message({
        conversationId: conversation._id,
        role: 'user',
        content: latestMessage.content,
      });
      
      await userMessage.save();
    }

    // Prepare messages for OpenAI
    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Save AI response to database
    const aiMessage = new Message({
      conversationId: conversation._id,
      role: 'assistant',
      content: assistantMessage,
      metadata: {
        model: 'gpt-3.5-turbo',
        tokens: {
          prompt: completion.usage.prompt_tokens,
          completion: completion.usage.completion_tokens,
          total: completion.usage.total_tokens,
        },
      },
    });
    
    await aiMessage.save();

    // Update conversation stats
    await Conversation.findByIdAndUpdate(conversation._id, {
      $inc: { messageCount: 2 }, // User message + AI response
      lastMessageAt: new Date(),
    });

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation._id.toString(),
      model: "gpt-3.5-turbo",
      usage: completion.usage,
    });

  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing." },
        { status: 429 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key." },
        { status: 401 }
      );
    }

    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to generate response. Please try again.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
