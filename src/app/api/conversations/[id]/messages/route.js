import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function GET(request, { params }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.id;

    await connectDB();

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .select("role content attachments metadata createdAt");

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.id;
    const { role, content, metadata } = await request.json();

    if (!role || !content) {
      return NextResponse.json(
        { error: "Role and content are required" },
        { status: 400 }
      );
    }

    if (!["user", "assistant"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create new message
    const message = new Message({
      conversationId,
      role,
      content,
      metadata: metadata || {},
    });

    await message.save();

    // Update conversation stats
    await Conversation.findByIdAndUpdate(conversationId, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date(),
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
