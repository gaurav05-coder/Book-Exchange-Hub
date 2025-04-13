// This is a simulated message storage system using localStorage
// In a real application, you would use a database to store messages

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  senderName: string;
}

export interface Conversation {
  bookId: string;
  messages: Message[];
  lastUpdated: Date;
}

// Event system for real-time updates
type MessageListener = (bookId: string, message: Message) => void;
const messageListeners: MessageListener[] = [];

export const subscribeToMessages = (callback: MessageListener) => {
  messageListeners.push(callback);
  return () => {
    const index = messageListeners.indexOf(callback);
    if (index > -1) {
      messageListeners.splice(index, 1);
    }
  };
};

const notifyMessageListeners = (bookId: string, message: Message) => {
  messageListeners.forEach(listener => listener(bookId, message));
};

// Generate a conversation key based on the book ID and the two users involved
const getConversationKey = (bookId: string, userId1: string, userId2: string) => {
  // Sort the user IDs to ensure we get the same key regardless of order
  const userIds = [userId1, userId2].sort().join('-');
  return `conversation_${bookId}_${userIds}`;
};

// Save a conversation to localStorage
export const saveConversation = (bookId: string, currentUserId: string, ownerId: string, messages: Message[]) => {
  if (typeof window === 'undefined') return; // Don't run on server

  const key = getConversationKey(bookId, currentUserId, ownerId);
  const conversation: Conversation = {
    bookId,
    messages,
    lastUpdated: new Date()
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(conversation));
  } catch (error) {
    console.error('Error saving conversation to localStorage:', error);
  }
};

// Get a conversation from localStorage
export const getConversation = (bookId: string, currentUserId: string, ownerId: string): Message[] => {
  if (typeof window === 'undefined') return []; // Don't run on server

  const key = getConversationKey(bookId, currentUserId, ownerId);
  
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const conversation: Conversation = JSON.parse(data);
    
    // Convert string dates back to Date objects
    return conversation.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error retrieving conversation from localStorage:', error);
    return [];
  }
};

// Get all conversations for a user
export const getUserConversations = (userId: string): Conversation[] => {
  if (typeof window === 'undefined') return []; // Don't run on server

  try {
    const conversations: Conversation[] = [];
    
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith('conversation_')) {
        const data = localStorage.getItem(key);
        if (data) {
          const conversation: Conversation = JSON.parse(data);
          
          // Check if the conversation involves this user
          const [_, bookId, userIds] = key.split('_');
          const users = userIds.split('-');
          
          if (users.includes(userId)) {
            // Convert string dates back to Date objects
            conversations.push({
              ...conversation,
              lastUpdated: new Date(conversation.lastUpdated),
              messages: conversation.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            });
          }
        }
      }
    }
    
    // Sort by last updated (newest first)
    return conversations.sort((a, b) => 
      b.lastUpdated.getTime() - a.lastUpdated.getTime()
    );
  } catch (error) {
    console.error('Error retrieving user conversations from localStorage:', error);
    return [];
  }
};

// Add a message to a conversation
export const addMessage = (
  bookId: string, 
  currentUserId: string, 
  ownerId: string, 
  text: string, 
  senderName: string
): Message => {
  const messages = getConversation(bookId, currentUserId, ownerId);
  
  const newMessage: Message = {
    id: Date.now().toString(),
    sender: currentUserId,
    text,
    timestamp: new Date(),
    senderName
  };
  
  const updatedMessages = [...messages, newMessage];
  saveConversation(bookId, currentUserId, ownerId, updatedMessages);
  
  // Trigger real-time update
  notifyMessageListeners(bookId, newMessage);
  
  return newMessage;
};

// Generate an initial welcome message for a new conversation
export const createInitialMessage = (ownerId: string, ownerName: string, bookTitle: string): Message => {
  return {
    id: '1',
    sender: ownerId,
    text: `Hello! I'm ${ownerName}, the owner of "${bookTitle}". Feel free to ask any questions about this book.`,
    timestamp: new Date(),
    senderName: ownerName
  };
}; 