// Simple token estimation for GPT models
// This is an approximation - for production, consider using tiktoken-js for exact counts

function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // This includes some overhead for message formatting
  return Math.ceil(text.length / 3.5);
}

function estimateMessageTokens(message) {
  // Add overhead for message structure (role, content formatting)
  const contentTokens = estimateTokens(message.content);
  const roleTokens = estimateTokens(message.role);
  const overhead = 4; // Formatting overhead per message

  return contentTokens + roleTokens + overhead;
}

export function trimMessagesToContextWindow(messages, maxTokens = 15000) {
  // Keep the system message (if any) and try to preserve recent conversation
  let totalTokens = 0;
  const trimmedMessages = [];

  // Start from the most recent messages and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateMessageTokens(message);

    // Always include the last user message
    if (i === messages.length - 1 && message.role === "user") {
      trimmedMessages.unshift(message);
      totalTokens += messageTokens;
      continue;
    }

    // Check if adding this message would exceed the limit
    if (totalTokens + messageTokens > maxTokens) {
      break;
    }

    trimmedMessages.unshift(message);
    totalTokens += messageTokens;
  }

  // Ensure we have at least the last user message
  if (trimmedMessages.length === 0 && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      trimmedMessages.push(lastMessage);
    }
  }

  return {
    messages: trimmedMessages,
    originalCount: messages.length,
    trimmedCount: trimmedMessages.length,
    estimatedTokens: totalTokens,
  };
}

export { estimateTokens, estimateMessageTokens };
