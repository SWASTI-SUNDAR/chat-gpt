import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk user ID
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ConversationSchema.index({ userId: 1, isArchived: 1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
