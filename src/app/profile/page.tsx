'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getUserConversations, Conversation } from '@/utils/messageStorage';
import ChatModal from '@/components/ChatModal';

interface Book {
  _id: string;
  title: string;
  subject: string;
  condition: string;
  exchangeType: string;
  image: string;
  contactInfo: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch user's books and conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session) return;
        
        setIsLoading(true);
        
        // Fetch all books for conversation matching
        const resAllBooks = await fetch('/api/books');
        if (!resAllBooks.ok) {
          throw new Error('Failed to fetch books');
        }
        const allBooksData = await resAllBooks.json();
        setAllBooks(allBooksData);
        
        // Filter books by user
        const userBooks = allBooksData.filter(
          (book: Book) => book.user._id === session.user.id
        );
        setBooks(userBooks);
        
        // Get user conversations
        if (typeof window !== 'undefined') {
          const userConversations = getUserConversations(session.user.id);
          setConversations(userConversations);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [session]);

  const handleOpenChat = (bookId: string) => {
    const book = allBooks.find(b => b._id === bookId);
    if (book) {
      setSelectedBook(book);
      setShowChatModal(true);
    }
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedBook(null);
  };

  // Get book title from id (for conversations)
  const getBookTitle = (bookId: string) => {
    const book = allBooks.find(b => b._id === bookId);
    return book ? book.title : 'Unknown book';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="loader rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">My Profile</h1>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Name:</span> {session.user.name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {session.user.email}
          </p>
        </div>
        
        <Link 
          href="/books/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
        >
          Add New Book
        </Link>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">My Books</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="text-xl text-gray-600 mb-4">You haven't posted any books yet</h3>
            <Link 
              href="/books/add"
              className="text-blue-600 hover:underline"
            >
              Add your first book
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{book.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      book.exchangeType === 'Sell' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                      {book.exchangeType}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Subject:</span> {book.subject}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Condition:</span> {book.condition}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/books/edit/${book._id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/books/delete/${book._id}`}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Messages Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">My Messages</h2>
        
        {conversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="text-xl text-gray-600 mb-4">You don't have any message conversations yet</h3>
            <Link 
              href="/books"
              className="text-blue-600 hover:underline"
            >
              Browse books to start a conversation
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {conversations.map((conversation, index) => {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const bookTitle = getBookTitle(conversation.bookId);
                
                return (
                  <li key={index} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenChat(conversation.bookId)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{bookTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{lastMessage.senderName}:</span> {lastMessage.text.length > 50 ? `${lastMessage.text.substring(0, 50)}...` : lastMessage.text}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      
      {/* Chat Modal */}
      {showChatModal && selectedBook && (
        <ChatModal 
          book={selectedBook} 
          onClose={closeChatModal} 
          currentUserId={session.user.id} 
        />
      )}
    </div>
  );
} 