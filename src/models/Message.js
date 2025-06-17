import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  id: String, // Original Uploadcare ID
  name: String,
  size: Number,
  type: String, // MIME type
  uploadcareUrl: String, // Original Uploadcare URL
  cloudinaryUrl: String, // Final Cloudinary URL
  cloudinaryPublicId: String, // For deletion purposes
  isImage: Boolean,
  dimensions: {
    width: Number,
    height: Number,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [AttachmentSchema], // Array of file attachments
    metadata: {
      model: String,
      tokens: {
        prompt: Number,
        completion: Number,
        total: Number,
      },
      trimmed: Boolean,
      originalMessageCount: Number,
      trimmedMessageCount: Number,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
