'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, getConversation, saveConversation, createInitialMessage, addMessage, subscribeToMessages } from '@/utils/messageStorage';

interface BookUser {
  _id: string;
  name: string;
  email: string;
}

interface Book {
  _id: string;
  title: string;
  subject: string;
  condition: string;
  exchangeType: string;
  image: string;
  contactInfo: string;
  user: BookUser;
}

interface ChatModalProps {
  book: Book;
  onClose: () => void;
  currentUserId: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ book, onClose, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserName, setCurrentUserName] = useState('You');
  
  // Load conversation messages from storage
  useEffect(() => {
    const loadConversation = () => {
      // Get existing conversation or create a new one
      let conversation = getConversation(book._id, currentUserId, book.user._id);
      
      // If no conversation exists, create one with an initial message
      if (conversation.length === 0) {
        const initialMessage = createInitialMessage(book.user._id, book.user.name, book.title);
        conversation = [initialMessage];
        saveConversation(book._id, currentUserId, book.user._id, conversation);
      }
      
      setMessages(conversation);
    };
    
    loadConversation();
    
    // Try to get the current user's name from sessionStorage for better UX
    const userName = sessionStorage.getItem('userName');
    if (userName) {
      setCurrentUserName(userName);
    }
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToMessages((bookId, newMessage) => {
      // Only update if the message is for the current conversation
      if (bookId === book._id && newMessage.sender !== currentUserId) {
        setMessages(prev => [...prev, newMessage]);
      }
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [book, currentUserId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    
    try {
      // Add the message to the conversation
      const message = addMessage(
        book._id,
        currentUserId,
        book.user._id,
        newMessage.trim(),
        currentUserName
      );
      
      // Update the UI
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={book.image} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{book.title}</h3>
              <p className="text-sm text-gray-500">Chat with {book.user.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender === currentUserId;
              
              return (
                <div 
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-medium ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.senderName}
                      </span>
                    </div>
                    <p>{message.text}</p>
                    <div className="text-right">
                      <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Book details */}
        <div className="p-3 bg-gray-100 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Contact:</span> 
            <span>{book.contactInfo}</span>
          </div>
        </div>
        
        {/* Input */}
        <div className="p-3 border-t flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal; 