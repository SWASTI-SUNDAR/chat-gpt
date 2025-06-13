import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    model: String,
    tokens: {
      prompt: Number,
      completion: Number,
      total: Number,
    },
    files: [{
      name: String,
      size: Number,
      type: String,
    }],
  },
}, {
  timestamps: true,
});

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
